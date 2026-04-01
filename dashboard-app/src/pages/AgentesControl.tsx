import { useState, useEffect, useRef } from 'react'
import { X, Play, Pause, Copy, RefreshCw, AlertTriangle, Zap, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type AgentStatus = 'online' | 'busy' | 'idle' | 'error' | 'paused' | 'cloning'

interface DecisionCriterion {
  text: string
  failRoute: string
  suggestion: string
}

interface AgentInstance {
  instanceId: string
  agentId: string
  name: string
  tier: 0 | 1 | 2
  icon: string
  color: string
  pilar: string
  status: AgentStatus
  queue: number
  load: number
  processed: number
  errors: number
  rejected: number
  isClone: boolean
  parentInstanceId?: string
  paused: boolean
  skill: string
  criteria?: DecisionCriterion[]
}

interface LogEntry {
  ts: string
  agentName: string
  color: string
  icon: string
  msg: string
  level: 'info' | 'warn' | 'error' | 'success'
}

// ─── Skills (conteúdo real dos agentes) ──────────────────────────────────────
const SKILLS: Record<string, string> = {
  'aios-chief': `Você é o AIOS Chief — orquestrador central da Fábrica de Criativos BINGOBET.

LÓGICA DE DECISÃO:
- Vídeo longo (>5min) → Agent Screener
- Clip curto pronto → Agent Editor direto
- Texto/briefing → Agent Hooks primeiro

CONTEXTO DAS OPERAÇÕES:
- Reals Bet / Bingo Bet → estilo FLASH (10–15s, urgência, lucro no 1º frame)
- Aviator / Roleta (Expert) → estilo ROCKET (30–45s, autoridade, storytelling)

OUTPUT: Decisão de rota + metadados (operação, estilo, agente destino)`,

  'agent-screener': `Você é o Agent Screener — minerador de momentos de ouro em vídeos brutos.

PROCESSO:
1. Transcrição via Whisper com timestamps
2. Score de Viralidade (Vira Score 0–100) por segmento de 30s
3. Selecionar Top 10 clips

TRIGGER WORDS (alta prioridade):
"green" | "ganhei" | "olha" | "impossível" | "entrou" | "saque"
Qualquer R$ seguido de número

OUTPUT: clip_id, start/end, vira_score, trigger, hook_sugerido, operacao`,

  'agent-editor': `Você é o Agent Editor — a forja. Produz o MP4 final via FFmpeg.

PIPELINE:
1. Corte exato por timestamps
2. Formato 9:16 (1080x1920) com padding
3. Legendas Montserrat Black, MAIÚSCULAS, branco com destaque AMARELO NEON
4. Dicionário de Gatilhos: "green"→green_overlay, "saque"→money_rain, "all in"→allin_badge
5. Watermark da operação no canto superior direito
6. Música de fundo (BPM alto para FLASH, tensão para ROCKET)

OUTPUT: arquivo .mp4 pronto para Instagram/TikTok/Meta Ads`,

  'agent-hooks': `Você é o Agent Hooks — copywriter iGaming via Claude API.

PADRÕES FLASH (Reals Bet / Bingo Bet):
- "[Resultado] aconteceu [tempo] atrás. Você viu?"
- "Eles disseram que era impossível. [Número] depois..."
- "OLHA o que apareceu na minha tela agora."

PADRÕES ROCKET (Experts):
- "O erro que 90% comete no [jogo]."
- "Esse padrão me rendeu R$[X] essa semana. Vou te mostrar."
- "Eles não querem que você saiba disso."

OUTPUT: hook (3s) + CTA final para o Agent Editor`,

  'agent-variacoes': `Você é o Agent Variações — multiplicador de formatos.

MISSÃO: Gerar até 72 variações/dia do mesmo vídeo.

VARIAÇÕES POR EIXO:
- Formato: 9:16 (principal), 1:1 (feed), 16:9 (YouTube)
- Hook: 3 versões por clip
- Legenda: 2 estilos (karaokê / bloco)
- CTA: 2 variantes (direto / indireto)

REGRA: Nunca entregar menos de 4 variações por clip aprovado.`,

  'agent-analytics': `Você é o Agent Analytics — ciclo de aprendizado da fábrica.

LEITURA: ROAS, CTR, retenção por segundo, taxa de swipe-up

AÇÕES:
- CTR < 2% em hook → feedback ao Agent Hooks para revisar padrão
- Retenção cai antes de 5s → feedback ao Agent Editor (hook muito fraco)
- ROAS > 3x em variação específica → promover como preset padrão

OUTPUT: relatório semanal + atualizações de preset para Agent Editor`,

  'agent-strategist': `Você é o Agent Strategist — inteligência de mercado 24/7.

FONTES: PDFs de estratégia, dados de concorrentes, tendências iGaming

MISSÃO:
- RAG sobre biblioteca de estratégias
- Identificar novos padrões virais antes da concorrência
- Atualizar moldes de edição automaticamente no Agent Editor
- Alertar sobre mudanças de algoritmo das plataformas

SAÍDA: Briefings semanais + atualizações de preset automáticas`,

  'agent-revisao': `Você é o Agente de Revisão — primeira barreira de qualidade do sistema.

REGRA FUNDAMENTAL: Nenhum criativo avança sem passar por todos os critérios.

CRITÉRIOS DE VALIDAÇÃO (todos obrigatórios):
1. Cortes sem partes mortas (>1s sem ação ou fala relevante)
2. Legenda correta e legível (fonte, tamanho, contraste adequado)
3. Estrutura presente: hook (0-3s) + desenvolvimento + CTA (últimos 3s)
4. Sem erros técnicos: áudio sincronizado, sem corte brusco, sem black frames

LÓGICA DE DECISÃO:
- TODOS os critérios OK → envia para Agente de Qualidade
- QUALQUER falha → retorna para Produção com:
  [critério falho identificado] + [sugestão específica de correção]

FORMATO DE REPROVAÇÃO:
{
  "status": "reprovado",
  "criterio_falho": "[nome do critério]",
  "motivo": "[descrição do problema encontrado]",
  "sugestao": "[ação específica para corrigir]",
  "destino": "Produção"
}`,

  'agent-qualidade': `Você é o Agente de Qualidade — validação final antes da entrega.

REGRA FUNDAMENTAL: Apenas criativos que fortalecem a marca e têm potencial de performance são aprovados.

CRITÉRIOS DE VALIDAÇÃO (todos obrigatórios):
1. Identidade do expert correta (cor #hex, estilo visual, watermark posicionado)
2. Padrão visual consistente com o template selecionado
3. Mensagem clara — audiência entende a proposta em até 3 segundos
4. Potencial de performance: hook forte, sem "dead air", CTA direto

LÓGICA DE DECISÃO:
- TODOS aprovados → FINALIZADO (pronto para entrega)
- Erro de identidade ou visual → retorna para REVISÃO com motivo
- Erro de produção (hook fraco, estrutura quebrada) → retorna para PRODUÇÃO com motivo

FORMATO DE REPROVAÇÃO:
{
  "status": "reprovado",
  "criterio_falho": "[nome do critério]",
  "motivo": "[descrição do problema]",
  "sugestao": "[ação específica]",
  "destino": "Revisão | Produção"
}`,
}

// ─── Initial State ────────────────────────────────────────────────────────────
const CRITERIA: Record<string, DecisionCriterion[]> = {
  'agent-revisao': [
    { text: 'Cortes sem partes mortas (>1s sem ação)',       failRoute: 'Produção', suggestion: 'Revisar ponto de corte — remover silêncio inicial/final' },
    { text: 'Legenda correta e legível (fonte, contraste)',  failRoute: 'Produção', suggestion: 'Ajustar para Montserrat Black + fundo semi-transparente' },
    { text: 'Estrutura: hook (0-3s) + desenvolvimento + CTA',failRoute: 'Produção', suggestion: 'CTA ausente nos últimos 3s — adicionar chamada para ação' },
    { text: 'Sem erros técnicos (áudio, black frames)',      failRoute: 'Produção', suggestion: 'Verificar sincronização de áudio e transições' },
  ],
  'agent-qualidade': [
    { text: 'Identidade do expert (cor, estilo, watermark)', failRoute: 'Revisão',  suggestion: 'Verificar cor primária e posição do watermark do expert' },
    { text: 'Padrão visual consistente com template',        failRoute: 'Revisão',  suggestion: 'Comparar com preview do template — verificar alinhamentos' },
    { text: 'Mensagem clara em até 3 segundos',              failRoute: 'Produção', suggestion: 'Simplificar hook — uma ideia por criativo, sem ambiguidade' },
    { text: 'Potencial de performance (hook forte, sem dead air)', failRoute: 'Produção', suggestion: 'Hook fraco — usar padrão FLASH ou ROCKET conforme operação' },
  ],
}

function makeInstance(
  agentId: string, name: string, tier: 0|1|2,
  icon: string, color: string, pilar: string,
  load: number, queue: number, processed: number, status: AgentStatus,
  rejected = 0,
): AgentInstance {
  return {
    instanceId: agentId,
    agentId, name, tier, icon, color, pilar,
    status, queue, load, processed, errors: 0, rejected,
    isClone: false, paused: false,
    skill: SKILLS[agentId] ?? '',
    criteria: CRITERIA[agentId],
  }
}

const INITIAL_AGENTS: AgentInstance[] = [
  makeInstance('aios-chief',       'AIOS Chief',  0, '🧠', '#6366F1', 'Automation', 34, 2, 142, 'online'),
  makeInstance('agent-screener',   'Screener',    1, '🔊', '#8B5CF6', 'Live-IA',    72, 5, 89,  'busy'),
  makeInstance('agent-editor',     'Editor',      1, '✂️', '#EC4899', 'Studio-IA',  91, 8, 204, 'busy'),
  makeInstance('agent-hooks',      'Hooks',       1, '🎯', '#F59E0B', 'Studio-IA',   0, 0, 67,  'idle'),
  makeInstance('agent-variacoes',  'Variações',   2, '📐', '#10B981', 'Studio-IA',  48, 3, 312, 'online'),
  makeInstance('agent-analytics',  'Analytics',   2, '📊', '#06B6D4', 'Cofre',       5, 0, 28,  'idle'),
  makeInstance('agent-strategist', 'Strategist',  2, '🧬', '#F97316', 'Cérebro',    12, 1, 15,  'online'),
  makeInstance('agent-revisao',    'Revisão',     1, '🔍', '#10B981', 'Controle',   58, 3, 45,  'busy', 4),
  makeInstance('agent-qualidade',  'Qualidade',   1, '🎯', '#F59E0B', 'Controle',   30, 1, 38,  'online', 1),
]

function tsNow() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const STATUS_COLOR: Record<AgentStatus, string> = {
  online:  '#10B981',
  busy:    '#F59E0B',
  idle:    '#334155',
  error:   '#EF4444',
  paused:  '#475569',
  cloning: '#6366F1',
}

const STATUS_LABEL: Record<AgentStatus, string> = {
  online:  'ONLINE',
  busy:    'OCUPADO',
  idle:    'AGUARDANDO',
  error:   'ERRO',
  paused:  'PAUSADO',
  cloning: 'CLONANDO',
}

// ─── Load Bar ─────────────────────────────────────────────────────────────────
function LoadBar({ value, color }: { value: number; color: string }) {
  const barColor = value > 85 ? '#EF4444' : value > 60 ? '#F59E0B' : color
  return (
    <div style={{ height: 4, background: 'var(--bg-surface)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${value}%`, borderRadius: 2,
        background: barColor, transition: 'width 0.8s ease, background 0.3s',
        boxShadow: value > 85 ? `0 0 6px ${barColor}80` : 'none',
      }} />
    </div>
  )
}

// ─── Agent Card ───────────────────────────────────────────────────────────────
function AgentCard({ agent, onEditSkill, onTogglePause, onForceClone, onResetError, isClone }: {
  agent: AgentInstance
  onEditSkill: () => void
  onTogglePause: () => void
  onForceClone: () => void
  onResetError: () => void
  isClone?: boolean
}) {
  const [showCriteria, setShowCriteria] = useState(false)
  const sc   = STATUS_COLOR[agent.status]
  const busy = agent.status === 'busy' || agent.status === 'online'
  const hasCriteria = !!agent.criteria?.length

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${agent.status === 'error' ? '#EF444440' : agent.load > 85 ? '#EF444425' : 'var(--border)'}`,
      borderRadius: 14, padding: '14px 16px',
      width: isClone ? 200 : 224,
      flexShrink: 0,
      opacity: agent.status === 'paused' ? 0.65 : 1,
      transition: 'all 0.3s',
      ...(agent.status === 'error' && { boxShadow: '0 0 12px rgba(239,68,68,0.15)' }),
      ...(agent.load > 85 && agent.status !== 'paused' && { boxShadow: '0 0 12px rgba(239,68,68,0.1)' }),
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: agent.color + '20', border: `1px solid ${agent.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>
            {agent.icon}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              {agent.name}
              {isClone && <span style={{ fontSize: 9, color: agent.color, marginLeft: 4, fontWeight: 600 }}>CLONE</span>}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{agent.pilar}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: sc,
            animation: agent.status === 'busy' ? 'pulse 1.5s infinite' : 'none',
          }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: sc, letterSpacing: '0.06em' }}>
            {STATUS_LABEL[agent.status]}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
        {[
          { label: 'Fila',        value: agent.queue },
          { label: 'Processados', value: agent.processed },
          { label: 'Reprovados',  value: agent.rejected,  alert: agent.rejected > 0, alertColor: '#F59E0B' },
          { label: 'Erros',       value: agent.errors,    alert: agent.errors > 0,   alertColor: '#EF4444' },
        ].map(m => (
          <div key={m.label} style={{
            padding: '5px 8px', borderRadius: 7,
            background: 'var(--bg-surface)',
            border: m.alert ? `1px solid ${m.alertColor}30` : '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: m.alert ? m.alertColor : busy ? agent.color : 'var(--text-primary)' }}>
              {m.value}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{m.label}</div>
          </div>
        ))}
        <div style={{ padding: '5px 8px', borderRadius: 7, background: 'var(--bg-surface)', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Carga</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: agent.load > 85 ? '#EF4444' : agent.load > 60 ? '#F59E0B' : 'var(--text-primary)' }}>
              {agent.load}%
            </span>
          </div>
          <LoadBar value={agent.load} color={agent.color} />
          {agent.load > 85 && (
            <div style={{ fontSize: 9, color: '#EF4444', marginTop: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <AlertTriangle size={8} /> Clone recomendado
            </div>
          )}
        </div>
      </div>

      {/* Criteria toggle (apenas agentes de controle) */}
      {hasCriteria && (
        <button
          onClick={() => setShowCriteria(v => !v)}
          style={{
            width: '100%', padding: '6px 10px', borderRadius: 8, marginBottom: 8,
            background: showCriteria ? agent.color + '15' : 'var(--bg-surface)',
            border: `1px solid ${showCriteria ? agent.color + '40' : 'var(--border)'}`,
            color: showCriteria ? agent.color : 'var(--text-secondary)',
            fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span>Critérios de decisão</span>
          {showCriteria ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      )}

      {/* Criteria list */}
      {hasCriteria && showCriteria && agent.criteria && (
        <div style={{
          marginBottom: 8, padding: '8px 10px', borderRadius: 8,
          background: 'var(--bg-surface)', border: `1px solid ${agent.color}20`,
          display: 'flex', flexDirection: 'column', gap: 6,
          animation: 'fadeIn 0.15s ease-out',
        }}>
          {agent.criteria.map((c, i) => (
            <div key={i} style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <div style={{ display: 'flex', gap: 5, alignItems: 'flex-start' }}>
                <span style={{ color: agent.color, flexShrink: 0, fontWeight: 700 }}>·</span>
                <span>{c.text}</span>
              </div>
              <div style={{ marginLeft: 10, fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>
                Falha → {c.failRoute}: {c.suggestion}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 5 }}>
        <button onClick={onEditSkill} style={{
          flex: 1, padding: '6px 0', borderRadius: 7, fontSize: 11, fontWeight: 600,
          background: agent.color + '18', border: `1px solid ${agent.color}30`, color: agent.color,
        }}>
          ⚙ Skill
        </button>
        <button onClick={onTogglePause} title={agent.paused ? 'Retomar' : 'Pausar'} style={{
          width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', flexShrink: 0,
        }}>
          {agent.paused ? <Play size={11} /> : <Pause size={11} />}
        </button>
        {!isClone && (
          <button onClick={onForceClone} title="Forçar clone" style={{
            width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', flexShrink: 0,
          }}>
            <Copy size={11} />
          </button>
        )}
        {agent.errors > 0 && (
          <button onClick={onResetError} title="Resetar erros" style={{
            width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444', flexShrink: 0,
          }}>
            <RefreshCw size={11} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Skill Editor Modal ───────────────────────────────────────────────────────
function SkillModal({ agent, onSave, onClose }: {
  agent: AgentInstance
  onSave: (skill: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(agent.skill)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: 560, background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 18, display: 'flex', flexDirection: 'column',
        animation: 'fadeIn 0.15s ease-out', maxHeight: '80vh',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: agent.color + '20', border: `1px solid ${agent.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            }}>
              {agent.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Skill — {agent.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Edite o prompt do agente. Salvo, entra em vigor na próxima tarefa.
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            style={{
              width: '100%', minHeight: 280, padding: '12px 14px',
              background: 'var(--bg-surface)', border: `1px solid ${agent.color}30`,
              borderRadius: 10, color: 'var(--text-primary)', fontSize: 12,
              lineHeight: 1.7, resize: 'vertical', outline: 'none',
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            }}
          />
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            {draft.length} caracteres · {draft.split('\n').length} linhas
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13,
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}>
            Cancelar
          </button>
          <button
            onClick={() => { onSave(draft); onClose() }}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: agent.color, border: 'none', color: '#fff',
            }}
          >
            Salvar skill
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tier Section ─────────────────────────────────────────────────────────────
function TierSection({ tier, label, agents, clones, onAction }: {
  tier: number
  label: string
  agents: AgentInstance[]
  clones: AgentInstance[]
  onAction: (action: 'skill' | 'pause' | 'clone' | 'reset', instanceId: string) => void
}) {
  const tierColors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B']
  const c = label === 'Controle de Qualidade' ? '#10B981' : tierColors[tier] ?? '#6366F1'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: c }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: c, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Tier {tier} — {label}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {agents.map(agent => {
          const agentClones = clones.filter(c => c.parentInstanceId === agent.instanceId)
          return (
            <div key={agent.instanceId} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <AgentCard
                agent={agent}
                onEditSkill={() => onAction('skill', agent.instanceId)}
                onTogglePause={() => onAction('pause', agent.instanceId)}
                onForceClone={() => onAction('clone', agent.instanceId)}
                onResetError={() => onAction('reset', agent.instanceId)}
              />
              {/* Clones */}
              {agentClones.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
                  <div style={{ fontSize: 9, color: agent.color, fontWeight: 700, paddingLeft: 2 }}>
                    {agentClones.length} clone{agentClones.length > 1 ? 's' : ''} ativos
                  </div>
                  {agentClones.map(clone => (
                    <AgentCard
                      key={clone.instanceId}
                      agent={clone}
                      isClone
                      onEditSkill={() => onAction('skill', clone.instanceId)}
                      onTogglePause={() => onAction('pause', clone.instanceId)}
                      onForceClone={() => {}}
                      onResetError={() => onAction('reset', clone.instanceId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AgentesControl() {
  const [agents, setAgents]         = useState<AgentInstance[]>(INITIAL_AGENTS)
  const [clones, setClones]         = useState<AgentInstance[]>([])
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [log, setLog]               = useState<LogEntry[]>([
    { ts: tsNow(), agentName: 'Sistema', color: '#6366F1', icon: '🧠', msg: 'Central de agentes inicializada.', level: 'info' },
    { ts: tsNow(), agentName: 'Editor', color: '#EC4899', icon: '✂️', msg: 'Carga em 91% — monitorando fila.', level: 'warn' },
  ])
  const cloneCounterRef = useRef(1)
  const logRef = useRef<HTMLDivElement>(null)

  function addLog(agentName: string, color: string, icon: string, msg: string, level: LogEntry['level'] = 'info') {
    setLog(prev => [{ ts: tsNow(), agentName, color, icon, msg, level }, ...prev].slice(0, 60))
  }

  // ── Rejection simulation ──
  useEffect(() => {
    const REJECTION_EVENTS = [
      { agent: 'agent-revisao', icon: '🔍', color: '#10B981', msg: 'Reprovado: CTA ausente nos últimos 3s — retorna para Produção' },
      { agent: 'agent-revisao', icon: '🔍', color: '#10B981', msg: 'Reprovado: corte brusco detectado em 00:14:22 — retorna para Produção' },
      { agent: 'agent-qualidade', icon: '🎯', color: '#F59E0B', msg: 'Reprovado: watermark fora de posição — retorna para Revisão' },
      { agent: 'agent-qualidade', icon: '🎯', color: '#F59E0B', msg: 'Reprovado: hook fraco — não para o scroll em 3s — retorna para Produção' },
      { agent: 'agent-revisao', icon: '🔍', color: '#10B981', msg: 'Aprovado: todos os critérios validados — enviado para Qualidade' },
    ]
    const interval = setInterval(() => {
      if (Math.random() < 0.25) {
        const ev = REJECTION_EVENTS[Math.floor(Math.random() * REJECTION_EVENTS.length)]
        addLog(ev.agent === 'agent-revisao' ? 'Revisão' : 'Qualidade', ev.color, ev.icon, ev.msg,
          ev.msg.startsWith('Aprovado') ? 'success' : 'warn')
        if (!ev.msg.startsWith('Aprovado')) {
          setAgents(prev => prev.map(a =>
            a.instanceId === ev.agent ? { ...a, rejected: a.rejected + 1 } : a
          ))
        }
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // ── Simulation tick ──
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => {
        if (a.paused) return a
        const loadDelta = (Math.random() - 0.45) * 12
        const newLoad   = Math.max(0, Math.min(100, a.load + loadDelta))
        const newQueue  = Math.max(0, a.queue + Math.floor((Math.random() - 0.4) * 3))
        const newProc   = a.processed + (a.status === 'busy' ? Math.floor(Math.random() * 2) : 0)

        let newStatus: AgentStatus = a.status
        if (newLoad > 75) newStatus = 'busy'
        else if (newLoad < 20 && newQueue === 0) newStatus = 'idle'
        else if (newLoad > 5) newStatus = 'online'

        return { ...a, load: Math.round(newLoad), queue: newQueue, processed: newProc, status: newStatus }
      }))

      setClones(prev => prev.map(c => {
        if (c.paused) return c
        const loadDelta = (Math.random() - 0.5) * 10
        const newLoad   = Math.max(0, Math.min(90, c.load + loadDelta))
        return { ...c, load: Math.round(newLoad) }
      }))
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  // ── Auto-clone when load > 85% ──
  useEffect(() => {
    agents.forEach(agent => {
      if (agent.load > 85 && !agent.paused && !agent.isClone) {
        const alreadyHasClone = clones.some(c => c.parentInstanceId === agent.instanceId)
        if (!alreadyHasClone) {
          const cloneId = `${agent.instanceId}__clone_${cloneCounterRef.current++}`
          const newClone: AgentInstance = {
            ...agent,
            instanceId: cloneId,
            isClone: true,
            parentInstanceId: agent.instanceId,
            load: 20,
            queue: Math.floor(agent.queue / 2),
            processed: 0,
            errors: 0,
            status: 'busy',
          }
          setClones(prev => [...prev, newClone])
          addLog(agent.name, agent.color, agent.icon,
            `Clone spawned automaticamente — carga atingiu ${agent.load}%`, 'warn')
        }
      }
    })
  }, [agents])

  // ── Auto-destroy idle clones ──
  useEffect(() => {
    const toRemove = clones.filter(c => c.load < 15 && c.queue === 0)
    if (toRemove.length > 0) {
      toRemove.forEach(c => addLog(c.name, c.color, c.icon, 'Clone encerrado — carga normalizada.', 'info'))
      setClones(prev => prev.filter(c => !toRemove.find(r => r.instanceId === c.instanceId)))
    }
  }, [clones])

  function handleAction(action: 'skill' | 'pause' | 'clone' | 'reset', instanceId: string) {
    const all = [...agents, ...clones]
    const target = all.find(a => a.instanceId === instanceId)
    if (!target) return

    if (action === 'skill') {
      setEditingId(instanceId)
    }

    if (action === 'pause') {
      const isPaused = !target.paused
      const updater = (a: AgentInstance) =>
        a.instanceId === instanceId ? { ...a, paused: isPaused, status: isPaused ? 'paused' : 'idle' as AgentStatus } : a

      if (agents.find(a => a.instanceId === instanceId)) setAgents(prev => prev.map(updater))
      else setClones(prev => prev.map(updater))
      addLog(target.name, target.color, target.icon, isPaused ? 'Agente pausado manualmente.' : 'Agente retomado.', 'info')
    }

    if (action === 'clone') {
      const cloneId = `${instanceId}__clone_${cloneCounterRef.current++}`
      const newClone: AgentInstance = {
        ...target, instanceId: cloneId, isClone: true,
        parentInstanceId: instanceId, load: 10, queue: 0, processed: 0, errors: 0, status: 'idle',
      }
      setClones(prev => [...prev, newClone])
      addLog(target.name, target.color, target.icon, 'Clone criado manualmente.', 'info')
    }

    if (action === 'reset') {
      const updater = (a: AgentInstance) =>
        a.instanceId === instanceId ? { ...a, errors: 0, status: 'idle' as AgentStatus } : a
      if (agents.find(a => a.instanceId === instanceId)) setAgents(prev => prev.map(updater))
      else setClones(prev => prev.map(updater))
      addLog(target.name, target.color, target.icon, 'Erros resetados — agente reiniciado.', 'success')
    }
  }

  function handleSaveSkill(skill: string) {
    const all = [...agents, ...clones]
    const target = all.find(a => a.instanceId === editingId)
    if (!target) return
    const updater = (a: AgentInstance) => a.instanceId === editingId ? { ...a, skill } : a
    setAgents(prev => prev.map(updater))
    setClones(prev => prev.map(updater))
    addLog(target.name, target.color, target.icon, 'Skill atualizada — entra em vigor na próxima tarefa.', 'success')
  }

  const editingAgent = [...agents, ...clones].find(a => a.instanceId === editingId)

  // Summary stats
  const totalActive  = [...agents, ...clones].filter(a => !a.paused && a.status !== 'idle').length
  const totalBusy    = [...agents, ...clones].filter(a => a.status === 'busy').length
  const totalErrors  = [...agents, ...clones].reduce((s, a) => s + a.errors, 0)
  const totalClones  = clones.length
  const avgLoad      = Math.round([...agents, ...clones].reduce((s, a) => s + a.load, 0) / (agents.length + clones.length))

  const tiers: { tier: 0|1|2; label: string; agents: AgentInstance[]; filterFn?: (a: AgentInstance) => boolean }[] = [
    { tier: 0, label: 'Comando Central',       agents: agents.filter(a => a.tier === 0) },
    { tier: 1, label: 'Produção',              agents: agents.filter(a => a.tier === 1 && a.pilar !== 'Controle') },
    { tier: 2, label: 'Escala & Inteligência', agents: agents.filter(a => a.tier === 2) },
    { tier: 1, label: 'Controle de Qualidade', agents: agents.filter(a => a.pilar === 'Controle') },
  ]

  const LOG_COLORS: Record<LogEntry['level'], string> = {
    info: 'var(--text-secondary)', warn: '#F59E0B', error: '#EF4444', success: '#10B981',
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 24px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 1 }}>Central de Agentes</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            bingo-aios · {agents.length + clones.length} instâncias · Clique em ⚙ Skill para editar qualquer agente
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Ativos',     value: totalActive,  color: '#10B981' },
            { label: 'Ocupados',   value: totalBusy,    color: '#F59E0B' },
            { label: 'Clones',     value: totalClones,  color: '#6366F1' },
            { label: 'Erros',      value: totalErrors,  color: '#EF4444' },
            { label: 'Carga média',value: `${avgLoad}%`,color: avgLoad > 75 ? '#EF4444' : 'var(--text-primary)' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '6px 14px', borderRadius: 10, textAlign: 'center',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Agents area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {tiers.map(t => (
            <TierSection
              key={t.tier}
              tier={t.tier}
              label={t.label}
              agents={t.agents}
              clones={clones.filter(c => t.agents.some(a => a.instanceId === c.parentInstanceId))}
              onAction={handleAction}
            />
          ))}
        </div>

        {/* ── Event Log ── */}
        <div style={{
          height: 160, borderTop: '1px solid var(--border)', flexShrink: 0,
          background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '8px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Zap size={11} color="#6366F1" />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6366F1' }}>
              LOG DE EVENTOS
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
              {log.length} entradas
            </span>
          </div>
          <div ref={logRef} style={{ flex: 1, overflow: 'auto', padding: '6px 16px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {log.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>
                  {entry.ts}
                </span>
                <span style={{ fontSize: 11, flexShrink: 0 }}>{entry.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: entry.color, flexShrink: 0, minWidth: 70 }}>
                  [{entry.agentName}]
                </span>
                <span style={{ fontSize: 11, color: LOG_COLORS[entry.level] }}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Skill Modal ── */}
      {editingAgent && (
        <SkillModal
          agent={editingAgent}
          onSave={handleSaveSkill}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}
