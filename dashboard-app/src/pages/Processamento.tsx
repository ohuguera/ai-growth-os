import { useEffect, useState, useRef } from 'react'
import { getJob, processClips } from '../services/api'
const BASE = (import.meta as { env: Record<string, string> }).env.VITE_CORTADOR_API_URL || 'https://ai-growth-os-production-bf81.up.railway.app'
import { EXPERTS, PRESETS } from '../data/experts'
import type { ExpertId, PresetId, Page, Moment } from '../types'

type Phase = 'upload' | 'transcribe' | 'ai' | 'moments' | 'process' | 'done'

interface Step {
  label: string
  detail: string
  phase: Phase
}

const STEPS: Step[] = [
  { phase: 'upload',     label: 'Upload concluído',              detail: 'Vídeo recebido pelo servidor' },
  { phase: 'transcribe', label: 'Transcrevendo com IA',          detail: 'Whisper medium analisando o áudio...' },
  { phase: 'ai',         label: 'Analisando com IA',             detail: 'Claude detectando hooks, desenvolvimento e CTAs...' },
  { phase: 'moments',    label: 'Detectando melhores momentos',  detail: 'Identificando picos de engajamento...' },
  { phase: 'process',    label: 'Gerando cortes',                detail: 'FFmpeg aplicando identidade e legendas...' },
  { phase: 'done',       label: 'Cortes prontos',                detail: 'Tudo certo! Redirecionando...' },
]

function phaseIndex(p: Phase): number {
  return STEPS.findIndex(s => s.phase === p)
}

interface Props {
  jobId: string
  expertId?: ExpertId
  liveTitle: string
  presetId: PresetId
  navigate: (p: Page) => void
}

