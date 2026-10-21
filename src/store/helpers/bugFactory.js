import {
  DEFAULT_BARRIER_META,
  TYPE_TO_BARRIER_META,
  normalizePlanId,
} from '../../constants/barrierData';
import { getAllowedPlansForQuest } from '../../constants/tradeoffMatrix';
import { normalizeQuestStatus } from './questState';

export const normalizePhotoPins = (pins) => {
  if (!Array.isArray(pins)) return [];
  return pins.slice(0, 5).map((pin, index) => ({
    id: typeof pin?.id === 'string' ? pin.id : `pin_${index}`,
    nx: Math.min(0.98, Math.max(0.02, Number(pin?.nx) || 0.5)),
    ny: Math.min(0.98, Math.max(0.02, Number(pin?.ny) || 0.5)),
  })).filter((pin) => Number.isFinite(pin.nx) && Number.isFinite(pin.ny));
};

export const normalizeBug = (bug) => {
  if (!bug || typeof bug !== 'object') return null;
  const meta = TYPE_TO_BARRIER_META[bug.type] ?? DEFAULT_BARRIER_META;
  const needType = bug.needType ?? meta.needType ?? 'P';
  const matrixPlans = needType !== 'O'
    ? getAllowedPlansForQuest({ needType }).map(normalizePlanId)
    : [];
  const mergedPlans = matrixPlans.length > 0
    ? matrixPlans
    : [
      ...(Array.isArray(bug.allowedPlans) ? bug.allowedPlans : []).map(normalizePlanId),
      ...meta.allowedPlans.map(normalizePlanId),
    ].filter((plan, idx, arr) => typeof plan === 'string' && arr.indexOf(plan) === idx);
  const chosenPlan = normalizePlanId(bug.chosenPlan);
  const normalizedChosenPlan = chosenPlan && (
    mergedPlans.includes(chosenPlan) || chosenPlan === 'ignore'
  )
    ? chosenPlan
    : null;
  return {
    ...bug,
    scale: bug.scale ?? meta.scale,
    factor: bug.factor ?? meta.factor,
    needType: bug.needType ?? meta.needType,
    tagLabel: bug.tagLabel ?? meta.tagLabel,
    affectedGroups: Array.isArray(bug.affectedGroups) ? bug.affectedGroups : [],
    timeTag: typeof bug.timeTag === 'string' ? bug.timeTag : null,
    severity: ['low', 'mid', 'high'].includes(bug.severity) ? bug.severity : 'mid',
    allowedPlans: mergedPlans.length > 0 ? mergedPlans : [...meta.allowedPlans],
    chosenPlan: normalizedChosenPlan,
    captureMode: bug.captureMode === 'map' ? 'map' : 'onsite',
    mapPin: Array.isArray(bug.mapPin) && bug.mapPin.length >= 2
      ? [Number(bug.mapPin[0]), Number(bug.mapPin[1])]
      : null,
    sourceQuestId: bug.sourceQuestId ?? null,
    fromPost: !!bug.fromPost,
    placeArchetype: typeof bug.placeArchetype === 'string' ? bug.placeArchetype : null,
    photoPins: normalizePhotoPins(bug.photoPins),
    isMine: !!bug.isMine,
  };
};

export const normalizeGoodSpot = (spot) => {
  if (!spot || typeof spot !== 'object') return null;
  if (!spot.id) return null;
  const hasValidPos = Array.isArray(spot.pos) && spot.pos.length === 3 && spot.pos.every(Number.isFinite);
  return {
    id: spot.id,
    bugId: spot.bugId ?? null,
    pos: hasValidPos ? [spot.pos[0], spot.pos[1], spot.pos[2]] : null,
    type: typeof spot.type === 'string' ? spot.type : 'unknown',
    factor: typeof spot.factor === 'string' ? spot.factor : 'hard',
    needType: typeof spot.needType === 'string' ? spot.needType : 'P',
    tagLabel: typeof spot.tagLabel === 'string' ? spot.tagLabel : '#記録',
    comment: typeof spot.comment === 'string' ? spot.comment : '',
    photo: typeof spot.photo === 'string' ? spot.photo : null,
    demographic: typeof spot.demographic === 'string' ? spot.demographic : '',
    postKind: spot.postKind === 'good' ? 'good' : 'spot',
    dayIndex: Number.isFinite(spot.dayIndex) ? Math.max(0, Math.floor(spot.dayIndex)) : 0,
    createdAt: typeof spot.createdAt === 'string' ? spot.createdAt : new Date().toISOString(),
    captureMode: spot.captureMode === 'map' ? 'map' : 'onsite',
    mapPin: Array.isArray(spot.mapPin) && spot.mapPin.length >= 2
      ? [Number(spot.mapPin[0]), Number(spot.mapPin[1])]
      : null,
    photoPins: normalizePhotoPins(spot.photoPins),
    isMine: !!spot.isMine,
  };
};

export const normalizeQuest = (quest) => {
  if (!quest || typeof quest !== 'object' || !quest.id) return null;
  return {
    ...quest,
    questStatus: normalizeQuestStatus(quest.questStatus),
    linkedBugId: quest.linkedBugId ?? null,
    isMine: !!quest.isMine,
    photoPins: normalizePhotoPins(quest.photoPins),
  };
};
