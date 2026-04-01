import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Sparkles, ChevronDown, Trash2, Zap } from 'lucide-react'
import { useSkills, type Skill } from '../hooks/useSkills'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  context: {
    module: string
    page: string
    videoContext?: string
  }
}

const API_KEY = (import.meta as { env: Record<string, string> }).env.VITE_ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `Você é o assistente de IA embutido no HFIVE IA — dashboard interno de produção de vídeo para BINGOBET/iGaming.

O sistema tem dois módulos principais:
- **Módulo Cortes**: Clona o Opus Clip — Upload → Recorte de IA (ClipAnything) → Transcrição Whisper → Detecção de momentos → Processamento FFmpeg → Exportação
- **Módulo Criativos**: Clona o Captions AI — Templates → Editor rápido → Variações → Exportação

Experts do sistema: Lucas Striz (#6366F1), Suh Aviator (#EC4899), Iris Thaize (#10B981), Caio Roleta (#F59E0B).

Backend: FastAPI + FFmpeg + Whisper em Python (cortador-backend/).
Frontend: React 19 + TypeScript + Vite, sem Tailwind, inline styles, tema dark.
Fluxo visual: React Flow (@xyflow/react) com nós arrastáveis e persistência em localStorage.

Seu papel:
- Ajudar a entender o status do fluxo de produção
- Sugerir ajustes no processo
- Explicar erros técnicos de forma clara
- Orientar sobre funcionalidades do dashboard
- Ser direto e objetivo — respostas curtas e práticas

Contexto atual é passado em cada mensagem. Responda sempre em português.`

function formatContent(text: string): React.ReactNode {
  // Simple markdown: **bold**, \n, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#e0e0e0' }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ background: '#1a1a2e', padding: '1px 5px', borderRadius: 4, fontSize: 11, color: '#38BDF8', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>
    }
    if (part === '\n') return <br key={i} />
    return part
  })
}

