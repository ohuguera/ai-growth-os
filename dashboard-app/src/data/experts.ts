import type { Expert, Preset } from '../types'

export const EXPERTS: Record<string, Expert> = {
  lucas_striz: {
    id: 'lucas_striz',
    name: 'Lucas Striz',
    color: '#6366F1',
    colorMuted: 'rgba(99,102,241,0.15)',
    initials: 'LS',
    style: 'Agressivo · Direto ao ponto',
    watermarkText: 'LUCAS STRIZ +18',
  },
  suh_aviator: {
    id: 'suh_aviator',
    name: 'Suh Aviator',
    color: '#EC4899',
    colorMuted: 'rgba(236,72,153,0.15)',
    initials: 'SA',
    style: 'Emocional · Envolvente',
    watermarkText: 'SUH AVIATOR +18',
  },
  iris_thaize: {
    id: 'iris_thaize',
    name: 'Iris Thaize',
    color: '#10B981',
    colorMuted: 'rgba(16,185,129,0.15)',
    initials: 'IT',
    style: 'Educativo · Demonstração',
    watermarkText: 'IRIS THAIZE +18',
  },
  caio_roleta: {
    id: 'caio_roleta',
    name: 'Caio Roleta',
    color: '#F59E0B',
    colorMuted: 'rgba(245,158,11,0.15)',
    initials: 'CR',
    style: 'Entretenimento · Gameplay',
    watermarkText: 'CAIO ROLETA +18',
  },
}

export const EXPERT_LIST = Object.values(EXPERTS)

export const PRESETS: Preset[] = [
  {
    id: 'rapido',
    name: 'Corte Rápido',
    description: '30–60s · Alto impacto · Máxima energia',
    durationRange: [30, 60],
    icon: '⚡',
  },
  {
    id: 'viral',
    name: 'Corte Viral',
    description: '45–90s · Picos de engajamento · Compartilhável',
    durationRange: [45, 90],
    icon: '🔥',
  },
  {
    id: 'educativo',
    name: 'Corte Educativo',
    description: '60–120s · Explicação clara · Alta retenção',
    durationRange: [60, 120],
    icon: '📖',
  },
  {
    id: 'emocional',
    name: 'Corte Emocional',
    description: '45–75s · Momentos de impacto · Conexão',
    durationRange: [45, 75],
    icon: '💎',
  },
]
