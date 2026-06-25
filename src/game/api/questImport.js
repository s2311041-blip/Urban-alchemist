import { fetchAnnotationsSupabase } from '../../ar/api/annotationsSupabase';
import { isSupabaseConfigured } from '../../ar/api/supabaseClient';
import { annotationToGameExport } from '../../ar/utils/normalizeAnnotation';
import { NEED_TYPE_TO_DEFAULT_TYPE } from '../../constants/barrierData';

function formatDemographic(annotation = {}) {
  const groups = Array.isArray(annotation.affectedGroups) ? annotation.affectedGroups : [];
  const other = annotation.affectedOther?.trim();
  if (other) return other;
  if (groups.length > 0) return groups.join('・');
  return '地域の声';
}

function isBadAnnotation(annotation = {}) {
  if (annotation.postKind === 'good') return false;
  if (annotation.kind === 'positive') return false;
  return annotation.postKind === 'bad'
    || annotation.kind === 'barrier'
    || annotation.needType;
}

/** AR アノテーション → ゲーム quest 投入用ペイロード */
export function annotationToQuestPost(annotation = {}) {
  if (!isBadAnnotation(annotation)) return null;

  const exported = annotationToGameExport(annotation);
  const needType = exported.needType ?? 'P';

  return {
    ...exported,
    type: exported.type ?? NEED_TYPE_TO_DEFAULT_TYPE[needType] ?? 'danger',
    sourceAnnotationId: annotation.id ?? null,
    demographic: formatDemographic(annotation),
    isMine: false,
    fromPost: true,
  };
}

export function isQuestAlreadyImported(quests = [], sourceAnnotationId) {
  if (!sourceAnnotationId) return false;
  return quests.some((quest) => (
    quest.sourceAnnotationId === sourceAnnotationId
    || quest.id === `quest_${sourceAnnotationId}`
  ));
}

export async function fetchBadAnnotationsForImport() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase が未設定です（VITE_SUPABASE_URL / ANON_KEY）');
  }
  const list = await fetchAnnotationsSupabase();
  return list.filter(isBadAnnotation);
}

/** AR 図鑑 export JSON（schema v2）または配列をパース */
export function parseImportJson(text) {
  const data = JSON.parse(text);
  const items = Array.isArray(data)
    ? data
    : (data.annotations ?? data.items ?? []);

  return items
    .map((item) => annotationToQuestPost({
      ...item,
      postKind: item.postKind ?? (item.kind === 'positive' ? 'good' : 'bad'),
      kind: item.kind ?? (item.postKind === 'good' ? 'positive' : 'barrier'),
    }))
    .filter(Boolean);
}
