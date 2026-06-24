import { QUEST_STATUS } from '../store/helpers/questState';

/**
 * 場所プリセットのレイアウト形状（*_layout）向け needType 演出。
 * テンプレートの accent ブロックに加え、専用メッシュ側でも不満の型を反映する。
 *
 * 解決後は「状態・演出由来」（暗さ・汚れ・不安な雰囲気など）だけを BASE に戻し、
 * 「構造・地形由来」（段差・狭い通路など）は残す。
 */

export const isPlaceLayoutShape = (shape) => typeof shape === 'string' && shape.endsWith('_layout');

/** 解決しても骨格として残す型 */
export const STRUCTURAL_NEED_TYPES = new Set(['P', 'L']);

/** 解決でレイアウト演出を戻す型 */
export const EXPRESSION_NEED_TYPES = new Set(['V', 'M', 'S', 'C', 'I', 'R']);

const BASE = {
  lightMul: 1,
  windowGlowMul: 1,
  roadWidthMul: 1,
  extraNorthEntrySteps: 0,
  extraPlazaExitSteps: 0,
  walkwayTint: '#bdbdbd',
  asphaltColor: '#353535',
  bleakMood: false,
};

const BY_NEED = {
  P: {
    extraNorthEntrySteps: 3,
    extraPlazaExitSteps: 2,
    roadWidthMul: 0.76,
    walkwayTint: '#a89f94',
  },
  V: {
    lightMul: 0.4,
    windowGlowMul: 0.32,
    asphaltColor: '#262626',
    walkwayTint: '#8d9096',
    bleakMood: true,
  },
  S: {
    lightMul: 0.55,
    windowGlowMul: 0.42,
    asphaltColor: '#2e2e2e',
    bleakMood: true,
  },
  M: {
    walkwayTint: '#9a8f82',
    asphaltColor: '#3d3835',
    windowGlowMul: 0.7,
  },
  I: {
    lightMul: 0.88,
  },
  R: {
    lightMul: 0.92,
  },
  L: {
    roadWidthMul: 0.88,
  },
  C: {
    lightMul: 0.75,
    bleakMood: true,
  },
};

const EXPRESSION_KEYS = [
  'lightMul',
  'windowGlowMul',
  'bleakMood',
  'walkwayTint',
  'asphaltColor',
];

const STRUCTURAL_KEYS = [
  'extraNorthEntrySteps',
  'extraPlazaExitSteps',
  'roadWidthMul',
];

const mergeNeedStyle = (needType) => ({
  ...BASE,
  ...(needType && BY_NEED[needType] ? BY_NEED[needType] : {}),
});

const applyExpressionResolution = (style, needType) => {
  if (!needType || STRUCTURAL_NEED_TYPES.has(needType)) {
    return { ...style };
  }
  const resolved = { ...BASE };
  STRUCTURAL_KEYS.forEach((key) => {
    if (style[key] !== BASE[key]) {
      resolved[key] = style[key];
    }
  });
  EXPRESSION_KEYS.forEach((key) => {
    resolved[key] = BASE[key];
  });
  return resolved;
};

/**
 * @param {string|null|undefined} needType
 * @param {{ expressionResolved?: boolean }} [options]
 */
export const resolvePlaceNeedStyle = (needType, options = {}) => {
  const merged = mergeNeedStyle(needType);
  if (!options.expressionResolved || !needType || !EXPRESSION_NEED_TYPES.has(needType)) {
    return merged;
  }
  return applyExpressionResolution(merged, needType);
};

const ARCHETYPE_ALIASES = { transit: 'station' };

const normalizeArchetype = (archetype) => (
  typeof archetype === 'string' ? (ARCHETYPE_ALIASES[archetype] ?? archetype) : archetype
);

const isQuestResolved = (quest) => quest?.questStatus === QUEST_STATUS.RESOLVED;

const hasLegacyExpressionResolved = (block, quests = []) => {
  if (!block?.presetArchetype || !block?.presetNeedType) return false;
  const archetype = normalizeArchetype(block.presetArchetype);
  const related = quests.filter((quest) => (
    normalizeArchetype(quest.placeArchetype) === archetype
    && quest.needType === block.presetNeedType
  ));
  if (related.length === 0) return false;
  return related.every(isQuestResolved);
};

export const isPresetExpressionResolved = (block, quests = []) => {
  if (!block?.presetNeedType || !EXPRESSION_NEED_TYPES.has(block.presetNeedType)) {
    return false;
  }
  if (block.presetSourceQuestId) {
    const quest = quests.find((q) => q.id === block.presetSourceQuestId);
    return isQuestResolved(quest);
  }
  return hasLegacyExpressionResolved(block, quests);
};

export const shouldHidePresetExpressionAccent = (block, quests = []) => (
  !!block?.presetExpressionAccent && isPresetExpressionResolved(block, quests)
);

export const STATION_ENTRY_BASE_COUNT = 6;
export const STATION_ENTRY_START_Z = -4.35;
export const STATION_ENTRY_RUN = 0.22;
export const STATION_ENTRY_RISE = 0.1;
export const STATION_ENTRY_BASE_Y = 0.05;

export const STATION_EXIT_BASE_COUNT = 10;
export const STATION_EXIT_START_Z = 7.2;
export const STATION_EXIT_RUN = 0.28;
export const STATION_EXIT_RISE = -0.12;
export const STATION_EXIT_BASE_Y = 1.8;

export const BUS_ENTRY_BASE_COUNT = 3;
export const BUS_ENTRY_START_Z = -1.7;
export const BUS_ENTRY_RUN = 0.24;
export const BUS_ENTRY_RISE = 0.05;
export const BUS_ENTRY_BASE_Y = 0.03;
