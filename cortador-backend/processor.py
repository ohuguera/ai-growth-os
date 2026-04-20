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


# ── ASS Header helpers ──────────────────────────────────────────────────────────

def _ass_header(styles: str) -> List[str]:
    return [
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
        styles,
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]


# ── Template 1: KARAOKÊ — palavra ativa em verde, demais brancas ───────────────

def build_karaoke_ass(segments: List[Dict], clip_start: float, clip_end: float, words_per_line: int = 4) -> str:
    style = (
        "Style: Default,Arial,64,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,"
        "1,0,0,0,100,100,0,0,1,4,0,2,60,60,140,1"
    )
    lines = _ass_header(style)
    clip_segs = get_segments_in_range(segments, clip_start, clip_end)

    for seg in clip_segs:
        words = seg.get("words", [])
        if not words:
            rel_start = max(0, round(seg["start"] - clip_start, 2))
            rel_end = max(0, round(seg["end"] - clip_start, 2))
            text = escape_ass(seg["text"].strip())
            if text:
                lines.append(
                    f"Dialogue: 0,{seconds_to_ass_time(rel_start)},"
                    f"{seconds_to_ass_time(rel_end)},Default,,0,0,0,,{text}"
                )
            continue

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

            for wi, word_obj in enumerate(chunk):
                word_start = max(0, round(word_obj["start"] - clip_start, 2))
                word_end = round(word_obj["end"] - clip_start, 2)
                if word_end <= word_start:
                    continue

                parts = []
                for j, w in enumerate(chunk):
                    w_text = escape_ass(w["word"].strip())
                    if not w_text:
                        continue
                    if j == wi:
                        parts.append(f"{{\\c&H00FF00&\\b1}}{w_text}{{\\r}}")
                    else:
                        parts.append(w_text)

                lines.append(
                    f"Dialogue: 0,{seconds_to_ass_time(word_start)},"
                    f"{seconds_to_ass_time(word_end)},Default,,0,0,0,," + " ".join(parts)
                )

    return "\n".join(lines)


# ── Template 2: BOUNCE — cada linha escala de 0 → 115% → 100% ────────────────
# Efeito "pop" — texto aparece com um salto suave, igual Opus Clip/CapCut

def build_bounce_ass(segments: List[Dict], clip_start: float, clip_end: float, words_per_line: int = 3) -> str:
    # Arial Black, tamanho grande, branco com outline preto espesso
    style = (
        "Style: Bounce,Arial Black,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&HA0000000,"
        "1,0,0,0,100,100,2,0,1,5,0,2,80,80,200,1"
    )
    lines = _ass_header(style)
    clip_segs = get_segments_in_range(segments, clip_start, clip_end)

    for seg in clip_segs:
        words = seg.get("words", [])

        if not words:
            rel_start = max(0, round(seg["start"] - clip_start, 2))
            rel_end = max(0, round(seg["end"] - clip_start, 2))
            text = escape_ass(seg["text"].strip())
            if text:
                # Bounce simples na linha inteira
                anim = r"{\an2\fscx0\fscy0\t(0,150,\fscx115\fscy115)\t(150,250,\fscx100\fscy100)}"
                lines.append(
                    f"Dialogue: 0,{seconds_to_ass_time(rel_start)},"
                    f"{seconds_to_ass_time(rel_end)},Bounce,,0,0,0,,{anim}{text}"
                )
            continue

        chunks = [words[i:i + words_per_line] for i in range(0, len(words), words_per_line)]
        for chunk in chunks:
            if not chunk:
                continue
            chunk_start = max(0, round(chunk[0]["start"] - clip_start, 2))
            chunk_end = round(chunk[-1]["end"] - clip_start, 2)
            if chunk_end <= chunk_start:
                continue

            line_text = escape_ass(" ".join(w["word"].strip() for w in chunk))
            # Bounce: escala de 0 → 115% em 150ms → volta para 100% em mais 100ms
            anim = r"{\an2\fscx0\fscy0\t(0,150,\fscx115\fscy115)\t(150,250,\fscx100\fscy100)}"
            lines.append(
                f"Dialogue: 0,{seconds_to_ass_time(chunk_start)},"
                f"{seconds_to_ass_time(chunk_end)},Bounce,,0,0,0,,{anim}{line_text}"
            )

    return "\n".join(lines)


