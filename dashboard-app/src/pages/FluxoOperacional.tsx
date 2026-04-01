import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type StageStatus = 'locked' | 'available' | 'active' | 'done'
type CriterionStatus = 'pass' | 'fail' | 'pending'

interface Criterion {
  text: string
  status: CriterionStatus
  failRoute?: string        // para onde vai se falhar
  suggestion?: string       // sugestão de correção
}

interface Stage {
  id: string
  name: string
  desc: string
  icon: string
  color: string
  status: StageStatus
  stat: string
  statLabel: string
  tip: string
  criteria?: Criterion[]
}

interface Module {
  id: string
  name: string
  subtitle: string
  accent: string
  stages: Stage[]
}

// ─── Workflow Data ────────────────────────────────────────────────────────────
const MODULES: Module[] = [
  {
    id: 'cortes',
    name: 'Módulo 1',
    subtitle: 'Produção — Cortes de Lives',
    accent: '#6366F1',
    stages: [
      {
        id: 'upload', name: 'Upload', desc: 'Envio do vídeo bruto',
        icon: '📥', color: '#6366F1', status: 'done',
        stat: '24 lives', statLabel: 'processadas',
        tip: 'Arraste a live (MP4/MOV) direto no inbox — drag & drop',
      },
      {
        id: 'processar', name: 'Processar', desc: 'IA detecta os momentos de ouro',
        icon: '⚙️', color: '#8B5CF6', status: 'active',
        stat: '~4 min', statLabel: 'tempo médio',
        tip: 'Whisper transcreve + scoring seleciona os melhores clips',
      },
      {
        id: 'exportar-1', name: 'Exportar', desc: 'Renderização FFmpeg em 9:16',
        icon: '📤', color: '#F59E0B', status: 'locked',
        stat: '12/h', statLabel: 'clipes por hora',
        tip: 'FFmpeg renderiza com legenda + hook + CTA + watermark',
      },
    ],
  },
  {
    id: 'criativos',
    name: 'Módulo 2',
    subtitle: 'Produção — Editor de Criativos',
    accent: '#EC4899',
    stages: [
      {
        id: 'template', name: 'Template', desc: 'Escolha do template visual',
        icon: '🎨', color: '#6366F1', status: 'available',
        stat: '12', statLabel: 'templates disponíveis',
        tip: '6 categorias: depoimento, prova social, ganho, storytelling...',
      },
      {
        id: 'editar', name: 'Editar', desc: 'Hook · Legenda · CTA · Expert',
        icon: '✏️', color: '#EC4899', status: 'locked',
        stat: '~3 min', statLabel: 'tempo de edição',
        tip: 'Personalize expert, posição de legenda, hook e CTA',
      },
      {
        id: 'variacoes', name: 'Variações', desc: 'Gerar versões A/B/C',
        icon: '🔀', color: '#10B981', status: 'locked',
        stat: '4×', statLabel: 'variações por criativo',
        tip: 'Diferentes hooks e cores para teste de performance',
      },
    ],
  },
  {
    id: 'controle',
    name: 'Controle de Qualidade',
    subtitle: 'Revisão → Qualidade → Finalizado',
    accent: '#10B981',
    stages: [
      {
        id: 'revisao',
        name: 'Revisão',
        desc: 'Agente valida estrutura e técnica',
        icon: '🔍',
        color: '#10B981',
        status: 'active',
        stat: '3 pendentes',
        statLabel: 'na fila',
        tip: 'Aprovado → Qualidade · Reprovado → Produção com motivo',
        criteria: [
          {
            text: 'Cortes sem partes mortas (>1s sem ação)',
            status: 'pass',
            failRoute: 'Produção',
            suggestion: 'Revisar ponto de corte — remover silêncio inicial/final',
          },
          {
            text: 'Legenda correta e legível (fonte, tamanho, contraste)',
            status: 'pass',
            failRoute: 'Produção',
            suggestion: 'Ajustar fonte para Montserrat Black + fundo semi-transparente',
          },
          {
            text: 'Estrutura presente: hook (0-3s) + desenvolvimento + CTA',
            status: 'fail',
            failRoute: 'Produção',
            suggestion: 'CTA ausente nos últimos 3s — adicionar chamada para ação',
          },
          {
            text: 'Sem erros técnicos (áudio, corte brusco, black frames)',
            status: 'pass',
            failRoute: 'Produção',
            suggestion: 'Verificar sincronização de áudio e transições',
          },
        ],
      },
      {
        id: 'qualidade',
        name: 'Qualidade',
        desc: 'Agente valida marca e performance',
        icon: '🎯',
        color: '#F59E0B',
        status: 'locked',
        stat: '—',
        statLabel: '—',
        tip: 'Aprovado → Finalizado · Reprovado → Revisão ou Produção',
        criteria: [
          {
            text: 'Identidade do expert correta (cor, estilo, watermark)',
            status: 'pending',
            failRoute: 'Revisão',
            suggestion: 'Verificar cor primária e posição do watermark do expert',
          },
          {
            text: 'Padrão visual consistente com template selecionado',
            status: 'pending',
            failRoute: 'Revisão',
            suggestion: 'Comparar com preview do template — verificar alinhamentos',
          },
          {
            text: 'Mensagem clara — audiência entende a proposta em 3s',
            status: 'pending',
            failRoute: 'Produção',
            suggestion: 'Simplificar hook — uma ideia por criativo, sem ambiguidade',
          },
          {
            text: 'Potencial de performance (hook forte, sem "dead air")',
            status: 'pending',
            failRoute: 'Produção',
            suggestion: 'Hook fraco — usar padrão FLASH ou ROCKET conforme operação',
          },
        ],
      },
      {
        id: 'finalizado',
        name: 'Finalizado',
        desc: 'Criativo aprovado para entrega',
        icon: '✅',
        color: '#10B981',
        status: 'locked',
        stat: '—',
        statLabel: '—',
        tip: 'Nenhum criativo chega aqui sem passar por Revisão e Qualidade',
      },
    ],
  },
]

