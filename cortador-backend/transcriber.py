from faster_whisper import WhisperModel

_model = None

def get_model():
    global _model
    if _model is None:
        print("[Whisper] Carregando modelo base...")
        _model = WhisperModel("base", device="cpu", compute_type="int8")
        print("[Whisper] Modelo carregado.")
    return _model

def transcribe_video(video_path: str) -> list:
    model = get_model()
    print(f"[Whisper] Transcrevendo: {video_path}")
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

    print(f"[Whisper] {len(segments)} segmentos transcritos.")
    return segments
