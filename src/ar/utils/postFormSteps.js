import {
  AFFECTED_OTHER_LABEL,
  isOtherGroupSelected,
} from '../constants/arTargetGroups';

const LABEL_TO_TIME_TAG_ID = {
  朝: 'morning',
  昼: 'day',
  夕方: 'evening',
  夜: 'night',
  常時: 'always',
};

/** 編集用：既存アノテーション → フォーム draft */
export function annotationToDraft(annotation) {
  let timeTag = annotation.timeTagId ?? 'always';
  if (!annotation.timeTagId && annotation.timeTag) {
    timeTag = LABEL_TO_TIME_TAG_ID[annotation.timeTag] ?? 'always';
  }

  const affectedGroups = Array.isArray(annotation.affectedGroups)
    ? [...annotation.affectedGroups]
    : [];
  let affectedOther = annotation.affectedOther ?? '';

  if (affectedOther && !affectedGroups.includes(AFFECTED_OTHER_LABEL)) {
    affectedGroups.push(AFFECTED_OTHER_LABEL);
  }

  return {
    id: annotation.id,
    postKind: annotation.kind === 'positive' || annotation.postKind === 'good' ? 'good' : 'bad',
    needType: annotation.needType ?? 'P',
    placeArchetype: annotation.placeArchetype ?? null,
    affectedGroups,
    affectedOther,
    comment: annotation.comment ?? '',
    timeTag,
    severity: annotation.severity ?? 'mid',
    photo: annotation.photo ?? null,
    photoPins: Array.isArray(annotation.photoPins) ? [...annotation.photoPins] : [],
    authorGeo: annotation.authorGeo ?? null,
    worldPin: annotation.worldPin ?? null,
    capturePose: annotation.capturePose ?? null,
    screenTap: annotation.screenTap ?? null,
    distanceM: annotation.distanceM ?? null,
    placementMode: annotation.placementMode ?? null,
    xrLocalAnchor: annotation.xrLocalAnchor ?? null,
  };
}

export function getFormStepIds(postKind) {
  if (postKind === 'good') {
    return ['kind', 'place', 'story'];
  }
  return ['kind', 'needPlace', 'context', 'story'];
}

export function getStepTitle(stepId) {
  const titles = {
    kind: '記録の種類',
    needPlace: '困りごとと場所',
    context: '誰にとって？',
    place: 'どんな場所？',
    story: 'どう感じたか',
  };
  return titles[stepId] ?? '';
}

export function canProceedStep(stepId, draft) {
  switch (stepId) {
    case 'kind':
      return draft.postKind === 'good' || draft.postKind === 'bad';
    case 'needPlace':
      return !!draft.needType && !!draft.placeArchetype;
    case 'context': {
      if (isOtherGroupSelected(draft.affectedGroups)) {
        return (draft.affectedOther?.trim().length ?? 0) >= 1;
      }
      return true;
    }
    case 'place':
      return !!draft.placeArchetype;
    case 'story':
      if (draft.postKind === 'good') return (draft.comment?.trim().length ?? 0) >= 1;
      return (draft.comment?.trim().length ?? 0) >= 10;
    default:
      return false;
  }
}
