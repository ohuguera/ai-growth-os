import { useEffect, useState } from 'react'
import {
  LayoutGrid, List, Search, CheckSquare, Filter,
  ArrowUpDown, Download, X, Sliders, Calendar, Zap, Sparkles, Loader2,
} from 'lucide-react'
import { getJob, downloadUrl } from '../services/api'
import { EXPERTS } from '../data/experts'
import { gerarHook, gerarLegenda, gerarTituloViral } from '../services/skillsService'
import type { ExpertId, Clip, Moment, Page } from '../types'

interface Props {
  jobId: string
  expertId?: ExpertId
  liveTitle: string
  navigate: (p: Page) => void
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function fmtDuration(start: number, end: number): string {
  const d = Math.round(end - start)
  const m = Math.floor(d / 60)
  const s = d % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// Score já vem 0-99 do backend
function displayScore(score: number): number {
  return Math.min(99, Math.round(score))
}

function scoreColor(score: number): string {
  if (score >= 75) return '#22C55E'
  if (score >= 55) return '#84CC16'
  if (score >= 35) return '#F59E0B'
  return '#64748B'
}

export default function Resultados({ jobId, expertId, liveTitle, navigate }: Props) {
  const expert = expertId ? EXPERTS[expertId] : null
  const accentColor = expert?.color || '#6366F1'

  const [clips, setClips] = useState<Clip[]>([])
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [showHook, setShowHook] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selecting, setSelecting] = useState(false)
  const [skillResults, setSkillResults] = useState<Record<string, { hook?: string; legenda?: string; titulo?: string }>>({})
  const [skillLoading, setSkillLoading] = useState<Record<string, string>>({}) // clipId → skill

  useEffect(() => {
    getJob(jobId)
      .then(job => { setClips(job.clips || []); setMoments(job.moments || []) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId])

  function getMoment(clip: Clip): Moment | undefined {
    return moments.find(m => Math.abs(m.start - clip.start) < 1)
  }

  const doneClips = clips
    .filter(c => c.status === 'done')
    .sort((a, b) => b.score - a.score)

  const displayed = search
    ? doneClips.filter(c => {
        const m = getMoment(c)
        return m?.text?.toLowerCase().includes(search.toLowerCase()) ||
          m?.natural_hook?.toLowerCase().includes(search.toLowerCase())
      })
    : doneClips

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function runSkill(clipId: string, skillName: 'hook' | 'legenda' | 'titulo', context: string) {
    setSkillLoading(prev => ({ ...prev, [clipId]: skillName }))
    try {
      let output = ''
      if (skillName === 'hook') output = (await gerarHook(context)).output
      else if (skillName === 'legenda') output = (await gerarLegenda(context)).output
      else if (skillName === 'titulo') output = (await gerarTituloViral(context)).output
      setSkillResults(prev => ({
        ...prev,
        [clipId]: { ...prev[clipId], [skillName]: output },
      }))
    } catch (e) {
      console.error(e)
    } finally {
      setSkillLoading(prev => { const n = { ...prev }; delete n[clipId]; return n })
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#080808' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        height: 48, borderBottom: '1px solid #1a1a1a', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px',
        background: '#0a0a0a',
      }}>
        {/* View toggle */}
        <div style={{ display: 'flex', gap: 2, marginRight: 8 }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              width: 28, height: 28, borderRadius: 5, border: 'none',
              background: viewMode === 'grid' ? '#1a1a1a' : 'transparent',
              color: viewMode === 'grid' ? '#ccc' : '#444',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              width: 28, height: 28, borderRadius: 5, border: 'none',
              background: viewMode === 'list' ? '#1a1a1a' : 'transparent',
              color: viewMode === 'list' ? '#ccc' : '#444',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <List size={14} />
          </button>
        </div>

        {/* Breadcrumb */}
        <div style={{
          fontSize: 13, fontWeight: 600, color: '#888',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: 260, cursor: 'pointer',
        }}
          onClick={() => navigate({ name: 'inbox' })}
        >
          {liveTitle}
        </div>

        {/* Search */}
        <div style={{
          flex: 1, maxWidth: 380, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: 8, padding: '6px 12px',
        }}>
          <Search size={13} style={{ color: '#444', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Encontrar palavras-chave ou momentos..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#ccc', fontSize: 12,
            }}
          />
          <span style={{ fontSize: 10, color: '#333', flexShrink: 0 }}>⌘K</span>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => setSelecting(!selecting)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: selecting ? '#1a1a2e' : '#1a1a1a',
              border: selecting ? '1px solid #6366F160' : '1px solid #2a2a2a',
              color: selecting ? '#818CF8' : '#888', cursor: 'pointer',
            }}
          >
            <CheckSquare size={13} /> Selecionar
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 6, fontSize: 12,
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            color: '#888', cursor: 'pointer',
          }}>
            <Filter size={13} /> Filtrar
          </button>
          <button style={{
            width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#666', cursor: 'pointer',
          }}>
            <ArrowUpDown size={13} />
          </button>
          <button style={{
            width: 30, height: 30, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#666', cursor: 'pointer',
          }}>
            <Download size={13} />
          </button>
          <div style={{ fontSize: 16, color: '#333', cursor: 'pointer' }}>···</div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px' }}>

