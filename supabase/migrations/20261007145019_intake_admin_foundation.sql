-- Private intake foundation for RCCG City of David Canterbury.
-- Apply only to the verified church Supabase project after reviewing roles.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists private.staff_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'testimony_reviewer', 'pastoral_contact', 'media_editor', 'viewer')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table private.staff_roles enable row level security;

create or replace function private.has_staff_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.staff_roles as staff
    where staff.user_id = (select auth.uid())
      and staff.role = any (allowed_roles)
  );
$$;

create or replace function private.current_staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select staff.role
  from private.staff_roles as staff
  where staff.user_id = (select auth.uid())
  limit 1;
$$;

revoke all on function private.has_staff_role(text[]) from public, anon;
grant execute on function private.has_staff_role(text[]) to authenticated;
revoke all on function private.current_staff_role() from public, anon;
grant execute on function private.current_staff_role() to authenticated;

create or replace function public.current_staff_role()
returns text
language sql
stable
set search_path = ''
as $$
  select private.current_staff_role();
$$;

revoke all on function public.current_staff_role() from public, anon;
grant execute on function public.current_staff_role() to authenticated;

create table if not exists public.testimonies (
  id uuid primary key default gen_random_uuid(),
  submission_key uuid not null unique,
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(trim(full_name)) between 1 and 120),
  email text not null check (char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 40),
  testimony text not null check (char_length(trim(testimony)) between 20 and 8000),
  status text not null default 'submitted'
    check (status in ('submitted', 'in_review', 'changes_requested', 'approved', 'declined', 'scheduled', 'delivered', 'shared')),
  online_sharing_consent boolean not null default false,
  name_sharing_consent boolean not null default false,
  scheduled_for timestamptz,
  closed_at timestamptz
);

create table if not exists public.first_time_visitors (
  id uuid primary key default gen_random_uuid(),
  submission_key uuid not null unique,
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(trim(full_name)) between 1 and 120),
  email text not null check (char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 40),
  visit_date date,
  party_size smallint check (party_size is null or party_size between 1 and 30),
  preferred_contact text check (preferred_contact is null or preferred_contact in ('email', 'phone', 'none')),
  contact_consent boolean not null default false,
  constraint consent_before_followup check (preferred_contact = 'none' or contact_consent),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'connected', 'closed')),
  closed_at timestamptz
);

create table if not exists public.testimony_review_events (
  id uuid primary key default gen_random_uuid(),
  testimony_id uuid not null references public.testimonies(id) on delete cascade,
  review_key uuid not null unique,
  created_at timestamptz not null default now(),
  reviewer_id uuid not null references auth.users(id),
  action text not null check (action in ('assigned', 'review_started', 'reopened', 'changes_requested', 'revision_received', 'approved', 'declined', 'scheduled', 'delivered', 'shared')),
  private_note text,
  member_message text,
  proposed_wording text,
  member_confirmed_wording boolean not null default false,
  constraint member_confirmation_required_for_proposed_approval
    check (action <> 'approved' or proposed_wording is null or member_confirmed_wording)
);

create index if not exists testimonies_status_created_idx
  on public.testimonies (status, created_at desc);
create index if not exists first_time_visitors_status_created_idx
  on public.first_time_visitors (status, created_at desc);
create index if not exists testimony_review_events_testimony_created_idx
  on public.testimony_review_events (testimony_id, created_at desc);

alter table public.testimonies enable row level security;
alter table public.first_time_visitors enable row level security;
alter table public.testimony_review_events enable row level security;

revoke all on public.testimonies, public.first_time_visitors, public.testimony_review_events from public, anon, authenticated;
grant insert (submission_key, full_name, email, phone, testimony, online_sharing_consent, name_sharing_consent)
  on public.testimonies to anon;
grant insert (submission_key, full_name, email, phone, visit_date, party_size, preferred_contact, contact_consent)
  on public.first_time_visitors to anon;
grant select on public.testimonies, public.first_time_visitors to authenticated;
grant update (status, scheduled_for, closed_at) on public.testimonies to authenticated;
grant update (status, closed_at) on public.first_time_visitors to authenticated;
grant select on public.testimony_review_events to authenticated;

create policy "Public may submit a new testimony"
  on public.testimonies for insert to anon
  with check (status = 'submitted');

create policy "Public may submit a first visit"
  on public.first_time_visitors for insert to anon
  with check (status = 'new');

