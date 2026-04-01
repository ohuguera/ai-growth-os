import type { BackendJob } from '../types'

const BASE = (import.meta as { env: Record<string, string> }).env.VITE_CORTADOR_API_URL || 'https://ai-growth-os-production-5989.up.railway.app'

export async function uploadVideo(file: File): Promise<{ job_id: string; filename: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Falha no upload')
  return res.json()
}

export async function startTranscription(jobId: string): Promise<void> {
  const res = await fetch(`${BASE}/transcribe/${jobId}`, { method: 'POST' })
  if (!res.ok) throw new Error('Falha ao iniciar transcrição')
}

export async function getJob(jobId: string): Promise<BackendJob> {
  const res = await fetch(`${BASE}/status/${jobId}`)
  if (!res.ok) throw new Error('Falha ao buscar status')
  return res.json()
}

export interface ProcessParams {
  job_id: string
  approved_moments: { start: number; end: number; score: number; use_natural_hook: boolean; natural_hook: string }[]
  hook: string
  cta: string
  caption_position: 'top' | 'middle' | 'bottom'
  watermark: boolean
}

export async function processClips(params: ProcessParams): Promise<void> {
  const res = await fetch(`${BASE}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Falha ao processar clipes')
}

export function downloadUrl(clipId: string): string {
  return `${BASE}/download/${clipId}`
}
