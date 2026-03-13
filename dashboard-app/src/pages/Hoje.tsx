import { useState, useEffect } from 'react';
import { CheckSquare, Square, ExternalLink, Plus, X, Calendar, Clock } from 'lucide-react';
import { G, GlassCard, Btn } from '../design-system';

const ASANA_URL = 'https://app.asana.com/';

const ENTREGAS_FIXAS = [
  { id: 'reel1',    label: 'Reel 1 editado',        grupo: 'reels' },
  { id: 'reel2',    label: 'Reel 2 editado',        grupo: 'reels' },
  { id: 'capa1',    label: 'Capa Reel 1',           grupo: 'reels' },
  { id: 'capa2',    label: 'Capa Reel 2',           grupo: 'reels' },
  { id: 'criativo1', label: 'Criativo 1',           grupo: 'criativos' },
  { id: 'criativo2', label: 'Criativo 2',           grupo: 'criativos' },
  { id: 'criativo3', label: 'Criativo 3',           grupo: 'criativos' },
  { id: 'copy',     label: 'Copy & Roteiro',        grupo: 'copy' },
  { id: 'drive',    label: 'Upload Drive (bruto + finalizado)', grupo: 'upload' },
  { id: 'asana',    label: 'Upload Card Asana',     grupo: 'upload' },
  { id: 'planilha', label: 'Planilha alimentada',   grupo: 'planilha' },
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getNomeDia() {
  const dias = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
  return dias[new Date().getDay()];
}

function getDataFormatada() {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getHora() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const GRUPO_CORES: Record<string, string> = {
  reels:     G.colors.primary,
  criativos: G.colors.secondary,
  copy:      G.colors.copy,
  upload:    G.colors.warning,
  planilha:  G.colors.success,
};

const GRUPO_LABELS: Record<string, string> = {
  reels:     'VÍDEOS & CAPAS',
  criativos: 'CRIATIVOS',
  copy:      'COPY & ROTEIRO',
  upload:    'UPLOADS',
  planilha:  'PLANILHA',
};

export const Hoje = () => {
  const todayKey = getTodayKey();
  const [hora, setHora] = useState(getHora());

  // Checklist state — persiste por data
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`checks_${todayKey}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Posts do Asana hoje — persiste por data
  const [posts, setPosts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`posts_${todayKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [novoPost, setNovoPost] = useState('');

  useEffect(() => {
    const t = setInterval(() => setHora(getHora()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem(`checks_${todayKey}`, JSON.stringify(checks));
  }, [checks, todayKey]);

  useEffect(() => {
    localStorage.setItem(`posts_${todayKey}`, JSON.stringify(posts));
  }, [posts, todayKey]);

  const toggleCheck = (id: string) => {
    setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addPost = () => {
    const v = novoPost.trim();
    if (!v) return;
    setPosts(prev => [...prev, v]);
    setNovoPost('');
  };

  const removePost = (i: number) => {
    setPosts(prev => prev.filter((_, idx) => idx !== i));
  };

  const total = ENTREGAS_FIXAS.length;
  const feitas = ENTREGAS_FIXAS.filter(e => checks[e.id]).length;
  const progresso = Math.round((feitas / total) * 100);
  const diaFechado = feitas === total;

  // Agrupar entregas
  const grupos = Array.from(new Set(ENTREGAS_FIXAS.map(e => e.grupo)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header do dia */}
      <GlassCard style={{ padding: '24px 28px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '300px', height: '100%',
          background: diaFechado
            ? `linear-gradient(135deg, ${G.colors.success}08, ${G.colors.success}20)`
            : 'linear-gradient(135deg, #0A84FF08, #0A84FF20)',
          borderRadius: '0 20px 20px 0',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '4px' }}>
              {getNomeDia()}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', marginBottom: '2px' }}>
              {getDataFormatada()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              <Clock size={13} />
              {hora}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {diaFechado ? (
              <div style={{ fontSize: '28px', fontWeight: '900', color: G.colors.success }}>
                DIA FECHADO ✓
              </div>
            ) : (
              <>
                <div style={{ fontSize: '32px', fontWeight: '900', color: progresso >= 50 ? G.colors.success : G.colors.warning }}>
                  {feitas}/{total}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>entregas concluídas</div>
              </>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${progresso}%`, height: '100%', borderRadius: '8px',
            background: diaFechado
              ? G.colors.success
              : `linear-gradient(90deg, ${G.colors.primary}, ${G.colors.secondary})`,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Planejamento do dia — Asana */}
        <GlassCard style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color={G.colors.primary} />
              <span style={{ fontWeight: '700', fontSize: '13px' }}>POSTS DE HOJE</span>
            </div>
            <button
              onClick={() => window.open(ASANA_URL, '_blank')}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'rgba(255,100,60,0.15)', border: '1px solid rgba(255,100,60,0.3)',
                borderRadius: '8px', padding: '5px 10px', cursor: 'pointer',
                fontSize: '11px', fontWeight: '700', color: '#FF7043',
              }}
            >
              <ExternalLink size={11} /> Abrir Asana
            </button>
          </div>

          {/* Lista de posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            {posts.length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>
                Nenhum post adicionado — abre o Asana e copia os cards de hoje
              </div>
            )}
            {posts.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 12px',
              }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{p}</span>
                <button onClick={() => removePost(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: '0', display: 'flex' }}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Input novo post */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={novoPost}
              onChange={e => setNovoPost(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPost()}
              placeholder="Ex: 15H - ELLEN JOGANDO FORTUNE MOUSE"
              style={{
                flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none',
              }}
            />
            <button
              onClick={addPost}
              style={{
                background: G.colors.primary, border: 'none', borderRadius: '8px',
                padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}
            >
              <Plus size={14} color="#fff" />
            </button>
          </div>
        </GlassCard>

        {/* Resumo rápido */}
        <GlassCard style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '16px', color: 'rgba(255,255,255,0.6)' }}>
            RESUMO DO DIA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Reels + Capas', total: 4, feitas: ['reel1','reel2','capa1','capa2'].filter(id => checks[id]).length, cor: G.colors.primary },
              { label: 'Criativos', total: 3, feitas: ['criativo1','criativo2','criativo3'].filter(id => checks[id]).length, cor: G.colors.secondary },
              { label: 'Copy & Roteiro', total: 1, feitas: checks['copy'] ? 1 : 0, cor: G.colors.copy },
              { label: 'Uploads & Planilha', total: 3, feitas: ['drive','asana','planilha'].filter(id => checks[id]).length, cor: G.colors.success },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: item.feitas === item.total ? item.cor : 'rgba(255,255,255,0.4)' }}>
                    {item.feitas}/{item.total}
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '4px' }}>
                  <div style={{
                    width: `${(item.feitas / item.total) * 100}%`, height: '100%',
                    background: item.cor, borderRadius: '4px', transition: 'width 0.3s',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Checklist de Entregas */}
      <GlassCard style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '20px', letterSpacing: '1px' }}>
          CHECKLIST DE ENTREGAS
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {grupos.map(grupo => {
            const items = ENTREGAS_FIXAS.filter(e => e.grupo === grupo);
            const cor = GRUPO_CORES[grupo];
            return (
              <div key={grupo}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: cor, letterSpacing: '1.5px', marginBottom: '10px' }}>
                  {GRUPO_LABELS[grupo]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {items.map(item => {
                    const done = !!checks[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                          background: done ? `${cor}12` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${done ? `${cor}30` : 'rgba(255,255,255,0.06)'}`,
                          transition: 'all 0.2s',
                        }}
                      >
                        {done
                          ? <CheckSquare size={16} color={cor} />
                          : <Square size={16} color="rgba(255,255,255,0.2)" />
                        }
                        <span style={{
                          fontSize: '13px', fontWeight: '500',
                          color: done ? 'rgba(255,255,255,0.5)' : '#fff',
                          textDecoration: done ? 'line-through' : 'none',
                          transition: 'all 0.2s',
                        }}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {diaFechado && (
          <div style={{
            marginTop: '20px', padding: '16px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${G.colors.success}15, ${G.colors.success}25)`,
            border: `1px solid ${G.colors.success}40`, textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: G.colors.success }}>
              DIA FECHADO ✓
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              Todas as entregas do dia concluídas
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
