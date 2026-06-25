import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { ensureSupabaseAuth } from './annotationsSupabase';

const TABLE = 'ar_likes';
const LOCAL_KEY = 'urban_alchemist_ar_like_records';

function readLocalLikeRecords() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalLikeRecords(records) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
}

export async function fetchLikeMetaForAnnotations(annotationIds = []) {
  const ids = [...new Set(annotationIds.filter(Boolean))];
  if (ids.length === 0) return {};

  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const user = await ensureSupabaseAuth();
    const { data, error } = await supabase
      .from(TABLE)
      .select('annotation_id, user_id')
      .in('annotation_id', ids);
    if (error) throw error;

    const meta = {};
    ids.forEach((id) => { meta[id] = { likeCount: 0, likedByMe: false }; });
    (data ?? []).forEach((row) => {
      const entry = meta[row.annotation_id] ?? { likeCount: 0, likedByMe: false };
      entry.likeCount += 1;
      if (user?.id && row.user_id === user.id) entry.likedByMe = true;
      meta[row.annotation_id] = entry;
    });
    return meta;
  }

  const records = readLocalLikeRecords();
  const meta = {};
  ids.forEach((id) => {
    const likes = records.filter((r) => r.annotationId === id);
    meta[id] = { likeCount: likes.length, likedByMe: false };
  });
  return meta;
}

export async function likeAnnotation(annotationId, { authorId, availablePoints = 0 } = {}) {
  if (!annotationId) throw new Error('annotation_missing');
  if (availablePoints < 1) throw new Error('insufficient_points');

  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const user = await ensureSupabaseAuth();
    if (!user) throw new Error('auth_failed');

    const { error } = await supabase.from(TABLE).insert({
      annotation_id: annotationId,
      user_id: user.id,
    });
    if (error) {
      if (error.code === '23505') throw new Error('already_liked');
      throw error;
    }
    return { liked: true };
  }

  const records = readLocalLikeRecords();
  if (records.some((r) => r.annotationId === annotationId && r.voterId === authorId)) {
    throw new Error('already_liked');
  }
  writeLocalLikeRecords([
    ...records,
    { annotationId, voterId: authorId, at: Date.now() },
  ]);
  return { liked: true };
}

export function countLocalLikesSpent(authorId) {
  return readLocalLikeRecords().filter((r) => r.voterId === authorId).length;
}

export function mergeLikeMetaIntoAnnotations(annotations = [], meta = {}) {
  return annotations.map((a) => ({
    ...a,
    likeCount: meta[a.id]?.likeCount ?? a.likeCount ?? 0,
    likedByMe: meta[a.id]?.likedByMe ?? a.likedByMe ?? false,
  }));
}
