-- OPTIONAL — rebuild the website every night at 03:00 Bahrain time, so an
-- event disappears from "upcoming" the morning after it happens.
--
-- 1. In Supabase → Database → Extensions, enable "pg_cron" and "pg_net".
-- 2. Replace the URL below with your Cloudflare Pages deploy hook URL.
-- 3. Run this file in the SQL Editor.

select cron.schedule(
  'klub360-nightly-rebuild',
  '0 0 * * *', -- 00:00 UTC = 03:00 Bahrain
  $$ select net.http_post(url := 'PASTE-YOUR-CLOUDFLARE-DEPLOY-HOOK-URL-HERE'); $$
);

-- To remove it later:
-- select cron.unschedule('klub360-nightly-rebuild');
