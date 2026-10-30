-- ════════════════════════════════════════════════════════════════
-- Klub360 database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.
-- ════════════════════════════════════════════════════════════════

-- ── Admins ──────────────────────────────────────────────────────
-- Only users listed here can change content. Add yourself after
-- creating your login (see README step 3).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

drop policy if exists "admins can see own row" on public.admins;
create policy "admins can see own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ── Events ──────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  headliner text,
  event_date date not null,
  doors text default '6 PM',
  genre text,
  price text,
  description text,
  ticket_url text,
  flyer_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_date_idx on public.events (event_date);
alter table public.events enable row level security;

drop policy if exists "public reads published events" on public.events;
create policy "public reads published events" on public.events
  for select using (status = 'published');

drop policy if exists "admins manage events" on public.events;
create policy "admins manage events" on public.events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

-- ── Site photos (fixed slots: hero, vip_table, about_banner, moment_1…6) ──
create table if not exists public.site_photos (
  slot text primary key,
  url text not null,
  alt text,
  updated_at timestamptz not null default now()
);
alter table public.site_photos enable row level security;

drop policy if exists "public reads photos" on public.site_photos;
create policy "public reads photos" on public.site_photos for select using (true);

drop policy if exists "admins manage photos" on public.site_photos;
create policy "admins manage photos" on public.site_photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Gallery ─────────────────────────────────────────────────────
create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text,
  tag text not null default 'events' check (tag in ('events', 'venue')),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.gallery_photos enable row level security;

drop policy if exists "public reads gallery" on public.gallery_photos;
create policy "public reads gallery" on public.gallery_photos for select using (true);

drop policy if exists "admins manage gallery" on public.gallery_photos;
create policy "admins manage gallery" on public.gallery_photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Job applications ───────────────────────────────────────────
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text check (email is null or char_length(email) <= 200),
  phone text check (phone is null or char_length(phone) <= 40),
  position text not null check (char_length(position) <= 60),
  message text check (message is null or char_length(message) <= 4000),
  cv_path text,
  created_at timestamptz not null default now()
);
alter table public.applications enable row level security;

drop policy if exists "anyone can apply" on public.applications;
create policy "anyone can apply" on public.applications
  for insert to anon, authenticated with check (true);

drop policy if exists "admins read applications" on public.applications;
create policy "admins read applications" on public.applications
  for select to authenticated using (public.is_admin());

drop policy if exists "admins delete applications" on public.applications;
create policy "admins delete applications" on public.applications
  for delete to authenticated using (public.is_admin());

-- ── Artists ─────────────────────────────────────────────────────
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  instagram_url text,
  other_label text,
  other_url text,
  photo_url text,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.artists enable row level security;

drop policy if exists "public reads artists" on public.artists;
create policy "public reads artists" on public.artists for select using (true);

drop policy if exists "admins manage artists" on public.artists;
create policy "admins manage artists" on public.artists
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── File storage ────────────────────────────────────────────────
-- "media": public images (flyers, photos). "cvs": private CV uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
])
on conflict (id) do update set public = excluded.public;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "cv upload" on storage.objects;
create policy "cv upload" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'cvs');

drop policy if exists "cv admin read" on storage.objects;
create policy "cv admin read" on storage.objects
  for select to authenticated using (bucket_id = 'cvs' and public.is_admin());

drop policy if exists "cv admin delete" on storage.objects;
create policy "cv admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'cvs' and public.is_admin());
