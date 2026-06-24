import { haversineDistanceM } from '../utils/geoMath';
import { MAX_AR_VIEW_DISTANCE_M } from '../constants/kotoArea';
import { getSupabase } from './supabaseClient';
import { deleteAnnotationPhoto, uploadAnnotationPhoto } from './photoStorage';

const TABLE = 'ar_annotations';

function stripPhotoFromPayload(annotation) {
  const { photo, photoStoragePath, ...rest } = annotation;
  return rest;
}

function rowToAnnotation(row) {
  const payload = row.payload ?? {};
  return {
    ...payload,
    id: row.id,
    authorId: row.author_id,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    worldPin: { lat: row.world_pin_lat, lng: row.world_pin_lng },
    photo: payload.photoUrl ?? null,
    photoStoragePath: row.photo_path ?? null,
  };
}

function annotationToRow(annotation, authorId) {
  const { photo, photoStoragePath, isMine, ...payload } = stripPhotoFromPayload(annotation);
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

export async function fetchAnnotationsSupabase({ geo } = {}) {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) throw error;

  let list = (data ?? []).map(rowToAnnotation);

  if (geo) {
    list = list.filter((a) => {
      if (!a.worldPin) return false;
      return haversineDistanceM(geo, a.worldPin) <= MAX_AR_VIEW_DISTANCE_M * 4;
    });
  }

  return list;
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
