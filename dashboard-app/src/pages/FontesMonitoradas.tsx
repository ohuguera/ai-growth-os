import { TrendingUp, Eye, Globe } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────

type FonteTipo = 'concorrente' | 'tendencia' | 'plataforma';
type FonteStatus = 'ativo' | 'inativo';

interface Fonte {
  id: string;
  nome: string;
  tipo: FonteTipo;
  status: FonteStatus;
  ultima_atualizacao: string;
  descricao: string;
}

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────

const TIPO_LABELS: Record<FonteTipo, string> = {
  concorrente: 'Concorrente',
  tendencia: 'Tendencia',
  plataforma: 'Plataforma',
};

const TIPO_COLORS: Record<FonteTipo, string> = {
  concorrente: G.colors.danger,
  tendencia: G.colors.warning,
  plataforma: G.colors.primary,
};

const STATUS_COLORS: Record<FonteStatus, string> = {
  ativo: G.colors.success,
  inativo: 'rgba(255,255,255,0.25)',
};

const FONTES_MOCK: Fonte[] = [
  { id: 'f1', nome: '@betano_br', tipo: 'concorrente', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Instagram principal Betano Brasil' },
  { id: 'f2', nome: '@superbet_br', tipo: 'concorrente', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Instagram principal Superbet Brasil' },
  { id: 'f3', nome: '@esportivabet', tipo: 'concorrente', status: 'ativo', ultima_atualizacao: '2026-03-20', descricao: 'Instagram Esportiva Bet' },
  { id: 'f4', nome: '@kto_oficial', tipo: 'concorrente', status: 'ativo', ultima_atualizacao: '2026-03-20', descricao: 'Instagram KTO Brasil' },
  { id: 'f5', nome: '@rivalo_br', tipo: 'concorrente', status: 'inativo', ultima_atualizacao: '2026-03-15', descricao: 'Instagram Rivalo - monitoramento pausado' },
  { id: 'f6', nome: '@novibet_br', tipo: 'concorrente', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Instagram Novibet Brasil' },
  { id: 'f7', nome: 'TikTok iGaming BR', tipo: 'plataforma', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Hashtags #apostas #bet #slots no TikTok Brasil' },
  { id: 'f8', nome: 'Instagram Reels Trending', tipo: 'plataforma', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Reels virais na categoria entretenimento/jogos' },
  { id: 'f9', nome: 'YouTube Shorts iGaming', tipo: 'plataforma', status: 'ativo', ultima_atualizacao: '2026-03-20', descricao: 'Shorts de slots, apostas e casas de jogo' },
  { id: 'f10', nome: 'Google Trends - Apostas', tipo: 'tendencia', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Tendencias de busca para termos de iGaming no Brasil' },
  { id: 'f11', nome: 'Google Trends - Slots', tipo: 'tendencia', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Volume de busca para jogos de slot especificos' },
  { id: 'f12', nome: 'Twitter/X #bet', tipo: 'plataforma', status: 'inativo', ultima_atualizacao: '2026-03-10', descricao: 'Monitoramento de hashtags no X - pausado' },
  { id: 'f13', nome: 'Reddit r/apostas', tipo: 'tendencia', status: 'ativo', ultima_atualizacao: '2026-03-19', descricao: 'Discussoes e tendencias no subreddit brasileiro' },
  { id: 'f14', nome: 'Telegram Grupos iGaming', tipo: 'tendencia', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Monitoramento de grupos publicos de apostas' },
  { id: 'f15', nome: 'Meta Ad Library', tipo: 'plataforma', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Biblioteca de anuncios Meta dos concorrentes' },
  { id: 'f16', nome: '@estrelabet', tipo: 'concorrente', status: 'ativo', ultima_atualizacao: '2026-03-20', descricao: 'Instagram EstrelaBet' },
  { id: 'f17', nome: 'SimilarWeb iGaming', tipo: 'tendencia', status: 'inativo', ultima_atualizacao: '2026-03-05', descricao: 'Dados de trafego web dos concorrentes - acesso limitado' },
  { id: 'f18', nome: 'Kwai Gaming BR', tipo: 'plataforma', status: 'ativo', ultima_atualizacao: '2026-03-18', descricao: 'Videos de gaming e apostas no Kwai Brasil' },
  { id: 'f19', nome: '@br.betnacional', tipo: 'concorrente', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Instagram Bet Nacional' },
  { id: 'f20', nome: 'Facebook Ads Competitors', tipo: 'plataforma', status: 'ativo', ultima_atualizacao: '2026-03-21', descricao: 'Anuncios ativos dos concorrentes no Facebook' },
];

// ─────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────

export function FontesMonitoradas() {
  const ativas = FONTES_MOCK.filter(f => f.status === 'ativo').length;
  const inativas = FONTES_MOCK.filter(f => f.status === 'inativo').length;

  const porTipo = (tipo: FonteTipo) => FONTES_MOCK.filter(f => f.tipo === tipo);

  const renderFonteRow = (fonte: Fonte) => (
    <div key={fonte.id} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 14px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '8px',
      transition: 'all 0.2s',
      opacity: fonte.status === 'inativo' ? 0.5 : 1,
    }}>
      {/* Status dot */}
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: STATUS_COLORS[fonte.status],
        flexShrink: 0,
        boxShadow: fonte.status === 'ativo' ? `0 0 6px ${G.colors.success}50` : 'none',
      }} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>
          {fonte.nome}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
          {fonte.descricao}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
        <Badge label={fonte.status === 'ativo' ? 'Ativo' : 'Inativo'} color={STATUS_COLORS[fonte.status]} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
          {fonte.ultima_atualizacao}
        </span>
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: G.colors.success }}>{ativas}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Fontes Ativas</div>
        </GlassCard>
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'rgba(255,255,255,0.3)' }}>{inativas}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Inativas</div>
        </GlassCard>
        {(['concorrente', 'tendencia', 'plataforma'] as FonteTipo[]).map(t => (
          <GlassCard key={t} style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: TIPO_COLORS[t] }}>{porTipo(t).length}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{TIPO_LABELS[t]}s</div>
          </GlassCard>
        ))}
      </div>

      {/* Secoes por tipo */}
      {(['concorrente', 'tendencia', 'plataforma'] as FonteTipo[]).map(tipo => (
        <GlassCard key={tipo} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: `${TIPO_COLORS[tipo]}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {tipo === 'concorrente' && <Eye size={16} color={TIPO_COLORS[tipo]} />}
              {tipo === 'tendencia' && <TrendingUp size={16} color={TIPO_COLORS[tipo]} />}
              {tipo === 'plataforma' && <Globe size={16} color={TIPO_COLORS[tipo]} />}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{TIPO_LABELS[tipo]}s</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                {porTipo(tipo).filter(f => f.status === 'ativo').length} ativas de {porTipo(tipo).length}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {porTipo(tipo).map(renderFonteRow)}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
