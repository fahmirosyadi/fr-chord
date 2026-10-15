drop policy if exists "Authenticated users manage vocalists" on public.vocalist;
drop policy if exists "Supabase admins manage vocalists" on public.vocalist;
drop policy if exists "Anyone can view vocalists" on public.vocalist;

create policy "Anyone can view vocalists"
  on public.vocalist
  as permissive
  for select
  to anon, authenticated
  using (true);

create policy "Supabase admins manage vocalists"
  on public.vocalist
  as permissive
  for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
