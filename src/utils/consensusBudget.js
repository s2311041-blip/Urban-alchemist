import { SESSION_BUDGET_TOTAL } from '../constants/satisfactionAttributes';

/** 合意形成セッションの初期予算（5クエスト想定・固定100） */
export function computeSessionBudget(_activeBugs = []) {
  return {
    totalSessionBudget: SESSION_BUDGET_TOTAL,
    budgetInitialFormula: `固定${SESSION_BUDGET_TOTAL}（5クエスト同時型）`,
  };
}

/** @deprecated 新マトリクスは scale 倍率なし。常に 1 を返す */
export function getScaleMultiplier(_scale) {
  return 1;
}
