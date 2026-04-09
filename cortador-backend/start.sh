#!/bin/sh
echo "[startup] PORT=${PORT}"
echo "[startup] Iniciando uvicorn na porta ${PORT:-8000}"
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
