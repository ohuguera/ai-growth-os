from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uuid, os, json, shutil
from transcriber import transcribe_video
from scorer import score_moments, analyze_with_ai
from processor import process_clip

CHUNK_DIR = "chunks"
os.makedirs(CHUNK_DIR, exist_ok=True)

app = FastAPI(title="Cortador de Lives — BINGOBET")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
JOBS_DIR = "jobs"

for d in [UPLOAD_DIR, OUTPUT_DIR, JOBS_DIR]:
    os.makedirs(d, exist_ok=True)


# ──────────────────────────────────────────
# Helpers de job
# ──────────────────────────────────────────

def save_job(job_id: str, data: dict):
    with open(f"{JOBS_DIR}/{job_id}.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_job(job_id: str):
    path = f"{JOBS_DIR}/{job_id}.json"
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


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

    job["status"] = "uploaded"
    job["video_path"] = video_path
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

    save_job(job_id, {
        "id": job_id,
        "status": "uploaded",
        "video_path": video_path,
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
    save_job(job_id, job)

    background_tasks.add_task(_run_transcription, job_id, job["video_path"])
    return {"job_id": job_id, "status": "transcribing"}


def _run_transcription(job_id: str, video_path: str):
    job = load_job(job_id)
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
                    "natural_hook": m.get("hook_text", ""),
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
    )
    return {"job_id": req.job_id, "status": "processing"}


def _run_processing(job_id, video_path, moments, hook, cta, caption_position, watermark, cta_video_path=None):
    job = load_job(job_id)
    clips = []

    for i, moment in enumerate(moments):
        clip_id = f"{job_id}_clip_{i + 1}"
        output_path = f"{OUTPUT_DIR}/{clip_id}.mp4"

        # Usa hook natural se o usuario optou por isso
        effective_hook = moment.get("natural_hook", "") if moment.get("use_natural_hook") else hook

        try:
            process_clip(
                video_path=video_path,
                output_path=output_path,
                start=moment["start"],
                end=moment["end"],
                hook=effective_hook,
                cta=cta,
                caption_position=caption_position,
                watermark=watermark,
                segments=job.get("segments", []),
                cta_video_path=cta_video_path,
            )
            clips.append({
                "id": clip_id,
                "path": output_path,
                "start": moment["start"],
                "end": moment["end"],
                "score": moment.get("score", 0),
                "category": moment.get("category", "desenvolvimento"),
                "status": "done"
            })
        except Exception as e:
            clips.append({
                "id": clip_id,
                "error": str(e),
                "status": "error"
            })

    job["clips"] = clips
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

    job["cta_video_path"] = cta_path
    save_job(job_id, job)

    return {"job_id": job_id, "cta_video_path": cta_path, "status": "cta_uploaded"}


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
            if not os.path.exists(clip["path"]):
                return {"error": "Arquivo do clipe não encontrado no disco"}
            return FileResponse(
                clip["path"],
                media_type="video/mp4",
                filename=f"{clip_id}.mp4"
            )

    return {"error": "Clipe não encontrado ou ainda processando"}
