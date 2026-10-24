-- Cookieless website measurement for the main site, Audacious and CITIYOUTHS.
-- No IP address, cookie or name is stored; visitor is a code that changes every day.
create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  site text not null check (site in ('main', 'audacious', 'youth')),
  path text not null check (char_length(path) between 1 and 200),
  event text not null check (event in ('pageview', 'give_click', 'visit_click', 'directions_click',
    'sermon_play', 'form_submit', 'social_click', 'outbound_click')),
  label text check (label is null or char_length(label) <= 120),
  referrer_host text check (referrer_host is null or char_length(referrer_host) <= 100),
  device text not null check (device in ('mobile', 'tablet', 'desktop')),
  country text check (country is null or country ~ '^[A-Z]{2}$'),
  visitor text check (visitor is null or visitor ~ '^[0-9a-f]{16}$')
);
create index if not exists site_events_created_idx on public.site_events (created_at desc);
alter table public.site_events enable row level security;
-- Only the site-events Edge Function (service role) writes; staff read aggregates through the report below.
revoke all on public.site_events from public, anon, authenticated;
grant all on public.site_events to service_role;

-- A random key per London day turns IP address + browser into the visitor code.
-- Keys are deleted after two days, after which no code can be linked back to anyone.
create table if not exists private.site_salts (
  day date primary key,
  salt text not null
);
revoke all on private.site_salts from public, anon, authenticated;

create or replace function public.record_site_event(p_event jsonb, p_ip text, p_user_agent text)
returns void
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_day date := (now() at time zone 'Europe/London')::date;
  v_salt text;
begin
  delete from private.site_salts where day < v_day - 1;
  insert into private.site_salts (day, salt)
    values (v_day, gen_random_uuid()::text || gen_random_uuid()::text)
    on conflict (day) do nothing;
  select salt into v_salt from private.site_salts where day = v_day;
  insert into public.site_events (site, path, event, label, referrer_host, device, country, visitor)
  values (p_event->>'site', p_event->>'path', p_event->>'event', p_event->>'label',
    p_event->>'referrer_host', p_event->>'device', p_event->>'country',
    case when coalesce(p_ip, '') = '' then null
      else left(encode(sha256(convert_to(v_salt || '|' || p_ip || '|' || coalesce(p_user_agent, ''), 'UTF8')), 'hex'), 16) end);
end;
$$;
revoke all on function public.record_site_event(jsonb, text, text) from public, anon, authenticated;
grant execute on function public.record_site_event(jsonb, text, text) to service_role;

create or replace function private.site_totals(p_from date, p_to date)
returns jsonb
language sql stable
set search_path = ''
as $$
  with e as (
    select event, site, path, visitor, (created_at at time zone 'Europe/London')::date as day
    from public.site_events
    where created_at >= (p_from::timestamp at time zone 'Europe/London')
      and created_at < ((p_to + 1)::timestamp at time zone 'Europe/London')
  )
  select jsonb_build_object(
    'pageviews', count(*) filter (where event = 'pageview'),
    'visitors', (select count(*) from (select distinct day, visitor from e where visitor is not null) v),
    'give_page_views', count(*) filter (where event = 'pageview' and site = 'main' and path like '/give/%'),
    'give_clicks', count(*) filter (where event = 'give_click'),
    'visit_clicks', count(*) filter (where event = 'visit_click'),
    'directions_clicks', count(*) filter (where event = 'directions_click'),
    'sermon_plays', count(*) filter (where event = 'sermon_play'),
    'form_submits', count(*) filter (where event = 'form_submit'),
    'social_clicks', count(*) filter (where event = 'social_click')
  )
  from e;
$$;
revoke all on function private.site_totals(date, date) from public, anon, authenticated;

-- Security definer is limited to administrators and returns aggregate values only.
create or replace function public.site_traffic_report(p_days integer default 30)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_days integer := least(greatest(coalesce(p_days, 30), 1), 400);
  v_to date := (now() at time zone 'Europe/London')::date;
  v_from date := v_to - (least(greatest(coalesce(p_days, 30), 1), 400) - 1);
  result jsonb;
begin
  if (select auth.uid()) is null or not private.has_staff_role(array['admin']) then
    raise exception 'Not authorised to view website traffic' using errcode = '42501';
  end if;

  with e as (
    select event, site, path, label, referrer_host, device, country, visitor,
      (created_at at time zone 'Europe/London')::date as day
    from public.site_events
    where created_at >= (v_from::timestamp at time zone 'Europe/London')
      and created_at < ((v_to + 1)::timestamp at time zone 'Europe/London')
  )
  select jsonb_build_object(
    'from', v_from,
    'to', v_to,
    'totals', private.site_totals(v_from, v_to),
    'previous', private.site_totals(v_from - v_days, v_from - 1),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day::date, 'site', s.site,
        'pageviews', coalesce(a.pageviews, 0), 'visitors', coalesce(a.visitors, 0), 'give_clicks', coalesce(a.give_clicks, 0))
        order by d.day, s.site)
      from generate_series(v_from, v_to, interval '1 day') as d(day)
      cross join (values ('main'), ('audacious'), ('youth')) as s(site)
      left join (
        select day, site, count(*) filter (where event = 'pageview') pageviews,
          count(distinct visitor) visitors, count(*) filter (where event = 'give_click') give_clicks
        from e group by day, site
      ) a on a.day = d.day::date and a.site = s.site
    ), '[]'::jsonb),
    'sites', (
      select jsonb_object_agg(s.site, jsonb_build_object('pageviews', coalesce(x.pageviews, 0), 'visitors', coalesce(x.visitors, 0)))
      from (values ('main'), ('audacious'), ('youth')) as s(site)
      left join (select site, count(*) filter (where event = 'pageview') pageviews,
              count(distinct (day, visitor)) filter (where visitor is not null) visitors
            from e group by site) x on x.site = s.site
    ),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('site', site, 'path', path, 'pageviews', amount) order by amount desc, site, path)
      from (select site, path, count(*) amount from e where event = 'pageview'
            group by site, path order by amount desc, site, path limit 10) p
    ), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(jsonb_build_object('host', host, 'visits', amount) order by amount desc, host)
      from (select coalesce(referrer_host, 'direct') host, count(*) amount from e where event = 'pageview'
            group by 1 order by amount desc, 1 limit 8) r
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_object_agg(device, amount)
      from (select device, count(*) amount from e where event = 'pageview' group by device) d
    ), '{}'::jsonb),
    'countries', coalesce((
      select jsonb_agg(jsonb_build_object('country', country, 'pageviews', amount) order by amount desc, country)
      from (select country, count(*) amount from e where event = 'pageview' and country is not null
            group by country order by amount desc, country limit 6) c
    ), '[]'::jsonb),
    'clicks', coalesce((
      select jsonb_agg(jsonb_build_object('event', event, 'label', label, 'site', site, 'count', amount) order by amount desc, event)
      from (select event, label, site, count(*) amount from e where event <> 'pageview'
            group by event, label, site order by amount desc, event limit 25) k
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;
revoke all on function public.site_traffic_report(integer) from public, anon;
grant execute on function public.site_traffic_report(integer) to authenticated;

-- Raw counts are kept for 13 months, matching the privacy page.
select cron.schedule('purge-site-events', '29 3 * * *',
  $$delete from public.site_events where created_at < now() - interval '13 months'$$);
