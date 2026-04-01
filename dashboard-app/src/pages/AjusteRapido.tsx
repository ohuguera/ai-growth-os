import { useEffect, useState } from 'react'
import { ArrowLeft, Download, RotateCcw } from 'lucide-react'
import { getJob, processClips, downloadUrl } from '../services/api'
import { EXPERTS } from '../data/experts'
import type { ExpertId, Clip, Moment, Page } from '../types'

interface Props {
  jobId: string
  clipId: string
  expertId?: ExpertId
  navigate: (p: Page) => void
}

type CaptionPos = 'top' | 'middle' | 'bottom'

export default function AjusteRapido({ jobId, clipId, expertId, navigate }: Props) {
  const expert = expertId ? EXPERTS[expertId] : { color: '#6366F1', colorMuted: '#6366F115', initials: 'IA', name: 'ClipAnything', watermarkText: '+18', style: 'IA', id: 'generic' }

  const [clip, setClip] = useState<Clip | null>(null)
  const [moment, setMoment] = useState<Moment | null>(null)
  const [loading, setLoading] = useState(true)
  const [reprocessing, setReprocessing] = useState(false)
  const [reprocessDone, setReprocessDone] = useState(false)

  // Controls
  const [hook, setHook] = useState('')
  const [cta, setCta] = useState('Segue o perfil!')
  const [captionPos, setCaptionPos] = useState<CaptionPos>('middle')
  const [watermark, setWatermark] = useState(true)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)

  useEffect(() => {
    getJob(jobId)
      .then(job => {
        const c = job.clips.find((x: Clip) => x.id === clipId)
        if (c) {
          setClip(c)
          setTrimStart(c.start)
          setTrimEnd(c.end)
        }
        const m = job.moments.find((x: Moment) => c && Math.abs(x.start - c.start) < 1)
        if (m) {
          setMoment(m)
          setHook(m.natural_hook || '')
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId, clipId])

  async function handleReprocess() {
    if (!clip) return
    setReprocessing(true)
    setReprocessDone(false)
    try {
      await processClips({
        job_id: jobId,
        approved_moments: [{
          start: trimStart,
          end: trimEnd,
          score: clip.score,
          use_natural_hook: false,
          natural_hook: '',
        }],
        hook,
        cta,
        caption_position: captionPos,
        watermark,
      })
      // poll until done
      let tries = 0
      while (tries < 30) {
        await new Promise(r => setTimeout(r, 2000))
        const job = await getJob(jobId)
        if (job.status === 'done') {
          setReprocessDone(true)
          break
        }
        tries++
      }
    } catch (e) {
      console.error(e)
    } finally {
      setReprocessing(false)
    }
  }

  function fmtTime(sec: number): string {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const duration = clip ? Math.round(clip.end - clip.start) : 0

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 7,
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: 13, outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block',
  }

  const controlCard: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '16px', marginBottom: 12,
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate({ name: 'resultados', jobId, expertId, liveTitle: '' })}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, background: 'none', border: 'none' }}
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
        <div style={{ fontWeight: 700, fontSize: 16 }}>Ajuste Rápido</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: expert.colorMuted, color: expert.color,
          }}>
            {expert.name}
          </div>
          {!loading && clip && (
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{duration}s · score {clip.score}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Carregando...
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', gap: 0 }}>
          {/* Preview panel */}
          <div style={{ flex: 1, padding: '24px 24px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Preview
            </div>

            {/* Video mock */}
            <div style={{
              aspectRatio: '9/16', maxHeight: 360, background: `linear-gradient(180deg, ${expert.color}20, ${expert.color}08)`,
              border: `1px solid ${expert.color}20`, borderRadius: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {fmtTime(trimStart)} → {fmtTime(trimEnd)}
              </div>

              {/* Hook overlay preview */}
              {hook && (
                <div style={{
                  position: 'absolute', top: 24, left: 12, right: 12,
                  background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '6px 10px',
                  fontSize: 11, fontWeight: 600, textAlign: 'center', color: '#FFE500',
                }}>
                  {hook}
                </div>
              )}

              {/* Caption preview */}
              <div style={{
                position: 'absolute',
                top: captionPos === 'top' ? 60 : captionPos === 'middle' ? '45%' : undefined,
                bottom: captionPos === 'bottom' ? 60 : undefined,
                left: 12, right: 12,
                background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '4px 8px',
                fontSize: 11, textAlign: 'center',
              }}>
                Legenda aqui...
              </div>

              {/* CTA overlay preview */}
              {cta && (
                <div style={{
                  position: 'absolute', bottom: 24, left: 12, right: 12,
                  background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '6px 10px',
                  fontSize: 11, fontWeight: 600, textAlign: 'center', color: '#FFE500',
                }}>
                  {cta}
                </div>
              )}

              {/* Watermark */}
              {watermark && (
                <div style={{
                  position: 'absolute', top: 8, right: 10,
                  fontSize: 9, color: 'rgba(255,255,255,0.6)',
                }}>
                  {expert.watermarkText}
                </div>
              )}
            </div>

            {/* Transcript */}
            {moment?.text && (
              <div style={{
                padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transcrição · </span>
                {moment.text}
              </div>
            )}
          </div>

          {/* Controls panel */}
          <div style={{ width: 320, borderLeft: '1px solid var(--border)', padding: '24px', overflow: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
              Controles
            </div>

            {/* Identity */}
            <div style={controlCard}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Identidade do Expert</div>
              <div style={{
                padding: '8px 10px', background: expert.colorMuted,
                border: `1px solid ${expert.color}30`, borderRadius: 7,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, background: expert.colorMuted,
                  border: `1px solid ${expert.color}40`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 10, fontWeight: 700, color: expert.color,
                }}>
                  {expert.initials}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{expert.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Identidade aplicada automaticamente</div>
                </div>
              </div>
            </div>

            {/* Hook */}
            <div style={controlCard}>
              <label style={labelStyle}>Texto do Hook (primeiros 3s)</label>
              <input
                style={inputStyle}
                placeholder="Ex: Isso mudou meu jogo..."
                value={hook}
                onChange={e => setHook(e.target.value)}
              />
            </div>

            {/* CTA */}
            <div style={controlCard}>
              <label style={labelStyle}>Texto do CTA (últimos 4s)</label>
              <input
                style={inputStyle}
                value={cta}
                onChange={e => setCta(e.target.value)}
              />
            </div>

            {/* Caption position */}
            <div style={controlCard}>
              <label style={labelStyle}>Posição da Legenda</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['top', 'middle', 'bottom'] as CaptionPos[]).map(pos => (
                  <button
                    key={pos}
                    onClick={() => setCaptionPos(pos)}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 12, fontWeight: 500,
                      background: captionPos === pos ? expert.colorMuted : 'var(--bg-surface)',
                      border: captionPos === pos ? `1px solid ${expert.color}40` : '1px solid var(--border)',
                      color: captionPos === pos ? expert.color : 'var(--text-secondary)',
                    }}
                  >
                    {pos === 'top' ? 'Topo' : pos === 'middle' ? 'Centro' : 'Baixo'}
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark */}
            <div style={controlCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Marca d'água</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{expert.watermarkText}</div>
                </div>
                <button
                  onClick={() => setWatermark(!watermark)}
                  style={{
                    width: 40, height: 22, borderRadius: 11, position: 'relative',
                    background: watermark ? expert.color : 'var(--border)',
                    border: 'none', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: watermark ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            </div>

            {/* Trim */}
            <div style={controlCard}>
              <label style={labelStyle}>Corte Fino</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Início</div>
                  <input
                    type="range"
                    min={clip?.start || 0}
                    max={clip ? clip.end - 5 : 100}
                    step={0.5}
                    value={trimStart}
                    onChange={e => setTrimStart(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: expert.color }}
                  />
                  <div style={{ fontSize: 11, color: expert.color, textAlign: 'center' }}>{fmtTime(trimStart)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Fim</div>
                  <input
                    type="range"
                    min={clip ? clip.start + 5 : 0}
                    max={clip?.end || 100}
                    step={0.5}
                    value={trimEnd}
                    onChange={e => setTrimEnd(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: expert.color }}
                  />
                  <div style={{ fontSize: 11, color: expert.color, textAlign: 'center' }}>{fmtTime(trimEnd)}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
                Duração: {Math.round(trimEnd - trimStart)}s
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={handleReprocess}
                disabled={reprocessing}
                style={{
                  width: '100%', padding: '11px', borderRadius: 8, fontWeight: 600, fontSize: 13,
                  background: reprocessing ? 'var(--bg-surface)' : expert.color,
                  color: reprocessing ? 'var(--text-secondary)' : '#fff',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: reprocessing ? 'not-allowed' : 'pointer',
                }}
              >
                {reprocessing ? (
                  <><div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #fff4', borderTopColor: 'var(--text-secondary)', borderRadius: '50%' }} /> Reprocessando...</>
                ) : (
                  <><RotateCcw size={14} /> Re-exportar com Ajustes</>
                )}
              </button>

              {reprocessDone && clip && (
                <a
                  href={downloadUrl(clip.id)}
                  download={`${clip.id}.mp4`}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 8, fontWeight: 600, fontSize: 13,
                    background: '#10B98120', border: '1px solid #10B98140',
                    color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <Download size={14} /> Baixar Versão Ajustada
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
