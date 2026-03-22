import { useState, useMemo } from 'react';
import { Search, Plus, X, Copy, CheckCircle, Archive, Hash, Zap, ChevronDown } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';
import {
  type Hook,
  type HookType,
  type HookStatus,
  HOOK_TYPE_LABEL,
  HOOK_TYPE_COLOR,
  HOOK_STATUS_LABEL,
  HOOK_STATUS_COLOR,
  BLOCK_KEYS,
  loadBlocks,
  saveBlocks,
  gerarId,
} from '../types/creative-blocks';

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────

const HOOK_TYPES: HookType[] = ['curiosidade', 'prova', 'choque', 'emocao', 'tutorial', 'cta_abertura'];
const HOOK_STATUSES: HookStatus[] = ['draft', 'validado', 'arquivado'];

const FORM_VAZIO = (): Partial<Hook> => ({
  hook_text: '',
  hook_type: 'curiosidade',
  status: 'draft',
  source: 'manual',
});

// ─────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', marginBottom: '6px' }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────
// CARD DE HOOK
// ─────────────────────────────────────────

function HookCard({ hook, onCopiar, onValidar, onArquivar, onRemover, onUsarEmCopy }: {
  hook: Hook;
  onCopiar: () => void;
  onValidar: () => void;
  onArquivar: () => void;
  onRemover: () => void;
  onUsarEmCopy: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const typeColor  = HOOK_TYPE_COLOR[hook.hook_type];
  const statusColor = HOOK_STATUS_COLOR[hook.status];
  const arquivado  = hook.status === 'arquivado';

  const copiar = () => {
    navigator.clipboard.writeText(hook.hook_text);
    setCopiado(true);
    onCopiar();
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{
      background: arquivado ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${hook.status === 'validado' ? `${G.colors.success}25` : 'rgba(255,255,255,0.07)'}`,
      borderLeft: `3px solid ${typeColor}`,
      borderRadius: '10px',
      padding: '14px 16px',
      opacity: arquivado ? 0.5 : 1,
      transition: 'all 0.2s',
    }}>
      {/* Badges de metadados */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <Badge label={HOOK_TYPE_LABEL[hook.hook_type]} color={typeColor} />
        <Badge label={HOOK_STATUS_LABEL[hook.status]} color={statusColor} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: '600', letterSpacing: '0.5px' }}>
          {hook.source === 'copy_roteiro' ? 'Copy & Roteiro' : hook.source === 'radar' ? 'Radar' : 'Manual'}
        </span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {new Date(hook.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      {/* Texto do hook */}
      <p style={{
        fontSize: '14px', lineHeight: '1.6', margin: '0 0 10px 0',
        color: arquivado ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)',
        fontStyle: 'italic',
      }}>
        "{hook.hook_text}"
      </p>

      {/* Padrão abstraído — só exibe quando gravado pelo Radar */}
      {hook.hook_pattern && (
        <div style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '6px', padding: '5px 10px',
          marginBottom: '10px', fontFamily: 'monospace',
          letterSpacing: '0.3px',
        }}>
          Padrão: {hook.hook_pattern}
        </div>
      )}

      {/* Ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Copiar */}
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

        {/* Usar em Copy & Roteiro */}
        {!arquivado && (
          <button onClick={onUsarEmCopy} style={{
            background: `${G.colors.primary}15`, border: `1px solid ${G.colors.primary}30`,
            borderRadius: '7px', padding: '6px 12px', cursor: 'pointer',
            fontSize: '11px', fontWeight: '700', color: G.colors.primary,
            display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s',
          }}>
            <Zap size={11} /> Usar em Copy
          </button>
        )}

        {/* Validar */}
        {hook.status === 'draft' && (
          <button onClick={onValidar} style={{
            background: `${G.colors.success}15`, border: `1px solid ${G.colors.success}30`,
            borderRadius: '7px', padding: '6px 12px', cursor: 'pointer',
            fontSize: '11px', fontWeight: '700', color: G.colors.success,
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <CheckCircle size={11} /> Validar
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
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: '4px',
              background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '4px', minWidth: '140px', zIndex: 10,
            }} onMouseLeave={() => setMenuAberto(false)}>
              {hook.status !== 'arquivado' && (
                <MenuOption icon={Archive} label="Arquivar" color="rgba(255,255,255,0.4)" onClick={() => { onArquivar(); setMenuAberto(false); }} />
              )}
              {hook.status === 'validado' && (
                <MenuOption icon={CheckCircle} label="Voltar para Draft" color={G.colors.warning} onClick={() => { onValidar(); setMenuAberto(false); }} />
              )}
              <MenuOption icon={X} label="Remover" color={G.colors.danger} onClick={() => { onRemover(); setMenuAberto(false); }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuOption({ icon: Icon, label, color, onClick }: { icon: any; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
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
// FORMULÁRIO DE ADIÇÃO
// ─────────────────────────────────────────

function FormNovoHook({ onSalvar, onFechar }: { onSalvar: (h: Hook) => void; onFechar: () => void }) {
  const [form, setForm] = useState<Partial<Hook>>(FORM_VAZIO());
  const set = (k: keyof Hook) => (v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const submeter = () => {
    if (!form.hook_text?.trim()) return;
    onSalvar({
      id: gerarId(),
      hook_text: form.hook_text!.trim(),
      hook_type: form.hook_type! as HookType,
      status: form.status! as HookStatus,
      source: 'manual',
      created_at: new Date().toISOString(),
    });
    setForm(FORM_VAZIO());
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '12px', padding: '18px',
    }}>
      <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '16px', color: G.colors.primary }}>
        + Novo Hook
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Texto */}
        <div>
          <Label>TEXTO DO HOOK *</Label>
          <textarea
            value={form.hook_text || ''}
            onChange={e => set('hook_text')(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.metaKey && submeter()}
            placeholder={'"Olha isso aqui antes de fechar..."'}
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Tipo */}
          <div>
            <Label>TIPO</Label>
            <select
              value={form.hook_type || 'curiosidade'}
              onChange={e => set('hook_type')(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                padding: '9px 12px', color: '#fff', fontSize: '13px',
                outline: 'none', cursor: 'pointer',
              }}
            >
              {HOOK_TYPES.map(t => (
                <option key={t} value={t} style={{ background: '#1c1c1e' }}>
                  {HOOK_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <Label>STATUS INICIAL</Label>
            <select
              value={form.status || 'draft'}
              onChange={e => set('status')(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                padding: '9px 12px', color: '#fff', fontSize: '13px',
                outline: 'none', cursor: 'pointer',
              }}
            >
              {HOOK_STATUSES.map(s => (
                <option key={s} value={s} style={{ background: '#1c1c1e' }}>
                  {HOOK_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onFechar} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
            fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.5)',
          }}>
            Cancelar
          </button>
          <button onClick={submeter} disabled={!form.hook_text?.trim()} style={{
            background: form.hook_text?.trim() ? G.colors.primary : 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: '8px', padding: '8px 20px',
            cursor: form.hook_text?.trim() ? 'pointer' : 'not-allowed',
            fontSize: '12px', fontWeight: '700', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s',
          }}>
            <Plus size={13} /> Salvar Hook
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────

export const BancoHooks = () => {
  const [hooks, setHooks] = useState<Hook[]>(() => loadBlocks<Hook>(BLOCK_KEYS.hooks));
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo]     = useState<HookType | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<HookStatus | 'todos'>('todos');
  const [filtroSource, setFiltroSource] = useState<'todos' | 'manual' | 'radar' | 'copy_roteiro'>('todos');
  const [formAberto, setFormAberto] = useState(false);
  const [usadoEmCopy, setUsadoEmCopy] = useState<string | null>(null);

  const persistir = (lista: Hook[]) => {
    setHooks(lista);
    saveBlocks(BLOCK_KEYS.hooks, lista);
  };

  const adicionarHook = (h: Hook) => {
    persistir([h, ...hooks]);
    setFormAberto(false);
  };

  const atualizarStatus = (id: string, status: HookStatus) => {
    persistir(hooks.map(h => h.id === id ? { ...h, status } : h));
  };

  const removerHook = (id: string) => {
    persistir(hooks.filter(h => h.id !== id));
  };

  const usarEmCopy = (hook: Hook) => {
    // Escreve o hook selecionado para que Copy & Roteiro possa ler
    localStorage.setItem(BLOCK_KEYS.hook_selected, JSON.stringify(hook));
    setUsadoEmCopy(hook.id);
    setTimeout(() => setUsadoEmCopy(null), 2500);
  };

  // Filtros e busca
  const hooksFiltrados = useMemo(() => {
    return hooks.filter(h => {
      const matchBusca  = !busca || h.hook_text.toLowerCase().includes(busca.toLowerCase());
      const matchTipo   = filtroTipo   === 'todos' || h.hook_type === filtroTipo;
      const matchStatus = filtroStatus === 'todos' || h.status    === filtroStatus;
      const matchSource = filtroSource === 'todos' || h.source    === filtroSource;
      return matchBusca && matchTipo && matchStatus && matchSource;
    });
  }, [hooks, busca, filtroTipo, filtroStatus, filtroSource]);

  // Stats
  const total = hooks.length;
  const validados = hooks.filter(h => h.status === 'validado').length;
  const drafts = hooks.filter(h => h.status === 'draft').length;
  const arquivados = hooks.filter(h => h.status === 'arquivado').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {[
          { label: 'Total',     valor: total,      cor: G.colors.primary },
          { label: 'Validados', valor: validados,   cor: G.colors.success },
          { label: 'Rascunhos', valor: drafts,      cor: G.colors.warning },
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
          {/* Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar hooks..."
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
                background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex',
              }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Botão novo hook */}
          <button onClick={() => setFormAberto(v => !v)} style={{
            background: formAberto ? 'rgba(255,255,255,0.08)' : G.colors.primary,
            border: 'none', borderRadius: '8px', padding: '9px 16px',
            cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
          }}>
            {formAberto ? <><X size={13} /> Fechar</> : <><Plus size={13} /> Novo Hook</>}
          </button>
        </div>

        {/* Filtros por tipo */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '8px' }}>
            TIPO
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <FilterChip label="Todos" active={filtroTipo === 'todos'} color={G.colors.primary} onClick={() => setFiltroTipo('todos')} />
            {HOOK_TYPES.map(t => (
              <FilterChip key={t} label={HOOK_TYPE_LABEL[t]} active={filtroTipo === t} color={HOOK_TYPE_COLOR[t]} onClick={() => setFiltroTipo(t)} />
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
            {HOOK_STATUSES.map(s => (
              <FilterChip key={s} label={HOOK_STATUS_LABEL[s]} active={filtroStatus === s} color={HOOK_STATUS_COLOR[s]} onClick={() => setFiltroStatus(s)} />
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
            <FilterChip label="Copy & Roteiro" active={filtroSource === 'copy_roteiro'} color={G.colors.primary} onClick={() => setFiltroSource('copy_roteiro')} />
          </div>
        </div>
      </GlassCard>

      {/* Formulário de novo hook */}
      {formAberto && (
        <FormNovoHook onSalvar={adicionarHook} onFechar={() => setFormAberto(false)} />
      )}

      {/* Notificação "Enviado para Copy & Roteiro" */}
      {usadoEmCopy && (
        <div style={{
          background: `${G.colors.primary}15`, border: `1px solid ${G.colors.primary}30`,
          borderRadius: '10px', padding: '12px 16px',
          fontSize: '13px', fontWeight: '600', color: G.colors.primary,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Zap size={14} /> Hook enviado para Copy & Roteiro — abra a página para usar
        </div>
      )}

      {/* Lista */}
      <GlassCard style={{ padding: '20px 24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hash size={15} color={G.colors.primary} />
            <span style={{ fontWeight: '700', fontSize: '13px' }}>
              {hooksFiltrados.length} hook{hooksFiltrados.length !== 1 ? 's' : ''}
              {(filtroTipo !== 'todos' || filtroStatus !== 'todos' || filtroSource !== 'todos' || busca) && (
                <span style={{ fontWeight: '400', color: 'rgba(255,255,255,0.4)' }}> filtrados</span>
              )}
            </span>
          </div>
          {(filtroTipo !== 'todos' || filtroStatus !== 'todos' || filtroSource !== 'todos' || busca) && (
            <button onClick={() => { setBusca(''); setFiltroTipo('todos'); setFiltroStatus('todos'); setFiltroSource('todos'); }} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px',
              color: 'rgba(255,255,255,0.35)', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <X size={11} /> Limpar filtros
            </button>
          )}
        </div>

        {hooks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🪝</div>
            Nenhum hook ainda — clique em "Novo Hook" ou salve um via Copy & Roteiro
          </div>
        )}

        {hooks.length > 0 && hooksFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
            Nenhum hook encontrado com os filtros aplicados
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {hooksFiltrados.map(hook => (
            <HookCard
              key={hook.id}
              hook={hook}
              onCopiar={() => {}}
              onValidar={() => atualizarStatus(hook.id, hook.status === 'validado' ? 'draft' : 'validado')}
              onArquivar={() => atualizarStatus(hook.id, 'arquivado')}
              onRemover={() => removerHook(hook.id)}
              onUsarEmCopy={() => usarEmCopy(hook)}
            />
          ))}
        </div>
      </GlassCard>

    </div>
  );
};

// ─────────────────────────────────────────
// FILTER CHIP
// ─────────────────────────────────────────

function FilterChip({ label, active, color, onClick }: {
  label: string; active: boolean; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '20px', padding: '4px 12px', cursor: 'pointer',
        fontSize: '11px', fontWeight: active ? '700' : '500',
        color: active ? color : 'rgba(255,255,255,0.4)',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
