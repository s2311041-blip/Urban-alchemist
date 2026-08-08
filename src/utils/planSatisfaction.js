import { TRADEOFF_MATRIX } from '../constants/tradeoffMatrix';
import {
  SATISFACTION_KEYS,
  clampSatisfaction,
  createInitialSatisfaction,
  normalizeIslandSatisfaction,
} from '../constants/satisfactionAttributes';

export function getPlanMatrixEntry(needType, planId) {
  const row = TRADEOFF_MATRIX[needType] ?? TRADEOFF_MATRIX.P;
  return row[planId] ?? null;
}

/** プラン1件の満足度Δ */
export function getPlanSatisfactionDeltas(needType, planId) {
  const entry = getPlanMatrixEntry(needType, planId);
  if (!entry) return null;
  return Object.fromEntries(
    SATISFACTION_KEYS.map((key) => [key, entry[key] ?? 0]),
  );
}

export function getPlanBudgetCost(needType, planId, _scale = 'point') {
  const entry = getPlanMatrixEntry(needType, planId);
  if (!entry) return 0;
  return Math.abs(entry.budget ?? 0);
}

/** 現在値にプラン効果を加えたプレビュー（確定前） */
export function previewIslandSatisfaction(current, { needType, planId }) {
  const base = normalizeIslandSatisfaction(current);
  const entry = getPlanMatrixEntry(needType, planId);
  if (!entry) return { ...base };

  const next = { ...base };
  for (const key of SATISFACTION_KEYS) {
    const delta = entry[key] ?? 0;
    next[key] = clampSatisfaction(base[key] + delta);
  }
  return next;
}

/** プラン選択時のΔ一覧（UI用） */
export function getPlanPreviewDeltas(needType, planId, _scale = 'point') {
  const entry = getPlanMatrixEntry(needType, planId);
  if (!entry) return null;

  return {
    budgetCost: Math.abs(entry.budget ?? 0),
    deltas: Object.fromEntries(
      SATISFACTION_KEYS.map((key) => [key, entry[key] ?? 0]),
    ),
  };
}

export function applyPlanDeltaToSatisfaction(current, { needType, planId }) {
  return previewIslandSatisfaction(current, { needType, planId });
}

export function revertPlanDeltaFromSatisfaction(current, { needType, planId }) {
  const entry = getPlanMatrixEntry(needType, planId);
  const normalized = normalizeIslandSatisfaction(current);
  if (!entry) return { ...normalized };

  const next = { ...normalized };
  for (const key of SATISFACTION_KEYS) {
    const delta = entry[key] ?? 0;
    next[key] = clampSatisfaction(normalized[key] - delta);
  }
  return next;
}
