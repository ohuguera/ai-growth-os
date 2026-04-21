import { useRef, useState } from 'react'
import {
  Home, LayoutGrid, FolderOpen, Calendar, BarChart2, Link2,
  Gift, BookOpen, Settings, HelpCircle, Upload, X, ChevronRight,
  Captions, Scissors, Mic, Maximize2, Film, Zap, Sparkles, Check, Wand2,
} from 'lucide-react'
import { uploadVideoChunked, startTranscription } from '../services/api'
import { colors, glow, radius, transition } from '../styles/theme'
import type { Live, JobStatus, Page, PresetId } from '../types'
import { EXPERTS, PRESETS } from '../data/experts'
import RecorteIA from './RecorteIA'

// ── Mock data (igual ao Opus Clip) ────────────────────────────────────────────
const STORAGE_KEY = 'hfive_lives'

const MOCK_LIVES: Live[] = [
  { id: '1', expertId: 'lucas_striz', title: 'LIVE VIP PRATA 17.03.26 PROMPT...', date: '2026-03-17', durationSec: 9240, status: 'idle' },
  { id: '2', expertId: 'suh_aviator', title: 'LIVE VIP PRATA 17.03.26 PROMPT...', date: '2026-03-17', durationSec: 10800, status: 'done', jobId: 'abc123', clipCount: 38 },
  { id: '3', expertId: 'iris_thaize', title: 'b384de8f8eda46b88acbaa4998e...', date: '2026-03-13', durationSec: 5400, status: 'idle' },
  { id: '4', expertId: 'caio_roleta', title: 'LIVE VIP 13.02.26.mov', date: '2026-02-13', durationSec: 8100, status: 'idle' },
]

function loadLives(): Live[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_LIVES))
  return MOCK_LIVES
}

function fmtExpiry(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) + 30
  return `${Math.max(0, diffDays)} dias antes de expirar`
}

const STATUS_COLORS: Record<JobStatus, string> = {
  idle: '#334155', uploading: '#38BDF8', transcribing: '#38BDF8',
  ready: '#F59E0B', processing: '#F472B6', done: '#10B981', error: '#EF4444',
}

// ── Ícones de features (Opus Clip style) ─────────────────────────────────────
const FEATURES = [
  { icon: <Sparkles size={22} />, label: 'Converter longo\npara curto', color: '#F59E0B', bg: '#F59E0B20' },
  { icon: <Captions size={22} />, label: 'Legendas IA', color: '#10B981', bg: '#10B98120' },
  { icon: <Scissors size={22} />, label: 'Editor de\nvídeo', color: '#6366F1', bg: '#6366F120' },
  { icon: <Mic size={22} />, label: 'Aprimorar\na fala', color: '#3B82F6', bg: '#3B82F620' },
  { icon: <Maximize2 size={22} />, label: 'Reenquadrar\nIA', color: '#8B5CF6', bg: '#8B5CF620' },
  { icon: <Film size={22} />, label: 'B-Roll IA', color: '#EC4899', bg: '#EC489920' },
  { icon: <Zap size={22} />, label: 'Gancho de IA', color: '#F97316', bg: '#F9731620' },
]

// ── Sidebar nav ───────────────────────────────────────────────────────────────
type NavSection = 'home' | 'projetos' | 'arquivos' | 'agenda' | 'analytics' | 'fontes'
const NAV_TOP = [
  { id: 'home' as NavSection, icon: <Home size={18} /> },
  { id: 'projetos' as NavSection, icon: <LayoutGrid size={18} /> },
  { id: 'arquivos' as NavSection, icon: <FolderOpen size={18} /> },
  { id: 'agenda' as NavSection, icon: <Calendar size={18} /> },
  { id: 'analytics' as NavSection, icon: <BarChart2 size={18} /> },
  { id: 'fontes' as NavSection, icon: <Link2 size={18} /> },
]

interface Props {
  navigate: (p: Page) => void
}

