import { ArrowDown, ArrowRight } from 'lucide-react';
import { GlassCard, G } from '../design-system';
import { useMode } from '../store/modeContext';


const FlowNode = ({ emoji, label, sublabel, color, agents }: { emoji: string; label: string; sublabel: string; color: string; agents?: string[] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, minWidth: '140px' }}>
    <div style={{
      width: '60px', height: '60px', borderRadius: '16px',
      background: `${color}20`, border: `2px solid ${color}60`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '26px', boxShadow: `0 0 20px ${color}30`,
    }}>
      {emoji}
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{sublabel}</div>
    </div>
    {agents && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        {agents.map(a => (
          <div key={a} style={{ fontSize: '10px', color, background: `${color}10`, border: `1px solid ${color}20`, borderRadius: '6px', padding: '3px 8px', textAlign: 'center' }}>
            {a}
          </div>
        ))}
      </div>
    )}
  </div>
);

const FlowArrow = ({ vertical }: { vertical?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: vertical ? '8px 0' : '0 8px', color: 'rgba(255,255,255,0.2)' }}>
    {vertical ? <ArrowDown size={20} /> : <ArrowRight size={20} />}
  </div>
);

const FlowLayer = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
  <div>
    <div style={{ fontSize: '10px', fontWeight: '700', color, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '1px', background: `${color}30` }} />
      {title}
      <div style={{ flex: 1, height: '1px', background: `${color}30` }} />
    </div>
    <GlassCard style={{ border: `1px solid ${color}20`, padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {children}
      </div>
    </GlassCard>
  </div>
);

export const FluxoSistema = () => {
  const { mode, config } = useMode();

  const igamingSources = [
    { emoji: '🎰', label: 'Concorrentes Bet', sublabel: 'Tier Alto + Médio' },
    { emoji: '📱', label: 'TikTok iGaming', sublabel: 'Vídeos virais' },
    { emoji: '📸', label: 'Instagram Reels', sublabel: 'Conteúdo bet' },
    { emoji: '▶️', label: 'YouTube Shorts', sublabel: 'Casino content' },
    { emoji: '📚', label: 'Biblioteca de Ads', sublabel: 'Anúncios bet' },
  ];

  const brandSources = [
    { emoji: '🏢', label: '30 Grandes Marcas', sublabel: 'Brasil' },
    { emoji: '📱', label: 'TikTok Marcas', sublabel: 'Campanhas virais' },
    { emoji: '📸', label: 'Instagram Reels', sublabel: 'Grandes marcas' },
    { emoji: '▶️', label: 'YouTube Shorts', sublabel: 'Brand content' },
    { emoji: '📚', label: 'Biblioteca Premium', sublabel: 'Anúncios marcas' },
  ];

  const sources = mode === 'igaming' ? igamingSources : brandSources;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <GlassCard style={{ background: `linear-gradient(135deg, ${config.color}15, transparent)`, border: `1px solid ${config.color}30`, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '40px' }}>🔄</div>
          <div>
            <div style={{ fontSize: '11px', color: config.color, fontWeight: '700', marginBottom: '4px', letterSpacing: '1px' }}>FLUXO ATIVO — {config.label.toUpperCase()}</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Fluxo do Sistema</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Como os dados fluem desde a fonte até o output criativo
            </p>
          </div>
        </div>
      </GlassCard>

      {/* LAYER 1: FONTES */}
      <FlowLayer title="1 — Fontes de Alimentação" color={config.color}>
        {sources.map((s, i) => (
          <FlowNode key={i} emoji={s.emoji} label={s.label} sublabel={s.sublabel} color={config.color} />
        ))}
      </FlowLayer>

      <FlowArrow vertical />

      {/* LAYER 2: MINERAÇÃO */}
      <FlowLayer title="2 — Motor de Mineração (compartilhado)" color={G.colors.warning}>
        <FlowNode emoji="🎬" label="Minerador de Vídeos" sublabel="Detecta virais e formatos" color={G.colors.warning} agents={['TikTok', 'Reels', 'Shorts']} />
        <FlowArrow />
        <FlowNode emoji="📚" label="Biblioteca de Anúncios" sublabel="Analisa ads e CTAs" color={G.colors.warning} agents={['Hooks', 'Ofertas', 'CTAs']} />
        <FlowArrow />
        <FlowNode emoji="🔍" label="Análise de Fonte" sublabel="Concorrentes ou Marcas" color={G.colors.warning} agents={['Padrões', 'Estratégias']} />
      </FlowLayer>

      <FlowArrow vertical />

      {/* LAYER 3: ANÁLISE */}
      <FlowLayer title="3 — Análise e Extração" color={G.colors.secondary}>
        <FlowNode emoji="🎣" label="Hooks Identificados" sublabel="Ganchos que convertem" color={G.colors.secondary} />
        <FlowArrow />
        <FlowNode emoji="🎁" label="Ofertas Mapeadas" sublabel="Bônus e promoções" color={G.colors.secondary} />
        <FlowArrow />
        <FlowNode emoji="📐" label="Formatos Virais" sublabel="Templates que funcionam" color={G.colors.secondary} />
        <FlowArrow />
        <FlowNode emoji="📣" label="CTAs Validados" sublabel="Chamadas para ação" color={G.colors.secondary} />
      </FlowLayer>

      <FlowArrow vertical />

      {/* LAYER 4: CÉREBRO CRIATIVO */}
      <FlowLayer title="4 — Cérebro Criativo (adaptação iGaming)" color={G.colors.success}>
        <FlowNode
          emoji="🧠"
          label="Cérebro Criativo"
          sublabel="Gera outputs adaptados para iGaming"
          color={G.colors.success}
          agents={['Recebe todos os inputs', 'Adapta para iGaming', 'Gera sugestões']}
        />
      </FlowLayer>

      <FlowArrow vertical />

      {/* LAYER 5: OUTPUTS */}
      <FlowLayer title="5 — Outputs Gerados" color={G.colors.primary}>
        <FlowNode emoji="📝" label="Roteiros" sublabel="Scripts para vídeo" color={G.colors.primary} />
        <FlowArrow />
        <FlowNode emoji="✍️" label="Copy" sublabel="Textos e legendas" color={G.colors.primary} />
        <FlowArrow />
        <FlowNode emoji="🚀" label="Campanhas" sublabel="Ideias completas" color={G.colors.primary} />
        <FlowArrow />
        <FlowNode emoji="🎬" label="Criativos" sublabel="Formatos prontos" color={G.colors.primary} />
        <FlowArrow />
        <FlowNode emoji="🪞" label="Retrovisor" sublabel="Revisão + melhorias" color={G.colors.primary} />
      </FlowLayer>

      {/* Legenda */}
      <GlassCard style={{ padding: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '10px', letterSpacing: '0.5px' }}>LEGENDA DO FLUXO</div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { color: config.color, label: 'Fontes (muda com o modo)' },
            { color: G.colors.warning, label: 'Motor de Mineração (fixo)' },
            { color: G.colors.secondary, label: 'Análise (fixo)' },
            { color: G.colors.success, label: 'Geração Criativa (fixo)' },
            { color: G.colors.primary, label: 'Outputs (fixo, sempre iGaming)' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color }} />
              <span style={{ color: 'var(--text-secondary)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
