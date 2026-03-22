import { useState, useMemo } from 'react';
import { Search, Check, Copy, BookmarkPlus } from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';
import { tierAlto, tierMedio } from '../data/competitors';
import { trends } from '../data/trends';
import type { Hook, HookType } from '../types/creative-blocks';
import { loadBlocks, saveBlocks, BLOCK_KEYS, gerarId } from '../types/creative-blocks';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Anuncio {
  id: string;
  brand: string;
  brandColor: string;
  tier: 'alto' | 'médio';
  platform: string;
  platformColor: string;
  adType: string;
  hook: string;
  format: string;
  campaignUse: string;
  hookType: HookType;
}

// ─── Geração de dados ─────────────────────────────────────────────────────────

function mapPlatform(adType: string): { platform: string; platformColor: string } {
  if (/TikTok/.test(adType))   return { platform: 'TikTok',   platformColor: '#FF0050' };
  if (/YouTube/.test(adType))  return { platform: 'YouTube',  platformColor: '#FF0000' };
  if (/Twitch/.test(adType))   return { platform: 'Twitch',   platformColor: '#9147FF' };
  if (/Facebook/.test(adType)) return { platform: 'Facebook', platformColor: '#1877F2' };
  if (/TV/.test(adType))       return { platform: 'TV',       platformColor: '#666' };
  if (/Google|Search|Display/.test(adType)) return { platform: 'Google', platformColor: '#4285F4' };
  return { platform: 'Instagram', platformColor: '#E1306C' };
}

function detectarHookType(text: string): HookType {
  const h = text.toLowerCase();
  if (/bônus|grátis|giros|cashback|saque|pix|deposit/i.test(h)) return 'prova';
  if (/ao vivo|live|torneio|absurdo|exclusivo/i.test(h)) return 'choque';
  if (/como|aprenda|funciona|dica/i.test(h)) return 'tutorial';
  if (/acesse|clica|vem|olha|abri/i.test(h)) return 'cta_abertura';
  return 'curiosidade';
}

function gerarAnuncios(): Anuncio[] {
  const all = [...tierAlto, ...tierMedio];
  const list: Anuncio[] = [];
  all.forEach((comp, ci) => {
    comp.hooks.forEach((hookText, hi) => {
      const trend = trends[(ci * 2 + hi) % trends.length];
      const adType = comp.adTypes[hi % comp.adTypes.length];
      const { platform, platformColor } = mapPlatform(adType);
      list.push({
        id: `anuncio_${ci}_${hi}`,
        brand: comp.name,
        brandColor: comp.color,
        tier: comp.tier,
        platform,
        platformColor,
        adType,
        hook: hookText,
        format: trend.suggestedFormat,
        campaignUse: trend.campaignUse,
        hookType: detectarHookType(hookText),
      });
    });
  });
  return list;
}

const ALL_ANUNCIOS = gerarAnuncios();

const PLATAFORMAS = ['Todas', ...Array.from(new Set(ALL_ANUNCIOS.map(a => a.platform)))];

// ─── Componente principal ─────────────────────────────────────────────────────

