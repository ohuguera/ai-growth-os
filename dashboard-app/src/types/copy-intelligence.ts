// --- COPY INTELLIGENCE (bounded) ---
// Pré-estrutura o campo "desenvolvimento" com base na combinação de blocos da sessão.
// Lógica 100% determinística — sem API externa.
// Fórmula: hook_type × template_type → scaffold de desenvolvimento
//          offer_type                 → CTA ajustado

import type { HookType, TemplateType, OfertaType } from './creative-blocks';

// ─────────────────────────────────────────
// MATRIZ: hook_type × template_type → desenvolvimento
// ─────────────────────────────────────────

const DESENVOLVIMENTO_MATRIX: Record<HookType, Record<TemplateType, string>> = {
  curiosidade: {
    gameplay_reacao:  'Revela o momento que ninguém esperava. Zoom no resultado. A reação foi espontânea — olha a expressão.',
    prova_social:     'Esse resultado veio de alguém normal, não de profissional. Print real, plataforma real.',
    tutorial_curto:   'O segredo é simples — mas pouca gente sabe. Olha o passo a passo e entende por quê funciona.',
    pov_resultado:    'Você tá vendo exatamente o que aconteceu. Saldo antes, saldo depois. Nada editado.',
    storytelling:     'Começou sem expectativa nenhuma. No meio do jogo, algo mudou. O que veio depois ninguém esperava.',
  },
  prova: {
    gameplay_reacao:  'Captura ao vivo, sem corte. Olha o gráfico e o saldo em tempo real. Isso não foi montado.',
    prova_social:     'Print real, data real, plataforma real. Isso aconteceu e tem comprovante. Não tem como negar.',
    tutorial_curto:   'Segue o passo a passo e olha o resultado. Isso funciona — tem prova aqui na tela.',
    pov_resultado:    'Você tá no lugar de quem sacou. Vê o número, vê o PIX, vê a confirmação.',
    storytelling:     'Começa com a dúvida. No meio, a aposta. No final, o saque — e o print que prova tudo.',
  },
  choque: {
    gameplay_reacao:  'Olha o que aconteceu na tela. O multiplicador explodiu num nível que ninguém viu antes.',
    prova_social:     'Esse saque absurdo foi ao vivo. A galera não acreditou — olha a reação no chat.',
    tutorial_curto:   'Isso acontece quando você sabe a hora certa. Olha o timing — é exatamente assim.',
    pov_resultado:    'Você tá vendo o saldo antes: normal. Depois: isso. Em menos de 3 minutos.',
    storytelling:     'Começou como qualquer rodada. Então o multiplicador subiu. E subiu. E ninguém parou de gritar.',
  },
  emocao: {
    gameplay_reacao:  'A câmera não mente. Olha a expressão quando o saldo mudou. Isso não dá pra fingir.',
    prova_social:     'Esse momento foi real. A felicidade na foto é real. O PIX que caiu também é real.',
    tutorial_curto:   'Quando você entende como funciona, bate uma leveza. Olha como é simples na prática.',
    pov_resultado:    'Você tá sentindo o que ele sentiu. O coração dispara, o saldo sobe, o saque confirma.',
    storytelling:     'Começou com medo de perder. Veio a virada. No final, só gratidão — e um saldo diferente.',
  },
  tutorial: {
    gameplay_reacao:  'Passo 1: entra no jogo. Passo 2: olha o gráfico antes de apostar. Passo 3: vê o resultado.',
    prova_social:     'Aprende com quem já fez. Esse resultado veio de uma estratégia simples — e tá aqui documentado.',
    tutorial_curto:   'Primeiro: abre a plataforma. Segundo: escolhe esse jogo. Terceiro: ativa o bônus e começa.',
    pov_resultado:    'Você vai fazer exatamente isso. Entra, aposta no momento certo, acompanha o saldo subir.',
    storytelling:     'Antes: sem saber o que fazer. Depois de aprender: esse resultado. A diferença é o método.',
  },
  cta_abertura: {
    gameplay_reacao:  'Olha o gráfico agora. Isso tá acontecendo em tempo real. Quem tá dentro já tá lucrando.',
    prova_social:     'Todo mundo tá vendo esse resultado. A diferença é quem age agora e quem fica só olhando.',
    tutorial_curto:   'Em 30 segundos você entende como fazer. É isso — sem mistério, sem enrolação.',
    pov_resultado:    'Você podia estar no lugar dele agora. A plataforma tá aberta, o bônus tá ativo.',
    storytelling:     'Essa história podia ser sua. Começa igual pra todo mundo — a diferença é dar o primeiro passo.',
  },
};

// ─────────────────────────────────────────
// CTA por tipo de oferta
// ─────────────────────────────────────────

const CTA_BY_OFFER: Record<OfertaType, string> = {
  bonus:         'Começa com bônus. Link direto na bio.',
  cashback:      'Tem cashback todo dia. Entra pelo link na bio.',
  pix:           'Saca via PIX em minutos. Link na bio.',
  missoes:       'Completa missões e multiplica. Link na bio.',
  rodadas_gratis:'Rodadas grátis pra começar. Sem depósito. Link na bio.',
  torneio:       'Entra no torneio agora. Premiação real. Link na bio.',
  suporte:       'Suporte 24h, saque rápido. Entra pelo link na bio.',
  saque:         'Saque confirmado em minutos. Link direto na bio.',
};

// ─────────────────────────────────────────
// RESULTADO
// ─────────────────────────────────────────

export interface IntelligenceResult {
  desenvolvimento: string;
  cta: string | null;
  hookType: HookType;
  templateType: TemplateType;
}

// ─────────────────────────────────────────
// FUNÇÃO PRINCIPAL
// Retorna null se não tiver dados suficientes para intelligence.
// Nunca lança erro — fallback gracioso.
// ─────────────────────────────────────────

export function getCopyIntelligence(
  hookType: HookType | undefined,
  templateType: TemplateType | undefined,
  offerType: OfertaType | undefined,
): IntelligenceResult | null {
  if (!hookType || !templateType) return null;

  const desenvolvimentoMap = DESENVOLVIMENTO_MATRIX[hookType];
  if (!desenvolvimentoMap) return null;

  const desenvolvimento = desenvolvimentoMap[templateType];
  if (!desenvolvimento) return null;

  const cta = offerType ? (CTA_BY_OFFER[offerType] ?? null) : null;

  return { desenvolvimento, cta, hookType, templateType };
}
