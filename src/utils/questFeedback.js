import { PLAN_LABEL } from '../constants/barrierData';
import { PLACE_ARCHETYPE_LABELS } from './placePresets';

export const buildSpawnToast = (quest, presetLabel = null) => {
  if (presetLabel) return `${presetLabel}にあなたの投稿を載せました。`;
  if (quest?.placeArchetype === 'none') return 'あなたの投稿をオーブとして島に載せました。';
  const placeLabel = PLACE_ARCHETYPE_LABELS[quest?.placeArchetype];
  if (placeLabel) return `${placeLabel}にあなたの投稿を載せました。`;
  return 'あなたの投稿を島に載せました。';
};

export const buildResolveToast = (quest, planId) => {
  const snippet = typeof quest?.comment === 'string'
    ? quest.comment.slice(0, 20)
    : '投稿';
  const planLabel = PLAN_LABEL[planId] ?? planId ?? '解決プラン';
  return `「${snippet}${quest?.comment?.length > 20 ? '…' : ''}」が解決されました（${planLabel}）`;
};
