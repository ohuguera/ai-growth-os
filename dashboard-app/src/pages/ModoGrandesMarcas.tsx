import { Star, Eye, TrendingUp, Wifi, Zap, Target, Award } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';

// ─────────────────────────────────────────
// DADOS MOCK DO MODO GRANDES MARCAS
// ─────────────────────────────────────────

const MARCAS_MONITORADAS = [
  { nome: 'Nike', foco: 'Storytelling emocional, atletas, UGC', color: '#FF6B00' },
  { nome: 'Coca-Cola', foco: 'Momentos felizes, campanha sazonal, comunidade', color: '#FF0000' },
  { nome: 'Red Bull', foco: 'Conteudo extremo, lifestyle, eventos ao vivo', color: '#0A1E5C' },
  { nome: 'Nubank', foco: 'Educacao financeira, humor, memes', color: '#820AD1' },
  { nome: 'iFood', foco: 'Humor, cupons, influencers, real-time', color: '#EA1D2C' },
  { nome: 'Kwai', foco: 'Creators nativos, desafios, trends', color: '#FF6000' },
  { nome: 'Netflix Brasil', foco: 'Memes, engagement, cultura pop, reels', color: '#E50914' },
  { nome: 'Mercado Livre', foco: 'Ofertas, proof of value, UGC reviews', color: '#FFE600' },
  { nome: 'Magazine Luiza', foco: 'Lu do Magalu, humanizacao, tutorial', color: '#0086FF' },
  { nome: 'Boticario', foco: 'Emocao, influencers, datas comemorativas', color: '#00A651' },
];

const FONTES_MARCAS = [
  { nome: 'Instagram Top Brands BR', status: 'ativo', tipo: 'Plataforma' },
  { nome: 'TikTok Brand Accounts', status: 'ativo', tipo: 'Plataforma' },
  { nome: 'YouTube Brand Channels', status: 'ativo', tipo: 'Plataforma' },
  { nome: 'Meta Ad Library - Brands', status: 'ativo', tipo: 'Plataforma' },
  { nome: 'Google Trends - Marcas', status: 'ativo', tipo: 'Tendencia' },
  { nome: 'Think with Google', status: 'ativo', tipo: 'Tendencia' },
];

const INSIGHTS_MARCAS = [
  { insight: 'Formato POV usado por 7 das 10 marcas monitoradas', categoria: 'Formato' },
  { insight: 'Videos de 15-20s tem 3x mais completude que 60s+', categoria: 'Duracao' },
  { insight: 'Marcas usam UGC como 60% do conteudo de Reels', categoria: 'Conteudo' },
  { insight: 'Humor + produto = maior taxa de compartilhamento', categoria: 'Engajamento' },
  { insight: 'Campanhas sazonais comecam 15 dias antes da data', categoria: 'Timing' },
];

// ─────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────

export function ModoGrandesMarcas() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Status do modo */}
      <GlassCard style={{ padding: '20px', borderTop: `3px solid ${G.colors.secondary}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: `${G.colors.secondary}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={24} color={G.colors.secondary} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Modo Grandes Marcas</div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <Badge label="ATIVO" color={G.colors.success} />
              <Badge label="Foco: Benchmarks de Mercado" color={G.colors.secondary} />
            </div>
          </div>
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
          O sistema monitora as maiores marcas do Brasil para extrair padroes de conteudo, formatos virais e estrategias de campanha adaptaveis para iGaming. Os insights sao cruzados com o desempenho dos concorrentes.
        </div>
      </GlassCard>

      {/* Metricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <Award size={18} color={G.colors.secondary} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '28px', fontWeight: '800', color: G.colors.secondary }}>{MARCAS_MONITORADAS.length}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Marcas</div>
        </GlassCard>
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <Wifi size={18} color={G.colors.success} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '28px', fontWeight: '800', color: G.colors.success }}>{FONTES_MARCAS.length}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Fontes Ativas</div>
        </GlassCard>
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <Target size={18} color={G.colors.warning} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '28px', fontWeight: '800', color: G.colors.warning }}>{INSIGHTS_MARCAS.length}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Insights</div>
        </GlassCard>
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <TrendingUp size={18} color={G.colors.primary} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '28px', fontWeight: '800', color: G.colors.primary }}>3</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Plataformas</div>
        </GlassCard>
      </div>

      {/* Marcas monitoradas */}
      <GlassCard style={{ padding: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={16} color={G.colors.secondary} />
          Marcas Monitoradas
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
          {MARCAS_MONITORADAS.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderLeft: `3px solid ${m.color}`,
              borderRadius: '8px',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: `${m.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '800', color: m.color,
                flexShrink: 0,
              }}>
                {m.nome.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{m.nome}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.4', marginTop: '2px' }}>{m.foco}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Fontes ativas */}
      <GlassCard style={{ padding: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wifi size={16} color={G.colors.success} />
          Fontes Ativas neste Modo
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {FONTES_MARCAS.map((f, i) => (
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

      {/* Insights extraidos */}
      <GlassCard style={{ padding: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color={G.colors.warning} />
          Insights Extraidos
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {INSIGHTS_MARCAS.map((ins, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: `${G.colors.warning}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '800', color: G.colors.warning,
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>{ins.insight}</div>
              </div>
              <Badge label={ins.categoria} color={G.colors.primary} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
