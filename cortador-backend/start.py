"""
Cortador de Lives BINGOBET — Script de inicializacao
Verifica dependencias, ffmpeg e inicia o servidor.
"""

import subprocess
import sys
import os
import shutil


def check_python_version():
    v = sys.version_info
    if v.major < 3 or (v.major == 3 and v.minor < 10):
        print(f"[ERRO] Python 3.10+ necessario. Encontrado: {v.major}.{v.minor}.{v.micro}")
        return False
    print(f"[OK] Python {v.major}.{v.minor}.{v.micro}")
    return True


def check_ffmpeg():
    path = shutil.which("ffmpeg")
    if not path:
        print("[ERRO] ffmpeg nao encontrado no PATH.")
        print("       Instale: https://ffmpeg.org/download.html")
        print("       Windows: winget install Gyan.FFmpeg")
        return False
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True, text=True, timeout=5
        )
        version_line = result.stdout.split("\n")[0] if result.stdout else "desconhecida"
        print(f"[OK] ffmpeg encontrado: {version_line}")
        return True
    except Exception as e:
        print(f"[ERRO] ffmpeg encontrado mas falhou ao executar: {e}")
        return False


def check_dependencies():
    missing = []
    deps = {
        "fastapi": "fastapi",
        "uvicorn": "uvicorn",
        "whisper": "openai-whisper",
        "torch": "torch",
    }
    for module, package in deps.items():
        try:
            __import__(module)
            print(f"[OK] {package}")
        except ImportError:
            print(f"[FALTA] {package}")
            missing.append(package)

    if missing:
        print(f"\nInstale com: pip install {' '.join(missing)}")
        print("Ou: pip install -r requirements.txt")
        return False
    return True


def ensure_dirs():
    for d in ["uploads", "outputs", "jobs"]:
        os.makedirs(d, exist_ok=True)
    print("[OK] Diretorios criados (uploads/, outputs/, jobs/)")


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    print("=" * 50)
    print("  CORTADOR DE LIVES BINGOBET")
    print("  Verificacao de ambiente")
    print("=" * 50)
    print()

    ok = True
    ok = check_python_version() and ok
    ok = check_ffmpeg() and ok
    ok = check_dependencies() and ok
    ensure_dirs()

    print()

    if not ok:
        print("[FALHA] Corrija os problemas acima antes de iniciar.")
        sys.exit(1)

    print("=" * 50)
    print("  Iniciando servidor...")
    print("  URL: http://localhost:8000")
    print("  Docs: http://localhost:8000/docs")
    print("=" * 50)
    print()

    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ])


if __name__ == "__main__":
    main()
