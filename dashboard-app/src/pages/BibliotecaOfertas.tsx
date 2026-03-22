import { useState, useMemo } from 'react';
import { Search, Plus, X, Copy, CheckCircle, Archive, Tag, Zap, ChevronDown } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';
import {
  type Oferta,
  type OfertaType,
  type OfertaStatus,
  type OfertaSource,
  OFERTA_TYPE_LABEL,
  OFERTA_TYPE_COLOR,
  OFERTA_STATUS_LABEL,
  OFERTA_STATUS_COLOR,
  BLOCK_KEYS,
  loadBlocks,
  saveBlocks,
  gerarId,
} from '../types/creative-blocks';

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────

const OFERTA_TYPES: OfertaType[] = [
  'bonus', 'cashback', 'pix', 'missoes', 'rodadas_gratis', 'torneio', 'suporte', 'saque',
];
const OFERTA_STATUSES: OfertaStatus[] = ['draft', 'validada', 'arquivada'];
const SOURCE_LABEL: Record<OfertaSource, string> = {
  manual:      'Manual',
  campanha:    'Campanha',
  radar:       'Radar',
  concorrente: 'Concorrente',
};

const FORM_VAZIO = (): Partial<Oferta> => ({
  offer_title: '',
  offer_text:  '',
  offer_type:  'bonus',
  status:      'draft',
  source:      'manual',
});

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: '700',
      color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', marginBottom: '6px',
    }}>
      {children}
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px',
          padding: '9px 12px', color: '#fff', fontSize: '13px',
          outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function FilterChip({ label, active, color, onClick }: {
  label: string; active: boolean; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '20px', padding: '4px 12px', cursor: 'pointer',
      fontSize: '11px', fontWeight: active ? '700' : '500',
      color: active ? color : 'rgba(255,255,255,0.4)',
      transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  );
}

function MenuOption({ icon: Icon, label, color, onClick }: {
  icon: any; label: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '7px 10px', borderRadius: '6px', textAlign: 'left',
        fontSize: '12px', fontWeight: '600', color,
        display: 'flex', alignItems: 'center', gap: '8px',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <Icon size={12} /> {label}
    </button>
  );
}

// ─────────────────────────────────────────
// CARD DE OFERTA
// ─────────────────────────────────────────

