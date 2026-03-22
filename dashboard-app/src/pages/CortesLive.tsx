import { useState, useEffect, useRef } from 'react';
import {
  Scissors, Plus, X, Upload, Film, Check, ChevronDown, ChevronUp,
  Play, Pause, Type, Image, Zap, Settings2, Download, AlertCircle,
} from 'lucide-react';
import { G, GlassCard, Badge } from '../design-system';
import {
  type ProductionItem, LINE_CONFIG, STATUS_DISPLAY,
  isConcluido, proximoStatus, getTodayKey, gerarId, loadItems, saveItems,
} from '../types/production';

// ─── tipos ───────────────────────────────────────────────────────────────────

type WatermarkPos =
  'top-left' | 'top-center' | 'top-right' |
  'mid-left' | 'mid-center' | 'mid-right' |
  'bot-left' | 'bot-center' | 'bot-right';

interface ClipSettings {
  trimStart: string;
  trimEnd: string;
  // Legendas
  legendas: boolean;
  legendaPos: 'top' | 'middle' | 'bottom';
  legendaFont: string;
  legendaTamanho: 'P' | 'M' | 'G';
  legendaCor: string;
  legendaEstilo: 'sombra' | 'caixa' | 'contorno';
  // Marca d'água
  marcaDagua: boolean;
  marcaPreset: 'nenhum' | 'mais18' | 'custom';
  marcaPos: WatermarkPos;
  marcaOpacidade: number;
  marcaTamanho: number;
  marcaLogoUrl: string;
  // Sobreposições
  hookText: string;
  ctaText: string;
}

function defaultSettings(trimStart = '', trimEnd = ''): ClipSettings {
  return {
    trimStart, trimEnd,
    legendas: true,
    legendaPos: 'bottom',
    legendaFont: 'Inter',
    legendaTamanho: 'M',
    legendaCor: '#FFFFFF',
    legendaEstilo: 'sombra',
    marcaDagua: true,
    marcaPreset: 'mais18',
    marcaPos: 'top-right',
    marcaOpacidade: 85,
    marcaTamanho: 60,
    marcaLogoUrl: '',
    hookText: '',
    ctaText: '',
  };
}

const META_DIARIA = LINE_CONFIG.L2.meta;
const videoUrls = new Map<string, string>();
const clipSettingsMap = new Map<string, ClipSettings>();

// ─── helpers visuais ─────────────────────────────────────────────────────────

const FONTS = ['Inter', 'Impact', 'Arial Black', 'Bebas Neue', 'Montserrat'];
const CORES_LEGENDA = [
  { nome: 'Branco', cor: '#FFFFFF' },
  { nome: 'Amarelo', cor: '#FFD60A' },
  { nome: 'Laranja', cor: '#FF9500' },
  { nome: 'Rosa', cor: '#FF2D55' },
  { nome: 'Azul', cor: '#0A84FF' },
];
const POS_GRID: WatermarkPos[] = [
  'top-left','top-center','top-right',
  'mid-left','mid-center','mid-right',
  'bot-left','bot-center','bot-right',
];