# ── Template 3: SLIDE UP — texto sobe de baixo com fade-in ────────────────────
# Igual trending TikTok — entra de baixo, sai pelo topo

def build_slide_up_ass(segments: List[Dict], clip_start: float, clip_end: float, words_per_line: int = 4) -> str:
    style = (
        "Style: SlideUp,Arial Black,68,&H00FFFFFF,&H00FFFFFF,&H00000000,&HA0000000,"
        "1,0,0,0,100,100,0,0,1,5,0,2,80,80,180,1"
    )
    lines = _ass_header(style)
    clip_segs = get_segments_in_range(segments, clip_start, clip_end)

    for seg in clip_segs:
        words = seg.get("words", [])

        if not words:
            rel_start = max(0, round(seg["start"] - clip_start, 2))
            rel_end = max(0, round(seg["end"] - clip_start, 2))
            text = escape_ass(seg["text"].strip())
            if text:
                # Slide: começa 150px abaixo, sobe em 250ms, fade in simultâneo
                anim = r"{\an2\alpha&HFF&\move(540,2070,540,1760,0,250)\t(0,200,\alpha&H00&)}"
                lines.append(
                    f"Dialogue: 0,{seconds_to_ass_time(rel_start)},"
                    f"{seconds_to_ass_time(rel_end)},SlideUp,,0,0,0,,{anim}{text}"
                )
            continue

        chunks = [words[i:i + words_per_line] for i in range(0, len(words), words_per_line)]
        for chunk in chunks:
            if not chunk:
                continue
            chunk_start = max(0, round(chunk[0]["start"] - clip_start, 2))
            chunk_end = round(chunk[-1]["end"] - clip_start, 2)
            if chunk_end <= chunk_start:
                continue

            line_text = escape_ass(" ".join(w["word"].strip() for w in chunk))
            anim = r"{\an2\alpha&HFF&\move(540,2070,540,1760,0,250)\t(0,200,\alpha&H00&)}"
            lines.append(
                f"Dialogue: 0,{seconds_to_ass_time(chunk_start)},"
                f"{seconds_to_ass_time(chunk_end)},SlideUp,,0,0,0,,{anim}{line_text}"
            )

    return "\n".join(lines)


# ── Template 4: BLOCO — palavra por palavra, fundo escuro, amarelo destaque ────
# Estilo "word-by-word" do CapCut — cada palavra ocupa o centro com fundo

def build_block_ass(segments: List[Dict], clip_start: float, clip_end: float) -> str:
    # BorderStyle 3 = opaque box background
    style = (
        "Style: Block,Arial Black,80,&H00FFFF00,&H00FFFF00,&H00000000,&HB4000000,"
        "1,0,0,0,100,100,0,0,3,10,0,2,60,60,160,1"
    )
    lines = _ass_header(style)
    clip_segs = get_segments_in_range(segments, clip_start, clip_end)

    for seg in clip_segs:
        words = seg.get("words", [])
        if not words:
            rel_start = max(0, round(seg["start"] - clip_start, 2))
            rel_end = max(0, round(seg["end"] - clip_start, 2))
            text = escape_ass(seg["text"].strip())
            if text:
                lines.append(
                    f"Dialogue: 0,{seconds_to_ass_time(rel_start)},"
                    f"{seconds_to_ass_time(rel_end)},Block,,0,0,0,,{text}"
                )
            continue

        # Uma palavra por vez — máximo impacto visual
        for word_obj in words:
            word_start = max(0, round(word_obj["start"] - clip_start, 2))
            word_end = round(word_obj["end"] - clip_start, 2)
            if word_end <= word_start:
                continue
            w_text = escape_ass(word_obj["word"].strip().upper())
            if w_text:
                lines.append(
                    f"Dialogue: 0,{seconds_to_ass_time(word_start)},"
                    f"{seconds_to_ass_time(word_end)},Block,,0,0,0,,{w_text}"
                )

    return "\n".join(lines)


# ── Dispatcher de templates ────────────────────────────────────────────────────

CAPTION_STYLES = {
    "karaoke": build_karaoke_ass,
    "bounce": build_bounce_ass,
    "slide_up": build_slide_up_ass,
    "block": build_block_ass,
}


