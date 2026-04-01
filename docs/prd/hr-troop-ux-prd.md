# PRD — HR The Troop UX
**Versão:** 1.0
**Data:** 2026-03-19
**Status:** Draft
**Product Manager:** Morgan (@pm)

---

## 1. Visão Geral do Produto

### 1.1 Problema
A equipe de audiovisual de iGaming está sobrecarregada com edição manual de conteúdo. Editar lives de jogadores de crash e roleta consome horas por vídeo — assistir tudo, identificar os melhores momentos, cortar, legendar e entregar. Com volume crescente de demandas, 2 editores não conseguem escalar.

### 1.2 Solução
**HR The Troop UX** é uma ferramenta de automação de edição de vídeo com IA que:
- Recebe vídeos de lives (YouTube, Zoom, Meet, Google Drive)
- Identifica automaticamente os momentos virais de iGaming (ganhos grandes, reações emocionais, interações com a comunidade)
- Corta, legenda e entrega clipes prontos para redes sociais
- Integra com Google Drive para entrega dos arquivos

### 1.3 Usuários-Alvo
- **Primários:** Equipe de audiovisual (2 editores inicialmente)
- **Conteúdo:** Lives de jogadores de iGaming (crash, roleta) com suas comunidades

---

## 2. Objetivos e Métricas de Sucesso

### 2.1 Objetivos
| # | Objetivo | Métrica |
|---|----------|---------|
| O1 | Reduzir tempo de edição por vídeo | De ~3h para ~30min (revisar e aprovar) |
| O2 | Aumentar volume de clipes entregues | De 3-5/dia para 20-30/dia por editor |
| O3 | Manter qualidade dos cortes virais | Taxa de aprovação do editor ≥ 80% |
| O4 | Automatizar entrega | 100% dos clipes prontos no Google Drive |

### 2.2 KPIs
- Tempo médio de processamento por vídeo
- Taxa de aprovação dos clipes (sem retrabalho)
- Volume semanal de clipes entregues
- Redução de horas manuais da equipe

---

## 3. Requisitos Funcionais

### Fase 1 — MVP (Escopo Imediato)

#### FR-01: Ingestão de Vídeo
- O sistema DEVE aceitar links do YouTube (lives e VODs)
- O sistema DEVE aceitar links do Google Drive
- O sistema DEVE aceitar links do Zoom e Google Meet (gravações)
- O sistema DEVE fazer download do vídeo para processamento local

#### FR-02: Transcrição Automática
- O sistema DEVE transcrever o áudio completo do vídeo
- Suporte a português brasileiro
- Precisão mínima de 90% em vídeos com qualidade de áudio razoável

#### FR-03: Detecção de Momentos Virais (iGaming)
A IA DEVE identificar momentos virais específicos de iGaming:
- **Grandes ganhos:** multiplicadores altos no crash, ganhos expressivos na roleta
- **Reações emocionais:** gritos, comemorações, desespero, euforia do streamer
- **Interação com a comunidade:** momentos em que leads/chat participam ativamente
- **Viradas de jogo:** momentos de tensão máxima (quase perdeu / ganhou no limite)
- **Frases marcantes:** expressões que geram engajamento e compartilhamento

#### FR-04: Corte Automático de Clipes
- O sistema DEVE gerar clipes de 30s a 3min automaticamente
- Cada clipe DEVE ter início e fim em pontos de contexto completo (não cortar no meio de uma fala)
- O sistema DEVE gerar entre 5 e 15 clipes por live de 1h
- Formato vertical (9:16) para Reels/TikTok/Shorts
- Formato horizontal (16:9) mantido para YouTube

#### FR-05: Legendas Automáticas
- O sistema DEVE adicionar legendas sincronizadas em todos os clipes
- Estilo visual: fonte grande, destaque na palavra falada (karaokê style)
- Cor padrão configurável pela equipe
- Suporte a emojis automáticos nos momentos de pico

#### FR-06: Entrega no Google Drive
- Os clipes processados DEVEM ser enviados automaticamente para pasta no Google Drive
- Estrutura de pastas: `/HR-Troop-UX/{data}/{nome-do-streamer}/`
- Notificação via WhatsApp quando o lote estiver pronto

#### FR-07: Painel de Demandas
- Interface web simples para a equipe enviar demandas
- Campos: link do vídeo, nome do streamer, tipo (live/gravado), observações
- Status em tempo real: Aguardando → Processando → Pronto → Aprovado

