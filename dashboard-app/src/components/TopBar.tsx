import { Zap, Radio } from 'lucide-react';
import { useMode } from '../store/modeContext';
import { G } from '../design-system';

export const TopBar = () => {
  const { mode, setMode, config } = useMode();

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '12px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', flexWrap: 'wrap',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#0A84FF,#BF5AF2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color="#fff" />
        </div>
        <span style={{ fontWeight: '800', fontSize: '16px', background: 'linear-gradient(135deg,#0A84FF,#BF5AF2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI Growth OS
        </span>
      </div>

      {/* Mode Switcher — centro */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '4px' }}>
        <button
          onClick={() => setMode('igaming')}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: '700', fontSize: '13px', transition: 'all 0.25s',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: mode === 'igaming' ? 'linear-gradient(135deg,#0A84FF,#30D158)' : 'transparent',
            color: mode === 'igaming' ? '#fff' : 'var(--text-secondary)',
            boxShadow: mode === 'igaming' ? '0 4px 16px rgba(10,132,255,0.4)' : 'none',
          }}
        >
          🎰 Modo iGaming
        </button>
        <button
          onClick={() => setMode('grandes_marcas')}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontWeight: '700', fontSize: '13px', transition: 'all 0.25s',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: mode === 'grandes_marcas' ? 'linear-gradient(135deg,#BF5AF2,#FF9500)' : 'transparent',
            color: mode === 'grandes_marcas' ? '#fff' : 'var(--text-secondary)',
            boxShadow: mode === 'grandes_marcas' ? '0 4px 16px rgba(191,90,242,0.4)' : 'none',
          }}
        >
          🏢 Modo Grandes Marcas
        </button>
      </div>

      {/* Status do modo ativo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600',
          color: config.color, background: `${config.color}15`,
          border: `1px solid ${config.color}30`, borderRadius: '20px', padding: '5px 12px',
        }}>
          <Radio size={11} />
          Alimentando de: {config.sources[0]}
          {config.sources.length > 1 && ` +${config.sources.length - 1}`}
        </div>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: G.colors.success,
          boxShadow: `0 0 8px ${G.colors.success}`,
          animation: 'pulse 2s infinite',
        }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
