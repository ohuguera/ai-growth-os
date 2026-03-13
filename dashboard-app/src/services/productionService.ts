import { supabase } from '../lib/supabase';

export interface DailyProduction {
  id?: string;
  date: string;
  reels_done: number;
  criativos_done: number;
  cortes_done: number;
  status: string | null;
  created_at?: string;
}

export async function getDailyProduction(date: string): Promise<DailyProduction | null> {
  const { data, error } = await supabase
    .from('daily_production')
    .select('*')
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertDailyProduction(
  record: Omit<DailyProduction, 'id' | 'created_at'>
): Promise<void> {
  const { error } = await supabase
    .from('daily_production')
    .upsert(record, { onConflict: 'date' });

  if (error) throw error;
}