        {/* Prompt de análise (como o Opus Clip mostra no topo) */}
        {doneClips.length > 0 && (
          <div style={{
            fontSize: 12, color: '#555', padding: '12px 0',
            borderBottom: '1px solid #141414',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            Crie clips de TODOS os momentos em que aparecem números, valores de ganho, percentagens de lucro ou qualquer menção a dinheiro ganho...{' '}
            <span style={{ color: '#6366F1' }}>({doneClips.length})</span>
          </div>
        )}

        {/* ── GANCHO AUTOMÁTICO BANNER ── */}
        {showHook && !loading && doneClips.length > 0 && (
          <div style={{
            background: '#111', border: '1px solid #222',
            borderRadius: 12, padding: '16px 20px', margin: '16px 0',
            display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#ddd', marginBottom: 6 }}>
                Gancho automático
              </div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                Um gancho de texto foi adicionado aos primeiros 5 segundos dos seus {Math.min(10, doneClips.length)} vídeos mais bem classificados.
                Se você não precisar dele, pode clicar em 'Desativar'. Se quiser refiná-lo ainda mais, vá para "Editar Clipe".
              </div>
            </div>
            <button style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: 'transparent', border: '1px solid #333',
              color: '#888', cursor: 'pointer', flexShrink: 0,
            }}>
              Desativar
            </button>
            <button
              onClick={() => setShowHook(false)}
              style={{ position: 'absolute', top: 12, right: 12, color: '#444', cursor: 'pointer', padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, paddingTop: 20 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '9/16', borderRadius: 10 }} />
                <div className="skeleton" style={{ height: 28, marginTop: 8, borderRadius: 6, width: 48 }} />
                <div className="skeleton" style={{ height: 12, marginTop: 6, borderRadius: 4 }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && doneClips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Zap size={36} style={{ color: '#222', marginBottom: 16 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#555', marginBottom: 8 }}>
              Nenhum clipe gerado ainda
            </div>
            <div style={{ fontSize: 13, color: '#333' }}>
              O backend pode estar processando — aguarde alguns instantes
            </div>
          </div>
        )}

        {/* ── GRID DE CLIPS (Opus Clip style) ── */}
        {!loading && displayed.length > 0 && viewMode === 'grid' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: 16, paddingTop: 16, paddingBottom: 32,
          }}>
            {displayed.map((clip, idx) => {
              const moment = getMoment(clip)
              const ds = displayScore(clip.score)
              const sColor = scoreColor(clip.score)
              const isSelected = selected.has(clip.id)
              const hookText = moment?.natural_hook || moment?.text?.slice(0, 60)

              return (
                <div key={clip.id} style={{ position: 'relative' }}>
                  {/* 9:16 Thumbnail */}
                  <div
                    onClick={() => selecting ? toggleSelect(clip.id) : undefined}
                    style={{
                      aspectRatio: '9/16', borderRadius: 10, overflow: 'hidden',
                      background: '#111', border: isSelected ? `2px solid ${accentColor}` : '1px solid #1e1e1e',
                      position: 'relative', cursor: selecting ? 'pointer' : 'default',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {/* Simula vídeo escuro */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `radial-gradient(ellipse at 50% 40%, ${accentColor}18 0%, transparent 65%)`,
                    }} />

                    {/* Hook overlay (topo) */}
                    {hookText && (
                      <div style={{
                        position: 'absolute', top: 8, left: 6, right: 6,
                        background: 'rgba(255,255,255,0.92)',
                        borderRadius: 5, padding: '4px 7px',
                        fontSize: 8, fontWeight: 700, color: '#111', lineHeight: 1.3,
                        textAlign: 'center',
                      }}>
                        {hookText.slice(0, 50)}{hookText.length > 50 ? '...' : ''}
                      </div>
                    )}

                    {/* Timecode */}
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      background: 'rgba(0,0,0,0.75)',
                      borderRadius: 4, padding: '2px 5px',
                      fontSize: 8, fontWeight: 600, color: '#fff',
                    }}>
                      {fmtTime(clip.start)} | {fmtDuration(clip.start, clip.end)}
                    </div>

                    {/* Caption simulado no centro */}
                    <div style={{
                      position: 'absolute', top: '45%',
                      left: 6, right: 6,
                      background: 'rgba(0,0,0,0.7)',
                      borderRadius: 4, padding: '3px 6px',
                      fontSize: 7, textAlign: 'center', color: '#fff',
                    }}>
                      {moment?.text?.slice(0, 40) || 'Legenda automática gerada por IA...'}
                    </div>

                    {/* Viral snippet badge */}
                    {clip.score >= 8.5 && (
                      <div style={{
                        position: 'absolute', bottom: 8, left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#6366F120', border: '1px solid #6366F150',
                        borderRadius: 4, padding: '2px 8px',
                        fontSize: 8, fontWeight: 700, color: '#818CF8', whiteSpace: 'nowrap',
                      }}>
                        Viral snippet
                      </div>
                    )}

                    {/* Seleção check */}
                    {selecting && (
                      <div style={{
                        position: 'absolute', top: 6, left: 6,
                        width: 18, height: 18, borderRadius: 4,
                        background: isSelected ? accentColor : 'rgba(0,0,0,0.5)',
                        border: `1px solid ${isSelected ? accentColor : '#555'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 10,
                      }}>
                        {isSelected && '✓'}
                      </div>
                    )}
                  </div>

                  {/* Score + Ações */}
                  <div style={{ paddingTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      {/* Score verde em destaque (Opus Clip style) */}
                      <span style={{
                        fontSize: 26, fontWeight: 900, color: sColor,
                        lineHeight: 1, letterSpacing: '-1px',
                      }}>
                        {ds}
                      </span>

                      {/* Action icons */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          title="Agendar"
                          style={{
                            width: 26, height: 26, borderRadius: 5, border: '1px solid #2a2a2a',
                            background: '#111', color: '#555', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer',
                          }}
                        >
                          <Calendar size={11} />
                        </button>
                        <a
                          href={downloadUrl(clip.id)}
                          download={`clip_${idx + 1}.mp4`}
                          title="Baixar"
                          style={{
                            width: 26, height: 26, borderRadius: 5, border: '1px solid #2a2a2a',
                            background: '#111', color: '#555', display: 'flex', alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Download size={11} />
                        </a>
                        <button
                          onClick={() => navigate({ name: 'ajuste', jobId, clipId: clip.id, expertId })}
                          title="Editar"
                          style={{
                            width: 26, height: 26, borderRadius: 5, border: '1px solid #2a2a2a',
                            background: '#111', color: '#555', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer',
                          }}
                        >
                          <Sliders size={11} />
                        </button>
                        <button
                          title="Remover"
                          style={{
                            width: 26, height: 26, borderRadius: 5, border: '1px solid #2a2a2a',
                            background: '#111', color: '#555', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer',
                          }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Título do clip */}
                    <div style={{
                      fontSize: 11, fontWeight: 600, color: '#bbb', lineHeight: 1.4,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      marginBottom: 6,
                    }}>
                      {skillResults[clip.id]?.titulo || moment?.natural_hook || moment?.text?.slice(0, 70) || `Corte ${idx + 1} — ${fmtDuration(clip.start, clip.end)}`}
                    </div>

                    {/* Botões de skill IA */}
                    {(() => {
                      const ctx = moment?.text || ''
                      const loading = skillLoading[clip.id]
                      const res = skillResults[clip.id] || {}
                      return (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {(['hook', 'legenda', 'titulo'] as const).map(sk => (
                            <button
                              key={sk}
                              onClick={() => !loading && runSkill(clip.id, sk, ctx)}
                              style={{
                                padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 600,
                                background: res[sk] ? 'rgba(16,185,129,0.12)' : 'rgba(56,189,248,0.08)',
                                border: `1px solid ${res[sk] ? 'rgba(16,185,129,0.3)' : 'rgba(56,189,248,0.2)'}`,
                                color: res[sk] ? '#10B981' : '#38BDF8',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 3,
                              }}
                              title={res[sk] || undefined}
                            >
                              {loading === sk
                                ? <Loader2 size={8} style={{ animation: 'spin 1s linear infinite' }} />
                                : <Sparkles size={8} />
                              }
                              {sk === 'hook' ? 'Hook' : sk === 'legenda' ? 'Legenda' : 'Título'}
                            </button>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {!loading && displayed.length > 0 && viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 16, paddingBottom: 32 }}>
            {displayed.map((clip, idx) => {
              const moment = getMoment(clip)
              const ds = displayScore(clip.score)
              const sColor = scoreColor(clip.score)

              return (
                <div
                  key={clip.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: '#0d0d0d', border: '1px solid #1a1a1a',
                    borderRadius: 10, padding: '12px 16px',
                  }}
                >
                  {/* Mini thumb */}
                  <div style={{
                    width: 40, height: 56, borderRadius: 6, flexShrink: 0,
                    background: `radial-gradient(ellipse, ${accentColor}20, #111)`,
                    border: '1px solid #2a2a2a',
                  }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 2 }}>
                      {moment?.natural_hook || `Corte ${idx + 1}`}
                    </div>
                    <div style={{ fontSize: 11, color: '#444' }}>
                      {fmtTime(clip.start)} → {fmtTime(clip.end)} · {fmtDuration(clip.start, clip.end)}
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ fontSize: 22, fontWeight: 900, color: sColor, width: 48, textAlign: 'right' }}>
                    {ds}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => navigate({ name: 'ajuste', jobId, clipId: clip.id, expertId })}
                      style={{
                        padding: '5px 10px', borderRadius: 6, fontSize: 11,
                        background: '#1a1a1a', border: '1px solid #2a2a2a',
                        color: '#777', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      <Sliders size={11} /> Editar
                    </button>
                    <a
                      href={downloadUrl(clip.id)}
                      download={`clip_${idx + 1}.mp4`}
                      style={{
                        padding: '5px 10px', borderRadius: 6, fontSize: 11,
                        background: accentColor + '20', border: `1px solid ${accentColor}40`,
                        color: accentColor, display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      <Download size={11} /> Baixar
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