export default function Inbox({ navigate }: Props) {
  const [lives, setLives] = useState<Live[]>(loadLives)
  const [activeNav, setActiveNav] = useState<NavSection>('home')
  const [url, setUrl] = useState('')
  const [tabProj, setTabProj] = useState<'todos' | 'salvos' | 'favoritos'>('todos')
  const [file, setFile] = useState<File | null>(null)
  const [preset, setPreset] = useState<PresetId>('viral')
  const [captionStyle, setCaptionStyle] = useState<string>('bounce')
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [showRecorteIA, setShowRecorteIA] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function onFileSelected(f: File) {
    if (!f.type.startsWith('video/')) { setError('Apenas arquivos de vídeo'); return }
    setError(null)
    setFile(f)
  }

  async function doUpload(liveTitle: string) {
    if (!file) return
    if (file.size > 10 * 1024 * 1024 * 1024) {
      setError('Video muito grande. Limite: 10GB.')
      return
    }
    setError(null)
    setUploading(true)
    setUploadPct(0)
    try {
      const { job_id } = await uploadVideoChunked(file, p => setUploadPct(p))
      await startTranscription(job_id)
      setUploadPct(100)

      // Persiste job real no localStorage para aparecer na lista
      const newLive: Live = {
        id: job_id,
        expertId: 'lucas_striz',
        title: liveTitle,
        date: new Date().toISOString().split('T')[0],
        durationSec: 0,
        status: 'processing',
        jobId: job_id,
      }
      const current = loadLives()
      const updated = [newLive, ...current.filter(l => l.id !== job_id)]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setLives(updated)

      setTimeout(() => navigate({
        name: 'processando',
        jobId: job_id,
        liveTitle,
        presetId: preset,
        captionStyle,
      }), 300)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro no upload')
      setUploading(false)
      setUploadPct(0)
    }
  }

  async function handleCta() {
    if (!file) { fileRef.current?.click(); return }
    await doUpload(file.name.replace(/\.[^.]+$/, ''))
  }

  async function handleRecorteIA(prompt: string) {
    if (!file) return
    const title = prompt ? `[IA] ${prompt.slice(0, 60)}` : file.name.replace(/\.[^.]+$/, '')
    await doUpload(title)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) onFileSelected(f)
  }

  return (
    <div style={{
      height: '100%', display: 'flex',
      background: '#080808',
    }}>

      {/* ── SIDEBAR ICON-ONLY ── */}
      <div style={{
        width: 50, flexShrink: 0,
        borderRight: '1px solid #1a1a1a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', paddingTop: 16, paddingBottom: 16,
        background: '#080808',
      }}>
        {/* Logo mark */}
        <div style={{
          width: 28, height: 28, borderRadius: radius.md, marginBottom: 20,
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.alert})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
          boxShadow: glow.cyanSoft,
        }}>✂</div>

        {/* Nav top */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV_TOP.map(n => (
            <button
              key={n.id}
              onClick={() => setActiveNav(n.id)}
              title={n.id}
              style={{
                width: 36, height: 36, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: activeNav === n.id ? colors.primaryMuted : 'transparent',
                border: activeNav === n.id ? `1px solid color-mix(in srgb, ${colors.primary} 25%, transparent)` : '1px solid transparent',
                color: activeNav === n.id ? colors.primary : '#444',
                transition: 'all 0.12s', cursor: 'pointer',
              }}
            >
              {n.icon}
            </button>
          ))}
        </div>

        {/* Nav bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { icon: <Gift size={16} />, title: 'Planos' },
            { icon: <BookOpen size={16} />, title: 'Tutoriais' },
            { icon: <Settings size={16} />, title: 'Configurações' },
            { icon: <HelpCircle size={16} />, title: 'Suporte' },
          ].map((item, i) => (
            <button
              key={i}
              title={item.title}
              style={{
                width: 36, height: 36, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: '1px solid transparent',
                color: '#333', cursor: 'pointer',
              }}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>

        {/* Watermark fundo */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 140, fontWeight: 900, color: '#ffffff05',
          letterSpacing: '-4px', pointerEvents: 'none', userSelect: 'none',
          whiteSpace: 'nowrap',
        }}>
          HFIVE IA
        </div>

        <div style={{ position: 'relative', padding: '32px 40px' }}>

          {/* ── UPLOAD CARD ── */}
          <div
            className="cyber-card"
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            style={{
              maxWidth: 520, margin: '0 auto 40px',
              background: dragging ? colors.bgSurface : colors.bgCard,
              border: `1px solid ${dragging ? colors.primary : colors.border}`,
              borderRadius: 16, padding: '20px',
              boxShadow: dragging ? glow.cyanSoft : '0 8px 40px rgba(0,0,0,0.6)',
              transition: transition.cyber,
            }}
          >
            {/* URL / Arquivo selecionado */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#1a1a1a', borderRadius: 10, padding: '12px 16px',
              border: `1px solid ${file ? '#10B98140' : '#2a2a2a'}`, marginBottom: 12,
            }}>
              {file ? (
                <>
                  <Film size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span style={{ flex: 1, color: '#ccc', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#555', flexShrink: 0 }}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <button onClick={() => setFile(null)} style={{ color: '#444', padding: 2, flexShrink: 0 }}>
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Link2 size={16} style={{ color: '#444', flexShrink: 0 }} />
                  <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="Solte um link do Twitch, YouTube ou Drive"
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#ccc', fontSize: 14 }}
                  />
                  {url && <button onClick={() => setUrl('')} style={{ color: '#444', padding: 2 }}><X size={14} /></button>}
                </>
              )}
            </div>

            {/* Botões Enviar / Google Drive */}
            {!file && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px', borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a',
                    color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  <Upload size={14} /> Enviar arquivo
                </button>
                <button style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px', borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a',
                  color: '#555', fontSize: 13, fontWeight: 500, cursor: 'not-allowed',
                }}>
                  <span style={{ fontSize: 14 }}>⊕</span> Google Drive
                </button>
              </div>
            )}

            {/* Preset pills — aparecem após selecionar arquivo */}
            {file && !uploading && (
              <>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  {PRESETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPreset(p.id as PresetId)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: preset === p.id ? '#ffffff15' : 'transparent',
                        border: preset === p.id ? '1px solid #ffffff30' : '1px solid #2a2a2a',
                        color: preset === p.id ? '#fff' : '#555', cursor: 'pointer', transition: 'all 0.12s',
                      }}
                    >
                      {preset === p.id && <Check size={10} />}
                      {p.icon} {p.name}
                    </button>
                  ))}
                </div>
                {/* Caption style picker */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {[
                    { id: 'bounce', label: '⚡ Bounce', desc: 'Palavra a palavra' },
                    { id: 'karaoke', label: '🎤 Karaoke', desc: 'Destaque contínuo' },
                    { id: 'slide_up', label: '⬆ Slide', desc: 'Aparece de baixo' },
                    { id: 'block', label: '▪ Block', desc: 'Bloco limpo' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setCaptionStyle(s.id)}
                      title={s.desc}
                      style={{
                        flex: 1, padding: '5px 4px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                        background: captionStyle === s.id ? '#38BDF820' : 'transparent',
                        border: captionStyle === s.id ? '1px solid #38BDF850' : '1px solid #2a2a2a',
                        color: captionStyle === s.id ? '#38BDF8' : '#444',
                        cursor: 'pointer', transition: 'all 0.12s',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Progress bar durante upload */}
            {uploading && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>
                  <span>{uploadPct < 100 ? 'Enviando vídeo...' : 'Iniciando análise...'}</span>
                  <span style={{ color: colors.primary }}>{Math.round(uploadPct)}%</span>
                </div>
                <div style={{ height: 3, background: colors.bgElevated, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.alert})`,
                    width: `${uploadPct}%`, transition: 'width 0.3s ease',
                    boxShadow: glow.cyanSoft,
                  }} />
                </div>
              </div>
            )}

            {error && (
              <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 10, padding: '8px 12px', background: '#EF444415', borderRadius: 8 }}>
                {error}
              </div>
            )}

            {/* Botão Recorte de IA — aparece quando há arquivo */}
            {file && !uploading && (
              <button
                onClick={() => setShowRecorteIA(true)}
                style={{
                  width: '100%', padding: '11px', borderRadius: radius.lg, marginBottom: 8,
                  background: colors.primaryMuted,
                  border: `1px solid color-mix(in srgb, ${colors.primary} 30%, transparent)`,
                  color: colors.primary, fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', letterSpacing: '-0.1px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: glow.cyanSoft,
                  transition: transition.cyber,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = glow.cyan }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = glow.cyanSoft }}
              >
                <Wand2 size={14} />
                Recorte de IA — descreva o que quer cortar
              </button>
            )}

            {/* CTA principal */}
            <button
              onClick={handleCta}
              disabled={uploading}
              style={{
                width: '100%', padding: '13px', borderRadius: radius.cyber,
                background: uploading ? colors.bgElevated : colors.primary,
                color: uploading ? colors.textMuted : '#000',
                fontWeight: 800, fontSize: 15, border: 'none',
                cursor: uploading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.2px', transition: transition.cyber,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: uploading ? 'none' : glow.cyanSoft,
              }}
              onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLButtonElement).style.boxShadow = glow.cyan }}
              onMouseLeave={e => { if (!uploading) (e.currentTarget as HTMLButtonElement).style.boxShadow = glow.cyanSoft }}
            >
              {uploading ? (
                <>
                  <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #333', borderTopColor: '#888', borderRadius: '50%' }} />
                  Processando...
                </>
              ) : file ? (
                'Obter clipes em 1 clique →'
              ) : (
                'Obter clipes em 1 clique'
              )}
            </button>
          </div>

          {/* ── FEATURES ROW ── */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 20,
            marginBottom: 48, flexWrap: 'wrap',
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                style={{ textAlign: 'center', cursor: 'pointer', width: 72 }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 16, margin: '0 auto 8px',
                  background: f.bg, border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color, transition: 'transform 0.15s',
                }}>
                  {f.icon}
                </div>
                <div style={{
                  fontSize: 10, color: '#666', lineHeight: 1.3,
                  whiteSpace: 'pre-line',
                }}>
                  {f.label}
                </div>
              </div>
            ))}
          </div>

          {/* ── PROJECTS SECTION ── */}
          <div>
            {/* Tabs + storage */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {([
                  { id: 'todos', label: `Todos os projetos (${lives.length})` },
                  { id: 'salvos', label: 'Projetos salvos (0)' },
                  { id: 'favoritos', label: 'Clipes favoritos (0)' },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setTabProj(tab.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                      background: tabProj === tab.id ? '#1a1a1a' : 'transparent',
                      border: tabProj === tab.id ? '1px solid #2a2a2a' : '1px solid transparent',
                      color: tabProj === tab.id ? '#e0e0e0' : '#555',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#444' }}>
                <span>0.04 GB / 100 GB</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Auto salvar
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  Auto importar <span style={{ color: '#333' }}>Beta</span>
                </span>
              </div>
            </div>

            {/* Projects grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}>
              {lives.map(live => (
                <ProjectCard key={live.id} live={live} navigate={navigate} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 40, textAlign: 'center', fontSize: 11, color: '#222', fontWeight: 600, letterSpacing: '0.1em' }}>
            HFIVE IA · SISTEMA DE CORTES
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelected(f) }}
      />

      {/* Recorte de IA modal */}
      {showRecorteIA && file && (
        <RecorteIA
          file={file}
          presetId={preset}
          uploading={uploading}
          onClose={() => setShowRecorteIA(false)}
          onSubmit={async (prompt) => {
            setShowRecorteIA(false)
            await handleRecorteIA(prompt)
          }}
        />
      )}
    </div>
  )
}

function ProjectCard({ live, navigate }: { live: Live; navigate: (p: Page) => void }) {
  const expert = live.expertId ? EXPERTS[live.expertId] : null
  const isDone = live.status === 'done'
  const accentColor = expert?.color || '#6366F1'

  return (
    <div
      onClick={() => {
        if (isDone && live.jobId) {
          navigate({ name: 'resultados', jobId: live.jobId, expertId: live.expertId, liveTitle: live.title })
        } else {
          navigate({ name: 'novo', liveId: live.id })
        }
      }}
      style={{
        background: '#0d0d0d', border: '1px solid #1a1a1a',
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.border = `1px solid #2a2a2a`
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.border = '1px solid #1a1a1a'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Thumbnail */}
      <div style={{
        aspectRatio: '16/9', background: '#111',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Dark gradient simulating thumbnail */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${accentColor}12 0%, transparent 70%)`,
        }} />
        <div style={{ fontSize: 28, opacity: 0.15 }}>🎬</div>

        {/* Novo badge */}
        {live.status === 'idle' && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            padding: '2px 8px', borderRadius: 4,
            background: '#1a1a1a', border: '1px solid #333',
            fontSize: 10, fontWeight: 600, color: '#aaa',
          }}>
            Novo
          </div>
        )}

        {/* Done: clip count */}
        {isDone && live.clipCount != null && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            padding: '2px 8px', borderRadius: 4,
            background: '#10B98120', border: '1px solid #10B98140',
            fontSize: 10, fontWeight: 700, color: '#10B981',
          }}>
            {live.clipCount} clipes
          </div>
        )}

        {/* Status dot */}
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          width: 6, height: 6, borderRadius: '50%',
          background: STATUS_COLORS[live.status],
        }} />
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 11, color: '#444', marginBottom: 4 }}>
          {fmtExpiry(live.date)}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: '#ccc', marginBottom: 4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {live.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 10, color: '#333', fontWeight: 600 }}>
            {expert?.name || 'ClipAnything'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#555' }}>
            {isDone ? 'Ver clipes' : 'Processar'}
            <ChevronRight size={10} />
          </div>
        </div>
      </div>
    </div>
  )
}
