import {
  SATISFACTION_ATTRS,
  SATISFACTION_KEYS,
  clampSatisfaction,
} from '../constants/satisfactionAttributes';

export const JOKER_PLAN_ID = 'joker_plan';
export const JOKER_BUDGET_MIN = 10;
export const JOKER_BUDGET_MAX = 30;
export const JOKER_BUDGET_OPTIONS = [10, 15, 20, 25, 30];
export const JOKER_MAX_DELTA_PER_ATTR = 25;
export const JOKER_PLUS_RATE = 1.5;
export const JOKER_MINUS_RATE = 0.5;
export const JOKER_BLOCKS_PER_BUDGET = 0.5;
export const JOKER_MIN_MAX_BLOCKS = 3;
export const JOKER_MAX_MAX_BLOCKS = 15;

/** 独自案の DIY ブロック上限（消費予算に比例） */
export function getJokerMaxBlocks(budgetCost) {
  const budget = Number(budgetCost);
  if (!Number.isFinite(budget)) return JOKER_MIN_MAX_BLOCKS;
  const raw = Math.round(budget * JOKER_BLOCKS_PER_BUDGET);
  return Math.min(JOKER_MAX_MAX_BLOCKS, Math.max(JOKER_MIN_MAX_BLOCKS, raw));
}

/** 独自案を「完成」とみなすのに必要な最低ブロック数 */
export function getJokerRequiredBlocks(budgetCost) {
  return Math.max(1, Math.floor(getJokerMaxBlocks(budgetCost) / 3));
}

export function createEmptyJokerDeltas() {
  return Object.fromEntries(SATISFACTION_KEYS.map((k) => [k, 0]));
}

export function validateJokerPlan({
  title = '',
  description = '',
  budgetCost,
  deltas = {},
} = {}) {
  const trimmedTitle = String(title).trim();
  const trimmedDescription = String(description).trim();
  if (trimmedTitle.length < 2) {
    return { ok: false, message: '案の名前を2文字以上入力してください。' };
  }
  if (trimmedDescription.length < 4) {
    return { ok: false, message: '内容の説明を4文字以上入力してください。' };
  }

  const budget = Number(budgetCost);
  if (!Number.isFinite(budget) || budget < JOKER_BUDGET_MIN || budget > JOKER_BUDGET_MAX) {
    return { ok: false, message: `予算は${JOKER_BUDGET_MIN}〜${JOKER_BUDGET_MAX}の範囲で指定してください。` };
  }

  let plusTotal = 0;
  let minusTotal = 0;
  for (const key of SATISFACTION_KEYS) {
    const value = Number(deltas[key] ?? 0);
    if (!Number.isInteger(value)) {
      return { ok: false, message: '満足度の増減は整数で入力してください。' };
    }
    if (value > JOKER_MAX_DELTA_PER_ATTR || value < -JOKER_MAX_DELTA_PER_ATTR) {
      const label = SATISFACTION_ATTRS.find((a) => a.key === key)?.shortLabel ?? key;
      return { ok: false, message: `${label}は+${JOKER_MAX_DELTA_PER_ATTR}〜-${JOKER_MAX_DELTA_PER_ATTR}の範囲です。` };
    }
    if (value > 0) plusTotal += value;
    if (value < 0) minusTotal += Math.abs(value);
  }

  const maxPlus = Math.floor(budget * JOKER_PLUS_RATE);
  if (plusTotal <= 0) {
    return { ok: false, message: '少なくとも1つの属性をプラスにしてください。' };
  }
  if (plusTotal > maxPlus) {
    return { ok: false, message: `プラス合計は${maxPlus}以下にしてください（現在${plusTotal}）。` };
  }
  const minMinus = Math.ceil(plusTotal * JOKER_MINUS_RATE);
  if (minusTotal < minMinus) {
    return { ok: false, message: `副作用（マイナス合計）は${minMinus}以上必要です（現在${minusTotal}）。` };
  }

  return {
    ok: true,
    payload: {
      title: trimmedTitle,
      description: trimmedDescription,
      budgetCost: budget,
      deltas: Object.fromEntries(SATISFACTION_KEYS.map((k) => [k, Number(deltas[k] ?? 0)])),
    },
  };
}

export function applyJokerDeltasToSatisfaction(current, deltas = {}) {
  const next = { ...current };
  for (const key of SATISFACTION_KEYS) {
    next[key] = clampSatisfaction((current[key] ?? 0) + (deltas[key] ?? 0));
  }
  return next;
}

export function revertJokerDeltasFromSatisfaction(current, deltas = {}) {
  const next = { ...current };
  for (const key of SATISFACTION_KEYS) {
    next[key] = clampSatisfaction((current[key] ?? 0) - (deltas[key] ?? 0));
  }
  return next;
}

export function previewJokerDeltas(deltas = {}) {
  return Object.fromEntries(SATISFACTION_KEYS.map((k) => [k, Number(deltas[k] ?? 0)]));
}

export function getJokerPlusBudgetCap(budgetCost) {
  const budget = Number(budgetCost);
  if (!Number.isFinite(budget)) return 0;
  return Math.floor(budget * JOKER_PLUS_RATE);
}
