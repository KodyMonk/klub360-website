// ─────────────────────────────────────────────────────────────
// Klub360 site content.
// Edit text here — every page reads from this file.
// Events and photos are managed in the admin panel (/admin), not here.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: 'Klub360',
  legalName: 'Klub360 Bahrain',
  url: 'https://klub360bh.com',
  tagline: "Bahrain's premier nightclub",
  hours: 'Every day · 6 PM – 2:30 AM',
  hoursShort: '6 PM – 2:30 AM',
  doorsDefault: '6 PM',
  age: '21+',
  dress: 'Smart casual',
  locationShort: 'Elite Crystal Hotel, Juffair',
  address: 'Elite Crystal Hotel, Building 1373, Road 2423, Area 324, Juffair, Kingdom of Bahrain',
  whatsapp: '97338111360',
  whatsappDisplay: '+973 3811 1360',
  phone: '+97317360300',
  phoneDisplay: '+973 1736 0300',
  fax: '+973 1736 0333',
  mapUrl: 'https://www.google.com/maps/place/klub360/data=!4m2!3m1!1s0x3e49a8db411bbb83:0x67e0c47a0fdb102b',
  // Keep this exact path: QR codes in the venue point to it.
  menuPdf: '/our_menu.pdf',
  operator: 'A Miami Events Bahrain venue',
};

