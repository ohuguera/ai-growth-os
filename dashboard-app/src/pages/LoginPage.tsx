import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface Props {
  onLogin: () => void
}

const CORRECT = (import.meta as { env: Record<string, string> }).env.VITE_APP_PASSWORD || '007REALS'

export default function LoginPage({ onLogin }: Props) {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === CORRECT) {
      sessionStorage.setItem('hfive_auth', '1')
      onLogin()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPassword('')
    }
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#06060e', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '25%', left: '30%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '25%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        width: 360, position: 'relative',
        animation: shake ? 'none' : 'fadeIn 0.3s ease-out',
        transform: shake ? 'translateX(0)' : undefined,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #38BDF8, #818CF8 50%, #F472B6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 0 32px rgba(56,189,248,0.3), 0 0 64px rgba(244,114,182,0.15)',
          }}>✂️</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: '#f1f5f9' }}>
            HFIVE IA
          </div>
          <div style={{ fontSize: 12, color: '#38BDF880', marginTop: 4, fontWeight: 500 }}>
            Sistema de Produção de Conteúdo
          </div>
        </div>

        {/* Form card */}
        <div style={{
          background: '#0a0a12',
          border: '1px solid rgba(56,189,248,0.15)',
          borderRadius: 16, padding: '28px 28px 24px',
          boxShadow: '0 0 60px rgba(0,0,0,0.5), 0 0 40px rgba(56,189,248,0.05)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e0e0e0', marginBottom: 4 }}>
            Acesso restrito
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 24 }}>
            Digite a senha para entrar no sistema
          </div>

          <form onSubmit={handleSubmit}>
            {/* Password input */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <div style={{
                position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                color: error ? '#EF4444' : '#38BDF860',
              }}>
                <Lock size={15} />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                placeholder="Senha de acesso"
                autoFocus
                style={{
                  width: '100%', padding: '12px 44px',
                  background: '#0d0d1a',
                  border: `1px solid ${error ? '#EF444440' : password ? 'rgba(56,189,248,0.3)' : '#1a1a2e'}`,
                  borderRadius: 10, color: '#e0e0e0', fontSize: 14,
                  outline: 'none', fontFamily: 'inherit',
                  boxShadow: error ? '0 0 12px rgba(239,68,68,0.1)' : password ? '0 0 16px rgba(56,189,248,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: 2,
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                fontSize: 11, color: '#EF4444', marginBottom: 14,
                padding: '7px 10px', borderRadius: 7,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              }}>
                Senha incorreta. Tente novamente.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              style={{
                width: '100%', padding: '12px',
                borderRadius: 10, fontWeight: 800, fontSize: 14,
                background: password
                  ? 'linear-gradient(135deg, #38BDF8, #818CF8 50%, #F472B6)'
                  : '#141420',
                border: 'none',
                color: password ? '#000' : '#334155',
                cursor: password ? 'pointer' : 'default',
                letterSpacing: '-0.2px',
                boxShadow: password ? '0 0 24px rgba(56,189,248,0.2)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Entrar
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: '#1e1e32', fontWeight: 600, letterSpacing: '0.1em' }}>
          BINGOBET · USO INTERNO
        </div>
      </div>
    </div>
  )
}
