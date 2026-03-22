import { useState } from 'react';
import { Plus, Film, Check } from 'lucide-react';
import { G, GlassCard, Badge, Btn } from '../design-system';
import { BLOCK_KEYS, loadBlocks, saveBlocks } from '../types/creative-blocks';

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────

type LineType = 'L1' | 'L2' | 'L3';

interface FormatoIdeia {
  id: string;
  nome: string;
  descricao: string;
  duracao_ideal: string;
  linha: LineType;
  exemplo_aplicacao: string;
}

// ─────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────

const LINE_LABELS: Record<LineType, string> = {
  L1: 'L1 Reels',
  L2: 'L2 Cortes',
  L3: 'L3 Full IA',
};

const LINE_COLORS: Record<LineType, string> = {
  L1: G.colors.primary,
  L2: G.colors.warning,
  L3: G.colors.secondary,
};

const FORMATOS_MOCK: FormatoIdeia[] = [
  {
    id: 'f1',
    nome: 'POV do Jogador',
    descricao: 'Video em primeira pessoa simulando a experiencia do jogador. Camera no celular, reacoes genuinas, resultado surpresa.',
    duracao_ideal: '15-30s',
    linha: 'L1',
    exemplo_aplicacao: 'POV: voce acabou de receber um bonus de 200% e decide testar no Aviator...',
  },
  {
    id: 'f2',
    nome: 'Reacao ao Vivo',
    descricao: 'Reacao genuina a um evento do jogo. Close no rosto, emocao real. Funciona com wins grandes ou momentos tensos.',
    duracao_ideal: '10-20s',
    linha: 'L2',
    exemplo_aplicacao: 'Gravacao da live no momento exato de um mega win no slot Fortune Tiger.',
  },
  {
    id: 'f3',
    nome: 'Tutorial Rapido',
    descricao: 'Passo a passo de como fazer algo na plataforma. Cadastro, deposito, saque, uso de bonus. Direto ao ponto.',
    duracao_ideal: '20-40s',
    linha: 'L1',
    exemplo_aplicacao: 'Como fazer seu primeiro deposito e ganhar bonus em 3 passos simples.',
  },
  {
    id: 'f4',
    nome: 'Antes e Depois',
    descricao: 'Comparacao visual de saldo antes e depois de jogar. Prova social com numeros reais na tela.',
    duracao_ideal: '10-15s',
    linha: 'L1',
    exemplo_aplicacao: 'Saldo: R$50 -> depois de 10 minutos jogando -> Saldo: R$380.',
  },
  {
    id: 'f5',
    nome: 'Storytelling Curto',
    descricao: 'Mini-historia com inicio (problema), meio (descoberta) e fim (resultado). Cria conexao emocional rapida.',
    duracao_ideal: '30-60s',
    linha: 'L1',
    exemplo_aplicacao: 'Tava duro no fim do mes, um amigo me indicou, depositei R$20 e olha o que rolou...',
  },
  {
    id: 'f6',
    nome: 'Compilado de Wins',
    descricao: 'Montagem rapida com multiplos momentos de vitoria. Ritmo acelerado, musica envolvente, cortes dinamicos.',
    duracao_ideal: '15-30s',
    linha: 'L3',
    exemplo_aplicacao: 'Top 5 wins da semana no BINGOBET - montagem com transicoes e SFX.',
  },
  {
    id: 'f7',
    nome: 'Dueto/React',
    descricao: 'Reacao a conteudo de outro criador ou a um momento viral. Formato nativo do TikTok com alto alcance organico.',
    duracao_ideal: '15-30s',
    linha: 'L2',
    exemplo_aplicacao: 'Reagindo ao cara que ganhou R$5.000 no primeiro deposito.',
  },
  {
    id: 'f8',
    nome: 'Prova de Saque',
    descricao: 'Gravacao da tela mostrando saque aprovado e dinheiro caindo no PIX. Maior conversor de confianca.',
    duracao_ideal: '10-20s',
    linha: 'L1',
    exemplo_aplicacao: 'Pedi saque de R$500... caiu no PIX em 2 minutos. Aqui a prova.',
  },
  {
    id: 'f9',
    nome: 'Comparativo de Plataformas',
    descricao: 'Lado a lado comparando BINGOBET com concorrente (sem citar nome). Destaca diferenciais reais.',
    duracao_ideal: '20-40s',
    linha: 'L3',
    exemplo_aplicacao: 'Plataforma A: saque em 24h. BINGOBET: saque em 2 minutos. Qual voce escolhe?',
  },
  {
    id: 'f10',
    nome: 'Countdown / Urgencia',
    descricao: 'Video com timer visual criando urgencia. Perfeito para promocoes com prazo. Gatilho de escassez.',
    duracao_ideal: '10-15s',
    linha: 'L3',
    exemplo_aplicacao: 'Faltam 3 HORAS pro bonus de 300% acabar. Corre que depois nao tem mais.',
  },
];

