import { useState, useRef } from 'react';
import {
  Upload, Check, ChevronLeft, ChevronRight,
  Loader, Film, Sparkles,
} from 'lucide-react';
import { G, GlassCard, Badge, Btn } from '../design-system';

// --- Modelos de edicao ---

interface Modelo {
  id: string;
  nome: string;
  descricao: string;
  linha: string;
  elementos: string[];
  cor: string;
}

const MODELOS: Modelo[] = [
  {
    id: 'prova_social',
    nome: 'Prova Social Explosiva',
    descricao: 'Zoom in no momento de revelacao, SFX impact, texto centro que some rapido',
    linha: 'L1',
    elementos: ['Zoom in revelacao', 'SFX impact', 'Texto centro', 'Whoosh final', 'Vinheta'],
    cor: '#FF9500',
  },
  {
    id: 'hook_explosivo',
    nome: 'Hook Explosivo',
    descricao: 'Texto em cima, some em 1.2s, zoom out no inicio, zoom in no climax',
    linha: 'L1',
    elementos: ['Texto topo rapido', 'Zoom out -> in', 'Muito texto', 'SFX cortes'],
    cor: '#FF2D55',
  },
  {
    id: 'tutorial_rapido',
    nome: 'Tutorial Rapido',
    descricao: 'Texto instrucional sincronizado com fala, SFX a cada passo, CTA animado',
    linha: 'L1',
    elementos: ['Texto instrucional', 'SFX por passo', 'Musica 40%', 'CTA final 3s'],
    cor: '#0A84FF',
  },
  {
    id: 'storytelling',
    nome: 'Storytelling iGaming',
    descricao: 'Narrativa conduzida, zoom lento nos momentos emocionais, musica sobe',
    linha: 'L3',
    elementos: ['Zoom lento emocional', 'Musica dinamica', 'Texto narrativo', 'CTA forte'],
    cor: '#BF5AF2',
  },
];

// --- Cores de legenda ---

const CORES_LEGENDA = [
  { nome: 'Branco', valor: '#FFFFFF' },
  { nome: 'Amarelo', valor: '#FFD60A' },
  { nome: 'Laranja', valor: '#FF9500' },
  { nome: 'Azul', valor: '#0A84FF' },
  { nome: 'Roxo', valor: '#BF5AF2' },
];

type PosicaoLegenda = 'topo' | 'meio' | 'baixo';

interface Camadas {
  legendas: boolean;
  textosDinamicos: boolean;
  sfxAuto: boolean;
  zoomAuto: boolean;
  marcaDagua: boolean;
  vinhetaFinal: boolean;
  musicaFundo: boolean;
}

// --- Componente principal ---

