// Build-time data loading. Runs when the site is built (and on every
// rebuild triggered by the admin). If Supabase isn't configured yet, the
// site still builds using the default photos and an empty events list.

import { getSupabase, type EventRow, type GalleryRow, type ArtistRow } from './supabase';
import { photoSlots, artists as defaultArtists, type PhotoSlot } from '../content/site';
import { todayBahrain } from './format';
import fs from 'node:fs/promises';
import path from 'node:path';

const useCache = import.meta.env.PROD;

// ── Image mirroring ────────────────────────────────────────────
// During a production build, every photo/flyer stored in Supabase is
// downloaded into the site itself (served from /media/ on Cloudflare).
// Visitors then never download images from Supabase, so its free
// bandwidth limit doesn't matter. In `npm run dev` the original URLs are used.
export const MIRROR_DIR = path.join(process.cwd(), 'node_modules', '.klub360-media');
const mirrorJobs = new Map<string, Promise<string>>();
const STORAGE_MARK = '/storage/v1/object/public/';

async function mirror<T extends string | null | undefined>(url: T): Promise<T | string> {
  if (!useCache || !url || !url.includes(STORAGE_MARK)) return url;
  let job = mirrorJobs.get(url);
  if (!job) {
    job = (async () => {
      const name = url.split(STORAGE_MARK)[1].split('?')[0].replace(/[^a-zA-Z0-9._-]/g, '_');
      const file = path.join(MIRROR_DIR, name);
      try {
        await fs.access(file);
      } catch {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        await fs.mkdir(MIRROR_DIR, { recursive: true });
        await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
      }
      return `/media/${name}`;
    })().catch((err) => {
      console.warn('[klub360] Could not copy image, using Supabase URL:', err.message);
      return url;
    });
    mirrorJobs.set(url, job);
  }
  return job;
}

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
  const rows = (data ?? []) as EventRow[];
  for (const e of rows) e.flyer_url = (await mirror(e.flyer_url)) as string | null;
  return (eventsCache = rows);
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
      for (const row of data ?? []) photosCache[row.slot] = { url: (await mirror(row.url)) as string, alt: row.alt ?? '' };
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
  const rows = (data ?? []) as GalleryRow[];
  for (const g of rows) g.url = (await mirror(g.url)) as string;
  return rows;
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
  const out: ArtistItem[] = [];
  for (const a of (data ?? []) as ArtistRow[]) {
    out.push({
      name: a.name,
      instagram: a.instagram_url,
      other: a.other_url ? { label: a.other_label || 'Link', href: a.other_url } : null,
      photo: (await mirror(a.photo_url)) as string | null,
    });
  }
  return out;
}
