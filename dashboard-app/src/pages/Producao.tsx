import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp, ArrowRight, Clock } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';
import {
  type ProductionItem,
  type LineType,
  type ProductionStatus,
  LINE_CONFIG,
  STATUS_DISPLAY,
  isConcluido,
  proximoStatus,
  scanAllDays,
  getTodayKey,
  gerarId,
  loadItems,
  saveItems,
} from '../types/production';

// --- FORMULÁRIO VAZIO POR LINHA ---

function formVazio(line: LineType): Partial<ProductionItem> {
  const base = { line_type: line, title: '', hook: '', offer: '', notes: '' };
  if (line === 'L1') return { ...base, house_name: '' };
  if (line === 'L2') return { ...base, timestamp_start: '', timestamp_end: '' };
  if (line === 'L3') return { ...base, prompt_text: '', variations: 4 };
  return base;
}

// --- SUBCOMPONENTE: CARD DE ITEM ---

function ItemCard({
  item,
  onAvancar,
  onRemover,
}: {
  item: ProductionItem;
  onAvancar: (id: string) => void;
  onRemover: (id: string) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const cfg = STATUS_DISPLAY[item.status];
  const lineCfg = LINE_CONFIG[item.line_type];
  const concluido = isConcluido(item.status);
  const proximo = proximoStatus(item.status, item.line_type);
  const proximoCfg = STATUS_DISPLAY[proximo];

  const temExtras = item.hook || item.offer || item.notes ||
    item.house_name || item.timestamp_start || item.prompt_text;

  return (
    <div style={{
      background: concluido ? `${lineCfg.color}08` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${concluido ? `${lineCfg.color}25` : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '10px',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Linha principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}>
        {/* Título */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '13px', fontWeight: '600',
            color: concluido ? 'rgba(255,255,255,0.45)' : '#fff',
            textDecoration: concluido ? 'line-through' : 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.title}
          </div>
          {item.house_name && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
              {item.house_name}
            </div>
          )}
          {(item.timestamp_start || item.timestamp_end) && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>
              {item.timestamp_start && `Início: ${item.timestamp_start}`}
              {item.timestamp_start && item.timestamp_end && ' → '}
              {item.timestamp_end && `Fim: ${item.timestamp_end}`}
            </div>
          )}
        </div>

        {/* Badge status atual */}
        <Badge label={cfg.label} color={cfg.color} />

        {/* Botão avançar */}
        {!concluido && (
          <button
            onClick={() => onAvancar(item.id)}
            title={`Avançar para ${proximoCfg.label}`}
            style={{
              background: `${proximoCfg.color}18`,
              border: `1px solid ${proximoCfg.color}30`,
              borderRadius: '6px', padding: '5px 10px',
              cursor: 'pointer', fontSize: '11px', fontWeight: '700',
              color: proximoCfg.color,
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            {proximoCfg.label} <ArrowRight size={10} />
          </button>
        )}

        {/* Expandir notas */}
        {temExtras && (
          <button
            onClick={() => setExpandido(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', padding: '4px', display: 'flex' }}
          >
            {expandido ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}

        {/* Remover */}
        <button
          onClick={() => onRemover(item.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.15)', padding: '4px', display: 'flex' }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Detalhes expandidos */}
      {expandido && (
        <div style={{
          padding: '0 14px 12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: '10px',
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          {item.hook && <Detail label="Hook" value={item.hook} />}
          {item.offer && <Detail label="Oferta" value={item.offer} />}
          {item.prompt_text && <Detail label="Prompt" value={item.prompt_text} />}
          {item.variations !== undefined && <Detail label="Variações" value={String(item.variations)} />}
          {item.notes && <Detail label="Notas" value={item.notes} />}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
      <span style={{ color: 'rgba(255,255,255,0.35)', minWidth: '52px', fontWeight: '700' }}>{label}:</span>
      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{value}</span>
    </div>
  );
}

// --- SUBCOMPONENTE: SEÇÃO DE LINHA ---

function LinhaSection({
  line,
  items,
  onAdd,
  onAvancar,
  onRemover,
}: {
  line: LineType;
  items: ProductionItem[];
  onAdd: (item: ProductionItem) => void;
  onAvancar: (id: string) => void;
  onRemover: (id: string) => void;
}) {
  const cfg = LINE_CONFIG[line];
  const concluidos = items.filter(i => isConcluido(i.status)).length;
  const progresso = Math.min(Math.round((concluidos / cfg.meta) * 100), 100);
  const metaBatida = concluidos >= cfg.meta;

  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<Partial<ProductionItem>>(formVazio(line));

  const setField = (key: keyof ProductionItem, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const submeter = () => {
    if (!form.title?.trim()) return;
    const novo: ProductionItem = {
      id: gerarId(),
      line_type: line,
      title: form.title!.trim(),
      status: 'pending' as ProductionStatus,
      hook: form.hook?.trim() || '',
      offer: form.offer?.trim() || '',
      notes: form.notes?.trim() || '',
      created_at: new Date().toISOString(),
      ...(line === 'L1' && { house_name: (form as any).house_name?.trim() || '' }),
      ...(line === 'L2' && {
        timestamp_start: (form as any).timestamp_start?.trim() || '',
        timestamp_end: (form as any).timestamp_end?.trim() || '',
      }),
      ...(line === 'L3' && {
        prompt_text: (form as any).prompt_text?.trim() || '',
        variations: (form as any).variations ?? 4,
      }),
    };
    onAdd(novo);
    setForm(formVazio(line));
    setFormAberto(false);
  };

  return (
    <GlassCard style={{ padding: '20px', borderRadius: '16px' }}>
      {/* Header da linha */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: `${cfg.color}18`, border: `1px solid ${cfg.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '900', color: cfg.color,
          }}>
            {line}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px' }}>{cfg.label}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>{cfg.description}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {metaBatida && <Badge label="META ✓" color={cfg.color} />}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: '900', color: metaBatida ? cfg.color : 'rgba(255,255,255,0.7)' }}>
              {concluidos}<span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: '400' }}>/{cfg.meta}</span>
            </div>
          </div>
          <button
            onClick={() => setFormAberto(v => !v)}
            style={{
              background: formAberto ? 'rgba(255,255,255,0.06)' : `${cfg.color}22`,
              border: `1px solid ${formAberto ? 'rgba(255,255,255,0.1)' : `${cfg.color}40`}`,
              borderRadius: '7px', padding: '6px 12px', cursor: 'pointer',
              fontSize: '11px', fontWeight: '700', color: formAberto ? 'rgba(255,255,255,0.5)' : cfg.color,
              display: 'flex', alignItems: 'center', gap: '5px',
            }}
          >
            {formAberto ? <><X size={11} /> Fechar</> : <><Plus size={11} /> Adicionar</>}
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '4px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{
          width: `${progresso}%`, height: '100%', borderRadius: '4px',
          background: cfg.color, transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Formulário de adição */}
      {formAberto && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px', padding: '14px', marginBottom: '14px',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          {/* Título — sempre presente */}
          <Field label="TÍTULO *" value={form.title || ''} onChange={v => setField('title', v)} placeholder={
            line === 'L1' ? 'Ex: Ellen — Fortune Mouse — Mega Win' :
            line === 'L2' ? 'Ex: Grande win 3x — corte rápido' :
            'Ex: Criativo IA — bônus de boas-vindas'
          } />

          {/* Campos extras por linha */}
          {line === 'L1' && (
            <Field label="CASA" value={(form as any).house_name || ''} onChange={v => setField('house_name' as any, v)} placeholder="Ex: reals.bet" />
          )}
          {line === 'L2' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Field label="TIMESTAMP INÍCIO" value={(form as any).timestamp_start || ''} onChange={v => setField('timestamp_start' as any, v)} placeholder="00:42:15" />
              <Field label="TIMESTAMP FIM" value={(form as any).timestamp_end || ''} onChange={v => setField('timestamp_end' as any, v)} placeholder="00:43:00" />
            </div>
          )}
          {line === 'L3' && (
            <>
              <Field label="PROMPT" value={(form as any).prompt_text || ''} onChange={v => setField('prompt_text' as any, v)} placeholder="Ex: Streamer comemorando vitória, neon, câmera lenta..." />
              <Field label="VARIAÇÕES" value={String((form as any).variations ?? 4)} onChange={v => setField('variations' as any, parseInt(v) || 4)} placeholder="4" />
            </>
          )}

          {/* Campos base opcionais */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label="HOOK" value={form.hook || ''} onChange={v => setField('hook', v)} placeholder="Ex: Você não vai acreditar..." />
            <Field label="OFERTA" value={form.offer || ''} onChange={v => setField('offer', v)} placeholder="Ex: 200% no primeiro depósito" />
          </div>
          <Field label="NOTAS" value={form.notes || ''} onChange={v => setField('notes', v)} placeholder="Observações de edição, referências..." />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={submeter}
              disabled={!form.title?.trim()}
              style={{
                background: form.title?.trim() ? cfg.color : 'rgba(255,255,255,0.08)',
                border: 'none', borderRadius: '7px', padding: '8px 16px',
                cursor: form.title?.trim() ? 'pointer' : 'not-allowed',
                fontSize: '12px', fontWeight: '700', color: '#fff',
                display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'background 0.2s',
              }}
            >
              <Plus size={13} /> Adicionar à {line}
            </button>
          </div>
        </div>
      )}

      {/* Lista de itens */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.18)', fontSize: '12px' }}>
          Nenhum item — clique em "Adicionar" para começar
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map(item => (
            <ItemCard key={item.id} item={item} onAvancar={onAvancar} onRemover={onRemover} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', marginBottom: '5px' }}>{label}</div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: '7px',
          padding: '8px 11px', color: '#fff', fontSize: '12px', outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

// --- HELPER: data legível ---
function formatDayLabel(dateKey: string): string {
  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateKey === today)     return 'Hoje';
  if (dateKey === yesterday) return 'Ontem';
  return new Date(dateKey + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// --- PÁGINA PRINCIPAL ---

export const Producao = () => {
  const todayKey = getTodayKey();
  const [items, setItems] = useState<ProductionItem[]>(() => loadItems(todayKey));

  useEffect(() => {
    saveItems(todayKey, items);
  }, [items, todayKey]);

  // Itens em andamento de dias anteriores — informativo, computa uma vez no mount.
  // Migração Supabase: substituir por query WHERE date < today AND status NOT IN ('done','published')
  const [itensAbertos, setItensAbertos] = useState<{ date: string; count: number }[]>([]);
  useEffect(() => {
    const outros = scanAllDays(todayKey);
    const abertos = outros
      .map(({ date, items: its }) => ({ date, count: its.filter(i => !isConcluido(i.status)).length }))
      .filter(d => d.count > 0);
    setItensAbertos(abertos);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = (item: ProductionItem) => setItems(prev => [item, ...prev]);

  const avancarStatus = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, status: proximoStatus(i.status, i.line_type) } : i
    ));
  };

  const removerItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const totalAbertos = itensAbertos.reduce((s, d) => s + d.count, 0);

  // Totais do dia
  const totalMeta = 3 + 10 + 4; // 17
  const totalConcluidos = items.filter(i => isConcluido(i.status)).length;
  const progGeral = Math.min(Math.round((totalConcluidos / totalMeta) * 100), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Resumo do dia */}
      <GlassCard style={{ padding: '20px 24px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '3px' }}>
              PRODUÇÃO DO DIA
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800' }}>
              {totalConcluidos} <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>/ {totalMeta} itens concluídos</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {(['L1', 'L2', 'L3'] as LineType[]).map(line => {
              const cfg = LINE_CONFIG[line];
              const done = items.filter(i => i.line_type === line && isConcluido(i.status)).length;
              return (
                <div key={line} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: done >= cfg.meta ? cfg.color : 'rgba(255,255,255,0.5)' }}>
                    {done}/{cfg.meta}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: '700' }}>{line}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '5px', overflow: 'hidden' }}>
          <div style={{
            width: `${progGeral}%`, height: '100%', borderRadius: '6px',
            background: progGeral === 100 ? G.colors.success : `linear-gradient(90deg, #0A84FF, #BF5AF2, #FF2D55)`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </GlassCard>

      {/* Indicador de itens em aberto de dias anteriores */}
      {totalAbertos > 0 && (
        <div style={{
          background: `${G.colors.warning}08`,
          border: `1px solid ${G.colors.warning}22`,
          borderRadius: '10px', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12px', color: G.colors.warning, fontWeight: '600',
        }}>
          <Clock size={13} style={{ flexShrink: 0 }} />
          <span>
            {totalAbertos} item{totalAbertos !== 1 ? 's' : ''} em aberto de dias anteriores
            {' — '}
            {itensAbertos.map(d => `${formatDayLabel(d.date)} (${d.count})`).join(' · ')}
          </span>
        </div>
      )}

      {/* Linhas de produção */}
      {(['L1', 'L2', 'L3'] as LineType[]).map(line => (
        <LinhaSection
          key={line}
          line={line}
          items={items.filter(i => i.line_type === line)}
          onAdd={addItem}
          onAvancar={avancarStatus}
          onRemover={removerItem}
        />
      ))}

    </div>
  );
};
