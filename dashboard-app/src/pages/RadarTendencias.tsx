import { useState } from 'react';
import { TrendingUp, Flame, Target, Radio, FileText, Megaphone, Sparkles, CircleDashed, Activity, Check } from 'lucide-react';
import { G, GlassCard, Badge, Btn } from '../design-system';
import { trends, type Trend } from '../data/trends';
import type { Hook, Template } from '../types/creative-blocks';
import { loadBlocks, saveBlocks, BLOCK_KEYS, gerarId } from '../types/creative-blocks';

const TrendCard = ({ trend }: { trend: Trend }) => {
  const [expanded, setExpanded]   = useState(false);
  const [hookSalvo, setHookSalvo] = useState(false);
  const [tmplSalvo, setTmplSalvo] = useState(false);
  const PIcon = trend.platformIcon;

  function salvarHook() {
    if (hookSalvo) return;
    const hooks = loadBlocks<Hook>(BLOCK_KEYS.hooks);
    const novo: Hook = {
      id: gerarId(),
      hook_text: trend.hook,
      hook_type: 'curiosidade',
      status: 'draft',
      source: 'radar',
      created_at: new Date().toISOString(),
    };
    saveBlocks(BLOCK_KEYS.hooks, [novo, ...hooks]);
    setHookSalvo(true);
  }

  function salvarTemplate() {
    if (tmplSalvo) return;
    const templates = loadBlocks<Template>(BLOCK_KEYS.templates);
    const novo: Template = {
      id: gerarId(),
      title: `${trend.name} — Radar`,
      template_type: 'prova_social',
      line_type: trend.platform === 'YouTube Shorts' ? 'L3' : trend.platform === 'TikTok' ? 'L2' : 'L1',
      structure: trend.suggestedFormat,
      notes: `${trend.adaptation} | Funil: ${trend.campaignUse}`,
      status: 'draft',
      source: 'radar',
      created_at: new Date().toISOString(),
    };
    saveBlocks(BLOCK_KEYS.templates, [novo, ...templates]);
    setTmplSalvo(true);
  }

  return (
    <GlassCard style={{ padding: '20px', border: `1px solid ${trend.platformColor}25` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <PIcon size={16} color={trend.platformColor} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: trend.platformColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {trend.platform}
            </span>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{trend.name}</h3>
          <Badge label={`📈 ${trend.growth}`} color={trend.growthColor} />
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${trend.platformColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Flame size={22} color={trend.platformColor} />
        </div>
      </div>

      {/* Format */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>FORMATO</div>
        <p style={{ fontSize: '13px', lineHeight: '1.5' }}>{trend.format}</p>
      </div>

      {/* iGaming Adaptation */}
      <div style={{ background: `${G.colors.secondary}08`, border: `1px solid ${G.colors.secondary}20`, borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: G.colors.secondary, fontWeight: '700', marginBottom: '4px' }}>🎰 ADAPTAÇÃO iGAMING</div>
        <p style={{ fontSize: '13px', lineHeight: '1.5' }}>{trend.adaptation}</p>
      </div>

      {/* Expandable */}
      {expanded && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
          <div style={{ background: `${G.colors.primary}08`, border: `1px solid ${G.colors.primary}20`, borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: G.colors.primary, fontWeight: '700', marginBottom: '4px' }}>🎣 HOOK SUGERIDO</div>
            <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#fff' }}>"{trend.hook}"</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '4px' }}>📐 FORMATO SUGERIDO</div>
            <p style={{ fontSize: '13px' }}>{trend.suggestedFormat}</p>
          </div>
          <div style={{ background: `${G.colors.success}08`, border: `1px solid ${G.colors.success}20`, borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: G.colors.success, fontWeight: '700', marginBottom: '4px' }}>🎯 USO EM CAMPANHA</div>
            <p style={{ fontSize: '13px' }}>{trend.campaignUse}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Btn icon={expanded ? CircleDashed : Sparkles} label={expanded ? 'Recolher' : 'Ver Detalhes'} variant="dark" small onClick={() => setExpanded(!expanded)} />
        <Btn icon={hookSalvo ? Check : FileText} label={hookSalvo ? 'Hook Salvo' : 'Salvar Hook'} variant="primary" small onClick={salvarHook} />
        <Btn icon={tmplSalvo ? Check : Megaphone} label={tmplSalvo ? 'Template Criado' : 'Criar Template'} variant="purple" small onClick={salvarTemplate} />
      </div>
    </GlassCard>
  );
};

export const RadarTendencias = () => {
  const [filter, setFilter] = useState('Todos');
  const platforms = ['Todos', 'TikTok', 'Instagram Reels', 'YouTube Shorts'];
  const filtered = filter === 'Todos' ? trends : trends.filter(t => t.platform === filter);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Agent Banner */}
      <GlassCard style={{ background: 'linear-gradient(135deg, rgba(10,132,255,0.15), rgba(191,90,242,0.15))', border: '1px solid rgba(10,132,255,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg,#0A84FF,#BF5AF2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: G.colors.primary, fontWeight: '700', marginBottom: '4px', letterSpacing: '1px' }}>AGENTE ATIVO</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Trend Hunter Agent</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Monitorando TikTok · Instagram · YouTube em tempo real</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(50,215,75,0.1)', border: '1px solid rgba(50,215,75,0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: G.colors.success, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={12} /> Ativo
            </div>
            <Btn icon={Radio} label="Atualizar Radar" variant="primary" small />
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Tendências Detectadas', value: '6', color: G.colors.primary, icon: TrendingUp },
          { label: 'Formatos Virais', value: '4', color: G.colors.secondary, icon: Flame },
          { label: 'Oportunidades iGaming', value: '6', color: G.colors.success, icon: Target },
        ].map(s => (
          <GlassCard key={s.label} style={{ textAlign: 'center', padding: '20px' }}>
            <s.icon size={28} color={s.color} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {platforms.map(p => (
          <button key={p} onClick={() => setFilter(p)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: filter === p ? G.colors.primary : 'rgba(255,255,255,0.08)',
            color: filter === p ? '#fff' : 'var(--text-secondary)',
            fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
          }}>
            {p}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filtered.map((t, i) => <TrendCard key={i} trend={t} />)}
      </div>
    </div>
  );
};
