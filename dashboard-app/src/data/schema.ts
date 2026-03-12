/**
 * GUARDIAN AIOX — Schema de Contratos
 *
 * REGRA: Todo output de uma tarefa DEVE seguir AgentOutput.
 * REGRA: Todo input de uma tarefa DEVE referenciar AgentOutput anterior.
 * REGRA: Toda página DEVE ter PageContract definido aqui.
 * REGRA: Toda UI card DEVE exibir SourceTrail.
 */

import type { Mode } from '../store/modeContext';

// ─── TIPOS BASE ──────────────────────────────────────────────────────────────

export type ImpactLevel = 'alto' | 'médio' | 'baixo';
export type ComplexityLevel = 'alta' | 'média' | 'baixa';
export type AgentId =
  | 'minerador_videos'
  | 'biblioteca_anuncios'
  | 'concorrentes_igaming'
  | 'grandes_marcas_agent'
  | 'cerebro_criativo'
  | 'retrovisor';

export type OutputType =
  | 'video_viral'
  | 'ad_insight'
  | 'competitor_analysis'
  | 'brand_analysis'
  | 'hook'
  | 'script'
  | 'campaign_idea'
  | 'format_idea'
  | 'offer'
  | 'copy'
  | 'process_review';

// ─── RASTREIO DE FONTE (aparece em todo card da UI) ──────────────────────────

export interface SourceTrail {
  mode: Mode;
  modeLabel: string;
  agentId: AgentId;
  agentName: string;
  sourceName: string;      // ex: "Bet365", "iFood", "TikTok BR"
  sourceType: 'competitor' | 'brand' | 'social' | 'library';
  generatedAt: string;     // ISO timestamp
}

// ─── OUTPUT / INPUT CONTRACTS ─────────────────────────────────────────────────

export interface AgentOutput<T = unknown> {
  id: string;
  agentId: AgentId;
  outputType: OutputType;
  impact: ImpactLevel;
  complexity: ComplexityLevel;
  mode: Mode | 'both';
  trail: SourceTrail;
  payload: T;
  connectsTo: AgentId[];   // quais agentes podem consumir este output
}

// ─── CONTRATO DE PÁGINA ───────────────────────────────────────────────────────

export interface PageContract {
  id: string;
  title: string;
  description: string;
  agent: AgentId | null;
  inputFrom: AgentId[];
  outputTo: AgentId[];
  impact: ImpactLevel;
  complexity: ComplexityLevel;
  modeAware: boolean;      // se a página muda conteúdo baseado no modo
}

// ─── REGISTRO DE PÁGINAS ─────────────────────────────────────────────────────

export const PAGE_CONTRACTS: Record<string, PageContract> = {
  central: {
    id: 'central', title: 'Central de Controle', description: 'Visão geral em tempo real da operação.',
    agent: null, inputFrom: ['minerador_videos', 'biblioteca_anuncios', 'cerebro_criativo'],
    outputTo: [], impact: 'médio', complexity: 'baixa', modeAware: true,
  },
  agentes: {
    id: 'agentes', title: 'Mapa de Agentes', description: 'Monitore todos os agentes de IA.',
    agent: null, inputFrom: [], outputTo: [], impact: 'médio', complexity: 'baixa', modeAware: false,
  },
  fluxo: {
    id: 'fluxo', title: 'Fluxo do Sistema', description: 'Visualize como os dados fluem pelo sistema.',
    agent: null, inputFrom: [], outputTo: [], impact: 'alto', complexity: 'baixa', modeAware: true,
  },
  seletor: {
    id: 'seletor', title: 'Seletor de Modo', description: 'Escolha a fonte de inteligência.',
    agent: null, inputFrom: [], outputTo: [], impact: 'alto', complexity: 'baixa', modeAware: false,
  },
  radar_videos: {
    id: 'radar_videos', title: 'Radar de Vídeos Virais', description: 'Vídeos virais monitorados por modo.',
    agent: 'minerador_videos', inputFrom: [], outputTo: ['cerebro_criativo'],
    impact: 'alto', complexity: 'média', modeAware: true,
  },
  biblioteca_anuncios: {
    id: 'biblioteca_anuncios', title: 'Biblioteca de Anúncios', description: 'Anúncios analisados por concorrentes e marcas.',
    agent: 'biblioteca_anuncios', inputFrom: [], outputTo: ['cerebro_criativo', 'retrovisor'],
    impact: 'alto', complexity: 'média', modeAware: true,
  },
  concorrentes: {
    id: 'concorrentes', title: 'Concorrentes iGaming', description: 'Análise por Tier Alto e Tier Médio.',
    agent: 'concorrentes_igaming', inputFrom: [], outputTo: ['cerebro_criativo'],
    impact: 'alto', complexity: 'média', modeAware: false,
  },
  grandes_marcas: {
    id: 'grandes_marcas', title: 'Grandes Marcas', description: 'Referências das maiores marcas do Brasil.',
    agent: 'grandes_marcas_agent', inputFrom: [], outputTo: ['cerebro_criativo'],
    impact: 'alto', complexity: 'média', modeAware: false,
  },
  roteiros: {
    id: 'roteiros', title: 'Gerador de Roteiros', description: 'Roteiros gerados pelo Cérebro Criativo.',
    agent: 'cerebro_criativo', inputFrom: ['minerador_videos', 'biblioteca_anuncios', 'concorrentes_igaming'],
    outputTo: [], impact: 'alto', complexity: 'alta', modeAware: true,
  },
};

// ─── GUARDIAN: REGRAS (lidas pela IA antes de criar qualquer coisa) ───────────

export const GUARDIAN_RULES = {
  design: [
    'Use apenas cores de G.colors — nunca invente nova cor',
    'Use apenas componentes de design-system/index.tsx',
    'Todo card deve mostrar SourceTrail (modo, agente, fonte)',
    'Espaçamento segue tokens.ts — nunca use px avulso',
    'Toda fonte usa Inter — nunca adicione outra fonte',
  ],
  data: [
    'Dados de trends em src/data/trends.ts',
    'Dados de events em src/data/events.ts',
    'Dados de competitors em src/data/competitors.ts',
    'Dados de brands em src/data/brands.ts',
    'Nunca coloque dados hardcoded dentro de componentes',
  ],
  agents: [
    'Todo output segue interface AgentOutput de schema.ts',
    'Todo card exibe trail.mode, trail.agentName, trail.sourceName',
    'connectsTo define quais agentes consomem o output',
    'Impacto e complexidade sempre declarados',
  ],
  pages: [
    'Toda página nova registra PageContract em schema.ts',
    'Toda página mode-aware usa useMode() do modeContext',
    'Toda página importa apenas de design-system, data, store',
    'Nunca criar página sem definir agent, inputFrom, outputTo',
  ],
} as const;
