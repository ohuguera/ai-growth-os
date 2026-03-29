import { useState, useEffect } from 'react'
import { X, Sparkles, Wand2, Film, ChevronRight, Loader2, Brain } from 'lucide-react'
import type { PresetId } from '../types'
import { PRESETS } from '../data/experts'
import { fetchSkillsByCategory, analisarMomento } from '../services/skillsService'
import type { Skill } from '../services/skillsService'

interface Props {
  file: File
  presetId: PresetId
  uploading: boolean
  onClose: () => void
  onSubmit: (prompt: string) => void
}

const EXAMPLES = [
  'Momentos com maiores ganhos e reações explosivas',
  'Ensina uma estratégia ou dica importante',
  'Virada incrível ou momento épico',
  'Quando o expert comemora algum resultado',
  'Frases de impacto que vão viralizar',
  'Momento engraçado ou inesperado',
]

const CATEGORIES = [
  { label: '🔥 Virais', color: '#F472B6' },
  { label: '💰 Ganhos', color: '#10B981' },
  { label: '🎓 Educativo', color: '#38BDF8' },
  { label: '😂 Humor', color: '#F59E0B' },
  { label: '💎 Autoridade', color: '#A78BFA' },
  { label: '📈 Resultados', color: '#34D399' },
]

export default function RecorteIA({ file, presetId, uploading, onClose, onSubmit }: Props) {
  const [prompt, setPrompt] = useState('')
  const [corteSkills, setCorteSkills] = useState<Skill[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const preset = PRESETS.find(p => p.id === presetId)!
  const fileMB = (file.size / 1024 / 1024).toFixed(1)

  useEffect(() => {
    fetchSkillsByCategory('corte')
      .then(skills => setCorteSkills(skills))
      .catch(console.error)
  }, [])

  async function handleAnalyzeWithAI() {
    if (!prompt) return
    setAnalyzing(true)
    setAiSuggestion(null)
    try {
      const { output } = await analisarMomento(prompt)
      setAiSuggestion(output)
    } catch (e) {
      console.error('Skill error:', e)
    } finally {
      setAnalyzing(false)
    }
  }

  function handleExample(ex: string) {
    setPrompt(ex)
    setAiSuggestion(null)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.03,
      }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0, top: `${i * 2.5}%`, height: 1, background: '#38BDF8',
          }} />
        ))}
      </div>

      <div style={{
        position: 'absolute', top: '20%', left: '20%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '20%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 900,
        background: '#0a0a12',
        border: '1px solid #38BDF830',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        boxShadow: '0 0 60px rgba(56,189,248,0.1), 0 0 120px rgba(244,114,182,0.05)',
        animation: 'fadeIn 0.25s ease-out',
        position: 'relative',
        maxHeight: '92vh',
      }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: 280, flexShrink: 0,
          background: '#050508',
          borderRight: '1px solid #38BDF815',
          display: 'flex', flexDirection: 'column',
          padding: 24,
        }}>
          {/* Video preview */}
          <div style={{
            aspectRatio: '9/16', background: '#0a0a16',
            borderRadius: 12, overflow: 'hidden',
            border: '1px solid #38BDF820',
            position: 'relative', marginBottom: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            maxHeight: 240,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.08) 0%, rgba(244,114,182,0.04) 50%, transparent 75%)',
            }} />
            {[{t:8,l:8,bT:'2px solid #38BDF8',bL:'2px solid #38BDF8'},{t:8,r:8,bT:'2px solid #F472B6',bR:'2px solid #F472B6'},{b:8,l:8,bB:'2px solid #F472B6',bL:'2px solid #F472B6'},{b:8,r:8,bB:'2px solid #38BDF8',bR:'2px solid #38BDF8'}].map((c,i)=>(
              <div key={i} style={{position:'absolute',width:12,height:12,borderRadius:2,...Object.fromEntries(Object.entries(c).map(([k,v])=>[k==='t'?'top':k==='b'?'bottom':k==='l'?'left':k==='r'?'right':k==='bT'?'borderTop':k==='bB'?'borderBottom':k==='bL'?'borderLeft':k==='bR'?'borderRight':k,v]))}} />
            ))}
            <Film size={28} style={{ color: '#38BDF840', position: 'relative', zIndex: 1 }} />
            <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', color: '#38BDF8',
              }}>
                {preset.icon} {preset.name}
              </div>
            </div>
          </div>

          {/* File info */}
          <div style={{
            padding: '10px 12px', background: '#0f0f1a',
            borderRadius: 8, border: '1px solid #1a1a2e', marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#e0e0e0', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </div>
            <div style={{ fontSize: 10, color: '#444' }}>{fileMB} MB · Pronto para análise</div>
          </div>

          {/* Skills de corte do Supabase */}
          {corteSkills.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#38BDF860', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Skills ativas
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {corteSkills.map(skill => (
                  <div key={skill.id} style={{
                    padding: '6px 10px', borderRadius: 8,
                    background: 'rgba(56,189,248,0.06)',
                    border: '1px solid rgba(56,189,248,0.15)',
                    fontSize: 11, color: '#38BDF8',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Brain size={10} />
                    {skill.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 6px #38BDF8' }} />
            <span style={{ fontSize: 10, color: '#38BDF880', fontWeight: 600, letterSpacing: '0.08em' }}>
              POWERED BY HFIVE IA
            </span>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {/* Header */}
          <div style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid #38BDF815',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(244,114,182,0.2))',
                  border: '1px solid rgba(56,189,248,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Wand2 size={16} style={{ color: '#38BDF8' }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', color: '#fff' }}>
                    Recorte de IA
                  </div>
                  <div style={{ fontSize: 11, color: '#38BDF8', fontWeight: 500 }}>
                    ClipAnything · Powered by HFIVE
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
                Descreva quais momentos você quer extrair.<br />
                A IA vai analisar e selecionar os melhores trechos.
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#64748B', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, padding: '20px 28px', overflow: 'auto' }}>
            {/* Prompt textarea */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                fontSize: 11, fontWeight: 700, color: '#38BDF8',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                display: 'block', marginBottom: 8,
              }}>
                Seu Prompt de Corte
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={prompt}
                  onChange={e => { setPrompt(e.target.value); setAiSuggestion(null) }}
                  placeholder="Ex: Mostre os momentos com maiores ganhos, reações explosivas e frases de impacto..."
                  rows={4}
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: '#0d0d1a',
                    border: `1px solid ${prompt ? '#38BDF850' : '#1a1a2e'}`,
                    borderRadius: 12, color: '#e0e0e0', fontSize: 14,
                    resize: 'vertical', outline: 'none', lineHeight: 1.6,
                    boxShadow: prompt ? '0 0 20px rgba(56,189,248,0.08)' : 'none',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                  }}
                />
                {prompt && (
                  <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 10, color: '#38BDF860' }}>
                    <Sparkles size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                    Prompt ativo
                  </div>
                )}
              </div>

              {/* Botão analisar com IA */}
              {prompt && !analyzing && !aiSuggestion && (
                <button
                  onClick={handleAnalyzeWithAI}
                  style={{
                    marginTop: 8,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)',
                    color: '#38BDF8', cursor: 'pointer',
                  }}
                >
                  <Brain size={12} />
                  Analisar com IA antes de cortar
                </button>
              )}

              {analyzing && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#38BDF880' }}>
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  Analisando com IA...
                </div>
              )}

              {/* Sugestão da IA */}
              {aiSuggestion && (
                <div style={{
                  marginTop: 10, padding: '12px 14px',
                  background: 'rgba(56,189,248,0.06)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: 10, fontSize: 12, color: '#94a3b8', lineHeight: 1.6,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#38BDF8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Análise IA
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{aiSuggestion}</div>
                </div>
              )}
            </div>

            {/* Category pills */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Categorias rápidas
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(prev => prev ? `${prev} · ${cat.label.split(' ').slice(1).join(' ')}` : cat.label.split(' ').slice(1).join(' '))}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: `${cat.color}12`, border: `1px solid ${cat.color}30`,
                      color: cat.color, cursor: 'pointer', transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${cat.color}25` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${cat.color}12` }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Examples */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Exemplos de prompt
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleExample(ex)}
                    style={{
                      textAlign: 'left', padding: '9px 12px', borderRadius: 8,
                      background: '#0d0d1a',
                      border: `1px solid ${prompt === ex ? '#38BDF840' : '#1a1a2e'}`,
                      color: prompt === ex ? '#38BDF8' : '#64748B',
                      fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = '#38BDF830'; el.style.color = '#9ca3af' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = prompt === ex ? '#38BDF840' : '#1a1a2e'; el.style.color = prompt === ex ? '#38BDF8' : '#64748B' }}
                  >
                    <ChevronRight size={12} style={{ flexShrink: 0, opacity: 0.5 }} />
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 28px 24px',
            borderTop: '1px solid #38BDF815',
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <button
              onClick={() => onSubmit('')}
              disabled={uploading}
              style={{
                padding: '11px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: 'transparent', border: '1px solid #1a1a2e',
                color: '#64748B', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
              }}
            >
              Auto-detectar
            </button>

            <button
              onClick={() => onSubmit(prompt)}
              disabled={uploading}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, fontWeight: 800, fontSize: 15,
                background: uploading
                  ? '#1a1a2e'
                  : 'linear-gradient(135deg, #38BDF8, #818CF8 50%, #F472B6)',
                color: uploading ? '#64748B' : '#000',
                border: 'none',
                cursor: uploading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.2px',
                boxShadow: uploading ? 'none' : '0 0 24px rgba(56,189,248,0.25), 0 0 48px rgba(244,114,182,0.1)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {uploading ? (
                <>
                  <div style={{
                    width: 14, height: 14, border: '2px solid #38BDF830',
                    borderTopColor: '#38BDF8', borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  Processando...
                </>
              ) : (
                <>
                  <Wand2 size={15} />
                  {prompt ? 'Gerar cortes com IA →' : 'Gerar cortes →'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
