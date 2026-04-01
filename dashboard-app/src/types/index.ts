export type ExpertId = 'lucas_striz' | 'suh_aviator' | 'iris_thaize' | 'caio_roleta'
export type PresetId = 'rapido' | 'viral' | 'educativo' | 'emocional'
export type JobStatus = 'idle' | 'uploading' | 'transcribing' | 'ready' | 'processing' | 'done' | 'error'

export interface Expert {
  id: ExpertId
  name: string
  color: string
  colorMuted: string
  initials: string
  style: string
  watermarkText: string
}

export interface Preset {
  id: PresetId
  name: string
  description: string
  durationRange: [number, number]
  icon: string
}

export interface Live {
  id: string
  expertId: ExpertId
  title: string
  date: string
  durationSec: number
  status: JobStatus
  jobId?: string
  momentCount?: number
  clipCount?: number
}

export interface Moment {
  start: number
  end: number
  score: number
  text: string
  natural_hook?: string
}

export interface Clip {
  id: string
  start: number
  end: number
  score: number
  status: 'done' | 'error'
  path?: string
  favorited?: boolean
}

export interface BackendJob {
  id: string
  status: string
  video_path: string
  filename: string
  segments: { start: number; end: number; text: string }[]
  moments: Moment[]
  clips: Clip[]
  error?: string
}

// ── Editor de Criativos ──────────────────────────
export type TemplateCategory =
  | 'depoimento' | 'prova_social' | 'educativo'
  | 'storytelling' | 'ganho' | 'hook_agressivo'

export interface CreativeTemplate {
  id: string
  name: string
  category: TemplateCategory
  emoji: string
  primaryColor: string
  secondaryColor: string
  bgGradient: string
  // Caption
  captionPosition: 'top' | 'middle' | 'bottom'
  captionSize: 'small' | 'medium' | 'large'
  captionBold: boolean
  highlightColor: string
  // Structure
  hookDuration: number
  ctaDuration: number
  defaultHook: string
  defaultCta: string
  // Movement
  zoomIntensity: 'none' | 'low' | 'medium' | 'high'
  textEntrance: 'instant' | 'fade' | 'slide'
  // Performance
  performanceIndicator?: 'conversão' | 'retenção' | 'scroll stop' | 'autoridade' | 'engajamento' | 'viralidade'
}

export interface EditorConfig {
  templateId: string
  expertId: ExpertId | null
  primaryColor: string
  secondaryColor: string
  captionPosition: 'top' | 'middle' | 'bottom'
  captionSize: 'small' | 'medium' | 'large'
  captionBold: boolean
  highlightColor: string
  watermark: boolean
  watermarkPosition: 'tr' | 'tl' | 'br' | 'bl'
  watermarkOpacity: number
  hook: string
  hookDuration: number
  cta: string
  ctaDuration: number
  zoomIntensity: 'none' | 'low' | 'medium' | 'high'
  textEntrance: 'instant' | 'fade' | 'slide'
}

// ── Routing Módulo 2 ──────────────────────────────
export type EditorPage =
  | { name: 'home' }
  | { name: 'processing'; jobId: string; filename: string }
  | { name: 'templates'; jobId: string; filename: string }
  | { name: 'editor'; jobId: string; filename: string; templateId: string }
  | { name: 'variations'; jobId: string; filename: string; templateId: string }
  | { name: 'export'; jobId: string; filename: string; templateId: string }

// ── Routing Módulo 1 ──────────────────────────────
export type Page =
  | { name: 'inbox' }
  | { name: 'novo'; liveId?: string }
  | { name: 'processando'; jobId: string; expertId?: ExpertId; liveTitle: string; presetId: PresetId }
  | { name: 'resultados'; jobId: string; expertId?: ExpertId; liveTitle: string }
  | { name: 'ajuste'; jobId: string; clipId: string; expertId?: ExpertId }
