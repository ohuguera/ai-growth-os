import { useState, useMemo } from 'react';
import { TrendingUp, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { G } from '../design-system';
import { trends } from '../data/trends';
import type { Hook, HookType } from '../types/creative-blocks';
import {
  HOOK_TYPE_LABEL, HOOK_TYPE_COLOR,
  loadBlocks, saveBlocks, BLOCK_KEYS, gerarId,
} from '../types/creative-blocks';

// ── Intelligence Utilities ───────────────────────────────────────────

function abstrairPadrao(text: string): string {
  return text
    .replace(/R\$[\d.,]+/gi, '[valor]')
    .replace(/\b\d+\s*(minutos?|horas?|dias?|segundos?|h\b)/gi, '[tempo]')
    .replace(/\b\d+x\b/gi, '[Nx]')
    .replace(/^(\d+)\s/g, '[N] ')
    .replace(/\b\d+\b/g, '[número]');
}

function detectarTipo(text: string): HookType {
  const t = text.toLowerCase();
  if (/\bsacou\b|\bganhei\b|\bganhou\b|\bjoguei\b|\bapostei\b|\bresultado real\b|\bsaldo\b|\bwin\b/.test(t)) return 'prova';
  if (/como funciona|d[ií]ca|você sabia|aprende|passo a passo|explicar|funciona assim/.test(t)) return 'tutorial';
  if (/espera|n[aã]o querem|bloqueado|banido|absurdo|impressionante/.test(t)) return 'choque';
  // Uppercase signal (>3 consecutive caps = choque/emoção)
  if (/[A-ZÁÀÂÃÉÊÍÓÔÕÚ]{4,}/.test(text) && /[?!]/.test(text)) return 'choque';
  if (/meu cora[çc]|emo[çc]ion|incrív|reação|surpreend/.test(t)) return 'emocao';
  if (/olha aqui|vem ver|antes de fechar|clica|acessa/.test(t)) return 'cta_abertura';
  return 'curiosidade';
}

// ── Card Builder ─────────────────────────────────────────────────────

interface HookCard {
  idx: number;
  hook_text: string;
  hook_pattern: string;
  hook_type: HookType;
  platform: string;
  platformColor: string;
  growth: string;
  growthColor: string;
  trendName: string;
  adaptation: string;
  campaignUse: string;
}

const allCards: HookCard[] = trends.map((t, i) => ({
  idx: i,
  hook_text: t.hook,
  hook_pattern: abstrairPadrao(t.hook),
  hook_type: detectarTipo(t.hook),
  platform: t.platform,
  platformColor: t.platformColor,
  growth: t.growth,
  growthColor: t.growthColor,
  trendName: t.name,
  adaptation: t.adaptation,
  campaignUse: t.campaignUse,
}));

// Recorrência: hook_type com 2+ cards → marcar com contagem
function buildRecorrenciaMap(cards: HookCard[]): Map<HookType, number> {
  const counts = new Map<HookType, number>();
  cards.forEach(c => counts.set(c.hook_type, (counts.get(c.hook_type) ?? 0) + 1));
  counts.forEach((v, k) => { if (v < 2) counts.delete(k); });
  return counts;
}

// ── Plataformas disponíveis ──────────────────────────────────────────

const PLATFORMS = ['Instagram Reels', 'TikTok', 'YouTube Shorts'];

// ── Componente ───────────────────────────────────────────────────────

export function HooksEmAlta() {
  const [filterPlatform, setFilterPlatform] = useState<string>('');
  const [filterType, setFilterType]         = useState<HookType | ''>('');
  // G2: detectar por conteúdo quais cards já existem no Banco (persiste entre sessões)
  const [enviados, setEnviados] = useState<Set<number>>(() => {
    const existentes = loadBlocks<Hook>(BLOCK_KEYS.hooks);
    const textos = new Set(existentes.map(h => h.hook_text.toLowerCase().trim()));
    const jaEnviados = new Set<number>();
    allCards.forEach((card, idx) => {
      if (textos.has(card.hook_text.toLowerCase().trim())) jaEnviados.add(idx);
    });
    return jaEnviados;
  });

  const cards = useMemo(() => {
    return allCards.filter(c => {
      if (filterPlatform && c.platform !== filterPlatform) return false;
      if (filterType    && c.hook_type !== filterType)    return false;
      return true;
    });
  }, [filterPlatform, filterType]);

  const recorrenciaMap = useMemo(() => buildRecorrenciaMap(cards), [cards]);

  const jaEnviadoCount = enviados.size;

  const enviarAoBanco = (card: HookCard) => {
    const hooks = loadBlocks<Hook>(BLOCK_KEYS.hooks);
    const novoHook: Hook = {
      id: gerarId(),
      hook_text: card.hook_text,
      hook_pattern: card.hook_pattern,  // G5: preservar abstração
      hook_type: card.hook_type,
      status: 'draft',
      source: 'radar',
      created_at: new Date().toISOString(),
    };
    saveBlocks(BLOCK_KEYS.hooks, [novoHook, ...hooks]);
    setEnviados(prev => new Set(prev).add(card.idx));
  };

  // Tipos presentes nos cards filtrados
  const tiposPresentes = useMemo(() => {
    const s = new Set(allCards.map(c => c.hook_type));
    return Array.from(s) as HookType[];
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header de métricas ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <MetricBadge label="Hooks disponíveis" value={allCards.length} color={G.colors.warning} />
        <MetricBadge label="Já no Banco" value={jaEnviadoCount} color={G.colors.success} />
        <MetricBadge
          label="Padrões distintos"
          value={new Set(allCards.map(c => c.hook_type)).size}
          color={G.colors.primary}
        />
      </div>

      {/* ── Filtros ── */}
      <div className="glass-panel" style={{ padding: '14px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Filtrar
        </span>

        {/* Platform */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <FilterChip label="Todos" active={filterPlatform === ''} onClick={() => setFilterPlatform('')} />
          {PLATFORMS.map(p => (
            <FilterChip key={p} label={p.replace(' Reels', '').replace('YouTube ', 'YT ')} active={filterPlatform === p} onClick={() => setFilterPlatform(filterPlatform === p ? '' : p)} />
          ))}
        </div>

        <span style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.12)' }} />

        {/* Hook type */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <FilterChip label="Todos tipos" active={filterType === ''} onClick={() => setFilterType('')} />
          {tiposPresentes.map(t => (
            <FilterChip
              key={t}
              label={HOOK_TYPE_LABEL[t]}
              active={filterType === t}
              color={HOOK_TYPE_COLOR[t]}
              onClick={() => setFilterType(filterType === t ? '' : t)}
            />
          ))}
        </div>
      </div>

      {/* ── Cards ── */}
      {cards.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Nenhum hook encontrado com esses filtros.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cards.map(card => {
            const jaEnviado   = enviados.has(card.idx);
            const recorrencia = recorrenciaMap.get(card.hook_type);

            return (
              <div
                key={card.idx}
                className="glass-panel"
                style={{
                  padding: '18px 20px',
                  borderLeft: `3px solid ${HOOK_TYPE_COLOR[card.hook_type]}`,
                  opacity: jaEnviado ? 0.75 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Header do card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Platform */}
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                      background: `${card.platformColor}22`, color: card.platformColor,
                      borderRadius: '4px', border: `1px solid ${card.platformColor}44`,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {card.platform}
                    </span>
                    {/* Growth */}
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                      background: `${card.growthColor}18`, color: card.growthColor,
                      borderRadius: '4px',
                    }}>
                      ↑ {card.growth}
                    </span>
                  </div>

                  {/* Hook type badge */}
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                    background: `${HOOK_TYPE_COLOR[card.hook_type]}22`,
                    color: HOOK_TYPE_COLOR[card.hook_type],
                    borderRadius: '20px',
                    border: `1px solid ${HOOK_TYPE_COLOR[card.hook_type]}44`,
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {HOOK_TYPE_LABEL[card.hook_type]}
                  </span>
                </div>

                {/* Trend name */}
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {card.trendName}
                </div>

                {/* Hook original */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    Hook Original
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.45', fontStyle: 'italic' }}>
                    "{card.hook_text}"
                  </div>
                </div>

                {/* Padrão abstraído */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    Padrão
                  </div>
                  <div style={{
                    fontSize: '13px', color: G.colors.warning, fontFamily: 'monospace',
                    background: 'rgba(255,149,0,0.08)', padding: '6px 10px', borderRadius: '6px',
                    border: '1px solid rgba(255,149,0,0.2)',
                  }}>
                    "{card.hook_pattern}"
                  </div>
                </div>

                {/* Indicador de recorrência */}
                {recorrencia && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '11px', color: G.colors.warning,
                    background: 'rgba(255,149,0,0.1)', padding: '5px 10px', borderRadius: '6px',
                    marginBottom: '10px', width: 'fit-content',
                    border: '1px solid rgba(255,149,0,0.25)',
                  }}>
                    <AlertCircle size={12} />
                    Padrão recorrente ({recorrencia}×) — {HOOK_TYPE_LABEL[card.hook_type]}
                  </div>
                )}

                {/* Adaptação + uso */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <InfoPill label="Adaptação" value={card.adaptation} />
                  <InfoPill label="Uso na campanha" value={card.campaignUse} />
                </div>

                {/* Ação */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {jaEnviado ? (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 700, color: G.colors.success,
                      padding: '7px 14px', borderRadius: '8px',
                      background: 'rgba(50,215,75,0.12)', border: '1px solid rgba(50,215,75,0.3)',
                    }}>
                      <Check size={13} /> No Banco ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => enviarAoBanco(card)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '12px', fontWeight: 700, color: '#0d0d0d',
                        background: G.colors.warning, border: 'none',
                        padding: '7px 16px', borderRadius: '8px', cursor: 'pointer',
                        transition: 'opacity 0.15s, transform 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                    >
                      Enviar ao Banco <ArrowRight size={13} />
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
      <TrendingUp size={14} color={color} />
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

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ flex: 1, minWidth: '160px' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
        {label}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
        {value}
      </div>
    </div>
  );
}
