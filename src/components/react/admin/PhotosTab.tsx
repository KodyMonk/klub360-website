import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { photoSlots } from '../../../content/site';
import type { PhotoRow } from '../../../lib/supabase';
import { compressImage, uploadImage, removeImageByUrl, LIVE_NOTE } from './image';

export default function PhotosTab({ sb }: { sb: SupabaseClient }) {
  const [rows, setRows] = useState<Record<string, PhotoRow>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    const { data, error } = await sb.from('site_photos').select('slot,url,alt');
    if (error) setNote({ ok: false, text: error.message });
    const map: Record<string, PhotoRow> = {};
    for (const r of (data ?? []) as PhotoRow[]) map[r.slot] = r;
    setRows(map);
  }
  useEffect(() => { load(); }, []);

  async function replace(slot: string, file: File | undefined, alt: string) {
    if (!file) return;
    setBusy(slot);
    setNote(null);
    try {
      const max = slot === 'about_banner' ? [2400, 1400] : [1600, 2000];
      const blob = await compressImage(file, max[0], max[1]);
      const url = await uploadImage(sb, 'photos', blob);
      const old = rows[slot]?.url;
      const { error } = await sb.from('site_photos').upsert({ slot, url, alt: rows[slot]?.alt ?? alt, updated_at: new Date().toISOString() });
      if (error) throw error;
      await removeImageByUrl(sb, old);
      setNote({ ok: true, text: LIVE_NOTE });
      await load();
    } catch (err) {
      setNote({ ok: false, text: err instanceof Error ? err.message : 'Upload failed.' });
    } finally {
      setBusy(null);
    }
  }

  async function reset(slot: string) {
    const old = rows[slot]?.url;
    const { error } = await sb.from('site_photos').delete().eq('slot', slot);
    if (error) { setNote({ ok: false, text: error.message }); return; }
    await removeImageByUrl(sb, old);
    setNote({ ok: true, text: 'Back to the default photo. ' + LIVE_NOTE.replace('Saved. ', '') });
    load();
  }

  async function saveAlt(slot: string, alt: string) {
    if (!rows[slot]) return;
    await sb.from('site_photos').update({ alt }).eq('slot', slot);
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Photos</h1>
          <p>Replace any photo on the website. Upload originals — they’re resized and compressed automatically.</p>
        </div>
      </div>
      {note && <p className={`adm-note ${note.ok ? 'ok' : 'err'}`} role="status">{note.text}</p>}
      <div className="adm-grid">
        {photoSlots.map((s) => {
          const row = rows[s.slot];
          const url = row?.url ?? s.default;
          return (
            <div className="adm-card" key={s.slot}>
              <img src={url} alt="" style={s.slot === 'about_banner' ? { aspectRatio: '2.2 / 1' } : undefined} />
              <div className="body">
                <p style={{ fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 12, color: '#8c8a86' }}>Best size {s.size}{row ? '' : ' · using default'}</p>
                {row && (
                  <input
                    className="adm-input"
                    style={{ minHeight: 36, fontSize: 13 }}
                    defaultValue={row.alt ?? ''}
                    placeholder="Describe the photo (for accessibility)"
                    onBlur={(e) => saveAlt(s.slot, e.target.value)}
                  />
                )}
                <div className="actions">
                  <label className="adm-btn sm adm-file">
                    {busy === s.slot ? 'Uploading…' : 'Replace'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy !== null} onChange={(e) => replace(s.slot, e.target.files?.[0], s.alt)} />
                  </label>
                  {row && <button className="adm-btn sm ghost" onClick={() => reset(s.slot)}>Use default</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
