import { useState, useMemo } from 'react';
import { Layers, Check, AlertCircle, ArrowRight, Cpu, GitBranch } from 'lucide-react';
import { G } from '../design-system';
import { trends } from '../data/trends';
import type { Template, TemplateType, TemplateLineType } from '../types/creative-blocks';
import {
  TEMPLATE_TYPE_LABEL, TEMPLATE_TYPE_COLOR,
  TEMPLATE_LINE_LABEL, TEMPLATE_LINE_COLOR,
  loadBlocks, saveBlocks, BLOCK_KEYS, gerarId,
} from '../types/creative-blocks';

// ── Detecção de tipo narrativo ───────────────────────────────────────

function detectarTemplateType(format: string, suggestedFormat: string): TemplateType {
  const t = `${format} ${suggestedFormat}`.toLowerCase();
  if (/\bpov\b|saldo|sacou|resultado.*pip|pip.*resultado/.test(t)) return 'pov_resultado';
  if (/tutorial|como funciona|dicas|lista|split screen|explicativo|voz over|texto.*tela/.test(t)) return 'tutorial_curto';
  if (/screen recording|resultado real|narração.*resultado|documentado/.test(t)) return 'prova_social';
  if (/dueto|reagindo|reação|reacao|win/.test(t)) return 'gameplay_reacao';
  if (/antes.*depois|depois.*antes|comparativo|transição|transi[çc]ao|mudança de estado/.test(t)) return 'storytelling';
  return 'prova_social';
}

// ── Detecção de linha de produção ────────────────────────────────────

function detectarLineType(format: string, suggestedFormat: string, platform: string): TemplateLineType {
  const t = `${format} ${suggestedFormat}`.toLowerCase();
  // L3 — conteúdo longo, voz narrada, screen recording
  if (/45|60s|screen recording|narração|voz over|3 cortes/.test(t)) return 'L3';
  // L2 — conteúdo reativo curto, dueto, sem estrutura pesada
  if (/\b15s\b|corte rápido|dueto|sem corte nos primeiros|reação genuína/.test(t)) return 'L2';
  // L1 — Reels estruturados, split screen, transição, áudio no beat
  if (/\b30s\b|split screen|transição|texto explicativo|áudio.*beat|beat/.test(t)) return 'L1';
  // Fallback por plataforma
  if (platform === 'YouTube Shorts') return 'L3';
  if (platform === 'TikTok') return 'L2';
  return 'L1';
}

// ── Ordenação por relevância de growth ──────────────────────────────

const GROWTH_ORDER: Record<string, number> = {
  'Viral': 0, 'Explosivo': 1, 'Crescente': 2, 'Estável Alto': 3,
};

// ── Card Builder ─────────────────────────────────────────────────────

interface FormatoCard {
  idx: number;
  trendName: string;
  platform: string;
  platformColor: string;
  growth: string;
  growthColor: string;
  template_type: TemplateType;
  line_type: TemplateLineType;
  structure: string;       // suggestedFormat — campo structure do Template
  notes: string;           // adaptation + campaignUse — notas de produção
  structureNorm: string;   // normalizado para comparação G2
}

const allCards: FormatoCard[] = trends
  .map((t, i) => {
    const template_type = detectarTemplateType(t.format, t.suggestedFormat);
    const line_type     = detectarLineType(t.format, t.suggestedFormat, t.platform);
    return {
      idx: i,
      trendName: t.name,
      platform: t.platform,
      platformColor: t.platformColor,
      growth: t.growth,
      growthColor: t.growthColor,
      template_type,
      line_type,
      structure: t.suggestedFormat,
      notes: `${t.adaptation} | Funil: ${t.campaignUse}`,
      structureNorm: t.suggestedFormat.toLowerCase().trim().replace(/\s+/g, ' '),
    };
  })
  .sort((a, b) => (GROWTH_ORDER[a.growth] ?? 9) - (GROWTH_ORDER[b.growth] ?? 9));

// ── Detecção de recorrência por template_type ────────────────────────

function buildRecorrenciaMap(cards: FormatoCard[]): Map<TemplateType, number> {
  const counts = new Map<TemplateType, number>();
  cards.forEach(c => counts.set(c.template_type, (counts.get(c.template_type) ?? 0) + 1));
  counts.forEach((v, k) => { if (v < 2) counts.delete(k); });
  return counts;
}

// ── Chave de identidade estrutural (G2) ─────────────────────────────
// Combina template_type + line_type + structure normalizado

function chaveEstrutural(type: TemplateType, line: TemplateLineType, structure: string): string {
  return `${type}__${line}__${structure.toLowerCase().trim().replace(/\s+/g, ' ')}`;
}

// ── Componente ───────────────────────────────────────────────────────

const PLATFORMS = ['Instagram Reels', 'TikTok', 'YouTube Shorts'];

