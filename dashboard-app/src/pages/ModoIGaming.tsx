import { Tag, Eye, TrendingUp, Wifi, Users, Zap } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';
import { tierAlto, tierMedio } from '../data/competitors';
import { trends } from '../data/trends';

// ─────────────────────────────────────────
// FONTES ATIVAS NO MODO iGAMING
// ─────────────────────────────────────────

const FONTES_IGAMING = [
  { nome: 'Instagram Concorrentes', status: 'ativo', tipo: 'Concorrente' },
  { nome: 'TikTok iGaming BR', status: 'ativo', tipo: 'Plataforma' },
  { nome: 'YouTube Shorts Slots', status: 'ativo', tipo: 'Plataforma' },
  { nome: 'Google Trends Apostas', status: 'ativo', tipo: 'Tendencia' },
  { nome: 'Meta Ad Library', status: 'ativo', tipo: 'Plataforma' },
  { nome: 'Telegram Grupos iGaming', status: 'ativo', tipo: 'Tendencia' },
  { nome: 'Reddit r/apostas', status: 'ativo', tipo: 'Tendencia' },
  { nome: 'Kwai Gaming BR', status: 'ativo', tipo: 'Plataforma' },
];

// ─────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────

export function ModoIGaming() {
  const totalConcorrentes = tierAlto.length + tierMedio.length;
  const totalTendencias = trends.length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Status do modo */}
      <GlassCard style={{ padding: '20px', borderTop: `3px solid ${G.colors.primary}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: `${G.colors.primary}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Tag size={24} color={G.colors.primary} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Modo iGaming</div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <Badge label="ATIVO" color={G.colors.success} />
              <Badge label="Foco: Apostas & Casino" color={G.colors.primary} />
            </div>
          </div>
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
          O sistema esta configurado para monitorar concorrentes de iGaming, tendencias de apostas online e formatos virais do nicho. Todas as sugestoes de hook, copy e campanha sao otimizadas para o mercado de apostas brasileiro.
        </div>
      </GlassCard>

      {/* Metricas do modo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <Eye size={18} color={G.colors.danger} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '28px', fontWeight: '800', color: G.colors.danger }}>{totalConcorrentes}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Concorrentes</div>
        </GlassCard>
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <TrendingUp size={18} color={G.colors.warning} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '28px', fontWeight: '800', color: G.colors.warning }}>{totalTendencias}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Tendencias</div>
        </GlassCard>
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <Wifi size={18} color={G.colors.success} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '28px', fontWeight: '800', color: G.colors.success }}>{FONTES_IGAMING.length}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Fontes Ativas</div>
        </GlassCard>
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <Users size={18} color={G.colors.secondary} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '28px', fontWeight: '800', color: G.colors.secondary }}>{tierAlto.length}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Tier Alto</div>
        </GlassCard>
      </div>

      {/* Fontes ativas */}
      <GlassCard style={{ padding: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wifi size={16} color={G.colors.success} />
          Fontes Ativas neste Modo
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {FONTES_IGAMING.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: G.colors.success, boxShadow: `0 0 6px ${G.colors.success}50` }} />
              <div style={{ flex: 1, fontSize: '13px', color: '#fff', fontWeight: '500' }}>{f.nome}</div>
              <Badge label={f.tipo} color="rgba(255,255,255,0.3)" />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Concorrentes monitorados (top 10) */}
      <GlassCard style={{ padding: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={16} color={G.colors.danger} />
          Top Concorrentes Monitorados
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
          {tierAlto.slice(0, 10).map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: `${c.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '800', color: c.color,
              }}>
                {c.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{c.name}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{c.focus.slice(0, 2).join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Tendencias ativas */}
      <GlassCard style={{ padding: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} color={G.colors.warning} />
          Tendencias Detectadas
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {trends.slice(0, 5).map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: `${t.platformColor}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={14} color={t.platformColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{t.name}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{t.platform}</div>
              </div>
              <Badge label={t.growth} color={t.growthColor} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
