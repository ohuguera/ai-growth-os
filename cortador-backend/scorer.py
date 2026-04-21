from typing import List, Dict
import re
import os
import json as _json

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

EXCLAMATION_PATTERNS = [
    r"[A-ZÁÉÍÓÚÃÕÇÊ]{3,}",
    r"!{2,}",
    r"\?!",
]


# ── Funções de scoring individuais ────────────────────────────────────────────

def score_hook(text: str, first_segment: bool = True) -> int:
    text_lower = text.lower()
    score = 0
    for kw in HOOK_KEYWORDS:
        if kw in text_lower:
            score += 10
    if "?" in text:
        score += 12
    word_count = len(text.split())
    if word_count <= 8:
        score += 10
    elif word_count <= 15:
        score += 5
    if first_segment:
        score += 5
    return min(score, 35)


def score_emotion(text: str) -> int:
    text_lower = text.lower()
    score = 0
    for kw in EMOTIONAL_KEYWORDS:
        if kw in text_lower:
            score += 10
    for pattern in EXCLAMATION_PATTERNS:
        matches = re.findall(pattern, text)
        score += len(matches) * 5
    return min(score, 30)


def score_tension(text: str) -> int:
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
    text_lower = text.lower()
    score = 0
    for kw in CTA_KEYWORDS:
        if kw in text_lower:
            score += 4
    return min(score, 15)


def score_flow(duration: float, word_count: int) -> int:
    score = 0
    if 25 <= duration <= 90:
        score += 6
    elif 15 <= duration <= 100:
        score += 3
    if duration > 0:
        wps = word_count / duration
        if 2.0 <= wps <= 4.0:
            score += 4
        elif 1.5 <= wps <= 5.0:
            score += 2
    return min(score, 10)


def detect_moment_type(text: str) -> str:
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


# ── Candidatos de clipe (scoring por keywords) ─────────────────────────────────

def create_clip_candidates(segments: List[Dict], target_durations=[30, 45, 60, 75, 90]) -> List[Dict]:
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

    # Deduplica por janela de 10s — permite mais cortes em lives longas
    deduped = []
    seen_buckets: set = set()
    for c in sorted(candidates, key=lambda x: x["score"], reverse=True):
        bucket = int(c["start"] // 10) * 10
        if bucket not in seen_buckets and c["score"] >= 25:
            seen_buckets.add(bucket)
            deduped.append(c)

    return deduped[:30]  # até 30 cortes por live


def score_moments(segments: List[Dict]) -> List[Dict]:
    return create_clip_candidates(segments)


# ── Agente Viral — Analise com Claude AI ─────────────────────────────────────

def analyze_with_ai(segments: list) -> list:
    """
    Agente especialista em conteúdo viral de iGaming.
    Analisa a transcrição completa da live e detecta momentos de alto potencial viral
    em 8 categorias: grande_ganho, hook_viral, tensao_aposta, reacao_forte,
    dica_valor, momento_engracado, controversia, cta_natural.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("[ViralAgent] ANTHROPIC_API_KEY não configurada — pulando análise IA")
        return []

    import anthropic

    # Monta transcrição com timestamps — envia mais contexto para análise profunda
    transcript_lines = []
    for seg in segments[:400]:
        transcript_lines.append(f"[{seg['start']:.1f}s] {seg['text']}")
    transcript_text = "\n".join(transcript_lines)

    # Calcula duração total para dar contexto ao agente
    total_duration = segments[-1]["end"] if segments else 0
    total_minutes = int(total_duration // 60)

    prompt = f"""Você é o melhor especialista em criação de conteúdo viral para iGaming/cassino online do Brasil.
Você conhece profundamente o que faz uma live de cassino explodir em visualizações no Instagram Reels e TikTok.

Você está analisando uma live de {total_minutes} minutos. Sua missão: encontrar TODOS os momentos que valem virar clipe.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 AS 8 CATEGORIAS DE MOMENTOS VIRAIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **grande_ganho** — Ganho alto, jackpot, multiplicador absurdo, vitória inesperada
   → Viral score: 85-99 | Duração ideal: 20-45s | Gatilho: inveja + euforia

2. **hook_viral** — Frase/momento que para o scroll instantaneamente
   → Viral score: 70-90 | Duração: 15-30s | Gatilho: curiosidade, surpresa, choque

3. **tensao_aposta** — Suspense antes do resultado, aposta alta, "vai ou não vai"
   → Viral score: 70-88 | Duração: 20-50s | Gatilho: ansiedade, expectativa

4. **reacao_forte** — Grito, choque, riso, descrença — emoção 100% genuína
   → Viral score: 75-95 | Duração: 15-35s | Gatilho: empatia, diversão

5. **dica_valor** — Estratégia real, segredo de jogo, método que funciona
   → Viral score: 65-85 | Duração: 30-60s | Gatilho: utilidade, salvar pra ver depois

6. **momento_engracado** — Humor orgânico, situação cômica, piada inesperada
   → Viral score: 65-85 | Duração: 15-40s | Gatilho: entretenimento, compartilhamento

7. **controversia** — Debate, opinião forte, polêmica, "discordo total"
   → Viral score: 70-90 | Duração: 20-50s | Gatilho: comentários, discórdia

8. **cta_natural** — Chamada pra ação orgânica: cadastro, bônus, link, convite
   → Viral score: 60-80 | Duração: 15-30s | Gatilho: conversão direta

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 REGRAS DE ANÁLISE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Retorne entre 8 e 20 momentos (quanto mais longa a live, mais momentos)
- Duração mínima: 15s | Máxima: 60s
- NÃO sobreponha momentos (start de um > end do anterior)
- O hook_text vai aparecer em CIMA do vídeo nos primeiros 3s — deve ser IMPACTANTE (max 7 palavras, sem pontuação excessiva)
- O cta_text vai no rodapé nos últimos 3s — deve ser direto e urgente (max 8 palavras)
- viral_reason: 1 frase específica sobre POR QUE esse momento vai performar (não genérico)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 RETORNE APENAS JSON VÁLIDO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{{
  "moments": [
    {{
      "start": <float>,
      "end": <float>,
      "category": "grande_ganho|hook_viral|tensao_aposta|reacao_forte|dica_valor|momento_engracado|controversia|cta_natural",
      "score": <int 0-99>,
      "hook_text": "<texto impactante para overlay no topo>",
      "cta_text": "<chamada para ação ou null>",
      "viral_reason": "<por que vai viralizar — 1 frase específica>"
    }}
  ]
}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📺 TRANSCRIÇÃO DA LIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{transcript_text}
"""

    client = anthropic.Anthropic(api_key=api_key)
    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )
        content = message.content[0].text.strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        data = _json.loads(content)
        moments = data.get("moments", [])

        # Normaliza campos para garantir compatibilidade com o pipeline
        normalized = []
        for m in moments:
            normalized.append({
                "start": float(m.get("start", 0)),
                "end": float(m.get("end", 0)),
                "score": int(m.get("score", 50)),
                "text": "",  # será preenchido pelo pipeline
                "natural_hook": m.get("hook_text", ""),
                "cta_suggestion": m.get("cta_text") or "",
                "category": m.get("category", "geral"),
                "reason": m.get("viral_reason", "Momento viral"),
            })

        print(f"[ViralAgent] {len(normalized)} momentos detectados pela IA")
        return normalized

    except Exception as e:
        print(f"[ViralAgent] Erro na análise: {e}")
        return []