export function FormatosEmAlta() {
  const [filterPlatform, setFilterPlatform] = useState<string>('');
  const [filterType, setFilterType]         = useState<TemplateType | ''>('');

  // G2: detecção estrutural (template_type + line_type + structure normalizado)
  const [adicionados, setAdicionados] = useState<Set<number>>(() => {
    const existentes = loadBlocks<Template>(BLOCK_KEYS.templates);
    const chavesExistentes = new Set(
      existentes
        .filter(t => t.source === 'radar')
        .map(t => chaveEstrutural(t.template_type, t.line_type, t.structure))
    );
    const jaAdicionados = new Set<number>();
    allCards.forEach((card, idx) => {
      if (chavesExistentes.has(chaveEstrutural(card.template_type, card.line_type, card.structure))) {
        jaAdicionados.add(idx);
      }
    });
    return jaAdicionados;
  });

  const cards = useMemo(() => {
    return allCards.filter(c => {
      if (filterPlatform && c.platform !== filterPlatform) return false;
      if (filterType    && c.template_type !== filterType) return false;
      return true;
    });
  }, [filterPlatform, filterType]);

  const recorrenciaMap = useMemo(() => buildRecorrenciaMap(cards), [cards]);
  const tiposPresentes = useMemo(() => Array.from(new Set(allCards.map(c => c.template_type))), []);
  const jaAdicionadoCount = adicionados.size;

  const adicionarATemplates = (card: FormatoCard) => {
    const templates = loadBlocks<Template>(BLOCK_KEYS.templates);
    const novoTemplate: Template = {
      id:            gerarId(),
      title:         `${card.trendName} — Radar`,
      template_type: card.template_type,
      line_type:     card.line_type,
      structure:     card.structure,
      notes:         card.notes,
      status:        'draft',
      source:        'radar',
      created_at:    new Date().toISOString(),
    };
    saveBlocks(BLOCK_KEYS.templates, [novoTemplate, ...templates]);
    setAdicionados(prev => new Set(prev).add(card.idx));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Métricas ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <MetricBadge label="Formatos disponíveis" value={allCards.length}    color={G.colors.primary} />
        <MetricBadge label="Já em Templates"      value={jaAdicionadoCount}  color={G.colors.success} />
        <MetricBadge label="Tipos distintos"       value={tiposPresentes.length} color={G.colors.warning} />
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

        {/* Tipo */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <FilterChip label="Todos tipos" active={filterType === ''} onClick={() => setFilterType('')} />
          {tiposPresentes.map(t => (
            <FilterChip key={t} label={TEMPLATE_TYPE_LABEL[t]} active={filterType === t} color={TEMPLATE_TYPE_COLOR[t]}
              onClick={() => setFilterType(filterType === t ? '' : t)} />
          ))}
        </div>
      </div>

      {/* ── Cards ── */}
      {cards.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Nenhum formato encontrado com esses filtros.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cards.map(card => {
            const jaAdicionado = adicionados.has(card.idx);
            const recorrencia  = recorrenciaMap.get(card.template_type);
            const typeColor    = TEMPLATE_TYPE_COLOR[card.template_type];
            const lineColor    = TEMPLATE_LINE_COLOR[card.line_type];

            return (
              <div
                key={card.idx}
                className="glass-panel"
                style={{
                  padding: '18px 20px',
                  borderLeft: `3px solid ${typeColor}`,
                  opacity: jaAdicionado ? 0.75 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* ── Linha 1: plataforma + growth ── */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                    background: `${card.platformColor}22`, color: card.platformColor,
                    borderRadius: '4px', border: `1px solid ${card.platformColor}44`,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {card.platform}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                    background: `${card.growthColor}18`, color: card.growthColor, borderRadius: '4px',
                  }}>
                    ↑ {card.growth}
                  </span>
                </div>

                {/* ── Nome da tendência ── */}
                <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
                  {card.trendName}
                </div>

                {/* ── Inteligência detectada — destaque visual ── */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px',
                  padding: '12px 14px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {/* Tipo narrativo */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                      <Cpu size={11} color={typeColor} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Tipo detectado
                      </span>
                    </div>
                    <span style={{
                      fontSize: '12px', fontWeight: 700, color: typeColor,
                      padding: '3px 10px', borderRadius: '20px',
                      background: `${typeColor}18`, border: `1px solid ${typeColor}35`,
                    }}>
                      {TEMPLATE_TYPE_LABEL[card.template_type]}
                    </span>
                  </div>

                  {/* Linha sugerida */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                      <GitBranch size={11} color={lineColor} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Linha sugerida
                      </span>
                    </div>
                    <span style={{
                      fontSize: '12px', fontWeight: 700, color: lineColor,
                      padding: '3px 10px', borderRadius: '20px',
                      background: `${lineColor}18`, border: `1px solid ${lineColor}35`,
                    }}>
                      {TEMPLATE_LINE_LABEL[card.line_type]}
                    </span>
                  </div>
                </div>

                {/* ── Estrutura ── */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    Estrutura
                  </div>
                  <div style={{
                    fontSize: '13px', color: G.colors.primary, fontFamily: 'monospace',
                    background: 'rgba(10,132,255,0.08)', padding: '7px 10px', borderRadius: '6px',
                    border: '1px solid rgba(10,132,255,0.2)', lineHeight: '1.5',
                  }}>
                    {card.structure}
                  </div>
                </div>

                {/* ── Notas de produção ── */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    Notas de produção
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {card.notes}
                  </div>
                </div>

                {/* ── Estrutura recorrente ── */}
                {recorrencia && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '11px', color: G.colors.warning,
                    background: 'rgba(255,149,0,0.1)', padding: '5px 10px', borderRadius: '6px',
                    marginBottom: '12px', width: 'fit-content',
                    border: '1px solid rgba(255,149,0,0.25)',
                  }}>
                    <AlertCircle size={12} />
                    Estrutura recorrente ({recorrencia}×) — {TEMPLATE_TYPE_LABEL[card.template_type]}
                  </div>
                )}

                {/* ── Ação ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {jaAdicionado ? (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 700, color: G.colors.success,
                      padding: '7px 14px', borderRadius: '8px',
                      background: 'rgba(50,215,75,0.12)', border: '1px solid rgba(50,215,75,0.3)',
                    }}>
                      <Check size={13} /> Em Templates ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => adicionarATemplates(card)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '12px', fontWeight: 700, color: '#0d0d0d',
                        background: typeColor, border: 'none',
                        padding: '7px 16px', borderRadius: '8px', cursor: 'pointer',
                        transition: 'opacity 0.15s, transform 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                    >
                      Adicionar a Templates <ArrowRight size={13} />
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
      <Layers size={14} color={color} />
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
