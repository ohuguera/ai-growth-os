import type { BackendJob } from '../types'

const BASE = (import.meta as { env: Record<string, string> }).env.VITE_CORTADOR_API_URL || 'https://ai-growth-os-production-bf81.up.railway.app'

export async function uploadVideo(file: File): Promise<{ job_id: string; filename: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Falha no upload')
  return res.json()
}

const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadVideoChunked(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ job_id: string; filename: string }> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

  // 1. Inicializa o job
  const initRes = await fetch(`${BASE}/upload/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, total_chunks: totalChunks }),
  })
  if (!initRes.ok) throw new Error('Falha ao inicializar upload')
  const { job_id } = await initRes.json()

  // 2. Envia chunks sequencialmente
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const chunk = file.slice(start, start + CHUNK_SIZE)

    const form = new FormData()
    form.append('job_id', job_id)
    form.append('chunk_index', String(i))
    form.append('total_chunks', String(totalChunks))
    form.append('file', chunk, file.name)

    const res = await fetch(`${BASE}/upload/chunk`, { method: 'POST', body: form })
    if (!res.ok) throw new Error(`Falha no chunk ${i + 1}/${totalChunks}`)

    if (onProgress) onProgress(Math.round(((i + 1) / totalChunks) * 100))
  }

  // 3. Finaliza — concatena os chunks no backend
  const finalRes = await fetch(`${BASE}/upload/finalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id }),
  })
  if (!finalRes.ok) throw new Error('Falha ao finalizar upload')

  return finalRes.json()
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
  use_cta_video?: boolean
  caption_style?: string
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

export function premiereXmlUrl(jobId: string): string {
  return `${BASE}/export/premiere/${jobId}`
}

export async function uploadCtaVideo(jobId: string, file: File): Promise<{ status: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/upload/cta-video/${jobId}`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Falha no upload do CTA')
  return res.json()
}
