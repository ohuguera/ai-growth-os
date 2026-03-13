import { supabase } from '../lib/supabase';

export interface CreativeTest {
  id?: string;
  title: string;
  hook?: string;
  format?: string;
  offer?: string;
  structure?: string;
  result?: string;
  created_at?: string;
}

export async function getCreativeTests(): Promise<CreativeTest[]> {
  const { data, error } = await supabase
    .from('creative_tests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insertCreativeTest(
  test: Omit<CreativeTest, 'id' | 'created_at'>
): Promise<void> {
  const { error } = await supabase.from('creative_tests').insert(test);
  if (error) throw error;
}

export async function updateCreativeTest(
  id: string,
  updates: Partial<Omit<CreativeTest, 'id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('creative_tests')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}
