# Bingo! Fábrica de Criativos 2.0 — Motor de IA

Este pacote é o **cérebro** do sistema. Ele conecta os três modelos de IA:

| Motor | SDK | Função |
|-------|-----|--------|
| 🤖 Claude | `@anthropic-ai/sdk` | Geração de Hooks, Copy e CTAs |
| 🔵 Gemini | `@google/generative-ai` | Análise de retenção e contexto de vídeo |
| ⚙️ LangChain | `langchain` + adapters | Orquestração dos agentes |

## Como Ativar

1. Copie o `.env.example` da raiz do projeto para `.env`
2. Adicione suas chaves de API:
   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   GEMINI_API_KEY=AIza...
   ```
3. Rode o motor para testar as conexões:
   ```bash
   cd packages/bingo-engine
   node src/index.js
   ```

## Estrutura

```
packages/bingo-engine/
├── src/
│   └── index.js   ← Ponto de entrada e teste de conexão
├── package.json
└── README.md
```

