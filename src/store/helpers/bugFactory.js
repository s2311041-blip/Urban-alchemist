import {
  DEFAULT_BARRIER_META,
  TYPE_TO_BARRIER_META,
  normalizePlanId,
} from '../../constants/barrierData';
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
  const mergedPlans = [
    ...(Array.isArray(bug.allowedPlans) ? bug.allowedPlans : []).map(normalizePlanId),
    ...meta.allowedPlans.map(normalizePlanId),
  ].filter((plan, idx, arr) => typeof plan === 'string' && arr.indexOf(plan) === idx);
  const chosenPlan = normalizePlanId(bug.chosenPlan);
  const normalizedChosenPlan = chosenPlan && mergedPlans.includes(chosenPlan)
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

export const createDefaultBugs = () => ([
  {
    id: 1,
    type: 'empty',
    factor: 'hard',
    needType: 'P',
    tagLabel: '#殺風景',
    pos: [0, 0.5, 0], // approximately center
    comment: '駅前なのに何もない。殺風景で寂しい。',
    severity: 'high',
    allowedPlans: ['plant_tree', 'build_bench'],
  }
]);

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

export const createDefaultQuests = () => ([
  {
    id: 102,
    type: 'danger',
    isMine: true,
    demographic: 'あなた',
    photo: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=800',
    comment: 'この段差、自転車だといつもガタンってなって転びそうになる。',
  },
  {
    id: 103,
    type: 'dirty',
    isMine: false,
    demographic: '60代・男性',
    photo: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
    comment: '公園 of ベンチの周りにいつもゴミが散乱していて座れない。',
  },
  {
    id: 104,
    type: 'lonely',
    isMine: false,
    demographic: '70代・女性',
    photo: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&q=80&w=800',
    comment: 'この辺りは声をかけ合える場所がなくて、夜は特に不安になる。',
  },
  {
    id: 105,
    type: 'line_sign_confusion',
    isMine: false,
    demographic: '観光客',
    photo: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800',
    comment: '分かれ道に案内が少なくて、駅までの道で毎回迷ってしまう。',
  },
  {
    id: 106,
    type: 'area_maintenance_gap',
    isMine: false,
    demographic: '子育て中',
    photo: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800',
    comment: '公園周辺に休める場所が少なく、子ども連れだと移動がきつい。',
  },
  {
    id: 107,
    type: 'line_step_gap',
    isMine: false,
    demographic: '車いす利用者',
    photo: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664?auto=format&fit=crop&q=80&w=800',
    comment: 'この通りは段差が続いていて、遠回りしないと進めない。',
  },
  {
    id: 108,
    type: 'area_isolation',
    isMine: false,
    demographic: '高齢者',
    photo: 'https://images.unsplash.com/photo-1529694157871-1ea5d5e2558a?auto=format&fit=crop&q=80&w=800',
    comment: 'この周辺には頼れる場所が少なく、困った時に不安です。',
  },
].map((quest) => normalizeQuest(quest)).filter(Boolean));
