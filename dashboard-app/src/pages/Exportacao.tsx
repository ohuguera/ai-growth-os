import { useEffect, useState } from 'react'
import { ArrowLeft, Download, CheckCircle2, RotateCcw } from 'lucide-react'
import { getJob, downloadUrl } from '../services/api'
import { TEMPLATES } from '../data/templates'
import type { EditorPage, Clip } from '../types'

interface Props {
  jobId: string
  filename: string
  templateId: string
  navigate: (p: EditorPage) => void
}

export default function Exportacao({ jobId, filename, templateId, navigate }: Props) {
  const tmpl = TEMPLATES.find(t => t.id === templateId)
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    let alive = true
    let timer: ReturnType<typeof setTimeout>

    async function check() {
      try {
        const job = await getJob(jobId)
        if (job.status === 'done') {
          if (alive) { setClips(job.clips || []); setLoading(false) }
          return
        }
        if (job.status === 'processing') {
          setPolling(true)
          timer = setTimeout(check, 2500)
        } else {
          setClips(job.clips || [])
          setLoading(false)
        }
      } catch (e) {
        console.error(e)
        if (alive) setLoading(false)
      }
    }

    check()
    return () => { alive = false; clearTimeout(timer) }
  }, [jobId])

  const doneClips = clips.filter(c => c.status === 'done')
  const [downloading, setDownloading] = useState(false)

  function autoName(i: number): string {
    const tmplName = tmpl?.name.replace(/\s+/g, '_') || 'criativo'
    return `${filename}_${tmplName}_v${i + 1}.mp4`
  }

  function downloadAll() {
    setDownloading(true)
    doneClips.forEach((clip, i) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = downloadUrl(clip.id)
        a.download = autoName(i)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        if (i === doneClips.length - 1) setDownloading(false)
      }, i * 600)
    })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Header */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate({ name: 'editor', jobId, filename, templateId })}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Voltar ao editor
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
        <div style={{ fontWeight: 700, fontSize: 16 }}>Exportação</div>
        {tmpl && (
          <div style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: tmpl.primaryColor + '20', color: tmpl.primaryColor,
          }}>
            {tmpl.emoji} {tmpl.name}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            {polling ? (
              <>
                <div className="animate-spin" style={{
                  width: 40, height: 40, border: '3px solid var(--border)',
                  borderTopColor: tmpl?.primaryColor || '#6366F1',
                  borderRadius: '50%', margin: '0 auto 20px',
                }} />
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Gerando criativo...</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Aplicando template e exportando vídeo</div>
              </>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>Carregando...</div>
            )}
          </div>
        ) : doneClips.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Nenhum arquivo gerado</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
              O processamento pode ter falhado. Tente novamente.
            </div>
            <button
              onClick={() => navigate({ name: 'editor', jobId, filename, templateId })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text-secondary)', fontSize: 13, margin: '0 auto',
              }}
            >
              <RotateCcw size={14} /> Tentar novamente
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 600 }}>
            {/* Success header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <CheckCircle2 size={40} style={{ color: '#10B981', marginBottom: 12 }} />
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                {doneClips.length === 1 ? 'Criativo pronto!' : `${doneClips.length} criativos prontos!`}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {filename} · {tmpl?.name}
              </div>
            </div>

            {/* Download cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {doneClips.map((clip, i) => (
                <div
                  key={clip.id}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
                    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                    animation: 'fadeIn 0.2s ease-out',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: tmpl ? tmpl.bgGradient : 'var(--bg-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    🎬
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{autoName(i)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {Math.round(clip.end - clip.start)}s · MP4 · Pronto para publicar
                    </div>
                  </div>

                  <div style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: '#10B98120', color: '#10B981',
                  }}>
                    ✓ Pronto
                  </div>

                  <a
                    href={downloadUrl(clip.id)}
                    download={autoName(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                      background: (tmpl?.primaryColor || '#6366F1') + '20',
                      border: `1px solid ${(tmpl?.primaryColor || '#6366F1')}40`,
                      borderRadius: 8, color: tmpl?.primaryColor || '#6366F1',
                      fontWeight: 600, fontSize: 12,
                    }}
                  >
                    <Download size={13} /> Baixar
                  </a>
                </div>
              ))}
            </div>

            {/* Download all */}
            {doneClips.length > 1 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button
                  onClick={downloadAll}
                  disabled={downloading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                    background: downloading ? 'var(--bg-surface)' : (tmpl?.primaryColor || '#6366F1'),
                    color: downloading ? 'var(--text-secondary)' : '#fff',
                    border: downloading ? '1px solid var(--border)' : 'none',
                    cursor: downloading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin" style={{
                        width: 14, height: 14, border: '2px solid var(--border)',
                        borderTopColor: 'var(--text-secondary)', borderRadius: '50%',
                      }} />
                      Baixando...
                    </>
                  ) : (
                    <><Download size={15} /> Baixar todos ({doneClips.length} arquivos)</>
                  )}
                </button>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button
                onClick={() => navigate({ name: 'home' })}
                style={{
                  flex: 1, padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Criar outro criativo
              </button>
              <button
                onClick={() => navigate({ name: 'variations', jobId, filename, templateId })}
                style={{
                  flex: 1, padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                Gerar variações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
