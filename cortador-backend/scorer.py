from typing import List, Dict
import re

# ── Keywords iGaming PT-BR ────────────────────────────────────────────────────

HOOK_KEYWORDS = [
    "olha", "olha só", "olha isso", "vou mostrar", "segredo", "descubra",
    "nunca vi", "impossível", "inacreditável", "não acredito", "espera",
    "atenção", "vai acontecer", "presta atenção", "assiste",
    "perae", "para", "corre", "urgente", "sério", "cara",
    "mano", "gente", "pessoal", "todo mundo", "alguém",
]

EMOTIONAL_KEYWORDS = [
    "ganhei", "ganhamos", "ganhou", "ganhando",
    "lucro", "lucrei", "lucrando",
    "saque", "saquei", "sacando",
    "prêmio", "bônus", "bonus",
    "jackpot", "mega", "super", "ultra",
    "ganho", "vitória", "venceu", "vencendo",
    "dinheiro", "real", "reais", "mil", "cento",
    "pagou", "pagando", "caiu", "bateu",
    "free bet", "rodada grátis", "giro", "giros",
    "multiplicador", "multiplicou", "acumulou",
    "fortune tiger", "fortune ox", "fortune mouse",
    "crash", "aviator", "mines", "slots",
    "caiu tudo", "explodiu", "bombou",
]

TENSION_KEYWORDS = [
    "vai", "pode", "talvez", "torço", "torçam",
    "reza", "boa sorte", "preciso", "última chance",
    "aposta", "apostei", "apostando", "risco",
    "dobrei", "dobrando", "all in",
    "coração", "nervoso", "tenso", "ansioso",
    "meu deus", "cara que", "nossa",
]

VALUE_KEYWORDS = [
    "dica", "estratégia", "como", "truque", "método", "funciona",
    "verdade", "importante", "cuidado", "aprenda", "ensino",
    "passo a passo", "técnica", "modo", "segredo",
    "erro", "não faz", "nunca faça", "sempre", "jamais",
]

CTA_KEYWORDS = [
    "acessa", "clica", "link", "cadastro", "cadastre", "entra",
    "vem", "aproveita", "não perde", "último dia", "hoje",
    "bônus de boas-vindas", "primeiro depósito", "link na bio",
]

TREND_KEYWORDS = [
    "viral", "trend", "todo mundo", "tá bombando",
    "missão", "torneio", "campeonato", "ao vivo", "live",
    "novo", "lançamento", "exclusivo", "novo jogo",
    "semana", "hoje", "agora", "acabou de",
]

EXCLAMATION_PATTERNS = [
    r"[A-ZÁÉÍÓÚÃÕÇÊ]{3,}",  # uppercase iGaming shouting
    r"!{2,}",               # multiple exclamation marks
    r"\?!",                 # excited questions
]


# ── Funções de scoring individuais ────────────────────────────────────────────

def score_hook(text: str, first_segment: bool = True) -> int:
    """Hook iGaming — 0 a 35 pontos. Peso 35%."""
    text_lower = text.lower()
    score = 0

    for kw in HOOK_KEYWORDS:
        if kw in text_lower:
            score += 10

    if "?" in text:
        score += 12

    # Frases curtas são melhores hooks
    word_count = len(text.split())
    if word_count <= 8:
        score += 10
    elif word_count <= 15:
        score += 5

    # Bônus se é o primeiro segmento (abertura forte)
    if first_segment:
        score += 5

    return min(score, 35)


def score_emotion(text: str) -> int:
    """Emoção/reação iGaming — 0 a 30 pontos. Peso 30%."""
    text_lower = text.lower()
    score = 0

    for kw in EMOTIONAL_KEYWORDS:
        if kw in text_lower:
            score += 10

    # Detecta excitação por uppercase e exclamações
    for pattern in EXCLAMATION_PATTERNS:
        matches = re.findall(pattern, text)
        score += len(matches) * 5

    return min(score, 30)


def score_tension(text: str) -> int:
    """Tensão / momento antes do resultado — 0 a 20 pontos. Peso 20%."""
    text_lower = text.lower()
    score = 0

    for kw in TENSION_KEYWORDS:
        if kw in text_lower:
            score += 8

    for kw in VALUE_KEYWORDS:
        if kw in text_lower:
            score += 5

    return min(score, 20)


def score_trend(text: str) -> int:
    """Trend e CTA — 0 a 15 pontos. Peso 15%."""
    text_lower = text.lower()
    score = 0

    for kw in TREND_KEYWORDS:
        if kw in text_lower:
            score += 5

    for kw in CTA_KEYWORDS:
        if kw in text_lower:
            score += 4

    return min(score, 15)


