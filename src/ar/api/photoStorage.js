import { getSupabase } from './supabaseClient';

const BUCKET = 'ar-photos';

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = header?.match(/data:([^;]+)/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function uploadAnnotationPhoto({ dataUrl, annotationId, authorId }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('supabase_not_configured');

  const ext = dataUrl.startsWith('data:image/png') ? 'png' : 'jpg';
  const path = `${authorId}/${annotationId}.${ext}`;
  const blob = dataUrlToBlob(dataUrl);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { upsert: true, contentType: blob.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function deleteAnnotationPhoto(photoPath) {
  const supabase = getSupabase();
  if (!supabase || !photoPath) return;
  await supabase.storage.from(BUCKET).remove([photoPath]);
}
