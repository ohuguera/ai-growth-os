import { useState, useEffect } from 'react';
import { Plus, X, Save, Copy, Check, RefreshCw, Zap, SendHorizonal, Film, MessageSquare, FileText, Hash, Gift, Package, Cpu } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';
import {
  type Hook,
  type RoteiroScene,
  type SceneType,
  type CameraType,
  type Oferta,
  type Template,
  BLOCK_KEYS,
  SCENE_TYPE_LABEL,
  SCENE_TYPE_COLOR,
  CAMERA_LABEL,
  TEMPLATE_LINE_COLOR,
  TEMPLATE_LINE_LABEL,
  loadBlocks,
  saveBlocks,
  getTodayKey,
  gerarId,
} from '../types/creative-blocks';
import {
  type ProductionItem,
  type LineType,
  loadItems,
  saveItems,
} from '../types/production';
import { getCopyIntelligence, type IntelligenceResult } from '../types/copy-intelligence';

// ─────────────────────────────────────────
// TIPOS LOCAIS
// ─────────────────────────────────────────

interface Briefing {
  tipo_video: string;
  casa_jogo: string;
  objetivo: string;
  oferta: string;
  observacoes: string;
}

interface CopyData {
  hook: string;
  desenvolvimento: string;
  cta: string;
}

// Slot futuro para Copy Intelligence — sem UI por enquanto
// interface CopyConfig {
//   style?: 'urgencia' | 'curiosidade' | 'prova_social';
//   framework?: 'aida' | 'pas' | 'hook_story_offer';
//   tone?: 'empolgado' | 'informativo' | 'urgente';
// }

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────

const SCENE_TYPES: SceneType[] = ['abertura', 'produto', 'reacao', 'prova_social', 'cta'];
const CAMERA_TYPES: CameraType[] = ['close-up', 'plano-medio', 'plano-geral', 'zoom', 'pov', 'tela'];

const LINE_OPTIONS: { value: LineType; label: string }[] = [
  { value: 'L1', label: 'L1 — Reels' },
  { value: 'L2', label: 'L2 — Cortes de Live' },
  { value: 'L3', label: 'L3 — Full IA' },
];

const CENAS_PADRAO = (): RoteiroScene[] => [
  { order: 1, type: 'abertura',    description: '', duration: '3s', camera: 'close-up' },
  { order: 2, type: 'produto',     description: '', duration: '3s', camera: 'tela' },
  { order: 3, type: 'reacao',      description: '', duration: '2s', camera: 'close-up' },
  { order: 4, type: 'cta',         description: '', duration: '2s', camera: 'plano-medio' },
];

const BRIEFING_VAZIO = (): Briefing => ({
  tipo_video: '', casa_jogo: '', objetivo: '', oferta: '', observacoes: '',
});

const COPY_VAZIA = (): CopyData => ({ hook: '', desenvolvimento: '', cta: '' });

const SESSION_KEY = (date: string) => `copy_roteiro_session_${date}`;

// ─────────────────────────────────────────
// UTILITÁRIOS
// ─────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', marginBottom: '6px' }}>
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

function FieldTextarea({ label, value, onChange, placeholder, rows = 3 }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px',
          padding: '10px 12px', color: '#fff', fontSize: '13px',
          outline: 'none', resize: 'vertical', boxSizing: 'border-box',
          lineHeight: '1.6', fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function BlockHeader({ icon: Icon, color, number, label, sublabel }: {
  icon: any; color: string; number: string; label: string; sublabel: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: '900', color,
      }}>
        {number}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={15} color={color} />
        <div>
          <div style={{ fontWeight: '700', fontSize: '14px' }}>{label}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>{sublabel}</div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, color, onClick }: {
  icon: any; label: string; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      background: `${color}15`, border: `1px solid ${color}30`,
      borderRadius: '7px', padding: '6px 12px', cursor: 'pointer',
      fontSize: '11px', fontWeight: '700', color,
      display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s',
    }}>
      <Icon size={12} /> {label}
    </button>
  );
}

// ─────────────────────────────────────────
// BANNER DE SESSÃO ATIVA
// ─────────────────────────────────────────