---

## 4. Requisitos Não-Funcionais

| # | Requisito | Meta |
|---|-----------|------|
| NFR-01 | Velocidade de processamento | 1h de vídeo processado em ≤ 15min |
| NFR-02 | Disponibilidade | 99% uptime durante horário comercial |
| NFR-03 | Custo operacional | ≤ R$2/vídeo processado (APIs de IA) |
| NFR-04 | Segurança | Acesso restrito à equipe autenticada |
| NFR-05 | Escalabilidade | Suportar até 10 vídeos simultâneos no futuro |

---

## 5. Fora do Escopo (Fase 1)

- ❌ App mobile
- ❌ Edição manual dentro da ferramenta
- ❌ Publicação automática nas redes sociais
- ❌ Templates de marca avançados (Fase 2)
- ❌ Suporte a múltiplos idiomas
- ❌ Integração com Asana/Notion (Fase 2)
- ❌ Avatar IA / voice cloning

---

## 6. Arquitetura de Alto Nível

```
[ENTRADA]                    [PROCESSAMENTO]              [SAÍDA]
YouTube Link    ──┐
Google Drive    ──┤──→ Download ──→ Transcrição ──→ Análise IA ──→ Cortes ──→ Legendas ──→ Google Drive
Zoom/Meet       ──┘         (yt-dlp)    (Whisper)    (Claude/GPT)  (FFmpeg)   (FFmpeg)
                                                                                    ↓
                                                                              WhatsApp Notif
```

### Stack Tecnológico Sugerido
| Componente | Tecnologia |
|------------|-----------|
| Download de vídeo | `yt-dlp` |
| Transcrição | OpenAI Whisper |
| Análise de momentos virais | Claude API (Anthropic) |
| Corte de vídeo | FFmpeg |
| Backend | Node.js / Python |
| Interface web | Next.js |
| Armazenamento | Google Drive API |
| Notificações | WhatsApp Business API |

---

## 7. User Stories de Alto Nível (Épicos)

### Epic 1 — Ingestão e Processamento de Vídeo
> Como editor, quero enviar um link de live e receber clipes prontos automaticamente

### Epic 2 — Detecção de Momentos Virais de iGaming
> Como editor, quero que a IA identifique automaticamente os melhores momentos de crash/roleta

### Epic 3 — Legendas e Formatação
> Como editor, quero que os clipes já saiam com legendas animadas no estilo viral

### Epic 4 — Entrega e Notificação
> Como editor, quero receber os clipes no Google Drive e ser notificado no WhatsApp

### Epic 5 — Painel de Demandas
> Como equipe, quero um painel simples para enviar e acompanhar as demandas

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Qualidade de áudio ruim nas lives | Alta | Médio | Filtro de ruído pré-transcrição |
| Custo de API crescendo | Média | Alto | Cache de transcrições, processamento em batch |
| False positives na detecção viral | Média | Médio | Editor revisa antes de aprovar |
| Rate limits do YouTube | Baixa | Alto | Delay entre downloads, cookie auth |

---

## 9. Fases de Desenvolvimento

### Fase 1 — MVP (Este Sprint)
- [ ] Setup do projeto e infraestrutura
- [ ] Download de vídeo (YouTube + Google Drive)
- [ ] Transcrição com Whisper
- [ ] Detecção de momentos virais (Claude API)
- [ ] Corte automático com FFmpeg
- [ ] Legendas básicas
- [ ] Entrega no Google Drive
- [ ] Painel simples de demandas

### Fase 2 — Qualidade e Integrações
- [ ] Templates visuais de marca
- [ ] Integração com Asana/Notion
- [ ] Notificação WhatsApp
- [ ] Métricas de performance dos clipes

### Fase 3 — Escala
- [ ] Processamento paralelo
- [ ] Suporte a mais plataformas
- [ ] Dashboard de analytics

---

## 10. Aprovações

| Papel | Nome | Status |
|-------|------|--------|
| Product Manager | Morgan (@pm) | ✅ Aprovado |
| Equipe Audiovisual | — | Pendente |
| Arquiteto | Aria (@architect) | Pendente |

---

*Documento criado pelo agente @pm (Morgan) via HR The Troop UX — AIOS Framework*
