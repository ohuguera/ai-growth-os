import subprocess
import os
import tempfile
from typing import List, Dict


def seconds_to_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def seconds_to_ass_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    cs = int((s % 1) * 100)
    return f"{h}:{m:02d}:{int(s):02d}.{cs:02d}"


def get_caption_y(position: str) -> str:
    positions = {
        "top": "100",
        "middle": "(h/2)",
        "bottom": "(h-200)",
    }
    return positions.get(position, "(h/2)")


def escape_text(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
            .replace("'", "\u2019")
            .replace(":", "\\:")
            .replace(",", "\\,")
            .replace("[", "\\[")
            .replace("]", "\\]")
            .replace("%", "%%")
            .replace(";", "\\;")
    )


def escape_ass(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
            .replace("{", "\\{")
            .replace("}", "\\}")
            .replace("\n", "\\N")
    )


def get_segments_in_range(segments: List[Dict], start: float, end: float) -> List[Dict]:
    return [s for s in segments if s["start"] >= start - 0.5 and s["end"] <= end + 0.5]


def build_karaoke_ass(
    segments: List[Dict],
    clip_start: float,
    clip_end: float,
    words_per_line: int = 4
) -> str:
    """
    Gera arquivo ASS com legendas karaokê palavra por palavra.
    Palavra ativa: verde brilhante + negrito.
    Outras palavras da linha: branco.
    Estilo: opus-clip / captions AI.
    """
    lines = [
        "[Script Info]",
        "ScriptType: v4.00+",
        "PlayResX: 1080",
        "PlayResY: 1920",
        "ScaledBorderAndShadow: yes",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
        "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, "
        "Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        # Estilo principal: branco, negrito, outline preto
        "Style: Default,Arial,64,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,"
        "1,0,0,0,100,100,0,0,1,4,0,2,60,60,140,1",
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]

    clip_segs = get_segments_in_range(segments, clip_start, clip_end)

    for seg in clip_segs:
        words = seg.get("words", [])
        if not words:
            # Fallback: usa tempo do segmento sem word timing
            rel_start = max(0, round(seg["start"] - clip_start, 2))
            rel_end = max(0, round(seg["end"] - clip_start, 2))
            text = escape_ass(seg["text"].strip())
            if text:
                lines.append(
                    f"Dialogue: 0,{seconds_to_ass_time(rel_start)},"
                    f"{seconds_to_ass_time(rel_end)},Default,,0,0,0,,{text}"
                )
            continue

        # Agrupa palavras em linhas de N palavras
        chunks = [words[i:i + words_per_line] for i in range(0, len(words), words_per_line)]

        for chunk in chunks:
            if not chunk:
                continue

            chunk_start = round(chunk[0]["start"] - clip_start, 2)
            chunk_end = round(chunk[-1]["end"] - clip_start, 2)

            if chunk_start < 0:
                chunk_start = 0
            if chunk_end <= chunk_start:
                continue

            # Gera uma linha de diálogo por PALAVRA (palavra ativa destaca, demais ficam brancas)
            for wi, word_obj in enumerate(chunk):
                word_start = round(word_obj["start"] - clip_start, 2)
                word_end = round(word_obj["end"] - clip_start, 2)

                if word_start < 0:
                    word_start = 0
                if word_end <= word_start:
                    continue

                # Monta a linha: palavras antes (brancas) + palavra ativa (verde negrito) + palavras depois (brancas)
                parts = []
                for j, w in enumerate(chunk):
                    w_text = escape_ass(w["word"].strip())
                    if not w_text:
                        continue
                    if j == wi:
                        # Palavra ativa: verde brilhante + negrito
                        parts.append(f"{{\\c&H00FF00&\\b1}}{w_text}{{\\r}}")
                    else:
                        parts.append(w_text)

                line_text = " ".join(parts)
                lines.append(
                    f"Dialogue: 0,{seconds_to_ass_time(word_start)},"
                    f"{seconds_to_ass_time(word_end)},Default,,0,0,0,,{line_text}"
                )

    return "\n".join(lines)


def build_vf_simple(
    hook: str,
    cta: str,
    watermark: bool,
    clip_duration: float,
    ass_path: str | None = None,
) -> str:
    """Filtros FFmpeg: crop 9:16 + legendas ASS (se disponível) + hook + CTA + watermark."""
    parts = [
        "scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920"
    ]

    # Legendas karaokê via ASS
    if ass_path and os.path.exists(ass_path):
        ass_escaped = ass_path.replace("\\", "/").replace(":", "\\:")
        parts.append(f"subtitles='{ass_escaped}'")

    # Hook nos primeiros 3s (amarelo, topo)
    if hook:
        parts.append(
            f"drawtext=text='{escape_text(hook)}'"
            f":fontsize=46"
            f":fontcolor=yellow"
            f":borderw=3:bordercolor=black"
            f":x=(w-text_w)/2:y=120"
            f":enable='between(t,0,3)'"
        )

    # CTA nos últimos 4s
    if cta:
        cta_start = round(max(0, clip_duration - 4), 2)
        parts.append(
            f"drawtext=text='{escape_text(cta)}'"
            f":fontsize=46"
            f":fontcolor=yellow"
            f":borderw=3:bordercolor=black"
            f":x=(w-text_w)/2:y=(h-120)"
            f":enable='between(t,{cta_start},{clip_duration})'"
        )

    # Watermark BINGOBET
    if watermark:
        parts.append(
            "drawtext=text='BINGOBET +18'"
            ":fontsize=30"
            ":fontcolor=white@0.75"
            ":borderw=2:bordercolor=black"
            ":x=w-text_w-20:y=20"
        )

    return ",".join(parts)


def process_clip(
    video_path: str,
    output_path: str,
    start: float,
    end: float,
    hook: str,
    cta: str,
    caption_position: str,
    watermark: bool,
    segments: List[Dict]
):
    duration = round(end - start, 2)
    ass_path = None

    # Gera arquivo ASS de karaokê temporário
    try:
        ass_content = build_karaoke_ass(segments, clip_start=start, clip_end=end)
        tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".ass", delete=False, encoding="utf-8")
        tmp.write(ass_content)
        tmp.close()
        ass_path = tmp.name
        print(f"[Karaokê] ASS gerado: {ass_path}")
    except Exception as e:
        print(f"[Karaokê] Falha ao gerar ASS (fallback sem legenda karaokê): {e}")

    vf = build_vf_simple(
        hook=hook,
        cta=cta,
        watermark=watermark,
        clip_duration=duration,
        ass_path=ass_path,
    )

    cmd = [
        "ffmpeg", "-y",
        "-ss", seconds_to_time(start),
        "-i", video_path,
        "-t", str(duration),
        "-vf", vf,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        output_path
    ]

    print(f"[FFmpeg] Processando clipe: {start}s → {end}s (karaokê: {'sim' if ass_path else 'não'})")
    result = subprocess.run(cmd, capture_output=True, text=True)

    # Limpa arquivo ASS temporário
    if ass_path and os.path.exists(ass_path):
        try:
            os.unlink(ass_path)
        except Exception:
            pass

    if result.returncode != 0:
        raise Exception(f"FFmpeg error: {result.stderr[-500:]}")

    print(f"[FFmpeg] Clipe salvo: {output_path}")