function BannerSessaoAtiva({ hook, oferta, template, onDismissHook, onDismissOferta, onDismissTemplate, onLimparTudo, onReler }: {
  hook: Hook | null;
  oferta: Oferta | null;
  template: Template | null;
  onDismissHook: () => void;
  onDismissOferta: () => void;
  onDismissTemplate: () => void;
  onLimparTudo: () => void;
  onReler?: () => void;
}) {
  if (!hook && !oferta && !template) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {onReler && (
          <button onClick={onReler} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '7px', padding: '5px 12px', cursor: 'pointer',
            fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s',
          }}>
            <RefreshCw size={10} /> Reaplicar Sessão
          </button>
        )}
      </div>
    );
  }

  const itens = [
    hook     && { icon: Hash,    label: 'Hook',    value: hook.hook_text,          origem: 'Banco de Hooks',         color: G.colors.primary,   onDismiss: onDismissHook },
    oferta   && { icon: Gift,    label: 'Oferta',  value: oferta.offer_title,      origem: 'Biblioteca de Ofertas',  color: G.colors.warning,   onDismiss: onDismissOferta },
    template && { icon: Package, label: 'Template',value: template.title,          origem: 'Templates',              color: G.colors.secondary, onDismiss: onDismissTemplate },
  ].filter(Boolean) as Array<{
    icon: any; label: string; value: string; origem: string; color: string; onDismiss: () => void;
  }>;

  return (
    <GlassCard style={{
      padding: '14px 18px', borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.025)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Zap size={13} color={G.colors.warning} />
          <span style={{ fontSize: '11px', fontWeight: '800', color: G.colors.warning, letterSpacing: '1px' }}>
            SESSÃO ATIVA
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {onReler && (
            <button onClick={onReler} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '6px', padding: '3px 10px', cursor: 'pointer',
              fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <RefreshCw size={9} /> Reaplicar
            </button>
          )}
          <button onClick={onLimparTudo} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px', padding: '3px 10px', cursor: 'pointer',
            fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)',
          }}>
            Limpar sessão
          </button>
        </div>
      </div>

      {/* Itens da sessão */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {itens.map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: `${item.color}08`, border: `1px solid ${item.color}18`,
            borderRadius: '8px', padding: '7px 12px',
          }}>
            {/* Ícone + label */}
            <item.icon size={11} color={item.color} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: '700', color: item.color, minWidth: '52px', letterSpacing: '0.5px' }}>
              {item.label.toUpperCase()}
            </span>

            {/* Valor */}
            <span style={{
              fontSize: '12px', color: 'rgba(255,255,255,0.65)', flex: 1,
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            }}>
              {item.value}
            </span>

            {/* Origem discreta */}
            <span style={{
              fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: '600',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {item.origem}
            </span>

            {/* Dismiss */}
            <button onClick={item.onDismiss} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.2)', padding: '0 0 0 4px',
              display: 'flex', flexShrink: 0,
            }}>
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────
// BLOCO 1 — BRIEFING
// ─────────────────────────────────────────

