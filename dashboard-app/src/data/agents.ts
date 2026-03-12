import type { AgentId, ImpactLevel, ComplexityLevel, OutputType } from './schema';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  emoji: string;
  role: string;
  description: string;
  color: string;
  status: 'ativo' | 'aguardando' | 'processando';
  progress: number;
  currentTask: string;
  inputTypes: string[];
  outputTypes: OutputType[];
  impact: ImpactLevel;
  complexity: ComplexityLevel;
  connectsTo: AgentId[];
  receiveFrom: AgentId[];
}

export const AGENTS: AgentDefinition[] = [
  {
    id: 'minerador_videos',
    name: 'Agente Minerador de Vídeos',
    emoji: '🎬',
    role: 'Mineração de Conteúdo Viral',
    description: 'Varre TikTok, Instagram Reels e YouTube Shorts detectando vídeos virais e padrões de formato.',
    color: '#FF0050',
    status: 'ativo',
    progress: 78,
    currentTask: 'Analisando vídeos virais de iGaming no TikTok',
    inputTypes: ['links_instagram', 'links_tiktok', 'links_youtube', 'modo_ativo'],
    outputTypes: ['video_viral', 'format_idea', 'hook'],
    impact: 'alto',
    complexity: 'média',
    connectsTo: ['cerebro_criativo', 'retrovisor'],
    receiveFrom: [],
  },
  {
    id: 'biblioteca_anuncios',
    name: 'Agente de Biblioteca de Anúncios',
    emoji: '📚',
    role: 'Análise de Anúncios',
    description: 'Analisa bibliotecas de anúncios de concorrentes bet e grandes marcas, identificando hooks, CTAs e ofertas.',
    color: '#FF9500',
    status: 'ativo',
    progress: 92,
    currentTask: 'Catalogando anúncios da Betano e Bet365',
    inputTypes: ['competitor_list', 'brand_list', 'modo_ativo'],
    outputTypes: ['ad_insight', 'hook', 'offer'],
    impact: 'alto',
    complexity: 'média',
    connectsTo: ['cerebro_criativo', 'retrovisor'],
    receiveFrom: [],
  },
  {
    id: 'concorrentes_igaming',
    name: 'Agente de Concorrentes iGaming',
    emoji: '🔍',
    role: 'Inteligência Competitiva',
    description: 'Monitora Tier Alto e Tier Médio de concorrentes bet, mapeando estratégias, formatos e ofertas.',
    color: '#FF3B30',
    status: 'ativo',
    progress: 65,
    currentTask: 'Mapeando estratégia de Stake e Pixbet',
    inputTypes: ['tier_alto_list', 'tier_medio_list'],
    outputTypes: ['competitor_analysis', 'hook', 'offer'],
    impact: 'alto',
    complexity: 'alta',
    connectsTo: ['cerebro_criativo'],
    receiveFrom: [],
  },
  {
    id: 'grandes_marcas_agent',
    name: 'Agente de Grandes Marcas',
    emoji: '🏢',
    role: 'Referências Premium',
    description: 'Analisa campanhas das 30 maiores marcas do Brasil e adapta insights criativos para iGaming.',
    color: '#BF5AF2',
    status: 'ativo',
    progress: 45,
    currentTask: 'Analisando campanhas da Nubank e iFood',
    inputTypes: ['brands_list', 'modo_ativo'],
    outputTypes: ['brand_analysis', 'hook', 'format_idea'],
    impact: 'alto',
    complexity: 'alta',
    connectsTo: ['cerebro_criativo'],
    receiveFrom: [],
  },
  {
    id: 'cerebro_criativo',
    name: 'Cérebro Criativo',
    emoji: '🧠',
    role: 'Geração Criativa',
    description: 'Recebe todos os insights e gera roteiros, copy, campanhas, formatos e ofertas adaptados para iGaming.',
    color: '#30D158',
    status: 'processando',
    progress: 33,
    currentTask: 'Gerando 5 roteiros com base em tendências do TikTok',
    inputTypes: ['video_viral', 'ad_insight', 'competitor_analysis', 'brand_analysis'],
    outputTypes: ['script', 'copy', 'campaign_idea', 'format_idea', 'offer'],
    impact: 'alto',
    complexity: 'alta',
    connectsTo: ['retrovisor'],
    receiveFrom: ['minerador_videos', 'biblioteca_anuncios', 'concorrentes_igaming', 'grandes_marcas_agent'],
  },
  {
    id: 'retrovisor',
    name: 'Agente Retrovisor',
    emoji: '🪞',
    role: 'Revisão de Processo',
    description: 'Revisa o processo completo, identifica gargalos, fluxos manuais e sugere melhorias ranqueadas por impacto.',
    color: '#0A84FF',
    status: 'aguardando',
    progress: 20,
    currentTask: 'Aguardando outputs do Cérebro Criativo',
    inputTypes: ['video_viral', 'ad_insight', 'script', 'campaign_idea', 'process_data'],
    outputTypes: ['process_review'],
    impact: 'alto',
    complexity: 'alta',
    connectsTo: [],
    receiveFrom: ['minerador_videos', 'biblioteca_anuncios', 'cerebro_criativo'],
  },
];

export const getAgentById = (id: AgentId): AgentDefinition | undefined =>
  AGENTS.find(a => a.id === id);
