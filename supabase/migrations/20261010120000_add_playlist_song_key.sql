alter table public.playlist_song
add column if not exists key text;

grant update (key) on table public.playlist_song to authenticated;

drop policy if exists "update_playlist_song_key" on public.playlist_song;

create policy "update_playlist_song_key"
on public.playlist_song
as permissive
for update
to authenticated
using (true)
with check (true);
