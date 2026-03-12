import { ArrowRight, CheckCircle } from 'lucide-react';
import { GlassCard, Btn, G } from '../design-system';
import { useMode, MODE_CONFIG } from '../store/modeContext';

export const SeletorModo = () => {
  const { mode, setMode } = useMode();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <GlassCard style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>🧭</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Seletor de Modo de Inteligência</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          Escolha a fonte de dados que vai alimentar todos os agentes. O motor de criação é o mesmo — só a fonte muda.
        </p>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {(Object.values(MODE_CONFIG)).map(m => {
          const isActive = mode === m.id;
          return (
            <GlassCard
              key={m.id}
              style={{
                padding: '28px', cursor: 'pointer',
                border: isActive ? `2px solid ${m.color}` : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? `${m.color}10` : undefined,
                boxShadow: isActive ? `0 0 30px ${m.color}20` : undefined,
                transition: 'all 0.3s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ fontSize: '40px' }}>{m.emoji}</div>
                {isActive && <CheckCircle size={22} color={m.color} />}
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '800', color: isActive ? m.color : '#fff', marginBottom: '8px' }}>{m.label}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>{m.description}</p>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px' }}>ALIMENTA DE:</div>
                {m.sources.map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isActive ? m.color : 'var(--text-secondary)', marginBottom: '4px' }}>
                    <ArrowRight size={10} /> {s}
                  </div>
                ))}
              </div>

              <Btn
                label={isActive ? '✓ Modo Ativo' : `Ativar ${m.label}`}
                variant={isActive ? 'success' : 'primary'}
                onClick={() => setMode(m.id)}
                icon={isActive ? CheckCircle : undefined}
              />
            </GlassCard>
          );
        })}
      </div>

      {/* Regra de ouro */}
      <GlassCard style={{ background: 'rgba(255,255,255,0.02)', padding: '20px' }}>
        <div style={{ fontSize: '11px', color: G.colors.warning, fontWeight: '700', marginBottom: '10px', letterSpacing: '0.5px' }}>⚡ REGRA DO SISTEMA</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            'Ambos os modos usam o mesmo motor de mineração e o mesmo Cérebro Criativo',
            'A diferença é APENAS a fonte de alimentação',
            'Outputs sempre adaptados para iGaming, independente do modo',
            'Todo insight mostra de qual modo e fonte veio',
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: G.colors.success, flexShrink: 0 }}>✓</span>
              <span style={{ color: 'var(--text-secondary)' }}>{r}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
