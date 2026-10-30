import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ApplicationRow } from '../../../lib/supabase';

export default function ApplicationsTab({ sb }: { sb: SupabaseClient }) {
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await sb.from('applications').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    setRows((data ?? []) as ApplicationRow[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function openCv(path: string) {
    const { data, error } = await sb.storage.from('cvs').createSignedUrl(path, 120);
    if (error || !data) { setError(error?.message ?? 'Could not open the CV.'); return; }
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  async function remove(r: ApplicationRow) {
    const { error } = await sb.from('applications').delete().eq('id', r.id);
    if (error) { setError(error.message); return; }
    if (r.cv_path) await sb.storage.from('cvs').remove([r.cv_path]);
    setRows((all) => all.filter((x) => x.id !== r.id));
    setConfirm(null);
  }

  const wa = (phone: string) => `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Job applications</h1>
          <p>Sent from the Careers page. Delete applications once you’ve dealt with them.</p>
        </div>
        <button className="adm-btn sm" onClick={load}>Refresh</button>
      </div>
      {error && <p className="adm-note err">{error}</p>}
      <section className="adm-panel">
        {loading ? (
          <p className="adm-empty">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="adm-empty"><p className="big">No applications yet.</p></div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="adm-row" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className="t" style={{ flex: '1 1 260px' }}>
                <p className="title">{r.name} <span className="adm-pill draft" style={{ marginLeft: 8 }}>{r.position}</span></p>
                <p className="sub">{new Date(r.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                {r.message && <p style={{ marginTop: 8, color: '#d9d5cf', whiteSpace: 'pre-wrap' }}>{r.message}</p>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {r.phone && <a className="adm-btn sm" href={wa(r.phone)} target="_blank" rel="noopener">WhatsApp {r.phone}</a>}
                {r.email && <a className="adm-btn sm" href={`mailto:${r.email}`}>Email</a>}
                {r.cv_path && <button className="adm-btn sm" onClick={() => openCv(r.cv_path!)}>Open CV</button>}
                {confirm === r.id
                  ? <button className="adm-btn sm danger" onClick={() => remove(r)}>Confirm delete</button>
                  : <button className="adm-btn sm ghost" onClick={() => setConfirm(r.id)}>Delete</button>}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}
