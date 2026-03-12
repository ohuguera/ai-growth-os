import { useState } from 'react';
import { Eye, TrendingUp, Target, Zap } from 'lucide-react';
import { GlassCard, Badge, G, Btn } from '../design-system';
import { tierAlto, tierMedio, type Competitor } from '../data/competitors';

const SourceTrailTag = ({ competitor, tier }: { competitor: string; tier: string }) => (
  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
    <span style={{ fontSize: '10px', background: 'rgba(10,132,255,0.1)', color: '#0A84FF', border: '1px solid rgba(10,132,255,0.2)', borderRadius: '20px', padding: '2px 8px', fontWeight: '600' }}>
      🎰 Modo iGaming
    </span>
    <span style={{ fontSize: '10px', background: 'rgba(255,59,48,0.1)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.2)', borderRadius: '20px', padding: '2px 8px', fontWeight: '600' }}>
      🔍 Concorrentes iGaming
    </span>
    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2px 8px' }}>
      📍 {competitor} · {tier}
    </span>
  </div>
);

const CompetitorCard = ({ c, tier }: { c: Competitor; tier: 'Tier Alto' | 'Tier Médio' }) => {
  const [expanded, setExpanded] = useState(false);
  const tierColor = tier === 'Tier Alto' ? G.colors.danger : G.colors.warning;

  return (
    <GlassCard style={{ padding: '16px', border: `1px solid ${c.color}20` }}>
      <SourceTrailTag competitor={c.name} tier={tier} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: `1px solid ${c.color}30` }}>
            🎰
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '15px' }}>{c.name}</div>
            <Badge label={tier} color={tierColor} />
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>FOCO</div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {c.focus.map(f => <span key={f} style={{ fontSize: '11px', background: `${c.color}15`, color: c.color, borderRadius: '6px', padding: '2px 7px' }}>{f}</span>)}
        </div>
      </div>

      {expanded && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>FORMATOS DE ANÚNCIO</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {c.adTypes.map(a => <span key={a} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '6px', padding: '2px 7px' }}>{a}</span>)}
            </div>
          </div>
          <div style={{ background: `${G.colors.primary}08`, border: `1px solid ${G.colors.primary}20`, borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontSize: '10px', color: G.colors.primary, fontWeight: '700', marginBottom: '4px' }}>🎣 HOOKS IDENTIFICADOS</div>
            {c.hooks.map((h, i) => <div key={i} style={{ fontSize: '12px', color: '#fff', marginBottom: '3px' }}>→ {h}</div>)}
          </div>
          <div style={{ background: `${G.colors.success}08`, border: `1px solid ${G.colors.success}20`, borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontSize: '10px', color: G.colors.success, fontWeight: '700', marginBottom: '4px' }}>💪 PONTO FORTE</div>
            <div style={{ fontSize: '12px' }}>{c.strengths}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <Btn icon={Eye} label={expanded ? 'Recolher' : 'Ver Análise'} variant="dark" small onClick={() => setExpanded(!expanded)} />
        <Btn icon={TrendingUp} label="Adaptar Hook" variant="primary" small />
        <Btn icon={Target} label="Usar Estratégia" variant="purple" small />
      </div>
    </GlassCard>
  );
};

export const ConcorrentesIGaming = () => {
  const [tab, setTab] = useState<'alto' | 'medio'>('alto');
  const [search, setSearch] = useState('');
  const list = tab === 'alto' ? tierAlto : tierMedio;
  const filtered = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <GlassCard style={{ background: 'linear-gradient(135deg,rgba(255,59,48,0.12),rgba(255,149,0,0.08))', border: '1px solid rgba(255,59,48,0.3)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255,59,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={26} color={G.colors.danger} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: G.colors.danger, fontWeight: '700', marginBottom: '4px' }}>AGENTE ATIVO · CONCORRENTES iGAMING</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>Concorrentes iGaming por Tier</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                {tierAlto.length} Tier Alto · {tierMedio.length} Tier Médio · Somente competidores relevantes
              </p>
            </div>
          </div>
          <Btn icon={Zap} label="Analisar Todos" variant="primary" />
        </div>
      </GlassCard>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[
          { label: 'Tier Alto', value: tierAlto.length, color: G.colors.danger, icon: TrendingUp },
          { label: 'Tier Médio', value: tierMedio.length, color: G.colors.warning, icon: Target },
          { label: 'Hooks Mapeados', value: tierAlto.length * 2 + tierMedio.length * 2, color: G.colors.primary, icon: Eye },
        ].map(s => (
          <GlassCard key={s.label} style={{ textAlign: 'center', padding: '16px' }}>
            <s.icon size={24} color={s.color} style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '26px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Tabs + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px' }}>
          {[{ id: 'alto', label: '🔴 Tier Alto' }, { id: 'medio', label: '🟡 Tier Médio' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as 'alto' | 'medio')} style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: '700', fontSize: '13px', transition: 'all 0.2s',
              background: tab === t.id ? (t.id === 'alto' ? G.colors.danger : G.colors.warning) : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
            }}>
              {t.label}
            </button>
          ))}
        </div>
        <input
          placeholder="Buscar concorrente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', padding: '9px 14px', color: '#fff', fontSize: '13px',
            outline: 'none', width: '220px',
          }}
        />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map(c => (
          <CompetitorCard key={c.name} c={c} tier={tab === 'alto' ? 'Tier Alto' : 'Tier Médio'} />
        ))}
      </div>
    </div>
  );
};
