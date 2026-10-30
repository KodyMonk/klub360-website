import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { EventRow } from '../../../lib/supabase';
import { longDate, slugify, todayBahrain } from '../../../lib/format';
import { compressImage, uploadImage, removeImageByUrl, LIVE_NOTE } from './image';

type Filter = 'All' | 'Upcoming' | 'Drafts' | 'Past';
type Form = Omit<EventRow, 'id' | 'slug' | 'created_at'> & { id?: string; slug?: string };

const EMPTY: Form = {
  title: '', headliner: '', event_date: '', doors: '6 PM', genre: '', price: '',
  description: '', ticket_url: '', flyer_url: null, status: 'draft', featured: false,
};

export default function EventsTab({ sb }: { sb: SupabaseClient }) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('All');
  const [form, setForm] = useState<Form | null>(null);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const today = todayBahrain();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb.from('events').select('*').order('event_date', { ascending: false });
    if (error) setNote({ ok: false, text: error.message });
    setEvents((data ?? []) as EventRow[]);
    setLoading(false);
  }, [sb]);

  useEffect(() => { load(); }, [load]);

  const label = (e: EventRow) => (e.event_date < today ? 'Past' : e.status === 'published' ? 'Published' : 'Draft');

  const shown = useMemo(() => {
    const upcoming = events.filter((e) => e.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date));
    const past = events.filter((e) => e.event_date < today);
    const ordered = [...upcoming, ...past];
    if (filter === 'Upcoming') return ordered.filter((e) => label(e) === 'Published');
    if (filter === 'Drafts') return ordered.filter((e) => label(e) === 'Draft');
    if (filter === 'Past') return ordered.filter((e) => label(e) === 'Past');
    return ordered;
  }, [events, filter, today]);

  const homepage = events
    .filter((e) => e.status === 'published' && e.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  const onHome = homepage.find((e) => e.featured) ?? homepage[0];

  function open(e?: EventRow) {
    setNote(null);
    setConfirmDelete(null);
    setFlyerFile(null);
    setFlyerPreview(e?.flyer_url ?? null);
    setForm(e ? { ...e } : { ...EMPTY });
  }

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function pickFlyer(file: File | undefined) {
    if (!file) return;
    setFlyerFile(file);
    setFlyerPreview(URL.createObjectURL(file));
  }

  async function save() {
    if (!form) return;
    if (!form.title.trim() || !form.event_date) {
      setNote({ ok: false, text: 'Add at least a title and a date.' });
      return;
    }
    setSaving(true);
    setNote(null);
    try {
      let flyer_url = form.flyer_url;
      if (flyerFile) {
        const blob = await compressImage(flyerFile, 1600, 2000);
        flyer_url = await uploadImage(sb, 'events', blob);
        if (form.flyer_url) await removeImageByUrl(sb, form.flyer_url);
      }
      const row = {
        title: form.title.trim(),
        headliner: form.headliner?.trim() || null,
        event_date: form.event_date,
        doors: form.doors?.trim() || null,
        genre: form.genre?.trim() || null,
        price: form.price?.trim() || null,
        description: form.description?.trim() || null,
        ticket_url: form.ticket_url?.trim() || null,
        flyer_url,
        status: form.status,
        featured: form.featured,
      };

      let savedId = form.id;
      if (form.id) {
        const { error } = await sb.from('events').update(row).eq('id', form.id);
        if (error) throw error;
      } else {
        const base = slugify(`${row.title}-${row.event_date}`) || `event-${row.event_date}`;
        let res = await sb.from('events').insert({ ...row, slug: base }).select('id').single();
        if (res.error?.code === '23505') {
          res = await sb.from('events').insert({ ...row, slug: `${base}-${Math.random().toString(36).slice(2, 6)}` }).select('id').single();
        }
        if (res.error) throw res.error;
        savedId = res.data.id;
      }
      if (row.featured && savedId) {
        await sb.from('events').update({ featured: false }).neq('id', savedId).eq('featured', true);
      }
      setForm(null);
      setFlyerFile(null);
      setNote({ ok: true, text: LIVE_NOTE });
      await load();
    } catch (err) {
      setNote({ ok: false, text: err instanceof Error ? err.message : 'Could not save the event.' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(e: EventRow) {
    const { error } = await sb.from('events').delete().eq('id', e.id);
    if (error) { setNote({ ok: false, text: error.message }); return; }
    await removeImageByUrl(sb, e.flyer_url);
    if (form?.id === e.id) setForm(null);
    setConfirmDelete(null);
    setNote({ ok: true, text: 'Event deleted. ' + LIVE_NOTE.replace('Saved. ', '') });
    load();
  }

  const counts = {
    upcoming: events.filter((e) => e.status === 'published' && e.event_date >= today).length,
    drafts: events.filter((e) => e.status === 'draft' && e.event_date >= today).length,
    past: events.filter((e) => e.event_date < today).length,
  };

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Events</h1>
          <p>Published events go live on the website. “Feature on homepage” picks the one shown on the homepage.</p>
        </div>
        <button className="adm-btn primary" onClick={() => open()}>+ New event</button>
      </div>

      <div className="adm-stats">
        <div className="adm-stat"><p className="k">Upcoming</p><p className="v">{counts.upcoming}</p></div>
        <div className="adm-stat"><p className="k">Drafts</p><p className="v">{counts.drafts}</p></div>
        <div className="adm-stat"><p className="k">Past</p><p className="v">{counts.past}</p></div>
        <div className="adm-stat"><p className="k">On homepage</p><p className="v sm">{onHome?.title ?? 'None yet'}</p></div>
      </div>

      {note && !form && <p className={`adm-note ${note.ok ? 'ok' : 'err'}`} role="status">{note.text}</p>}

      <div className="adm-split">
        <section className="adm-panel adm-list" aria-label="Events list">
          <div className="adm-filters">
            {(['All', 'Upcoming', 'Drafts', 'Past'] as Filter[]).map((f) => (
              <button key={f} className="adm-chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          {loading ? (
            <p className="adm-empty">Loading…</p>
          ) : shown.length === 0 ? (
            <div className="adm-empty">
              <p className="big">No events yet.</p>
              <p style={{ margin: 0 }}>Click “+ New event” to add your first one.</p>
            </div>
          ) : (
            shown.map((e) => {
              const st = label(e);
              return (
                <div key={e.id} className={`adm-row${form?.id === e.id ? ' active' : ''}`}>
                  {e.flyer_url ? <img className="adm-thumb" src={e.flyer_url} alt="" /> : <span className="adm-thumb empty" aria-hidden="true" />}
                  <div className="t">
                    <p className="title">{e.title}</p>
                    <p className="sub">
                      {longDate(e.event_date)} · {e.doors || '—'}
                      {e.featured && st !== 'Past' && <span style={{ color: '#f5a462' }}> · Featured</span>}
                    </p>
                  </div>
                  <span className={`adm-pill ${st === 'Published' ? 'pub' : st === 'Draft' ? 'draft' : 'past'}`}>{st}</span>
                  <button className="adm-btn sm" onClick={() => open(e)}>Edit</button>
                  {confirmDelete === e.id ? (
                    <button className="adm-btn sm danger" onClick={() => remove(e)}>Confirm</button>
                  ) : (
                    <button className="adm-btn sm ghost" onClick={() => setConfirmDelete(e.id)} aria-label={`Delete ${e.title}`}>Delete</button>
                  )}
                </div>
              );
            })
          )}
        </section>

        <section className="adm-panel adm-editor" aria-label="Event editor">
          {!form ? (
            <div className="adm-empty" style={{ padding: '48px 8px' }}>
              <p className="big">Pick an event to edit</p>
              <p style={{ margin: 0 }}>or create a new one.</p>
            </div>
          ) : (
            <div className="adm-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 400 }}>{form.id ? 'Edit event' : 'New event'}</h2>
                <button className="adm-btn sm ghost" onClick={() => setForm(null)}>Cancel</button>
              </div>
              <label>Event title *<input className="adm-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Halloween Night" /></label>
              <label>Headliner<input className="adm-input" value={form.headliner ?? ''} onChange={(e) => set('headliner', e.target.value)} placeholder="DJ / artist name" /></label>
              <div className="adm-2">
                <label>Date *<input className="adm-input" type="date" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} style={{ colorScheme: 'dark' }} /></label>
                <label>Doors<input className="adm-input" value={form.doors ?? ''} onChange={(e) => set('doors', e.target.value)} /></label>
              </div>
              <div className="adm-2">
                <label>Music / genre<input className="adm-input" value={form.genre ?? ''} onChange={(e) => set('genre', e.target.value)} placeholder="e.g. Techno" /></label>
                <label>Tickets from (BHD)<input className="adm-input" value={form.price ?? ''} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 25" /></label>
              </div>
              <label>Short description<textarea className="adm-input" rows={3} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} /></label>
              <label>Ticket link<input className="adm-input" type="url" value={form.ticket_url ?? ''} onChange={(e) => set('ticket_url', e.target.value)} placeholder="https://manama.platinumlist.net/…" /></label>

              <div>
                <p style={{ margin: '0 0 6px', fontSize: 12, color: '#8c8a86' }}>Flyer (1080 × 1350)</p>
                <label className="adm-drop">
                  {flyerPreview ? <img src={flyerPreview} alt="" /> : <span className="ph" aria-hidden="true" />}
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#f2eee8' }}>{flyerPreview ? 'Replace flyer' : 'Upload flyer'}</span>
                    <span style={{ fontSize: 12, color: '#8c8a86' }}>JPG, PNG or WebP — resized automatically</span>
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => pickFlyer(e.target.files?.[0])} />
                </label>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8c8a86', marginRight: 4 }}>Status</span>
                {(['published', 'draft'] as const).map((s) => (
                  <button key={s} type="button" className="adm-chip" aria-pressed={form.status === s} onClick={() => set('status', s)}>
                    {s === 'published' ? 'Published' : 'Draft'}
                  </button>
                ))}
              </div>

              <button type="button" role="switch" aria-checked={form.featured} className="adm-switch" onClick={() => set('featured', !form.featured)}>
                <span>Feature on homepage</span>
                <span className="track" aria-hidden="true"><span className="knob" /></span>
              </button>

              {note && <p className={`adm-note ${note.ok ? 'ok' : 'err'}`} role="alert">{note.text}</p>}
              <button className="adm-btn primary" style={{ minHeight: 50 }} onClick={save} disabled={saving}>
                {saving ? 'Saving…' : form.id ? 'Save changes' : 'Create event'}
              </button>
              {form.id && form.slug && form.status === 'published' && (
                <a className="adm-link" href={`/events/${form.slug}/`} target="_blank" rel="noopener">View event page →</a>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
