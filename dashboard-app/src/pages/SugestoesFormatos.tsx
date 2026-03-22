import { useState, useMemo } from 'react';
import { Check, Copy, Layers, PlusCircle } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';
import { trends } from '../data/trends';
import type { Template, TemplateType, TemplateLineType } from '../types/creative-blocks';
import {
  loadBlocks, saveBlocks, BLOCK_KEYS, gerarId,
  TEMPLATE_TYPE_LABEL, TEMPLATE_TYPE_COLOR,
  TEMPLATE_LINE_LABEL, TEMPLATE_LINE_COLOR,
} from '../types/creative-blocks';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Sugestao {
  id: string;
  name: string;
  platform: string;
  platformColor: string;
  growth: string;
  growthColor: string;
  format: string;        // descrição do formato
  structure: string;     // sugestão de formato técnico
  hook: string;          // exemplo de hook
  campaignUse: string;   // uso em funil
  lineType: TemplateLineType;
  templateType: TemplateType;
}

// ─── Detecção de metadados ───────────────────────────────────────────────────

function detectarLineType(format: string, structure: string, platform: string): TemplateLineType {
  const t = `${format} ${structure}`.toLowerCase();
  if (/45|60s|screen recording|narração|voz over/.test(t)) return 'L3';
  if (/\b15s\b|corte rápido|dueto|reação genuína/.test(t)) return 'L2';
  if (/\b30s\b|split screen|transição|beat/.test(t)) return 'L1';
  if (platform === 'YouTube Shorts') return 'L3';
  if (platform === 'TikTok') return 'L2';
  return 'L1';
}

function detectarTemplateType(format: string, structure: string): TemplateType {
  const t = `${format} ${structure}`.toLowerCase();
  if (/pov|saldo|sacou/.test(t)) return 'pov_resultado';
  if (/tutorial|como|explicat|split screen/.test(t)) return 'tutorial_curto';
  if (/screen recording|resultado real|narração/.test(t)) return 'prova_social';
  if (/dueto|reação|reacao/.test(t)) return 'gameplay_reacao';
  return 'storytelling';
}

// ─── Dados ────────────────────────────────────────────────────────────────────

const ALL_SUGESTOES: Sugestao[] = trends.map((t, i) => ({
  id: `formato_${i}`,
  name: t.name,
  platform: t.platform,
  platformColor: t.platformColor,
  growth: t.growth,
  growthColor: t.growthColor,
  format: t.format,
  structure: t.suggestedFormat,
  hook: t.hook,
  campaignUse: t.campaignUse,
  lineType: detectarLineType(t.format, t.suggestedFormat, t.platform),
  templateType: detectarTemplateType(t.format, t.suggestedFormat),
}));

const LINE_TYPES: TemplateLineType[] = ['L1', 'L2', 'L3'];
const GROWTH_ORDER: Record<string, number> = { Viral: 0, Explosivo: 1, Crescente: 2, 'Estável Alto': 3 };

// ─── Componente principal ─────────────────────────────────────────────────────

