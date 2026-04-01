import { useEffect, useState } from 'react'
import { getJob } from '../services/api'
import type { EditorPage } from '../types'

const MESSAGES = [
  'Analisando vídeo...',
  'Detectando fala e silêncio...',
  'Aplicando estrutura de criativo...',
  'Mapeando momentos chave...',
  'Preparando para o editor...',
]

interface Props {
  jobId: string
  filename: string
  navigate: (p: EditorPage) => void
}

export default function EditorProcessing({ jobId, filename, navigate }: Props) {
  const [msgIdx, setMsgIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Cycle through messages
  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length)
    }, 1800)
    return () => clearInterval(t)
  }, [])

  // Poll backend
  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout>

    async function poll() {
      if (!alive) return
      try {
        const job = await getJob(jobId)
        if (job.status === 'ready' || job.status === 'done') {
          if (alive) navigate({ name: 'templates', jobId, filename })
          return
        }
        if (job.status === 'error') {
          setError(job.error || 'Erro no processamento')
          return
        }
        timer = setTimeout(poll, 2500)
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Falha na conexão')
      }
    }

    timer = setTimeout(poll, 3000)
    return () => { alive = false; clearTimeout(timer) }
  }, [jobId, filename, navigate])

  return (
    <div style={{
      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
    }}>
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
        {/* Video preview mock */}
        <div style={{
          width: 120, height: 213, borderRadius: 16, margin: '0 auto 32px',
          background: 'linear-gradient(180deg, #6366F120, #EC489910)',
          border: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 36 }}>🎬</div>
          {/* Scanning line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #6366F1, transparent)',
            animation: 'scanLine 2s linear infinite',
          }} />
        </div>

        <style>{`
          @keyframes scanLine {
            0% { top: 0; }
            100% { top: 100%; }
          }
        `}</style>

        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Processando</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{filename}</div>
        <div
          key={msgIdx}
          style={{ fontSize: 13, color: '#6366F1', marginTop: 16, animation: 'fadeIn 0.4s ease-out' }}
        >
          {MESSAGES[msgIdx]}
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 6, height: 6, borderRadius: '50%', background: '#6366F1',
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{
            marginTop: 24, padding: '12px 16px', borderRadius: 8,
            background: '#EF444415', border: '1px solid #EF444430',
            color: '#EF4444', fontSize: 13, maxWidth: 360,
          }}>
            <strong>Erro:</strong> {error}
            <br /><span style={{ fontSize: 12, opacity: 0.8 }}>Verifique se o backend está online</span>
          </div>
        )}
      </div>
    </div>
  )
}
