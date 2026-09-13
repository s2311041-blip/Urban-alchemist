import { computeSessionBudget } from '../../utils/consensusBudget';
import { QUEST_STATUS } from '../helpers/questState';
import { TRADEOFF_MATRIX } from '../../constants/tradeoffMatrix';
import { TYPE_TO_BARRIER_META, DEFAULT_BARRIER_META } from '../../constants/barrierData';
import {
  createInitialSatisfaction,
  SATISFACTION_ATTRS,
  satisfactionLogPayload,
} from '../../constants/satisfactionAttributes';
import {
  applyPlanDeltaToSatisfaction,
  getPlanBudgetCost,
  revertPlanDeltaFromSatisfaction,
} from '../../utils/planSatisfaction';
import { JOKER_PLAN_ID, applyJokerDeltasToSatisfaction, revertJokerDeltasFromSatisfaction, validateJokerPlan } from '../../utils/jokerPlan';
import { appendPostEvent, markQuestResolved } from '../helpers/questLifecycle';
import { setTimedToast } from '../helpers/uiFeedback';
import { sameBugId } from '../../utils/bugIds';
import { buildPlanResolutionFeedback } from '../../utils/planResolutionFeedback';

function checkConsensusGameOver(set, get, nextSat) {
  const minSat = Math.min(...SATISFACTION_ATTRS.map((a) => nextSat[a.key] ?? 0));
  if (minSat <= 0) {
    setTimedToast({
      set,
      get,
      message: '特定層の不満が限界を超えました（暴動）。セッションは失敗です。',
      durationMs: 6000,
    });
  }
}

