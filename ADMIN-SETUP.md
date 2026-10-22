# Church website and office

Production: https://cod-canterbury-church.pages.dev
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

The admin overview reads `church_dashboard_snapshot()` for full database counts,
the last 30 days of submissions, follow-up statuses, first-visit town or city
summaries, and entered attendance. Only the administrator role can read this
overview. The attendance form records totals for the 9:00 am and 11:30 am
services; it does not identify individual worshippers. Historical attendance
must be entered by church staff. A first-visit form submission is not an
attendance count.

Records are retained until closed and deleted one month after closure by the existing
Supabase nightly `purge-expired-church-intake` job. Private data is not emailed by
public submission handlers. Optional testimony review notifications require
`RESEND_API_KEY` and `RESEND_FROM` in Cloudflare; the dashboard reports if no email
was sent. Staff can contact the person separately.

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
DNS caches may still hold the earlier missing-record result. An authenticated
sign-in and private form flow on the final hostname still need a staff check.

Public Supabase connection values are in `content/connection.json`. These are
publishable/anon keys, not database admin credentials. RLS protects private tables.
Set `SITE_URL` at build time when the final custom domain is connected.
Set `BUILDING_DONATION_URL` to the church-verified HTTPS payment link when ready.
Until then, the building page offers its existing bank transfer details.

The calendar refreshes from the church's original events feed and filters by the
London date. If the feed is unavailable, the saved calendar stays visible. New events
beyond the saved calendar open the original calendar. The YouTube endpoint follows
the same live-feed/saved-selection fallback pattern.

`/api/youtube-stats` can show public channel views, rounded subscriber count
and video count once `YOUTUBE_API_KEY` is set as a server-side environment
variable in each host. Restrict the key to the YouTube Data API and server
usage. Without it, the dashboard explicitly shows that metrics are awaiting a
connection. Watch time requires the church channel owner to authorise the
YouTube Analytics API through OAuth; it is not available from the public feed
or an API key alone.
