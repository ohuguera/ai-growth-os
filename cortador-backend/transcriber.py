from faster_whisper import WhisperModel

_model = None
_model_name = None

# Prompt de domínio para guiar o reconhecimento de vocabulário iGaming
IGAMING_PROMPT = (
    "Live de cassino online. Termos: Fortune Tiger, Fortune Ox, Aviator, Mines, Slots, "
    "bônus, free bet, jackpot, multiplicador, rodadas grátis, saque, depósito, "
    "BINGOBET, reais, giro, all in, crash, scatter, wild, pragmatic."
)


def get_model():
    global _model, _model_name
    if _model is None:
        for model_name in ["large-v3", "medium", "base"]:
            try:
                print(f"[Whisper] Carregando modelo {model_name}...")
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
    print(f"[Whisper] Transcrevendo: {video_path} (modelo: {_model_name})")

    import subprocess, json
    duration = None
    try:
        probe = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", video_path],
            capture_output=True, text=True
        )
        duration = float(json.loads(probe.stdout)["format"]["duration"])
        print(f"[Whisper] Duração do vídeo: {duration:.1f}s")
    except Exception:
        duration = None

    # Parâmetros otimizados para máxima precisão em PT-BR iGaming:
    # - beam_size=5: mais candidatos → melhor precisão
    # - vad_filter=True: remove silêncio/ruído antes de processar
    # - initial_prompt: vocabulário de domínio iGaming para guiar o reconhecimento
    # - word_timestamps=True: timestamps por palavra (necessário para legendas karaokê)
    # - temperature=0: determinístico, sem aleatório
    raw_segments, info = model.transcribe(
        video_path,
        language="pt",
        beam_size=5,
        word_timestamps=True,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 300},
        initial_prompt=IGAMING_PROMPT,
        temperature=0,
    )

    segments = []
    for i, seg in enumerate(raw_segments):
        avg_logprob = getattr(seg, "avg_logprob", 0.0)
        no_speech_prob = getattr(seg, "no_speech_prob", 0.0)

        # Filtra segmentos com baixa confiança (provável ruído ou silêncio)
        if no_speech_prob > 0.6:
            continue

        segments.append({
            "id": i,
            "start": round(seg.start, 2),
            "end": round(seg.end, 2),
            "text": seg.text.strip(),
            "confidence": round(1.0 + avg_logprob, 3),  # avg_logprob é negativo; 0 = perfeito
            "words": [
                {
                    "word": w.word,
                    "start": round(w.start, 2),
                    "end": round(w.end, 2),
                    "probability": round(getattr(w, "probability", 1.0), 3),
                }
                for w in (seg.words or [])
            ]
        })

        if progress_cb and i % 5 == 0:
            if duration and duration > 0:
                pct = min(95, int((seg.end / duration) * 100))
            else:
                pct = min(95, i)
            progress_cb(pct)

    if progress_cb:
        progress_cb(100)

    print(f"[Whisper] {len(segments)} segmentos transcritos (lang={info.language}, prob={info.language_probability:.2f})")
    return segments
