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

Records are retained until closed and deleted one month after closure by the existing
Supabase nightly `purge-expired-church-intake` job. Private data is not emailed by
public submission handlers. Optional testimony review notifications require
`RESEND_API_KEY` and `RESEND_FROM` in Cloudflare; the dashboard reports if no email
was sent. Staff can contact the person separately.

## Deployment

Run `npm ci`, `npm run build`, `npm run check`, `npm test`.
Deploy `dist` with the root `functions` directory through Cloudflare Pages.
`npm run dev` starts the local Pages runtime. The Netlify runtime is no longer used.

Public Supabase connection values are in `content/connection.json`. These are
publishable/anon keys, not database admin credentials. RLS protects private tables.
Set `SITE_URL` at build time when the final custom domain is connected.
Set `BUILDING_DONATION_URL` to the church-verified HTTPS payment link when ready.
Until then, the building page offers its existing bank transfer details.

The calendar refreshes from the church's original events feed and filters by the
London date. If the feed is unavailable, the saved calendar stays visible. New events
beyond the saved calendar open the original calendar. The YouTube endpoint follows
the same live-feed/saved-selection fallback pattern.
