import { useState, useMemo } from 'react';
import { Check, Filter, Zap, Rocket, Calendar, Gift, RefreshCw } from 'lucide-react';
import { G, GlassCard, Badge, Btn } from '../design-system';
import { BLOCK_KEYS } from '../types/creative-blocks';

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────

type CampanhaTipo = 'lancamento' | 'sazonal' | 'retencao' | 'promocao';

interface Campanha {
  id: string;
  titulo: string;
  descricao: string;
  tipo: CampanhaTipo;
  plataformas: string[];
  hook_sugerido: string;
}

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────

const TIPO_LABELS: Record<CampanhaTipo, string> = {
  lancamento: 'Lancamento',
  sazonal: 'Sazonal',
  retencao: 'Retencao',
  promocao: 'Promocao',
};

const TIPO_COLORS: Record<CampanhaTipo, string> = {
  lancamento: G.colors.primary,
  sazonal: G.colors.warning,
  retencao: G.colors.secondary,
  promocao: G.colors.success,
};

const TIPO_ICONS: Record<CampanhaTipo, any> = {
  lancamento: Rocket,
  sazonal: Calendar,
  retencao: RefreshCw,
  promocao: Gift,
};

const CAMPANHAS_MOCK: Campanha[] = [
  {
    id: 'c1',
    titulo: 'Bonus de Boas-Vindas Explosivo',
    descricao: 'Campanha de aquisicao focada em novos usuarios com bonus de primeiro deposito agressivo. Ideal para picos de trafego organcio.',
    tipo: 'lancamento',
    plataformas: ['Instagram Reels', 'TikTok', 'YouTube Shorts'],
    hook_sugerido: 'Eu depositei R$50 e joguei com R$150... veja o que aconteceu',
  },
  {
    id: 'c2',
    titulo: 'Mega Sexta do Cashback',
    descricao: 'Cashback especial de sexta-feira para reativar jogadores inativos. Urgencia temporal aumenta conversao.',
    tipo: 'promocao',
    plataformas: ['Instagram Stories', 'WhatsApp Status'],
    hook_sugerido: 'So ate meia-noite: receba 30% de volta em tudo que jogar',
  },
  {
    id: 'c3',
    titulo: 'Torneio de Verao BINGOBET',
    descricao: 'Torneio sazonal com premiacao especial de verao. Cria senso de comunidade e competicao entre jogadores.',
    tipo: 'sazonal',
    plataformas: ['Instagram Reels', 'TikTok', 'YouTube'],
    hook_sugerido: 'O torneio que vai pagar R$50.000 em premios comeca AGORA',
  },
  {
    id: 'c4',
    titulo: 'Programa VIP Fidelidade',
    descricao: 'Campanha de retencao com niveis VIP progressivos. Recompensa jogadores frequentes com beneficios exclusivos.',
    tipo: 'retencao',
    plataformas: ['Instagram Feed', 'Email', 'Push Notification'],
    hook_sugerido: 'Jogadores VIP estao sacando 3x mais que voce... descubra por que',
  },
  {
    id: 'c5',
    titulo: 'Rodadas Gratis no Novo Slot',
    descricao: 'Lancamento de novo jogo com rodadas gratis para gerar buzz e trials. Perfeito para conteudo de gameplay.',
    tipo: 'lancamento',
    plataformas: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
    hook_sugerido: 'Esse slot novo ta pagando ABSURDO... ganhei rodadas gratis pra testar',
  },
  {
    id: 'c6',
    titulo: 'Campanha Dia dos Pais',
    descricao: 'Acao sazonal de Dia dos Pais com bonus tematico e criativos emocionais. Alta taxa de compartilhamento.',
    tipo: 'sazonal',
    plataformas: ['Instagram Reels', 'Instagram Stories', 'TikTok'],
    hook_sugerido: 'Dei pro meu pai jogar uma vez... e olha o que ele ganhou',
  },
  {
    id: 'c7',
    titulo: 'Desafio Semanal de Missoes',
    descricao: 'Missoes semanais com recompensas crescentes. Gamificacao que mantem jogadores ativos por mais tempo.',
    tipo: 'retencao',
    plataformas: ['Instagram Stories', 'Push Notification', 'WhatsApp'],
    hook_sugerido: 'Completei 5 missoes e ganhei R$200 de bonus... veja como',
  },
  {
    id: 'c8',
    titulo: 'Flash Sale PIX Instantaneo',
    descricao: 'Promocao relampago com saque PIX instantaneo como diferencial. Cria urgencia e prova de pagamento rapido.',
    tipo: 'promocao',
    plataformas: ['Instagram Stories', 'TikTok', 'WhatsApp Status'],
    hook_sugerido: 'Saquei em 2 MINUTOS via PIX... a prova ta aqui',
  },
  {
    id: 'c9',
    titulo: 'Indicou, Ganhou!',
    descricao: 'Programa de indicacao com bonus para quem indica e quem se cadastra. Crescimento viral organico.',
    tipo: 'promocao',
    plataformas: ['Instagram Feed', 'WhatsApp', 'Telegram'],
    hook_sugerido: 'Chamei 3 amigos e ganhei R$150 SEM JOGAR',
  },
  {
    id: 'c10',
    titulo: 'Volta pro Jogo - Reativacao',
    descricao: 'Campanha de reativacao para jogadores inativos ha 30+ dias. Bonus exclusivo de retorno com prazo limitado.',
    tipo: 'retencao',
    plataformas: ['Email', 'Push Notification', 'SMS'],
    hook_sugerido: 'Sentimos sua falta! Volte e ganhe 50 rodadas gratis',
  },
];