export const socials = [
  { label: 'Instagram', href: 'https://instagram.com/klub360' },
  { label: 'Snapchat', href: 'https://www.snapchat.com/@klub360bahrain' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@klub360' },
  { label: 'Facebook', href: 'https://m.facebook.com/klub360Official/' },
];

export const waLink = (message: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;

export const nav = [
  { key: 'events', label: 'Events', href: '/events/' },
  { key: 'artists', label: 'Artists', href: '/artists/' },
  { key: 'vip', label: 'VIP', href: '/vip-memberships/' },
  { key: 'menu', label: 'Menu', href: '/our_menu.pdf' },
  { key: 'about', label: 'About', href: '/about/' },
  { key: 'admission', label: 'Admission', href: '/admission-policy/' },
  { key: 'contact', label: 'Contact', href: '/contact/' },
];

export const pillars = [
  { title: 'World-class DJs', text: 'International headliners and resident DJs every weekend.' },
  { title: 'Exclusive events', text: 'A headline night every month with international artists.' },
  { title: 'VIP experience', text: 'Tables overlooking the dance floor, with dedicated service.' },
  { title: 'Premium drinks', text: 'Signature cocktails from our flair bartenders and a full bottle list.' },
];

export const tablePerks = [
  'Prime view of the dance floor',
  'Dedicated host and bottle service',
  'Priority entry for your group',
];

export const vip = {
  name: 'VIP Black',
  price: '360',
  joinMessage: "Hi Klub360, I'd like to join VIP Black.",
  headline: [
    { big: 'Free', text: 'Club admission, any night of the week' },
    { big: 'No queue', text: 'Immediate entry, every time' },
    { big: '10% off', text: 'Your consumption at Klub360' },
    { big: '30% off', text: 'Entrance fees for special events' },
  ],
  club: [
    'Priority table reservations, and a complimentary table when available*',
    'Keep an unfinished bottle of spirits until your next visit',
    'Pre-order a bottle to be waiting on your table',
    'A complimentary bottle of champagne on your birthday',
    'Photo opportunities with headline artists at special events',
  ],
  hotel: [
    { title: 'Lotus & Waikiki', text: 'Free entry to the Lotus Coffee Shop lounge and the Waikiki Pool Party*' },
    { title: '10% off rooms', text: 'On late-night room bookings at Elite Crystal Hotel' },
    { title: '15% off dining', text: 'At other Elite Crystal food and beverage outlets' },
  ],
};

export const admissionRules = [
  { title: 'Over 21 only', text: 'All guests must be over 21. Please carry a valid ID.' },
  { title: 'Dress to impress', text: 'Smart western, smart casual attire is expected.' },
  { title: 'Couples & ladies welcome', text: 'Couples and ladies are always admitted.' },
  { title: 'Arrive early', text: 'The club fills up early. VIP pass holders, text us your reservation ahead of time.' },
  { title: 'Leave the attitude at home', text: 'We keep things relaxed, informal and friendly. Our team works on first-name terms.' },
  { title: 'Right of admission reserved', text: 'Management reserves the right to refuse admission.' },
];

export const careersRoles = ['Bartender', 'Waitress', 'Waiter', 'Security guard', 'Hostess', 'Other'];

export type Artist = { name: string; instagram: string; other?: { label: string; href: string } };

export const artists: Artist[] = [
  { name: 'COEUS', instagram: 'https://www.instagram.com/coeus_ofc/', other: { label: 'Facebook', href: 'https://www.facebook.com/thisiscoeus' } },
  { name: 'Dubfire', instagram: 'https://www.instagram.com/dubfire/', other: { label: 'Facebook', href: 'https://www.facebook.com/Dubfire/' } },
  { name: 'Craig David', instagram: 'https://www.instagram.com/craigdavid/', other: { label: 'Facebook', href: 'https://www.facebook.com/CraigDavid/' } },
  { name: 'Sean Paul', instagram: 'https://www.instagram.com/duttypaul/', other: { label: 'Facebook', href: 'https://www.facebook.com/seanpaul/' } },
  { name: 'Tyga', instagram: 'https://www.instagram.com/tyga/', other: { label: 'Facebook', href: 'https://www.facebook.com/tyga' } },
  { name: 'Undercatt', instagram: 'https://www.instagram.com/undercatt/', other: { label: 'Facebook', href: 'https://www.facebook.com/undercattmusic/' } },
  { name: 'YOUNA', instagram: 'https://www.instagram.com/youna_kr/', other: { label: 'Spotify', href: 'https://open.spotify.com/artist/4Y7OfWwgt2hCgZfyPMFUzC' } },
  { name: 'Marino Canal', instagram: 'https://www.instagram.com/marinocanal/', other: { label: 'Facebook', href: 'https://www.facebook.com/MarinoCanal/' } },
  { name: 'Oostil', instagram: 'https://www.instagram.com/oostil__/', other: { label: 'Facebook', href: 'https://www.facebook.com/0ostil/' } },
  { name: 'Ae:ther', instagram: 'https://www.instagram.com/aether.music/', other: { label: 'Facebook', href: 'https://www.facebook.com/aethernalmusic/' } },
  { name: 'Notre Dame', instagram: 'https://www.instagram.com/notredame.music/', other: { label: 'Facebook', href: 'https://www.facebook.com/notredamemusicfr/' } },
  { name: 'Elif', instagram: 'https://www.instagram.com/elifmusique/', other: { label: 'Facebook', href: 'https://www.facebook.com/elifmusique' } },
  { name: 'Glowal', instagram: 'https://www.instagram.com/glowalmusic/', other: { label: 'Facebook', href: 'https://www.facebook.com/glowalmusic' } },
  { name: 'Jonas Saalbach', instagram: 'https://www.instagram.com/jonas_saalbach/', other: { label: 'Facebook', href: 'https://www.facebook.com/JonasSaalbach/' } },
  { name: 'The Element', instagram: 'https://www.instagram.com/theelement____/', other: { label: 'Facebook', href: 'https://www.facebook.com/theelementartist' } },
  { name: 'Citizen Kain', instagram: 'https://instagram.com/citizenkain/', other: { label: 'Facebook', href: 'https://www.facebook.com/citizenkainmusic' } },
  { name: 'Bog', instagram: 'https://www.instagram.com/bogofficial/', other: { label: 'Facebook', href: 'https://www.facebook.com/bogmusic/' } },
  { name: 'Peredel', instagram: 'https://www.instagram.com/peredel/', other: { label: 'Facebook', href: 'https://www.facebook.com/nikita.peredelskiy' } },
  { name: 'Stefano Noferini', instagram: 'https://www.instagram.com/stefanonoferini/', other: { label: 'Facebook', href: 'https://www.facebook.com/officialstefanonoferini' } },
  { name: 'Jack Millz', instagram: 'https://www.instagram.com/welovejackmillz/', other: { label: 'SoundCloud', href: 'https://soundcloud.com/djjackmillz' } },
  { name: 'Kid Creme', instagram: 'https://www.instagram.com/kidcreme/', other: { label: 'Facebook', href: 'https://www.facebook.com/kidcremeofficial/' } },
  { name: 'Junior Jack', instagram: 'https://www.facebook.com/juniorjacklive/' },
];

// Photo slots the admin can replace. Defaults live in /public/images.
export const photoSlots = [
  { slot: 'hero', label: 'Homepage — hero', size: '1200 × 1400', default: '/images/hero.jpg', alt: 'Crowd under stage lights at Klub360' },
  { slot: 'vip_table', label: 'VIP table photo (Home + Book a Table)', size: '1200 × 1500', default: '/images/moment-3.jpg', alt: 'Guests raising a toast at a VIP table' },
  { slot: 'about_banner', label: 'About page — wide banner', size: '2400 × 1100', default: '/images/hero.jpg', alt: 'Klub360 dance floor' },
  { slot: 'moment_1', label: 'Club moments 1', size: '1080 × 1350', default: '/images/moment-1.jpg', alt: 'Crowd under red lights' },
  { slot: 'moment_2', label: 'Club moments 2', size: '1080 × 1350', default: '/images/moment-2.jpg', alt: 'Dancer under purple lights' },
  { slot: 'moment_3', label: 'Club moments 3', size: '1080 × 1350', default: '/images/moment-3.jpg', alt: 'Guests raising a toast' },
  { slot: 'moment_4', label: 'Club moments 4', size: '1080 × 1350', default: '/images/moment-4.jpg', alt: 'Guest dancing in red light' },
  { slot: 'moment_5', label: 'Club moments 5', size: '1080 × 1350', default: '/images/moment-5.jpg', alt: 'DJ performing at the decks' },
  { slot: 'moment_6', label: 'Club moments 6', size: '1080 × 1350', default: '/images/moment-6.jpg', alt: 'Guest under blue lights' },
] as const;

export type PhotoSlot = (typeof photoSlots)[number]['slot'];
