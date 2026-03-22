import { useState, useMemo } from 'react';
import { Copy, Check, Filter, Zap } from 'lucide-react';
import { G, GlassCard, Badge, Btn } from '../design-system';
import { BLOCK_KEYS } from '../types/creative-blocks';

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────

type CopyObjetivo = 'conversao' | 'engajamento' | 'retencao' | 'urgencia';
type HookType = 'curiosidade' | 'prova' | 'choque' | 'emocao' | 'urgencia';

interface CopySugestao {
  id: string;
  texto: string;
  objetivo: CopyObjetivo;
  plataforma: string;
  hook_type: HookType;
}

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────

const OBJETIVO_LABELS: Record<CopyObjetivo, string> = {
  conversao: 'Conversao',
  engajamento: 'Engajamento',
  retencao: 'Retencao',
  urgencia: 'Urgencia',
};

const OBJETIVO_COLORS: Record<CopyObjetivo, string> = {
  conversao: G.colors.success,
  engajamento: G.colors.primary,
  retencao: G.colors.secondary,
  urgencia: G.colors.danger,
};

const COPIES_MOCK: CopySugestao[] = [
  {
    id: 'cp1',
    texto: 'Depositei R$50 e em 10 minutos tava com R$380 na conta. Nao acreditei quando vi o saldo. Fiz o saque e caiu no PIX em 2 minutos. Se voce ainda nao testou, ta perdendo dinheiro.',
    objetivo: 'conversao',
    plataforma: 'Instagram Reels',
    hook_type: 'prova',
  },
  {
    id: 'cp2',
    texto: 'ULTIMA HORA: bonus de 300% so ate meia-noite! Quem depositar agora joga com 4x mais. Esse tipo de oferta nao aparece todo dia. Corre que depois acaba e nao tem choro.',
    objetivo: 'urgencia',
    plataforma: 'Instagram Stories',
    hook_type: 'urgencia',
  },
  {
    id: 'cp3',
    texto: 'Comecei jogando por curiosidade. Hoje ja saquei mais de R$5.000. O segredo? Saber a hora certa de parar e usar os bonus da plataforma a seu favor. Vem que eu te mostro.',
    objetivo: 'engajamento',
    plataforma: 'TikTok',
    hook_type: 'curiosidade',
  },
  {
    id: 'cp4',
    texto: 'Voce ja ta cadastrado mas nao voltou? Temos um presente: 50 rodadas gratis esperando por voce. E so entrar, ativar e jogar. Sem deposito. Sem pegadinha. Volta la que ta valendo.',
    objetivo: 'retencao',
    plataforma: 'WhatsApp',
    hook_type: 'curiosidade',
  },
  {
    id: 'cp5',
    texto: 'Esse cara ganhou R$2.000 no primeiro dia. Sem experiencia nenhuma. So seguiu o passo a passo e deixou o jogo fazer o resto. Quer saber como? Link na bio.',
    objetivo: 'conversao',
    plataforma: 'Instagram Reels',
    hook_type: 'choque',
  },
  {
    id: 'cp6',
    texto: 'Marca aquele amigo que sempre fala que nao da pra ganhar online. Mostra esse video pra ele e pede desculpas depois. Os resultados falam por si.',
    objetivo: 'engajamento',
    plataforma: 'Instagram Reels',
    hook_type: 'emocao',
  },
  {
    id: 'cp7',
    texto: 'ATENCAO jogadores VIP: missao especial da semana ativada! Complete 3 desafios e ganhe R$100 em bonus exclusivo. So pra quem ja faz parte. Confira seu painel agora.',
    objetivo: 'retencao',
    plataforma: 'Push Notification',
    hook_type: 'urgencia',
  },
  {
    id: 'cp8',
    texto: 'Faltam 2 HORAS pra essa oferta sair do ar. Deposite qualquer valor e ganhe cashback de 50%. Depois de meia-noite, acabou. Nao diga que eu nao avisei.',
    objetivo: 'urgencia',
    plataforma: 'Instagram Stories',
    hook_type: 'urgencia',
  },
  {
    id: 'cp9',
    texto: 'Eu duvidava. Achava que era golpe. Ate que um amigo me mostrou o PIX que recebeu em 2 minutos. Resolvi testar com R$30 e hoje to aqui contando essa historia. Assiste ate o final.',
    objetivo: 'conversao',
    plataforma: 'TikTok',
    hook_type: 'emocao',
  },
  {
    id: 'cp10',
    texto: 'Qual a plataforma que paga mais rapido? Fiz o teste: pedi saque em 3 plataformas ao mesmo tempo. Adivinha qual caiu primeiro? Em 2 minutos no PIX. Link nos comentarios.',
    objetivo: 'engajamento',
    plataforma: 'YouTube Shorts',
    hook_type: 'curiosidade',
  },
  {
    id: 'cp11',
    texto: 'Jogador que sacou R$10.000 na semana passada conta o que fez de diferente. Spoiler: nao foi sorte. Foi estrategia + bonus + hora certa. Assiste e anota.',
    objetivo: 'conversao',
    plataforma: 'Instagram Reels',
    hook_type: 'prova',
  },
  {
    id: 'cp12',
    texto: 'Sentimos sua falta! Faz tempo que voce nao aparece. Preparamos algo especial: bonus de retorno de 100% no seu proximo deposito. Valido por 48 horas. Volta la!',
    objetivo: 'retencao',
    plataforma: 'Email',
    hook_type: 'emocao',
  },
];

