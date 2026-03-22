import { useState, useEffect, useMemo } from 'react';
import { FileText, Plus, Copy, Check, Trash2, Send, ChevronDown, Search } from 'lucide-react';
import { G, GlassCard, Badge, Btn } from '../design-system';
import {
  BLOCK_KEYS,
  loadBlocks,
  saveBlocks,
  gerarId,
} from '../types/creative-blocks';

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────

type LineType = 'L1' | 'L2' | 'L3';
type RoteiroStatus = 'draft' | 'finalizado';

interface RoteiroBloco {
  id: string;
  titulo: string;
  conteudo: string;
}

interface Roteiro {
  id: string;
  tipo: LineType;
  hook: string;
  blocos: RoteiroBloco[];
  cta: string;
  oferta: string;
  created_at: string;
  status: RoteiroStatus;
}

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────

const STORAGE_KEY = 'roteiros_salvos';

const LINE_LABELS: Record<LineType, string> = {
  L1: 'L1 - Reels',
  L2: 'L2 - Cortes de Live',
  L3: 'L3 - Full IA',
};

const LINE_COLORS: Record<LineType, string> = {
  L1: G.colors.primary,
  L2: G.colors.warning,
  L3: G.colors.secondary,
};

const STATUS_LABELS: Record<RoteiroStatus, string> = {
  draft: 'Rascunho',
  finalizado: 'Finalizado',
};

