from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uuid, os, json, shutil
from transcriber import transcribe_video
from scorer import score_moments
from processor import process_clip

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
        segments = transcribe_video(video_path)
        moments = score_moments(segments)
        job["status"] = "ready"
        job["segments"] = segments
        job["moments"] = moments
    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)
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
        req.watermark
    )
    return {"job_id": req.job_id, "status": "processing"}


def _run_processing(job_id, video_path, moments, hook, cta, caption_position, watermark):
    job = load_job(job_id)
    clips = []

    for i, moment in enumerate(moments):
        clip_id = f"{job_id}_clip_{i + 1}"
        output_path = f"{OUTPUT_DIR}/{clip_id}.mp4"

        # Usa hook natural se o usuário optou por isso
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
                segments=job.get("segments", [])
            )
            clips.append({
                "id": clip_id,
                "path": output_path,
                "start": moment["start"],
                "end": moment["end"],
                "score": moment.get("score", 0),
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
