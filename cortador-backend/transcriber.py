from faster_whisper import WhisperModel

_model = None
_model_name = None


def get_model():
    global _model, _model_name
    if _model is None:
        for model_name in ["large-v3", "medium", "base"]:
            try:
                print(f"[Whisper] Tentando modelo {model_name}...")
                _model = WhisperModel(model_name, device="cpu", compute_type="int8")
                _model_name = model_name
                print(f"[Whisper] Modelo {model_name} carregado.")
                break
            except Exception as e:
                print(f"[Whisper] Falha {model_name}: {e}")
                _model = None
    return _model


def transcribe_video(video_path: str, progress_cb=None) -> list:
    model = get_model()
    print(f"[Whisper] Transcrevendo: {video_path}")

    # Estima duracao total via ffprobe para calcular progresso
    import subprocess, json
    duration = None
    try:
        probe = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", video_path],
            capture_output=True, text=True
        )
        duration = float(json.loads(probe.stdout)["format"]["duration"])
    except Exception:
        duration = None

    raw_segments, _ = model.transcribe(video_path, language="pt", word_timestamps=True)

    segments = []
    for i, seg in enumerate(raw_segments):
        segments.append({
            "id": i,
            "start": round(seg.start, 2),
            "end": round(seg.end, 2),
            "text": seg.text.strip(),
            "words": [
                {
                    "word": w.word,
                    "start": round(w.start, 2),
                    "end": round(w.end, 2)
                }
                for w in (seg.words or [])
            ]
        })
        # Progresso a cada 5 segmentos
        if progress_cb and i % 5 == 0:
            if duration and duration > 0:
                pct = min(95, int((seg.end / duration) * 100))
            else:
                pct = min(95, i)
            progress_cb(pct)

    if progress_cb:
        progress_cb(100)

    print(f"[Whisper] {len(segments)} segmentos transcritos.")
    return segments
