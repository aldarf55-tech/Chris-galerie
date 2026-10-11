create table if not exists public.artwork_likes (
  artwork_id text not null,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (artwork_id, visitor_id)
);

alter table public.artwork_likes enable row level security;
revoke all on public.artwork_likes from anon, authenticated;

create or replace function public.get_artwork_like_counts(
  p_artwork_ids text[],
  p_visitor_id uuid
)
returns table (artwork_id text, like_count bigint, liked boolean)
language sql
security definer
set search_path = ''
as $$
  select
    requested.artwork_id,
    count(likes.visitor_id)::bigint as like_count,
    coalesce(bool_or(likes.visitor_id = p_visitor_id), false) as liked
  from unnest(p_artwork_ids) as requested(artwork_id)
  left join public.artwork_likes as likes
    on likes.artwork_id = requested.artwork_id
  group by requested.artwork_id;
$$;

create or replace function public.toggle_artwork_like(
  p_artwork_id text,
  p_visitor_id uuid
)
returns table (like_count bigint, liked boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted_count integer;
  v_liked boolean;
begin
  if not exists (
    select 1
    from public.artworks
    where id::text = p_artwork_id
  ) then
    raise exception 'Artwork not found';
  end if;

  delete from public.artwork_likes
  where artwork_id = p_artwork_id
    and visitor_id = p_visitor_id;

  get diagnostics v_deleted_count = row_count;

  if v_deleted_count = 0 then
    insert into public.artwork_likes (artwork_id, visitor_id)
    values (p_artwork_id, p_visitor_id)
    on conflict (artwork_id, visitor_id) do nothing;
    v_liked := true;
  else
    v_liked := false;
  end if;

  return query
  select count(*)::bigint, v_liked
  from public.artwork_likes
  where artwork_id = p_artwork_id;
end;
$$;

revoke all on function public.get_artwork_like_counts(text[], uuid) from public;
revoke all on function public.toggle_artwork_like(text, uuid) from public;
grant execute on function public.get_artwork_like_counts(text[], uuid) to anon, authenticated;
grant execute on function public.toggle_artwork_like(text, uuid) to anon, authenticated;
