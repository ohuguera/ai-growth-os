import { useState, useRef, useCallback } from 'react'
import { ArrowLeft, Upload, Scissors } from 'lucide-react'
import { EXPERTS, PRESETS } from '../data/experts'
import { uploadVideoChunked, startTranscription } from '../services/api'
import type { ExpertId, PresetId, Page } from '../types'

interface Props {
  navigate: (p: Page) => void
}

export default function NovoCortee({ navigate }: Props) {
  const [expert, setExpert] = useState<ExpertId | undefined>(undefined)
  const [preset, setPreset] = useState<PresetId | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const canSubmit = preset && file && !loading

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('video/')) setFile(f)
    else setError('Apenas arquivos de vídeo são aceitos')
  }, [])

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    setProgress(0)
    try {
      const { job_id } = await uploadVideoChunked(file, p => setProgress(p))
      await startTranscription(job_id)
      navigate({
        name: 'processando',
        jobId: job_id,
        expertId: expert,
        liveTitle: file.name.replace(/\.[^.]+$/, ''),
        presetId: preset,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao iniciar processamento')
      setLoading(false)
    }
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--text-secondary)', fontSize: 13, marginBottom: 28,
          }}
          onClick={() => navigate({ name: 'inbox' })}
        >
          <ArrowLeft size={14} /> Voltar ao Inbox
        </button>

        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Novo Corte</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 32 }}>
          Faça o upload, escolha o preset e (opcional) associe um expert
        </div>

        {/* Expert — OPCIONAL */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={sectionTitle}>1. Expert</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {Object.values(EXPERTS).map(e => (
              <div
                key={e.id}
                onClick={() => setExpert(expert === e.id as ExpertId ? undefined : e.id as ExpertId)}
                style={{
                  padding: '14px 12px', borderRadius: 10, cursor: 'pointer',
                  border: expert === e.id ? `1.5px solid ${e.color}` : '1.5px solid var(--border)',
                  background: expert === e.id ? e.colorMuted : 'var(--bg-card)',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, margin: '0 auto 8px',
                  background: e.colorMuted, border: `1px solid ${e.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: e.color,
                }}>
                  {e.initials}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{e.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.3 }}>{e.style}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div style={{ marginBottom: 32 }}>
          <div style={sectionTitle}>2. Vídeo da Live</div>
          {file ? (
            <div style={{
              border: '2px dashed #10B981', borderRadius: 12, padding: '24px',
              background: '#10B98108', display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ fontSize: 28 }}>🎬</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{file.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                style={{ color: 'var(--text-secondary)', fontSize: 12, padding: '4px 8px', borderRadius: 6 }}
              >
                Trocar
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#6366F1' : 'var(--border-light)'}`,
                borderRadius: 12, padding: '40px 24px', textAlign: 'center',
                background: dragging ? '#6366F108' : 'var(--bg-card)',
                cursor: 'pointer',
              }}
            >
              <Upload size={28} style={{ margin: '0 auto 12px', opacity: 0.5, display: 'block' }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Arraste o vídeo aqui</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>ou clique para selecionar · MP4, MOV, AVI</div>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f) }}
              />
            </div>
          )}
        </div>

        {/* Preset */}
        <div style={{ marginBottom: 32 }}>
          <div style={sectionTitle}>3. Preset de Corte</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {PRESETS.map(p => (
              <div
                key={p.id}
                onClick={() => setPreset(p.id as PresetId)}
                style={{
                  padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                  border: preset === p.id ? '1.5px solid #6366F1' : '1.5px solid var(--border)',
                  background: preset === p.id ? '#6366F115' : 'var(--bg-card)',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}
              >
                <div style={{ fontSize: 22, lineHeight: 1 }}>{p.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{p.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, background: '#EF444415',
            border: '1px solid #EF444430', color: '#EF4444', fontSize: 13, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700,
            background: canSubmit ? '#6366F1' : 'var(--bg-surface)',
            color: canSubmit ? '#fff' : 'var(--text-muted)',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            border: 'none',
          }}
        >
          {loading ? (
            <>
              <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #fff4', borderTopColor: '#fff', borderRadius: '50%' }} />
              {progress > 0 && progress < 100 ? `Enviando... ${progress}%` : 'Processando...'}
            </>
          ) : (
            <><Scissors size={16} /> Gerar Cortes</>
          )}
        </button>
      </div>
    </div>
  )
}