export function SugestoesFormatos() {
  const [filterLine, setFilterLine]   = useState<TemplateLineType | 'all'>('all');
  const [filterGrowth, setFilterGrowth] = useState('all');
  const [savedIds, setSavedIds]       = useState<Set<string>>(new Set());
  const [feedbackId, setFeedbackId]   = useState<string | null>(null);
  const [copiadoId, setCopiadoId]     = useState<string | null>(null);

  const growthValues = useMemo(() => ['all', ...Array.from(new Set(ALL_SUGESTOES.map(s => s.growth)))
    .sort((a, b) => (GROWTH_ORDER[a] ?? 9) - (GROWTH_ORDER[b] ?? 9))], []);

  const filtered = useMemo(() => {
    return ALL_SUGESTOES.filter(s => {
      if (filterLine !== 'all' && s.lineType !== filterLine) return false;
      if (filterGrowth !== 'all' && s.growth !== filterGrowth) return false;
      return true;
    }).sort((a, b) => (GROWTH_ORDER[a.growth] ?? 9) - (GROWTH_ORDER[b.growth] ?? 9));
  }, [filterLine, filterGrowth]);

  function criarTemplate(s: Sugestao) {
    if (savedIds.has(s.id)) return;
    const templates = loadBlocks<Template>(BLOCK_KEYS.templates);
    const novo: Template = {
      id: gerarId(),
      title: s.name,
      template_type: s.templateType,
      line_type: s.lineType,
      structure: s.structure,
      notes: `Hook sugerido: "${s.hook}"\n\nUso de campanha: ${s.campaignUse}`,
      status: 'draft',
      source: 'radar',
      created_at: new Date().toISOString(),
    };
    saveBlocks(BLOCK_KEYS.templates, [...templates, novo]);
    setSavedIds(prev => new Set([...prev, s.id]));
    setFeedbackId(s.id);
    setTimeout(() => setFeedbackId(null), 1500);
  }

  function copiarEstrutura(s: Sugestao) {
    const text = `${s.name}\n\nEstrutura: ${s.structure}\nHook exemplo: ${s.hook}\n\nPlatforma: ${s.platform}\nLinha: ${TEMPLATE_LINE_LABEL[s.lineType]}`;
    navigator.clipboard.writeText(text);
    setCopiadoId(s.id);
    setTimeout(() => setCopiadoId(null), 1400);
  }

  const stats = [
    { label: 'Formatos Disponíveis', value: ALL_SUGESTOES.length, color: G.colors.primary },
    { label: 'Templates Criados',    value: savedIds.size,        color: G.colors.success },
    { label: 'Viralidade Alta',      value: ALL_SUGESTOES.filter(s => s.growth === 'Viral' || s.growth === 'Explosivo').length, color: G.colors.danger },
    { label: 'Filtrados',            value: filtered.length,      color: G.colors.warning },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        {stats.map(s => (
          <GlassCard key={s.label} style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Filtros */}
      <GlassCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Linha de produção */}
          <div>
            <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '1px', marginBottom: '6px' }}>LINHA DE PRODUÇÃO</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" onClick={() => setFilterLine('all')} style={{ padding: '5px 12px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', background: filterLine === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)', color: filterLine === 'all' ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}>
                Todas
              </button>
              {LINE_TYPES.map(l => (
                <button key={l} type="button" onClick={() => setFilterLine(l)} style={{ padding: '5px 12px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', background: filterLine === l ? TEMPLATE_LINE_COLOR[l] : 'rgba(255,255,255,0.06)', color: filterLine === l ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}>
                  {TEMPLATE_LINE_LABEL[l]}
                </button>
              ))}
            </div>
          </div>

          {/* Crescimento */}
          <div>
            <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '1px', marginBottom: '6px' }}>CRESCIMENTO</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {growthValues.map(g => (
                <button key={g} type="button" onClick={() => setFilterGrowth(g)} style={{ padding: '5px 10px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', background: filterGrowth === g ? G.colors.warning : 'rgba(255,255,255,0.06)', color: filterGrowth === g ? '#000' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}>
                  {g === 'all' ? 'Todos' : g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Contador */}
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {filtered.length} formato{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '14px' }}>
        {filtered.map(s => (
          <GlassCard key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} color={TEMPLATE_TYPE_COLOR[s.templateType]} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: TEMPLATE_TYPE_COLOR[s.templateType] }}>{s.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Badge label={s.growth} color={s.growthColor} />
                <Badge label={TEMPLATE_LINE_LABEL[s.lineType]} color={TEMPLATE_LINE_COLOR[s.lineType]} />
              </div>
            </div>

            {/* Plataforma */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.platformColor }} />
              <span style={{ fontSize: '11px', color: s.platformColor, fontWeight: '600' }}>{s.platform}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px' }}>· {TEMPLATE_TYPE_LABEL[s.templateType]}</span>
            </div>

            {/* Estrutura */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 12px', borderLeft: `3px solid ${TEMPLATE_LINE_COLOR[s.lineType]}` }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>ESTRUTURA</div>
              <div style={{ fontSize: '12px', color: '#fff', lineHeight: '1.5' }}>{s.structure}</div>
            </div>

            {/* Hook exemplo */}
            <div>
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '1px', marginBottom: '3px' }}>HOOK EXEMPLO</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', lineHeight: '1.4' }}>"{s.hook}"</div>
            </div>

            {/* Funil */}
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
              {s.campaignUse}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => criarTemplate(s)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', borderRadius: '8px', border: 'none', cursor: savedIds.has(s.id) ? 'default' : 'pointer', background: savedIds.has(s.id) ? 'rgba(50,215,75,0.12)' : 'rgba(10,132,255,0.12)', color: savedIds.has(s.id) ? '#32D74B' : G.colors.primary, fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
              >
                {feedbackId === s.id ? <Check size={13} /> : <PlusCircle size={13} />}
                {feedbackId === s.id ? 'Criado!' : savedIds.has(s.id) ? 'Template Criado' : 'Criar Template'}
              </button>
              <button
                type="button"
                onClick={() => copiarEstrutura(s)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copiadoId === s.id ? 'rgba(50,215,75,0.12)' : 'rgba(255,255,255,0.06)', color: copiadoId === s.id ? '#32D74B' : 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
              >
                {copiadoId === s.id ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
