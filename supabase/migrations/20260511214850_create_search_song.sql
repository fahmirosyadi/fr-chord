DROP FUNCTION IF EXISTS search_song(text);
create or replace function search_song(search_term text, status_filter integer default null)
returns table (
	id bigint,
	title text,
	artist text,
	genre json,
	profiles json,
	key text,
	lowest_note text,
	highest_note text,
	chord text,
	status text,
	user_id uuid,
	created_at timestamptz
)
language sql
as $$
	select
		s.id,
		s.title,
		s.artist,

		json_build_object(
			'id', g.id,
			'name', g.name
		) as genre,

		json_build_object(
			'full_name', p.full_name
		) as profiles,

		s.key,
		s.lowest_note,
		s.highest_note,
		s.chord,
    case
      when s.status = 0 then 'Unfinished'
      when s.status = 1 then 'Finished'
    end as status,
		s.user_id,
		s.created_at

	from song s

	left join genre g
		on g.id = s.genre_id

	left join profiles p
		on p.id = s.user_id

	where
		(
      search_term = ''
      or search_term is null
      or (
        s.search_vector @@ plainto_tsquery(search_term)
        or similarity(s.title, search_term) > 0.3
        or similarity(s.artist, search_term) > 0.3

        or s.title ilike '%' || search_term || '%'
        or s.artist ilike '%' || search_term || '%'
      )
    )
    and (
      status_filter is null
      or s.status = status_filter
    )

	order by
		case
			when search_term = ''
			or search_term is null
			then 0
			else greatest(
				similarity(s.title, search_term),
				similarity(s.artist, search_term)
			)
		end desc,

		s.title asc;
$$;
