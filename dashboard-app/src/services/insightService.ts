import { supabase } from '../lib/supabase';

export interface SystemInsight {
  id?: string;
  type: string;
  content: string;
  created_at?: string;
}

export async function getInsights(type?: string): Promise<SystemInsight[]> {
  let query = supabase
    .from('system_insights')
    .select('*')
    .order('created_at', { ascending: false });

  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function insertInsight(
  insight: Omit<SystemInsight, 'id' | 'created_at'>
): Promise<void> {
  const { error } = await supabase.from('system_insights').insert(insight);
  if (error) throw error;
}
