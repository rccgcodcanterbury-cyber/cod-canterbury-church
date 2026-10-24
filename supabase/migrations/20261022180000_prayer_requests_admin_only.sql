-- Prayer requests are visible to administrators only. Pastoral contacts keep other enquiries.
-- topic is not in the update grant, so staff cannot re-label a prayer request to reveal it.
drop policy if exists "Pastoral staff read enquiries" on public.contact_enquiries;
drop policy if exists "Pastoral staff update enquiries" on public.contact_enquiries;
create policy "Staff read enquiries; prayer is admin only" on public.contact_enquiries for select to authenticated
  using(private.has_staff_role(array['admin']) or (private.has_staff_role(array['pastoral_contact']) and topic <> 'prayer'));
create policy "Staff update enquiries; prayer is admin only" on public.contact_enquiries for update to authenticated
  using(private.has_staff_role(array['admin']) or (private.has_staff_role(array['pastoral_contact']) and topic <> 'prayer'))
  with check(private.has_staff_role(array['admin']) or (private.has_staff_role(array['pastoral_contact']) and topic <> 'prayer'));
