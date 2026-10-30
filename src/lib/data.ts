// Build-time data loading. Runs when the site is built (and on every
// rebuild triggered by the admin). If Supabase isn't configured yet, the
// site still builds using the default photos and an empty events list.

import { getSupabase, type EventRow, type GalleryRow, type ArtistRow } from './supabase';
import { photoSlots, artists as defaultArtists, type PhotoSlot } from '../content/site';
import { todayBahrain } from './format';

const useCache = import.meta.env.PROD;

let eventsCache: EventRow[] | null = null;

export async function getPublishedEvents(): Promise<EventRow[]> {
  if (useCache && eventsCache) return eventsCache;
  const sb = getSupabase();
  if (!sb) return (eventsCache = []);
  const { data, error } = await sb
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: true });
  if (error) {
    console.warn('[klub360] Could not load events:', error.message);
    return (eventsCache = []);
  }
  return (eventsCache = (data ?? []) as EventRow[]);
}

export async function getUpcomingEvents() {
  const today = todayBahrain();
  return (await getPublishedEvents()).filter((e) => e.event_date >= today);
}

export async function getPastEvents() {
  const today = todayBahrain();
  return (await getPublishedEvents()).filter((e) => e.event_date < today).reverse();
}

/** The event shown on the homepage: the featured one, else the next upcoming. */
export async function getHomepageEvent(): Promise<EventRow | null> {
  const upcoming = await getUpcomingEvents();
  return upcoming.find((e) => e.featured) ?? upcoming[0] ?? null;
}

export type Photo = { url: string; alt: string };
let photosCache: Record<string, Photo> | null = null;

export async function getPhotos(): Promise<Record<PhotoSlot, Photo>> {
  if (!useCache || !photosCache) {
    photosCache = {};
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb.from('site_photos').select('slot,url,alt');
      if (error) console.warn('[klub360] Could not load photos:', error.message);
      for (const row of data ?? []) photosCache[row.slot] = { url: row.url, alt: row.alt ?? '' };
    }
  }
  const out = {} as Record<PhotoSlot, Photo>;
  for (const s of photoSlots) {
    const custom = photosCache[s.slot];
    out[s.slot] = { url: custom?.url || s.default, alt: custom?.alt || s.alt };
  }
  return out;
}

export async function getMoments(): Promise<Photo[]> {
  const p = await getPhotos();
  return [p.moment_1, p.moment_2, p.moment_3, p.moment_4, p.moment_5, p.moment_6];
}

export async function getGallery(): Promise<GalleryRow[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from('gallery_photos')
    .select('*')
    .order('sort', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[klub360] Could not load gallery:', error.message);
    return [];
  }
  return (data ?? []) as GalleryRow[];
}

export type ArtistItem = {
  name: string;
  instagram: string | null;
  other: { label: string; href: string } | null;
  photo: string | null;
};

/** Artists managed in the admin. Falls back to the list in site.ts if Supabase isn't set up. */
export async function getArtists(): Promise<ArtistItem[]> {
  const fallback = defaultArtists.map((a) => ({ name: a.name, instagram: a.instagram, other: a.other ?? null, photo: null }));
  const sb = getSupabase();
  if (!sb) return fallback;
  const { data, error } = await sb.from('artists').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true });
  if (error) {
    console.warn('[klub360] Could not load artists:', error.message);
    return fallback;
  }
  return ((data ?? []) as ArtistRow[]).map((a) => ({
    name: a.name,
    instagram: a.instagram_url,
    other: a.other_url ? { label: a.other_label || 'Link', href: a.other_url } : null,
    photo: a.photo_url,
  }));
}
