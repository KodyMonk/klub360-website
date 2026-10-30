import { useEffect, useState, type FormEvent } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '../../../lib/supabase';
import EventsTab from './EventsTab';
import PhotosTab from './PhotosTab';
import GalleryTab from './GalleryTab';
import ApplicationsTab from './ApplicationsTab';
import ArtistsTab from './ArtistsTab';
import './admin.css';

type Tab = 'events' | 'artists' | 'photos' | 'gallery' | 'applications' | 'account';
const TABS: { key: Tab; label: string }[] = [
  { key: 'events', label: 'Events' },
  { key: 'artists', label: 'Artists' },
  { key: 'photos', label: 'Photos' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'applications', label: 'Job applications' },
  { key: 'account', label: 'Account' },
];

export default function AdminApp() {
  const sb = getSupabase();
  if (!sb) return <NotConfigured />;
  return <Gate sb={sb} />;
}

function NotConfigured() {
  return (
    <div className="adm-login">
      <div className="box">
        <img src="/images/logo-wordmark.png" alt="Klub360" />
        <h1>Admin isn’t connected yet</h1>
        <p style={{ margin: 0, color: '#b5b1ab' }}>
          Add your Supabase URL and anon key to the <code>.env</code> file (or the Cloudflare Pages
          environment variables), then rebuild. See README step 2.
        </p>
      </div>
    </div>
  );
}

function Gate({ sb }: { sb: SupabaseClient }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    sb.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [sb, session]);

  if (loading) return <div className="adm-login"><p style={{ color: '#8c8a86' }}>Loading…</p></div>;
  if (recovery && session) return <SetPassword sb={sb} onDone={() => setRecovery(false)} />;
  if (!session) return <Login sb={sb} />;
  if (isAdmin === null) return <div className="adm-login"><p style={{ color: '#8c8a86' }}>Checking access…</p></div>;
  if (!isAdmin) {
    return (
      <div className="adm-login">
        <div className="box">
          <h1>No admin access</h1>
          <p style={{ margin: 0, color: '#b5b1ab' }}>
            {session.user.email} is signed in but isn’t listed as an admin. Add this account to the
            <code> admins</code> table (README step 3).
          </p>
          <button className="adm-btn" onClick={() => sb.auth.signOut()}>Sign out</button>
        </div>
      </div>
    );
  }
  return <Dashboard sb={sb} email={session.user.email ?? ''} />;
}

function Login({ sb }: { sb: SupabaseClient }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) setMsg({ ok: false, text: 'Wrong email or password.' });
    setBusy(false);
  }

  async function forgot() {
    if (!email) { setMsg({ ok: false, text: 'Type your email first, then click “Forgot password”.' }); return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/admin/` });
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Check your inbox for a reset link.' });
  }

  return (
    <div className="adm-login">
      <form className="box adm-form" onSubmit={submit}>
        <img src="/images/logo-wordmark.png" alt="Klub360" />
        <h1>Admin sign in</h1>
        <label>Email<input className="adm-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
        <label>Password<input className="adm-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
        {msg && <p className={`adm-note ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</p>}
        <button className="adm-btn primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <button className="adm-link" type="button" onClick={forgot}>Forgot password</button>
      </form>
    </div>
  );
}

function SetPassword({ sb, onDone }: { sb: SupabaseClient; onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    const { error } = await sb.auth.updateUser({ password });
    if (error) setMsg(error.message);
    else onDone();
  }
  return (
    <div className="adm-login">
      <form className="box adm-form" onSubmit={submit}>
        <h1>Set a new password</h1>
        <label>New password<input className="adm-input" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
        {msg && <p className="adm-note err">{msg}</p>}
        <button className="adm-btn primary" type="submit">Save password</button>
      </form>
    </div>
  );
}

function Dashboard({ sb, email }: { sb: SupabaseClient; email: string }) {
  const [tab, setTab] = useState<Tab>(() => {
    const h = location.hash.replace('#', '') as Tab;
    return TABS.some((t) => t.key === h) ? h : 'events';
  });
  useEffect(() => { history.replaceState(null, '', `#${tab}`); }, [tab]);

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">
          <img src="/images/logo-wordmark.png" alt="Klub360" />
          <span style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: '#8c8a86' }}>Admin</span>
        </div>
        <nav className="adm-tabs" aria-label="Admin sections">
          {TABS.map((t) => (
            <button key={t.key} className="adm-tab" aria-current={tab === t.key ? 'page' : undefined} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener">View website →</a>
          <span style={{ color: '#8c8a86', wordBreak: 'break-all' }}>{email}</span>
          <button className="adm-link" onClick={() => sb.auth.signOut()}>Sign out</button>
        </div>
      </aside>
      <main className="adm-main">
        {tab === 'events' && <EventsTab sb={sb} />}
        {tab === 'artists' && <ArtistsTab sb={sb} />}
        {tab === 'photos' && <PhotosTab sb={sb} />}
        {tab === 'gallery' && <GalleryTab sb={sb} />}
        {tab === 'applications' && <ApplicationsTab sb={sb} />}
        {tab === 'account' && <AccountTab sb={sb} email={email} />}
      </main>
    </div>
  );
}

function AccountTab({ sb, email }: { sb: SupabaseClient; email: string }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 10) { setMsg({ ok: false, text: 'Use at least 10 characters.' }); return; }
    if (password !== confirm) { setMsg({ ok: false, text: 'The two passwords don’t match.' }); return; }
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) setMsg({ ok: false, text: error.message });
    else { setMsg({ ok: true, text: 'Password changed. Use the new one next time you sign in.' }); setPassword(''); setConfirm(''); }
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Account</h1>
          <p>Signed in as {email}</p>
        </div>
      </div>
      <form className="adm-panel adm-editor adm-form" style={{ maxWidth: 480 }} onSubmit={submit}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 400 }}>Change password</h2>
        <label>New password<input className="adm-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
        <label>Repeat new password<input className="adm-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></label>
        {msg && <p className={`adm-note ${msg.ok ? 'ok' : 'err'}`} role="status">{msg.text}</p>}
        <button className="adm-btn primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
      </form>
    </>
  );
}
