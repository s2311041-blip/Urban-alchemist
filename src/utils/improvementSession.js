import {
  clampSatisfaction,
  getBlockImprovementCost,
  getImprovementBudgetLimit,
  getInitialStakeholderSatisfaction,
  getPlanShapeLimits,
  MIN_STAKEHOLDER_SATISFACTION,
  PLAN_STAKEHOLDER_BONUS,
  SHAPE_STAKEHOLDER_PENALTY,
  STAKEHOLDER_GROUPS,
} from '../constants/improvementConstraints';

export const createImprovementSession = (bug, placedBlocksSnapshot = []) => ({
  sessionId: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  bugId: bug.id,
  questId: bug.sourceQuestId ?? null,
  plan: bug.chosenPlan ?? null,
  budgetLimit: getImprovementBudgetLimit(bug),
  budgetSpent: 0,
  blockCount: 0,
  placedBlockIdsAtStart: (placedBlocksSnapshot ?? []).map((b) => b.id).filter(Boolean),
  stakeholderSatisfaction: getInitialStakeholderSatisfaction(bug.affectedGroups),
  startedAt: Date.now(),
});

export const isSessionPlacedBlock = (block, session) => {
  if (!session || !block?.id) return false;
  if (block.presetLocked) return false;
  return !session.placedBlockIdsAtStart.includes(block.id);
};

export const canPlaceShapeInSession = (session, shape) => {
  if (!session?.plan) return { ok: true };
  const limits = getPlanShapeLimits(session.plan);
  if (!limits.allowedShapes) return { ok: true };
  if (limits.allowedShapes.includes(shape)) return { ok: true };
  return {
    ok: false,
    message: `この解決型では「${shape}」は使えません。`,
  };
};

export const applyStakeholderPlacementDelta = (session, block, bug) => {
  const shape = block?.shape ?? 'block';
  const penalties = SHAPE_STAKEHOLDER_PENALTY[shape];
  if (!penalties) return session.stakeholderSatisfaction;

  const affected = new Set(Array.isArray(bug?.affectedGroups) ? bug.affectedGroups : []);
  const next = { ...session.stakeholderSatisfaction };
  Object.entries(penalties).forEach(([group, delta]) => {
    if (affected.has(group) && next[group] !== undefined) {
      next[group] = clampSatisfaction(next[group] + delta);
    }
  });
  return next;
};

export const applyBuildSpend = (session, block, bug) => {
  if (!session || !block) return session;
  const cost = getBlockImprovementCost(block);
  return {
    ...session,
    budgetSpent: session.budgetSpent + cost,
    blockCount: session.blockCount + 1,
    stakeholderSatisfaction: applyStakeholderPlacementDelta(session, block, bug),
  };
};

export const applyPlanCompletionBonus = (session, bug) => {
  const plan = session?.plan ?? bug?.chosenPlan;
  const bonus = PLAN_STAKEHOLDER_BONUS[plan];
  if (!bonus) return session.stakeholderSatisfaction;

  const affected = new Set(Array.isArray(bug?.affectedGroups) ? bug.affectedGroups : []);
  const next = { ...session.stakeholderSatisfaction };
  Object.entries(bonus).forEach(([group, delta]) => {
    if (next[group] === undefined) return;
    const multiplier = affected.has(group) ? 1.2 : 0.6;
    next[group] = clampSatisfaction(next[group] + delta * multiplier);
  });
  return next;
};

export const getMinStakeholderSatisfaction = (satisfaction = {}) => {
  const values = STAKEHOLDER_GROUPS.map((g) => satisfaction[g]).filter(Number.isFinite);
  return values.length > 0 ? Math.min(...values) : 100;
};

export const validateFinishSession = (session) => {
  const issues = [];

  if (session.budgetSpent > session.budgetLimit) {
    issues.push(
      `改善予算を ${session.budgetSpent - session.budgetLimit} 超過しています（上限 ${session.budgetLimit}）`,
    );
  }

  const limits = getPlanShapeLimits(session.plan);
  if (limits.maxBlocks && session.blockCount > limits.maxBlocks) {
    issues.push(`プランのブロック上限（${limits.maxBlocks}）を超えています`);
  }

  const minSat = getMinStakeholderSatisfaction(session.stakeholderSatisfaction);
  if (minSat < MIN_STAKEHOLDER_SATISFACTION) {
    issues.push('ステークホルダーの満足度が低すぎます。別の解決型や配置を検討してください。');
  }

  return {
    ok: issues.length === 0,
    issues,
    message: issues.join(' '),
    minStakeholderSatisfaction: minSat,
    budgetRemaining: session.budgetLimit - session.budgetSpent,
  };
};

export const buildImprovementBuildEvent = (session) => ({
  t: Date.now(),
  kind: 'build',
  sessionId: session.sessionId,
  questId: session.questId,
  bugId: session.bugId,
  plan: session.plan,
  budgetSpent: session.budgetSpent,
  budgetLimit: session.budgetLimit,
  blockCount: session.blockCount,
  minStakeholderSatisfaction: getMinStakeholderSatisfaction(session.stakeholderSatisfaction),
});

export const extendResolveEvent = (base, sessionValidation) => ({
  ...base,
  sessionId: sessionValidation?.sessionId ?? null,
  budgetSpent: sessionValidation?.budgetSpent ?? null,
  budgetRemaining: sessionValidation?.budgetRemaining ?? null,
  minStakeholderSatisfaction: sessionValidation?.minStakeholderSatisfaction ?? null,
});

export const exportResearchLogCsv = (postStats) => {
  const events = Array.isArray(postStats?.events) ? postStats.events : [];
  const header = [
    't',
    'kind',
    'questId',
    'bugId',
    'chosenPlan',
    'sessionId',
    'budgetSpent',
    'budgetRemaining',
    'minStakeholderSatisfaction',
    'needType',
    'placeArchetype',
    'remainingSessionBudget',
    'sat_general',
    'sat_wheelchair',
    'sat_senior',
    'sat_childcare',
    'isSeriousMode'
  ].join(',');

  const rows = events.map((e) => [
    e.t ?? '',
    e.kind ?? '',
    e.questId ?? '',
    e.bugId ?? '',
    e.chosenPlan ?? '',
    e.sessionId ?? '',
    e.budgetSpent ?? '',
    e.budgetRemaining ?? '',
    e.minStakeholderSatisfaction ?? '',
    e.needType ?? '',
    e.placeArchetype ?? '',
    e.remainingSessionBudget ?? '',
    e.sat_general ?? '',
    e.sat_wheelchair ?? '',
    e.sat_senior ?? '',
    e.sat_childcare ?? '',
    e.isSeriousMode ? '1' : '0',
  ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));

  return [header, ...rows].join('\n');
};