def score_flow(duration: float, word_count: int) -> int:
    """Flow / ritmo — 0 a 10 pontos bônus."""
    score = 0

    # Duração ideal para Reels/TikTok
    if 25 <= duration <= 55:
        score += 6
    elif 15 <= duration <= 75:
        score += 3

    # Densidade de palavras (palavras/segundo)
    if duration > 0:
        wps = word_count / duration
        if 2.0 <= wps <= 4.0:  # ritmo natural de fala
            score += 4
        elif 1.5 <= wps <= 5.0:
            score += 2

    return min(score, 10)


def build_reason(hook: int, emotion: int, tension: int) -> str:
    reasons = []
    if hook >= 20:
        reasons.append("Hook forte")
    if emotion >= 20:
        reasons.append("Pico emocional / ganho")
    elif emotion >= 10:
        reasons.append("Reação de iGaming")
    if tension >= 12:
        reasons.append("Momento de tensão")
    if not reasons:
        reasons.append("Potencial de engajamento")
    return " + ".join(reasons)


def detect_moment_type(text: str) -> str:
    """Classifica o tipo de momento para uso no frontend."""
    text_lower = text.lower()

    if any(kw in text_lower for kw in ["ganhei", "jackpot", "prêmio", "bateu", "caiu", "explodiu", "multiplicou"]):
        return "ganho"
    if any(kw in text_lower for kw in ["vai", "aposta", "apostei", "all in", "coração", "nervoso", "reza"]):
        return "tensao"
    if any(kw in text_lower for kw in ["dica", "estratégia", "como", "truque", "método", "ensino"]):
        return "educativo"
    if any(kw in text_lower for kw in ["olha", "olha só", "assiste", "presta atenção"]):
        return "hook"
    return "geral"


# ── Candidatos de clipe ────────────────────────────────────────────────────────

def create_clip_candidates(segments: List[Dict], target_durations=[30, 45, 60]) -> List[Dict]:
    candidates = []

    for i, seg in enumerate(segments):
        for target in target_durations:
            clip_segments = [seg]
            total_duration = seg["end"] - seg["start"]
            j = i + 1

            while j < len(segments) and total_duration < target:
                clip_segments.append(segments[j])
                total_duration = segments[j]["end"] - seg["start"]
                j += 1

            if total_duration < 12:
                continue

            full_text = " ".join(s["text"] for s in clip_segments)
            word_count = len(full_text.split())
            is_first = i == 0

            h = score_hook(seg["text"], first_segment=is_first)
            e = score_emotion(full_text)
            t = score_tension(full_text)
            tr = score_trend(full_text)
            fl = score_flow(total_duration, word_count)

            total_score = min(h + e + t + tr + fl, 99)

            # Hook natural: primeira frase do segmento se for forte
            natural_hook = None
            first_sentence = seg["text"].strip().split(".")[0]
            if len(first_sentence) > 10 and (
                "?" in first_sentence or
                any(kw in first_sentence.lower() for kw in HOOK_KEYWORDS) or
                any(kw in first_sentence.lower() for kw in EMOTIONAL_KEYWORDS)
            ):
                natural_hook = first_sentence

            candidates.append({
                "start": round(seg["start"], 2),
                "end": round(clip_segments[-1]["end"], 2),
                "duration": round(total_duration, 2),
                "text": full_text,
                "score": total_score,
                "hook_score": h,
                "emotion_score": e,
                "tension_score": t,
                "trend_score": tr,
                "flow_score": fl,
                "moment_type": detect_moment_type(full_text),
                "natural_hook": natural_hook,
                "reason": build_reason(h, e, t),
            })

    # Deduplica por timestamp, mantém melhor score por janela de 15s
    seen: dict = {}
    for c in sorted(candidates, key=lambda x: x["score"], reverse=True):
        bucket = int(c["start"] // 15) * 15
        if bucket not in seen and c["score"] >= 30:
            seen[bucket] = True
            yield_candidate = c
            yield_candidate["score"] = c["score"]  # já é 0-99

    deduped = []
    seen_buckets: set = set()
    for c in sorted(candidates, key=lambda x: x["score"], reverse=True):
        bucket = int(c["start"] // 15) * 15
        if bucket not in seen_buckets and c["score"] >= 30:
            seen_buckets.add(bucket)
            deduped.append(c)

    return deduped[:20]


def score_moments(segments: List[Dict]) -> List[Dict]:
    return create_clip_candidates(segments)
