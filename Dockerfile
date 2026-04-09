FROM mwader/static-ffmpeg:latest AS ffmpeg-base
FROM python:3.11-slim

# Copia binários estáticos do ffmpeg (sem apt-get, sem dependências de lib)
COPY --from=ffmpeg-base /ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg-base /ffprobe /usr/local/bin/ffprobe

WORKDIR /app

# Copia requirements do cortador-backend
COPY cortador-backend/requirements.txt .

# Instala dependências (faster-whisper usa ctranslate2, não precisa de torch)
RUN pip install --no-cache-dir -r requirements.txt

# Copia código do cortador-backend
COPY cortador-backend/ .

# Diretórios de trabalho
RUN mkdir -p uploads outputs jobs chunks

EXPOSE 8000

ARG CACHEBUST=3
LABEL version="3"
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --http h11
