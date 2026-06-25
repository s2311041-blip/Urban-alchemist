import { normalizeBug } from '../store/helpers/bugFactory';

/** P + hard_fix 解決後のトレードオフ不満（Phase 2-E） */
export const createTradeoffBugFromResolution = (targetBug) => {
  if (!targetBug || targetBug.needType !== 'P' || targetBug.chosenPlan !== 'hard_fix') {
    return null;
  }
  if (!Array.isArray(targetBug.pos) || targetBug.pos.length < 3) return null;

  const [x, y, z] = targetBug.pos;
  return normalizeBug({
    id: `bug_tradeoff_${Date.now()}`,
    type: 'danger',
    needType: 'P',
    factor: 'hard',
    comment: '急な勾配で歩きにくい',
    pos: [x + 2.5, y, z + 1.5],
    demographic: '車いす',
    affectedGroups: ['車いす'],
    fromPost: false,
    sourceQuestId: null,
    scale: 'point',
    placeArchetype: targetBug.placeArchetype ?? null,
    solved: false,
  });
};
