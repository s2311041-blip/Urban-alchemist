import {
  NEED_CATEGORY_OPTIONS,
  TIME_TAG_OPTIONS,
  SEVERITY_OPTIONS,
} from '../../constants/barrierData';
import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';

const GROUP_FRAMES = {
  車いす: '車椅子利用者の視点',
  高齢者: '高齢者の視点',
  ベビーカー: 'ベビーカー利用者の視点',
  子ども: '子ども連れの視点',
  みんな: '利用者全体の視点',
};

export function getPerspectiveFrame(annotation) {
  const primary = annotation.affectedGroups?.[0];
  return GROUP_FRAMES[primary] ?? 'この場所を利用する人の視点';
}

export function getAnnotationStoryRows(annotation) {
  const isGood = annotation.kind === 'positive';
  const need = NEED_CATEGORY_OPTIONS.find((o) => o.needType === annotation.needType);
  const place = KOTO_PLACE_OPTIONS.find((o) => o.id === annotation.placeArchetype);
  const whenId = annotation.timeTagId
    ?? TIME_TAG_OPTIONS.find((o) => o.label === annotation.timeTag)?.id
    ?? 'always';
  const when = TIME_TAG_OPTIONS.find((o) => o.id === whenId);
  const severity = SEVERITY_OPTIONS.find((o) => o.id === (annotation.severity ?? 'mid'));

  const rows = [
    {
      key: 'kind',
      label: '記録の種類',
      value: isGood ? '良い場所' : '困りごと',
    },
  ];

  if (!isGood && need) {
    rows.push({ key: 'need', label: 'どんな困りごと？', value: need.label, hint: need.hint });
  }

  if (place) {
    rows.push({ key: 'place', label: 'どんな場所？', value: place.label });
  }

  if (!isGood && (annotation.affectedGroups?.length || annotation.affectedOther)) {
    const whoParts = [...(annotation.affectedGroups ?? [])];
    if (annotation.affectedOther) {
      const otherIdx = whoParts.indexOf('その他');
      if (otherIdx >= 0) {
        whoParts[otherIdx] = `その他（${annotation.affectedOther}）`;
      } else {
        whoParts.push(annotation.affectedOther);
      }
    }
    rows.push({
      key: 'who',
      label: 'だれに影響？',
      value: whoParts.join('、'),
    });
  }

  if (!isGood && when && whenId !== 'always') {
    rows.push({ key: 'when', label: 'いつ？', value: when.label });
  }

  if (!isGood && severity && annotation.severity !== 'mid') {
    rows.push({ key: 'severity', label: 'どのくらい困る？', value: severity.label });
  }

  rows.push({
    key: 'story',
    label: isGood ? 'なぜ良い場所？' : '体験・コメント',
    value: annotation.comment || '（コメントなし）',
    prominent: true,
  });

  return rows;
}

export function getPerspectiveNarrative(annotation) {
  const frame = getPerspectiveFrame(annotation);
  const comment = annotation.comment || 'この場所には課題がある';
  return `${frame}——${comment}`;
}

export function getNeedFilterStyle(annotation) {
  if (annotation.kind === 'positive') return { filter: 'saturate(1.08) brightness(1.02)' };
  if (annotation.needType === 'V') return { filter: 'brightness(0.72) contrast(0.88) saturate(0.85)' };
  if (annotation.needType === 'P') return { filter: 'contrast(1.12) saturate(0.95)' };
  if (annotation.needType === 'S') return { filter: 'saturate(0.65) brightness(0.88)' };
  return {};
}