function OfertaCard({ oferta, onCopiar, onValidar, onArquivar, onRemover, onUsarNaSessao }: {
  oferta: Oferta;
  onCopiar: () => void;
  onValidar: () => void;
  onArquivar: () => void;
  onRemover: () => void;
  onUsarNaSessao: () => void;
}) {
  const [copiado, setCopiado]       = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const typeColor   = OFERTA_TYPE_COLOR[oferta.offer_type];
  const statusColor = OFERTA_STATUS_COLOR[oferta.status];
  const arquivada   = oferta.status === 'arquivada';

  const copiar = () => {
    navigator.clipboard.writeText(oferta.offer_text);
    setCopiado(true);
    onCopiar();
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{
      background: arquivada ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${oferta.status === 'validada' ? `${G.colors.success}25` : 'rgba(255,255,255,0.07)'}`,
      borderLeft: `3px solid ${typeColor}`,
      borderRadius: '10px', padding: '14px 16px',
      opacity: arquivada ? 0.5 : 1, transition: 'all 0.2s',
    }}>

      {/* Metadados */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <Badge label={OFERTA_TYPE_LABEL[oferta.offer_type]} color={typeColor} />
        <Badge label={OFERTA_STATUS_LABEL[oferta.status]} color={statusColor} />
        <span style={{
          fontSize: '10px', color: 'rgba(255,255,255,0.2)',
          fontWeight: '600', letterSpacing: '0.5px',
        }}>
          {SOURCE_LABEL[oferta.source]}
        </span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {new Date(oferta.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      {/* Título */}
      <div style={{
        fontSize: '14px', fontWeight: '700', marginBottom: '6px',
        color: arquivada ? 'rgba(255,255,255,0.35)' : '#fff',
      }}>
        {oferta.offer_title}
      </div>

      {/* Texto */}
      {oferta.offer_text && (
        <p style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.5)',
          margin: '0 0 14px 0', lineHeight: '1.5',
        }}>
          {oferta.offer_text}
        </p>
      )}

      {!oferta.offer_text && <div style={{ marginBottom: '14px' }} />}

      {/* Ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={copiar} style={{
          background: copiado ? `${G.colors.success}18` : 'rgba(255,255,255,0.06)',
          border: `1px solid ${copiado ? `${G.colors.success}30` : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '7px', padding: '6px 12px', cursor: 'pointer',
          fontSize: '11px', fontWeight: '700',
          color: copiado ? G.colors.success : 'rgba(255,255,255,0.6)',
          display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s',
        }}>
          <Copy size={11} /> {copiado ? 'Copiado!' : 'Copiar'}
        </button>

        {!arquivada && (
          <button onClick={onUsarNaSessao} style={{
            background: `${G.colors.warning}15`, border: `1px solid ${G.colors.warning}30`,
            borderRadius: '7px', padding: '6px 12px', cursor: 'pointer',
            fontSize: '11px', fontWeight: '700', color: G.colors.warning,
            display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s',
          }}>
            <Zap size={11} /> Usar na Sessão
          </button>
        )}

        {oferta.status === 'draft' && (
          <button onClick={onValidar} style={{
            background: `${G.colors.success}15`, border: `1px solid ${G.colors.success}30`,
            borderRadius: '7px', padding: '6px 12px', cursor: 'pointer',
            fontSize: '11px', fontWeight: '700', color: G.colors.success,
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <CheckCircle size={11} /> Validar
          </button>
        )}

        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button onClick={() => setMenuAberto(v => !v)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.25)', padding: '4px 6px', display: 'flex',
          }}>
            <ChevronDown size={13} />
          </button>
          {menuAberto && (
            <div
              style={{
                position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px', padding: '4px', minWidth: '155px', zIndex: 10,
              }}
              onMouseLeave={() => setMenuAberto(false)}
            >
              {oferta.status !== 'arquivada' && (
                <MenuOption icon={Archive} label="Arquivar" color="rgba(255,255,255,0.4)"
                  onClick={() => { onArquivar(); setMenuAberto(false); }} />
              )}
              {oferta.status === 'validada' && (
                <MenuOption icon={CheckCircle} label="Voltar para Draft" color={G.colors.warning}
                  onClick={() => { onValidar(); setMenuAberto(false); }} />
              )}
              <MenuOption icon={X} label="Remover" color={G.colors.danger}
                onClick={() => { onRemover(); setMenuAberto(false); }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// FORMULÁRIO DE ADIÇÃO
// ─────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
  padding: '9px 12px', color: '#fff', fontSize: '13px',
  outline: 'none', cursor: 'pointer',
};

function FormNovaOferta({ onSalvar, onFechar }: {
  onSalvar: (o: Oferta) => void; onFechar: () => void;
}) {
  const [form, setForm] = useState<Partial<Oferta>>(FORM_VAZIO());
  const set = (k: keyof Oferta) => (v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const submeter = () => {
    if (!form.offer_title?.trim()) return;
    onSalvar({
      id:          gerarId(),
      offer_title: form.offer_title!.trim(),
      offer_text:  form.offer_text?.trim() || '',
      offer_type:  form.offer_type! as OfertaType,
      status:      form.status! as OfertaStatus,
      source:      'manual',
      created_at:  new Date().toISOString(),
    });
    setForm(FORM_VAZIO());
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '12px', padding: '18px',
    }}>
      <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '16px', color: G.colors.warning }}>
        + Nova Oferta
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Título */}
        <FieldInput
          label="TÍTULO *"
          value={form.offer_title || ''}
          onChange={set('offer_title')}
          placeholder="Ex: Bônus de boas-vindas, Cashback semanal..."
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Tipo */}
          <div>
            <Label>TIPO</Label>
            <select value={form.offer_type || 'bonus'} onChange={e => set('offer_type')(e.target.value)}
              style={selectStyle}>
              {OFERTA_TYPES.map(t => (
                <option key={t} value={t} style={{ background: '#1c1c1e' }}>
                  {OFERTA_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Status inicial */}
          <div>
            <Label>STATUS INICIAL</Label>
            <select value={form.status || 'draft'} onChange={e => set('status')(e.target.value)}
              style={selectStyle}>
              {OFERTA_STATUSES.map(s => (
                <option key={s} value={s} style={{ background: '#1c1c1e' }}>
                  {OFERTA_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Texto da oferta */}
        <div>
          <Label>TEXTO DA OFERTA</Label>
          <textarea
            value={form.offer_text || ''}
            onChange={e => set('offer_text')(e.target.value)}
            placeholder="Ex: 200% no primeiro depósito via PIX, mínimo R$20"
            rows={2}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px',
              padding: '10px 12px', color: '#fff', fontSize: '13px',
              outline: 'none', resize: 'none', boxSizing: 'border-box',
              lineHeight: '1.6', fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onFechar} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
            fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.5)',
          }}>
            Cancelar
          </button>
          <button onClick={submeter} disabled={!form.offer_title?.trim()} style={{
            background: form.offer_title?.trim() ? G.colors.warning : 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: '8px', padding: '8px 20px',
            cursor: form.offer_title?.trim() ? 'pointer' : 'not-allowed',
            fontSize: '12px', fontWeight: '700',
            color: form.offer_title?.trim() ? '#000' : 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
          }}>
            <Plus size={13} /> Salvar Oferta
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────

export const BibliotecaOfertas = () => {
  const [ofertas, setOfertas]           = useState<Oferta[]>(() => loadBlocks<Oferta>(BLOCK_KEYS.ofertas));
  const [busca, setBusca]               = useState('');
  const [filtroTipo, setFiltroTipo]     = useState<OfertaType | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<OfertaStatus | 'todos'>('todos');
  const [filtroSource, setFiltroSource] = useState<OfertaSource | 'todos'>('todos');
  const [formAberto, setFormAberto]     = useState(false);
  const [usadaNaSessao, setUsadaNaSessao] = useState<string | null>(null);

  const persistir = (lista: Oferta[]) => {
    setOfertas(lista);
    saveBlocks(BLOCK_KEYS.ofertas, lista);
  };

  const adicionarOferta = (o: Oferta) => {
    persistir([o, ...ofertas]);
    setFormAberto(false);
  };

  const atualizarStatus = (id: string, status: OfertaStatus) => {
    persistir(ofertas.map(o => o.id === id ? { ...o, status } : o));
  };

  const removerOferta = (id: string) => {
    persistir(ofertas.filter(o => o.id !== id));
  };

  const usarNaSessao = (oferta: Oferta) => {
    localStorage.setItem(BLOCK_KEYS.offer_selected, JSON.stringify(oferta));
    setUsadaNaSessao(oferta.id);
    setTimeout(() => setUsadaNaSessao(null), 2500);
  };

  const ofertasFiltradas = useMemo(() => {
    return ofertas.filter(o => {
      const matchBusca  = !busca || [o.offer_title, o.offer_text].join(' ').toLowerCase().includes(busca.toLowerCase());
      const matchTipo   = filtroTipo   === 'todos' || o.offer_type === filtroTipo;
      const matchStatus = filtroStatus === 'todos' || o.status     === filtroStatus;
      const matchSource = filtroSource === 'todos' || o.source     === filtroSource;
      return matchBusca && matchTipo && matchStatus && matchSource;
    });
  }, [ofertas, busca, filtroTipo, filtroStatus, filtroSource]);

  const total     = ofertas.length;
  const validadas = ofertas.filter(o => o.status === 'validada').length;
  const drafts    = ofertas.filter(o => o.status === 'draft').length;
  const arquivadas = ofertas.filter(o => o.status === 'arquivada').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {[
          { label: 'Total',      valor: total,      cor: G.colors.warning },
          { label: 'Validadas',  valor: validadas,  cor: G.colors.success },
          { label: 'Rascunhos',  valor: drafts,     cor: 'rgba(255,255,255,0.4)' },
          { label: 'Arquivadas', valor: arquivadas, cor: 'rgba(255,255,255,0.2)' },
        ].map(s => (
          <GlassCard key={s.label} style={{ padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '900', color: s.cor, marginBottom: '4px' }}>{s.valor}</div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Busca + Filtros + Botão */}
      <GlassCard style={{ padding: '18px 20px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)',
            }} />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar ofertas..."
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px',
                padding: '9px 12px 9px 36px', color: '#fff', fontSize: '13px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {busca && (
              <button onClick={() => setBusca('')} style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', display: 'flex',
              }}>
                <X size={13} />
              </button>
            )}
          </div>
          <button onClick={() => setFormAberto(v => !v)} style={{
            background: formAberto ? 'rgba(255,255,255,0.08)' : G.colors.warning,
            border: 'none', borderRadius: '8px', padding: '9px 16px',
            cursor: 'pointer', fontSize: '12px', fontWeight: '700',
            color: formAberto ? 'rgba(255,255,255,0.5)' : '#000',
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
          }}>
            {formAberto ? <><X size={13} /> Fechar</> : <><Plus size={13} /> Nova Oferta</>}
          </button>
        </div>

        {/* Filtros por tipo */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '8px' }}>
            TIPO
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <FilterChip label="Todos" active={filtroTipo === 'todos'} color={G.colors.warning} onClick={() => setFiltroTipo('todos')} />
            {OFERTA_TYPES.map(t => (
              <FilterChip key={t} label={OFERTA_TYPE_LABEL[t]} active={filtroTipo === t}
                color={OFERTA_TYPE_COLOR[t]} onClick={() => setFiltroTipo(t)} />
            ))}
          </div>
        </div>

        {/* Filtros por status */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '8px' }}>
            STATUS
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <FilterChip label="Todos" active={filtroStatus === 'todos'} color="rgba(255,255,255,0.5)" onClick={() => setFiltroStatus('todos')} />
            {OFERTA_STATUSES.map(s => (
              <FilterChip key={s} label={OFERTA_STATUS_LABEL[s]} active={filtroStatus === s}
                color={OFERTA_STATUS_COLOR[s]} onClick={() => setFiltroStatus(s)} />
            ))}
          </div>
        </div>

        {/* Filtros por origem */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '8px' }}>
            ORIGEM
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <FilterChip label="Todos" active={filtroSource === 'todos'} color="rgba(255,255,255,0.5)" onClick={() => setFiltroSource('todos')} />
            <FilterChip label="Manual" active={filtroSource === 'manual'} color="rgba(255,255,255,0.5)" onClick={() => setFiltroSource('manual')} />
            <FilterChip label="Radar" active={filtroSource === 'radar'} color={G.colors.warning} onClick={() => setFiltroSource('radar')} />
            <FilterChip label="Concorrente" active={filtroSource === 'concorrente'} color={G.colors.success} onClick={() => setFiltroSource('concorrente')} />
            <FilterChip label="Campanha" active={filtroSource === 'campanha'} color={G.colors.primary} onClick={() => setFiltroSource('campanha')} />
          </div>
        </div>
      </GlassCard>

      {/* Formulário */}
      {formAberto && (
        <FormNovaOferta onSalvar={adicionarOferta} onFechar={() => setFormAberto(false)} />
      )}

      {/* Notificação sessão */}
      {usadaNaSessao && (
        <div style={{
          background: `${G.colors.warning}15`, border: `1px solid ${G.colors.warning}30`,
          borderRadius: '10px', padding: '12px 16px',
          fontSize: '13px', fontWeight: '600', color: G.colors.warning,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Zap size={14} /> Oferta enviada para a sessão — disponível em Copy & Roteiro e Produção
        </div>
      )}

      {/* Lista */}
      <GlassCard style={{ padding: '20px 24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={15} color={G.colors.warning} />
            <span style={{ fontWeight: '700', fontSize: '13px' }}>
              {ofertasFiltradas.length} oferta{ofertasFiltradas.length !== 1 ? 's' : ''}
              {(filtroTipo !== 'todos' || filtroStatus !== 'todos' || filtroSource !== 'todos' || busca) && (
                <span style={{ fontWeight: '400', color: 'rgba(255,255,255,0.4)' }}> filtradas</span>
              )}
            </span>
          </div>
          {(filtroTipo !== 'todos' || filtroStatus !== 'todos' || filtroSource !== 'todos' || busca) && (
            <button
              onClick={() => { setBusca(''); setFiltroTipo('todos'); setFiltroStatus('todos'); setFiltroSource('todos'); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px',
                color: 'rgba(255,255,255,0.35)', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <X size={11} /> Limpar filtros
            </button>
          )}
        </div>

        {ofertas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎁</div>
            Nenhuma oferta ainda — clique em "Nova Oferta" para começar
          </div>
        )}

        {ofertas.length > 0 && ofertasFiltradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
            Nenhuma oferta encontrada com os filtros aplicados
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ofertasFiltradas.map(oferta => (
            <OfertaCard
              key={oferta.id}
              oferta={oferta}
              onCopiar={() => {}}
              onValidar={() => atualizarStatus(oferta.id, oferta.status === 'validada' ? 'draft' : 'validada')}
              onArquivar={() => atualizarStatus(oferta.id, 'arquivada')}
              onRemover={() => removerOferta(oferta.id)}
              onUsarNaSessao={() => usarNaSessao(oferta)}
            />
          ))}
        </div>
      </GlassCard>

    </div>
  );
};
