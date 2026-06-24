-- Storage: バケット ar-photos 作成後に実行

drop policy if exists "ar_photos_read" on storage.objects;
create policy "ar_photos_read"
  on storage.objects for select
  using (bucket_id = 'ar-photos');

drop policy if exists "ar_photos_insert_own" on storage.objects;
create policy "ar_photos_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'ar-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "ar_photos_delete_own" on storage.objects;
create policy "ar_photos_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'ar-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
