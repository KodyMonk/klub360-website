import type { APIRoute } from 'astro';
import { getPublishedEvents } from '../lib/data';

const pages = [
  '/', '/events/', '/table/', '/vip-memberships/', '/about/', '/artists/',
  '/admission-policy/', '/contact/', '/careers/', '/gallery/', '/privacy-policy/', '/terms/',
];

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? 'https://klub360bh.com/').replace(/\/$/, '');
  const events = await getPublishedEvents();
  const urls = [...pages, ...events.map((e) => `/events/${e.slug}/`)];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n') +
    `\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
