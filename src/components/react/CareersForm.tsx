import { useState, type FormEvent } from 'react';
import { getSupabase } from '../../lib/supabase';

const MAX_MB = 5;

export default function CareersForm({ roles }: { roles: string[] }) {
  const [role, setRole] = useState(roles[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [cv, setCv] = useState<File | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) {
      setState('error');
      setError('Applications are not connected yet. Please WhatsApp us your CV instead.');
      return;
    }
    if (cv && cv.size > MAX_MB * 1024 * 1024) {
      setState('error');
      setError(`Your CV is larger than ${MAX_MB} MB. Please upload a smaller file.`);
      return;
    }
    setState('sending');
    setError('');
    try {
      let cv_path: string | null = null;
      if (cv) {
        const safe = cv.name.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(-80);
        cv_path = `${crypto.randomUUID()}-${safe}`;
        const up = await sb.storage.from('cvs').upload(cv_path, cv, { contentType: cv.type || undefined });
        if (up.error) throw up.error;
      }
      const { error: insErr } = await sb.from('applications').insert({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        position: role,
        message: message.trim() || null,
        cv_path,
      });
      if (insErr) throw insErr;
      setState('done');
    } catch (err) {
      console.error(err);
      setState('error');
      setError('Something went wrong sending your application. Please try again.');
    }
  }

  if (state === 'done') {
    return (
      <div className="notice ok" role="status">
        <p style={{ margin: 0, fontSize: 18 }}>Thank you, {name.split(' ')[0] || 'we got it'}.</p>
        <p style={{ margin: '6px 0 0' }} className="muted">We've received your application and will be in touch if you're a good fit.</p>
      </div>
    );
  }

  const roleLower = role === 'Other' ? 'team member' : role.toLowerCase();

  return (
    <form className="form" onSubmit={submit}>
      <div role="group" aria-label="Position of interest">
        <p className="field-label">Position of interest</p>
        <div className="chips">
          {roles.map((r) => (
            <button key={r} type="button" className="chip" aria-pressed={r === role} onClick={() => setRole(r)}>{r}</button>
          ))}
        </div>
      </div>
      <label>Name<input className="input" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
      <div className="form-2">
        <label>Email<input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label>Phone<input className="input" type="tel" required placeholder="+973" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label>
      </div>
      <label>
        CV / Resume (PDF or Word, max {MAX_MB} MB)
        <input className="input" style={{ paddingTop: 14 }} type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCv(e.target.files?.[0] ?? null)} />
      </label>
      <label>Message (optional)<textarea className="input" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} /></label>
      {state === 'error' && <p className="notice err" role="alert" style={{ margin: 0 }}>{error}</p>}
      <button type="submit" className="btn btn-primary" style={{ minHeight: 58 }} disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : `Apply as ${roleLower}`}
      </button>
    </form>
  );
}
