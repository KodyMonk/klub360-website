import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Shrinks an image in the browser before upload and converts it to WebP
 * (or JPEG on browsers that can't encode WebP). Keeps uploads small and
 * the website fast, whatever size the original photo is.
 */
export async function compressImage(file: File, maxW: number, maxH: number, quality = 0.85): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('This image format isn’t supported. Please use JPG, PNG or WebP.');
  }
  const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process the image.');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), type, quality));

  const webp = await toBlob('image/webp');
  if (webp && webp.type === 'image/webp') return webp;
  const jpeg = await toBlob('image/jpeg');
  if (!jpeg) throw new Error('Could not process the image.');
  return jpeg;
}

/** Uploads to the public "media" bucket and returns the public URL. */
export async function uploadImage(sb: SupabaseClient, folder: string, blob: Blob): Promise<string> {
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from('media').upload(path, blob, {
    contentType: blob.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}

/** Deletes a previously uploaded media file, given its public URL. Ignores defaults. */
export async function removeImageByUrl(sb: SupabaseClient, url: string | null | undefined) {
  if (!url) return;
  const marker = '/storage/v1/object/public/media/';
  const i = url.indexOf(marker);
  if (i === -1) return;
  const path = decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
  await sb.storage.from('media').remove([path]);
}

export const LIVE_NOTE = 'Saved. The website updates in about a minute.';
