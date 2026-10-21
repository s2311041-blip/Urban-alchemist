import { getSupabase } from './supabaseClient';
import { deleteAnnotationPhoto, publicUrlForPhotoPath, uploadAnnotationPhoto } from './photoStorage';

const TABLE = 'ar_annotations';

function rowToAnnotation(row) {
  const payload = row.payload ?? {};
  const storedUrl = typeof payload.photoUrl === 'string' && payload.photoUrl.startsWith('http')
    ? payload.photoUrl
    : null;
  const photoPath = row.photo_path
    || (row.author_id && row.id ? `${row.author_id}/${row.id}.jpg` : null);
  return {
    ...payload,
    id: row.id,
    authorId: row.author_id,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    worldPin: { lat: row.world_pin_lat, lng: row.world_pin_lng },
    photo: storedUrl || publicUrlForPhotoPath(photoPath),
    photoStoragePath: row.photo_path ?? photoPath,
  };
}

function annotationToRow(annotation, authorId) {
  const { photo, photoStoragePath, isMine, ...payload } = annotation;
  return {
    id: annotation.id,
    author_id: authorId,
    world_pin_lat: annotation.worldPin.lat,
    world_pin_lng: annotation.worldPin.lng,
    photo_path: photoStoragePath ?? null,
    payload: {
      ...payload,
      photoUrl: typeof photo === 'string' && photo.startsWith('http') ? photo : null,
    },
    updated_at: new Date().toISOString(),
  };
}

export async function ensureSupabaseAuth() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
}

export async function fetchAnnotationsSupabase() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) throw error;

  return (data ?? []).map(rowToAnnotation);
}

export async function postAnnotationSupabase(annotation) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('supabase_not_configured');

  const user = await ensureSupabaseAuth();
  if (!user) throw new Error('auth_failed');

  let photoStoragePath = annotation.photoStoragePath ?? null;
  let photoUrl = annotation.photo?.startsWith('http') ? annotation.photo : null;

  if (annotation.photo?.startsWith('data:')) {
    const uploaded = await uploadAnnotationPhoto({
      dataUrl: annotation.photo,
      annotationId: annotation.id,
      authorId: user.id,
    });
    photoStoragePath = uploaded.path;
    photoUrl = uploaded.publicUrl;
  }

  const record = {
    ...annotation,
    authorId: user.id,
    photo: photoUrl,
    photoStoragePath,
  };

  const row = annotationToRow(record, user.id);
  const { error } = await supabase.from(TABLE).upsert(row, { onConflict: 'id' });
  if (error) throw error;

  return { ...record, isMine: true };
}

export async function deleteAnnotationSupabase(id, photoPath) {
  const supabase = getSupabase();
  if (!supabase) return;

  await deleteAnnotationPhoto(photoPath);
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export function getSupabaseUserId() {
  const supabase = getSupabase();
  if (!supabase) return null;
  return supabase.auth.getSession().then(({ data }) => data.session?.user?.id ?? null);
}
