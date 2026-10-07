-- Close advisor findings without widening access to personal data.
-- This follows the intake foundation migration.

create policy "No direct staff role access"
  on private.staff_roles for all to authenticated
  using (false)
  with check (false);

create index if not exists staff_roles_created_by_idx
  on private.staff_roles (created_by);
create index if not exists testimony_review_events_reviewer_created_idx
  on public.testimony_review_events (reviewer_id, created_at desc);

grant insert (testimony_id, review_key, reviewer_id, action, member_message, proposed_wording, member_confirmed_wording)
  on public.testimony_review_events to authenticated;

create policy "Testimony staff may add review history"
  on public.testimony_review_events for insert to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and private.has_staff_role(array['admin', 'testimony_reviewer'])
  );

alter function public.record_testimony_review(uuid, uuid, text, text, text, text, boolean)
  security invoker;
