# Church office dashboard and private intake

The `/admin/` dashboard is built into the main site. This first phase supports two private queues: testimony review and first-time visitor follow-up. No testimony is published by the software. Sunday approval, online/livestream permission, and name permission are separate. An edited testimony requires the member's confirmation before approval.

## Current release safety

Public forms are **disabled by default**. The build and server both require `INTAKE_ENABLED=true`, `PRIVACY_NOTICE_APPROVED=true`, and `INTAKE_ABUSE_CONTROL_APPROVED=true`, as well as all service configuration. Do not set those flags until the church has verified the Supabase project, reviewed the live privacy notice, verified its Resend sending domain, put a server-verified abuse control in place, and tested a submission and deletion in a non-production project.

The supplied retention decision is one month after closure. The migration schedules a daily Supabase `pg_cron` cleanup of closed records older than one calendar month. Unclosed records remain in the private queue until staff close them; staff should close a case promptly when no further follow-up is needed. Testimony review history is deleted with its testimony. First-visit records are deleted after closure too.

## Church setup

1. The connected Supabase project has been verified as **RCCGCOD** in `eu-west-1`. Its two migrations are already recorded; the expected tables, RLS policies, review RPC, role boundaries, and daily `purge-expired-church-intake` job are present. Security advisors currently report no findings. Do not apply these migrations again to that project.
2. The connected Resend account has a verified, sending-enabled `rccgcodcanterbury.com` domain. Set `RESEND_FROM` to an address on that domain, for example `Church Office <office@rccgcodcanterbury.com>`. The code sends private intake alerts to `rccgcodcanterbury@gmail.com`; alerts contain only a record reference and a dashboard link, not testimony text.
3. `rccgcodcanterbury@gmail.com` is not yet a user in the project's Supabase Auth. Invite it in Authentication > Users, let the owner accept and set a unique password, then run `supabase/first-admin.sql` in the RCCGCOD SQL editor. Enable MFA for this admin account. Add other staff only with the minimum role they need.
4. In the existing Cloudflare account, create a free Turnstile widget for `rccgcodcanterbury.com` and copy its site key and secret key. This is an anti-spam widget only; it does not create a Cloudflare Pages project or change the website domain.
5. Add Netlify environment variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `INTAKE_NOTIFICATION_EMAIL=rccgcodcanterbury@gmail.com`, `PRIVACY_RETENTION_TEXT=1 month after a case is closed`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `PRIVACY_NOTICE_APPROVED=true` only after the church approves the notice, `INTAKE_ABUSE_CONTROL_APPROVED=true` only after the Turnstile check is tested, and finally `INTAKE_ENABLED=true`. Do not add a Supabase service-role key to Netlify or browser code. The Netlify account has been out of production deploy credits, so this branch is not yet live.
6. Test login/role rejection, both intake types, notification delivery, review history, member email, consent gates, and deletion in a test project. The team is currently out of production deploy credits, so a Git push may not deploy this site until Netlify's next billing-cycle reset; do not buy an upgrade for this work.

## Privacy notice

The public `/privacy/` page now identifies the church, its contact route, the purpose of the first-visit and testimony forms, the Supabase and Resend processors, staff-only access, the one-month-after-closure retention rule, and the right to ask for correction or deletion. It also states that online/livestream use is optional and separate from approval to share at church. A church leader must review this wording before setting `PRIVACY_NOTICE_APPROVED=true`.

## Secrets and local development

Use a local `.env` file (never commit it) for the variables above. `SUPABASE_PUBLISHABLE_KEY` is safe to expose in the browser only with the migration's RLS policies in place. `RESEND_API_KEY` stays server-side. Before enabling public forms, add and test an abuse-control such as Cloudflare Turnstile or an equivalent server-verified challenge. Do not mark that control approved until it is actually enforced at the server boundary.
