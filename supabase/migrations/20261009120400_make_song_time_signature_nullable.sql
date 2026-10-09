alter table public.song
alter column time_signature_numerator drop not null,
alter column time_signature_numerator drop default,
alter column time_signature_denominator drop not null,
alter column time_signature_denominator drop default;
