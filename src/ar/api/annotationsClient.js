import { KOTO_CENTER } from '../constants/kotoArea';
import { isSupabaseConfigured } from './supabaseClient';
import {
  deleteAnnotationSupabase,
  ensureSupabaseAuth,
  fetchAnnotationsSupabase,
  postAnnotationSupabase,
} from './annotationsSupabase';

const API_URL = import.meta.env.VITE_AR_API_URL ?? '';

function mergeById(local = [], remote = [], deletedIds = []) {
  const deleted = new Set(deletedIds);
  const map = new Map();
  [...remote, ...local].forEach((item) => {
    if (item?.id && !deleted.has(item.id)) map.set(item.id, item);
  });
  return [...map.values()].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

function readLocalPool() {
  const raw = localStorage.getItem('urban_alchemist_ar_local_pool');
  return raw ? JSON.parse(raw) : [];
}

function writeLocalPool(list) {
  localStorage.setItem('urban_alchemist_ar_local_pool', JSON.stringify(list));
}

export async function initArBackend() {
  if (isSupabaseConfigured()) {
    const user = await ensureSupabaseAuth();
    return { mode: 'cloud', authorId: user?.id ?? null };
  }
  return { mode: getApiMode(), authorId: null };
}

export async function fetchAnnotations({ geo } = {}) {
  const center = geo ?? KOTO_CENTER;

  if (isSupabaseConfigured()) {
    return fetchAnnotationsSupabase({ geo: center });
  }

  if (!API_URL) {
    return readLocalPool();
  }

  const url = new URL(`${API_URL.replace(/\/$/, '')}/annotations`);
  url.searchParams.set('lat', String(center.lat));
  url.searchParams.set('lng', String(center.lng));
  url.searchParams.set('radius', '1500');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
}

export async function postAnnotation(annotation) {
  if (isSupabaseConfigured()) {
    return postAnnotationSupabase(annotation);
  }

  if (!API_URL) {
    const list = readLocalPool();
    const next = [annotation, ...list.filter((a) => a.id !== annotation.id)];
    writeLocalPool(next);
    return annotation;
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/annotations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(annotation),
  });
  if (!res.ok) throw new Error('post failed');
  return res.json();
}

export async function deleteAnnotation(id, photoPath) {
  if (!id) return;

  if (isSupabaseConfigured()) {
    await deleteAnnotationSupabase(id, photoPath);
    return;
  }

  if (!API_URL) {
    writeLocalPool(readLocalPool().filter((a) => a.id !== id));
    return;
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/annotations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 404) throw new Error('delete failed');
}

export function mergeAnnotations(local, remote, deletedIds = []) {
  return mergeById(local, remote, deletedIds);
}

export function getApiMode() {
  if (isSupabaseConfigured()) return 'cloud';
  return API_URL ? 'remote' : 'local-pool';
}

export function getApiModeLabel() {
  switch (getApiMode()) {
    case 'cloud': return 'クラウド';
    case 'remote': return 'LAN';
    default: return 'ローカル';
  }
}