def build_ass(
    style: str,
    segments: List[Dict],
    clip_start: float,
    clip_end: float,
) -> str:
    """Despacha para o template correto. Fallback para karaoke se inválido."""
    builder = CAPTION_STYLES.get(style, build_karaoke_ass)
    return builder(segments, clip_start, clip_end)


# ── Filtros FFmpeg ─────────────────────────────────────────────────────────────

def build_vf_simple(
    hook: str,
    cta: str,
    watermark: bool,
    clip_duration: float,
    ass_path: str | None = None,
) -> str:
    """Filtros FFmpeg: crop 9:16 + legendas ASS + hook + CTA + watermark."""
    parts = [
        "scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920"
    ]

    if ass_path and os.path.exists(ass_path):
        ass_escaped = ass_path.replace("\\", "/").replace(":", "\\:")
        parts.append(f"subtitles='{ass_escaped}'")

    # Hook: amarelo bold no topo, primeiros 3s
    if hook:
        parts.append(
            f"drawtext=text='{escape_text(hook)}'"
            f":fontsize=52:fontcolor=yellow:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
            f":borderw=4:bordercolor=black"
            f":x=(w-text_w)/2:y=110"
            f":enable='between(t,0,3)'"
        )

    # CTA: branco com fundo semitransparente, últimos 4s
    if cta:
        cta_start = round(max(0, clip_duration - 4), 2)
        parts.append(
            f"drawtext=text='{escape_text(cta)}'"
            f":fontsize=48:fontcolor=white"
            f":borderw=4:bordercolor=black"
            f":box=1:boxcolor=black@0.5:boxborderw=10"
            f":x=(w-text_w)/2:y=(h-130)"
            f":enable='between(t,{cta_start},{clip_duration})'"
        )

    # Watermark BINGOBET
    if watermark:
        parts.append(
            "drawtext=text='BINGOBET +18'"
            ":fontsize=30"
            ":fontcolor=white@0.80"
            ":borderw=2:bordercolor=black"
            ":x=w-text_w-20:y=20"
        )

    return ",".join(parts)


# ── Processador de clipe ───────────────────────────────────────────────────────

def process_clip(
    video_path: str,
    output_path: str,
    start: float,
    end: float,
    hook: str,
    cta: str,
    caption_position: str,
    watermark: bool,
    segments: List[Dict],
    cta_video_path: str = None,
    caption_style: str = "karaoke",
):
    duration = round(end - start, 2)
    ass_path = None

    try:
        ass_content = build_ass(caption_style, segments, clip_start=start, clip_end=end)
        tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".ass", delete=False, encoding="utf-8")
        tmp.write(ass_content)
        tmp.close()
        ass_path = tmp.name
        print(f"[Legenda:{caption_style}] ASS gerado: {ass_path}")
    except Exception as e:
        print(f"[Legenda] Falha ao gerar ASS (sem legenda): {e}")

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

    print(f"[FFmpeg] {start}s → {end}s | legenda={caption_style} | hook={bool(hook)} | cta={bool(cta)}")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if ass_path and os.path.exists(ass_path):
        try:
            os.unlink(ass_path)
        except Exception:
            pass

    if result.returncode != 0:
        raise Exception(f"FFmpeg error: {result.stderr[-500:]}")

    # Concatenar vídeo CTA ao final se disponível
    if cta_video_path and os.path.exists(cta_video_path):
        tmp_main = output_path + ".tmp_main.mp4"
        os.rename(output_path, tmp_main)

        tmp_cta = output_path + ".tmp_cta.mp4"
        cmd_cta = [
            "ffmpeg", "-y", "-i", cta_video_path,
            "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            tmp_cta
        ]
        subprocess.run(cmd_cta, capture_output=True)

        concat_list = output_path + ".concat.txt"
        with open(concat_list, "w") as f:
            f.write(f"file '{os.path.abspath(tmp_main)}'\n")
            f.write(f"file '{os.path.abspath(tmp_cta)}'\n")

        cmd_concat = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list,
            "-c", "copy",
            output_path
        ]
        result_concat = subprocess.run(cmd_concat, capture_output=True, text=True)

        for tmp_file in [tmp_main, tmp_cta, concat_list]:
            try:
                os.unlink(tmp_file)
            except Exception:
                pass

        if result_concat.returncode != 0:
            print(f"[CTA] Falha ao concatenar: {result_concat.stderr[-200:]}")

    print(f"[FFmpeg] Clipe salvo: {output_path}")
