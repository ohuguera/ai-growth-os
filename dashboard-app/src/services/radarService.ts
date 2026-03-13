import { supabase } from '../lib/supabase';

export interface ViralVideo {
  id?: string;
  url: string;
  platform: string;
  views?: number;
  likes?: number;
  comments?: number;
  hook_detected?: string;
  format_detected?: string;
  offer_detected?: string;
  created_at?: string;
}

export async function getViralVideos(): Promise<ViralVideo[]> {
  const { data, error } = await supabase
    .from('viral_videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insertViralVideo(
  video: Omit<ViralVideo, 'id' | 'created_at'>
): Promise<void> {
  const { error } = await supabase.from('viral_videos').insert(video);
  if (error) throw error;
}
