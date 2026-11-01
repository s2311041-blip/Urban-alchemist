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
  いつでも: 'always',
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
    recordKind: 'notice',
    postKind: annotation.postKind
      ?? (annotation.kind === 'positive' ? 'good' : 'bad'),
    categoryId: annotation.categoryId ?? null,
    categoryLabel: annotation.categoryLabel ?? null,
    needType: annotation.needType ?? 'O',
    placeArchetype: annotation.placeArchetype ?? null,
    placeText: annotation.placeText ?? '',
    whoText: annotation.whoText ?? '',
    contextText: annotation.contextText ?? '',
    affectedGroups,
    affectedOther,
    comment: annotation.comment ?? '',
    timeTag,
    severity: annotation.severity ?? 'low',
    classification: annotation.classification ?? null,
    photo: annotation.photo ?? null,
    photoPins: Array.isArray(annotation.photoPins) ? [...annotation.photoPins] : [],
    promptKind: annotation.promptKind ?? 'free',
    promptId: annotation.promptId ?? null,
    promptTitle: annotation.promptTitle ?? null,
    authorGeo: annotation.authorGeo ?? null,
    worldPin: annotation.worldPin ?? null,
    capturePose: annotation.capturePose ?? null,
    screenTap: annotation.screenTap ?? null,
    distanceM: annotation.distanceM ?? null,
    placementMode: annotation.placementMode ?? null,
    xrLocalAnchor: annotation.xrLocalAnchor ?? null,
  };
}

export function getFormStepIds() {
  return ['place', 'story', 'perspective', 'intensity'];
}

export function getStepTitle(stepId) {
  const titles = {
    place: 'ここはどんな場所ですか？',
    story: 'どんなことがあって、どう感じましたか？',
    perspective: '誰の目線（立場）でそう感じましたか？',
    intensity: 'その気持ちの強さはどのくらいですか？',
    kind: '記録の種類',
    needPlace: '気づきと場所',
    context: '誰にとって？',
  };
  return titles[stepId] ?? '';
}

export function canProceedStep(stepId, draft) {
  switch (stepId) {
    case 'kind':
      return true;
    case 'needPlace':
      return !!draft.needType && !!draft.placeArchetype;
    case 'context': {
      if (isOtherGroupSelected(draft.affectedGroups)) {
        return (draft.affectedOther?.trim().length ?? 0) >= 1;
      }
      return true;
    }
    case 'place':
      return !!(draft.placeText?.trim() || draft.placeArchetype);
    case 'story':
      return (draft.comment?.trim().length ?? 0) >= 1;
    case 'perspective':
    case 'intensity':
      return true;
    default:
      return false;
  }
}