export default function Processamento({ jobId, expertId, liveTitle, presetId, navigate }: Props) {
  const expert = expertId ? EXPERTS[expertId] : { color: '#6366F1', colorMuted: '#6366F115', initials: 'IA', name: 'ClipAnything', watermarkText: '+18', style: 'IA', id: 'generic' }
  const preset = PRESETS.find(p => p.id === presetId)!
  const [phase, setPhase] = useState<Phase>('upload')
  const [error, setError] = useState<string | null>(null)
  const [momentCount, setMomentCount] = useState<number | null>(null)
  const [transcriptionProgress, setTranscriptionProgress] = useState(0)
  const [retrying, setRetrying] = useState(false)
  const processed = useRef(false)

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout>

    async function poll() {
      if (!alive) return
      try {
        const job = await getJob(jobId)

        // Job sumiu do servidor (deploy reiniciou o container)
        if ('error' in job && job.error === 'Job não encontrado') {
          setError('job_not_found')
          return
        }

        if (job.status === 'transcribing') {
          setPhase('transcribe')
          // Mostrar progresso se disponivel
          if (job.transcription_progress !== undefined) {
            setTranscriptionProgress(job.transcription_progress)
          }
        } else if (job.status === 'ready' && !processed.current) {
          processed.current = true
          setTranscriptionProgress(100)

          // Fase IA visual
          setPhase('ai')
          await new Promise(r => setTimeout(r, 1000))
          if (!alive) return

          setPhase('moments')
          setMomentCount(job.moments.length)

          // pequena pausa visual antes de iniciar o processing
          await new Promise(r => setTimeout(r, 1200))
          if (!alive) return

          setPhase('process')
          const [durMin, durMax] = preset.durationRange
          const approved = job.moments
            .filter((m: Moment) => {
              const dur = m.end - m.start
              return dur >= durMin && dur <= durMax
            })
            .slice(0, 10) // max 10 cortes por vez

          await processClips({
            job_id: jobId,
            approved_moments: approved.length > 0
              ? approved.map((m: Moment) => ({
                  start: m.start,
                  end: m.end,
                  score: m.score,
                  use_natural_hook: !!m.natural_hook,
                  natural_hook: m.natural_hook || '',
                }))
              // fallback: usa todos os momentos sem filtro de duração
              : job.moments.slice(0, 10).map((m: Moment) => ({
                  start: m.start,
                  end: m.end,
                  score: m.score,
                  use_natural_hook: !!m.natural_hook,
                  natural_hook: m.natural_hook || '',
                })),
            hook: '',
            cta: 'Segue o perfil!',
            caption_position: 'middle',
            watermark: true,
          })

          timer = setTimeout(poll, 2000)
          return

        } else if (job.status === 'processing') {
          setPhase('process')
        } else if (job.status === 'done') {
          setPhase('done')
          await new Promise(r => setTimeout(r, 1000))
          if (alive) navigate({ name: 'resultados', jobId, expertId, liveTitle })
          return
        } else if (job.status === 'error') {
          setError(job.error || 'Erro no processamento')
          return
        }

        timer = setTimeout(poll, 2500)
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Falha na conexão com o servidor')
      }
    }

    // fase inicial: já foi feito o upload e transcribe foi chamado
    setPhase('transcribe')
    timer = setTimeout(poll, 3000)

    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [jobId, presetId, expertId, liveTitle, navigate, preset.durationRange])

  const currentIdx = phaseIndex(phase)

  return (
    <div style={{
      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 32,
    }}>
      <div style={{ width: '100%', maxWidth: 520, animation: 'fadeIn 0.3s ease-out' }}>

        {/* Expert badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32,
          padding: '10px 16px', background: expert.colorMuted,
          border: `1px solid ${expert.color}30`, borderRadius: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: expert.colorMuted, border: `1px solid ${expert.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: expert.color,
          }}>
            {expert.initials}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{liveTitle}</div>
            <div style={{ fontSize: 12, color: expert.color }}>{expert.name} · {preset.icon} {preset.name}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Gerando cortes...</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 32 }}>
          {momentCount != null
            ? `${momentCount} momentos detectados · aplicando identidade do expert`
            : 'Analisando seu vídeo com IA'}
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.filter(s => s.phase !== 'done').map((step, i) => {
            const done = i < currentIdx
            const active = i === currentIdx

            return (
              <div key={step.phase} style={{ display: 'flex', gap: 16 }}>
                {/* Indicator column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? expert.color : active ? expert.colorMuted : 'var(--bg-surface)',
                    border: done ? 'none' : active ? `2px solid ${expert.color}` : '2px solid var(--border)',
                    transition: 'all 0.3s',
                  }}>
                    {done ? (
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
                    ) : active ? (
                      <div className="animate-spin" style={{
                        width: 10, height: 10, border: `2px solid ${expert.color}40`,
                        borderTopColor: expert.color, borderRadius: '50%',
                      }} />
                    ) : (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                    )}
                  </div>
                  {i < STEPS.filter(s => s.phase !== 'done').length - 1 && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 20, margin: '4px 0',
                      background: done ? expert.color : 'var(--border)',
                      transition: 'background 0.3s',
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ paddingBottom: 20 }}>
                  <div style={{
                    fontSize: 14, fontWeight: active ? 600 : 500,
                    color: done ? 'var(--text-secondary)' : active ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'color 0.3s',
                  }}>
                    {step.label}
                  </div>
                  {active && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {step.detail}
                    </div>
                  )}
                  {step.phase === 'transcribe' && phase === 'transcribe' && transcriptionProgress > 0 && transcriptionProgress < 100 && (
                    <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                      Transcrevendo... {transcriptionProgress}%
                      <div style={{ height: 4, background: '#1e293b', borderRadius: 2, marginTop: 4 }}>
                        <div style={{ height: '100%', width: `${transcriptionProgress}%`, background: expert.color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 24, padding: '12px 16px', borderRadius: 8,
            background: '#EF444415', border: '1px solid #EF444430',
            color: '#EF4444', fontSize: 13,
          }}>
            {error === 'job_not_found' ? (
              <>
                <strong>O servidor reiniciou e o job expirou.</strong>
                <br />
                <span style={{ fontSize: 12, opacity: 0.8 }}>Faça o upload do vídeo novamente.</span>
                <br />
                <button
                  onClick={() => navigate({ name: 'inbox' })}
                  style={{
                    marginTop: 10, padding: '8px 16px', borderRadius: 6,
                    background: '#EF444425', border: '1px solid #EF444450',
                    color: '#EF4444', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  }}
                >
                  ← Voltar e reenviar
                </button>
              </>
            ) : (
              <>
                <strong>
                  {error === 'server_restart'
                    ? 'O servidor reiniciou durante a transcrição.'
                    : `Erro: ${error}`}
                </strong>
                <br />
                <button
                  disabled={retrying}
                  onClick={async () => {
                    setRetrying(true)
                    setError(null)
                    processed.current = false
                    try {
                      await fetch(`${BASE}/retry/${jobId}`, { method: 'POST' })
                      setPhase('transcribe')
                      setTranscriptionProgress(0)
                    } catch {
                      setError('Falha ao reconectar. Tente recarregar a página.')
                    } finally {
                      setRetrying(false)
                    }
                  }}
                  style={{
                    marginTop: 10, padding: '8px 16px', borderRadius: 6,
                    background: '#EF444425', border: '1px solid #EF444450',
                    color: '#EF4444', fontWeight: 600, fontSize: 12,
                    cursor: retrying ? 'not-allowed' : 'pointer',
                  }}
                >
                  {retrying ? 'Reconectando...' : '↺ Retranscrever agora'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
