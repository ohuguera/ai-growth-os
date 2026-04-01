# Arquitetura — HR The Troop UX
**Versão:** 1.0
**Data:** 2026-03-19
**Arquiteta:** Aria (@architect)
**Status:** Aprovado

---

## Princípio Central
> **100% local. GPU-first. Zero dependência de nuvem para processamento.**

---

## Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    HR THE TROOP UX                       │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  PAINEL  │───▶│  PIPELINE    │───▶│   ENTREGA     │  │
│  │  WEB     │    │  DE IA LOCAL │    │  Google Drive │  │
│  │ (Next.js)│    │  (Python)    │    │  + WhatsApp   │  │
│  └──────────┘    └──────────────┘    └───────────────┘  │
│                        │                                │
│              ┌─────────┼─────────┐                      │
│              ▼         ▼         ▼                      │
│          yt-dlp    Whisper    Ollama                     │
│         (baixar)  (GPU local) (análise IA)              │
│                        │                                │
│                      FFmpeg                             │
│                     (cortar)                            │
└─────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| **Interface** | Next.js 14 + Tailwind | Rápido de construir, roda local |
| **Backend/API** | FastAPI (Python) | Ideal para pipelines de IA/ML |
| **Download** | `yt-dlp` | Suporta YouTube, Zoom, Meet, Drive |
| **Transcrição** | `Whisper large-v3` (GPU) | Melhor custo-benefício local, PT-BR excelente |
| **Análise Viral** | `Ollama` + `llama3.1:8b` | Roda na GPU, analisa transcrição |
| **Edição de Vídeo** | `FFmpeg` | Padrão ouro, gratuito, rápido |
| **Legendas** | `FFmpeg` + `ASS format` | Legendas animadas estilo viral |
| **Banco de Dados** | `SQLite` | Simples, local, zero config |
| **Fila de Jobs** | `Redis` + `Celery` | Processa múltiplos vídeos em paralelo |
| **Entrega** | `Google Drive API` | Requisito do cliente |
| **Notificação** | `WhatsApp Business API` | Avisa quando pronto |

---

## Pipeline de Processamento

```
[1] INGESTÃO
    └── Recebe link (YouTube / Drive / Zoom / Meet)
    └── yt-dlp faz download em background
    └── Status: "Baixando..."

[2] TRANSCRIÇÃO (GPU)
    └── Whisper large-v3 transcreve tudo
    └── Gera arquivo .SRT com timestamps precisos
    └── Status: "Transcrevendo..."

[3] ANÁLISE VIRAL (GPU / Ollama)
    └── LLM recebe transcrição + prompt especializado em iGaming
    └── Identifica: ganhos grandes, reações, frases virais, momentos de tensão
    └── Retorna lista de timestamps com score viral (0-100)
    └── Status: "Analisando momentos..."

[4] CORTE (FFmpeg)
    └── Corta os top N momentos (configurável, padrão: top 10)
    └── Exporta em 9:16 (vertical) e 16:9 (horizontal)
    └── Status: "Cortando clipes..."

[5] LEGENDAS (FFmpeg + ASS)
    └── Aplica legendas animadas nos clipes
    └── Palavra atual destacada (estilo karaokê)
    └── Fonte grande, sombra, cores configuráveis
    └── Status: "Legendando..."

[6] ENTREGA
    └── Upload automático no Google Drive
    └── Pasta: /HR-Troop/{data}/{streamer}/
    └── Notificação WhatsApp: "5 clipes prontos para revisão"
    └── Status: "Pronto! ✅"
```

---

## Critérios de Score Viral (iGaming)

```
Score 90-100: Ganho enorme + reação extrema do streamer
Score 80-89:  Virada dramática (quase perdeu → ganhou)
Score 70-79:  Frase marcante + chat explodindo
Score 60-69:  Momento engraçado / inesperado
Score 50-59:  Interação intensa com lead da comunidade
```

---

## Estrutura do Projeto

```
hr-troop-ux/
├── web/                    # Next.js — painel da equipe
│   ├── app/
│   │   ├── dashboard/      # Lista de demandas
│   │   ├── submit/         # Enviar novo vídeo
│   │   └── review/         # Revisar clipes prontos
│   └── components/
│
├── api/                    # FastAPI — backend + pipeline
│   ├── routers/
│   │   ├── jobs.py         # Criar/listar jobs
│   │   └── clips.py        # Gerenciar clipes
│   ├── pipeline/
│   │   ├── downloader.py   # yt-dlp wrapper
│   │   ├── transcriber.py  # Whisper wrapper
│   │   ├── analyzer.py     # Ollama / detecção viral
│   │   ├── cutter.py       # FFmpeg cortes
│   │   └── captioner.py    # FFmpeg legendas
│   └── services/
│       ├── drive.py        # Google Drive upload
│       └── notifier.py     # WhatsApp notificação
│
├── worker/                 # Celery workers (processamento paralelo)
├── data/                   # SQLite + arquivos temporários
└── docker-compose.yml      # Sobe tudo com 1 comando
```

---

## Requisitos de Hardware

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| GPU | 8GB VRAM | 12GB+ VRAM |
| RAM | 16GB | 32GB |
| Armazenamento | SSD 500GB livre | SSD 1TB livre |
| GPU suportada | NVIDIA RTX 3060 | RTX 4070+ |

---

## Referências
- PRD: `docs/prd/hr-troop-ux-prd.md`
- Stories: `docs/stories/`

---
*Documento criado pelo agente @architect (Aria) via HR The Troop UX — AIOS Framework*
