import { useState, useMemo } from 'react';
import { Search, Plus, X, Copy, CheckCircle, Archive, Package, Zap, ChevronDown } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';
import {
  type Template,
  type TemplateType,
  type TemplateLineType,
  type TemplateStatus,
  type TemplateSource,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_TYPE_COLOR,
  TEMPLATE_LINE_LABEL,
  TEMPLATE_LINE_COLOR,
  TEMPLATE_STATUS_LABEL,
  TEMPLATE_STATUS_COLOR,
  TEMPLATE_SOURCE_LABEL,
  BLOCK_KEYS,
  loadBlocks,
  saveBlocks,
  gerarId,
} from '../types/creative-blocks';

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────

const TEMPLATE_TYPES: TemplateType[] = [
  'gameplay_reacao', 'prova_social', 'tutorial_curto', 'pov_resultado', 'storytelling',
];
const TEMPLATE_LINES: TemplateLineType[] = ['L1', 'L2', 'L3', 'all'];
const TEMPLATE_STATUSES: TemplateStatus[] = ['draft', 'active', 'archived'];

const FORM_VAZIO = (): Partial<Template> => ({
  title:         '',
  template_type: 'gameplay_reacao',
  line_type:     'L1',
  structure:     '',
  notes:         '',
  status:        'draft',
  source:        'manual',
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
// CARD DE TEMPLATE
// ─────────────────────────────────────────

function TemplateCard({ template, onCopiar, onAtivar, onArquivar, onRemover, onUsarNaSessao }: {
  template: Template;
  onCopiar: () => void;
  onAtivar: () => void;
  onArquivar: () => void;
  onRemover: () => void;
  onUsarNaSessao: () => void;
}) {
  const [copiado, setCopiado]       = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const typeColor   = TEMPLATE_TYPE_COLOR[template.template_type];
  const lineColor   = TEMPLATE_LINE_COLOR[template.line_type];
  const statusColor = TEMPLATE_STATUS_COLOR[template.status];
  const arquivado   = template.status === 'archived';

  const copiar = () => {
    navigator.clipboard.writeText(template.structure);
    setCopiado(true);
    onCopiar();
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{
      background: arquivado ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${template.status === 'active' ? `${G.colors.success}25` : 'rgba(255,255,255,0.07)'}`,
      borderLeft: `3px solid ${typeColor}`,
      borderRadius: '10px', padding: '14px 16px',
      opacity: arquivado ? 0.5 : 1, transition: 'all 0.2s',
    }}>

      {/* Metadados — leitura operacional rápida */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>

        {/* Linha de produção — destaque visual máximo */}
        <span style={{
          fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px',
          color: lineColor,
          background: `${lineColor}18`,
          border: `1px solid ${lineColor}35`,
          borderRadius: '20px', padding: '2px 9px',
        }}>
          {TEMPLATE_LINE_LABEL[template.line_type]}
        </span>

        {/* Tipo estrutural */}
        <Badge label={TEMPLATE_TYPE_LABEL[template.template_type]} color={typeColor} />

        {/* Status */}
        <Badge label={TEMPLATE_STATUS_LABEL[template.status]} color={statusColor} />

        {/* Origem */}
        <span style={{
          fontSize: '10px', color: 'rgba(255,255,255,0.2)',
          fontWeight: '600', letterSpacing: '0.5px',
        }}>
          {TEMPLATE_SOURCE_LABEL[template.source]}
        </span>

        {/* Data */}
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {new Date(template.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      {/* Título */}
      <div style={{
        fontSize: '14px', fontWeight: '700', marginBottom: '8px',
        color: arquivado ? 'rgba(255,255,255,0.35)' : '#fff',
      }}>
        {template.title}
      </div>

      {/* Estrutura narrativa */}
      {template.structure && (
        <div style={{
          fontSize: '12px', color: arquivado ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.65)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '7px', padding: '8px 12px',
          marginBottom: template.notes ? '6px' : '14px',
          lineHeight: '1.6', fontFamily: 'inherit',
        }}>
          {template.structure}
        </div>
      )}

      {/* Notas de edição */}
      {template.notes && (
        <p style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.3)',
          margin: '0 0 14px 0', lineHeight: '1.5',
          fontStyle: 'italic',
        }}>
          {template.notes}
        </p>
      )}

      {!template.structure && !template.notes && <div style={{ marginBottom: '14px' }} />}

      {/* Ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

        {/* Copiar estrutura */}
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

        {/* Usar na sessão → próximo passo: Copy & Roteiro */}
        {!arquivado && (
          <button onClick={onUsarNaSessao} style={{
            background: `${G.colors.secondary}15`, border: `1px solid ${G.colors.secondary}30`,
            borderRadius: '7px', padding: '6px 12px', cursor: 'pointer',
            fontSize: '11px', fontWeight: '700', color: G.colors.secondary,
            display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s',
          }}>
            <Zap size={11} /> Usar
          </button>
        )}

        {/* Ativar (se draft) */}
        {template.status === 'draft' && (
          <button onClick={onAtivar} style={{
            background: `${G.colors.success}15`, border: `1px solid ${G.colors.success}30`,
            borderRadius: '7px', padding: '6px 12px', cursor: 'pointer',
            fontSize: '11px', fontWeight: '700', color: G.colors.success,
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <CheckCircle size={11} /> Ativar
          </button>
        )}

        {/* Menu overflow */}
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
                borderRadius: '8px', padding: '4px', minWidth: '160px', zIndex: 10,
              }}
              onMouseLeave={() => setMenuAberto(false)}
            >
              {template.status !== 'archived' && (
                <MenuOption icon={Archive} label="Arquivar" color="rgba(255,255,255,0.4)"
                  onClick={() => { onArquivar(); setMenuAberto(false); }} />
              )}
              {template.status === 'active' && (
                <MenuOption icon={CheckCircle} label="Voltar para Draft" color={G.colors.warning}
                  onClick={() => { onAtivar(); setMenuAberto(false); }} />
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

function FormNovoTemplate({ onSalvar, onFechar }: {
  onSalvar: (t: Template) => void; onFechar: () => void;
}) {
  const [form, setForm] = useState<Partial<Template>>(FORM_VAZIO());
  const set = (k: keyof Template) => (v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const submeter = () => {
    if (!form.title?.trim()) return;
    onSalvar({
      id:            gerarId(),
      title:         form.title!.trim(),
      template_type: form.template_type! as TemplateType,
      line_type:     form.line_type!     as TemplateLineType,
      structure:     form.structure?.trim() || '',
      notes:         form.notes?.trim()     || '',
      status:        form.status!        as TemplateStatus,
      source:        'manual'            as TemplateSource,
      created_at:    new Date().toISOString(),
    });
    setForm(FORM_VAZIO());
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '12px', padding: '18px',
    }}>
      <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '16px', color: G.colors.secondary }}>
        + Novo Template
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Título */}
        <div>
          <Label>TÍTULO *</Label>
          <input
            value={form.title || ''}
            onChange={e => set('title')(e.target.value)}
            placeholder="Ex: Reels Bônus Hook Direto, Corte Reação + CTA..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px',
              padding: '9px 12px', color: '#fff', fontSize: '13px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Tipo + Linha */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <Label>TIPO ESTRUTURAL</Label>
            <select value={form.template_type || 'gameplay_reacao'}
              onChange={e => set('template_type')(e.target.value)} style={selectStyle}>
              {TEMPLATE_TYPES.map(t => (
                <option key={t} value={t} style={{ background: '#1c1c1e' }}>
                  {TEMPLATE_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>LINHA DE PRODUÇÃO</Label>
            <select value={form.line_type || 'L1'}
              onChange={e => set('line_type')(e.target.value)} style={selectStyle}>
              {TEMPLATE_LINES.map(l => (
                <option key={l} value={l} style={{ background: '#1c1c1e' }}>
                  {TEMPLATE_LINE_LABEL[l]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status inicial */}
        <div style={{ maxWidth: '220px' }}>
          <Label>STATUS INICIAL</Label>
          <select value={form.status || 'draft'}
            onChange={e => set('status')(e.target.value)} style={selectStyle}>
            {TEMPLATE_STATUSES.map(s => (
              <option key={s} value={s} style={{ background: '#1c1c1e' }}>
                {TEMPLATE_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Estrutura narrativa */}
        <div>
          <Label>ESTRUTURA (sequência de cenas)</Label>
          <textarea
            value={form.structure || ''}
            onChange={e => set('structure')(e.target.value)}
            placeholder="Ex: Hook (3s) → Prova social (5s) → Oferta (4s) → CTA (3s)"
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

        {/* Notas de edição */}
        <div>
          <Label>NOTAS DE EDIÇÃO</Label>
          <textarea
            value={form.notes || ''}
            onChange={e => set('notes')(e.target.value)}
            placeholder="Ex: SFX em cada corte, zoom no saldo, texto some rápido..."
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
          <button onClick={submeter} disabled={!form.title?.trim()} style={{
            background: form.title?.trim() ? G.colors.secondary : 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: '8px', padding: '8px 20px',
            cursor: form.title?.trim() ? 'pointer' : 'not-allowed',
            fontSize: '12px', fontWeight: '700', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s',
          }}>
            <Plus size={13} /> Salvar Template
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────

export const Templates = () => {
  const [templates, setTemplates]     = useState<Template[]>(() => loadBlocks<Template>(BLOCK_KEYS.templates));
  const [busca, setBusca]             = useState('');
  const [filtroLinha, setFiltroLinha] = useState<TemplateLineType | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<TemplateStatus | 'todos'>('todos');
  const [filtroSource, setFiltroSource] = useState<TemplateSource | 'todos'>('todos');
  const [formAberto, setFormAberto]   = useState(false);
  const [usadoNaSessao, setUsadoNaSessao] = useState<string | null>(null);

  const persistir = (lista: Template[]) => {
    setTemplates(lista);
    saveBlocks(BLOCK_KEYS.templates, lista);
  };

  const adicionarTemplate = (t: Template) => {
    persistir([t, ...templates]);
    setFormAberto(false);
  };

  const atualizarStatus = (id: string, status: TemplateStatus) => {
    persistir(templates.map(t => t.id === id ? { ...t, status } : t));
  };

  const removerTemplate = (id: string) => {
    persistir(templates.filter(t => t.id !== id));
  };

  const usarNaSessao = (template: Template) => {
    localStorage.setItem(BLOCK_KEYS.template_selected, JSON.stringify(template));
    setUsadoNaSessao(template.id);
    setTimeout(() => setUsadoNaSessao(null), 3000);
  };

  const templatesFiltrados = useMemo(() => {
    return templates.filter(t => {
      const matchBusca  = !busca || [t.title, t.structure, t.notes].join(' ').toLowerCase().includes(busca.toLowerCase());
      const matchLinha  = filtroLinha  === 'todos' || t.line_type === filtroLinha;
      const matchStatus = filtroStatus === 'todos' || t.status    === filtroStatus;
      const matchSource = filtroSource === 'todos' || t.source    === filtroSource;
      return matchBusca && matchLinha && matchStatus && matchSource;
    });
  }, [templates, busca, filtroLinha, filtroStatus, filtroSource]);

  const total     = templates.length;
  const ativos    = templates.filter(t => t.status === 'active').length;
  const drafts    = templates.filter(t => t.status === 'draft').length;
  const arquivados = templates.filter(t => t.status === 'archived').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {[
          { label: 'Total',      valor: total,      cor: G.colors.secondary },
          { label: 'Ativos',     valor: ativos,     cor: G.colors.success },
          { label: 'Rascunhos',  valor: drafts,     cor: G.colors.warning },
          { label: 'Arquivados', valor: arquivados, cor: 'rgba(255,255,255,0.25)' },
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
              placeholder="Buscar templates..."
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
            background: formAberto ? 'rgba(255,255,255,0.08)' : G.colors.secondary,
            border: 'none', borderRadius: '8px', padding: '9px 16px',
            cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
          }}>
            {formAberto ? <><X size={13} /> Fechar</> : <><Plus size={13} /> Novo Template</>}
          </button>
        </div>

        {/* Filtros por linha */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '8px' }}>
            LINHA DE PRODUÇÃO
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <FilterChip label="Todos" active={filtroLinha === 'todos'} color={G.colors.secondary} onClick={() => setFiltroLinha('todos')} />
            {TEMPLATE_LINES.map(l => (
              <FilterChip key={l} label={TEMPLATE_LINE_LABEL[l]} active={filtroLinha === l}
                color={TEMPLATE_LINE_COLOR[l]} onClick={() => setFiltroLinha(l)} />
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
            {TEMPLATE_STATUSES.map(s => (
              <FilterChip key={s} label={TEMPLATE_STATUS_LABEL[s]} active={filtroStatus === s}
                color={TEMPLATE_STATUS_COLOR[s]} onClick={() => setFiltroStatus(s)} />
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
            <FilterChip label="Campanha" active={filtroSource === 'campanha'} color={G.colors.primary} onClick={() => setFiltroSource('campanha')} />
          </div>
        </div>
      </GlassCard>

      {/* Formulário */}
      {formAberto && (
        <FormNovoTemplate onSalvar={adicionarTemplate} onFechar={() => setFormAberto(false)} />
      )}

      {/* Notificação sessão — feedback claro + próximo passo */}
      {usadoNaSessao && (
        <div style={{
          background: `${G.colors.secondary}15`, border: `1px solid ${G.colors.secondary}30`,
          borderRadius: '10px', padding: '12px 16px',
          fontSize: '13px', fontWeight: '600', color: G.colors.secondary,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Zap size={14} /> Template salvo na sessão — abra <strong style={{ color: '#fff' }}>Copy & Roteiro</strong> para usar como base
        </div>
      )}

      {/* Lista */}
      <GlassCard style={{ padding: '20px 24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={15} color={G.colors.secondary} />
            <span style={{ fontWeight: '700', fontSize: '13px' }}>
              {templatesFiltrados.length} template{templatesFiltrados.length !== 1 ? 's' : ''}
              {(filtroLinha !== 'todos' || filtroStatus !== 'todos' || filtroSource !== 'todos' || busca) && (
                <span style={{ fontWeight: '400', color: 'rgba(255,255,255,0.4)' }}> filtrados</span>
              )}
            </span>
          </div>
          {(filtroLinha !== 'todos' || filtroStatus !== 'todos' || filtroSource !== 'todos' || busca) && (
            <button
              onClick={() => { setBusca(''); setFiltroLinha('todos'); setFiltroStatus('todos'); setFiltroSource('todos'); }}
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

        {templates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎬</div>
            Nenhum template ainda — crie o primeiro com "Novo Template"
          </div>
        )}

        {templates.length > 0 && templatesFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
            Nenhum template encontrado com os filtros aplicados
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {templatesFiltrados.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onCopiar={() => {}}
              onAtivar={() => atualizarStatus(template.id, template.status === 'active' ? 'draft' : 'active')}
              onArquivar={() => atualizarStatus(template.id, 'archived')}
              onRemover={() => removerTemplate(template.id)}
              onUsarNaSessao={() => usarNaSessao(template)}
            />
          ))}
        </div>
      </GlassCard>

    </div>
  );
};
