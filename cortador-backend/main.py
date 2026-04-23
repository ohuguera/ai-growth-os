from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse, Response
from contextlib import asynccontextmanager
from pydantic import BaseModel
import uuid, os, json, shutil
import threading
from concurrent.futures import ThreadPoolExecutor
from transcriber import transcribe_video
from scorer import score_moments, analyze_with_ai
from processor import process_clip
import r2_storage

CHUNK_DIR = "chunks"
os.makedirs(CHUNK_DIR, exist_ok=True)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
JOBS_DIR = "jobs"

for d in [UPLOAD_DIR, OUTPUT_DIR, JOBS_DIR]:
    os.makedirs(d, exist_ok=True)


def _reset_stuck_jobs():
    """
    No startup: jobs presos em 'transcribing' ou 'processing' são automaticamente
    reiniciados em background — sem precisar de intervenção manual do usuário.
    """
    if not os.path.exists(JOBS_DIR):
        return
    for fname in os.listdir(JOBS_DIR):
        if not fname.endswith(".json"):
            continue
        try:
            path = f"{JOBS_DIR}/{fname}"
            with open(path, encoding="utf-8") as f:
                job = json.load(f)
            status = job.get("status")
            job_id = job.get("id", fname.replace(".json", ""))

            if status == "transcribing":
                video_path = job.get("video_path", "")
                # Restaura vídeo do R2 se necessário
                if not os.path.exists(video_path) and job.get("r2_key") and r2_storage.is_available():
                    try:
                        r2_storage.download(job["r2_key"], video_path)
                        print(f"[Startup] Vídeo {job_id} restaurado do R2")
                    except Exception as e:
                        print(f"[Startup] Falha ao restaurar vídeo {job_id} do R2: {e}")
                        video_path = ""

                if video_path and os.path.exists(video_path):
                    print(f"[Startup] Job {job_id} retomando transcrição automaticamente...")
                    job["transcription_progress"] = 0
                    job.pop("error", None)
                    with open(path, "w", encoding="utf-8") as f:
                        json.dump(job, f, ensure_ascii=False, indent=2)
                    threading.Thread(
                        target=_run_transcription,
                        args=(job_id, video_path),
                        daemon=True
                    ).start()
                else:
                    print(f"[Startup] Job {job_id} sem vídeo disponível → error")
                    job["status"] = "error"
                    job["error"] = "video_not_found_after_restart"
                    with open(path, "w", encoding="utf-8") as f:
                        json.dump(job, f, ensure_ascii=False, indent=2)

            elif status == "processing":
                # Processing não é retomável (FFmpeg não tem checkpoint) — marca error
                print(f"[Startup] Job {job_id} estava em processing → error (reprocesse manualmente)")
                job["status"] = "error"
                job["error"] = "server_restart"
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(job, f, ensure_ascii=False, indent=2)

        except Exception as e:
            print(f"[Startup] Erro ao checar job {fname}: {e}")


@asynccontextmanager
async def lifespan(app):
    _reset_stuck_jobs()
    yield