function Secao({ title, icon: Icon, color, children, defaultOpen = false }: {
  title: string; icon: any; color: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0',
          color: '#fff',
        }}
      >
        <Icon size={14} color={color} />
        <span style={{ flex: 1, textAlign: 'left', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>{title}</span>
        {open ? <ChevronUp size={13} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={13} color="rgba(255,255,255,0.3)" />}
      </button>
      {open && <div style={{ paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>{children}</div>}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!on)}
        style={{
          width: '40px', height: '22px', borderRadius: '11px', border: 'none',
          background: on ? G.colors.success : 'rgba(255,255,255,0.15)',
          cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: '3px',
          left: on ? '20px' : '3px',
          width: '16px', height: '16px', borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}

function OpRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', marginBottom: '6px' }}>{label}</div>
      {children}
    </div>
  );
}

function ChipGroup<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          style={{
            padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
            fontSize: '11px', fontWeight: '700',
            background: value === o.value ? G.colors.primary : 'rgba(255,255,255,0.08)',
            color: value === o.value ? '#fff' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.15s',
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

// ─── painel de edição ─────────────────────────────────────────────────────────

function EditorPanel({ videoUrl, settings, onChange, onGerar, gerando }: {
  videoUrl: string | undefined;
  settings: ClipSettings;
  onChange: (s: Partial<ClipSettings>) => void;
  onGerar: () => void;
  gerando: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [simulado, setSimulado] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  };

  const handleGerar = async () => {
    onGerar();
    await new Promise(r => setTimeout(r, 2200));
    setSimulado(true);
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    onChange({ marcaPreset: 'custom', marcaLogoUrl: url });
    e.target.value = '';
  };

  if (simulado) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 16px',
          background: `${G.colors.success}20`, border: `2px solid ${G.colors.success}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={32} color={G.colors.success} />
        </div>
        <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Corte gerado!</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
          Configurações aplicadas — legenda {settings.legendas ? 'ativa' : 'desativada'} ·
          {settings.marcaDagua ? ` marca d'água ${settings.marcaPreset === 'mais18' ? '+18' : 'custom'}` : ' sem marca d\'água'}
        </div>
        <Badge label="MODO SIMULAÇÃO" color={G.colors.warning} />
        <div style={{ marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => setSimulado(false)}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px',
              padding: '8px 16px', cursor: 'pointer', color: '#fff', fontSize: '12px', fontWeight: '600',
            }}
          >Editar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Player */}
      {videoUrl && (
        <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
          <video
            ref={videoRef}
            src={videoUrl}
            style={{ width: '100%', maxHeight: '200px', display: 'block' }}
            onEnded={() => setPlaying(false)}
          />
          <button
            type="button"
            onClick={togglePlay}
            style={{
              position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Watermark preview */}
          {settings.marcaDagua && (
            <div style={{
              position: 'absolute',
              top: settings.marcaPos.startsWith('top') ? '8px' : settings.marcaPos.startsWith('mid') ? '50%' : undefined,
              bottom: settings.marcaPos.startsWith('bot') ? '44px' : undefined,
              left: settings.marcaPos.endsWith('left') ? '8px' : settings.marcaPos.endsWith('center') ? '50%' : undefined,
              right: settings.marcaPos.endsWith('right') ? '8px' : undefined,
              transform: settings.marcaPos.endsWith('center') || settings.marcaPos.startsWith('mid') ? 'translate(-50%,-50%)' : undefined,
              opacity: settings.marcaOpacidade / 100,
              fontSize: `${Math.round(settings.marcaTamanho * 0.1)}px`,
              fontWeight: '900',
              color: '#fff',
              background: 'rgba(0,0,0,0.5)',
              padding: '3px 8px',
              borderRadius: '6px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}>
              {settings.marcaPreset === 'mais18' ? '+18' :
               settings.marcaPreset === 'custom' && settings.marcaLogoUrl ? (
                <img src={settings.marcaLogoUrl} alt="" style={{ height: `${settings.marcaTamanho * 0.3}px` }} />
               ) : 'LOGO'}
            </div>
          )}

          {/* Caption preview */}
          {settings.legendas && (
            <div style={{
              position: 'absolute',
              top: settings.legendaPos === 'top' ? '8px' : settings.legendaPos === 'middle' ? '50%' : undefined,
              bottom: settings.legendaPos === 'bottom' ? '44px' : undefined,
              left: '50%', transform: 'translateX(-50%)',
              fontSize: settings.legendaTamanho === 'P' ? '10px' : settings.legendaTamanho === 'M' ? '12px' : '15px',
              fontFamily: settings.legendaFont,
              fontWeight: '700',
              color: settings.legendaCor,
              background: settings.legendaEstilo === 'caixa' ? 'rgba(0,0,0,0.8)' : 'transparent',
              textShadow: settings.legendaEstilo === 'sombra' ? '0 1px 4px rgba(0,0,0,0.9)' : undefined,
              WebkitTextStroke: settings.legendaEstilo === 'contorno' ? '0.5px #000' : undefined,
              padding: '2px 6px', borderRadius: '4px',
              pointerEvents: 'none', whiteSpace: 'nowrap',
            }}>
              Prévia da legenda
            </div>
          )}
        </div>
      )}

      {/* Recorte */}
      <Secao title="RECORTE" icon={Scissors} color={G.colors.copy} defaultOpen>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <OpRow label="INÍCIO">
            <input value={settings.trimStart} onChange={e => onChange({ trimStart: e.target.value })}
              placeholder="00:00:00" style={iStyle} />
          </OpRow>
          <OpRow label="FIM">
            <input value={settings.trimEnd} onChange={e => onChange({ trimEnd: e.target.value })}
              placeholder="00:01:00" style={iStyle} />
          </OpRow>
        </div>
      </Secao>

      {/* Legendas */}
      <Secao title="LEGENDAS" icon={Type} color={G.colors.primary} defaultOpen>
        <Toggle on={settings.legendas} onChange={v => onChange({ legendas: v })} label="Ativar legendas" />
        {settings.legendas && (
          <>
            <OpRow label="POSIÇÃO">
              <ChipGroup
                value={settings.legendaPos}
                onChange={v => onChange({ legendaPos: v })}
                options={[
                  { label: 'Topo', value: 'top' },
                  { label: 'Meio', value: 'middle' },
                  { label: 'Baixo', value: 'bottom' },
                ]}
              />
            </OpRow>
            <OpRow label="FONTE">
              <select
                value={settings.legendaFont}
                onChange={e => onChange({ legendaFont: e.target.value })}
                style={{ ...iStyle, cursor: 'pointer' }}
              >
                {FONTS.map(f => <option key={f} value={f} style={{ background: '#1c1c1e' }}>{f}</option>)}
              </select>
            </OpRow>
            <OpRow label="TAMANHO">
              <ChipGroup
                value={settings.legendaTamanho}
                onChange={v => onChange({ legendaTamanho: v })}
                options={[
                  { label: 'Pequeno', value: 'P' },
                  { label: 'Médio', value: 'M' },
                  { label: 'Grande', value: 'G' },
                ]}
              />
            </OpRow>
            <OpRow label="COR DO TEXTO">
              <div style={{ display: 'flex', gap: '8px' }}>
                {CORES_LEGENDA.map(c => (
                  <button
                    key={c.cor}
                    type="button"
                    onClick={() => onChange({ legendaCor: c.cor })}
                    title={c.nome}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: c.cor,
                      boxShadow: settings.legendaCor === c.cor ? `0 0 0 2px #fff, 0 0 0 4px ${G.colors.primary}` : 'none',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={settings.legendaCor}
                  onChange={e => onChange({ legendaCor: e.target.value })}
                  title="Cor personalizada"
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: 'none' }}
                />
              </div>
            </OpRow>
            <OpRow label="ESTILO">
              <ChipGroup
                value={settings.legendaEstilo}
                onChange={v => onChange({ legendaEstilo: v })}
                options={[
                  { label: 'Sombra', value: 'sombra' },
                  { label: 'Caixa', value: 'caixa' },
                  { label: 'Contorno', value: 'contorno' },
                ]}
              />
            </OpRow>
          </>
        )}
      </Secao>

      {/* Marca d'água */}
      <Secao title="MARCA D'ÁGUA" icon={Image} color={G.colors.warning} defaultOpen>
        <Toggle on={settings.marcaDagua} onChange={v => onChange({ marcaDagua: v })} label="Ativar marca d'água" />
        {settings.marcaDagua && (
          <>
            <OpRow label="TIPO">
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: '+18', value: 'mais18' as const },
                  { label: 'Personalizado', value: 'custom' as const },
                  { label: 'Nenhum', value: 'nenhum' as const },
                ].map(o => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => { onChange({ marcaPreset: o.value }); if (o.value === 'custom') logoInputRef.current?.click(); }}
                    style={{
                      padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      fontSize: '11px', fontWeight: '700',
                      background: settings.marcaPreset === o.value ? G.colors.warning : 'rgba(255,255,255,0.08)',
                      color: settings.marcaPreset === o.value ? '#000' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.15s',
                    }}
                  >{o.label}</button>
                ))}
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
              {settings.marcaPreset === 'custom' && settings.marcaLogoUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <img src={settings.marcaLogoUrl} alt="logo" style={{ height: '28px', borderRadius: '4px' }} />
                  <button type="button" onClick={() => logoInputRef.current?.click()}
                    style={{ fontSize: '11px', color: G.colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                    Trocar logo
                  </button>
                </div>
              )}
            </OpRow>

            <OpRow label="POSIÇÃO">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', width: '96px' }}>
                {POS_GRID.map(pos => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => onChange({ marcaPos: pos })}
                    style={{
                      width: '28px', height: '28px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                      background: settings.marcaPos === pos ? G.colors.warning : 'rgba(255,255,255,0.08)',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </OpRow>

            <OpRow label={`OPACIDADE — ${settings.marcaOpacidade}%`}>
              <input
                type="range" min={20} max={100} value={settings.marcaOpacidade}
                onChange={e => onChange({ marcaOpacidade: Number(e.target.value) })}
                style={{ width: '100%', accentColor: G.colors.warning }}
              />
            </OpRow>

            <OpRow label={`TAMANHO — ${settings.marcaTamanho}%`}>
              <input
                type="range" min={20} max={120} value={settings.marcaTamanho}
                onChange={e => onChange({ marcaTamanho: Number(e.target.value) })}
                style={{ width: '100%', accentColor: G.colors.warning }}
              />
            </OpRow>
          </>
        )}
      </Secao>

      {/* Hook e CTA */}
      <Secao title="HOOK & CTA" icon={Zap} color={G.colors.secondary}>
        <OpRow label="HOOK (primeiros 3s)">
          <input
            value={settings.hookText}
            onChange={e => onChange({ hookText: e.target.value })}
            placeholder="Ex: Você não vai acreditar..."
            style={iStyle}
          />
        </OpRow>
        <OpRow label="CTA (últimos 4s)">
          <input
            value={settings.ctaText}
            onChange={e => onChange({ ctaText: e.target.value })}
            placeholder="Ex: Acessa BINGOBET agora!"
            style={iStyle}
          />
        </OpRow>
      </Secao>

      {/* Gerar */}
      <div style={{ paddingTop: '16px' }}>
        <button
          type="button"
          onClick={handleGerar}
          disabled={gerando}
          style={{
            width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
            background: gerando ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #FF9500, #FF2D55)',
            color: '#fff', fontSize: '14px', fontWeight: '800', cursor: gerando ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          {gerando
            ? <><Settings2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Gerando...</>
            : <><Download size={16} /> Gerar Corte</>}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── página principal ─────────────────────────────────────────────────────────

export const CortesLive = () => {
  const todayKey = getTodayKey();
  const [allItems, setAllItems] = useState<ProductionItem[]>(() => loadItems(todayKey));
  const cortes = allItems.filter(i => i.line_type === 'L2');

  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'ok' | 'erro'>('idle');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, ClipSettings>>({});
  const [gerando, setGerando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { saveItems(todayKey, allItems); }, [allItems, todayKey]);

  const handleVideoFile = (file: File) => {
    const ok = file.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(file.name);
    if (!ok) return;
    setVideoFile(file);
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) handleVideoFile(f);
  };

  const adicionarCorte = () => {
    if (!title.trim() && !videoFile) {
      setFeedback('erro'); setTimeout(() => setFeedback('idle'), 2000); return;
    }
    const id = gerarId();
    if (videoFile) videoUrls.set(id, URL.createObjectURL(videoFile));
    clipSettingsMap.set(id, defaultSettings());

    const nome = title.trim() || videoFile?.name.replace(/\.[^.]+$/, '') || 'Corte';
    const novo: ProductionItem = {
      id, line_type: 'L2', title: nome, status: 'pending',
      hook: '', offer: '',
      notes: videoFile ? `📹 ${videoFile.name}` : '',
      created_at: new Date().toISOString(),
      timestamp_start: '', timestamp_end: '',
    };
    setAllItems(prev => [novo, ...prev]);
    setSettings(prev => ({ ...prev, [id]: defaultSettings() }));
    setTitle(''); setVideoFile(null);
    setFeedback('ok'); setTimeout(() => setFeedback('idle'), 2000);
    setEditandoId(id);
  };

  const removerCorte = (id: string) => {
    const url = videoUrls.get(id);
    if (url) { URL.revokeObjectURL(url); videoUrls.delete(id); }
    clipSettingsMap.delete(id);
    setAllItems(prev => prev.filter(i => i.id !== id));
    if (editandoId === id) setEditandoId(null);
  };

  const avancarStatus = (id: string) => {
    setAllItems(prev => prev.map(i =>
      i.id === id ? { ...i, status: proximoStatus(i.status, 'L2') } : i
    ));
  };

  const updateSettings = (id: string, patch: Partial<ClipSettings>) => {
    setSettings(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const finalizados = cortes.filter(i => isConcluido(i.status)).length;
  const progresso = Math.min(Math.round((finalizados / META_DIARIA) * 100), 100);
  const metaBatida = finalizados >= META_DIARIA;

  const editandoCorte = cortes.find(c => c.id === editandoId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header progresso */}
      <GlassCard style={{ padding: '20px 24px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '200px', height: '100%',
          background: metaBatida ? `linear-gradient(135deg,${G.colors.success}08,${G.colors.success}20)` : `linear-gradient(135deg,${G.colors.copy}08,${G.colors.copy}20)`,
          borderRadius: '0 20px 20px 0',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '3px' }}>LINHA 2 — CORTES DE LIVE</div>
            <div style={{ fontSize: '22px', fontWeight: '800' }}>
              {finalizados} <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>/ {META_DIARIA} cortes</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {[
              { label: 'Na fila', n: cortes.filter(i => i.status === 'pending').length, c: 'rgba(255,255,255,0.3)' },
              { label: 'Editando', n: cortes.filter(i => i.status === 'editing').length, c: G.colors.warning },
              { label: 'Prontos', n: finalizados, c: G.colors.success },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: s.c }}>{s.n}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '5px', overflow: 'hidden' }}>
          <div style={{
            width: `${progresso}%`, height: '100%', borderRadius: '6px',
            background: metaBatida ? G.colors.success : `linear-gradient(90deg,${G.colors.copy},${G.colors.warning})`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </GlassCard>

      {/* Layout principal: lista + editor */}
      <div style={{ display: 'grid', gridTemplateColumns: editandoCorte ? '1fr 360px' : '1fr', gap: '20px', alignItems: 'start' }}>

        {/* Coluna esquerda: upload + lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Upload */}
          <GlassCard style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Plus size={14} color={G.colors.copy} />
              <span style={{ fontWeight: '700', fontSize: '12px' }}>ADICIONAR CORTE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Drop zone */}
              <div
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${videoFile ? G.colors.success : dragOver ? G.colors.copy : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer',
                  background: videoFile ? `${G.colors.success}08` : dragOver ? `${G.colors.copy}08` : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {videoFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Film size={18} color={G.colors.success} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: G.colors.success }}>{videoFile.name}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{(videoFile.size / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); setVideoFile(null); setTitle(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={24} color="rgba(255,255,255,0.25)" />
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontWeight: '600' }}>
                      Arraste o vídeo da live aqui
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '3px' }}>MP4, MOV, AVI, MKV</div>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="video/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); e.target.value = ''; }} />

              {/* Nome */}
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && adicionarCorte()}
                placeholder="Nome da live (preenchido automaticamente)"
                style={{ ...iStyle, fontSize: '12px' }}
              />

              {feedback === 'erro' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: G.colors.danger, fontSize: '11px', fontWeight: '600' }}>
                  <AlertCircle size={12} /> Adicione um vídeo ou preencha o nome
                </div>
              )}

              <button
                type="button"
                onClick={adicionarCorte}
                style={{
                  background: feedback === 'ok' ? G.colors.success : feedback === 'erro' ? G.colors.danger : G.colors.copy,
                  border: 'none', borderRadius: '8px', padding: '10px',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                  color: feedback === 'ok' ? '#000' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                {feedback === 'ok' ? <><Check size={14} /> Adicionado!</> : <><Plus size={14} /> Adicionar à Fila</>}
              </button>
            </div>
          </GlassCard>

          {/* Lista de cortes */}
          <GlassCard style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ fontWeight: '700', fontSize: '12px', letterSpacing: '1px', marginBottom: '14px', color: 'rgba(255,255,255,0.6)' }}>
              FILA — {cortes.length} corte{cortes.length !== 1 ? 's' : ''}
            </div>

            {cortes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.18)', fontSize: '12px' }}>
                Nenhum corte na fila
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {cortes.map((corte, idx) => {
                const cfg = STATUS_DISPLAY[corte.status];
                const concluido = isConcluido(corte.status);
                const proximo = proximoStatus(corte.status, 'L2');
                const proxCfg = STATUS_DISPLAY[proximo];
                const hasVideo = videoUrls.has(corte.id);
                const isEditing = editandoId === corte.id;

                return (
                  <div key={corte.id} style={{
                    background: isEditing ? `${G.colors.copy}10` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isEditing ? `${G.colors.copy}40` : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '10px', padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      minWidth: '22px', height: '22px', borderRadius: '5px',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)',
                    }}>
                      {String(cortes.length - idx).padStart(2, '0')}
                    </div>

                    {hasVideo && <Film size={12} color={G.colors.success} style={{ flexShrink: 0 }} />}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '12px', fontWeight: '600',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        textDecoration: concluido ? 'line-through' : 'none',
                        color: concluido ? 'rgba(255,255,255,0.4)' : '#fff',
                      }}>{corte.title}</div>
                    </div>

                    <Badge label={cfg.label} color={cfg.color} />

                    {/* Botão Cortar / Editar */}
                    <button
                      type="button"
                      onClick={() => setEditandoId(isEditing ? null : corte.id)}
                      style={{
                        background: isEditing ? `${G.colors.copy}20` : `${G.colors.copy}15`,
                        border: `1px solid ${G.colors.copy}30`,
                        borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                        fontSize: '11px', fontWeight: '700', color: G.colors.copy,
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <Scissors size={11} />
                      {isEditing ? 'Fechar' : 'Cortar'}
                    </button>

                    {!concluido && (
                      <button type="button" onClick={() => avancarStatus(corte.id)} style={{
                        background: `${proxCfg.color}15`, border: `1px solid ${proxCfg.color}30`,
                        borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                        fontSize: '11px', fontWeight: '700', color: proxCfg.color,
                      }}>
                        {proxCfg.label}
                      </button>
                    )}

                    <button type="button" onClick={() => removerCorte(corte.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: '2px', display: 'flex' }}>
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Coluna direita: painel de edição */}
        {editandoCorte && (
          <GlassCard style={{ padding: '20px', borderRadius: '16px', position: 'sticky', top: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: G.colors.copy, letterSpacing: '1.5px' }}>EDITANDO</div>
                <div style={{ fontSize: '13px', fontWeight: '700', marginTop: '2px' }}>{editandoCorte.title}</div>
              </div>
              <button type="button" onClick={() => setEditandoId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                <X size={16} />
              </button>
            </div>

            <EditorPanel
              videoUrl={videoUrls.get(editandoCorte.id)}
              settings={settings[editandoCorte.id] ?? defaultSettings()}
              onChange={patch => updateSettings(editandoCorte.id, patch)}
              onGerar={() => { setGerando(true); setTimeout(() => setGerando(false), 2500); }}
              gerando={gerando}
            />
          </GlassCard>
        )}
      </div>
    </div>
  );
};

const iStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
  padding: '8px 11px', color: '#fff', fontSize: '13px', outline: 'none',
  boxSizing: 'border-box',
};
