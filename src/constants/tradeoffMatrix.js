/**
 * needType × planId → 予算 & 4属性Δ
 * 出典: docs/改善プラン_満足度増減表.pdf
 */
export const TRADEOFF_MATRIX = {
  P: {
    hard_fix: { budget: -30, link: 20, place: 0, inclusive: 25, livability: 0 },
    detour_path: { budget: -15, link: 10, place: 0, inclusive: -10, livability: 0 },
    sign_info: { budget: -5, link: -5, place: 0, inclusive: -15, livability: 0 },
    ignore: { budget: 0, link: -15, place: 0, inclusive: -25, livability: 0 },
  },
  L: {
    mobility_support: { budget: -30, link: 25, place: 5, inclusive: 20, livability: -15 },
    detour_path: { budget: -15, link: 20, place: -10, inclusive: -10, livability: -10 },
    sign_info: { budget: -5, link: 5, place: 0, inclusive: -10, livability: -5 },
    ignore: { budget: 0, link: -25, place: 0, inclusive: -15, livability: 0 },
  },
  I: {
    sign_info: { budget: -5, link: 15, place: 0, inclusive: -5, livability: -5 },
    maintenance: { budget: -10, link: 10, place: 0, inclusive: 5, livability: -15 },
    care_point: { budget: -30, link: 15, place: 15, inclusive: 0, livability: -10 },
    ignore: { budget: 0, link: -25, place: 0, inclusive: -5, livability: 0 },
  },
  R: {
    care_point: { budget: -30, link: -5, place: 25, inclusive: 15, livability: -15 },
    maintenance: { budget: -20, link: -10, place: 15, inclusive: 5, livability: -5 },
    sign_info: { budget: -5, link: -5, place: -10, inclusive: -10, livability: 0 },
    ignore: { budget: 0, link: 0, place: -25, inclusive: -15, livability: 0 },
  },
  V: {
    lighting: { budget: -20, link: -5, place: 0, inclusive: 25, livability: -15 },
    care_point: { budget: -30, link: -10, place: 15, inclusive: 20, livability: -20 },
    maintenance: { budget: -10, link: 5, place: -5, inclusive: 15, livability: -15 },
    ignore: { budget: 0, link: -5, place: 0, inclusive: -25, livability: 0 },
  },
  M: {
    maintenance: { budget: -30, link: 5, place: 10, inclusive: 5, livability: 10 },
    hard_fix: { budget: -15, link: 5, place: 0, inclusive: 15, livability: 0 },
    sign_info: { budget: -5, link: -5, place: -5, inclusive: -5, livability: -10 },
    ignore: { budget: 0, link: -5, place: -15, inclusive: -5, livability: -25 },
  },
  S: {
    care_point: { budget: -30, link: -5, place: 15, inclusive: 25, livability: -15 },
    lighting: { budget: -20, link: -5, place: -5, inclusive: 20, livability: -15 },
    sign_info: { budget: -5, link: -5, place: -15, inclusive: 10, livability: -15 },
    ignore: { budget: 0, link: -5, place: -10, inclusive: -25, livability: -10 },
  },
  C: {
    care_point: { budget: -30, link: -5, place: 25, inclusive: 20, livability: -15 },
    mobility_support: { budget: -30, link: 20, place: 5, inclusive: 25, livability: -10 },
    sign_info: { budget: -5, link: -5, place: 0, inclusive: -15, livability: 0 },
    ignore: { budget: 0, link: -5, place: -15, inclusive: -25, livability: 0 },
  },
  /** O は joker_plan 専用。固定プランなし（ignore のペナルティのみ定義） */
  O: {
    ignore: { budget: 0, link: -10, place: -10, inclusive: -10, livability: -10 },
  },
};

export function getAllowedPlansForQuest({ needType }) {
  const row = TRADEOFF_MATRIX[needType] ?? TRADEOFF_MATRIX.P;
  return Object.keys(row).filter((plan) => plan !== 'ignore' && plan !== 'joker_plan');
}
