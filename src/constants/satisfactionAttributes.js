import linkIllustration from '../assets/pictgrams/attributes/Link_attribute.jpeg';
import placeIllustration from '../assets/pictgrams/attributes/Place_attribute.jpeg';
import inclusiveIllustration from '../assets/pictgrams/attributes/Inclusive_attribute.jpeg';
import livabilityIllustration from '../assets/pictgrams/attributes/Livability_attribute.jpeg';

/** 満足度4軸 — Link / Place / Inclusive / Livability */

export const SATISFACTION_KEYS = ['link', 'place', 'inclusive', 'livability'];

export const MIN_ISLAND_SATISFACTION = 20;
export const INITIAL_ISLAND_SATISFACTION = 50;
export const SESSION_BUDGET_TOTAL = 100;

export const SATISFACTION_ATTRS = [
  {
    key: 'link',
    label: '移動・効率性',
    shortLabel: '移動',
    hint: 'スムーズかつ迅速に通れるか',
    color: '#00bcd4',
    imageSrc: linkIllustration,
  },
  {
    key: 'place',
    label: '滞在・賑わい',
    shortLabel: '滞在',
    hint: '留まって楽しむ・交流できるか',
    color: '#ff9800',
    imageSrc: placeIllustration,
  },
  {
    key: 'inclusive',
    label: '安全・バリアフリー',
    shortLabel: '安全',
    hint: '誰もが安心して通行できるか',
    color: '#66bb6a',
    imageSrc: inclusiveIllustration,
  },
  {
    key: 'livability',
    label: '静けさ・住環境',
    shortLabel: '静けさ',
    hint: '騒音・ゴミ・混雑なく、静かに暮らせるか',
    color: '#9c27b0',
    imageSrc: livabilityIllustration,
  },
];

export const SATISFACTION_ATTR_BY_KEY = Object.fromEntries(
  SATISFACTION_ATTRS.map((attr) => [attr.key, attr]),
);

export function createInitialSatisfaction() {
  return Object.fromEntries(SATISFACTION_KEYS.map((k) => [k, INITIAL_ISLAND_SATISFACTION]));
}

/** Zustand セレクター用 — 毎レンダーで新オブジェクトを返さない */
export const DEFAULT_ISLAND_SATISFACTION = Object.freeze(
  Object.fromEntries(SATISFACTION_KEYS.map((k) => [k, INITIAL_ISLAND_SATISFACTION])),
);

/** セーブデータ復元用 */
export function normalizeConsensusSession(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    sessionId: typeof raw.sessionId === 'string' ? raw.sessionId : `session_${Date.now()}`,
    isActive: raw.isActive !== false,
    phase: typeof raw.phase === 'string' ? raw.phase : 'planning',
    totalSessionBudget: Number.isFinite(raw.totalSessionBudget) ? raw.totalSessionBudget : 100,
    remainingSessionBudget: Number.isFinite(raw.remainingSessionBudget) ? raw.remainingSessionBudget : 100,
    budgetInitialFormula: raw.budgetInitialFormula ?? null,
    islandSatisfaction: normalizeIslandSatisfaction(raw.islandSatisfaction),
    questDecisions: raw.questDecisions && typeof raw.questDecisions === 'object' ? raw.questDecisions : {},
    jokerUsed: !!raw.jokerUsed,
    startedAt: Number.isFinite(raw.startedAt) ? raw.startedAt : Date.now(),
    submittedAt: Number.isFinite(raw.submittedAt) ? raw.submittedAt : null,
  };
}

/** 旧キー（mobility 等）からの読み込み互換 */
export function normalizeIslandSatisfaction(raw) {
  if (!raw || typeof raw !== 'object') return createInitialSatisfaction();
  if (SATISFACTION_KEYS.every((k) => Number.isFinite(raw[k]))) {
    return Object.fromEntries(SATISFACTION_KEYS.map((k) => [k, clampSatisfaction(raw[k])]));
  }
  return {
    link: clampSatisfaction(raw.link ?? raw.mobility ?? INITIAL_ISLAND_SATISFACTION),
    place: clampSatisfaction(raw.place ?? raw.everyday ?? INITIAL_ISLAND_SATISFACTION),
    inclusive: clampSatisfaction(raw.inclusive ?? raw.safety ?? INITIAL_ISLAND_SATISFACTION),
    livability: clampSatisfaction(raw.livability ?? raw.sensory ?? INITIAL_ISLAND_SATISFACTION),
  };
}

export function clampSatisfaction(value) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function satisfactionLogPayload(satisfaction) {
  const s = normalizeIslandSatisfaction(satisfaction);
  return {
    sat_link: s.link,
    sat_place: s.place,
    sat_inclusive: s.inclusive,
    sat_livability: s.livability,
    sat_mobility: s.link,
    sat_sensory: s.livability,
    sat_safety: s.inclusive,
    sat_everyday: s.place,
  };
}
