import { NEED_CATEGORY_OPTIONS } from '../../constants/barrierData';
import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';

/** 図鑑・検索用タグをアノテーションから抽出 */
export function getAnnotationTags(annotation) {
  const tags = [];
  if (annotation.kind === 'positive') tags.push({ id: 'kind:positive', label: '良い場所', group: 'kind' });
  else tags.push({ id: 'kind:barrier', label: 'バリア', group: 'kind' });

  const need = NEED_CATEGORY_OPTIONS.find((o) => o.needType === annotation.needType);
  if (need) tags.push({ id: `need:${need.needType}`, label: need.label, group: 'need' });

  const place = KOTO_PLACE_OPTIONS.find((o) => o.id === annotation.placeArchetype);
  if (place) tags.push({ id: `place:${place.id}`, label: place.label, group: 'place' });

  (annotation.affectedGroups ?? []).forEach((g) => {
    tags.push({ id: `who:${g}`, label: g, group: 'who' });
  });
  if (annotation.affectedOther) {
    tags.push({ id: `who:other:${annotation.affectedOther}`, label: annotation.affectedOther, group: 'who' });
  }

  if (annotation.timeTag) tags.push({ id: `when:${annotation.timeTag}`, label: annotation.timeTag, group: 'when' });
  if (annotation.severity) {
    const sev = { low: '軽い', mid: '中くらい', high: '深刻' }[annotation.severity] ?? annotation.severity;
    tags.push({ id: `sev:${annotation.severity}`, label: sev, group: 'severity' });
  }

  return tags;
}

export function filterAnnotations(annotations, { query = '', activeTagIds = [], scope = 'all', authorId } = {}) {
  const q = query.trim().toLowerCase();
  return annotations.filter((a) => {
    if (scope === 'mine' && authorId && a.authorId !== authorId) return false;
    if (activeTagIds.length > 0) {
      const tags = getAnnotationTags(a);
      const ids = tags.map((t) => t.id);
      if (!activeTagIds.every((id) => ids.includes(id))) return false;
    }
    if (!q) return true;
    const hay = [
      a.comment,
      a.needType,
      a.placeArchetype,
      a.timeTag,
      ...(a.affectedGroups ?? []),
      a.affectedOther,
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });
}

export function collectFilterChips(annotations) {
  const map = new Map();
  annotations.forEach((a) => {
    getAnnotationTags(a).forEach((t) => {
      if (!map.has(t.id)) map.set(t.id, t);
    });
  });
  return [...map.values()];
}
