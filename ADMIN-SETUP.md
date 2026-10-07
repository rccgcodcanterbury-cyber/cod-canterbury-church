# Church office dashboard and private intake

The `/admin/` dashboard is built into the main site. This first phase supports two private queues: testimony review and first-time visitor follow-up. No testimony is published by the software. Sunday approval, online/livestream permission, and name permission are separate. An edited testimony requires the member's confirmation before approval.

## Current release safety

Public forms are **disabled by default**. The build and server both require `INTAKE_ENABLED=true`, `PRIVACY_NOTICE_APPROVED=true`, and `INTAKE_ABUSE_CONTROL_APPROVED=true`, as well as all service configuration. Do not set those flags until the church has verified the Supabase project, reviewed the live privacy notice, verified its Resend sending domain, put a server-verified abuse control in place, and tested a submission and deletion in a non-production project.

The supplied retention decision is one month after closure. The migration schedules a daily Supabase `pg_cron` cleanup of closed records older than one calendar month. Unclosed records remain in the private queue until staff close them; staff should close a case promptly when no further follow-up is needed. Testimony review history is deleted with its testimony. First-visit records are deleted after closure too.

## Church setup

1. Connect the church-owned Supabase organization/project in the Supabase integration and verify its project URL and owner before running SQL. This workspace has not yet verified that live connection.
2. Review and apply `supabase/migrations/20261007143202_intake_admin_foundation.sql` to a fresh church project. It creates private staff roles, consent-aware intake tables, row-level security, a review RPC, and the scheduled retention job. Check Supabase logs to confirm the migration and `purge-expired-church-intake` cron job.
3. Invite `rccgcodcanterbury@gmail.com` in Supabase Auth. Then run `supabase/first-admin.sql` in that same project. Use a unique password and enable MFA for this admin account. Add other staff only with the minimum role they need.
4. Verify the church-owned Resend account and a sender address on a domain Resend has verified. The code sends private intake alerts to `rccgcodcanterbury@gmail.com`; alerts contain only a record reference and a dashboard link. It does not email testimony text.
5. Add Netlify environment variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `INTAKE_NOTIFICATION_EMAIL=rccgcodcanterbury@gmail.com`, `PRIVACY_RETENTION_TEXT=1 month after a case is closed`, `PRIVACY_NOTICE_APPROVED=true` only after the church approves the completed notice, `INTAKE_ABUSE_CONTROL_APPROVED=true` only after server-verified abuse protection is tested, and finally `INTAKE_ENABLED=true`. Do not add a Supabase service-role key to Netlify or browser code.
6. Test login/role rejection, both intake types, notification delivery, review history, member email, consent gates, and deletion in a test project. The team is currently out of production deploy credits, so a Git push may not deploy this site until Netlify's next billing-cycle reset; do not buy an upgrade for this work.

## Privacy notice

The public `/privacy/` page now identifies the church, its contact route, the purpose of the first-visit and testimony forms, the Supabase and Resend processors, staff-only access, the one-month-after-closure retention rule, and the right to ask for correction or deletion. It also states that online/livestream use is optional and separate from approval to share at church. A church leader must review this wording before setting `PRIVACY_NOTICE_APPROVED=true`.

## Secrets and local development

Use a local `.env` file (never commit it) for the variables above. `SUPABASE_PUBLISHABLE_KEY` is safe to expose in the browser only with the migration's RLS policies in place. `RESEND_API_KEY` stays server-side. Before enabling public forms, add and test an abuse-control such as Cloudflare Turnstile or an equivalent server-verified challenge. Do not mark that control approved until it is actually enforced at the server boundary.