// ─────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────

export function IdeiasFormato() {
  const [adicionados, setAdicionados] = useState<Set<string>>(new Set());

  const adicionarAoTemplates = (formato: FormatoIdeia) => {
    const existentes = loadBlocks<any>(BLOCK_KEYS.templates);
    const jaExiste = existentes.some((t: any) => t.id === `fmt_${formato.id}`);
    if (!jaExiste) {
      saveBlocks(BLOCK_KEYS.templates, [...existentes, {
        id: `fmt_${formato.id}`,
        title: formato.nome,
        template_type: 'gameplay_reacao',
        line_type: formato.linha,
        structure: `${formato.nome} (${formato.duracao_ideal})`,
        notes: formato.exemplo_aplicacao,
        status: 'draft',
        source: 'manual',
        created_at: new Date().toISOString(),
      }]);
    }
    setAdicionados(prev => new Set([...prev, formato.id]));
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats por linha */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {(['L1', 'L2', 'L3'] as LineType[]).map(l => {
          const count = FORMATOS_MOCK.filter(f => f.linha === l).length;
          return (
            <GlassCard key={l} style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: LINE_COLORS[l] }}>{count}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{LINE_LABELS[l]}</div>
            </GlassCard>
          );
        })}
        <GlassCard style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: G.colors.success }}>{FORMATOS_MOCK.length}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Total Formatos</div>
        </GlassCard>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {FORMATOS_MOCK.map(formato => {
          const added = adicionados.has(formato.id);
          return (
            <div key={formato.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${added ? `${G.colors.success}30` : 'rgba(255,255,255,0.07)'}`,
              borderLeft: `3px solid ${LINE_COLORS[formato.linha]}`,
              borderRadius: '10px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              transition: 'all 0.2s',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: `${LINE_COLORS[formato.linha]}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Film size={18} color={LINE_COLORS[formato.linha]} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{formato.nome}</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <Badge label={LINE_LABELS[formato.linha]} color={LINE_COLORS[formato.linha]} />
                    <Badge label={formato.duracao_ideal} color="rgba(255,255,255,0.3)" />
                  </div>
                </div>
              </div>

              {/* Descricao */}
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
                {formato.descricao}
              </div>

              {/* Exemplo */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '10px 12px',
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '4px' }}>
                  EXEMPLO DE APLICACAO
                </div>
                <div style={{ fontSize: '12px', color: G.colors.primary, fontStyle: 'italic', lineHeight: '1.4' }}>
                  "{formato.exemplo_aplicacao}"
                </div>
              </div>

              {/* Acao */}
              <Btn
                icon={added ? Check : Plus}
                label={added ? 'Adicionado!' : 'Adicionar a Templates'}
                variant={added ? 'success' : 'secondary'}
                onClick={() => adicionarAoTemplates(formato)}
                small
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
