-- Church office reporting. Aggregate attendance only; no attendee names are stored here.
alter table public.first_time_visitors
  add column if not exists town_or_city text
  check (town_or_city is null or char_length(trim(town_or_city)) between 1 and 80);

create table if not exists public.service_attendance (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  service_time text not null check (service_time in ('09:00', '11:30')),
  total_attendance integer not null check (total_attendance >= 0),
  first_time_attendance integer not null default 0
    check (first_time_attendance >= 0 and first_time_attendance <= total_attendance),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  unique (service_date, service_time)
);
create index if not exists service_attendance_date_idx
  on public.service_attendance (service_date desc, service_time);
alter table public.service_attendance enable row level security;
revoke all on public.service_attendance from public, anon, authenticated;
grant select, insert on public.service_attendance to authenticated;
grant update (total_attendance, first_time_attendance, updated_at, updated_by)
  on public.service_attendance to authenticated;
create policy "Pastoral staff may read attendance" on public.service_attendance
  for select to authenticated
  using (private.has_staff_role(array['admin', 'pastoral_contact']));
create policy "Pastoral staff may enter attendance" on public.service_attendance
  for insert to authenticated
  with check (private.has_staff_role(array['admin', 'pastoral_contact']) and updated_by = (select auth.uid()));
create policy "Pastoral staff may correct attendance" on public.service_attendance
  for update to authenticated
  using (private.has_staff_role(array['admin', 'pastoral_contact']))
  with check (private.has_staff_role(array['admin', 'pastoral_contact']) and updated_by = (select auth.uid()));

-- Security definer is limited to authorised staff and returns aggregate values only.
create or replace function public.church_dashboard_snapshot()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare result jsonb;
begin
  if (select auth.uid()) is null
    or not private.has_staff_role(array['admin']) then
    raise exception 'Not authorised to view church reporting' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'contacts', (select count(*) from public.contact_enquiries),
    'visitors', (select count(*) from public.first_time_visitors),
    'testimonies', (select count(*) from public.testimonies),
    'open', (select count(*) from public.contact_enquiries where status not in ('closed','responded'))
      + (select count(*) from public.first_time_visitors where status not in ('closed','connected')),
    'submissions', coalesce((
      select jsonb_agg(jsonb_build_object('day', days.day, 'count',
        (select count(*) from public.contact_enquiries c where (c.created_at at time zone 'Europe/London')::date = days.day)
        + (select count(*) from public.first_time_visitors v where (v.created_at at time zone 'Europe/London')::date = days.day)
        + (select count(*) from public.testimonies t where (t.created_at at time zone 'Europe/London')::date = days.day)
      ) order by days.day)
      from generate_series((now() at time zone 'Europe/London')::date - 29,
        (now() at time zone 'Europe/London')::date, interval '1 day') as days(day)
    ), '[]'::jsonb),
    'pipeline', coalesce((select jsonb_object_agg(status, amount)
      from (select status, count(*) amount from public.contact_enquiries group by status) p), '{}'::jsonb),
    'locations', coalesce((select jsonb_agg(jsonb_build_object('name', town_or_city, 'count', amount) order by amount desc, town_or_city)
      from (select town_or_city, count(*) amount from public.first_time_visitors
        where town_or_city is not null group by town_or_city order by amount desc, town_or_city limit 8) l), '[]'::jsonb),
    'attendance', jsonb_build_object(
      'total', (select coalesce(sum(total_attendance), 0) from public.service_attendance),
      'first_time', (select coalesce(sum(first_time_attendance), 0) from public.service_attendance),
      'services', (select count(*) from public.service_attendance),
      'by_time', coalesce((select jsonb_object_agg(service_time, amount)
        from (select service_time, sum(total_attendance) amount from public.service_attendance group by service_time) a), '{}'::jsonb),
      'recent', coalesce((select jsonb_agg(jsonb_build_object('date', service_date, 'time', service_time,
        'total', total_attendance, 'first_time', first_time_attendance) order by service_date desc, service_time)
        from (select * from public.service_attendance order by service_date desc, service_time limit 8) r), '[]'::jsonb)
    )
  ) into result;
  return result;
end;
$$;
revoke all on function public.church_dashboard_snapshot() from public, anon;
grant execute on function public.church_dashboard_snapshot() to authenticated;