function BlocoBriefing({ briefing, setBriefing, onGerar, gerado }: {
  briefing: Briefing;
  setBriefing: (b: Briefing) => void;
  onGerar: () => void;
  gerado: boolean;
}) {
  const set = (k: keyof Briefing) => (v: string) => setBriefing({ ...briefing, [k]: v });

  return (
    <GlassCard style={{ padding: '24px', borderRadius: '16px' }}>
      <BlockHeader icon={FileText} color={G.colors.primary} number="01" label="Briefing" sublabel="Contexto do criativo" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FieldInput label="TIPO DE VÍDEO" value={briefing.tipo_video} onChange={set('tipo_video')}
            placeholder="Ex: Gameplay + Reação, Prova Social, POV..." />
          <FieldInput label="CASA OU JOGO" value={briefing.casa_jogo} onChange={set('casa_jogo')}
            placeholder="Ex: Fortune Mouse, reals.bet, Aviator..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FieldInput label="OBJETIVO" value={briefing.objetivo} onChange={set('objetivo')}
            placeholder="Ex: Mostrar big win, Converter cadastro, Branding..." />
          <FieldInput label="OFERTA" value={briefing.oferta} onChange={set('oferta')}
            placeholder="Ex: 200% de bônus no primeiro depósito via PIX" />
        </div>
        <FieldTextarea label="OBSERVAÇÕES" value={briefing.observacoes} onChange={set('observacoes')}
          placeholder="Referências, tom desejado, instruções de edição..." rows={2} />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onGerar} style={{
            background: `linear-gradient(135deg, ${G.colors.primary}, ${G.colors.secondary})`,
            border: 'none', borderRadius: '10px', padding: '11px 20px',
            cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: `0 4px 20px ${G.colors.primary}30`,
          }}>
            <Zap size={15} />
            {gerado ? 'Regenerar Copy & Roteiro' : 'Gerar Copy & Roteiro'}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────
// BLOCO 2 — COPY
// ─────────────────────────────────────────

function BlocoCopy({ copy, setCopy, briefing, onSalvar, onRegenerar, onSalvarHook, scaffoldAtivo }: {
  copy: CopyData;
  setCopy: (c: CopyData) => void;
  briefing: Briefing;
  onSalvar: () => void;
  onRegenerar: () => void;
  onSalvarHook: () => void;
  scaffoldAtivo: IntelligenceResult | null;
}) {
  const [copiado, setCopiado]         = useState(false);
  const [salvouHook, setSalvouHook]   = useState(false);
  const set = (k: keyof CopyData) => (v: string) => setCopy({ ...copy, [k]: v });

  const copiarParaClipboard = () => {
    const texto = [
      copy.hook && `HOOK:\n${copy.hook}`,
      copy.desenvolvimento && `DESENVOLVIMENTO:\n${copy.desenvolvimento}`,
      copy.cta && `CTA:\n${copy.cta}`,
    ].filter(Boolean).join('\n\n');

    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const preenchida = copy.hook || copy.desenvolvimento || copy.cta;

  return (
    <GlassCard style={{ padding: '24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: scaffoldAtivo ? '10px' : '20px' }}>
        <BlockHeader icon={MessageSquare} color={G.colors.copy} number="02" label="Copy" sublabel="Texto falado — narração ou fala do ator" />
        {preenchida && (
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <ActionBtn icon={RefreshCw} label="Regenerar" color="rgba(255,255,255,0.4)" onClick={onRegenerar} />
            <ActionBtn icon={Copy} label={copiado ? 'Copiado!' : 'Copiar'} color={copiado ? G.colors.success : G.colors.warning} onClick={copiarParaClipboard} />
            <ActionBtn icon={Save} label="Salvar" color={G.colors.copy} onClick={onSalvar} />
            {copy.hook && (
              <ActionBtn
                icon={salvouHook ? Check : Hash}
                label={salvouHook ? 'Hook salvo!' : 'Salvar Hook'}
                color={salvouHook ? G.colors.success : G.colors.primary}
                onClick={() => { onSalvarHook(); setSalvouHook(true); setTimeout(() => setSalvouHook(false), 2500); }}
              />
            )}
          </div>
        )}
      </div>

      {/* Badge Copy Intelligence */}
      {scaffoldAtivo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: 'rgba(10, 132, 255, 0.08)',
          border: '1px solid rgba(10, 132, 255, 0.20)',
          borderRadius: '8px', padding: '6px 12px',
          marginBottom: '16px',
        }}>
          <Cpu size={11} color="#0A84FF" />
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#0A84FF', letterSpacing: '0.5px' }}>
            COPY INTELLIGENCE ATIVO
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>
            Desenvolvimento gerado com base na sessão — edite à vontade
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ position: 'relative' }}>
          <FieldTextarea label="HOOK" value={copy.hook} onChange={set('hook')}
            placeholder={'"Olha o que aconteceu agora..."'} rows={2} />
          {briefing.tipo_video && !copy.hook && (
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>
              Baseado em: {briefing.tipo_video} {briefing.casa_jogo && `· ${briefing.casa_jogo}`}
            </div>
          )}
        </div>

        <FieldTextarea label="DESENVOLVIMENTO" value={copy.desenvolvimento} onChange={set('desenvolvimento')}
          placeholder={'"Olha o gráfico do Aviator agora, ele acabou de explodir."'} rows={3} />

        <FieldTextarea label="CTA" value={copy.cta} onChange={set('cta')}
          placeholder={'"Clica no link da bio pra começar com bônus."'} rows={2} />

        {preenchida && (
          <div style={{
            background: `${G.colors.copy}08`, border: `1px solid ${G.colors.copy}20`,
            borderRadius: '10px', padding: '14px 16px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: G.colors.copy, letterSpacing: '1px', marginBottom: '10px' }}>
              PREVIEW
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {copy.hook && <PreviewLine label="Hook" text={copy.hook} color={G.colors.primary} />}
              {copy.desenvolvimento && <PreviewLine label="Dev" text={copy.desenvolvimento} color={G.colors.warning} />}
              {copy.cta && <PreviewLine label="CTA" text={copy.cta} color={G.colors.success} />}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function PreviewLine({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <span style={{
        minWidth: '36px', fontSize: '10px', fontWeight: '700', color,
        background: `${color}15`, borderRadius: '4px', padding: '2px 6px',
        height: 'fit-content', marginTop: '1px',
      }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', fontStyle: 'italic' }}>
        "{text}"
      </span>
    </div>
  );
}

// ─────────────────────────────────────────
// BLOCO 3 — ROTEIRO
// ─────────────────────────────────────────

function BlocoRoteiro({ cenas, setCenas, onSalvar, template }: {
  cenas: RoteiroScene[];
  setCenas: (c: RoteiroScene[]) => void;
  onSalvar: () => void;
  template: Template | null;
}) {
  const totalSecs = cenas.map(s => parseInt(s.duration) || 0).reduce((a, b) => a + b, 0);

  const updateCena = (idx: number, field: keyof RoteiroScene, value: any) => {
    setCenas(cenas.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const addCena = () => {
    setCenas([...cenas, {
      order: cenas.length + 1,
      type: 'produto',
      description: '',
      duration: '2s',
      camera: 'plano-medio',
    }]);
  };

  const removeCena = (idx: number) => {
    setCenas(cenas.filter((_, i) => i !== idx).map((c, i) => ({ ...c, order: i + 1 })));
  };

  return (
    <GlassCard style={{ padding: '24px', borderRadius: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <BlockHeader icon={Film} color={G.colors.secondary} number="03" label="Roteiro"
          sublabel={`Estrutura visual da edição — ${cenas.length} cenas · ${totalSecs}s total`} />
        <ActionBtn icon={Save} label="Salvar roteiro" color={G.colors.secondary} onClick={onSalvar} />
      </div>

      {/* Guia do template — referência visual, não funcional */}
      {template && (
        <div style={{
          background: `${G.colors.secondary}08`,
          border: `1px solid ${G.colors.secondary}20`,
          borderRadius: '10px', padding: '12px 16px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Package size={12} color={G.colors.secondary} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: G.colors.secondary }}>
              BASE: {template.title}
            </span>
            {/* Badge da linha */}
            <span style={{
              fontSize: '10px', fontWeight: '800',
              color: TEMPLATE_LINE_COLOR[template.line_type],
              background: `${TEMPLATE_LINE_COLOR[template.line_type]}18`,
              border: `1px solid ${TEMPLATE_LINE_COLOR[template.line_type]}35`,
              borderRadius: '20px', padding: '1px 8px',
            }}>
              {TEMPLATE_LINE_LABEL[template.line_type]}
            </span>
          </div>

          {/* Estrutura */}
          {template.structure && (
            <div style={{
              fontSize: '12px', color: 'rgba(255,255,255,0.55)',
              lineHeight: '1.6', marginBottom: template.notes ? '6px' : '0',
            }}>
              {template.structure}
            </div>
          )}

          {/* Notas */}
          {template.notes && (
            <div style={{
              fontSize: '11px', color: 'rgba(255,255,255,0.3)',
              fontStyle: 'italic', lineHeight: '1.5',
            }}>
              {template.notes}
            </div>
          )}
        </div>
      )}

      {/* Grade de cenas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {cenas.map((cena, idx) => {
          const cor = SCENE_TYPE_COLOR[cena.type];
          return (
            <div key={idx} style={{
              display: 'grid',
              gridTemplateColumns: '28px 100px 1fr 80px 80px 28px',
              alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderLeft: `3px solid ${cor}`,
              borderRadius: '8px', padding: '10px 12px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: cor, textAlign: 'center' }}>
                {cena.order}
              </div>
              <select value={cena.type} onChange={e => updateCena(idx, 'type', e.target.value as SceneType)} style={{
                background: `${cor}15`, border: `1px solid ${cor}30`,
                borderRadius: '6px', padding: '5px 8px', color: cor,
                fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                outline: 'none', width: '100%',
              }}>
                {SCENE_TYPES.map(t => (
                  <option key={t} value={t} style={{ background: '#1c1c1e', color: '#fff' }}>
                    {SCENE_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
              <input value={cena.description} onChange={e => updateCena(idx, 'description', e.target.value)}
                placeholder="Descreva a cena..." style={{
                  background: 'transparent', border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff', fontSize: '12px', outline: 'none',
                  padding: '4px 0', width: '100%',
                }} />
              <select value={cena.camera} onChange={e => updateCena(idx, 'camera', e.target.value as CameraType)} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px', padding: '5px 8px', color: 'rgba(255,255,255,0.6)',
                fontSize: '11px', cursor: 'pointer', outline: 'none', width: '100%',
              }}>
                {CAMERA_TYPES.map(c => (
                  <option key={c} value={c} style={{ background: '#1c1c1e', color: '#fff' }}>
                    {CAMERA_LABEL[c]}
                  </option>
                ))}
              </select>
              <input value={cena.duration} onChange={e => updateCena(idx, 'duration', e.target.value)} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px', padding: '5px 8px', color: 'rgba(255,255,255,0.6)',
                fontSize: '11px', outline: 'none', textAlign: 'center', width: '100%',
              }} />
              <button onClick={() => removeCena(idx)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.2)', padding: '2px', display: 'flex',
              }}>
                <X size={13} />
              </button>
            </div>
          );
        })}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '28px 100px 1fr 80px 80px 28px',
          gap: '10px', padding: '0 12px',
          fontSize: '9px', fontWeight: '700', color: 'rgba(255,255,255,0.2)',
          letterSpacing: '1px',
        }}>
          <span>#</span><span>TIPO</span><span>DESCRIÇÃO</span><span>CÂMERA</span><span>DURAÇÃO</span><span />
        </div>

        <button onClick={addCena} style={{
          background: `${G.colors.secondary}10`, border: `1px dashed ${G.colors.secondary}25`,
          borderRadius: '8px', padding: '10px', cursor: 'pointer',
          color: G.colors.secondary, fontSize: '12px', fontWeight: '600',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          marginTop: '4px', transition: 'all 0.2s',
        }}>
          <Plus size={13} /> Adicionar cena
        </button>
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────
// BLOCO 4 — ENVIAR PARA PRODUÇÃO
// ─────────────────────────────────────────

function BlocoEnviarProducao({ copy, cenas, briefing, template, onEnviar, enviado }: {
  copy: CopyData;
  cenas: RoteiroScene[];
  briefing: Briefing;
  template: Template | null;
  onEnviar: (line: LineType) => void;
  enviado: boolean;
}) {
  const [line, setLine] = useState<LineType>('L1');
  const pronto = copy.hook.trim() || copy.desenvolvimento.trim();
  const totalSecs = cenas.map(s => parseInt(s.duration) || 0).reduce((a, b) => a + b, 0);

  return (
    <GlassCard style={{
      padding: '24px', borderRadius: '16px',
      border: enviado ? `1px solid ${G.colors.success}30` : undefined,
    }}>
      <BlockHeader icon={SendHorizonal} color={G.colors.success} number="04" label="Enviar para Produção"
        sublabel="Cria um Production Item com status Roteiro" />

      {/* Preview do que será enviado */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px', padding: '14px 16px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
          <PreviewField label="Título"  value={briefing.tipo_video || briefing.casa_jogo || '—'} />
          <PreviewField label="Hook"    value={copy.hook || '—'} />
          <PreviewField label="Dev"     value={copy.desenvolvimento || '—'} truncate />
          <PreviewField label="CTA"     value={copy.cta || '—'} />
          <PreviewField label="Oferta"  value={briefing.oferta || '—'} color={G.colors.warning} />
          <PreviewField
            label="Template"
            value={template ? template.title : '—'}
            color={template ? G.colors.secondary : undefined}
          />
          <PreviewField
            label="Roteiro"
            value={`${cenas.length} cena${cenas.length !== 1 ? 's' : ''} · ${totalSecs}s total`}
            color={G.colors.secondary}
          />
          <PreviewField label="Status inicial" value="Roteiro" color={G.colors.secondary} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div>
          <Label>LINHA</Label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {LINE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setLine(opt.value)} style={{
                background: line === opt.value ? `${G.colors.success}20` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${line === opt.value ? `${G.colors.success}40` : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '8px', padding: '7px 12px', cursor: 'pointer',
                fontSize: '12px', fontWeight: '700',
                color: line === opt.value ? G.colors.success : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s',
              }}>
                {opt.value}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onEnviar(line)}
          disabled={!pronto}
          style={{
            marginTop: '18px',
            background: pronto
              ? `linear-gradient(135deg, ${G.colors.success}, #20b840)`
              : 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: '10px', padding: '11px 24px',
            cursor: pronto ? 'pointer' : 'not-allowed',
            fontSize: '13px', fontWeight: '700',
            color: pronto ? '#000' : 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s',
            boxShadow: pronto ? `0 4px 20px ${G.colors.success}30` : 'none',
          }}
        >
          <SendHorizonal size={15} />
          {enviado ? 'Enviado!' : 'Criar Production Item'}
        </button>

        {enviado && <Badge label="Adicionado à Produção ✓" color={G.colors.success} />}
      </div>
    </GlassCard>
  );
}

function PreviewField({ label, value, truncate, color }: {
  label: string; value: string; truncate?: boolean; color?: string;
}) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span style={{ minWidth: '72px', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>{label}</span>
      <span style={{
        color: color || 'rgba(255,255,255,0.65)',
        overflow: truncate ? 'hidden' : undefined,
        whiteSpace: truncate ? 'nowrap' : undefined,
        textOverflow: truncate ? 'ellipsis' : undefined,
        flex: 1,
      }}>
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────

export const CopyRoteiro = () => {
  const todayKey   = getTodayKey();
  const sessionKey = SESSION_KEY(todayKey);

  // Estado da sessão — persiste no localStorage por dia
  const [briefing, setBriefing] = useState<Briefing>(() => {
    try { return JSON.parse(localStorage.getItem(sessionKey + '_briefing') || 'null') ?? BRIEFING_VAZIO(); }
    catch { return BRIEFING_VAZIO(); }
  });

  const [copy, setCopy] = useState<CopyData>(() => {
    try { return JSON.parse(localStorage.getItem(sessionKey + '_copy') || 'null') ?? COPY_VAZIA(); }
    catch { return COPY_VAZIA(); }
  });

  const [cenas, setCenas] = useState<RoteiroScene[]>(() => {
    try { return JSON.parse(localStorage.getItem(sessionKey + '_cenas') || 'null') ?? CENAS_PADRAO(); }
    catch { return CENAS_PADRAO(); }
  });

  // Sessão criativa — blocos vindos das bibliotecas
  const [hookDaSessao,     setHookDaSessao]     = useState<Hook | null>(null);
  const [ofertaDaSessao,   setOfertaDaSessao]   = useState<Oferta | null>(null);
  const [templateDaSessao, setTemplateDaSessao] = useState<Template | null>(null);

  // Slot futuro — Copy Intelligence (sem UI por enquanto)
  // const [copyConfig] = useState<CopyConfig>({});

  const [gerado,            setGerado]            = useState(false);
  const [enviado,           setEnviado]           = useState(false);
  const [savedCopy,         setSavedCopy]         = useState(false);
  const [savedRoteiro,      setSavedRoteiro]       = useState(false);
  const [scaffoldAtivo,     setScaffoldAtivo]      = useState<IntelligenceResult | null>(null);

  // Lê sessão criativa.
  // forcar=false (mount): só aplica em campos vazios — não destrói trabalho existente.
  // forcar=true (Reaplicar): sobrescreve campos com o que está na sessão atual.
  const lerSessao = (forcar = false) => {
    try {
      const hookRaw     = localStorage.getItem(BLOCK_KEYS.hook_selected);
      const ofertaRaw   = localStorage.getItem(BLOCK_KEYS.offer_selected);
      const templateRaw = localStorage.getItem(BLOCK_KEYS.template_selected);

      if (hookRaw) {
        const hook: Hook = JSON.parse(hookRaw);
        setHookDaSessao(hook);
        setCopy(prev => (forcar || !prev.hook) ? { ...prev, hook: hook.hook_text } : prev);
      } else {
        setHookDaSessao(null);
      }

      if (ofertaRaw) {
        const oferta: Oferta = JSON.parse(ofertaRaw);
        setOfertaDaSessao(oferta);
        const textoOferta = [oferta.offer_title, oferta.offer_text].filter(Boolean).join(' — ');
        setBriefing(prev => (forcar || !prev.oferta) ? { ...prev, oferta: textoOferta } : prev);
      } else {
        setOfertaDaSessao(null);
      }

      if (templateRaw) {
        const template: Template = JSON.parse(templateRaw);
        setTemplateDaSessao(template);
      } else {
        setTemplateDaSessao(null);
      }
    } catch {
      // Sessão corrompida — ignora silenciosamente
    }
  };

  // Aplica sessão no mount (safe — só preenche campos vazios)
  useEffect(() => {
    lerSessao(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Relê sessão ao voltar para a aba/página — elimina necessidade de clicar "Reaplicar"
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') lerSessao(false); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save da sessão atual
  useEffect(() => { localStorage.setItem(sessionKey + '_briefing', JSON.stringify(briefing)); }, [briefing, sessionKey]);
  useEffect(() => { localStorage.setItem(sessionKey + '_copy',     JSON.stringify(copy));     }, [copy,     sessionKey]);
  useEffect(() => { localStorage.setItem(sessionKey + '_cenas',    JSON.stringify(cenas));    }, [cenas,    sessionKey]);

  // Dismiss individual por bloco
  const dismissHook = () => {
    localStorage.removeItem(BLOCK_KEYS.hook_selected);
    setHookDaSessao(null);
  };

  const dismissOferta = () => {
    localStorage.removeItem(BLOCK_KEYS.offer_selected);
    setOfertaDaSessao(null);
  };

  const dismissTemplate = () => {
    localStorage.removeItem(BLOCK_KEYS.template_selected);
    setTemplateDaSessao(null);
  };

  // Salva o hook atual no Banco de Hooks (source: copy_roteiro, status: draft)
  // Fecha o loop: hook gerado em Copy & Roteiro → disponível em Banco de Hooks para reutilização
  const salvarHook = () => {
    if (!copy.hook.trim()) return;
    const hooks = loadBlocks<any>(BLOCK_KEYS.hooks);
    saveBlocks(BLOCK_KEYS.hooks, [{
      id: gerarId(),
      hook_text: copy.hook.trim(),
      hook_type: hookDaSessao?.hook_type ?? 'curiosidade',
      status: 'draft',
      source: 'copy_roteiro',
      created_at: new Date().toISOString(),
    }, ...hooks]);
  };

  const limparSessao = () => {
    localStorage.removeItem(BLOCK_KEYS.hook_selected);
    localStorage.removeItem(BLOCK_KEYS.offer_selected);
    localStorage.removeItem(BLOCK_KEYS.template_selected);
    setHookDaSessao(null);
    setOfertaDaSessao(null);
    setTemplateDaSessao(null);
  };

  // Gera copy com base no briefing + Copy Intelligence quando há sessão ativa
  const gerarCopyRoteiro = () => {
    const { tipo_video, casa_jogo, oferta } = briefing;
    const base = casa_jogo || 'esse jogo';
    const ofertaTexto = oferta ? ` com ${oferta}` : '';

    if (!copy.hook && !copy.desenvolvimento) {
      // Tenta Copy Intelligence com os blocos da sessão
      const intelligence = getCopyIntelligence(
        hookDaSessao?.hook_type,
        templateDaSessao?.template_type,
        ofertaDaSessao?.offer_type,
      );

      if (intelligence) {
        // Intelligence ativa: scaffold de desenvolvimento + CTA da oferta
        // Hook não é tocado — já veio do Banco de Hooks via sessão
        setCopy(prev => ({
          hook:           prev.hook, // preserva o hook da sessão
          desenvolvimento: intelligence.desenvolvimento,
          cta:            intelligence.cta ?? `Clica no link da bio e começa${ofertaTexto}. Link direto nos stories.`,
        }));
        setScaffoldAtivo(intelligence);
      } else {
        // Fallback: comportamento original sem sessão
        setCopy({
          hook: `Olha o que aconteceu agora em ${base}...`,
          desenvolvimento: tipo_video.toLowerCase().includes('big win') || tipo_video.toLowerCase().includes('saque')
            ? `Esse saque caiu ao vivo e ninguém acreditou. Olha o saldo — isso é real.`
            : `Isso aqui é ${base}. Um dos jogos mais quentes do momento.`,
          cta: `Clica no link da bio e começa${ofertaTexto}. Link direto nos stories.`,
        });
        setScaffoldAtivo(null);
      }
    }

    if (!cenas.some(c => c.description)) {
      setCenas([
        { order: 1, type: 'abertura',    description: `Ator olhando para câmera com expressão de surpresa`, duration: '3s', camera: 'close-up' },
        { order: 2, type: 'produto',     description: `Zoom na tela do ${base}, mostrando o saldo ou gráfico`, duration: '3s', camera: 'tela' },
        { order: 3, type: 'reacao',      description: `Reação do ator ao resultado, gesto de comemoração`, duration: '2s', camera: 'close-up' },
        { order: 4, type: 'cta',         description: `Ator aponta para baixo com texto de CTA na tela`, duration: '2s', camera: 'plano-medio' },
      ]);
    }

    setGerado(true);
  };

  // Limpa o scaffold quando o usuário edita manualmente o desenvolvimento
  const handleSetCopy = (c: CopyData) => {
    if (c.desenvolvimento !== copy.desenvolvimento) setScaffoldAtivo(null);
    setCopy(c);
  };

  // Salva copy no banco
  const salvarCopy = () => {
    if (!copy.hook && !copy.desenvolvimento) return;
    const copies = loadBlocks<any>(BLOCK_KEYS.copies);
    saveBlocks(BLOCK_KEYS.copies, [{
      id: gerarId(),
      title: briefing.tipo_video || briefing.casa_jogo || `Copy ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      hook: copy.hook,
      desenvolvimento: copy.desenvolvimento,
      cta: copy.cta,
      tone: '',
      created_at: new Date().toISOString(),
    }, ...copies]);
    setSavedCopy(true);
    setTimeout(() => setSavedCopy(false), 2500);
  };

  // Salva roteiro no banco
  const salvarRoteiro = () => {
    const roteiros = loadBlocks<any>(BLOCK_KEYS.roteiros);
    saveBlocks(BLOCK_KEYS.roteiros, [{
      id: gerarId(),
      title: briefing.tipo_video || `Roteiro ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      scenes: cenas,
      total_duration: `${cenas.map(c => parseInt(c.duration) || 0).reduce((a, b) => a + b, 0)}s`,
      template_id: templateDaSessao?.id,
      created_at: new Date().toISOString(),
    }, ...roteiros]);
    setSavedRoteiro(true);
    setTimeout(() => setSavedRoteiro(false), 2500);
  };

  // Envia para produção como ProductionItem — fecha o loop Biblioteca → Copy & Roteiro → Produção
  const enviarParaProducao = (line: LineType) => {
    const items = loadItems(todayKey);
    const novo: ProductionItem = {
      id:                gerarId(),
      line_type:         line,
      title:             [briefing.tipo_video, briefing.casa_jogo].filter(Boolean).join(' — ') || 'Criativo sem título',
      status:            'script',
      hook:              copy.hook,
      offer:             briefing.oferta,
      notes:             briefing.observacoes,
      created_at:        new Date().toISOString(),
      copy_desenvolvimento: copy.desenvolvimento,
      copy_cta:          copy.cta,
      roteiro_json:      JSON.stringify(cenas),
      template_id:       templateDaSessao?.id,
    };
    saveItems(todayKey, [novo, ...items]);
    setEnviado(true);
    setTimeout(() => setEnviado(false), 3000);
  };

  const regenerarCopy = () => {
    setCopy(COPY_VAZIA());
    setGerado(false);
    setScaffoldAtivo(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Status de save */}
      {(savedCopy || savedRoteiro) && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {savedCopy    && <Badge label="Copy salva no banco ✓"    color={G.colors.copy} />}
          {savedRoteiro && <Badge label="Roteiro salvo no banco ✓" color={G.colors.secondary} />}
        </div>
      )}

      {/* Banner de sessão ativa */}
      <BannerSessaoAtiva
        hook={hookDaSessao}
        oferta={ofertaDaSessao}
        template={templateDaSessao}
        onDismissHook={dismissHook}
        onDismissOferta={dismissOferta}
        onDismissTemplate={dismissTemplate}
        onLimparTudo={limparSessao}
        onReler={() => lerSessao(true)}
      />

      <BlocoBriefing briefing={briefing} setBriefing={setBriefing} onGerar={gerarCopyRoteiro} gerado={gerado} />
      <BlocoCopy copy={copy} setCopy={handleSetCopy} briefing={briefing} onSalvar={salvarCopy} onRegenerar={regenerarCopy} onSalvarHook={salvarHook} scaffoldAtivo={scaffoldAtivo} />
      <BlocoRoteiro cenas={cenas} setCenas={setCenas} onSalvar={salvarRoteiro} template={templateDaSessao} />
      <BlocoEnviarProducao copy={copy} cenas={cenas} briefing={briefing} template={templateDaSessao} onEnviar={enviarParaProducao} enviado={enviado} />

    </div>
  );
};
