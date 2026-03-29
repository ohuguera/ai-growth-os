import whisper

_model = None

def get_model():
    global _model
    if _model is None:
        print("[Whisper] Carregando modelo base...")
        _model = whisper.load_model("base")
        print("[Whisper] Modelo carregado.")
    return _model

def transcribe_video(video_path: str) -> list:
    model = get_model()
    print(f"[Whisper] Transcrevendo: {video_path}")
    result = model.transcribe(video_path, language="pt", word_timestamps=True)

    segments = []
    for seg in result["segments"]:
        segments.append({
            "id": seg["id"],
            "start": round(seg["start"], 2),
            "end": round(seg["end"], 2),
            "text": seg["text"].strip(),
            "words": [
                {
                    "word": w["word"],
                    "start": round(w["start"], 2),
                    "end": round(w["end"], 2)
                }
                for w in seg.get("words", [])
            ]
        })

    print(f"[Whisper] {len(segments)} segmentos transcritos.")
    return segments
