// --- BLOCOS CRIATIVOS DO SISTEMA ---
// Cada bloco é uma entidade independente e reutilizável.
// Fórmula: CRIATIVO = Hook × Copy × Oferta × Roteiro × Template

import { getTodayKey, gerarId } from './production';

// ─────────────────────────────────────────
// 1. HOOK — Abertura que prende atenção
// ─────────────────────────────────────────

export type HookType =
  | 'curiosidade'   // "Ninguém acreditou quando isso aconteceu"
  | 'prova'         // "Esse cara ganhou 3x em 10 minutos"
  | 'choque'        // "Esse saque foi absurdo"
  | 'emocao'        // "Meu coração disparou quando vi isso"
  | 'tutorial'      // "Aprende como fazer isso em 30 segundos"
  | 'cta_abertura'; // "Olha isso aqui antes de fechar..."

export type HookStatus = 'draft' | 'validado' | 'arquivado';

export type HookSource = 'copy_roteiro' | 'manual' | 'radar';

export interface Hook {
  id: string;
  hook_text: string;
  hook_pattern?: string;  // versão abstraída com placeholders, ex: "Eu [ação] no [produto]..."
  hook_type: HookType;
  status: HookStatus;
  source: HookSource;
  created_at: string;
}

export const HOOK_TYPE_LABEL: Record<HookType, string> = {
  curiosidade:  'Curiosidade',
  prova:        'Prova',
  choque:       'Choque',
  emocao:       'Emoção',
  tutorial:     'Tutorial',
  cta_abertura: 'CTA Abertura',
};

export const HOOK_TYPE_COLOR: Record<HookType, string> = {
  curiosidade:  '#BF5AF2',
  prova:        '#32D74B',
  choque:       '#FF3B30',
  emocao:       '#FF2D55',
  tutorial:     '#0A84FF',
  cta_abertura: '#FF9500',
};

export const HOOK_STATUS_LABEL: Record<HookStatus, string> = {
  draft:     'Rascunho',
  validado:  'Validado',
  arquivado: 'Arquivado',
};

export const HOOK_STATUS_COLOR: Record<HookStatus, string> = {
  draft:     'rgba(255,255,255,0.35)',
  validado:  '#32D74B',
  arquivado: 'rgba(255,255,255,0.2)',
};

// ─────────────────────────────────────────
// 2. COPY — Texto falado (narração/locução)
// Copy NÃO é roteiro visual. É o que é dito.
// ─────────────────────────────────────────

export interface Copy {
  id: string;
  title: string;
  hook: string;           // frase de abertura falada
  desenvolvimento: string; // corpo da fala
  cta: string;            // chamada pra ação falada
  offer_id?: string;      // referência à oferta usada
  hook_id?: string;       // referência ao hook de origem
  tone: string;           // ex: "empolgado", "informativo", "urgente"
  created_at: string;
}

// ─────────────────────────────────────────
// 3. OFERTA — Benefício ou incentivo
// ─────────────────────────────────────────

export type OfertaType =
  | 'bonus'
  | 'cashback'
  | 'pix'
  | 'missoes'
  | 'rodadas_gratis'
  | 'torneio'
  | 'suporte'
  | 'saque';

export type OfertaStatus = 'draft' | 'validada' | 'arquivada';

export type OfertaSource = 'manual' | 'campanha' | 'radar' | 'concorrente';

export interface Oferta {
  id: string;
  offer_title: string;
  offer_text: string;
  offer_type: OfertaType;
  status: OfertaStatus;
  source: OfertaSource;
  created_at: string;
}

export const OFERTA_TYPE_LABEL: Record<OfertaType, string> = {
  bonus:         'Bônus',
  cashback:      'Cashback',
  pix:           'Saque PIX',
  missoes:       'Missões',
  rodadas_gratis:'Rodadas Grátis',
  torneio:       'Torneio',
  suporte:       'Suporte',
  saque:         'Saque',
};

export const OFERTA_TYPE_COLOR: Record<OfertaType, string> = {
  bonus:         '#FF9500',
  cashback:      '#32D74B',
  pix:           '#0A84FF',
  missoes:       '#BF5AF2',
  rodadas_gratis:'#FF2D55',
  torneio:       '#FFD60A',
  suporte:       '#64D2FF',
  saque:         '#30D158',
};

export const OFERTA_STATUS_LABEL: Record<OfertaStatus, string> = {
  draft:     'Rascunho',
  validada:  'Validada',
  arquivada: 'Arquivada',
};

export const OFERTA_STATUS_COLOR: Record<OfertaStatus, string> = {
  draft:     'rgba(255,255,255,0.35)',
  validada:  '#32D74B',
  arquivada: 'rgba(255,255,255,0.2)',
};

// ─────────────────────────────────────────
// 4. ROTEIRO — Estrutura visual da edição
// Roteiro NÃO é a fala. É a estrutura de cenas.
// ─────────────────────────────────────────

export type SceneType =
  | 'abertura'
  | 'produto'
  | 'reacao'
  | 'prova_social'
  | 'cta';

export type CameraType =
  | 'close-up'
  | 'plano-medio'
  | 'plano-geral'
  | 'zoom'
  | 'pov'
  | 'tela';

export const CAMERA_LABEL: Record<CameraType, string> = {
  'close-up':    'Close-up',
  'plano-medio': 'Plano Médio',
  'plano-geral': 'Plano Geral',
  'zoom':        'Zoom',
  'pov':         'POV',
  'tela':        'Tela',
};

