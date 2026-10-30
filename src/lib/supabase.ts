import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && key && !url.includes('YOUR-PROJECT'));

let client: SupabaseClient | null = null;

/** Returns a Supabase client, or null if the .env values are not set yet. */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) client = createClient(url!, key!);
  return client;
}

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  headliner: string | null;
  event_date: string; // YYYY-MM-DD
  doors: string | null;
  genre: string | null;
  price: string | null;
  description: string | null;
  ticket_url: string | null;
  flyer_url: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  created_at?: string;
};

export type PhotoRow = { slot: string; url: string; alt: string | null };

export type GalleryRow = {
  id: string;
  url: string;
  alt: string | null;
  tag: 'events' | 'venue';
  sort: number;
  created_at?: string;
};

export type ApplicationRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string;
  message: string | null;
  cv_path: string | null;
  created_at: string;
};

export type ArtistRow = {
  id: string;
  name: string;
  instagram_url: string | null;
  other_label: string | null;
  other_url: string | null;
  photo_url: string | null;
  sort: number;
};
