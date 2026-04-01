import { useRef, useState } from 'react'
import {
  LayoutGrid, Layers, Settings, Plus, Upload, Play,
  Clock, X, Film, ChevronDown,
} from 'lucide-react'
import { uploadVideoChunked, startTranscription } from '../services/api'
import { TEMPLATES, CATEGORY_LABELS, CATEGORY_COLORS } from '../data/templates'
import type { EditorPage, TemplateCategory } from '../types'

interface Props {
  navigate: (p: EditorPage) => void
}

type SideTab = 'projetos' | 'templates' | 'config'

interface RecentProject {
  id: string
  name: string
  template: string
  color: string
  date: string
  duration: string
}

const RECENT: RecentProject[] = [
  { id: 'r1', name: 'Live_Bingobet_23Mar', template: 'Depoimento Clássico', color: '#6366F1', date: 'Hoje, 14:22', duration: '0:47' },
  { id: 'r2', name: 'Saque_Record_Suh', template: 'Saque do Dia', color: '#10B981', date: 'Ontem, 09:15', duration: '0:32' },
  { id: 'r3', name: 'Tutorial_Aviator', template: 'Tutorial Rápido', color: '#3B82F6', date: '22 Mar', duration: '1:12' },
  { id: 'r4', name: 'Roleta_Highlight', template: 'Choque de Realidade', color: '#EF4444', date: '21 Mar', duration: '0:28' },
  { id: 'r5', name: 'Iris_Educativo_Bingo', template: 'Passo a Passo', color: '#8B5CF6', date: '20 Mar', duration: '0:55' },
  { id: 'r6', name: 'Caio_Multiplicou_x500', template: 'Multiplicação Épica', color: '#F59E0B', date: '19 Mar', duration: '0:22' },
]

