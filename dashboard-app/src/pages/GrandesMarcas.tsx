import { useState } from 'react';
import { Star, TrendingUp, Target } from 'lucide-react';
import { GlassCard, Badge, G, Btn } from '../design-system';
import { majorBrands, type Brand } from '../data/brands';

const SourceTrailTag = ({ brand }: { brand: Brand }) => (
  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
    <span style={{ fontSize: '10px', background: 'rgba(191,90,242,0.1)', color: '#BF5AF2', border: '1px solid rgba(191,90,242,0.2)', borderRadius: '20px', padding: '2px 8px', fontWeight: '600' }}>
      🏢 Modo Grandes Marcas
    </span>
    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2px 8px' }}>
      📍 {brand.name} · {brand.sector}
    </span>
  </div>
);

const BrandCard = ({ brand }: { brand: Brand }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <GlassCard style={{ padding: '16px', border: `1px solid ${brand.color}20` }}>
      <SourceTrailTag brand={brand} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${brand.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: `1px solid ${brand.color}30` }}>
          {brand.emoji}
        </div>
        <div>
          <div style={{ fontWeight: '800', fontSize: '15px', marginBottom: '4px' }}>{brand.name}</div>
          <Badge label={brand.sector} color={brand.color} />
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>ESTILO DE ANÚNCIO</div>
        <div style={{ fontSize: '12px', lineHeight: '1.5' }}>{brand.adStyle}</div>
      </div>

      {expanded && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
          <div style={{ background: `${G.colors.primary}08`, border: `1px solid ${G.colors.primary}20`, borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontSize: '10px', color: G.colors.primary, fontWeight: '700', marginBottom: '4px' }}>🎣 HOOKS DA MARCA</div>
            {brand.hooks.map((h, i) => <div key={i} style={{ fontSize: '12px', marginBottom: '3px' }}>→ {h}</div>)}
          </div>
          <div style={{ background: `${G.colors.success}08`, border: `1px solid ${G.colors.success}20`, borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontSize: '10px', color: G.colors.success, fontWeight: '700', marginBottom: '4px' }}>🎰 ADAPTAÇÃO iGAMING</div>
            <div style={{ fontSize: '12px' }}>{brand.igamingAdaptation}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <Btn icon={Star} label={expanded ? 'Recolher' : 'Ver Adaptação'} variant="dark" small onClick={() => setExpanded(!expanded)} />
        <Btn icon={TrendingUp} label="Adaptar Hook" variant="purple" small />
        <Btn icon={Target} label="Usar no iGaming" variant="primary" small />
      </div>
    </GlassCard>
  );
};

export const GrandesMarcas = () => {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('Todos');
  const sectors = ['Todos', ...Array.from(new Set(majorBrands.map(b => b.sector)))];
  const filtered = majorBrands
    .filter(b => sector === 'Todos' || b.sector === sector)
    .filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <GlassCard style={{ background: 'linear-gradient(135deg,rgba(191,90,242,0.12),rgba(255,149,0,0.08))', border: '1px solid rgba(191,90,242,0.3)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(191,90,242,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={26} color={G.colors.secondary} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: G.colors.secondary, fontWeight: '700', marginBottom: '4px' }}>AGENTE ATIVO · GRANDES MARCAS</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>30 Maiores Marcas do Brasil</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Referências adaptadas para iGaming · Outputs sempre em formato bet
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {sectors.slice(0, 8).map(s => (
            <button key={s} onClick={() => setSector(s)} style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontWeight: '600', fontSize: '11px', transition: 'all 0.2s',
              background: sector === s ? G.colors.secondary : 'rgba(255,255,255,0.06)',
              color: sector === s ? '#fff' : 'var(--text-secondary)',
            }}>
              {s}
            </button>
          ))}
        </div>
        <input
          placeholder="Buscar marca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', padding: '9px 14px', color: '#fff', fontSize: '13px',
            outline: 'none', width: '200px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map(b => <BrandCard key={b.name} brand={b} />)}
      </div>
    </div>
  );
};
