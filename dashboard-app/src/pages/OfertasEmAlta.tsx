import { useState, useMemo } from 'react';
import { Gift, Check, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { G } from '../design-system';
import { tierAlto, tierMedio } from '../data/competitors';
import type { Oferta, OfertaType } from '../types/creative-blocks';
import {
  OFERTA_TYPE_LABEL, OFERTA_TYPE_COLOR,
  loadBlocks, saveBlocks, BLOCK_KEYS, gerarId,
} from '../types/creative-blocks';

// ── Semântica da fonte ───────────────────────────────────────────────
// competitors.hooks[] = diferenciais comunicados pelos concorrentes.
// Tratados aqui como SINAIS DE OFERTA DE MERCADO, não como hooks criativos.
// Hook é abertura. Oferta é benefício. São blocos distintos no sistema.

// ── Detecção de tipo de oferta ───────────────────────────────────────

function detectarOfertaType(text: string): OfertaType | null {
  const t = text.toLowerCase();
  if (/b[oô]nus|bonus|boas-vindas|primeiro dep|freebet|warrior bonus|up no dep|retenção/.test(t)) return 'bonus';
  if (/giro|rodada|gr[aá]tis|free spin|\bspin\b|jackpot|prêmio acumulado|bingo/.test(t)) return 'rodadas_gratis';
  if (/cashback|devolu[çc][aã]o|reembolso/.test(t)) return 'cashback';
  if (/\bpix\b/.test(t)) return 'pix';
  if (/torneio/.test(t)) return 'torneio';
  if (/miss[oõ]es|desafio|quest/.test(t)) return 'missoes';
  if (/saque|cash out|retirada|express/.test(t)) return 'saque';
  if (/\bvip\b|clube vip|fidelidade/.test(t)) return 'suporte';
  return null; // strings sem mapeamento claro (ex: "Odds ao vivo") são descartadas
}

// ── Contexto de funil por tipo ───────────────────────────────────────

const OFERTA_FUNIL: Partial<Record<OfertaType, string>> = {
  bonus:          'Aquisição — primeiro contato e depósito',
  rodadas_gratis: 'Aquisição / Engajamento — atração e reativação',
  cashback:       'Retenção — fidelização de jogadores ativos',
  pix:            'Conversão — redução de fricção no depósito',
  torneio:        'Engajamento — competição e recorrência',
  missoes:        'Engajamento — gamificação e retenção',
  saque:          'Conversão — confiança e velocidade de retirada',
  suporte:        'Retenção — premium e fidelização de alto valor',
};

const OFERTA_PATTERN_TITLE: Record<OfertaType, string> = {
  bonus:          'Bônus de Depósito',
  rodadas_gratis: 'Rodadas / Giros Grátis',
  cashback:       'Cashback Recorrente',
  pix:            'Oferta Via PIX',
  torneio:        'Torneios e Competições',
  missoes:        'Missões e Desafios',
  saque:          'Saque Rápido / Instantâneo',
  suporte:        'Clube VIP / Fidelidade',
};

// ── Consolidação de dados ────────────────────────────────────────────

interface OfertaCard {
  offer_type: OfertaType;
  offer_title: string;
  exemplos: string[];                          // até 3 textos brutos originais
  concorrentes: string[];
  tiers: Set<'alto' | 'médio'>;
  count: number;
}

function buildOfertaCards(): OfertaCard[] {
  const map = new Map<OfertaType, {
    exemplos: Map<string, string>;              // normalizado → original (deduplica)
    concorrentes: { name: string; tier: 'alto' | 'médio' }[];
  }>();

  const allCompetitors = [
    ...tierAlto.map(c => ({ ...c, tier: 'alto' as const })),
    ...tierMedio.map(c => ({ ...c, tier: 'médio' as const })),
  ];

  for (const comp of allCompetitors) {
    const tiposVistos = new Set<OfertaType>();
    for (const signal of comp.hooks) {
      const tipo = detectarOfertaType(signal);
      if (!tipo) continue;

      if (!map.has(tipo)) map.set(tipo, { exemplos: new Map(), concorrentes: [] });
      const entry = map.get(tipo)!;

      // Deduplicar exemplos por texto normalizado
      const norm = signal.toLowerCase().trim();
      if (!entry.exemplos.has(norm)) entry.exemplos.set(norm, signal);

      // Cada concorrente contado uma vez por tipo
      if (!tiposVistos.has(tipo)) {
        tiposVistos.add(tipo);
        entry.concorrentes.push({ name: comp.name, tier: comp.tier });
      }
    }
  }

  const cards: OfertaCard[] = [];
  map.forEach((entry, tipo) => {
    cards.push({
      offer_type: tipo,
      offer_title: OFERTA_PATTERN_TITLE[tipo],
      exemplos: Array.from(entry.exemplos.values()).slice(0, 3),
      concorrentes: entry.concorrentes.map(c => c.name),
      tiers: new Set(entry.concorrentes.map(c => c.tier)),
      count: entry.concorrentes.length,
    });
  });

  return cards.sort((a, b) => b.count - a.count);
}

const allCards = buildOfertaCards();
const ALTA_RECORRENCIA_THRESHOLD = 4;

// ── Componente ───────────────────────────────────────────────────────

export function OfertasEmAlta() {
  const [filterTier, setFilterTier]     = useState<'alto' | 'médio' | ''>('');
  const [filterType, setFilterType]     = useState<OfertaType | ''>('');
  // G2: detectar por conteúdo quais tipos já foram enviados com source 'concorrente'
  const [enviados, setEnviados] = useState<Set<OfertaType>>(() => {
    const existentes = loadBlocks<Oferta>(BLOCK_KEYS.ofertas);
    const tiposConcorrente = new Set(
      existentes.filter(o => o.source === 'concorrente').map(o => o.offer_type)
    );
    const jaEnviados = new Set<OfertaType>();
    allCards.forEach(card => {
      if (tiposConcorrente.has(card.offer_type)) jaEnviados.add(card.offer_type);
    });
    return jaEnviados;
  });

  const cards = useMemo(() => {
    return allCards.filter(c => {
      if (filterTier && !c.tiers.has(filterTier)) return false;
      if (filterType && c.offer_type !== filterType) return false;
      return true;
    });
  }, [filterTier, filterType]);

  const totalSinais = allCards.reduce((sum, c) => sum + c.exemplos.length, 0);
  const tiposPresentes = useMemo(() => allCards.map(c => c.offer_type), []);

  const enviarAoBiblioteca = (card: OfertaCard) => {
    const ofertas = loadBlocks<Oferta>(BLOCK_KEYS.ofertas);
    const novaOferta: Oferta = {
      id: gerarId(),
      offer_title: card.offer_title,
      offer_text: `Sinal de mercado: ${card.exemplos.join(' · ')} — usado por ${card.count} concorrente${card.count > 1 ? 's' : ''}`,
      offer_type: card.offer_type,
      status: 'draft',
      source: 'concorrente',
      created_at: new Date().toISOString(),
    };
    saveBlocks(BLOCK_KEYS.ofertas, [novaOferta, ...ofertas]);
    setEnviados(prev => new Set(prev).add(card.offer_type));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Nota semântica ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '8px',
        background: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)',
        borderRadius: '8px', padding: '10px 14px',
      }}>
        <Info size={13} color={G.colors.primary} style={{ marginTop: '2px', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Sinais extraídos dos diferenciais comunicados pelos concorrentes — tratados como <strong style={{ color: 'var(--text-primary)' }}>padrões de oferta de mercado</strong>, não como hooks criativos. Hook é abertura; oferta é benefício. Blocos distintos.
        </span>
      </div>

      {/* ── Header de métricas ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <MetricBadge label="Tipos de oferta detectados" value={allCards.length} color={G.colors.warning} />
        <MetricBadge label="Sinais brutos processados" value={totalSinais} color={G.colors.primary} />
        <MetricBadge label="Já na Biblioteca" value={enviados.size} color={G.colors.success} />
      </div>

      {/* ── Filtros ── */}
      <div className="glass-panel" style={{ padding: '14px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Filtrar
        </span>

        {/* Tier */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <FilterChip label="Todos" active={filterTier === ''} onClick={() => setFilterTier('')} />
          <FilterChip label="Tier Alto" active={filterTier === 'alto'} color="#32D74B" onClick={() => setFilterTier(filterTier === 'alto' ? '' : 'alto')} />
          <FilterChip label="Tier Médio" active={filterTier === 'médio'} color="#FF9500" onClick={() => setFilterTier(filterTier === 'médio' ? '' : 'médio')} />
        </div>

        <span style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)' }} />

        {/* Tipo */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <FilterChip label="Todos tipos" active={filterType === ''} onClick={() => setFilterType('')} />
          {tiposPresentes.map(t => (
            <FilterChip
              key={t}
              label={OFERTA_TYPE_LABEL[t]}
              active={filterType === t}
              color={OFERTA_TYPE_COLOR[t]}
              onClick={() => setFilterType(filterType === t ? '' : t)}
            />
          ))}
        </div>
      </div>

      {/* ── Cards ── */}
      {cards.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Nenhum padrão encontrado com esses filtros.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cards.map(card => {
            const jaEnviado   = enviados.has(card.offer_type);
            const altaRec     = card.count >= ALTA_RECORRENCIA_THRESHOLD;
            const nomesExibir = card.concorrentes.slice(0, 4);
            const nomesResto  = card.count - 4;

            return (
              <div
                key={card.offer_type}
                className="glass-panel"
                style={{
                  padding: '18px 20px',
                  borderLeft: `3px solid ${OFERTA_TYPE_COLOR[card.offer_type]}`,
                  opacity: jaEnviado ? 0.75 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Header do card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Source */}
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                      background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)',
                      borderRadius: '4px', border: '1px solid rgba(255,255,255,0.12)',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      Mercado
                    </span>
                    {/* Tier badges */}
                    {card.tiers.has('alto') && (
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', background: 'rgba(50,215,75,0.12)', color: '#32D74B', borderRadius: '4px', border: '1px solid rgba(50,215,75,0.25)' }}>
                        Tier Alto
                      </span>
                    )}
                    {card.tiers.has('médio') && (
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', background: 'rgba(255,149,0,0.12)', color: '#FF9500', borderRadius: '4px', border: '1px solid rgba(255,149,0,0.25)' }}>
                        Tier Médio
                      </span>
                    )}
                  </div>

                  {/* Tipo badge */}
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                    background: `${OFERTA_TYPE_COLOR[card.offer_type]}22`,
                    color: OFERTA_TYPE_COLOR[card.offer_type],
                    borderRadius: '20px',
                    border: `1px solid ${OFERTA_TYPE_COLOR[card.offer_type]}44`,
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {OFERTA_TYPE_LABEL[card.offer_type]}
                  </span>
                </div>

                {/* Título do padrão */}
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                  {card.offer_title}
                </div>

                {/* Exemplos detectados */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Exemplos detectados
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {card.exemplos.map((ex, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: OFERTA_TYPE_COLOR[card.offer_type], flexShrink: 0 }} />
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alta recorrência — indicador neutro */}
                {altaRec && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '11px', color: G.colors.warning,
                    background: 'rgba(255,149,0,0.1)', padding: '5px 10px', borderRadius: '6px',
                    marginBottom: '10px', width: 'fit-content',
                    border: '1px solid rgba(255,149,0,0.25)',
                  }}>
                    <AlertCircle size={12} />
                    Alta recorrência ({card.count} concorrentes)
                  </div>
                )}

                {/* Usado por */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Usado por
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                    {nomesExibir.map(name => (
                      <span key={name} style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                        background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}>
                        {name}
                      </span>
                    ))}
                    {nomesResto > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>+{nomesResto} mais</span>
                    )}
                  </div>
                </div>

                {/* Funil */}
                {OFERTA_FUNIL[card.offer_type] && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                      Contexto de funil
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {OFERTA_FUNIL[card.offer_type]}
                    </div>
                  </div>
                )}

                {/* Ação */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {jaEnviado ? (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 700, color: G.colors.success,
                      padding: '7px 14px', borderRadius: '8px',
                      background: 'rgba(50,215,75,0.12)', border: '1px solid rgba(50,215,75,0.3)',
                    }}>
                      <Check size={13} /> Na Biblioteca ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => enviarAoBiblioteca(card)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '12px', fontWeight: 700, color: '#0d0d0d',
                        background: OFERTA_TYPE_COLOR[card.offer_type], border: 'none',
                        padding: '7px 16px', borderRadius: '8px', cursor: 'pointer',
                        transition: 'opacity 0.15s, transform 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                    >
                      Enviar à Biblioteca <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────

function MetricBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Gift size={14} color={color} />
      <span style={{ fontSize: '20px', fontWeight: 800, color }}>{value}</span>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

function FilterChip({ label, active, color, onClick }: { label: string; active: boolean; color?: string; onClick: () => void }) {
  const activeColor = color ?? G.colors.primary;
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px',
        cursor: 'pointer', border: `1px solid ${active ? activeColor : 'rgba(255,255,255,0.15)'}`,
        background: active ? `${activeColor}22` : 'transparent',
        color: active ? activeColor : 'var(--text-secondary)',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}
