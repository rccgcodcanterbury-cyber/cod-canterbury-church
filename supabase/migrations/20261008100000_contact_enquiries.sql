-- Enquiries and prayer requests are private, separate from testimony publishing.
create table public.contact_enquiries (
 id uuid primary key default gen_random_uuid(),
 submission_key uuid not null unique,
 created_at timestamptz not null default now(),
 full_name text not null check(char_length(trim(full_name)) between 1 and 120),
 email text not null check(char_length(email) between 3 and 254),
 topic text not null check(topic in ('general','visit','prayer','ministry','building')),
 message text not null check(char_length(trim(message)) between 5 and 5000),
 source text not null default 'main' check(char_length(source)<=80),
 contact_consent boolean not null check(contact_consent),
 status text not null default 'new' check(status in ('new','in_progress','responded','closed')),
 closed_at timestamptz
);
alter table public.contact_enquiries enable row level security;
revoke all on public.contact_enquiries from public,anon,authenticated;
grant select on public.contact_enquiries to authenticated;
grant update(status,closed_at) on public.contact_enquiries to authenticated;
grant all on public.contact_enquiries to service_role;
create policy "Pastoral staff read enquiries" on public.contact_enquiries for select to authenticated using(private.has_staff_role(array['admin','pastoral_contact']));
create policy "Pastoral staff update enquiries" on public.contact_enquiries for update to authenticated using(private.has_staff_role(array['admin','pastoral_contact'])) with check(private.has_staff_role(array['admin','pastoral_contact']));
create index contact_enquiries_status_created_idx on public.contact_enquiries(status,created_at desc);
-- Submissions pass through validated server code; the public Data API cannot bypass it.
revoke insert on public.testimonies,public.first_time_visitors from anon;
revoke insert(submission_key,full_name,email,phone,testimony,online_sharing_consent,name_sharing_consent) on public.testimonies from anon;
revoke insert(submission_key,full_name,email,phone,visit_date,party_size,preferred_contact,contact_consent) on public.first_time_visitors from anon;
create table private.intake_rate_limits(fingerprint text primary key,window_start timestamptz not null default now(),attempts integer not null default 1);
alter table private.intake_rate_limits enable row level security;
revoke all on private.intake_rate_limits from public,anon,authenticated;
create or replace function public.check_intake_rate(p_fingerprint text) returns boolean language plpgsql security definer set search_path='' as $$
declare total integer;
begin
 if p_fingerprint !~ '^[a-f0-9]{64}$' then return false; end if;
 delete from private.intake_rate_limits where window_start < now()-interval '1 day';
 insert into private.intake_rate_limits(fingerprint) values(p_fingerprint)
 on conflict(fingerprint) do update set
 attempts=case when private.intake_rate_limits.window_start < now()-interval '1 hour' then 1 else private.intake_rate_limits.attempts+1 end,
 window_start=case when private.intake_rate_limits.window_start < now()-interval '1 hour' then now() else private.intake_rate_limits.window_start end
 returning attempts into total;
 return total<=5;
end;
$$;
revoke all on function public.check_intake_rate(text) from public,anon,authenticated;
grant execute on function public.check_intake_rate(text) to service_role;
create or replace function private.purge_expired_intake() returns void language plpgsql security definer set search_path='' as $$
begin
 delete from public.testimonies where closed_at is not null and closed_at<now()-interval '1 month';
 delete from public.first_time_visitors where closed_at is not null and closed_at<now()-interval '1 month';
 delete from public.contact_enquiries where closed_at is not null and closed_at<now()-interval '1 month';
 delete from private.intake_rate_limits where window_start<now()-interval '1 day';
end;
$$;
