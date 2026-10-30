import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { GalleryRow } from '../../../lib/supabase';
import { compressImage, uploadImage, removeImageByUrl, LIVE_NOTE } from './image';

export default function GalleryTab({ sb }: { sb: SupabaseClient }) {
  const [items, setItems] = useState<GalleryRow[]>([]);
  const [tag, setTag] = useState<'events' | 'venue'>('events');
  const [progress, setProgress] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    const { data, error } = await sb.from('gallery_photos').select('*')
      .order('sort', { ascending: true }).order('created_at', { ascending: false });
    if (error) setNote({ ok: false, text: error.message });
    setItems((data ?? []) as GalleryRow[]);
  }
  useEffect(() => { load(); }, []);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setNote(null);
    const list = Array.from(files);
    let sort = items.length ? Math.min(...items.map((i) => i.sort)) - 1 : 0;
    try {
      for (let n = 0; n < list.length; n++) {
        setProgress(`Uploading ${n + 1} of ${list.length}…`);
        const blob = await compressImage(list[n], 1600, 2000);
        const url = await uploadImage(sb, 'gallery', blob);
        const { error } = await sb.from('gallery_photos').insert({ url, tag, sort: sort--, alt: null });
        if (error) throw error;
      }
      setNote({ ok: true, text: LIVE_NOTE });
    } catch (err) {
      setNote({ ok: false, text: err instanceof Error ? err.message : 'Upload failed.' });
    } finally {
      setProgress(null);
      load();
    }
  }

  async function update(id: string, patch: Partial<GalleryRow>) {
    setItems((all) => all.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    const { error } = await sb.from('gallery_photos').update(patch).eq('id', id);
    if (error) setNote({ ok: false, text: error.message });
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    const withSort = next.map((it, k) => ({ ...it, sort: k }));
    setItems(withSort);
    await Promise.all([withSort[index], withSort[j]].map((it) => sb.from('gallery_photos').update({ sort: it.sort }).eq('id', it.id)));
  }

  async function remove(item: GalleryRow) {
    const { error } = await sb.from('gallery_photos').delete().eq('id', item.id);
    if (error) { setNote({ ok: false, text: error.message }); return; }
    await removeImageByUrl(sb, item.url);
    setItems((all) => all.filter((i) => i.id !== item.id));
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Gallery</h1>
          <p>Add photos after each night. Newest appear first; use the arrows to reorder.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#8c8a86' }}>Tag new uploads</span>
          {(['events', 'venue'] as const).map((t) => (
            <button key={t} className="adm-chip" aria-pressed={tag === t} onClick={() => setTag(t)}>{t === 'events' ? 'Events' : 'The venue'}</button>
          ))}
          <label className="adm-btn primary adm-file">
            {progress ?? '+ Add photos'}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={progress !== null} onChange={(e) => upload(e.target.files)} />
          </label>
        </div>
      </div>
      {note && <p className={`adm-note ${note.ok ? 'ok' : 'err'}`} role="status">{note.text}</p>}
      {items.length === 0 ? (
        <div className="adm-panel adm-empty">
          <p className="big">No gallery photos yet.</p>
          <p style={{ margin: 0 }}>Until you add some, the Gallery page shows the homepage “club moments”.</p>
        </div>
      ) : (
        <div className="adm-grid">
          {items.map((it, i) => (
            <div className="adm-card" key={it.id}>
              <img src={it.url} alt="" />
              <div className="body">
                <input className="adm-input" style={{ minHeight: 36, fontSize: 13 }} defaultValue={it.alt ?? ''} placeholder="Description (optional)" onBlur={(e) => update(it.id, { alt: e.target.value || null })} />
                <div className="actions">
                  {(['events', 'venue'] as const).map((t) => (
                    <button key={t} className="adm-chip" aria-pressed={it.tag === t} onClick={() => update(it.id, { tag: t })}>{t === 'events' ? 'Events' : 'Venue'}</button>
                  ))}
                </div>
                <div className="actions">
                  <button className="adm-btn sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">←</button>
                  <button className="adm-btn sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move later">→</button>
                  <button className="adm-btn sm ghost" onClick={() => remove(it)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
