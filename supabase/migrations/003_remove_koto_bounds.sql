-- 江東区 CHECK 制約を解除（全世界どこでも投稿可）
-- 既存 DB で 001 実行済みの場合、SQL Editor でこのファイルを実行

alter table public.ar_annotations
  drop constraint if exists ar_koto_lat;

alter table public.ar_annotations
  drop constraint if exists ar_koto_lng;

-- 緯度経度の物理的な範囲のみ（任意・PostgreSQL 標準）
alter table public.ar_annotations
  drop constraint if exists ar_world_lat_range;

alter table public.ar_annotations
  drop constraint if exists ar_world_lng_range;

alter table public.ar_annotations
  add constraint ar_world_lat_range check (world_pin_lat between -90 and 90);

alter table public.ar_annotations
  add constraint ar_world_lng_range check (world_pin_lng between -180 and 180);
