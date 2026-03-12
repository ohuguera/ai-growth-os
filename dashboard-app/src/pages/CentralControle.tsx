import { TrendingUp, Calendar, Activity, Radio, ArrowRight } from 'lucide-react';
import { G, GlassCard, Badge, Btn } from '../design-system';
import { useMode } from '../store/modeContext';
import { trends } from '../data/trends';
import { events } from '../data/events';
import { AGENTS } from '../data/agents';

// Source Trail component reutilizável
export const SourceTrail = ({ mode, modeLabel, agentName, sourceName, color }: {
  mode: string; modeLabel: string; agentName: string; sourceName: string; color: string;
}) => (
  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
    <span style={{ fontSize: '10px', background: `${color}15`, color, border: `1px solid ${color}25`, borderRadius: '20px', padding: '2px 7px', fontWeight: '600' }}>
      {mode === 'igaming' ? '🎰' : '🏢'} {modeLabel}
    </span>
    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderRadius: '20px', padding: '2px 7px' }}>
      🤖 {agentName}
    </span>
    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderRadius: '20px', padding: '2px 7px' }}>
      📍 {sourceName}
    </span>
  </div>
);

export const CentralControle = () => {
  const { mode, config } = useMode();

  const metrics = mode === 'igaming'
    ? [
        { label: 'Concorrentes Monitorados', value: '40', delta: '20 Tier Alto + 20 Médio', color: G.colors.danger },
        { label: 'Vídeos Virais Detectados', value: '127', delta: '+34 hoje', color: G.colors.primary },
        { label: 'Hooks Extraídos', value: '89', delta: '+12 hoje', color: G.colors.secondary },
        { label: 'Roteiros Gerados', value: '23', delta: '+5 hoje', color: G.colors.success },
      ]
    : [
        { label: 'Marcas Monitoradas', value: '30', delta: 'Maiores do Brasil', color: G.colors.secondary },
        { label: 'Campanhas Analisadas', value: '214', delta: '+47 hoje', color: G.colors.primary },
        { label: 'Referências iGaming', value: '62', delta: '+9 adaptações', color: G.colors.warning },
        { label: 'Roteiros Gerados', value: '18', delta: '+3 hoje', color: G.colors.success },
      ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Modo ativo banner */}
      <GlassCard style={{ background: `linear-gradient(135deg, ${config.color}15, transparent)`, border: `1px solid ${config.color}30`, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: config.color, fontWeight: '700', marginBottom: '6px', letterSpacing: '1px' }}>MODO ATIVO</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px' }}>{config.label} {config.emoji}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{config.description}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '2px' }}>ALIMENTANDO DE:</div>
            {config.sources.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: config.color }}>
                <ArrowRight size={10} /> {s}
              </div>
            ))}
          </div>
          <Btn icon={Radio} label="Atualizar Dados" variant="action" />
        </div>
      </GlassCard>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {metrics.map(m => (
          <GlassCard key={m.label} style={{ padding: '20px', textAlign: 'center' }}>
            <SourceTrail mode={mode} modeLabel={config.label} agentName="Central de Controle" sourceName={config.sources[0]} color={config.color} />
            <div style={{ fontSize: '32px', fontWeight: '800', color: m.color }}>{m.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0' }}>{m.label}</div>
            <div style={{ fontSize: '11px', color: G.colors.success }}>{m.delta}</div>
          </GlassCard>
        ))}
      </div>

      {/* Agentes ativos + tendências/eventos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>

        {/* Agentes */}
        <GlassCard>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color={G.colors.success} /> Agentes Ativos
          </h3>
          {AGENTS.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{a.emoji}</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600' }}>{a.name.split(' ').slice(-2).join(' ')}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{a.progress}%</div>
                </div>
              </div>
              <Badge label={a.status} color={a.status === 'ativo' ? G.colors.success : a.status === 'processando' ? G.colors.warning : G.colors.secondary} />
            </div>
          ))}
        </GlassCard>

        {/* Tendências */}
        <GlassCard>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color={config.color} /> Tendências Quentes
          </h3>
          {trends.slice(0, 4).map((t, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <SourceTrail mode={mode} modeLabel={config.label} agentName="Minerador de Vídeos" sourceName={t.platform} color={config.color} />
              <div style={{ fontSize: '12px', fontWeight: '600' }}>{t.name}</div>
            </div>
          ))}
        </GlassCard>

        {/* Próximos eventos */}
        <GlassCard>
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color={G.colors.copy} /> Próximos Eventos
          </h3>
          {events.slice(0, 4).map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '22px' }}>{e.emoji}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>{e.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{e.date}</div>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
};