export default function AiAssistant({ context }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skillRunning, setSkillRunning] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { skills, executeSkill } = useSkills()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError(null)

    if (!API_KEY) {
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'API key não configurada. Adicione `VITE_ANTHROPIC_API_KEY` no arquivo `.env` do dashboard-app.',
      }])
      setLoading(false)
      return
    }

    try {
      const contextNote = `[Contexto atual: módulo="${context.module}" página="${context.page}"]`
      const apiMessages = next.map((m, i) => ({
        role: m.role,
        content: i === 0 ? `${contextNote}\n\n${m.content}` : m.content,
      }))

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`)
      }

      const data = await res.json() as { content: { type: string; text: string }[] }
      const reply = data.content.find(c => c.type === 'text')?.text ?? ''
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      setError(msg)
      setMessages(m => [...m, { role: 'assistant', content: `Erro: ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  async function runSkill(skill: Skill) {
    setSkillRunning(skill.slug)
    const ctx = context.videoContext || context.page
    const userMsg: Message = { role: 'user', content: `[Skill: ${skill.name}] Contexto: ${ctx}` }
    setMessages(m => [...m, userMsg])
    setLoading(true)
    try {
      const result = await executeSkill(skill, {
        contexto: ctx,
        objetivo: 'engajamento e conversão',
        transcricao: ctx,
      })
      setMessages(m => [...m, { role: 'assistant', content: result }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: `Erro ao executar skill ${skill.name}.` }])
    } finally {
      setLoading(false)
      setSkillRunning(null)
    }
  }

  const hasKey = !!API_KEY

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Assistente IA"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 900,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: open
            ? '#0d0d1a'
            : 'linear-gradient(135deg, #38BDF8, #818CF8 50%, #F472B6)',
          color: open ? '#38BDF8' : '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: open
            ? '0 0 0 2px rgba(56,189,248,0.4)'
            : '0 0 24px rgba(56,189,248,0.3), 0 0 48px rgba(244,114,182,0.15)',
          transition: 'all 0.2s',
          outline: open ? '1px solid rgba(56,189,248,0.3)' : 'none',
        } as React.CSSProperties}
      >
        {open ? <ChevronDown size={20} /> : <Bot size={22} />}

        {/* Unread dot */}
        {!open && messages.length > 0 && (
          <div style={{
            position: 'absolute', top: 2, right: 2,
            width: 10, height: 10, borderRadius: '50%',
            background: '#F472B6',
            boxShadow: '0 0 6px #F472B6',
            border: '2px solid #06060e',
          }} />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 86, right: 24, zIndex: 900,
          width: 380, height: 520,
          background: '#0a0a12',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 0 60px rgba(0,0,0,0.6), 0 0 40px rgba(56,189,248,0.08)',
          animation: 'fadeIn 0.2s ease-out',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(56,189,248,0.12)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, rgba(56,189,248,0.06), rgba(244,114,182,0.03))',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(244,114,182,0.15))',
              border: '1px solid rgba(56,189,248,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={15} style={{ color: '#38BDF8' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0' }}>Assistente HFIVE</div>
              <div style={{ fontSize: 10, color: '#38BDF880' }}>
                {context.module} · {context.page}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  title="Limpar conversa"
                  style={{
                    width: 28, height: 28, borderRadius: 7, border: '1px solid #1e1e32',
                    background: 'transparent', color: '#334155',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 28, height: 28, borderRadius: 7, border: '1px solid #1e1e32',
                  background: 'transparent', color: '#334155',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* API key warning */}
          {!hasKey && (
            <div style={{
              margin: 12, padding: '10px 12px', borderRadius: 8,
              background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)',
              fontSize: 11, color: '#F472B6', lineHeight: 1.5,
            }}>
              Adicione <code style={{ background: '#1a1a2e', padding: '1px 4px', borderRadius: 3 }}>VITE_ANTHROPIC_API_KEY=sk-ant-...</code> no arquivo <code style={{ background: '#1a1a2e', padding: '1px 4px', borderRadius: 3 }}>dashboard-app/.env</code> e reinicie o servidor.
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.4 }}>🤖</div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                  Olá! Sou o assistente do HFIVE IA.<br />
                  Pergunte sobre o fluxo, erros, ou<br />
                  como usar qualquer funcionalidade.
                </div>
                {/* Quick starters */}
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    'Como funciona o Recorte de IA?',
                    'Qual o fluxo completo de cortes?',
                    'Como conectar nós no fluxo?',
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); inputRef.current?.focus() }}
                      style={{
                        padding: '7px 12px', borderRadius: 8, fontSize: 11,
                        background: '#0d0d1a', border: '1px solid #1a1a2e',
                        color: '#64748B', cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLButtonElement
                        el.style.borderColor = 'rgba(56,189,248,0.3)'
                        el.style.color = '#9ca3af'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLButtonElement
                        el.style.borderColor = '#1a1a2e'
                        el.style.color = '#64748B'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Skills do banco */}
                {skills.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{
                      fontSize: 10, color: '#38BDF860', textTransform: 'uppercase',
                      letterSpacing: '0.08em', marginBottom: 8,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Zap size={10} />
                      Skills ativas
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {skills.map(skill => (
                        <button
                          key={skill.slug}
                          onClick={() => runSkill(skill)}
                          disabled={!!skillRunning}
                          title={skill.description}
                          style={{
                            padding: '5px 10px', borderRadius: 20, fontSize: 10,
                            background: skillRunning === skill.slug
                              ? 'rgba(56,189,248,0.15)'
                              : '#0d0d1a',
                            border: `1px solid ${skill.category === 'copy' ? 'rgba(244,114,182,0.3)' : skill.category === 'corte' ? 'rgba(56,189,248,0.3)' : 'rgba(129,140,248,0.3)'}`,
                            color: skill.category === 'copy' ? '#F472B6' : skill.category === 'corte' ? '#38BDF8' : '#818CF8',
                            cursor: skillRunning ? 'not-allowed' : 'pointer',
                            opacity: skillRunning && skillRunning !== skill.slug ? 0.4 : 1,
                            transition: 'all 0.15s',
                          }}
                        >
                          {skillRunning === skill.slug ? '...' : skill.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: 8, alignItems: 'flex-start',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: msg.role === 'user'
                    ? 'rgba(56,189,248,0.2)'
                    : 'rgba(244,114,182,0.15)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(56,189,248,0.3)' : 'rgba(244,114,182,0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12,
                }}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '80%', padding: '9px 12px', borderRadius: 10,
                  background: msg.role === 'user'
                    ? 'rgba(56,189,248,0.1)'
                    : '#0f0f1a',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(56,189,248,0.2)' : '#1a1a2e'}`,
                  fontSize: 12, color: '#ccc', lineHeight: 1.6,
                }}>
                  {formatContent(msg.content)}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(244,114,182,0.15)',
                  border: '1px solid rgba(244,114,182,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                }}>🤖</div>
                <div style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: '#0f0f1a', border: '1px solid #1a1a2e',
                  display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 5, height: 5, borderRadius: '50%', background: '#38BDF8',
                      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                padding: '8px 12px', borderRadius: 8, fontSize: 11,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444',
              }}>
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(56,189,248,0.1)',
            display: 'flex', gap: 8, alignItems: 'flex-end',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Pergunte sobre o fluxo, erros, funcionalidades..."
              rows={1}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 10,
                background: '#0d0d1a',
                border: `1px solid ${input ? 'rgba(56,189,248,0.3)' : '#1a1a2e'}`,
                color: '#e0e0e0', fontSize: 12, outline: 'none',
                resize: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                maxHeight: 80, overflow: 'auto',
                transition: 'border-color 0.15s',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #38BDF8, #F472B6)'
                  : '#1a1a2e',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: input.trim() && !loading ? '#000' : '#334155',
                transition: 'all 0.15s',
                boxShadow: input.trim() && !loading ? '0 0 12px rgba(56,189,248,0.25)' : 'none',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
