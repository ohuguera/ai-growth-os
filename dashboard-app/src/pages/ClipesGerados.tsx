import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';
import {
  type ProductionItem,
  type ProductionStatus,
  type LineType,
  LINE_CONFIG,
  isConcluido,
  scanAllDays,
  getTodayKey,
  loadItems,
  saveItems,
} from '../types/production';

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────

function formatDayLabel(dateKey: string): string {
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateKey === today)     return 'Hoje';
  if (dateKey === yesterday) return 'Ontem';
  return new Date(dateKey + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function formatPublishedAt(iso: string): string {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Publicado às ${time}`;
  return `Publicado em ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${time}`;
}

function montarCopyEstruturada(item: ProductionItem): string {
  const partes: string[] = [];
  if (item.hook) {
    partes.push('HOOK:');
    partes.push(item.hook);
    partes.push('');
  }
  if (item.copy_desenvolvimento) {
    partes.push('DESENVOLVIMENTO:');
    partes.push(item.copy_desenvolvimento);
    partes.push('');
  }
  if (item.copy_cta) {
    partes.push('CTA:');
    partes.push(item.copy_cta);
  }
  return partes.join('\n').trim();
}

// ─────────────────────────────────────────
// CLIPE CARD
// ─────────────────────────────────────────

function ClipeCard({ item, onPublicar, recentlyPublished }: {
  item: ProductionItem;
  onPublicar?: (id: string) => void;
  recentlyPublished: boolean;
}) {
  const [expandido, setExpandido] = useState(false);
  const [copiadoHook, setCopiadoHook] = useState(false);
  const [copiadoCopy, setCopiadoCopy] = useState(false);

  const lineCfg = LINE_CONFIG[item.line_type];
  const isDone = item.status === 'done';

  const cenas: any[] = (() => {
    try { return item.roteiro_json ? JSON.parse(item.roteiro_json) : []; }
    catch { return []; }
  })();

  const temCopy = !!(item.hook || item.copy_desenvolvimento || item.copy_cta);
  const temRoteiro = cenas.length > 0;

  const copiar = (texto: string, set: (v: boolean) => void) => {
    navigator.clipboard.writeText(texto).then(() => {
      set(true);
      setTimeout(() => set(false), 2000);
    });
  };

  return (
    <div style={{
      background: recentlyPublished
        ? `${G.colors.success}10`
        : isDone ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.015)',
      border: recentlyPublished
        ? `1px solid ${G.colors.success}45`
        : isDone ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0.045)',
      borderLeft: `3px solid ${lineCfg.color}`,
      borderRadius: '10px',
      overflow: 'hidden',
      transition: 'background 0.5s ease, border-color 0.5s ease',
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
          {item.hook && (
            <div style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.32)', marginTop: '2px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {item.hook}
            </div>
          )}
          {item.status === 'published' && item.published_at && (
            <div style={{ fontSize: '10px', color: G.colors.success, marginTop: '2px', fontWeight: '600' }}>
              {formatPublishedAt(item.published_at)}
            </div>
          )}
        </div>

        {/* Badge recente */}
        {recentlyPublished && <Badge label="PUBLICADO ✓" color={G.colors.success} />}

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
        {temRoteiro && (
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

        {/* Ação: Marcar Publicado — apenas em done */}
        {isDone && onPublicar && (
          <button onClick={() => onPublicar(item.id)} style={{
            background: `${G.colors.success}18`,
            border: `1px solid ${G.colors.success}40`,
            borderRadius: '6px', padding: '5px 12px', cursor: 'pointer',
            fontSize: '10px', fontWeight: '800', color: G.colors.success,
            display: 'flex', alignItems: 'center', gap: '5px',
            transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <CheckCircle2 size={11} />
            Marcar Publicado
          </button>
        )}
      </div>

      {/* Painel expandido — Copy + Roteiro */}
      {expandido && temRoteiro && (
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {cenas.map((cena: any, idx: number) => (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: '22px 75px 1fr 55px',
                gap: '8px', alignItems: 'center',
                padding: '5px 0',
                borderBottom: idx < cenas.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                  {cena.order}
                </span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: G.colors.secondary }}>
                  {String(cena.type ?? '').toUpperCase()}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>
                  {cena.description}
                </span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', textAlign: 'right' }}>
                  {cena.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// SEÇÃO (Prontos / Publicados)
// ─────────────────────────────────────────

function Secao({ cor, icone: Icone, label, vazia, items, onPublicar, recentPublished }: {
  cor: string;
  icone: any;
  label: string;
  vazia: string;
  items: ProductionItem[];
  onPublicar?: (id: string) => void;
  recentPublished: Set<string>;
}) {
  return (
    <div style={{
      background: `${cor}05`,
      border: `1px solid ${cor}22`,
      borderRadius: '16px',
      padding: '18px 20px',
    }}>
      {/* Header da seção */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Icone size={13} color={cor} />
        <span style={{ fontSize: '11px', fontWeight: '800', color: cor, letterSpacing: '1px' }}>
          {label}
        </span>
        <span style={{
          fontSize: '10px', fontWeight: '700',
          background: `${cor}18`, border: `1px solid ${cor}30`,
          color: cor, borderRadius: '20px', padding: '1px 8px',
        }}>
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '28px 0',
          fontSize: '12px', color: 'rgba(255,255,255,0.18)',
        }}>
          {vazia}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map(item => (
            <ClipeCard
              key={item.id}
              item={item}
              onPublicar={onPublicar}
              recentlyPublished={recentPublished.has(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// HEADER DO DIA
// ─────────────────────────────────────────

function HeaderDia({ concluidos, prontos, publicados, filtroLinha, setFiltroLinha, selectedDate, setSelectedDate }: {
  concluidos: ProductionItem[];
  prontos: number;
  publicados: number;
  filtroLinha: LineType | 'todos';
  setFiltroLinha: (v: LineType | 'todos') => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
}) {
  const todayKey  = getTodayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const byLine = (['L1', 'L2', 'L3'] as LineType[]).map(line => ({
    line,
    done:      concluidos.filter(i => i.line_type === line && i.status === 'done').length,
    published: concluidos.filter(i => i.line_type === line && i.status === 'published').length,
    color:     LINE_CONFIG[line].color,
  }));

  return (
    <GlassCard style={{ padding: '20px 24px', borderRadius: '20px' }}>

      {/* Linha 1: total + seletor de data */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{
            fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)',
            letterSpacing: '2px', marginBottom: '4px',
          }}>
            CLIPES GERADOS
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div style={{ fontSize: '26px', fontWeight: '800' }}>
              {prontos + publicados}
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: '400', marginLeft: '6px' }}>
                concluídos
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
              <span style={{ color: G.colors.warning, fontWeight: '700' }}>{prontos} prontos</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
              <span style={{ color: G.colors.success, fontWeight: '700' }}>{publicados} publicados</span>
            </div>
          </div>
        </div>

        {/* Seletor de data */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {[{ key: todayKey, label: 'Hoje' }, { key: yesterday, label: 'Ontem' }].map(opt => (
            <button key={opt.key} onClick={() => setSelectedDate(opt.key)} style={{
              background: selectedDate === opt.key ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedDate === opt.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '7px', padding: '5px 12px', cursor: 'pointer',
              fontSize: '11px', fontWeight: '700',
              color: selectedDate === opt.key ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
            }}>
              {opt.label}
            </button>
          ))}
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '7px', padding: '5px 8px',
              fontSize: '11px', color: 'rgba(255,255,255,0.45)',
              outline: 'none', cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* Divisória */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Breakdown L1 / L2 / L3 */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {byLine.map(({ line, done, published, color }) => (
              <div key={line} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '5px', flexShrink: 0,
                  background: `${color}18`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', fontWeight: '900', color,
                }}>
                  {line}
                </div>
                <div style={{ fontSize: '11px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ color: G.colors.warning, fontWeight: '700' }}>{done}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>pronto{done !== 1 ? 's' : ''}</span>
                  {published > 0 && (
                    <>
                      <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                      <span style={{ color: G.colors.success, fontWeight: '700' }}>{published}</span>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>pub.</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Filtro por linha */}
          <div style={{ display: 'flex', gap: '5px' }}>
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
        </div>
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────

export const ClipesGerados = () => {
  const todayKey = getTodayKey();

  const [selectedDate, setSelectedDate]       = useState(todayKey);
  const [items, setItems]                     = useState<ProductionItem[]>(() => loadItems(todayKey));
  const [filtroLinha, setFiltroLinha]         = useState<LineType | 'todos'>('todos');
  const [recentPublished, setRecentPublished] = useState<Set<string>>(new Set());
  const [donesOutrosDias, setDonesOutrosDias] = useState<{ date: string; count: number }[]>([]);

  // Recarrega itens do dia selecionado e computa 'done' de outros dias.
  // Migração Supabase: substituir scanAllDays por query WHERE date != selectedDate AND status = 'done'
  useEffect(() => {
    setItems(loadItems(selectedDate));
    const outros = scanAllDays(selectedDate);
    const dones = outros
      .map(({ date, items: its }) => ({ date, count: its.filter(i => i.status === 'done').length }))
      .filter(d => d.count > 0);
    setDonesOutrosDias(dones);
  }, [selectedDate]);

  // Derivações
  const concluidos = items.filter(i => isConcluido(i.status));
  const filtrados  = filtroLinha === 'todos'
    ? concluidos
    : concluidos.filter(i => i.line_type === filtroLinha);

  const prontos    = filtrados.filter(i => i.status === 'done');
  const publicados = filtrados
    .filter(i => i.status === 'published')
    .sort((a, b) => (b.published_at ?? b.created_at) > (a.published_at ?? a.created_at) ? 1 : -1);

  // Marcar publicado — única mutação desta página
  const marcarPublicado = (id: string) => {
    const now     = new Date().toISOString();
    const updated = items.map(i =>
      i.id === id ? { ...i, status: 'published' as ProductionStatus, published_at: now } : i
    );
    setItems(updated);
    saveItems(selectedDate, updated);

    // Feedback visual por 3 segundos
    setRecentPublished(prev => new Set([...prev, id]));
    setTimeout(() => {
      setRecentPublished(prev => { const n = new Set(prev); n.delete(id); return n; });
    }, 3000);
  };

  const totalDonesOutros = donesOutrosDias.reduce((s, d) => s + d.count, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <HeaderDia
        concluidos={concluidos}
        prontos={prontos.length}
        publicados={publicados.length}
        filtroLinha={filtroLinha}
        setFiltroLinha={setFiltroLinha}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {/* Indicador de clipes finalizados de outros dias */}
      {totalDonesOutros > 0 && (
        <div style={{
          background: `${G.colors.success}08`,
          border: `1px solid ${G.colors.success}22`,
          borderRadius: '10px', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12px', color: G.colors.success, fontWeight: '600',
        }}>
          <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
          <span>
            {totalDonesOutros} clipe{totalDonesOutros !== 1 ? 's' : ''} finalizado{totalDonesOutros !== 1 ? 's' : ''} de outros dias aguardando publicação
            {' — '}
            {donesOutrosDias.map(d => `${formatDayLabel(d.date)} (${d.count})`).join(' · ')}
          </span>
        </div>
      )}

      {/* Seção 1 — Prontos para publicar */}
      <Secao
        cor={G.colors.warning}
        icone={Clock}
        label="PRONTOS PARA PUBLICAR"
        vazia="Nenhum clipe aguardando publicação"
        items={prontos}
        onPublicar={marcarPublicado}
        recentPublished={recentPublished}
      />

      {/* Seção 2 — Publicados */}
      <Secao
        cor={G.colors.success}
        icone={CheckCircle2}
        label="PUBLICADOS"
        vazia="Nenhum clipe publicado ainda"
        items={publicados}
        recentPublished={recentPublished}
      />

    </div>
  );
};