export function BibliotecaAnuncios() {
  const [search, setSearch]             = useState('');
  const [filterTier, setFilterTier]     = useState<'all' | 'alto' | 'médio'>('all');
  const [filterPlat, setFilterPlat]     = useState('Todas');
  const [salvoIds, setSalvoIds]         = useState<Set<string>>(new Set());
  const [feedbackId, setFeedbackId]     = useState<string | null>(null);
  const [copiadoId, setCopiadoId]       = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_ANUNCIOS.filter(a => {
      if (filterTier !== 'all' && a.tier !== filterTier) return false;
      if (filterPlat !== 'Todas' && a.platform !== filterPlat) return false;
      if (q && !a.hook.toLowerCase().includes(q) && !a.brand.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, filterTier, filterPlat]);

  function salvarHook(a: Anuncio) {
    if (salvoIds.has(a.id)) return;
    const hooks = loadBlocks<Hook>(BLOCK_KEYS.hooks);
    const novo: Hook = {
      id: gerarId(),
      hook_text: a.hook,
      hook_type: a.hookType,
      status: 'draft',
      source: 'radar',
      created_at: new Date().toISOString(),
    };
    saveBlocks(BLOCK_KEYS.hooks, [...hooks, novo]);
    setSalvoIds(prev => new Set([...prev, a.id]));
    setFeedbackId(a.id);
    setTimeout(() => setFeedbackId(null), 1500);
  }

  function copiarHook(a: Anuncio) {
    navigator.clipboard.writeText(a.hook);
    setCopiadoId(a.id);
    setTimeout(() => setCopiadoId(null), 1400);
  }

  const stats = [
    { label: 'Total de Anúncios', value: ALL_ANUNCIOS.length, color: G.colors.warning },
    { label: 'Tier Alto',         value: ALL_ANUNCIOS.filter(a => a.tier === 'alto').length, color: G.colors.danger },
    { label: 'Tier Médio',        value: ALL_ANUNCIOS.filter(a => a.tier === 'médio').length, color: G.colors.primary },
    { label: 'Hooks Salvos',      value: salvoIds.size, color: G.colors.success },
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
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Busca */}
          <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar hook ou marca..."
              style={{ width: '100%', paddingLeft: '30px', paddingRight: '10px', paddingTop: '8px', paddingBottom: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Tier */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'alto', 'médio'] as const).map(t => (
              <button key={t} type="button" onClick={() => setFilterTier(t)} style={{ padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', background: filterTier === t ? G.colors.warning : 'rgba(255,255,255,0.08)', color: filterTier === t ? '#000' : 'rgba(255,255,255,0.55)', transition: 'all 0.2s' }}>
                {t === 'all' ? 'Todos' : `Tier ${t.charAt(0).toUpperCase() + t.slice(1)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Plataformas */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
          {PLATAFORMAS.map(p => (
            <button key={p} type="button" onClick={() => setFilterPlat(p)} style={{ padding: '4px 10px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', background: filterPlat === p ? G.colors.primary : 'rgba(255,255,255,0.06)', color: filterPlat === p ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}>
              {p}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Contador */}
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {filtered.length} anúncio{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Grid de cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '14px' }}>
        {filtered.map(a => (
          <GlassCard key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.brandColor, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: a.brandColor }}>{a.brand}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Badge label={a.platform} color={a.platformColor} />
                <Badge label={`Tier ${a.tier.charAt(0).toUpperCase() + a.tier.slice(1)}`} color={a.tier === 'alto' ? G.colors.danger : G.colors.primary} />
              </div>
            </div>

            {/* Hook */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 12px', borderLeft: `3px solid ${G.colors.warning}` }}>
              <div style={{ fontSize: '9px', color: G.colors.warning, fontWeight: '700', letterSpacing: '1px', marginBottom: '5px' }}>HOOK DETECTADO</div>
              <div style={{ fontSize: '13px', lineHeight: '1.5' }}>{a.hook}</div>
            </div>

            {/* Formato */}
            <div>
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '1px', marginBottom: '3px' }}>FORMATO</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.4' }}>{a.format}</div>
            </div>

            {/* Meta */}
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
              {a.adType} · {a.campaignUse}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => salvarHook(a)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', borderRadius: '8px', border: 'none', cursor: salvoIds.has(a.id) ? 'default' : 'pointer', background: salvoIds.has(a.id) ? 'rgba(50,215,75,0.12)' : 'rgba(255,149,0,0.12)', color: salvoIds.has(a.id) ? '#32D74B' : G.colors.warning, fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
              >
                {feedbackId === a.id ? <Check size={13} /> : <BookmarkPlus size={13} />}
                {feedbackId === a.id ? 'Salvo!' : salvoIds.has(a.id) ? 'Hook no Banco' : 'Salvar Hook'}
              </button>
              <button
                type="button"
                onClick={() => copiarHook(a)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: copiadoId === a.id ? 'rgba(50,215,75,0.12)' : 'rgba(255,255,255,0.06)', color: copiadoId === a.id ? '#32D74B' : 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' }}
              >
                {copiadoId === a.id ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
