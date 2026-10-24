# Church website and office

Production: https://rccgcodcanterbury.com (Netlify). Church office: https://admin.rccgcodcanterbury.com
Temporary Cloudflare copy: https://cod-canterbury-church.pages.dev (to be redirected or retired).
Database/auth: RCCGCOD Supabase project `fgkckneijlceqfwkheij`.

## Submission path

Public enquiry/prayer, first-visit and testimony forms POST to `/api/intake`.
Cloudflare Pages forwards to the JWT-protected Supabase `church-intake` Edge Function.
The function validates allowed fields, enforces consent, size and email rate limits,
and stores submissions using its built-in server credential. Browser clients cannot
read private records or insert directly. No service credential is in the repository.

The `/admin/` dashboard uses Supabase Auth and RLS. Administrators and pastoral
contacts can read enquiries and visits; testimony reviewers can review testimonies.
Admin access is assigned to the church-approved email, not to every signed-in user.
Prayer requests (`topic = 'prayer'`) are visible to administrators only; pastoral
contacts see the other enquiries.

Staff can request a password reset from the sign-in screen. In Supabase Auth,
Redirect URLs must include `https://admin.rccgcodcanterbury.com/` and
`https://rccgcodcanterbury.com/admin/`, and public sign-ups should be disabled.

The office is an iOS-style app with four tabs (bottom tab bar on phones):

- **Overview** (admin): visitors and offering-link clicks for the last 7 days,
  items needing follow-up, last Sunday's attendance, latest submissions, the
  30-day submissions chart, enquiry follow-up and first-visitor towns. It reads
  `church_dashboard_snapshot()` and `site_traffic_report(7)`.
- **Inbox**: Enquiries, Prayer (admin only), First visits and Testimonies, with
  search, status filter, and status updates.
- **Insights** (admin): `site_traffic_report(days)` for 7 days, 30 days, 90 days
  or 12 months. Until visit counting is live it says so.
- **Attendance** (admin and pastoral contacts): totals for the 9:00 am and
  11:30 am services. It does not identify individual worshippers, and a
  first-visit form is not an attendance count.

Pastoral contacts see Inbox and Attendance; testimony reviewers see
Testimonies only; other roles see a short "no sections" message.

New-submission alerts: when a form is saved, `/api/intake` emails the church
office through Resend ("New prayer request", "New enquiry", "New first-visit
form" or "New testimony") with a link to the inbox. The email never contains the
person's name, contact details or message. It goes to `ALERT_EMAIL` (comma-separated)
or, by default, rccgcodcanterbury@gmail.com, and needs `RESEND_API_KEY` and
`RESEND_FROM` in Netlify. Spam, failed saves and missing settings send nothing.

Records are kept; nothing is deleted automatically. The earlier nightly
`purge-expired-church-intake` job (one month after closure) is switched off by
migration `20261024090000_keep_intake_records.sql`. Private data is not emailed by
public submission handlers. Optional testimony review notifications require
`RESEND_API_KEY` and `RESEND_FROM` in Cloudflare; the dashboard reports if no email
was sent. Staff can contact the person separately.

## Website visits and clicks

`public/track.js` runs on the main site, Audacious and CITIYOUTHS (not the
office). It counts page views and these clicks: the NatWest giving link
(`give_click`), Plan your visit (`visit_click`), map directions, sermon plays,
form submissions, social links and other outbound links. It sets no cookies and
does nothing when the browser sends Global Privacy Control or Do Not Track.

Path: browser → `/api/track` (drops bots) → Supabase `site-events` Edge Function
→ `record_site_event()` → `public.site_events`. The database scrambles the IP
address and browser type with a random key for that London day (kept in
`private.site_salts` and deleted after two days) into a 16-character code; the
address itself is never stored. Only the service role can write events; administrators read aggregates through
`site_traffic_report(days)`. Raw rows are deleted after 13 months by the
`purge-site-events` cron job. Giving amounts stay in NatWest PayIt; the site
only counts clicks. Any link can be counted with `data-track="give_click"` and
an optional `data-track-label`.

## Deployment

Run `npm ci`, `npm run build`, `npm run check`, `npm test`.
Deploy `dist` with the root `functions` directory through Cloudflare Pages.
`npm run dev` starts the local Pages runtime. Netlify uses `npm run build:netlify`
and `netlify.toml`. Its production deployment of commit `82807b4` was verified
in the church's Netlify team on 22 October 2026. Check the Deploys page for
later releases; a Git push by itself does not prove that Netlify deployed.

The office works at `/admin/` on both the main Netlify domain and the temporary
Cloudflare domain. The Netlify edge router maps `admin.rccgcodcanterbury.com/`
to that dashboard. The alias and Netlify-managed DNS records were added on
22 October 2026; public DNS and HTTPS login response were verified. Some local
DNS caches may still hold the earlier missing-record result. Administrator
sign-in on admin.rccgcodcanterbury.com and a test contact submission reaching
the dashboard were both confirmed on 23 October 2026.

Public Supabase connection values are in `content/connection.json`. These are
publishable/anon keys, not database admin credentials. RLS protects private tables.
`SITE_URL` defaults to `https://rccgcodcanterbury.com`; `npm run check` fails if a
build still points at pages.dev.
Set `BUILDING_DONATION_URL` to the church-verified HTTPS payment link when ready.
Until then, the building page offers its existing bank transfer details.

The calendar refreshes from the church's original events feed and filters by the
London date. If the feed is unavailable, the saved calendar stays visible. New events
beyond the saved calendar open the original calendar. The YouTube endpoint follows
the same live-feed/saved-selection fallback pattern.

`/api/youtube-stats` is no longer used by the office (YouTube activity was
removed from the dashboard in October 2026) and can be deleted. Sermon plays
on the church websites are counted in Insights instead.