export interface RoteiroScene {
  order: number;
  type: SceneType;
  description: string;
  duration: string;
  camera: CameraType;
}

export interface Roteiro {
  id: string;
  title: string;
  scenes: RoteiroScene[];
  total_duration: string; // ex: "15s", "30s"
  template_id?: string;   // referência ao template base
  created_at: string;
}

// ─────────────────────────────────────────
// 5. TEMPLATE — Modelo de edição reutilizável
// Esqueleto narrativo/visual reutilizável por linha de produção.
// NÃO armazena hook nem oferta — só a estrutura que os combina.
// ─────────────────────────────────────────

export type TemplateType =
  | 'gameplay_reacao'  // gameplay + reação do jogador
  | 'prova_social'     // depoimento / print / resultado
  | 'tutorial_curto'   // passo a passo rápido
  | 'pov_resultado'    // POV de quem ganhou / sacou
  | 'storytelling';    // narrativa com início / virada / fim

export type TemplateLineType = 'L1' | 'L2' | 'L3' | 'all';
export type TemplateStatus   = 'draft' | 'active' | 'archived';
export type TemplateSource   = 'manual' | 'radar' | 'campanha';

export interface Template {
  id: string;
  title: string;            // ex: "Reels Bônus Hook Direto"
  template_type: TemplateType;
  line_type: TemplateLineType;
  structure: string;        // ex: "Hook (3s) → Prova social (5s) → Oferta (4s) → CTA (3s)"
  notes: string;            // observações de edição (SFX, zoom, texto na tela etc.)
  status: TemplateStatus;
  source: TemplateSource;
  created_at: string;
}

export const TEMPLATE_TYPE_LABEL: Record<TemplateType, string> = {
  gameplay_reacao: 'Gameplay + Reação',
  prova_social:    'Prova Social',
  tutorial_curto:  'Tutorial Curto',
  pov_resultado:   'POV Resultado',
  storytelling:    'Storytelling',
};

export const TEMPLATE_TYPE_COLOR: Record<TemplateType, string> = {
  gameplay_reacao: '#FF9500',
  prova_social:    '#32D74B',
  tutorial_curto:  '#0A84FF',
  pov_resultado:   '#BF5AF2',
  storytelling:    '#FF2D55',
};

export const TEMPLATE_LINE_LABEL: Record<TemplateLineType, string> = {
  L1:  'L1 Reels',
  L2:  'L2 Cortes',
  L3:  'L3 Full IA',
  all: 'Universal',
};

export const TEMPLATE_LINE_COLOR: Record<TemplateLineType, string> = {
  L1:  '#0A84FF',
  L2:  '#FF9500',
  L3:  '#BF5AF2',
  all: 'rgba(255,255,255,0.4)',
};

export const TEMPLATE_STATUS_LABEL: Record<TemplateStatus, string> = {
  draft:    'Rascunho',
  active:   'Ativo',
  archived: 'Arquivado',
};

export const TEMPLATE_STATUS_COLOR: Record<TemplateStatus, string> = {
  draft:    'rgba(255,255,255,0.35)',
  active:   '#32D74B',
  archived: 'rgba(255,255,255,0.2)',
};

export const TEMPLATE_SOURCE_LABEL: Record<TemplateSource, string> = {
  manual:   'Manual',
  radar:    'Radar',
  campanha: 'Campanha',
};

// ─────────────────────────────────────────
// SESSÃO CRIATIVA — Montagem de um criativo
// Combina os 5 blocos em um item de produção
// ─────────────────────────────────────────

export interface CreativeSession {
  id: string;
  title: string;
  hook: string;
  copy_hook: string;
  copy_desenvolvimento: string;
  copy_cta: string;
  oferta: string;
  roteiro: RoteiroScene[];
  template_ref: string;
  notes: string;
  saved_hook_id?: string;   // se foi salvo no banco de hooks
  saved_copy_id?: string;   // se foi salvo no banco de copys
  created_at: string;
}

// ─────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────

export function loadBlocks<T>(key: string): T[] {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

export function saveBlocks<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

export const BLOCK_KEYS = {
  hooks:        'blocks_hooks',
  copies:       'blocks_copies',
  ofertas:      'blocks_ofertas',
  roteiros:     'blocks_roteiros',
  templates:    'blocks_templates',
  session:      (date: string) => `creative_session_${date}`,
  hook_selected:      'hook_selected_for_session',      // Banco de Hooks → Copy & Roteiro
  offer_selected:     'offer_selected_for_session',     // Biblioteca de Ofertas → Copy & Roteiro / Produção
  template_selected:  'template_selected_for_session',  // Templates → Copy & Roteiro
} as const;

// ─────────────────────────────────────────
// SCENE TYPES DISPLAY
// ─────────────────────────────────────────

export const SCENE_TYPE_LABEL: Record<SceneType, string> = {
  abertura:    'Abertura',
  produto:     'Produto',
  reacao:      'Reação',
  prova_social:'Prova Social',
  cta:         'CTA',
};

export const SCENE_TYPE_COLOR: Record<SceneType, string> = {
  abertura:    '#0A84FF',
  produto:     '#BF5AF2',
  reacao:      '#FF9500',
  prova_social:'#32D74B',
  cta:         '#FF2D55',
};

export { getTodayKey, gerarId };
