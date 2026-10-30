import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ArtistRow } from '../../../lib/supabase';
import { compressImage, uploadImage, removeImageByUrl, LIVE_NOTE } from './image';

type Form = Omit<ArtistRow, 'id' | 'sort'> & { id?: string };
const EMPTY: Form = { name: '', instagram_url: '', other_label: '', other_url: '', photo_url: null };
const OTHER_LABELS = ['Spotify', 'SoundCloud', 'Facebook', 'YouTube', 'Website'];

export default function ArtistsTab({ sb }: { sb: SupabaseClient }) {
  const [rows, setRows] = useState<ArtistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await sb.from('artists').select('*')
      .order('sort', { ascending: true }).order('created_at', { ascending: true });
    if (error) setNote({ ok: false, text: error.message });
    setRows((data ?? []) as ArtistRow[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function open(a?: ArtistRow) {
    setNote(null);
    setConfirm(null);
    setPhotoFile(null);
    setPhotoPreview(a?.photo_url ?? null);
    setForm(a ? { ...a } : { ...EMPTY });
  }

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function save() {
    if (!form) return;
    if (!form.name.trim()) { setNote({ ok: false, text: 'Add the artist’s name.' }); return; }
    setSaving(true);
    setNote(null);
    try {
      let photo_url = form.photo_url;
      if (photoFile) {
        const blob = await compressImage(photoFile, 1000, 1250);
        photo_url = await uploadImage(sb, 'artists', blob);
        if (form.photo_url) await removeImageByUrl(sb, form.photo_url);
      }
      const row = {
        name: form.name.trim(),
        instagram_url: form.instagram_url?.trim() || null,
        other_label: form.other_url?.trim() ? (form.other_label?.trim() || 'Link') : null,
        other_url: form.other_url?.trim() || null,
        photo_url,
      };
      if (form.id) {
        const { error } = await sb.from('artists').update(row).eq('id', form.id);
        if (error) throw error;
      } else {
        // New artists go to the top of the list.
        const sort = rows.length ? Math.min(...rows.map((r) => r.sort)) - 1 : 0;
        const { error } = await sb.from('artists').insert({ ...row, sort });
        if (error) throw error;
      }
      setForm(null);
      setNote({ ok: true, text: LIVE_NOTE });
      await load();
    } catch (err) {
      setNote({ ok: false, text: err instanceof Error ? err.message : 'Could not save the artist.' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(a: ArtistRow) {
    const { error } = await sb.from('artists').delete().eq('id', a.id);
    if (error) { setNote({ ok: false, text: error.message }); return; }
    await removeImageByUrl(sb, a.photo_url);
    if (form?.id === a.id) setForm(null);
    setConfirm(null);
    setRows((all) => all.filter((r) => r.id !== a.id));
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[index], next[j]] = [next[j], next[index]];
    const withSort = next.map((r, k) => ({ ...r, sort: k + 1 }));
    setRows(withSort);
    await Promise.all(withSort.map((r) => sb.from('artists').update({ sort: r.sort }).eq('id', r.id)));
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Artists</h1>
          <p>The “Who’s played KLUB360°” list. New artists are added to the top; use the arrows to reorder.</p>
        </div>
        <button className="adm-btn primary" onClick={() => open()}>+ Add artist</button>
      </div>

      {note && !form && <p className={`adm-note ${note.ok ? 'ok' : 'err'}`} role="status">{note.text}</p>}

      <div className="adm-split">
        <section className="adm-panel adm-list" aria-label="Artists list">
          {loading ? (
            <p className="adm-empty">Loading…</p>
          ) : rows.length === 0 ? (
            <div className="adm-empty"><p className="big">No artists yet.</p><p style={{ margin: 0 }}>Click “+ Add artist”.</p></div>
          ) : (
            rows.map((a, i) => (
              <div key={a.id} className={`adm-row${form?.id === a.id ? ' active' : ''}`}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', color: '#8c8a86', minWidth: 24 }}>{String(i + 1).padStart(2, '0')}</span>
                {a.photo_url ? <img className="adm-thumb" style={{ width: 40, height: 40, borderRadius: 999 }} src={a.photo_url} alt="" /> : null}
                <div className="t">
                  <p className="title">{a.name}</p>
                  <p className="sub">{[a.instagram_url && 'Instagram', a.other_url && (a.other_label || 'Link')].filter(Boolean).join(' · ') || 'No links'}</p>
                </div>
                <button className="adm-btn sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${a.name} up`}>↑</button>
                <button className="adm-btn sm" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`Move ${a.name} down`}>↓</button>
                <button className="adm-btn sm" onClick={() => open(a)}>Edit</button>
                {confirm === a.id
                  ? <button className="adm-btn sm danger" onClick={() => remove(a)}>Confirm</button>
                  : <button className="adm-btn sm ghost" onClick={() => setConfirm(a.id)} aria-label={`Delete ${a.name}`}>Delete</button>}
              </div>
            ))
          )}
        </section>

        <section className="adm-panel adm-editor" aria-label="Artist editor">
          {!form ? (
            <div className="adm-empty" style={{ padding: '48px 8px' }}>
              <p className="big">Pick an artist to edit</p>
              <p style={{ margin: 0 }}>or add a new one.</p>
            </div>
          ) : (
            <div className="adm-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 400 }}>{form.id ? 'Edit artist' : 'New artist'}</h2>
                <button className="adm-btn sm ghost" onClick={() => setForm(null)}>Cancel</button>
              </div>
              <label>Name *<input className="adm-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Dubfire" /></label>
              <label>Instagram link<input className="adm-input" type="url" value={form.instagram_url ?? ''} onChange={(e) => set('instagram_url', e.target.value)} placeholder="https://www.instagram.com/…" /></label>
              <div className="adm-2">
                <label>Second link type
                  <select className="adm-input" value={form.other_label || 'Spotify'} onChange={(e) => set('other_label', e.target.value)}>
                    {OTHER_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </label>
                <label>Second link (optional)<input className="adm-input" type="url" value={form.other_url ?? ''} onChange={(e) => set('other_url', e.target.value)} placeholder="https://…" /></label>
              </div>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 12, color: '#8c8a86' }}>Photo (optional, square or 4:5)</p>
                <label className="adm-drop">
                  {photoPreview ? <img src={photoPreview} alt="" /> : <span className="ph" aria-hidden="true" />}
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#f2eee8' }}>{photoPreview ? 'Replace photo' : 'Upload photo'}</span>
                    <span style={{ fontSize: 12, color: '#8c8a86' }}>Shown as a small round image next to the name</span>
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
                </label>
                {photoPreview && (
                  <button type="button" className="adm-link" style={{ marginTop: 8 }} onClick={() => { setPhotoFile(null); setPhotoPreview(null); set('photo_url', null); }}>Remove photo</button>
                )}
              </div>
              {note && <p className={`adm-note ${note.ok ? 'ok' : 'err'}`} role="alert">{note.text}</p>}
              <button className="adm-btn primary" style={{ minHeight: 50 }} onClick={save} disabled={saving}>
                {saving ? 'Saving…' : form.id ? 'Save changes' : 'Add artist'}
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