export const createConsensusSlice = (set, get) => ({
  ignoreQuest: (questId) => {
    const state = get();
    const decision = state.questDecisions[questId] || getInitialDecision(state, questId);
    if (decision.status !== 'pending') return;

    // 先に選んでいたプラン（型・独自案）があれば巻き戻してから無視を適用する
    let baseBudget = state.remainingBudget;
    let baseSatisfaction = state.islandSatisfaction;
    if (decision.satisfactionDeltaApplied && decision.chosenPlan) {
      baseBudget += decision.planMatrixCostApplied;
      baseSatisfaction = decision.chosenPlan === JOKER_PLAN_ID && decision.jokerPlan
        ? revertJokerDeltasFromSatisfaction(baseSatisfaction, decision.jokerPlan.deltas)
        : revertPlanDeltaFromSatisfaction(baseSatisfaction, {
          needType: decision.needType,
          planId: decision.chosenPlan,
        });
    }

    const nextSat = applyPlanDeltaToSatisfaction(baseSatisfaction, {
      needType: decision.needType,
      planId: 'ignore',
    });

    const nextDecision = {
      ...decision,
      status: 'ignored',
      chosenPlan: 'ignore',
      planMatrixCostApplied: 0,
      satisfactionDeltaApplied: true,
      jokerPlan: null,
    };

    const targetBug = state.bugs.find(b => b.sourceQuestId === questId || b.id === questId);
    const updatedBugs = targetBug ? state.bugs.map((b) => (
      sameBugId(b.id, targetBug.id) ? { ...b, solved: true } : b
    )) : state.bugs;

    const feedback = targetBug ? buildPlanResolutionFeedback({
      needType: decision.needType,
      planId: 'ignore',
      affectedGroups: targetBug.affectedGroups,
      questComment: state.quests.find((q) => q.id === targetBug.sourceQuestId)?.comment ?? targetBug.comment,
    }) : null;

    set({
      remainingBudget: baseBudget,
      islandSatisfaction: nextSat,
      bugs: updatedBugs,
      quests: targetBug && targetBug.sourceQuestId ? markQuestResolved(state.quests, targetBug.sourceQuestId, targetBug.id) : state.quests,
      narrativeFeedback: feedback,
      questDecisions: {
        ...state.questDecisions,
        [questId]: nextDecision,
      },
      postStats: appendPostEvent(state.postStats, {
        t: Date.now(),
        kind: 'quest_ignore',
        questId,
        isSeriousMode: true,
        ...satisfactionLogPayload(nextSat),
      }),
    });
    checkConsensusGameOver(set, get, nextSat);
  },

  /** プラン選択時 — 満足度・予算を確定（建築完了前、status は pending のまま） */
  commitQuestPlanChoice: (questId, chosenPlan) => {
    const state = get();
    if (!questId || !chosenPlan) return false;

    const decision = state.questDecisions[questId] || getInitialDecision(state, questId);
    if (decision.status !== 'pending') return false;

    let baseBudget = state.remainingBudget;
    let baseSatisfaction = state.islandSatisfaction;

    if (decision.satisfactionDeltaApplied) {
      if (decision.chosenPlan === chosenPlan) return true;
      // Revert old plan if they changed their mind before finishing
      if (decision.chosenPlan === JOKER_PLAN_ID && decision.jokerPlan) {
        baseBudget += decision.planMatrixCostApplied;
        baseSatisfaction = revertJokerDeltasFromSatisfaction(baseSatisfaction, decision.jokerPlan.deltas);
      } else {
        baseBudget += getPlanBudgetCost(decision.needType, decision.chosenPlan);
        baseSatisfaction = revertPlanDeltaFromSatisfaction(baseSatisfaction, {
          needType: decision.needType,
          planId: decision.chosenPlan,
        });
      }
    }

    const row = TRADEOFF_MATRIX[decision.needType] ?? TRADEOFF_MATRIX.P;
    if (!row[chosenPlan]) return false;

    const cost = getPlanBudgetCost(decision.needType, chosenPlan);
    if (cost > 0 && baseBudget < cost) {
      setTimedToast({
        set,
        get,
        message: `施策コスト（${cost}）に対して残り予算（${baseBudget}）が不足しています。`,
        durationMs: 3200,
      });
      return false;
    }

    const nextSat = applyPlanDeltaToSatisfaction(baseSatisfaction, {
      needType: decision.needType,
      planId: chosenPlan,
    });

    const nextDecision = {
      ...decision,
      status: 'pending',
      chosenPlan,
      planMatrixCostApplied: cost,
      satisfactionDeltaApplied: true,
      jokerPlan: null,
    };

    set({
      remainingBudget: baseBudget - cost,
      islandSatisfaction: nextSat,
      questDecisions: {
        ...state.questDecisions,
        [questId]: nextDecision,
      },
      postStats: appendPostEvent(state.postStats, {
        t: Date.now(),
        kind: 'plan_commit',
        questId,
        chosenPlan,
        budgetSpent: cost,
        remainingSessionBudget: state.remainingBudget - cost,
        isSeriousMode: true,
        ...satisfactionLogPayload(nextSat),
      }),
    });

    checkConsensusGameOver(set, get, nextSat);
    return true;
  },

  /** 建築完了時 — クエストを resolved にする（満足度は commitQuestPlanChoice 済み） */
  finalizeQuestDecision: (questId) => {
    const state = get();
    if (!questId) return false;

    const decision = state.questDecisions[questId];
    if (!decision || decision.status === 'resolved' || decision.status === 'ignored') {
      return !!decision;
    }
    if (!decision.satisfactionDeltaApplied || !decision.chosenPlan) return false;

    set({
      questDecisions: {
        ...state.questDecisions,
        [questId]: {
          ...decision,
          status: 'resolved',
        },
      },
    });
    return true;
  },

  /** @deprecated finishBuildMode からは commitQuestPlanChoice + finalizeQuestDecision を使用 */
  resolveQuestDecision: (questId, chosenPlan) => {
    const committed = get().commitQuestPlanChoice?.(questId, chosenPlan);
    if (!committed) return false;
    return get().finalizeQuestDecision?.(questId) ?? false;
  },

  /** 独自案（ジョーカー）の確定 — 全 needType 共通、1クエストにつき1回 */
  commitJokerPlan: (questId, jokerInput) => {
    const state = get();

    const decision = state.questDecisions[questId] || getInitialDecision(state, questId);
    if (decision.status !== 'pending') return false;
    if (decision.chosenPlan === JOKER_PLAN_ID && decision.satisfactionDeltaApplied) {
      setTimedToast({ set, get, message: 'このクエストでは既に独自案を確定しています。', durationMs: 3200 });
      return false;
    }

    const validation = validateJokerPlan(jokerInput);
    if (!validation.ok) {
      setTimedToast({ set, get, message: validation.message, durationMs: 3200 });
      return false;
    }

    const { payload } = validation;

    // 型プランを選んだあとに独自案へ切り替えた場合は、先に元のプランを巻き戻す
    let baseBudget = state.remainingBudget;
    let baseSatisfaction = state.islandSatisfaction;
    if (decision.satisfactionDeltaApplied && decision.chosenPlan) {
      baseBudget += decision.planMatrixCostApplied;
      baseSatisfaction = revertPlanDeltaFromSatisfaction(baseSatisfaction, {
        needType: decision.needType,
        planId: decision.chosenPlan,
      });
    }

    if (baseBudget < payload.budgetCost) {
      setTimedToast({ set, get, message: '残り予算が不足しています。', durationMs: 3200 });
      return false;
    }

    const nextSat = applyJokerDeltasToSatisfaction(baseSatisfaction, payload.deltas);
    const nextDecision = {
      ...decision,
      status: 'pending',
      chosenPlan: JOKER_PLAN_ID,
      planMatrixCostApplied: payload.budgetCost,
      satisfactionDeltaApplied: true,
      jokerPlan: payload,
    };

    set({
      remainingBudget: baseBudget - payload.budgetCost,
      islandSatisfaction: nextSat,
      questDecisions: {
        ...state.questDecisions,
        [questId]: nextDecision,
      },
      postStats: appendPostEvent(state.postStats, {
        t: Date.now(),
        kind: 'joker_commit',
        questId,
        chosenPlan: JOKER_PLAN_ID,
        budgetSpent: payload.budgetCost,
        remainingSessionBudget: baseBudget - payload.budgetCost,
        isSeriousMode: true,
        jokerTitle: payload.title,
        ...satisfactionLogPayload(nextSat),
      }),
    });

    checkConsensusGameOver(set, get, nextSat);
    return true;
  },

  undoQuestDecision: (questId) => {
    const state = get();
    const decision = state.questDecisions[questId];
    if (!decision || decision.status === 'pending') return;

    const refundCost = decision.planMatrixCostApplied;
    const wasJoker = decision.chosenPlan === JOKER_PLAN_ID && decision.jokerPlan;
    const nextSat = wasJoker
      ? revertJokerDeltasFromSatisfaction(state.islandSatisfaction, decision.jokerPlan.deltas)
      : revertPlanDeltaFromSatisfaction(state.islandSatisfaction, {
        needType: decision.needType,
        planId: decision.chosenPlan,
      });

    const nextDecision = {
      ...decision,
      status: 'pending',
      chosenPlan: null,
      planMatrixCostApplied: 0,
      blocksPlaced: 0,
      satisfactionDeltaApplied: false,
      jokerPlan: null,
    };

    set({
      remainingBudget: state.remainingBudget + refundCost,
      islandSatisfaction: nextSat,
      questDecisions: {
        ...state.questDecisions,
        [questId]: nextDecision,
      },
    });
  },
});

function getInitialDecision(state, questId) {
  const bug = state.bugs.find(b => b.sourceQuestId === questId || b.id === questId);
  const meta = bug ? (TYPE_TO_BARRIER_META[bug.type] ?? DEFAULT_BARRIER_META) : DEFAULT_BARRIER_META;
  return {
    questId,
    bugId: bug?.id ?? null,
    status: 'pending',
    chosenPlan: null,
    planMatrixCostApplied: 0,
    blockCostSpent: 0,
    blocksPlaced: 0,
    scale: meta.scale || 'point',
    needType: bug?.needType ?? meta.needType ?? 'P',
    satisfactionDeltaApplied: false,
    jokerPlan: null,
  };
}