const STATUS_COLORS: Record<RoteiroStatus, string> = {
  draft: 'rgba(255,255,255,0.35)',
  finalizado: G.colors.success,
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function loadRoteiros(): Roteiro[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveRoteiros(items: Roteiro[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function gerarBlocosPadrao(): RoteiroBloco[] {
  return [
    { id: gerarId(), titulo: 'Contexto / Problema', conteudo: '' },
    { id: gerarId(), titulo: 'Prova / Demonstracao', conteudo: '' },
    { id: gerarId(), titulo: 'Beneficio / Resultado', conteudo: '' },
  ];
}

function montarTextoCompleto(r: Roteiro): string {
  const lines: string[] = [];
  lines.push(`[${LINE_LABELS[r.tipo]}] Roteiro`);
  lines.push('');
  lines.push(`HOOK: ${r.hook}`);
  lines.push('');
  r.blocos.forEach((b, i) => {
    lines.push(`BLOCO ${i + 1} - ${b.titulo}:`);
    lines.push(b.conteudo || '(vazio)');
    lines.push('');
  });
  lines.push(`CTA: ${r.cta}`);
  if (r.oferta) {
    lines.push('');
    lines.push(`OFERTA: ${r.oferta}`);
  }
  return lines.join('\n');
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', marginBottom: '6px' }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────
// CARD DE ROTEIRO
// ─────────────────────────────────────────

function RoteiroCard({ roteiro, onCopiar, onEnviar, onDeletar, onFinalizar }: {
  roteiro: Roteiro;
  onCopiar: () => void;
  onEnviar: () => void;
  onDeletar: () => void;
  onFinalizar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    navigator.clipboard.writeText(montarTextoCompleto(roteiro));
    setCopiado(true);
    onCopiar();
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${roteiro.status === 'finalizado' ? `${G.colors.success}25` : 'rgba(255,255,255,0.07)'}`,
      borderLeft: `3px solid ${LINE_COLORS[roteiro.tipo]}`,
      borderRadius: '10px',
      padding: '14px 16px',
      transition: 'all 0.2s',
    }}>
      {/* Badges */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <Badge label={LINE_LABELS[roteiro.tipo]} color={LINE_COLORS[roteiro.tipo]} />
        <Badge label={STATUS_LABELS[roteiro.status]} color={STATUS_COLORS[roteiro.status]} />
      </div>

      {/* Hook */}
      <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
        {roteiro.hook || '(sem hook)'}
      </div>

      {/* Blocos preview */}
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', lineHeight: '1.5' }}>
        {roteiro.blocos.map((b, i) => (
          <div key={b.id}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>Bloco {i + 1}:</span>{' '}
            {b.conteudo ? (b.conteudo.length > 60 ? b.conteudo.slice(0, 60) + '...' : b.conteudo) : '(vazio)'}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ fontSize: '12px', color: G.colors.copy, marginBottom: '10px' }}>
        CTA: {roteiro.cta || '(sem CTA)'}
      </div>

      {/* Data */}
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginBottom: '10px' }}>
        {new Date(roteiro.created_at).toLocaleDateString('pt-BR')} {new Date(roteiro.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Acoes */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <Btn icon={copiado ? Check : Copy} label={copiado ? 'Copiado' : 'Copiar'} variant="glass" onClick={copiar} small />
        <Btn icon={Send} label="Enviar p/ Copy" variant="secondary" onClick={onEnviar} small />
        {roteiro.status === 'draft' && (
          <Btn icon={Check} label="Finalizar" variant="success" onClick={onFinalizar} small />
        )}
        <Btn icon={Trash2} label="Deletar" variant="dark" onClick={onDeletar} small />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────

export function GeradorRoteiros() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<LineType | 'todos'>('todos');
  const [busca, setBusca] = useState('');

  // Form state
  const [tipo, setTipo] = useState<LineType>('L1');
  const [hook, setHook] = useState('');
  const [oferta, setOferta] = useState('');
  const [blocos, setBlocos] = useState<RoteiroBloco[]>(gerarBlocosPadrao());
  const [cta, setCta] = useState('');
  const [formAberto, setFormAberto] = useState(false);

  useEffect(() => {
    setRoteiros(loadRoteiros());
  }, []);

  const salvar = (updated: Roteiro[]) => {
    setRoteiros(updated);
    saveRoteiros(updated);
  };

  const gerarRoteiro = () => {
    if (!hook.trim()) return;
    const novo: Roteiro = {
      id: gerarId(),
      tipo,
      hook: hook.trim(),
      blocos: blocos.map(b => ({ ...b, conteudo: b.conteudo.trim() })),
      cta: cta.trim() || 'Cadastre-se agora e garanta seu bonus!',
      oferta: oferta.trim(),
      created_at: new Date().toISOString(),
      status: 'draft',
    };
    salvar([novo, ...roteiros]);
    // Reset form
    setHook('');
    setOferta('');
    setBlocos(gerarBlocosPadrao());
    setCta('');
    setFormAberto(false);
  };

  const deletar = (id: string) => {
    salvar(roteiros.filter(r => r.id !== id));
  };

  const finalizar = (id: string) => {
    salvar(roteiros.map(r => r.id === id ? { ...r, status: 'finalizado' as RoteiroStatus } : r));
  };

  const enviarParaCopy = (roteiro: Roteiro) => {
    // Salva hook no hook_selected para a sessao Copy & Roteiro
    localStorage.setItem(BLOCK_KEYS.hook_selected, JSON.stringify({
      hook_text: roteiro.hook,
      source: 'roteiros',
      tipo: roteiro.tipo,
    }));
    // Salva roteiro no blocks_roteiros
    const existentes = loadBlocks<any>(BLOCK_KEYS.roteiros);
    const jaExiste = existentes.some((r: any) => r.id === roteiro.id);
    if (!jaExiste) {
      saveBlocks(BLOCK_KEYS.roteiros, [...existentes, {
        id: roteiro.id,
        title: `Roteiro ${roteiro.tipo} - ${roteiro.hook.slice(0, 30)}`,
        scenes: roteiro.blocos.map((b, i) => ({
          order: i + 1,
          type: i === 0 ? 'abertura' : i === roteiro.blocos.length - 1 ? 'cta' : 'produto',
          description: b.conteudo,
          duration: '3s',
          camera: 'close-up',
        })),
        total_duration: `${roteiro.blocos.length * 3}s`,
        created_at: roteiro.created_at,
      }]);
    }
  };

  const updateBloco = (id: string, field: 'titulo' | 'conteudo', value: string) => {
    setBlocos(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const filtrados = useMemo(() => {
    let list = roteiros;
    if (filtroTipo !== 'todos') {
      list = list.filter(r => r.tipo === filtroTipo);
    }
    if (busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter(r =>
        r.hook.toLowerCase().includes(q) ||
        r.cta.toLowerCase().includes(q) ||
        r.blocos.some(b => b.conteudo.toLowerCase().includes(q))
      );
    }
    return list;
  }, [roteiros, filtroTipo, busca]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none' as const,
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {(['L1', 'L2', 'L3'] as LineType[]).map(l => {
          const count = roteiros.filter(r => r.tipo === l).length;
          return (
            <GlassCard key={l} style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: LINE_COLORS[l] }}>{count}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{LINE_LABELS[l]}</div>
            </GlassCard>
          );
        })}
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: G.colors.success }}>
            {roteiros.filter(r => r.status === 'finalizado').length}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Finalizados</div>
        </GlassCard>
      </div>

      {/* Botao novo roteiro */}
      {!formAberto && (
        <Btn icon={Plus} label="Novo Roteiro" variant="primary" onClick={() => setFormAberto(true)} />
      )}

      {/* Formulario */}
      {formAberto && (
        <GlassCard style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Novo Roteiro</h3>
            <button
              onClick={() => setFormAberto(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px' }}
            >
              x
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <Label>TIPO DE VIDEO</Label>
              <div style={{ position: 'relative' }}>
                <select value={tipo} onChange={e => setTipo(e.target.value as LineType)} style={selectStyle}>
                  {(['L1', 'L2', 'L3'] as LineType[]).map(l => (
                    <option key={l} value={l} style={{ background: '#1c1c1e' }}>{LINE_LABELS[l]}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.3)' }} />
              </div>
            </div>
            <div>
              <Label>OFERTA (OPCIONAL)</Label>
              <input
                value={oferta}
                onChange={e => setOferta(e.target.value)}
                placeholder="Ex: Bonus de 100% no primeiro deposito"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label>HOOK INICIAL</Label>
            <input
              value={hook}
              onChange={e => setHook(e.target.value)}
              placeholder="Ex: Voce nao vai acreditar no que aconteceu..."
              style={inputStyle}
            />
          </div>

          {/* Blocos de desenvolvimento */}
          <div style={{ marginBottom: '16px' }}>
            <Label>DESENVOLVIMENTO (3 BLOCOS)</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {blocos.map((bloco, i) => (
                <div key={bloco.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: G.colors.primary, fontWeight: '700' }}>BLOCO {i + 1}</span>
                    <input
                      value={bloco.titulo}
                      onChange={e => updateBloco(bloco.id, 'titulo', e.target.value)}
                      style={{ ...inputStyle, padding: '4px 8px', fontSize: '11px', flex: 1 }}
                      placeholder="Titulo do bloco"
                    />
                  </div>
                  <textarea
                    value={bloco.conteudo}
                    onChange={e => updateBloco(bloco.id, 'conteudo', e.target.value)}
                    placeholder={`Conteudo do bloco ${i + 1}...`}
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label>CTA (CHAMADA PARA ACAO)</Label>
            <input
              value={cta}
              onChange={e => setCta(e.target.value)}
              placeholder="Ex: Cadastre-se agora e garanta seu bonus!"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Btn icon={FileText} label="Gerar Roteiro" variant="primary" onClick={gerarRoteiro} />
            <Btn icon={undefined} label="Cancelar" variant="dark" onClick={() => setFormAberto(false)} />
          </div>
        </GlassCard>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar roteiros..."
            style={{ ...inputStyle, paddingLeft: '32px' }}
          />
        </div>
        {(['todos', 'L1', 'L2', 'L3'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: `1px solid ${filtroTipo === t ? G.colors.primary : 'rgba(255,255,255,0.08)'}`,
              background: filtroTipo === t ? `${G.colors.primary}20` : 'rgba(255,255,255,0.04)',
              color: filtroTipo === t ? G.colors.primary : 'rgba(255,255,255,0.5)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t === 'todos' ? 'Todos' : LINE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Lista de roteiros */}
      {filtrados.length === 0 ? (
        <GlassCard style={{ padding: '40px', textAlign: 'center' }}>
          <FileText size={32} color="rgba(255,255,255,0.15)" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>
            {roteiros.length === 0 ? 'Nenhum roteiro criado ainda' : 'Nenhum roteiro encontrado'}
          </div>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtrados.map(r => (
            <RoteiroCard
              key={r.id}
              roteiro={r}
              onCopiar={() => {}}
              onEnviar={() => enviarParaCopy(r)}
              onDeletar={() => deletar(r.id)}
              onFinalizar={() => finalizar(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
