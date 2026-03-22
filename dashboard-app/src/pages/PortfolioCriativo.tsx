import { useState, useEffect } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, RefreshCw, Search, RotateCcw } from 'lucide-react';
import { G, GlassCard } from '../design-system';
import {
  type ProductionItem,
  type LineType,
  LINE_CONFIG,
  loadAllPublished,
} from '../types/production';
import {
  type Template,
  BLOCK_KEYS,
  loadBlocks,
} from '../types/creative-blocks';

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────

function formatPublishedDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' · ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function montarCopyEstruturada(item: ProductionItem): string {
  const partes: string[] = [];
  if (item.hook) { partes.push('HOOK:'); partes.push(item.hook); partes.push(''); }
  if (item.copy_desenvolvimento) { partes.push('DESENVOLVIMENTO:'); partes.push(item.copy_desenvolvimento); partes.push(''); }
  if (item.copy_cta) { partes.push('CTA:'); partes.push(item.copy_cta); }
  return partes.join('\n').trim();
}

function getWeekGroup(iso: string): 'esta_semana' | 'semana_passada' | 'mais_antigos' {
  const d = new Date(iso);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  if (d >= startOfWeek) return 'esta_semana';
  if (d >= startOfLastWeek) return 'semana_passada';
  return 'mais_antigos';
}

const WEEK_LABEL: Record<string, string> = {
  esta_semana:    'Esta semana',
  semana_passada: 'Semana passada',
  mais_antigos:   'Mais antigos',
};

const WEEK_ORDER = ['esta_semana', 'semana_passada', 'mais_antigos'];

// ─────────────────────────────────────────
// PORTFOLIO CARD
// ─────────────────────────────────────────

