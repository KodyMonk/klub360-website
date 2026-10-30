# Klub360 website

The new klub360bh.com, built with **Astro** (pages) + **React** (interactive parts and admin) + **Supabase** (events, photos, job applications).

- Website pages are pre-built HTML, so they load fast and Google can read them.
- The admin panel lives at **`/admin`**. Events and photos you change there go live in about a minute.
- The menu stays at **`/our_menu.pdf`**, so the QR codes in the venue keep working.

---

## Pages and addresses

| Page | Address | File |
|---|---|---|
| Home | `/` | `src/pages/index.astro` |
| Events | `/events/` | `src/pages/events/index.astro` |
| Single event | `/events/<event-name-date>/` | `src/pages/events/[slug].astro` (one page per event, automatic) |
| Book a Table | `/table/` | `src/pages/table.astro` |
| VIP Memberships | `/vip-memberships/` | `src/pages/vip-memberships.astro` |
| About | `/about/` | `src/pages/about.astro` |
| Artists | `/artists/` | `src/pages/artists.astro` |
| Admission Policy | `/admission-policy/` | `src/pages/admission-policy.astro` |
| Contact Us | `/contact/` | `src/pages/contact.astro` |
| Careers | `/careers/` (old `/carrers/` redirects here) | `src/pages/careers.astro` |
| Gallery | `/gallery/` | `src/pages/gallery.astro` |
| Privacy Policy | `/privacy-policy/` | `src/pages/privacy-policy.astro` |
| Terms | `/terms/` | `src/pages/terms.astro` |
| Menu (PDF) | `/our_menu.pdf` | `public/our_menu.pdf` |
| Admin | `/admin/` | `src/pages/admin.astro` |

## Where to edit things

| What | Where |
|---|---|
| Events, flyers | Admin → **Events** |
| Artists list | Admin → **Artists** |
| Homepage hero, club moments, VIP photo, About banner | Admin → **Photos** |
| Gallery | Admin → **Gallery** |
| Job applications (with CVs) | Admin → **Job applications** |
| Opening hours, phone numbers, address, socials, VIP benefits, house rules | `src/content/site.ts` |
| Privacy policy and terms text | `src/content/legal.ts` |
| Colours, fonts, spacing | `src/styles/global.css` (top of the file) |
| Logos and default photos | `public/images/` |
| Menu | replace `public/our_menu.pdf` (keep the same name) |

After editing a file, push it to GitHub and Cloudflare rebuilds the site automatically.

---

## Setup (one time, about 30 minutes)

### 1. Run it on your Mac

You need Node.js 20 or newer (`node -v` to check; install from nodejs.org if needed).

```bash
cd ~/Documents/klub360-website
npm install
npm run dev
```

Open http://localhost:4321. The site works straight away with the default photos and no events. The admin will say "not connected" until step 2.

Copy your current menu PDF into the `public` folder as **`our_menu.pdf`**.

### 2. Create the database (Supabase, free)

1. Sign up at https://supabase.com and create a new project. Pick the region closest to Bahrain (e.g. Frankfurt or Mumbai).
2. Go to **SQL Editor → New query**, paste everything from `supabase/schema.sql`, and click **Run**.
3. Go to **Project Settings → API** and copy the **Project URL** and the **anon public** key.
4. In the project folder, copy `.env.example` to `.env` and paste those two values in.
5. Restart `npm run dev`.

### 3. Create your admin login

1. Supabase → **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up" (so nobody else can make an account).
2. Supabase → **Authentication → Users → Add user → Create new user**. Enter your email and a strong password, and tick "Auto Confirm User".
3. Supabase → **SQL Editor**, run this with your email:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

4. Supabase → **Authentication → URL Configuration**: set **Site URL** to `https://klub360bh.com` and add `http://localhost:4321/admin/` and `https://*.pages.dev/admin/` under Redirect URLs (needed for "Forgot password").

Now open http://localhost:4321/admin/ and sign in.

To add another admin later, repeat steps 2–3 for their email.

### 4. Put the code on GitHub

Create a **private** repository on github.com, then:

```bash
git init
git add .
git commit -m "Klub360 website"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/klub360-website.git
git push -u origin main
```

`.env` is not uploaded (it's in `.gitignore`) — that's intended.

### 5. Host it on Cloudflare Pages (free)

1. Sign up at https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git** → choose the repository.
2. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
3. **Environment variables**: add `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` (same as `.env`) and `NODE_VERSION` = `20`.
4. Deploy. You get a preview address like `klub360.pages.dev` — use it to upload photos and add the first event before going live.

### 6. Make admin changes go live automatically

1. Cloudflare → your Pages project → **Settings → Builds → Deploy hooks** → create one (name: "Supabase", branch: `main`). Copy the URL.
2. Supabase → **Database → Webhooks** (in newer dashboards: **Integrations → Database Webhooks**) → **Create a new hook**, four times — one each for the tables `events`, `artists`, `site_photos` and `gallery_photos`:
   - Events: Insert, Update, Delete
   - Type: HTTP Request, Method: POST, URL: the deploy hook URL
3. Optional but recommended: run `supabase/nightly-rebuild.sql` (follow the notes at the top) so past events drop off the site every night automatically.

Now every time you save in the admin, Cloudflare rebuilds the site in about a minute.

### 7. Go live on klub360bh.com

1. Cloudflare Pages project → **Custom domains → Set up a domain** → `klub360bh.com` (and `www.klub360bh.com`).
2. Cloudflare shows the DNS records to add. If the domain's DNS is already on Cloudflare it's automatic; otherwise add them in **Namecheap → Domain List → Manage → Advanced DNS**.
3. Wait for the green "Active" status. The old site stays online until the DNS switches, so there's no downtime.

---

## How it works

- **Build time:** `src/lib/data.ts` reads published events, photos and gallery from Supabase when the site is built. If Supabase isn't set up, the site still builds with defaults.
- **Security:** the rules in `supabase/schema.sql` let anyone *read* published events and photos, and *send* a job application. Only accounts listed in the `admins` table can change anything or read applications and CVs.
- **Images:** the admin resizes and converts uploads to WebP in the browser before uploading, so you can use full-size originals.
- **Contact and table bookings** open WhatsApp with the message pre-written (the club has no email inbox).
- **Past events** move to "Past events" on the Events page after their date, and a small script hides them on the day even before the nightly rebuild.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Run locally at http://localhost:4321 |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Preview the built site |
| `npm run check` | Check the code for errors |