// Mini 9:16 preview inline
function MiniThumb({ color, label }: { color: string; label?: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0e0e1a 0%, #1a1a2e 50%, #0e0e1a 100%)',
      position: 'relative', overflow: 'hidden', borderRadius: 'inherit',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, ${color}28 0%, transparent 68%)`,
      }} />
      {label && (
        <div style={{
          position: 'absolute', bottom: 8, left: 6, right: 6,
          background: 'rgba(0,0,0,0.75)', borderRadius: 4,
          padding: '3px 6px', fontSize: 7, fontWeight: 700,
          textAlign: 'center', color,
        }}>
          {label.slice(0, 20)}
        </div>
      )}
    </div>
  )
}

export default function EditorHome({ navigate }: Props) {
  const [tab, setTab] = useState<SideTab>('projetos')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recente' | 'nome'>('recente')
  const [catFilter, setCatFilter] = useState<TemplateCategory | 'all'>('all')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('video/')) { setError('Apenas arquivos de vídeo'); return }
    setError(null)
    setUploading(true)
    setUploadProgress(0)
    try {
      const { job_id } = await uploadVideoChunked(file, p => setUploadProgress(p))
      await startTranscription(job_id)
      setUploadProgress(100)
      setTimeout(() => navigate({ name: 'processing', jobId: job_id, filename: file.name.replace(/\.[^.]+$/, '') }), 350)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }

  const cats = Object.keys(CATEGORY_LABELS) as TemplateCategory[]
  const filteredTmpl = catFilter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === catFilter)

  // ── NAV SIDEBAR ─────────────────────────────────────────────────────────────
  const NAV: { id: SideTab; icon: React.ReactNode; label: string }[] = [
    { id: 'projetos', icon: <LayoutGrid size={18} />, label: 'Projetos' },
    { id: 'templates', icon: <Layers size={18} />, label: 'Templates' },
    { id: 'config', icon: <Settings size={18} />, label: 'Config.' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--bg-base)' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 200, flexShrink: 0, borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', background: 'var(--bg-card)',
      }}>
        {/* Logo do módulo */}
        <div style={{
          padding: '20px 16px 12px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.3px' }}>
            Editor de Criativos
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {RECENT.length} projetos · {TEMPLATES.length} templates
          </div>
        </div>

        {/* Nav items */}
        <div style={{ padding: '12px 10px', flex: 1 }}>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                background: tab === n.id ? '#6366F115' : 'transparent',
                border: tab === n.id ? '1px solid #6366F125' : '1px solid transparent',
                color: tab === n.id ? '#818CF8' : 'var(--text-secondary)',
                fontWeight: tab === n.id ? 600 : 400, fontSize: 13,
                textAlign: 'left', transition: 'all 0.12s',
              }}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </div>

        {/* Upload rápido */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => setShowUpload(true)}
            style={{
              width: '100%', padding: '10px', borderRadius: 8,
              background: 'linear-gradient(135deg, #6366F1, #EC4899)',
              color: '#fff', fontWeight: 700, fontSize: 13, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 16px #6366F130',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Novo criativo
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* ══════════ ABA: PROJETOS ══════════ */}
        {tab === 'projetos' && (
          <div style={{ padding: '28px 32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 2 }}>
                  Meus Projetos
                </h2>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {RECENT.length} criativos · ordenado por {sortBy}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {/* Sort */}
                <div style={{ position: 'relative' }}>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as 'recente' | 'nome')}
                    style={{
                      appearance: 'none', padding: '7px 28px 7px 12px',
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="recente">Mais recente</option>
                    <option value="nome">Nome A-Z</option>
                  </select>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                </div>
                <button
                  onClick={() => setShowUpload(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    background: '#6366F1', color: '#fff', border: 'none', cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Novo
                </button>
              </div>
            </div>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 14,
            }}>
              {/* Card + Novo */}
              <div
                onClick={() => setShowUpload(true)}
                style={{
                  cursor: 'pointer', borderRadius: 14, overflow: 'hidden',
                  border: '1.5px dashed var(--border-light)',
                  background: 'var(--bg-surface)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', minHeight: 200,
                  transition: 'all 0.15s', gap: 10,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#6366F1'
                  ;(e.currentTarget as HTMLDivElement).style.background = '#6366F108'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-light)'
                  ;(e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)'
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#6366F115', border: '1px solid #6366F130',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#818CF8',
                }}>
                  <Plus size={20} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Novo criativo
                </div>
              </div>

              {/* Projetos existentes */}
              {RECENT.map(proj => (
                <div
                  key={proj.id}
                  style={{
                    borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = proj.color + '70'
                    el.style.transform = 'translateY(-3px)'
                    el.style.boxShadow = `0 8px 24px ${proj.color}18`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = 'var(--border)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  {/* Thumbnail 9:16 */}
                  <div style={{ aspectRatio: '9/16', position: 'relative' }}>
                    <MiniThumb color={proj.color} label={proj.template} />
                    {/* Duração */}
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(0,0,0,0.65)', borderRadius: 5,
                      padding: '2px 7px', fontSize: 10, fontWeight: 600,
                      color: 'rgba(255,255,255,0.85)',
                    }}>
                      {proj.duration}
                    </div>
                    {/* Play hover */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0)',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Play size={14} fill="#fff" color="#fff" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, marginBottom: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {proj.name}
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 600, color: proj.color, marginBottom: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {proj.template}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={9} /> {proj.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ ABA: TEMPLATES ══════════ */}
        {tab === 'templates' && (
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 2 }}>
                  Biblioteca de Templates
                </h2>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Escolha um template e inicie um novo criativo
                </div>
              </div>
            </div>

            {/* Filtros de categoria */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
              <button
                onClick={() => setCatFilter('all')}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  background: catFilter === 'all' ? 'var(--bg-surface)' : 'transparent',
                  border: catFilter === 'all' ? '1px solid var(--border-light)' : '1px solid transparent',
                  color: catFilter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Todos ({TEMPLATES.length})
              </button>
              {cats.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: catFilter === cat ? CATEGORY_COLORS[cat] + '20' : 'transparent',
                    border: catFilter === cat ? `1px solid ${CATEGORY_COLORS[cat]}40` : '1px solid transparent',
                    color: catFilter === cat ? CATEGORY_COLORS[cat] : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Grid de templates */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 14,
            }}>
              {filteredTmpl.map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => setShowUpload(true)}
                  style={{
                    borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-card)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = tmpl.primaryColor
                    el.style.transform = 'scale(1.03)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = 'var(--border)'
                    el.style.transform = 'scale(1)'
                  }}
                >
                  {/* 9:16 preview */}
                  <div style={{ aspectRatio: '9/16' }}>
                    <MiniThumb color={tmpl.primaryColor} label={tmpl.defaultHook} />
                  </div>
                  {/* Info */}
                  <div style={{ padding: '8px 10px', background: 'var(--bg-card)' }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, marginBottom: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {tmpl.emoji} {tmpl.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 10, color: CATEGORY_COLORS[tmpl.category], fontWeight: 600 }}>
                        {CATEGORY_LABELS[tmpl.category]}
                      </div>
                      {tmpl.performanceIndicator && (
                        <div style={{
                          fontSize: 8, fontWeight: 700, padding: '1px 5px',
                          borderRadius: 4, background: tmpl.primaryColor + '25',
                          color: tmpl.primaryColor, textTransform: 'uppercase', letterSpacing: '0.03em',
                        }}>
                          {tmpl.performanceIndicator}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ ABA: CONFIG ══════════ */}
        {tab === 'config' && (
          <div style={{ padding: '28px 32px', maxWidth: 540 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
              Configurações
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 28 }}>
              Preferências do Editor de Criativos
            </div>

            {[
              { label: 'Formato padrão de saída', value: 'MP4 · H.264 · 1080x1920' },
              { label: 'Qualidade de exportação', value: 'Alta (recomendado)' },
              { label: 'Marca d\'água padrão', value: '+18 · canto superior direito' },
              { label: 'Idioma das legendas', value: 'Português BR' },
              { label: 'Backend de processamento', value: 'Cortador API · localhost:8000' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── MODAL UPLOAD ── */}
      {showUpload && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          }}
          onClick={e => { if (e.target === e.currentTarget && !uploading) setShowUpload(false) }}
        >
          <div style={{
            width: 460, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 32, animation: 'fadeIn 0.18s ease-out',
            position: 'relative',
          }}>
            {!uploading && (
              <button
                onClick={() => setShowUpload(false)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  color: 'var(--text-secondary)', padding: 4,
                }}
              >
                <X size={18} />
              </button>
            )}

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <Film size={22} color="#fff" />
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>
                {uploading ? 'Enviando vídeo...' : 'Novo criativo'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {uploading ? `${Math.round(uploadProgress)}% concluído` : 'Faça upload do vídeo para começar'}
              </div>
            </div>

            {uploading ? (
              <div>
                {/* Progress bar */}
                <div style={{
                  height: 6, borderRadius: 3, background: 'var(--border)',
                  overflow: 'hidden', marginBottom: 12,
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: 'linear-gradient(90deg, #6366F1, #EC4899)',
                    width: `${uploadProgress}%`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  {uploadProgress < 100 ? 'Fazendo upload...' : 'Iniciando transcrição...'}
                </div>
              </div>
            ) : (
              <div>
                {/* Drop zone */}
                <div
                  onDrop={onDrop}
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragging ? '#6366F1' : 'var(--border-light)'}`,
                    borderRadius: 14, padding: '36px 24px', textAlign: 'center',
                    background: dragging ? '#6366F108' : 'var(--bg-surface)',
                    cursor: 'pointer', transition: 'all 0.15s', marginBottom: 12,
                  }}
                >
                  <Upload size={28} style={{ opacity: 0.4, margin: '0 auto 12px', display: 'block' }} />
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                    Arraste o vídeo aqui
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
                    ou clique para selecionar
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 18px', borderRadius: 8,
                    background: '#6366F1', color: '#fff',
                    fontSize: 13, fontWeight: 700,
                  }}>
                    <Upload size={13} /> Escolher arquivo
                  </div>
                  <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                    MP4, MOV, AVI · Recomendado: 9:16 vertical
                  </div>
                </div>

                {error && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: '#EF444415', border: '1px solid #EF444430',
                    color: '#EF4444', fontSize: 13,
                  }}>
                    {error}
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>
        </div>
      )}

    </div>
  )
}