// ─────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────

export function SugestoesCopy() {
  const [filtro, setFiltro] = useState<CopyObjetivo | 'todos'>('todos');
  const [copiados, setCopiados] = useState<Set<string>>(new Set());
  const [usados, setUsados] = useState<Set<string>>(new Set());

  const filtradas = useMemo(() => {
    if (filtro === 'todos') return COPIES_MOCK;
    return COPIES_MOCK.filter(c => c.objetivo === filtro);
  }, [filtro]);

  const copiarTexto = (copy: CopySugestao) => {
    navigator.clipboard.writeText(copy.texto);
    setCopiados(prev => new Set([...prev, copy.id]));
    setTimeout(() => {
      setCopiados(prev => {
        const next = new Set(prev);
        next.delete(copy.id);
        return next;
      });
    }, 2000);
  };

  const usarCopy = (copy: CopySugestao) => {
    localStorage.setItem(BLOCK_KEYS.offer_selected, JSON.stringify({
      offer_text: copy.texto,
      source: 'sugestoes_copy',
      copy_id: copy.id,
      objetivo: copy.objetivo,
    }));
    setUsados(prev => new Set([...prev, copy.id]));
  };

  const countPorObjetivo = (obj: CopyObjetivo) => COPIES_MOCK.filter(c => c.objetivo === obj).length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {(['conversao', 'engajamento', 'retencao', 'urgencia'] as CopyObjetivo[]).map(obj => (
          <GlassCard key={obj} style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: OBJETIVO_COLORS[obj] }}>{countPorObjetivo(obj)}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{OBJETIVO_LABELS[obj]}</div>
          </GlassCard>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} color="rgba(255,255,255,0.3)" />
        {(['todos', 'conversao', 'engajamento', 'retencao', 'urgencia'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: `1px solid ${filtro === t ? (t === 'todos' ? G.colors.primary : OBJETIVO_COLORS[t as CopyObjetivo]) : 'rgba(255,255,255,0.08)'}`,
              background: filtro === t ? `${t === 'todos' ? G.colors.primary : OBJETIVO_COLORS[t as CopyObjetivo]}20` : 'rgba(255,255,255,0.04)',
              color: filtro === t ? (t === 'todos' ? G.colors.primary : OBJETIVO_COLORS[t as CopyObjetivo]) : 'rgba(255,255,255,0.5)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t === 'todos' ? 'Todos' : OBJETIVO_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Cards de copy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtradas.map(copy => {
          const copiado = copiados.has(copy.id);
          const usado = usados.has(copy.id);
          return (
            <div key={copy.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${usado ? `${G.colors.success}30` : 'rgba(255,255,255,0.07)'}`,
              borderLeft: `3px solid ${OBJETIVO_COLORS[copy.objetivo]}`,
              borderRadius: '10px',
              padding: '16px 18px',
              transition: 'all 0.2s',
            }}>
              {/* Badges */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <Badge label={OBJETIVO_LABELS[copy.objetivo]} color={OBJETIVO_COLORS[copy.objetivo]} />
                <Badge label={copy.plataforma} color="rgba(255,255,255,0.3)" />
                <Badge label={copy.hook_type} color={G.colors.warning} />
              </div>

              {/* Texto */}
              <div style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: '1.7',
                marginBottom: '14px',
                padding: '12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                {copy.texto}
              </div>

              {/* Acoes */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Btn
                  icon={copiado ? Check : Copy}
                  label={copiado ? 'Copiado!' : 'Copiar texto'}
                  variant="glass"
                  onClick={() => copiarTexto(copy)}
                  small
                />
                <Btn
                  icon={usado ? Check : Zap}
                  label={usado ? 'Selecionada!' : 'Usar esta copy'}
                  variant={usado ? 'success' : 'primary'}
                  onClick={() => usarCopy(copy)}
                  small
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
