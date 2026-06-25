-- AR いいね（doc 34 / Phase 3-E）
-- 003 は remove_koto_bounds のため 004 を使用

create table if not exists public.ar_likes (
  annotation_id text not null references public.ar_annotations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (annotation_id, user_id)
);

create index if not exists ar_likes_user_idx on public.ar_likes (user_id);
create index if not exists ar_likes_annotation_idx on public.ar_likes (annotation_id);

alter table public.ar_likes enable row level security;

create policy "ar_likes_read_all" on public.ar_likes for select using (true);

create policy "ar_likes_insert_own" on public.ar_likes for insert
  with check (auth.uid() = user_id);