// ─────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────

export function IdeiasCampanha() {
  const [filtro, setFiltro] = useState<CampanhaTipo | 'todos'>('todos');
  const [usados, setUsados] = useState<Set<string>>(new Set());

  const filtradas = useMemo(() => {
    if (filtro === 'todos') return CAMPANHAS_MOCK;
    return CAMPANHAS_MOCK.filter(c => c.tipo === filtro);
  }, [filtro]);

  const usarCampanha = (campanha: Campanha) => {
    localStorage.setItem(BLOCK_KEYS.hook_selected, JSON.stringify({
      hook_text: campanha.hook_sugerido,
      source: 'campanha',
      campanha_id: campanha.id,
      campanha_titulo: campanha.titulo,
    }));
    setUsados(prev => new Set([...prev, campanha.id]));
  };

  const countPorTipo = (tipo: CampanhaTipo) => CAMPANHAS_MOCK.filter(c => c.tipo === tipo).length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {(['lancamento', 'sazonal', 'retencao', 'promocao'] as CampanhaTipo[]).map(t => {
          const Icon = TIPO_ICONS[t];
          return (
            <GlassCard key={t} style={{ padding: '16px', textAlign: 'center', cursor: 'pointer' }} >
              <Icon size={20} color={TIPO_COLORS[t]} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: '800', color: TIPO_COLORS[t] }}>{countPorTipo(t)}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{TIPO_LABELS[t]}</div>
            </GlassCard>
          );
        })}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} color="rgba(255,255,255,0.3)" />
        {(['todos', 'lancamento', 'sazonal', 'retencao', 'promocao'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: `1px solid ${filtro === t ? (t === 'todos' ? G.colors.primary : TIPO_COLORS[t as CampanhaTipo]) : 'rgba(255,255,255,0.08)'}`,
              background: filtro === t ? `${t === 'todos' ? G.colors.primary : TIPO_COLORS[t as CampanhaTipo]}20` : 'rgba(255,255,255,0.04)',
              color: filtro === t ? (t === 'todos' ? G.colors.primary : TIPO_COLORS[t as CampanhaTipo]) : 'rgba(255,255,255,0.5)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t === 'todos' ? 'Todos' : TIPO_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Cards de campanhas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
        {filtradas.map(campanha => {
          const Icon = TIPO_ICONS[campanha.tipo];
          const usado = usados.has(campanha.id);
          return (
            <div key={campanha.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${usado ? `${G.colors.success}30` : 'rgba(255,255,255,0.07)'}`,
              borderTop: `3px solid ${TIPO_COLORS[campanha.tipo]}`,
              borderRadius: '10px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'all 0.2s',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: `${TIPO_COLORS[campanha.tipo]}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} color={TIPO_COLORS[campanha.tipo]} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                    {campanha.titulo}
                  </div>
                  <Badge label={TIPO_LABELS[campanha.tipo]} color={TIPO_COLORS[campanha.tipo]} />
                </div>
              </div>

              {/* Descricao */}
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                {campanha.descricao}
              </div>

              {/* Plataformas */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {campanha.plataformas.map(p => (
                  <span key={p} style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.06)',
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: '600',
                  }}>
                    {p}
                  </span>
                ))}
              </div>

              {/* Hook sugerido */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '10px 12px',
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '4px' }}>
                  HOOK SUGERIDO
                </div>
                <div style={{ fontSize: '13px', color: G.colors.warning, fontStyle: 'italic', lineHeight: '1.4' }}>
                  "{campanha.hook_sugerido}"
                </div>
              </div>

              {/* Acao */}
              <Btn
                icon={usado ? Check : Zap}
                label={usado ? 'Hook Selecionado' : 'Usar esta campanha'}
                variant={usado ? 'success' : 'primary'}
                onClick={() => usarCampanha(campanha)}
                small
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
