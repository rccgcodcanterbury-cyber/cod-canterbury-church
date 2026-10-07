-- Run only in the verified RCCG City of David Canterbury Supabase project,
-- after inviting rccgcodcanterbury@gmail.com under Authentication > Users.
do $$
declare
  church_admin_id uuid;
begin
  select id into church_admin_id
  from auth.users
  where lower(email) = lower('rccgcodcanterbury@gmail.com')
  limit 1;

  if church_admin_id is null then
    raise exception 'Invite rccgcodcanterbury@gmail.com in Supabase Auth before running this file.';
  end if;

  insert into private.staff_roles (user_id, role, created_by)
  values (church_admin_id, 'admin', church_admin_id)
  on conflict (user_id) do update set role = 'admin';
end;
$$;
