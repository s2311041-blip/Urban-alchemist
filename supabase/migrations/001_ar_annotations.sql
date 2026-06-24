-- Urban Alchemist AR 投稿（Supabase）
-- Dashboard → SQL Editor で実行。Storage バケットは Dashboard から作成（下記 docs 参照）。

create table if not exists public.ar_annotations (
  id text primary key,
  author_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  world_pin_lat double precision not null,
  world_pin_lng double precision not null,
  photo_path text,
  payload jsonb not null default '{}'::jsonb,
  constraint ar_world_lat_range check (world_pin_lat between -90 and 90),
  constraint ar_world_lng_range check (world_pin_lng between -180 and 180)
);

create index if not exists ar_annotations_created_at_idx
  on public.ar_annotations (created_at desc);

create index if not exists ar_annotations_author_idx
  on public.ar_annotations (author_id);

create or replace function public.check_ar_post_rate_limit()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*)
    from public.ar_annotations
    where author_id = new.author_id
      and created_at > now() - interval '1 hour'
  ) >= 10 then
    raise exception 'rate_limit_exceeded';
  end if;
  return new;
end;
$$;

drop trigger if exists ar_rate_limit on public.ar_annotations;
create trigger ar_rate_limit
  before insert on public.ar_annotations
  for each row
  execute function public.check_ar_post_rate_limit();

alter table public.ar_annotations enable row level security;

drop policy if exists "ar_read_all" on public.ar_annotations;
create policy "ar_read_all"
  on public.ar_annotations for select
  using (true);

drop policy if exists "ar_insert_own" on public.ar_annotations;
create policy "ar_insert_own"
  on public.ar_annotations for insert
  with check (auth.uid() = author_id);

drop policy if exists "ar_update_own" on public.ar_annotations;
create policy "ar_update_own"
  on public.ar_annotations for update
  using (auth.uid() = author_id);

drop policy if exists "ar_delete_own" on public.ar_annotations;
create policy "ar_delete_own"
  on public.ar_annotations for delete
  using (auth.uid() = author_id);

-- Storage policies（バケット名 ar-photos、public read は Dashboard で設定）
-- insert: authenticated, path must start with auth.uid()
-- delete: own folder only
