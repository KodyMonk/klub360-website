import { useMemo, useState } from 'react';

type Props = {
  whatsapp: string;
  /** Show the arrival-time picker and message preview (Book a Table page). */
  full?: boolean;
  phone: string;
  phoneDisplay: string;
};

const DAYS = ['Tonight', 'Tomorrow', 'This weekend', 'Another date'];
const TIMES = ['6 – 9 PM', '9 PM – 12 AM', 'After midnight'];
const GROUPS = ['2–4', '5–8', '9–12', '13+'];

function Chips({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="group" aria-label={label}>
      <p className="field-label">{label}</p>
      <div className="chips">
        {options.map((o) => (
          <button key={o} type="button" className="chip" aria-pressed={o === value} onClick={() => onChange(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TableRequest({ whatsapp, full = false, phone, phoneDisplay }: Props) {
  const [day, setDay] = useState('Tonight');
  const [time, setTime] = useState('9 PM – 12 AM');
  const [group, setGroup] = useState('5–8');

  const message = useMemo(() => {
    const when = day === 'Another date' ? 'on [date]' : day === 'This weekend' ? 'this weekend' : day.toLowerCase();
    const arrival = full ? `, arriving ${time}` : '';
    return `Hi Klub360, I'd like to reserve a VIP table ${when}${arrival}, for ${group} guests.`;
  }, [day, time, group, full]);

  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Chips label="When" options={full ? DAYS : DAYS.filter((d) => d !== 'This weekend')} value={day} onChange={setDay} />
      {full && <Chips label="Arrival" options={TIMES} value={time} onChange={setTime} />}
      <Chips label="Group size" options={GROUPS} value={group} onChange={setGroup} />
      {full && (
        <div className="msg-box">
          <p className="field-label" style={{ marginBottom: 4 }}>Your message</p>
          <p style={{ margin: 0 }}>{message}</p>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <a className="btn btn-primary btn-wide" href={href} target="_blank" rel="noopener">
          <span>Send enquiry on WhatsApp</span>
          <span className="arrow" aria-hidden="true">→</span>
        </a>
        <div className="hint-row">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="dot" aria-hidden="true" /> Our VIP host usually replies within minutes
          </span>
          <a href={`tel:${phone}`}>Or call {phoneDisplay}</a>
        </div>
      </div>
    </div>
  );
}
