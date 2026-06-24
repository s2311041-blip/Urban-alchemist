import { NEED_TYPE_TO_DEFAULT_TYPE } from '../../constants/barrierData';

const newId = () => `ar-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const TIME_TAG_ID_TO_LABEL = {
  morning: '朝',
  day: '昼',
  evening: '夕方',
  night: '夜',
  always: '常時',
};

/**
 * 投稿フローから RQ1/RQ2 共通アノテーションを生成
 */
export function buildAnnotationFromDraft(draft, { authorId, profileTags = [], existingId, existingCreatedAt } = {}) {
  const now = Date.now();
  const kind = draft.postKind === 'good' ? 'positive' : 'barrier';
  const needType = draft.needType ?? 'P';
  const timeTagId = draft.timeTag ?? 'always';

  return {
    id: existingId ?? draft.id ?? newId(),
    authorId: authorId ?? 'anon',
    createdAt: existingCreatedAt ?? now,
    updatedAt: now,
    kind,
    postKind: draft.postKind === 'good' ? 'good' : 'bad',
    comment: draft.comment?.trim() ?? '',
    photo: draft.photo ?? null,
    photoPins: Array.isArray(draft.photoPins) ? draft.photoPins : [],
    authorGeo: draft.authorGeo ?? null,
    worldPin: draft.worldPin ?? null,
    capturePose: draft.capturePose ?? null,
    screenTap: draft.screenTap ?? null,
    distanceM: draft.distanceM ?? null,
    needType,
    type: NEED_TYPE_TO_DEFAULT_TYPE[needType] ?? 'danger',
    placeArchetype: draft.placeArchetype ?? null,
    affectedGroups: Array.isArray(draft.affectedGroups) ? [...draft.affectedGroups] : [],
    affectedOther: draft.affectedOther?.trim() || null,
    timeTag: TIME_TAG_ID_TO_LABEL[timeTagId] ?? '常時',
    timeTagId,
    severity: draft.severity ?? 'mid',
    profileTags: [...profileTags],
    pointsAwarded: computePoints(draft),
    captureMode: draft.placementMode === 'webxr' ? 'webxr' : 'onsite',
    placementMode: draft.placementMode ?? 'geo',
    xrLocalAnchor: draft.xrLocalAnchor ?? null,
    isMine: true,
  };
}

export function computePoints(draft) {
  let pts = 10;
  if ((draft.comment?.trim().length ?? 0) >= 20) pts += 5;
  if (draft.worldPin) pts += 5;
  if (draft.postKind !== 'good') pts += 3;
  return pts;
}

export function annotationToGameExport(annotation) {
  return {
    postKind: annotation.postKind ?? (annotation.kind === 'positive' ? 'good' : 'bad'),
    photo: annotation.photo,
    comment: annotation.comment,
    photoPins: annotation.photoPins,
    needType: annotation.needType,
    placeArchetype: annotation.placeArchetype,
    affectedGroups: annotation.affectedGroups,
    affectedOther: annotation.affectedOther,
    timeTag: annotation.timeTag,
    severity: annotation.severity,
    captureMode: 'onsite',
    geo: annotation.authorGeo,
    worldPin: annotation.worldPin,
    capturePose: annotation.capturePose,
    type: annotation.type,
  };
}

export function annotationToExportRecord(annotation) {
  return {
    id: annotation.id,
    authorId: annotation.authorId,
    kind: annotation.kind,
    comment: annotation.comment,
    worldPin: annotation.worldPin,
    authorGeo: annotation.authorGeo,
    capturePose: annotation.capturePose,
    needType: annotation.needType,
    placeArchetype: annotation.placeArchetype,
    affectedGroups: annotation.affectedGroups,
    affectedOther: annotation.affectedOther,
    timeTag: annotation.timeTag,
    severity: annotation.severity,
    profileTags: annotation.profileTags,
    createdAt: annotation.createdAt,
    hasPhoto: Boolean(annotation.photo),
    pointsAwarded: annotation.pointsAwarded,
  };
}
