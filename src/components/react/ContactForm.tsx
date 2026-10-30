import { useState, type FormEvent } from 'react';

// The club has no email inbox, so the contact form opens WhatsApp
// with the guest's message already written.
export default function ContactForm({ whatsapp }: { whatsapp: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const lines = [
      'Hi Klub360,',
      message.trim() || 'I have a question.',
      '',
      `Name: ${name.trim()}`,
      phone.trim() && `Phone: ${phone.trim()}`,
      email.trim() && `Email: ${email.trim()}`,
    ].filter(Boolean);
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>Full name<input className="input" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
      <div className="form-2">
        <label>Phone<input className="input" type="tel" placeholder="+973" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></label>
        <label>Your email (optional)<input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
      </div>
      <label>Message<textarea className="input" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></label>
      <button type="submit" className="btn btn-primary" style={{ minHeight: 58 }}>Send via WhatsApp</button>
      <p className="dim" style={{ margin: 0, fontSize: 13 }}>Opens WhatsApp with your message ready to send.</p>
    </form>
  );
}
