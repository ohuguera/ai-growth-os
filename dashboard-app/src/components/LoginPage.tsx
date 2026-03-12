import { useState } from 'react';
import { Zap, Lock, LogIn, AlertCircle } from 'lucide-react';
import { G } from '../design-system';

export const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (code === '007REALS') {
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000', position: 'relative', overflow: 'hidden'
    }}>
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      <div className={`glass-panel fade-in ${shake ? 'shake-anim' : ''}`} style={{
        width: '100%', maxWidth: '420px', padding: '48px 40px',
        textAlign: 'center', zIndex: 10
      }}>
        {/* Logo */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px',
          background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', boxShadow: '0 0 40px rgba(10,132,255,0.4)'
        }}>
          <Zap size={36} color="#fff" />
        </div>

        <h1 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          <span style={{ background: 'linear-gradient(135deg,#0A84FF,#BF5AF2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI Growth OS
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '40px' }}>
          Sistema Inteligente de Crescimento iGaming
        </p>

        <div style={{ marginBottom: '16px', textAlign: 'left' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', fontWeight: '600', letterSpacing: '0.5px' }}>
            CÓDIGO DE ACESSO
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              placeholder="Digite o código de acesso"
              value={code}
              onChange={e => { setCode(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '14px 16px 14px 44px',
                background: error ? 'rgba(255,59,48,0.05)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? G.colors.danger : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '10px', color: '#fff', fontSize: '15px',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
                letterSpacing: '4px', transition: 'all 0.2s'
              }}
            />
          </div>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: G.colors.danger, fontSize: '12px', marginTop: '8px' }}>
              <AlertCircle size={12} /> Código inválido. Tente novamente.
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
            background: 'linear-gradient(135deg, #0A84FF, #BF5AF2)',
            color: '#fff', fontSize: '15px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(10,132,255,0.3)'
          }}
          className="btn-hover"
        >
          <LogIn size={18} /> Acessar Sistema
        </button>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '32px' }}>
          Synkra AI Growth OS v2.0 · Acesso Restrito
        </p>
      </div>
    </div>
  );
};
