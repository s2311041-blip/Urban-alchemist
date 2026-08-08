import { SATISFACTION_ATTRS } from '../constants/satisfactionAttributes';
import { getPlanContextLabel, getPlanContextTradeoff } from '../constants/planContextLabels';
import { getPlanMatrixEntry } from './planSatisfaction';

function formatDelta(value) {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

function pickStakeholderLabel(affectedGroups = []) {
  if (Array.isArray(affectedGroups) && affectedGroups.length > 0) {
    return affectedGroups[0];
  }
  return 'この場所の当事者';
}

/** 改善完了後の RPG 風フィードバック文 */
export function buildPlanResolutionFeedback({
  needType,
  planId,
  affectedGroups = [],
  questComment = '',
}) {
  const entry = getPlanMatrixEntry(needType, planId);
  if (!entry) return null;

  const planLabel = getPlanContextLabel(needType, planId) ?? planId;
  const tradeoff = getPlanContextTradeoff(needType, planId);
  const who = pickStakeholderLabel(affectedGroups);
  const snippet = typeof questComment === 'string' && questComment.length > 0
    ? questComment.slice(0, 24)
    : 'この不満';

  const ups = SATISFACTION_ATTRS
    .map((attr) => ({ attr, delta: entry[attr.key] ?? 0 }))
    .filter(({ delta }) => delta > 0);
  const downs = SATISFACTION_ATTRS
    .map((attr) => ({ attr, delta: entry[attr.key] ?? 0 }))
    .filter(({ delta }) => delta < 0);

  const upLine = ups.length > 0
    ? ups.map(({ attr, delta }) => `${attr.shortLabel}${formatDelta(delta)}`).join('、')
    : null;
  const downLine = downs.length > 0
    ? downs.map(({ attr, delta }) => `${attr.shortLabel}${formatDelta(delta)}`).join('、')
    : null;

  const budgetCost = Math.abs(entry.budget ?? 0);
  const parts = [`「${snippet}${questComment?.length > 24 ? '…' : ''}」に「${planLabel}」を実行。`];

  if (upLine) {
    parts.push(`${who}にとって ${upLine} が上がった。`);
  }
  if (downLine) {
    parts.push(`しかし ${downLine} は下がってしまった。`);
  }
  if (budgetCost > 0) {
    parts.push(`予算を ${budgetCost} 消費した。`);
  }
  if (tradeoff) {
    parts.push(tradeoff);
  }

  return parts.join('');
}

export function buildJokerResolutionFeedback({
  jokerPlan,
  affectedGroups = [],
  questComment = '',
}) {
  if (!jokerPlan) return null;

  const who = Array.isArray(affectedGroups) && affectedGroups.length > 0
    ? affectedGroups[0]
    : 'この場所の当事者';
  const snippet = typeof questComment === 'string' && questComment.length > 0
    ? questComment.slice(0, 24)
    : 'この不満';

  const ups = SATISFACTION_ATTRS
    .map((attr) => ({ attr, delta: jokerPlan.deltas?.[attr.key] ?? 0 }))
    .filter(({ delta }) => delta > 0);
  const downs = SATISFACTION_ATTRS
    .map((attr) => ({ attr, delta: jokerPlan.deltas?.[attr.key] ?? 0 }))
    .filter(({ delta }) => delta < 0);

  const formatDelta = (value) => (value > 0 ? `+${value}` : `${value}`);
  const parts = [
    `「${snippet}${questComment?.length > 24 ? '…' : ''}」に参加者案「${jokerPlan.title}」を実行。`,
  ];

  if (ups.length > 0) {
    parts.push(`${who}にとって ${ups.map(({ attr, delta }) => `${attr.shortLabel}${formatDelta(delta)}`).join('、')} が上がった。`);
  }
  if (downs.length > 0) {
    parts.push(`しかし ${downs.map(({ attr, delta }) => `${attr.shortLabel}${formatDelta(delta)}`).join('、')} は下がってしまった。`);
  }
  if (jokerPlan.budgetCost > 0) {
    parts.push(`予算を ${jokerPlan.budgetCost} 消費した。`);
  }
  if (jokerPlan.description) {
    parts.push(jokerPlan.description);
  }

  return parts.join('');
}
