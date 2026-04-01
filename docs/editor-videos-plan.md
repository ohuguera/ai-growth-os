# Editor de Videos — Planejamento Tecnico

## Visao Geral

Editor de videos integrado ao dashboard BINGOBET que permite montar criativos para Reels/TikTok/Shorts diretamente no navegador, com modelos virais pre-configurados.

---

## Arquitetura

```
Frontend (React)                Backend (FastAPI)
+------------------+           +--------------------+
| EditorVideos.tsx |  <---->   | /editor/preview    |
|                  |           | /editor/render     |
| - Timeline       |           | /editor/templates  |
| - Layer Stack    |           | /editor/assets     |
| - Preview Canvas |           +--------------------+
| - Template Picker|                    |
+------------------+                    v
                              FFmpeg + ImageMagick
                              (composicao final)
```

### Fluxo de dados

1. Usuario seleciona modelo viral (template)
2. Faz upload ou seleciona clipe existente (da biblioteca)
3. Configura camadas: texto, hook, CTA, marca d'agua, audio
4. Preview renderizado no frontend (aproximado via CSS/Canvas)
5. Render final enviado ao backend (FFmpeg compoe tudo)
6. Arquivo MP4 final disponivel para download

---

## Endpoints do Backend

### GET /editor/templates
Lista modelos de edicao disponiveis.

```json
{
  "templates": [
    {
      "id": "prova_social",
      "name": "Prova Social",
      "description": "Comentarios + resultado + CTA",
      "layers": ["hook", "body", "proof", "cta"],
      "duration_default": 30,
      "aspect_ratio": "9:16"
    }
  ]
}
```

### POST /editor/preview
Gera preview rapido (thumbnail ou GIF curto).

```json
{
  "template_id": "prova_social",
  "clip_path": "outputs/abc_clip_1.mp4",
  "texts": {
    "hook": "Ganhei R$500 em 5 minutos",
    "cta": "Link na bio"
  }
}
```

### POST /editor/render
Render final com FFmpeg. Retorna job_id para polling.

```json
{
  "template_id": "prova_social",
  "clip_path": "outputs/abc_clip_1.mp4",
  "texts": { "hook": "...", "cta": "..." },
  "audio": { "track": "upbeat_01", "volume": 0.3 },
  "overlay_image": null,
  "output_format": "mp4",
  "quality": "high"
}
```

### GET /editor/render/{job_id}
Status do render (same pattern do cortador).

### GET /editor/assets
Lista assets disponiveis (audios, overlays, fontes).

---

## Estrutura da Interface

```
EditorVideos.tsx
|
+-- TemplatePicker          (grid de modelos virais)
+-- EditorWorkspace
|   +-- PreviewCanvas       (preview ao vivo via CSS)
|   +-- LayerStack          (camadas: texto, imagem, audio)
|   +-- Timeline            (barra de tempo com markers)
|   +-- TextEditor          (edicao inline de textos)
+-- RenderPanel             (botao render + status + download)
```

### Estado principal

```typescript
interface EditorState {
  template: TemplateConfig | null;
  clipSource: string;                // path do clipe base
  layers: Layer[];                   // camadas empilhadas
  texts: Record<string, string>;     // hook, cta, body, etc.
  audio: AudioConfig | null;
  duration: number;
  renderStatus: 'idle' | 'rendering' | 'done' | 'error';
  outputUrl: string | null;
}
```

---

## Modelos de Edicao Viral

### 1. Prova Social
- **Objetivo:** Mostrar resultado real com depoimento
- **Estrutura:**
  - 0-3s: Hook ("Olha quanto ganhei")
  - 3-20s: Video do resultado (tela de saque, jogo, etc.)
  - 20-25s: Texto de reforco ("R$X em Y minutos")
  - 25-30s: CTA com link
- **Camadas:** Hook animado (fade-in), legenda auto, barra de progresso, CTA final

### 2. Hook Explosivo
- **Objetivo:** Prender atencao nos primeiros 2 segundos
- **Estrutura:**
  - 0-2s: Zoom rapido + texto grande impactante
  - 2-5s: Pausa dramatica (slowmo)
  - 5-25s: Conteudo principal
  - 25-30s: CTA
- **Camadas:** Efeito zoom, flash branco, texto bold, shake na transicao

### 3. Tutorial Rapido
- **Objetivo:** Ensinar algo em 60 segundos
- **Estrutura:**
  - 0-3s: "Como [resultado] em [tempo]"
  - 3-15s: Passo 1 (com numeracao visual)
  - 15-30s: Passo 2
  - 30-45s: Passo 3
  - 45-55s: Resultado
  - 55-60s: CTA
- **Camadas:** Numeracao grande, barras de progresso por etapa, legenda sincronizada

### 4. Storytelling
- **Objetivo:** Contar historia envolvente
- **Estrutura:**
  - 0-5s: Situacao ("Eu estava...")
  - 5-20s: Conflito ("Quando descobri que...")
  - 20-40s: Resolucao ("Entao fiz...")
  - 40-55s: Resultado ("E agora...")
  - 55-60s: CTA
- **Camadas:** Texto narrativo, emocoes com emoji, musica de fundo crescente

---

## Roadmap de Implementacao

### Fase 1 — MVP (proxima sessao)
- [ ] Backend: GET /editor/templates (retorna lista estatica)
- [ ] Backend: POST /editor/render (FFmpeg com template basico)
- [ ] Frontend: TemplatePicker (grid com 4 modelos)
- [ ] Frontend: Preview simples (imagem + textos sobrepostos)
- [ ] Frontend: RenderPanel (botao + status + download)

### Fase 2 — Edicao Visual
- [ ] Frontend: LayerStack (arrastar/reordenar camadas)
- [ ] Frontend: TextEditor inline
- [ ] Frontend: Timeline basica
- [ ] Backend: Audio overlay

### Fase 3 — Avancado
- [ ] Preview em tempo real (Canvas API)
- [ ] Biblioteca de assets (musicas, overlays)
- [ ] Export para multiplas plataformas (Reels, TikTok, Shorts)
- [ ] Historico de edicoes

---

## Dependencias

- FFmpeg (ja instalado para o Cortador IA)
- Canvas API no frontend para preview
- Mesmo design system (G, GlassCard, Badge, Btn)
- Mesmo pattern de API (cortadorApi pattern)

## Estimativa

- Fase 1: 1 sessao de trabalho
- Fase 2: 2 sessoes
- Fase 3: 3 sessoes