create policy "Testimony staff may read testimony records"
  on public.testimonies for select to authenticated
  using (private.has_staff_role(array['admin', 'testimony_reviewer']));

create policy "Testimony staff may update testimony workflow"
  on public.testimonies for update to authenticated
  using (private.has_staff_role(array['admin', 'testimony_reviewer']))
  with check (private.has_staff_role(array['admin', 'testimony_reviewer']));

create policy "Pastoral staff may read first visit records"
  on public.first_time_visitors for select to authenticated
  using (private.has_staff_role(array['admin', 'pastoral_contact']));

create policy "Pastoral staff may update first visit workflow"
  on public.first_time_visitors for update to authenticated
  using (private.has_staff_role(array['admin', 'pastoral_contact']))
  with check (private.has_staff_role(array['admin', 'pastoral_contact']));

create policy "Testimony staff may read review history"
  on public.testimony_review_events for select to authenticated
  using (private.has_staff_role(array['admin', 'testimony_reviewer']));

create or replace function public.record_testimony_review(
  p_testimony_id uuid,
  p_review_key uuid,
  p_status text,
  p_action text,
  p_member_message text default null,
  p_proposed_wording text default null,
  p_member_confirmed_wording boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
    or not private.has_staff_role(array['admin', 'testimony_reviewer']) then
    raise exception 'Not authorised to review testimonies' using errcode = '42501';
  end if;

  if p_status not in ('submitted', 'in_review', 'changes_requested', 'approved', 'declined', 'scheduled', 'delivered', 'shared')
    or p_action not in ('assigned', 'review_started', 'reopened', 'changes_requested', 'revision_received', 'approved', 'declined', 'scheduled', 'delivered', 'shared') then
    raise exception 'Invalid testimony review action' using errcode = '22023';
  end if;

  if (p_status = 'in_review' and p_action <> 'review_started')
    or (p_status not in ('in_review', 'submitted') and p_action <> p_status) then
    raise exception 'Review action must match the selected testimony status' using errcode = '22023';
  end if;

  if exists (select 1 from public.testimony_review_events as e where e.review_key = p_review_key) then
    if exists (select 1 from public.testimony_review_events as e where e.review_key = p_review_key and e.testimony_id = p_testimony_id and e.reviewer_id = (select auth.uid())) then
      return;
    end if;
    raise exception 'Review key has already been used' using errcode = '23505';
  end if;

  if p_status = 'shared' and not exists (
    select 1 from public.testimonies as t
    where t.id = p_testimony_id and t.online_sharing_consent
  ) then
    raise exception 'Online sharing consent is required before marking a testimony as shared' using errcode = '42501';
  end if;

  if p_status = 'approved' and p_proposed_wording is not null and not p_member_confirmed_wording then
    raise exception 'The member must confirm proposed edited wording before approval' using errcode = '42501';
  end if;

  update public.testimonies
  set status = p_status,
      closed_at = case when p_status in ('declined', 'delivered', 'shared') then now() else null end
  where id = p_testimony_id;

  if not found then
    raise exception 'Testimony not found' using errcode = 'P0002';
  end if;

  insert into public.testimony_review_events (testimony_id, review_key, reviewer_id, action, member_message, proposed_wording, member_confirmed_wording)
  values (p_testimony_id, p_review_key, (select auth.uid()), p_action, nullif(trim(p_member_message), ''), nullif(trim(p_proposed_wording), ''), p_member_confirmed_wording);
end;
$$;

revoke all on function public.record_testimony_review(uuid, uuid, text, text, text, text, boolean) from public, anon;
grant execute on function public.record_testimony_review(uuid, uuid, text, text, text, text, boolean) to authenticated;

-- Purge only closed records after the agreed one-month retention period.
create or replace function private.purge_expired_intake()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.testimonies where closed_at is not null and closed_at < now() - interval '1 month';
  delete from public.first_time_visitors where closed_at is not null and closed_at < now() - interval '1 month';
end;
$$;

revoke all on function private.purge_expired_intake() from public, anon, authenticated;

-- Enable pg_cron and schedule daily expiry; the job contains no user data.
create extension if not exists pg_cron with schema extensions;
select cron.schedule('purge-expired-church-intake', '17 3 * * *', 'select private.purge_expired_intake()');

-- Public submissions deliberately cannot read, update, or delete private records.
-- Add staff_roles only after the first administrators have been invited to Auth.
