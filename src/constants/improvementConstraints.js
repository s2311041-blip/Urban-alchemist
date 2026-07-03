/** RQ2 Phase 2 — 改善予算・プラン制約・ステークホルダー満足度 */

export const IMPROVEMENT_BUDGET_BY_SCALE = {
  point: 24,
  line: 36,
  area: 48,
};

export const BLOCK_IMPROVEMENT_COST = {
  block: 2,
  half: 2,
  slope: 4,
  path: 1,
  bench: 3,
  light_pole: 4,
  sign_post: 2,
  ferry_dock: 6,
  diagonal: 3,
  default: 2,
};

export const PLAN_SHAPE_LIMITS = {
  hard_fix: { allowedShapes: ['slope', 'half', 'path', 'block'], maxBlocks: 12 },
  lighting: { allowedShapes: ['light_pole', 'path', 'block'], maxBlocks: 10 },
  detour_path: { allowedShapes: ['path', 'sign_post', 'block'], maxBlocks: 14 },
  maintenance: { allowedShapes: ['path', 'bench', 'block', 'sign_post'], maxBlocks: 16 },
  sign_info: { allowedShapes: ['sign_post', 'bench', 'path', 'block'], maxBlocks: 10 },
  care_point: { allowedShapes: ['bench', 'light_pole', 'path', 'block'], maxBlocks: 12 },
  transit_link: { allowedShapes: ['ferry_dock', 'path', 'block'], maxBlocks: 8 },
  mobility_support: { allowedShapes: ['bench', 'path', 'sign_post', 'block'], maxBlocks: 14 },
};

export const STAKEHOLDER_GROUPS = [
  '車いす',
  '高齢者',
  '視覚',
  '子ども',
  '一般',
];

/** プラン完成時の affectedGroups への基本ボーナス */
export const PLAN_STAKEHOLDER_BONUS = {
  hard_fix: { 車いす: 18, 高齢者: 12, 一般: 8 },
  lighting: { 視覚: 20, 高齢者: 10, 一般: 6 },
  detour_path: { 車いす: 10, 子ども: 8, 一般: 6 },
  maintenance: { 高齢者: 14, 一般: 10 },
  sign_info: { 視覚: 12, 子ども: 10, 一般: 8 },
  care_point: { 高齢者: 16, 車いす: 12, 一般: 8 },
  transit_link: { 一般: 12, 高齢者: 8 },
};

/** 配置時の shape 別ペナルティ（affectedGroups に適用） */
export const SHAPE_STAKEHOLDER_PENALTY = {
  slope: { 車いす: -8, 高齢者: -4 },
  half: { 車いす: -5 },
};

export const MIN_STAKEHOLDER_SATISFACTION = 20;

export const getImprovementBudgetLimit = (bug) => {
  const scale = bug?.scale ?? 'point';
  return IMPROVEMENT_BUDGET_BY_SCALE[scale] ?? IMPROVEMENT_BUDGET_BY_SCALE.point;
};

export const getBlockImprovementCost = (block) => {
  const shape = block?.shape ?? 'block';
  return BLOCK_IMPROVEMENT_COST[shape] ?? BLOCK_IMPROVEMENT_COST.default;
};

export const getPlanShapeLimits = (plan) => (
  PLAN_SHAPE_LIMITS[plan] ?? { allowedShapes: null, maxBlocks: 20 }
);

export const getInitialStakeholderSatisfaction = (affectedGroups = []) => {
  const groups = {};
  STAKEHOLDER_GROUPS.forEach((g) => { groups[g] = 55; });
  (Array.isArray(affectedGroups) ? affectedGroups : []).forEach((g) => {
    if (groups[g] !== undefined) groups[g] = 38;
  });
  return groups;
};

export const clampSatisfaction = (value) => Math.min(100, Math.max(0, Math.round(value)));
