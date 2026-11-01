import {
  NEED_CATEGORY_OPTIONS,
  TIME_TAG_OPTIONS,
  SEVERITY_OPTIONS,
} from '../../constants/barrierData';
import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';
import { getNoticeCategory, categoryIdFromAnnotation } from '../constants/noticeCategories';

const GROUP_FRAMES = {
  車いす: '車椅子利用者の視点',
  高齢者: '高齢者の視点',
  ベビーカー: 'ベビーカー利用者の視点',
  子ども: '子ども連れの視点',
  みんな: '利用者全体の視点',
};

export function getPerspectiveFrame(annotation) {
  if (annotation.whoText?.trim()) {
    return `${annotation.whoText.trim()}の視点`;
  }
  const primary = annotation.affectedGroups?.[0];
  return GROUP_FRAMES[primary] ?? 'この場所を利用する人の視点';
}

export function getAnnotationStoryRows(annotation) {
  const need = NEED_CATEGORY_OPTIONS.find((o) => o.needType === annotation.needType);
  const category = getNoticeCategory(categoryIdFromAnnotation(annotation));
  const writtenPlace = annotation.placeText?.trim();
  const place = KOTO_PLACE_OPTIONS.find((o) => o.id === annotation.placeArchetype);
  const placeValue = writtenPlace || (place && place.id !== 'none' ? place.label : null);
  const whenId = annotation.timeTagId
    ?? TIME_TAG_OPTIONS.find((o) => o.label === annotation.timeTag)?.id
    ?? (annotation.timeTag === '常時' ? 'always' : null)
    ?? 'always';
  const when = TIME_TAG_OPTIONS.find((o) => o.id === whenId);
  const severity = SEVERITY_OPTIONS.find((o) => o.id === (annotation.severity ?? 'low'));

  const rows = [
    {
      key: 'kind',
      label: '記録の種類',
      value: '街の気づき',
    },
  ];

  if (category) {
    rows.push({
      key: 'need',
      label: '気づきのテーマ',
      value: category.label,
      hint: category.hint ?? (category.needType ? need?.hint : null),
    });
  }

  if (placeValue) {
    rows.push({ key: 'place', label: 'どんな場所？', value: placeValue });
  }

  if (annotation.whoText?.trim() || annotation.affectedGroups?.length || annotation.affectedOther) {
    const value = annotation.whoText?.trim()
      || (() => {
        const whoParts = [...(annotation.affectedGroups ?? [])];
        if (annotation.affectedOther) {
          const otherIdx = whoParts.indexOf('その他');
          if (otherIdx >= 0) {
            whoParts[otherIdx] = `その他（${annotation.affectedOther}）`;
          } else {
            whoParts.push(annotation.affectedOther);
          }
        }
        return whoParts.join('、');
      })();
    rows.push({
      key: 'who',
      label: '誰の目線？',
      value,
    });
  }

  if (when && whenId !== 'always') {
    rows.push({ key: 'when', label: 'いつ？', value: when.label });
  }

  if (severity) {
    rows.push({
      key: 'severity',
      label: '気持ちの強さ',
      value: annotation.severity === 'high' ? 'とても強く' : severity.label,
    });
  }

  rows.push({
    key: 'story',
    label: 'どんなことがあって、どう感じた？',
    value: annotation.comment || '（コメントなし）',
    prominent: true,
  });

  return rows;
}

export function getPerspectiveNarrative(annotation) {
  const frame = getPerspectiveFrame(annotation);
  const comment = annotation.comment || 'この場所で気づいたことがある';
  return `${frame}——${comment}`;
}

export function getNeedFilterStyle(annotation) {
  if (annotation.kind === 'positive' || annotation.categoryId === 'positive_place') {
    return { filter: 'saturate(1.08) brightness(1.02)' };
  }
  if (annotation.needType === 'V') return { filter: 'brightness(0.72) contrast(0.88) saturate(0.85)' };
  if (annotation.needType === 'P') return { filter: 'contrast(1.12) saturate(0.95)' };
  if (annotation.needType === 'S') return { filter: 'saturate(0.65) brightness(0.88)' };
  return {};
}
