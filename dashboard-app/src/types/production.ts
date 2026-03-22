// --- OBJETO BASE DO SISTEMA ---
// Toda linha de produção (L1, L2, L3) deriva de ProductionItem.

export type ProductionStatus =
  | 'pending'
  | 'script'
  | 'editing'
  | 'review'
  | 'done'
  | 'published';

export type LineType = 'L1' | 'L2' | 'L3';

export interface ProductionItem {
  // Base — obrigatório em todas as linhas
  id: string;
  line_type: LineType;
  title: string;
  status: ProductionStatus;
  hook: string;
  offer: string;
  notes: string;
  created_at: string;

  // Copy fields — preenchidos via Copy & Roteiro
  copy_desenvolvimento?: string;
  copy_cta?: string;
  roteiro_json?: string;   // RoteiroScene[] serializado
  template_id?: string;    // referência ao template usado na sessão criativa

  // Output fields — escritos por Clipes Gerados, lidos por Portfólio Criativo
  published_at?: string;   // ISO timestamp — quando foi marcado publicado
  published_url?: string;  // link do post (opcional, sem UI nesta versão)

  // L1 extras — Reels editados
  house_name?: string;

  // L2 extras — Cortes de Live
  timestamp_start?: string;
  timestamp_end?: string;
  source_live?: string;

  // L3 extras — Full IA
  prompt_text?: string;
  variations?: number;
}

// --- CONFIGURAÇÃO DAS LINHAS ---

export const LINE_CONFIG: Record<LineType, {
  label: string;
  description: string;
  meta: number;
  color: string;
  flow: ProductionStatus[];
}> = {
  L1: {
    label: 'L1 — Reels',
    description: 'Vídeos Reels editados com padrão de marca',
    meta: 3,
    color: '#0A84FF',
    flow: ['pending', 'script', 'editing', 'review', 'done', 'published'],
  },
  L2: {
    label: 'L2 — Cortes de Live',
    description: 'Cortes rápidos dos melhores momentos de live',
    meta: 10,
    color: '#FF2D55',
    flow: ['pending', 'editing', 'done', 'published'],
  },
  L3: {
    label: 'L3 — Full IA',
    description: 'Vídeos gerados via roteiro + prompt + 4 variações',
    meta: 4,
    color: '#BF5AF2',
    flow: ['pending', 'script', 'editing', 'done', 'published'],
  },
};

// --- STATUS DISPLAY ---

export const STATUS_DISPLAY: Record<ProductionStatus, { label: string; color: string }> = {
  pending:   { label: 'PENDENTE',   color: 'rgba(255,255,255,0.3)' },
  script:    { label: 'ROTEIRO',    color: '#BF5AF2' },
  editing:   { label: 'EDITANDO',   color: '#FF9500' },
  review:    { label: 'REVISÃO',    color: '#0A84FF' },
  done:      { label: 'FINALIZADO', color: '#32D74B' },
  published: { label: 'PUBLICADO',  color: '#32D74B' },
};

// --- HELPERS ---

export function isConcluido(status: ProductionStatus): boolean {
  return status === 'done' || status === 'published';
}

export function proximoStatus(
  current: ProductionStatus,
  line: LineType
): ProductionStatus {
  const flow = LINE_CONFIG[line].flow;
  const idx = flow.indexOf(current);
  return flow[Math.min(idx + 1, flow.length - 1)];
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function gerarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// --- STORAGE ---
// Chave compartilhada para integração futura com Hoje

export const STORAGE_KEY = (date: string) => `production_items_${date}`;

export function loadItems(date: string): ProductionItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY(date));
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

// Varre todos os dias no localStorage, excluindo um dia específico.
// Usado pelos indicadores de cross-day em Produção e Clipes Gerados.
// Fácil de substituir por query Supabase futura: SELECT * FROM production_items WHERE date != excludeDate
export function scanAllDays(excludeDate?: string): { date: string; items: ProductionItem[] }[] {
  const results: { date: string; items: ProductionItem[] }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('production_items_')) continue;
    const date = key.replace('production_items_', '');
    if (excludeDate && date === excludeDate) continue;
    try {
      const items: ProductionItem[] = JSON.parse(localStorage.getItem(key) ?? '[]');
      if (items.length > 0) results.push({ date, items });
    } catch { /* skip */ }
  }
  return results.sort((a, b) => b.date > a.date ? 1 : b.date < a.date ? -1 : 0);
}

export function loadAllPublished(): ProductionItem[] {
  const results: ProductionItem[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('production_items_')) continue;
    try {
      const items: ProductionItem[] = JSON.parse(localStorage.getItem(key) ?? '[]');
      items.filter(item => item.status === 'published').forEach(item => results.push(item));
    } catch { /* skip */ }
  }
  return results.sort((a, b) => {
    const da = a.published_at ?? a.created_at;
    const db = b.published_at ?? b.created_at;
    return db > da ? 1 : db < da ? -1 : 0;
  });
}

export function saveItems(date: string, items: ProductionItem[]): void {
  localStorage.setItem(STORAGE_KEY(date), JSON.stringify(items));

  // Hook de integração com Hoje — expõe contadores por linha para leitura futura
  // TODO (Fase 2): substituir por upsertDailyProduction no Supabase
  const summary = {
    date,
    L1_done: items.filter(i => i.line_type === 'L1' && isConcluido(i.status)).length,
    L2_done: items.filter(i => i.line_type === 'L2' && isConcluido(i.status)).length,
    L3_done: items.filter(i => i.line_type === 'L3' && isConcluido(i.status)).length,
  };
  localStorage.setItem(`production_summary_${date}`, JSON.stringify(summary));
}
