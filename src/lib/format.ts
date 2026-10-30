const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d, date: new Date(Date.UTC(y, m - 1, d)) };
}

/** "31.12" */
export const dayMonth = (iso: string) => {
  const { m, d } = parts(iso);
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
};

/** "Thursday" */
export const weekday = (iso: string) => DAYS[parts(iso).date.getUTCDay()];

/** "31 Dec 2026" */
export const longDate = (iso: string) => {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

/** Today's date in Bahrain as YYYY-MM-DD. */
export const todayBahrain = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bahrain' }).format(new Date());

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