app = FastAPI(title="Cortador de Lives — BINGOBET", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────
# Helpers de job
# ──────────────────────────────────────────

def save_job(job_id: str, data: dict):
    path = f"{JOBS_DIR}/{job_id}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    # Backup no R2 em background — não bloqueia
    if r2_storage.is_available():
        threading.Thread(
            target=_backup_job_r2,
            args=(job_id, path),
            daemon=True
        ).start()


def _backup_job_r2(job_id: str, local_path: str):
    """Backup do job JSON no R2 (thread daemon)."""
    try:
        r2_storage.upload(local_path, f"jobs/{job_id}.json")
    except Exception as e:
        print(f"[R2] Job backup falhou (não-fatal): {e}")


def load_job(job_id: str):
    path = f"{JOBS_DIR}/{job_id}.json"
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    # Fallback: restaura do R2 se disponível (após restart do Railway)
    if r2_storage.is_available():
        try:
            r2_storage.download(f"jobs/{job_id}.json", path)
            print(f"[R2] Job {job_id} restaurado do R2")
            with open(path, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None


# ──────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "Cortador de Lives BINGOBET"}


# ──────────────────────────────────────────
# Chunked Upload (para vídeos grandes)
# ──────────────────────────────────────────

class InitUploadRequest(BaseModel):
    filename: str
    total_chunks: int


@app.post("/upload/init")
def upload_init(req: InitUploadRequest):
    """Inicializa um job de upload chunked."""
    job_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(req.filename)[1] or ".mp4"
    chunk_folder = f"{CHUNK_DIR}/{job_id}"
    os.makedirs(chunk_folder, exist_ok=True)

    save_job(job_id, {
        "id": job_id,
        "status": "uploading",
        "filename": req.filename,
        "ext": ext,
        "total_chunks": req.total_chunks,
        "received_chunks": 0,
        "video_path": "",
        "segments": [],
        "moments": [],
        "clips": []
    })

    return {"job_id": job_id, "total_chunks": req.total_chunks}


@app.post("/upload/chunk")
async def upload_chunk(
    job_id: str = Form(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    file: UploadFile = File(...)
):
    """Recebe um chunk e salva em disco."""
    job = load_job(job_id)
    if not job:
        return {"error": "Job não encontrado"}

    chunk_path = f"{CHUNK_DIR}/{job_id}/chunk_{chunk_index:05d}"
    with open(chunk_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    job["received_chunks"] = job.get("received_chunks", 0) + 1
    save_job(job_id, job)

    return {
        "job_id": job_id,
        "chunk_index": chunk_index,
        "received": job["received_chunks"],
        "total": total_chunks
    }


@app.post("/upload/finalize")
def upload_finalize(body: dict):
    """Concatena todos os chunks no arquivo final."""
    job_id = body.get("job_id")
    job = load_job(job_id)
    if not job:
        return {"error": "Job não encontrado"}

    ext = job.get("ext", ".mp4")
    video_path = f"{UPLOAD_DIR}/{job_id}{ext}"
    chunk_folder = f"{CHUNK_DIR}/{job_id}"

    chunk_files = sorted(
        [f for f in os.listdir(chunk_folder) if f.startswith("chunk_")],
        key=lambda x: int(x.split("_")[1])
    )

    with open(video_path, "wb") as out:
        for chunk_file in chunk_files:
            with open(f"{chunk_folder}/{chunk_file}", "rb") as cf:
                shutil.copyfileobj(cf, out)

    shutil.rmtree(chunk_folder)

    r2_key = None
    if r2_storage.is_available():
        try:
            r2_key = r2_storage.upload(video_path, f"uploads/{job_id}{ext}")
        except Exception as e:
            print(f"[R2] Upload falhou (não-fatal): {e}")

    job["status"] = "uploaded"
    job["video_path"] = video_path
    job["r2_key"] = r2_key
    save_job(job_id, job)

    return {"job_id": job_id, "status": "uploaded", "filename": job["filename"]}


# ──────────────────────────────────────────
# Upload simples (compatibilidade legada)
# ──────────────────────────────────────────

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """Recebe o arquivo da live e cria um job."""
    job_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(file.filename)[1] or ".mp4"
    video_path = f"{UPLOAD_DIR}/{job_id}{ext}"

    with open(video_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    r2_key = None
    if r2_storage.is_available():
        try:
            r2_key = r2_storage.upload(video_path, f"uploads/{job_id}{ext}")
        except Exception as e:
            print(f"[R2] Upload falhou (não-fatal): {e}")

    save_job(job_id, {
        "id": job_id,
        "status": "uploaded",
        "video_path": video_path,
        "r2_key": r2_key,
        "filename": file.filename,
        "segments": [],
        "moments": [],
        "clips": []
    })

    return {"job_id": job_id, "status": "uploaded", "filename": file.filename}


@app.post("/transcribe/{job_id}")
async def transcribe(job_id: str, background_tasks: BackgroundTasks):
    """Inicia transcrição e análise de momentos em background."""
    job = load_job(job_id)
    if not job:
        return {"error": "Job não encontrado"}

    job["status"] = "transcribing"
    job.pop("error", None)
    job["transcription_progress"] = 0
    save_job(job_id, job)

    background_tasks.add_task(_run_transcription, job_id, job["video_path"])
    return {"job_id": job_id, "status": "transcribing"}


@app.post("/retry/{job_id}")
async def retry_transcription(job_id: str, background_tasks: BackgroundTasks):
    """Retranscreve um job que falhou ou ficou preso — sem precisar reuplodar."""
    job = load_job(job_id)
    if not job:
        return {"error": "Job não encontrado"}

    video_path = job.get("video_path", "")
    # Se o arquivo sumiu do disco, tenta restaurar do R2
    if not os.path.exists(video_path) and job.get("r2_key") and r2_storage.is_available():
        try:
            r2_storage.download(job["r2_key"], video_path)
            print(f"[Retry] Arquivo restaurado do R2: {video_path}")
        except Exception as e:
            return {"error": f"Arquivo não encontrado localmente nem no R2: {e}"}

    if not os.path.exists(video_path):
        return {"error": "Arquivo de vídeo não encontrado. Faça o upload novamente."}

    job["status"] = "transcribing"
    job.pop("error", None)
    job["transcription_progress"] = 0
    job["segments"] = []
    job["moments"] = []
    save_job(job_id, job)

    background_tasks.add_task(_run_transcription, job_id, video_path)
    return {"job_id": job_id, "status": "transcribing", "message": "Retranscrição iniciada"}


def _run_transcription(job_id: str, video_path: str):
    job = load_job(job_id)
    # Se arquivo local sumiu (Railway reiniciou) e R2 disponível, restaura
    if not os.path.exists(video_path) and job.get("r2_key") and r2_storage.is_available():
        print(f"[R2] Restaurando vídeo do R2: {job['r2_key']}")
        r2_storage.download(job["r2_key"], video_path)
    try:
        # Progresso de transcricao
        def on_progress(pct):
            j = load_job(job_id)
            if j:
                j["transcription_progress"] = pct
                save_job(job_id, j)

        segments = transcribe_video(video_path, progress_cb=on_progress)

        # Scoring por keywords (rapido)
        moments_kw = score_moments(segments)

        # Analise IA (Claude) se disponivel
        ai_moments = analyze_with_ai(segments)

        # Merge: preferir momentos IA, complementar com keywords
        if ai_moments:
            # Converte momentos IA para formato padrao
            moments = []
            for m in ai_moments:
                moments.append({
                    "start": m["start"],
                    "end": m["end"],
                    "score": m["score"],
                    "text": m.get("reason", ""),
                    "natural_hook": m.get("natural_hook", ""),
                    "category": m.get("category", "desenvolvimento"),
                })
        else:
            moments = moments_kw

        job["status"] = "ready"
        job["segments"] = segments
        job["moments"] = moments
        job["transcription_progress"] = 100
    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)
        print(f"[Transcription Error] {e}")
    save_job(job_id, job)


@app.get("/status/{job_id}")
def get_status(job_id: str):
    """Retorna status e dados do job (momentos, clipes, etc)."""
    job = load_job(job_id)
    if not job:
        return {"error": "Job não encontrado"}
    return job


# ──────────────────────────────────────────
# Processamento dos clipes aprovados
# ──────────────────────────────────────────

class MomentInput(BaseModel):
    start: float
    end: float
    score: int = 0
    use_natural_hook: bool = False
    natural_hook: str = ""


class ProcessRequest(BaseModel):
    job_id: str
    approved_moments: list[MomentInput]
    hook: str = ""
    cta: str = ""
    caption_position: str = "middle"  # top | middle | bottom
    watermark: bool = True
    use_cta_video: bool = True
    caption_style: str = "karaoke"  # karaoke | bounce | slide_up | block


class AutoProcessRequest(BaseModel):
    hook: str = ""
    cta: str = ""
    watermark: bool = True
    caption_style: str = "bounce"  # padrão viral
    use_cta_video: bool = True
    max_clips: int = 20  # máximo de clipes a gerar automaticamente


@app.post("/process")
async def process(req: ProcessRequest, background_tasks: BackgroundTasks):
    """Processa os momentos aprovados pelo usuário."""
    job = load_job(req.job_id)
    if not job:
        return {"error": "Job não encontrado"}

    job["status"] = "processing"
    job["clips"] = []
    save_job(req.job_id, job)

    background_tasks.add_task(
        _run_processing,
        req.job_id,
        job["video_path"],
        [m.model_dump() for m in req.approved_moments],
        req.hook,
        req.cta,
        req.caption_position,
        req.watermark,
        job.get("cta_video_path") if req.use_cta_video else None,
        req.caption_style,
    )
    return {"job_id": req.job_id, "status": "processing"}


@app.post("/auto-process/{job_id}")
async def auto_process(job_id: str, req: AutoProcessRequest, background_tasks: BackgroundTasks):
    """
    Processa AUTOMATICAMENTE todos os momentos detectados pela IA.
    Sem necessidade de aprovação manual — gera todos os clipes em lote.
    """
    job = load_job(job_id)
    if not job:
        return {"error": "Job não encontrado"}

    moments = job.get("moments", [])
    if not moments:
        return {"error": "Nenhum momento detectado. Execute /transcribe/{job_id} primeiro."}

    # Ordena por score e pega os melhores
    top_moments = sorted(moments, key=lambda m: m.get("score", 0), reverse=True)[:req.max_clips]

    job["status"] = "processing"
    job["clips"] = []
    save_job(job_id, job)

    background_tasks.add_task(
        _run_processing,
        job_id,
        job["video_path"],
        top_moments,
        req.hook,
        req.cta,
        "middle",
        req.watermark,
        job.get("cta_video_path") if req.use_cta_video else None,
        req.caption_style,
    )

    return {
        "job_id": job_id,
        "status": "processing",
        "clips_queued": len(top_moments),
        "caption_style": req.caption_style,
    }


def _run_processing(job_id, video_path, moments, hook, cta, caption_position, watermark, cta_video_path=None, caption_style="karaoke"):
    job = load_job(job_id)

    if not os.path.exists(video_path) and job.get("r2_key") and r2_storage.is_available():
        print(f"[R2] Restaurando vídeo para processamento: {job['r2_key']}")
        r2_storage.download(job["r2_key"], video_path)

    clips_lock = threading.Lock()
    clips = []
    segments = job.get("segments", [])
    total = len(moments)

    # Informa o frontend quantos clipes serão gerados
    job["clips_total"] = total
    job["clips_done"] = 0
    save_job(job_id, job)

    def process_one(args):
        i, moment = args
        clip_id = f"{job_id}_clip_{i + 1}"
        output_path = f"{OUTPUT_DIR}/{clip_id}.mp4"

        effective_hook = (
            moment.get("natural_hook", "") if moment.get("use_natural_hook")
            else (moment.get("natural_hook") or hook)
        )
        effective_cta = cta or moment.get("cta_suggestion", "")

        try:
            process_clip(
                video_path=video_path,
                output_path=output_path,
                start=moment["start"],
                end=moment["end"],
                hook=effective_hook,
                cta=effective_cta,
                caption_position=caption_position,
                watermark=watermark,
                segments=segments,
                cta_video_path=cta_video_path,
                caption_style=caption_style,
            )

            clip_r2_key = None
            if r2_storage.is_available():
                try:
                    clip_r2_key = r2_storage.upload(output_path, f"clips/{clip_id}.mp4")
                except Exception as e:
                    print(f"[R2] Upload clip falhou (não-fatal): {e}")

            result = {
                "id": clip_id,
                "path": output_path,
                "r2_key": clip_r2_key,
                "start": moment["start"],
                "end": moment["end"],
                "score": moment.get("score", 0),
                "category": moment.get("category", "geral"),
                "caption_style": caption_style,
                "hook_used": effective_hook,
                "status": "done"
            }
        except Exception as e:
            result = {"id": clip_id, "error": str(e), "status": "error"}
            print(f"[Processing] Clip {clip_id} erro: {e}")

        with clips_lock:
            clips.append(result)
            done = len([c for c in clips if c["status"] == "done"])
            j = load_job(job_id)
            if j:
                j["clips"] = sorted(clips, key=lambda c: c.get("id", ""))
                j["clips_done"] = done
                j["clips_total"] = total
                save_job(job_id, j)

        return result

    # 2 FFmpeg em paralelo — ótimo para 2 vCPU do Railway
    max_workers = min(2, total)
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        list(executor.map(process_one, enumerate(moments)))

    job = load_job(job_id)
    job["clips"] = sorted(clips, key=lambda c: c.get("id", ""))
    job["clips_done"] = len([c for c in clips if c["status"] == "done"])
    job["clips_total"] = total
    job["status"] = "done"
    save_job(job_id, job)


@app.post("/upload/cta-video/{job_id}")
async def upload_cta_video(job_id: str, file: UploadFile = File(...)):
    """Upload de video CTA para concatenar ao final dos clipes."""
    job = load_job(job_id)
    if not job:
        return {"error": "Job nao encontrado"}

    ext = os.path.splitext(file.filename)[1] or ".mp4"
    cta_path = f"{UPLOAD_DIR}/{job_id}_cta{ext}"

    with open(cta_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    r2_cta_key = None
    if r2_storage.is_available():
        try:
            r2_cta_key = r2_storage.upload(cta_path, f"uploads/{job_id}_cta{ext}")
        except Exception as e:
            print(f"[R2] Upload CTA falhou (não-fatal): {e}")

    job["cta_video_path"] = cta_path
    job["r2_cta_key"] = r2_cta_key
    save_job(job_id, job)

    return {"job_id": job_id, "cta_video_path": cta_path, "status": "cta_uploaded"}


@app.get("/export/premiere/{job_id}")
def export_premiere_xml(job_id: str):
    """
    Exporta todos os clipes do job como XML compatível com Adobe Premiere Pro (FCP XML).
    Permite importar diretamente no Premiere como uma sequência com todos os cortes.
    """
    job = load_job(job_id)
    if not job:
        return {"error": "Job não encontrado"}

    clips = [c for c in job.get("clips", []) if c.get("status") == "done"]
    if not clips:
        return {"error": "Nenhum clipe processado encontrado"}

    filename_safe = (job.get("filename", "live") or "live").replace(" ", "_").replace(".mp4", "").replace(".mov", "")[:40]

    # FCP XML compatible com Premiere Pro (Final Cut Pro XML v1)
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!DOCTYPE xmeml>',
        '<xmeml version="4">',
        f'  <sequence id="seq1">',
        f'    <name>{filename_safe} — HFIVE CORTES</name>',
        f'    <duration>{sum(int((c["end"] - c["start"]) * 30) for c in clips)}</duration>',
        '    <rate><timebase>30</timebase><ntsc>FALSE</ntsc></rate>',
        '    <media>',
        '      <video>',
        '        <format>',
        '          <samplecharacteristics>',
        '            <width>1080</width>',
        '            <height>1920</height>',
        '            <pixelaspectratio>square</pixelaspectratio>',
        '            <rate><timebase>30</timebase><ntsc>FALSE</ntsc></rate>',
        '          </samplecharacteristics>',
        '        </format>',
        '        <track>',
    ]

    timeline_frame = 0
    for i, clip in enumerate(clips):
        clip_duration_s = clip["end"] - clip["start"]
        clip_duration_frames = int(clip_duration_s * 30)
        score = clip.get("score", 0)
        category = clip.get("category", "geral")
        clip_name = f"Corte {i+1} — score {score} — {category}"

        xml_lines += [
            f'          <clipitem id="clip{i+1}">',
            f'            <name>{clip_name}</name>',
            f'            <start>{timeline_frame}</start>',
            f'            <end>{timeline_frame + clip_duration_frames}</end>',
            f'            <in>0</in>',
            f'            <out>{clip_duration_frames}</out>',
            f'            <file id="file{i+1}">',
            f'              <name>{clip["id"]}.mp4</name>',
            f'              <pathurl>{clip["id"]}.mp4</pathurl>',
            f'              <rate><timebase>30</timebase><ntsc>FALSE</ntsc></rate>',
            f'              <duration>{clip_duration_frames}</duration>',
            '              <media>',
            '                <video>',
            '                  <samplecharacteristics>',
            '                    <width>1080</width>',
            '                    <height>1920</height>',
            '                    <rate><timebase>30</timebase><ntsc>FALSE</ntsc></rate>',
            '                  </samplecharacteristics>',
            '                </video>',
            '                <audio>',
            '                  <samplecharacteristics>',
            '                    <depth>16</depth>',
            '                    <samplerate>44100</samplerate>',
            '                  </samplecharacteristics>',
            '                </audio>',
            '              </media>',
            '            </file>',
            f'          </clipitem>',
        ]
        timeline_frame += clip_duration_frames

    xml_lines += [
        '        </track>',
        '      </video>',
        '    </media>',
        '  </sequence>',
        '</xmeml>',
    ]

    xml_content = "\n".join(xml_lines)
    return Response(
        content=xml_content,
        media_type="application/xml",
        headers={
            "Content-Disposition": f'attachment; filename="{filename_safe}_premiere.xml"'
        }
    )


@app.get("/download/{clip_id}")
def download_clip(clip_id: str):
    """Download de um clipe processado."""
    # clip_id formato: JOBID_clip_N
    parts = clip_id.rsplit("_clip_", 1)
    if len(parts) != 2:
        return {"error": "clip_id inválido"}

    job_id = parts[0]
    job = load_job(job_id)
    if not job:
        return {"error": "Job não encontrado"}

    for clip in job.get("clips", []):
        if clip["id"] == clip_id and clip["status"] == "done":
            # Preferir R2 (presigned URL) — não depende do filesystem efêmero do Railway
            if clip.get("r2_key") and r2_storage.is_available():
                url = r2_storage.presigned_url(clip["r2_key"])
                return RedirectResponse(url)
            # Fallback: servir do disco local
            if os.path.exists(clip.get("path", "")):
                return FileResponse(
                    clip["path"],
                    media_type="video/mp4",
                    filename=f"{clip_id}.mp4"
                )
            return {"error": "Arquivo do clipe não encontrado"}

    return {"error": "Clipe não encontrado ou ainda processando"}
