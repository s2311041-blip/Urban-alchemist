import { SATISFACTION_ATTRS } from '../constants/satisfactionAttributes';
import { getPlanContextLabel, getPlanContextTradeoff } from '../constants/planContextLabels';
import { getPlanMatrixEntry } from './planSatisfaction';
import { PLAN_FEEDBACK_NARRATIVE } from '../constants/narrativeData';

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

/** 改善完了後の RPG 風フィードバック文（👍/💢 ナラティブ） */
export function buildPlanResolutionFeedback({
  needType,
  planId,
  affectedGroups = [],
  questComment = '',
}) {
  const entry = getPlanMatrixEntry(needType, planId);
  const narrative = PLAN_FEEDBACK_NARRATIVE[planId] ?? {
    positive: { speaker: '市民', text: '課題が解決しました！' },
    negative: null
  };
  
  const planLabel = getPlanContextLabel(needType, planId) ?? planId;
  const snippet = typeof questComment === 'string' && questComment.length > 0
    ? questComment.slice(0, 16)
    : 'この不満';

  const parts = [
    {
      speaker: 'システム',
      role: '進行',
      color: '#90caf9',
      text: `「${snippet}…」を\n${planLabel}で解決しました。`
    }
  ];

  if (!entry) {
    parts.push({
      speaker: narrative.positive.speaker,
      role: '喜びの声',
      color: '#81c784',
      text: narrative.positive.text
    });
    return parts;
  }
  
  parts.push({
    speaker: narrative.positive.speaker,
    role: '喜びの声',
    color: '#81c784',
    text: narrative.positive.text
  });

  if (narrative.negative) {
    parts.push({
      speaker: narrative.negative.speaker,
      role: '不満・警告の声',
      color: '#ef5350',
      text: narrative.negative.text
    });
  }

  return parts;
}

export function buildJokerResolutionFeedback({
  jokerPlan,
  affectedGroups = [],
  questComment = '',
}) {
  if (!jokerPlan) return null;

  const snippet = typeof questComment === 'string' && questComment.length > 0
    ? questComment.slice(0, 16)
    : 'この不満';

  const parts = [
    {
      speaker: 'システム',
      role: '進行',
      color: '#90caf9',
      text: `「${snippet}…」に\n参加者案「${jokerPlan.title}」を実行しました。`
    }
  ];

  parts.push({
    speaker: '住民',
    role: '喜びの声',
    color: '#81c784',
    text: '自分たちの独自アイデアが実現して嬉しい！'
  });
  
  if (jokerPlan.budgetCost > 0) {
    parts.push({
      speaker: '副市長',
      role: '警告',
      color: '#ef5350',
      text: `…独自の施策に特別予算 ${jokerPlan.budgetCost} を消費しました。`
    });
  }

  return parts;
}
