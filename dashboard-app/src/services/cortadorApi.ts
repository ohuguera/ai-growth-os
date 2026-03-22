const BASE_URL = import.meta.env.VITE_CORTADOR_API_URL || 'http://localhost:8000';

export interface Moment {
  start: number;
  end: number;
  duration: number;
  text: string;
  score: number;
  hook_score: number;
  value_score: number;
  trend_score: number;
  flow_score: number;
  natural_hook: string | null;
  reason: string;
}

export interface Clip {
  id: string;
  path?: string;
  start: number;
  end: number;
  score: number;
  status: 'done' | 'error';
  error?: string;
}

export interface Job {
  id: string;
  status: 'uploaded' | 'transcribing' | 'ready' | 'processing' | 'done' | 'error';
  filename: string;
  segments: any[];
  moments: Moment[];
  clips: Clip[];
  error?: string;
}

export interface ProcessPayload {
  job_id: string;
  approved_moments: {
    start: number;
    end: number;
    score: number;
    use_natural_hook: boolean;
    natural_hook: string;
  }[];
  hook: string;
  cta: string;
  caption_position: 'top' | 'middle' | 'bottom';
  watermark: boolean;
}

export const cortadorApi = {
  async checkHealth(): Promise<boolean> {
    try {
      const r = await fetch(`${BASE_URL}/`, { signal: AbortSignal.timeout(2000) });
      return r.ok;
    } catch {
      return false;
    }
  },

  async upload(file: File): Promise<{ job_id: string }> {
    const form = new FormData();
    form.append('file', file);
    const r = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: form });
    if (!r.ok) throw new Error('Erro no upload');
    return r.json();
  },

  async transcribe(jobId: string): Promise<void> {
    const r = await fetch(`${BASE_URL}/transcribe/${jobId}`, { method: 'POST' });
    if (!r.ok) throw new Error('Erro ao iniciar transcrição');
  },

  async getStatus(jobId: string): Promise<Job> {
    const r = await fetch(`${BASE_URL}/status/${jobId}`);
    if (!r.ok) throw new Error('Erro ao buscar status');
    return r.json();
  },

  async process(payload: ProcessPayload): Promise<void> {
    const r = await fetch(`${BASE_URL}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('Erro ao processar clipes');
  },

  downloadUrl(clipId: string): string {
    return `${BASE_URL}/download/${clipId}`;
  },
};
