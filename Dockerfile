FROM mwader/static-ffmpeg:latest AS ffmpeg-base
FROM python:3.11-slim

# Copia binários estáticos do ffmpeg (sem apt-get, sem dependências de lib)
COPY --from=ffmpeg-base /ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg-base /ffprobe /usr/local/bin/ffprobe

WORKDIR /app

# Copia requirements do cortador-backend
COPY cortador-backend/requirements.txt .

# PyTorch CPU (menor, suficiente para Whisper base)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Demais dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia código do cortador-backend
COPY cortador-backend/ .

# Diretórios de trabalho
RUN mkdir -p uploads outputs jobs

# Pré-baixa modelo Whisper no build (evita download na primeira request)
RUN python -c "import whisper; whisper.load_model('base')"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