export const EditorVideos = () => {
  const [etapa, setEtapa] = useState(1);
  const [modeloId, setModeloId] = useState<string | null>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [corLegenda, setCorLegenda] = useState('#FFFFFF');
  const [posicaoLegenda, setPosicaoLegenda] = useState<PosicaoLegenda>('meio');
  const [marcaDagua, setMarcaDagua] = useState(true);
  const [ctaTexto, setCtaTexto] = useState('');
  const [camadas, setCamadas] = useState<Camadas>({
    legendas: true,
    textosDinamicos: true,
    sfxAuto: true,
    zoomAuto: true,
    marcaDagua: true,
    vinhetaFinal: true,
    musicaFundo: false,
  });
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<'pendente' | 'simulado' | 'indisponivel' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const modeloSelecionado = MODELOS.find(m => m.id === modeloId) || null;
  const podeProcessar = modeloId !== null && arquivo !== null;

  const handleFile = (file: File) => {
    const ext = file.name.toLowerCase();
    if (ext.endsWith('.mp4') || ext.endsWith('.mov') || ext.endsWith('.avi')) {
      setArquivo(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleProcessar = async () => {
    setProcessando(true);
    setResultado(null);

    // Tenta backend real; se indisponível, entra em modo simulação
    try {
      const response = await fetch('http://localhost:8000/editor/render', {
        method: 'POST',
        signal: AbortSignal.timeout(3000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelo: modeloId,
          cor_legenda: corLegenda,
          posicao_legenda: posicaoLegenda,
          marca_dagua: marcaDagua,
          cta: ctaTexto,
          camadas,
        }),
      });
      if (!response.ok) throw new Error('Backend indisponivel');
      setResultado('pendente');
    } catch {
      // Modo simulação: simula o tempo de renderização
      await new Promise(res => setTimeout(res, 2500));
      setResultado('simulado');
    } finally {
      setProcessando(false);
      setEtapa(5);
    }
  };

  const toggleCamada = (key: keyof Camadas) => {
    setCamadas(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- Indicador de etapa ---

  const EtapaIndicador = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
      {[1, 2, 3, 4].map(n => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '800',
            background: etapa >= n
              ? (modeloSelecionado?.cor || G.colors.primary)
              : 'rgba(255,255,255,0.08)',
            color: etapa >= n ? '#fff' : 'rgba(255,255,255,0.3)',
            transition: 'all 0.3s',
          }}>
            {n}
          </div>
          {n < 4 && (
            <div style={{
              width: '32px', height: '2px',
              background: etapa > n
                ? (modeloSelecionado?.cor || G.colors.primary)
                : 'rgba(255,255,255,0.08)',
              transition: 'all 0.3s',
            }} />
          )}
        </div>
      ))}
      <span style={{ marginLeft: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
        {etapa === 1 && 'Escolher Modelo'}
        {etapa === 2 && 'Upload do Video'}
        {etapa === 3 && 'Configuracao'}
        {etapa === 4 && 'Camadas'}
        {etapa === 5 && 'Resultado'}
      </span>
    </div>
  );

  // --- Navegacao ---

  const Navegacao = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
      {etapa > 1 && etapa < 5 ? (
        <Btn
          icon={ChevronLeft}
          label="Anterior"
          variant="secondary"
          small
          onClick={() => setEtapa(e => e - 1)}
        />
      ) : <div />}
      {etapa < 4 ? (
        <Btn
          icon={ChevronRight}
          label="Proximo"
          variant="primary"
          small
          onClick={() => setEtapa(e => e + 1)}
        />
      ) : etapa === 4 ? (
        <div style={{ opacity: podeProcessar && !processando ? 1 : 0.4, pointerEvents: podeProcessar && !processando ? 'auto' : 'none' }}>
          <Btn
            icon={processando ? Loader : Sparkles}
            label={processando ? 'Processando...' : 'Processar Video'}
            variant="action"
            onClick={handleProcessar}
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <EtapaIndicador />

      {/* ETAPA 1: Escolher Modelo */}
      {etapa === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {MODELOS.map(m => {
            const selected = modeloId === m.id;
            return (
              <GlassCard key={m.id}>
                <div
                  onClick={() => setModeloId(m.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '14px',
                    border: selected ? `2px solid ${m.cor}` : '2px solid transparent',
                    transition: 'all 0.2s',
                    background: selected ? `${m.cor}08` : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Film size={18} color={m.cor} />
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{m.nome}</span>
                    {selected && <Check size={16} color={m.cor} />}
                  </div>

                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', marginBottom: '12px' }}>
                    {m.descricao}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Badge label={m.linha} color={m.cor} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {m.elementos.map(el => (
                      <span key={el} style={{
                        fontSize: '10px', fontWeight: '600',
                        padding: '3px 8px', borderRadius: '6px',
                        background: `${m.cor}15`, color: m.cor,
                      }}>
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* ETAPA 2: Upload do Video */}
      {etapa === 2 && (
        <GlassCard>
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${arquivo ? G.colors.success : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '16px', padding: '48px 24px', textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
              background: arquivo ? `${G.colors.success}08` : 'transparent',
            }}
          >
            {arquivo ? (
              <>
                <Check size={36} color={G.colors.success} />
                <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: '700', color: G.colors.success }}>
                  {arquivo.name}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                  {(arquivo.size / (1024 * 1024)).toFixed(1)} MB — Clique para trocar
                </p>
              </>
            ) : (
              <>
                <Upload size={36} color="rgba(255,255,255,0.3)" />
                <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                  Arraste o video aqui ou clique para selecionar
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                  MP4, MOV, AVI
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  style={{
                    marginTop: '14px', padding: '10px 24px', borderRadius: '10px',
                    background: G.colors.primary, color: '#fff', border: 'none',
                    fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <Upload size={14} />
                  Selecionar Arquivo
                </button>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mov,.avi"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </GlassCard>
      )}

      {/* ETAPA 3: Configuracao */}
      {etapa === 3 && (
        <GlassCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Cor da legenda */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                COR DA LEGENDA
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {CORES_LEGENDA.map(c => (
                  <button
                    key={c.valor}
                    onClick={() => setCorLegenda(c.valor)}
                    title={c.nome}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: c.valor, border: corLegenda === c.valor ? '3px solid #fff' : '2px solid rgba(255,255,255,0.15)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: corLegenda === c.valor ? `0 0 12px ${c.valor}60` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Posicao da legenda */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>
                POSICAO DA LEGENDA
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['topo', 'meio', 'baixo'] as PosicaoLegenda[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPosicaoLegenda(p)}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '12px', fontWeight: '600',
                      background: posicaoLegenda === p ? (modeloSelecionado?.cor || G.colors.primary) : 'rgba(255,255,255,0.06)',
                      color: posicaoLegenda === p ? '#fff' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Marca d'agua */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={marcaDagua}
                  onChange={e => setMarcaDagua(e.target.checked)}
                  style={{ accentColor: G.colors.primary, width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                  Marca d'agua BINGOBET
                </span>
              </label>
            </div>

            {/* CTA final */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: G.colors.success, display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                CTA FINAL
              </label>
              <input
                value={ctaTexto}
                onChange={e => setCtaTexto(e.target.value)}
                placeholder="Ex: Acessa BINGOBET e aproveita o bonus!"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </GlassCard>
      )}

      {/* ETAPA 4: Camadas ativas */}
      {etapa === 4 && (
        <GlassCard>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px', marginBottom: '16px' }}>
            CAMADAS ATIVAS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {([
              { key: 'legendas' as keyof Camadas, label: 'Legendas automaticas', padrao: true },
              { key: 'textosDinamicos' as keyof Camadas, label: 'Textos dinamicos', padrao: true },
              { key: 'sfxAuto' as keyof Camadas, label: 'SFX automaticos', padrao: true },
              { key: 'zoomAuto' as keyof Camadas, label: 'Zoom automatico', padrao: true },
              { key: 'marcaDagua' as keyof Camadas, label: 'Marca d\'agua', padrao: true },
              { key: 'vinhetaFinal' as keyof Camadas, label: 'Vinheta final', padrao: true },
              { key: 'musicaFundo' as keyof Camadas, label: 'Musica de fundo (opcional)', padrao: false },
            ]).map(item => {
              const ativo = camadas[item.key];
              const cor = modeloSelecionado?.cor || G.colors.primary;
              return (
                <div
                  key={item.key}
                  onClick={() => toggleCamada(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                    background: ativo ? `${cor}12` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${ativo ? `${cor}30` : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '4px',
                    background: ativo ? cor : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {ativo && <Check size={14} color="#fff" />}
                  </div>
                  <span style={{
                    fontSize: '13px', fontWeight: '600',
                    color: ativo ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}>
                    {item.label}
                  </span>
                  {!item.padrao && (
                    <Badge label="OPCIONAL" color="rgba(255,255,255,0.3)" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumo do modelo selecionado */}
          {modeloSelecionado && (
            <div style={{
              marginTop: '20px', padding: '14px', borderRadius: '10px',
              background: `${modeloSelecionado.cor}08`,
              border: `1px solid ${modeloSelecionado.cor}20`,
            }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: modeloSelecionado.cor, letterSpacing: '1px', marginBottom: '6px' }}>
                MODELO SELECIONADO
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                {modeloSelecionado.nome}
              </div>
              {arquivo && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  Arquivo: {arquivo.name}
                </div>
              )}
            </div>
          )}
        </GlassCard>
      )}

      {/* ETAPA 5: Status / Download */}
      {etapa === 5 && (
        <GlassCard style={{ textAlign: 'center', padding: '40px' }}>
          {resultado === 'simulado' ? (
            <>
              <div style={{
                width: '72px', height: '72px', borderRadius: '20px', margin: '0 auto 20px',
                background: `${modeloSelecionado?.cor || G.colors.success}20`,
                border: `2px solid ${modeloSelecionado?.cor || G.colors.success}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={36} color={modeloSelecionado?.cor || G.colors.success} />
              </div>
              <p style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                Vídeo processado!
              </p>
              {modeloSelecionado && (
                <Badge label={modeloSelecionado.nome} color={modeloSelecionado.cor} />
              )}
              <div style={{
                marginTop: '20px', padding: '16px', borderRadius: '12px', maxWidth: '380px', margin: '20px auto 0',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'left',
              }}>
                {[
                  { label: 'Modelo', value: modeloSelecionado?.nome || '—' },
                  { label: 'Arquivo', value: arquivo?.name || '—' },
                  { label: 'Legenda', value: `${CORES_LEGENDA.find(c => c.valor === corLegenda)?.nome} · ${posicaoLegenda}` },
                  { label: 'Camadas ativas', value: Object.values(camadas).filter(Boolean).length + ' / ' + Object.keys(camadas).length },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '8px' }}>
                <Badge label="MODO SIMULAÇÃO" color={G.colors.warning} />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Btn label="Novo vídeo" variant="secondary" onClick={() => { setEtapa(1); setResultado(null); setArquivo(null); setModeloId(null); }} />
              </div>
            </>
          ) : resultado === 'pendente' ? (
            <>
              <Loader size={40} color={modeloSelecionado?.cor || G.colors.primary} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                Processando video...
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
                Isso pode levar alguns minutos.
              </p>
            </>
          ) : null}
        </GlassCard>
      )}

      {etapa < 5 && <Navegacao />}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
