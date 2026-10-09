alter table public.song
add column if not exists bpm integer not null default 120
check (bpm between 20 and 300);

alter table public.song
add column if not exists time_signature_numerator integer not null default 4
check (time_signature_numerator between 1 and 12);

alter table public.song
add column if not exists time_signature_denominator integer not null default 4
check (time_signature_denominator in (2, 4, 8, 16));