// ─── Status Configs ───────────────────────────────────────────────────────────
const STATUS_META: Record<StageStatus, { label: string; dotColor: string; cardBorder: string; cardBg: string }> = {
  done:      { label: 'CONCLUÍDO',    dotColor: '#10B981', cardBorder: '#10B98138', cardBg: '#10B98108' },
  active:    { label: 'EM ANDAMENTO', dotColor: '#6366F1', cardBorder: '#6366F150', cardBg: '#6366F10C' },
  available: { label: 'DISPONÍVEL',   dotColor: '#F59E0B', cardBorder: '#F59E0B38', cardBg: '#F59E0B08' },
  locked:    { label: 'AGUARDANDO',   dotColor: '#1E1E32', cardBorder: 'var(--border)', cardBg: 'transparent' },
}

const CRITERION_COLOR: Record<CriterionStatus, string> = {
  pass: '#10B981', fail: '#EF4444', pending: '#334155',
}
const CRITERION_ICON: Record<CriterionStatus, string> = {
  pass: '✓', fail: '✗', pending: '○',
}

// ─── Game Character SVG ───────────────────────────────────────────────────────
function GameChar({ color, status }: { color: string; status: StageStatus }) {
  const locked = status === 'locked'
  const active = status === 'active'
  const done   = status === 'done'
  const c      = locked ? '#1E2D40' : color
  const body   = locked ? '#162030' : color + 'ee'
  const pupil  = locked ? '#2A3F55' : '#06060F'
  const shade  = locked ? 'rgba(0,0,0,0.08)' : color + '28'
  const mark   = done ? '✓' : active ? '▶' : status === 'available' ? '!' : '–'

  return (
    <svg viewBox="0 0 48 70" width={52} height={76} style={{ display: 'block', overflow: 'visible' }}>
      <ellipse cx="24" cy="68" rx="14" ry="3.5" fill={shade} />
      <rect x="13" y="46" width="8" height="20" rx="4" fill={c} />
      <rect x="27" y="46" width="8" height="20" rx="4" fill={c} />
      <ellipse cx="17" cy="66" rx="6" ry="3" fill={locked ? '#0D1520' : '#06060F'} />
      <ellipse cx="31" cy="66" rx="6" ry="3" fill={locked ? '#0D1520' : '#06060F'} />
      <rect x="9" y="25" width="30" height="23" rx="7" fill={body} />
      <rect x="9" y="39" width="30" height="4" rx="2" fill="rgba(0,0,0,0.28)" />
      <text x="24" y="36.5" textAnchor="middle" fontSize="10" fill="white" opacity={locked ? 0.25 : 1}>{mark}</text>
      <rect x="0" y="26" width="10" height="7" rx="3.5" fill={c} />
      <rect x="38" y="26" width="10" height="7" rx="3.5" fill={c} />
      <rect x="18" y="19" width="12" height="7" rx="3" fill={c} />
      <circle cx="24" cy="11" r="13" fill={c} />
      <rect x="11" y="13.5" width="26" height="3.5" rx="1.75" fill="rgba(0,0,0,0.32)" />
      <circle cx="18.5" cy="9" r="4" fill={locked ? '#1a2d40' : 'white'} />
      <circle cx="29.5" cy="9" r="4" fill={locked ? '#1a2d40' : 'white'} />
      <circle cx="19.3" cy="9" r="2.3" fill={pupil} />
      <circle cx="30.3" cy="9" r="2.3" fill={pupil} />
      {!locked && <><circle cx="20.3" cy="8" r="0.9" fill="white" /><circle cx="31.3" cy="8" r="0.9" fill="white" /></>}
      {locked    && <line x1="17" y1="15.5" x2="31" y2="15.5" stroke="#2A3F55" strokeWidth="2" strokeLinecap="round" />}
      {active    && <path d="M 15.5 15 Q 24 22 32.5 15" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {done      && <path d="M 16 15 Q 24 20.5 32 15" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
      {status === 'available' && <path d="M 16.5 15 Q 24 19.5 31.5 15" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
      {active && <circle cx="24" cy="11" r="16.5" fill="none" stroke={color} strokeWidth="2.5" opacity="0.28" className="animate-pulse" />}
    </svg>
  )
}

// ─── Stage Connector ──────────────────────────────────────────────────────────
function StageConnector({ active, color }: { active: boolean; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 32, flexShrink: 0 }}>
      <svg width={48} height={8} viewBox="0 0 48 8" style={{ overflow: 'visible' }}>
        <line x1="0" y1="4" x2="48" y2="4"
          stroke={active ? color + '60' : 'var(--border-light)'}
          strokeWidth="2" strokeDasharray="6 4"
        />
        {active && (
          <>
            <circle r="3" fill={color} opacity="0.8">
              <animateMotion dur="1.4s" repeatCount="indefinite" path="M0,4 L48,4" />
            </circle>
            <circle r="2.2" fill={color} opacity="0.5">
              <animateMotion dur="1.4s" begin="0.7s" repeatCount="indefinite" path="M0,4 L48,4" />
            </circle>
          </>
        )}
        <polygon points="40,0 48,4 40,8" fill={active ? color + '80' : 'var(--border-light)'} />
      </svg>
    </div>
  )
}

// ─── Criteria Panel ───────────────────────────────────────────────────────────
function CriteriaPanel({ criteria, color }: { criteria: Criterion[]; color: string }) {
  const failCount = criteria.filter(c => c.status === 'fail').length
  const passCount = criteria.filter(c => c.status === 'pass').length

  return (
    <div style={{
      marginTop: 10, padding: '10px 12px', borderRadius: 10,
      background: 'var(--bg-surface)', border: `1px solid ${color}25`,
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.08em' }}>CRITÉRIOS DE DECISÃO</span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
          {passCount} ok · {failCount} falha{failCount !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {criteria.map((c, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, flexShrink: 0, lineHeight: 1.4,
                color: CRITERION_COLOR[c.status],
              }}>
                {CRITERION_ICON[c.status]}
              </span>
              <span style={{
                fontSize: 11, lineHeight: 1.4,
                color: c.status === 'fail' ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: c.status === 'pass' ? 'none' : 'none',
              }}>
                {c.text}
              </span>
            </div>
            {c.status === 'fail' && c.suggestion && (
              <div style={{
                marginTop: 3, marginLeft: 18,
                padding: '4px 8px', borderRadius: 6,
                background: '#EF444410', border: '1px solid #EF444425',
              }}>
                <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 600, marginBottom: 1 }}>
                  ↩ Retorna para {c.failRoute}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {c.suggestion}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stage Card ───────────────────────────────────────────────────────────────
function StageCard({ stage, selected, onClick }: {
  stage: Stage
  selected: boolean
  onClick: () => void
}) {
  const [showCriteria, setShowCriteria] = useState(false)
  const meta   = STATUS_META[stage.status]
  const locked = stage.status === 'locked'
  const active = stage.status === 'active'
  const done   = stage.status === 'done'
  const hasCriteria = !!stage.criteria?.length
  const failCount = stage.criteria?.filter(c => c.status === 'fail').length ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: 170 }}>
      {done && (
        <div style={{ fontSize: 14, marginBottom: 2, animation: 'starSpin 3s linear infinite', display: 'inline-block' }}>✦</div>
      )}
      {!done && <div style={{ height: 20 }} />}

      <div style={{
        animation: active ? 'charBounce 1.4s ease-in-out infinite' : 'none',
        filter: locked ? 'brightness(0.6) saturate(0.2)' : 'none',
        position: 'relative', zIndex: 1,
      }}>
        <GameChar color={stage.color} status={stage.status} />
      </div>

      <div style={{ marginTop: -56, marginBottom: 14, position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: locked ? 'var(--bg-surface)' : stage.color + '22',
          border: `2px solid ${locked ? 'var(--border)' : stage.color + '55'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, filter: locked ? 'grayscale(1) opacity(0.35)' : 'none',
          position: 'absolute', top: -38, left: '50%', transform: 'translateX(-50%)',
        }}>
          {stage.icon}
        </div>
      </div>

      <div
        onClick={onClick}
        style={{
          width: '100%', borderRadius: 12, padding: '12px 12px',
          background: selected ? meta.cardBg : 'var(--bg-card)',
          border: `1.5px solid ${selected ? meta.cardBorder : failCount > 0 ? '#EF444430' : 'var(--border)'}`,
          cursor: locked ? 'default' : 'pointer',
          transition: 'all 0.2s',
          ...(active && { boxShadow: `0 0 16px 2px ${stage.color}18` }),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: meta.dotColor,
            animation: active ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: locked ? 'var(--text-muted)' : meta.dotColor }}>
            {meta.label}
          </span>
          {failCount > 0 && (
            <span style={{
              marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: '#EF4444',
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              <AlertTriangle size={9} /> {failCount}
            </span>
          )}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, color: locked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
          {stage.name}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4, opacity: locked ? 0.5 : 1 }}>
          {stage.desc}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 7, borderTop: '1px solid var(--border)',
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: locked ? 'var(--text-muted)' : stage.color }}>
              {locked ? '—' : stage.stat}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{locked ? '—' : stage.statLabel}</div>
          </div>

          {hasCriteria && !locked && (
            <button
              onClick={e => { e.stopPropagation(); setShowCriteria(v => !v) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 9, fontWeight: 700, color: stage.color,
                padding: '3px 7px', borderRadius: 20,
                background: stage.color + '15', border: `1px solid ${stage.color}30`,
              }}
            >
              Critérios {showCriteria ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
            </button>
          )}
        </div>

        {hasCriteria && showCriteria && stage.criteria && (
          <CriteriaPanel criteria={stage.criteria} color={stage.color} />
        )}
      </div>
    </div>
  )
}

// ─── Module Row ───────────────────────────────────────────────────────────────
function ModuleRow({ mod, selectedId, onSelect }: {
  mod: Module
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const doneCount  = mod.stages.filter(s => s.status === 'done').length
  const totalCount = mod.stages.length
  const isQC       = mod.id === 'controle'

  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${mod.accent}28`,
      background: isQC ? mod.accent + '06' : mod.accent + '05',
      padding: '18px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: mod.accent + '20', border: `1.5px solid ${mod.accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>
            {mod.id === 'cortes' ? '🎬' : mod.id === 'criativos' ? '✨' : '🛡️'}
          </div>
          <div>
            <div style={{ fontSize: 10, color: mod.accent, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isQC ? 'Controle' : mod.name}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{mod.subtitle}</div>
          </div>
          {isQC && (
            <div style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 9, fontWeight: 700,
              background: '#EF444415', border: '1px solid #EF444430', color: '#EF4444',
              marginLeft: 4,
            }}>
              1 falha detectada
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {doneCount}/{totalCount} etapas
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {mod.stages.map((s, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: s.status === 'done' ? mod.accent
                  : s.status === 'active' ? mod.accent + '55'
                  : 'var(--border-light)',
              }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
        {mod.stages.map((stage, i) => (
          <div key={stage.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 0 }}>
            <StageCard
              stage={stage}
              selected={selectedId === stage.id}
              onClick={() => onSelect(selectedId === stage.id ? null : stage.id)}
            />
            {i < mod.stages.length - 1 && (
              <StageConnector
                active={stage.status === 'done' || stage.status === 'active'}
                color={mod.stages[i + 1].color}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FluxoOperacional() {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)

  const allStages   = MODULES.flatMap(m => m.stages)
  const totalDone   = allStages.filter(s => s.status === 'done').length
  const totalStages = allStages.length
  const totalFails  = allStages.flatMap(s => s.criteria ?? []).filter(c => c.status === 'fail').length

  return (
    <div style={{
      height: '100%', overflow: 'auto',
      background: 'var(--bg-base)', padding: 24,
      display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderRadius: 14,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>Fluxo Operacional</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {totalDone}/{totalStages} etapas concluídas
            {totalFails > 0 && (
              <span style={{ color: '#EF4444', marginLeft: 10, fontWeight: 600 }}>
                · {totalFails} critério{totalFails > 1 ? 's' : ''} com falha — clique em "Critérios" para ver
              </span>
            )}
          </div>
        </div>
        <div style={{ width: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>Progresso geral</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#6366F1' }}>
              {Math.round((totalDone / totalStages) * 100)}%
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'var(--bg-surface)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${Math.round((totalDone / totalStages) * 100)}%`,
              background: 'linear-gradient(90deg, #6366F1, #10B981)',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Modules */}
      {MODULES.map(mod => (
        <ModuleRow
          key={mod.id}
          mod={mod}
          selectedId={selectedStageId}
          onSelect={setSelectedStageId}
        />
      ))}

      {/* Stats footer */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10,
        padding: '14px 18px', borderRadius: 14,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        {[
          { label: 'Lives processadas',  value: '24',   color: '#6366F1', icon: '🎬' },
          { label: 'Em revisão',         value: '3',    color: '#10B981', icon: '🔍' },
          { label: 'Reprovados hoje',    value: '1',    color: '#EF4444', icon: '❌' },
          { label: 'Taxa aprovação',     value: '94%',  color: '#10B981', icon: '✅' },
          { label: 'Criativos gerados',  value: '46',   color: '#EC4899', icon: '✨' },
          { label: 'Aprovados p/ entrega', value: '43', color: '#F59E0B', icon: '📤' },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '10px 12px', borderRadius: 10,
            background: 'var(--bg-surface)', border: '1px solid var(--border)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, marginBottom: 3 }}>{stat.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.3, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
