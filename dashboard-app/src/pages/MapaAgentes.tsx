import { Activity, ArrowRight, Plus, Zap } from 'lucide-react';
import { GlassCard, Badge, G, Btn } from '../design-system';
import { AGENTS, type AgentDefinition } from '../data/agents';
import { useMode } from '../store/modeContext';

const AgentCard = ({ agent }: { agent: AgentDefinition }) => {
  const statusColor = agent.status === 'ativo' ? G.colors.success : agent.status === 'processando' ? G.colors.warning : G.colors.secondary;
  const statusLabel = agent.status === 'ativo' ? 'Ativo' : agent.status === 'processando' ? 'Processando' : 'Aguardando';

  return (
    <GlassCard style={{ padding: '18px', border: `1px solid ${agent.color}25` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${agent.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: `1px solid ${agent.color}25` }}>
            {agent.emoji}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '2px' }}>{agent.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{agent.role}</div>
          </div>
        </div>
        <Badge label={statusLabel} color={statusColor} />
      </div>

      {/* Task */}
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', fontStyle: 'italic' }}>
        ↳ {agent.currentTask}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Progresso</span>
          <span style={{ fontSize: '10px', color: agent.color, fontWeight: '700' }}>{agent.progress}%</span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
          <div style={{ width: `${agent.progress}%`, height: '100%', background: agent.color, borderRadius: '2px', transition: 'width 1s ease' }} />
        </div>
      </div>

      {/* I/O */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '4px' }}>IMPACTO</div>
          <Badge label={agent.impact.toUpperCase()} color={agent.impact === 'alto' ? G.colors.danger : agent.impact === 'médio' ? G.colors.warning : G.colors.success} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '4px' }}>COMPLEXIDADE</div>
          <Badge label={agent.complexity.toUpperCase()} color={agent.complexity === 'alta' ? G.colors.danger : agent.complexity === 'média' ? G.colors.warning : G.colors.success} />
        </div>
      </div>

      {/* Connects to */}
      {agent.connectsTo.length > 0 && (
        <div style={{ background: `${G.colors.primary}08`, border: `1px solid ${G.colors.primary}20`, borderRadius: '8px', padding: '8px' }}>
          <div style={{ fontSize: '9px', color: G.colors.primary, fontWeight: '700', marginBottom: '4px' }}>OUTPUT → CONECTA EM</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {agent.connectsTo.map(c => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: G.colors.primary }}>
                <ArrowRight size={10} />
                <span>{AGENTS.find(a => a.id === c)?.name ?? c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

// Organograma simples
const OrgChart = () => {
  const layers = [
    { label: 'FONTES', agents: ['minerador_videos', 'biblioteca_anuncios', 'concorrentes_igaming', 'grandes_marcas_agent'] },
    { label: 'PROCESSAMENTO', agents: ['cerebro_criativo'] },
    { label: 'REVISÃO', agents: ['retrovisor'] },
  ];

  return (
    <GlassCard style={{ padding: '20px' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Organograma de Agentes
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {layers.map((layer, li) => (
          <div key={layer.label}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>
              {layer.label}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {layer.agents.map(id => {
                const a = AGENTS.find(ag => ag.id === id);
                if (!a) return null;
                return (
                  <div key={id} style={{ background: `${a.color}12`, border: `1px solid ${a.color}25`, borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{a.emoji}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#fff' }}>{a.name}</span>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: a.status === 'ativo' ? G.colors.success : a.status === 'processando' ? G.colors.warning : G.colors.secondary }} />
                  </div>
                );
              })}
            </div>
            {li < layers.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', color: 'rgba(255,255,255,0.15)' }}>
                ↓
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export const MapaAgentes = () => {
  const { config } = useMode();
  const ativos = AGENTS.filter(a => a.status === 'ativo').length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <GlassCard style={{ background: `linear-gradient(135deg,${config.color}12,rgba(191,90,242,0.08))`, border: `1px solid ${config.color}25`, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={24} color={config.color} />
            <div>
              <h3 style={{ margin: 0, fontSize: '17px' }}>Mapa de Agentes — {config.label}</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{ativos} agentes ativos · {AGENTS.length} no total</p>
            </div>
          </div>
          <Btn icon={Plus} label="Novo Agente" variant="primary" />
        </div>
      </GlassCard>

      <OrgChart />

      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Cards de Agentes
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {AGENTS.map(a => <AgentCard key={a.id} agent={a} />)}
      </div>
    </div>
  );
};