function PortfolioCard({
  item,
  templateResolvido,
  onUsarComoBase,
  toastId,
}: {
  item: ProductionItem;
  templateResolvido: Template | null;
  onUsarComoBase: (id: string) => void;
  toastId: string | null;
}) {
  const [expandido, setExpandido]     = useState(false);
  const [copiadoHook, setCopiadoHook] = useState(false);
  const [copiadoCopy, setCopiadoCopy] = useState(false);

  const lineCfg  = LINE_CONFIG[item.line_type];
  const temCopy  = !!(item.hook || item.copy_desenvolvimento || item.copy_cta);
  const isToasted = toastId === item.id;

  const cenas: any[] = (() => {
    try { return item.roteiro_json ? JSON.parse(item.roteiro_json) : []; }
    catch { return []; }
  })();

  const copiar = (texto: string, set: (v: boolean) => void) => {
    navigator.clipboard.writeText(texto).then(() => {
      set(true);
      setTimeout(() => set(false), 2000);
    });
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderLeft: `3px solid ${lineCfg.color}`,
      borderRadius: '10px',
      overflow: 'hidden',
      transition: 'background 0.3s ease',
    }}>
      {/* Row principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', flexWrap: 'wrap' }}>

        {/* Badge linha */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
          background: `${lineCfg.color}18`, border: `1px solid ${lineCfg.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: '900', color: lineCfg.color,
        }}>
          {item.line_type}
        </div>

        {/* Título + detalhes */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px', fontWeight: '600', color: '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.title}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
            {item.hook && (
              <div style={{
                fontSize: '11px', color: 'rgba(255,255,255,0.32)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px',
              }}>
                {item.hook}
              </div>
            )}
            {item.offer && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}>·</span>
                <span style={{ fontSize: '10px', color: G.colors.warning, fontWeight: '600' }}>
                  {item.offer}
                </span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
            {item.published_at && (
              <div style={{ fontSize: '10px', color: G.colors.success, fontWeight: '600' }}>
                {formatPublishedDate(item.published_at)}
              </div>
            )}
            {templateResolvido && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '10px' }}>·</span>
                <span style={{ fontSize: '10px', color: G.colors.secondary, fontWeight: '600' }}>
                  {templateResolvido.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Ação: Copiar Hook */}
        {item.hook && (
          <button onClick={() => copiar(item.hook, setCopiadoHook)} style={{
            background: copiadoHook ? `${G.colors.success}18` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copiadoHook ? G.colors.success + '45' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '6px', padding: '5px 9px', cursor: 'pointer',
            fontSize: '10px', fontWeight: '700',
            color: copiadoHook ? G.colors.success : 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', gap: '4px',
            transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {copiadoHook ? <Check size={10} /> : <Copy size={10} />}
            {copiadoHook ? 'Hook copiado' : 'Copiar Hook'}
          </button>
        )}

        {/* Ação: Copiar Copy */}
        {temCopy && (
          <button onClick={() => copiar(montarCopyEstruturada(item), setCopiadoCopy)} style={{
            background: copiadoCopy ? `${G.colors.copy}18` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${copiadoCopy ? G.colors.copy + '45' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '6px', padding: '5px 9px', cursor: 'pointer',
            fontSize: '10px', fontWeight: '700',
            color: copiadoCopy ? G.colors.copy : 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', gap: '4px',
            transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {copiadoCopy ? <Check size={10} /> : <Copy size={10} />}
            {copiadoCopy ? 'Copy copiada' : 'Copiar Copy'}
          </button>
        )}

        {/* Ação: Ver Roteiro */}
        {cenas.length > 0 && (
          <button onClick={() => setExpandido(v => !v)} style={{
            background: expandido ? `${G.colors.secondary}18` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${expandido ? G.colors.secondary + '35' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '6px', padding: '5px 9px', cursor: 'pointer',
            fontSize: '10px', fontWeight: '700',
            color: expandido ? G.colors.secondary : 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', gap: '4px',
            transition: 'all 0.2s', flexShrink: 0,
          }}>
            {expandido ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            Roteiro
          </button>
        )}

        {/* Ação: Usar como Base */}
        <button onClick={() => onUsarComoBase(item.id)} style={{
          background: isToasted ? `${G.colors.primary}25` : `${G.colors.primary}12`,
          border: `1px solid ${isToasted ? G.colors.primary + '60' : G.colors.primary + '30'}`,
          borderRadius: '6px', padding: '5px 10px', cursor: 'pointer',
          fontSize: '10px', fontWeight: '800',
          color: isToasted ? G.colors.primary : `${G.colors.primary}cc`,
          display: 'flex', alignItems: 'center', gap: '4px',
          transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          <RotateCcw size={10} />
          {isToasted ? 'Sessão preenchida!' : 'Usar como Base'}
        </button>
      </div>

      {/* Painel expandido — Copy + Roteiro */}
      {expandido && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '12px 14px 14px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          {/* Copy estruturada */}
          {temCopy && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px', padding: '10px 14px',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              {item.hook && (
                <div>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.22)', letterSpacing: '1px', marginBottom: '3px' }}>HOOK</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5' }}>{item.hook}</div>
                </div>
              )}
              {item.copy_desenvolvimento && (
                <div>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.22)', letterSpacing: '1px', marginBottom: '3px' }}>DESENVOLVIMENTO</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5' }}>{item.copy_desenvolvimento}</div>
                </div>
              )}
              {item.copy_cta && (
                <div>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.22)', letterSpacing: '1px', marginBottom: '3px' }}>CTA</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5' }}>{item.copy_cta}</div>
                </div>
              )}
            </div>
          )}

          {/* Cenas */}
          {cenas.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {cenas.map((cena: any, idx: number) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '22px 75px 1fr 55px',
                  gap: '8px', alignItems: 'center',
                  padding: '5px 0',
                  borderBottom: idx < cenas.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>{cena.order}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: G.colors.secondary }}>{String(cena.type ?? '').toUpperCase()}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{cena.description}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', textAlign: 'right' }}>{cena.duration}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// GRUPO DE SEMANA
// ─────────────────────────────────────────

function GrupoSemana({
  label,
  items,
  templateMap,
  onUsarComoBase,
  toastId,
}: {
  label: string;
  items: ProductionItem[];
  templateMap: Map<string, Template>;
  onUsarComoBase: (id: string) => void;
  toastId: string | null;
}) {
  if (items.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      padding: '16px 18px',
    }}>
      <div style={{
        fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.3)',
        letterSpacing: '1.5px', marginBottom: '12px',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        {label.toUpperCase()}
        <span style={{
          fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1px 7px',
        }}>
          {items.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map(item => (
          <PortfolioCard
            key={item.id}
            item={item}
            templateResolvido={item.template_id ? (templateMap.get(item.template_id) ?? null) : null}
            onUsarComoBase={onUsarComoBase}
            toastId={toastId}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────

function HeaderPortfolio({
  total,
  byLine,
  filtroLinha,
  setFiltroLinha,
  busca,
  setBusca,
  onRefresh,
}: {
  total: number;
  byLine: { line: LineType; count: number; color: string }[];
  filtroLinha: LineType | 'todos';
  setFiltroLinha: (v: LineType | 'todos') => void;
  busca: string;
  setBusca: (v: string) => void;
  onRefresh: () => void;
}) {
  return (
    <GlassCard style={{ padding: '20px 24px', borderRadius: '20px' }}>

      {/* Linha 1: título + botão refresh */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{
            fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)',
            letterSpacing: '2px', marginBottom: '4px',
          }}>
            PORTFÓLIO CRIATIVO
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <div style={{ fontSize: '26px', fontWeight: '800' }}>
              {total}
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: '400', marginLeft: '6px' }}>
                publicados
              </span>
            </div>
          </div>
        </div>
        <button onClick={onRefresh} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '7px 12px', cursor: 'pointer',
          fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s',
        }}>
          <RefreshCw size={11} />
          Atualizar
        </button>
      </div>

      {/* Divisória */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>

          {/* Breakdown L1/L2/L3 */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {byLine.map(({ line, count, color }) => (
              <div key={line} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '5px', flexShrink: 0,
                  background: `${color}18`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: '900', color,
                }}>
                  {line}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color }}>{count}</span>
              </div>
            ))}
          </div>

          {/* Filtro linha + busca */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filtro linha */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['todos', 'L1', 'L2', 'L3'] as const).map(opt => (
                <button key={opt} onClick={() => setFiltroLinha(opt)} style={{
                  background: filtroLinha === opt ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: `1px solid ${filtroLinha === opt ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                  fontSize: '10px', fontWeight: '700',
                  color: filtroLinha === opt ? '#fff' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.2s',
                }}>
                  {opt === 'todos' ? 'Todos' : opt}
                </button>
              ))}
            </div>

            {/* Busca */}
            <div style={{ position: 'relative' }}>
              <Search size={11} style={{
                position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Buscar por título ou hook..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '7px', padding: '6px 10px 6px 28px',
                  fontSize: '11px', color: '#fff', outline: 'none',
                  width: '200px', transition: 'border-color 0.2s',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────

export const PortfolioCriativo = () => {
  const [allItems, setAllItems]       = useState<ProductionItem[]>([]);
  const [filtroLinha, setFiltroLinha] = useState<LineType | 'todos'>('todos');
  const [busca, setBusca]             = useState('');
  const [toastId, setToastId]         = useState<string | null>(null);
  const [templateMap, setTemplateMap] = useState<Map<string, Template>>(new Map());

  const carregar = () => {
    setAllItems(loadAllPublished());
    const templates = loadBlocks<Template>(BLOCK_KEYS.templates);
    setTemplateMap(new Map(templates.map(t => [t.id, t])));
  };

  useEffect(() => {
    carregar();
    // Auto-refresh ao voltar para a aba — capta publicações feitas em Clipes Gerados
    const handleVisibility = () => { if (!document.hidden) carregar(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Filtros
  const filtrados = allItems.filter(item => {
    const passaLinha = filtroLinha === 'todos' || item.line_type === filtroLinha;
    const passaBusca = !busca.trim() ||
      item.title.toLowerCase().includes(busca.toLowerCase()) ||
      item.hook.toLowerCase().includes(busca.toLowerCase());
    return passaLinha && passaBusca;
  });

  // Breakdown
  const byLine = (['L1', 'L2', 'L3'] as LineType[]).map(line => ({
    line,
    count: allItems.filter(i => i.line_type === line).length,
    color: LINE_CONFIG[line].color,
  }));

  // Agrupamento por semana
  const grupos = WEEK_ORDER.reduce<Record<string, ProductionItem[]>>((acc, k) => {
    acc[k] = [];
    return acc;
  }, { esta_semana: [], semana_passada: [], mais_antigos: [] });

  filtrados.forEach(item => {
    const ref = item.published_at ?? item.created_at;
    grupos[getWeekGroup(ref)].push(item);
  });

  // Usar como Base — preenche sessão criativa
  const usarComoBase = (id: string) => {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    // Hook sintético
    if (item.hook) {
      const hookPayload = {
        id: `base_${item.id}`,
        hook_text: item.hook,
        hook_type: 'curiosidade' as const,
        status: 'validado' as const,
        source: 'manual' as const,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(BLOCK_KEYS.hook_selected, JSON.stringify(hookPayload));
    }

    // Oferta sintética
    if (item.offer) {
      const ofertaPayload = {
        id: `base_${item.id}`,
        offer_title: item.offer,
        offer_text: item.offer,
        offer_type: 'bonus' as const,
        status: 'validada' as const,
        source: 'manual' as const,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(BLOCK_KEYS.offer_selected, JSON.stringify(ofertaPayload));
    }

    // Template real (se resolvido)
    if (item.template_id && templateMap.has(item.template_id)) {
      const template = templateMap.get(item.template_id)!;
      localStorage.setItem(BLOCK_KEYS.template_selected, JSON.stringify(template));
    }

    // Toast
    setToastId(id);
    setTimeout(() => setToastId(null), 3000);
  };

  const vazio = filtrados.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <HeaderPortfolio
        total={allItems.length}
        byLine={byLine}
        filtroLinha={filtroLinha}
        setFiltroLinha={setFiltroLinha}
        busca={busca}
        setBusca={setBusca}
        onRefresh={carregar}
      />

      {/* Toast global */}
      {toastId && (
        <div style={{
          background: `${G.colors.primary}18`,
          border: `1px solid ${G.colors.primary}35`,
          borderRadius: '10px', padding: '10px 18px',
          fontSize: '12px', fontWeight: '700', color: G.colors.primary,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          ✓ Sessão preenchida com hook, oferta e template. Vá para Copy & Roteiro para aplicar.
        </div>
      )}

      {/* Vazio */}
      {vazio && (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px', padding: '48px 24px',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center',
        }}>
          <div style={{ fontSize: '28px', opacity: 0.3 }}>📼</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.3)' }}>
            {busca || filtroLinha !== 'todos' ? 'Nenhum criativo encontrado' : 'Nenhum criativo publicado ainda'}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.18)' }}>
            {busca || filtroLinha !== 'todos'
              ? 'Tente outro filtro ou limpe a busca'
              : 'Publique clipes em Clipes Gerados para vê-los aqui'}
          </div>
        </div>
      )}

      {/* Grupos por semana */}
      {WEEK_ORDER.map(k => (
        <GrupoSemana
          key={k}
          label={WEEK_LABEL[k]}
          items={grupos[k]}
          templateMap={templateMap}
          onUsarComoBase={usarComoBase}
          toastId={toastId}
        />
      ))}
    </div>
  );
};
