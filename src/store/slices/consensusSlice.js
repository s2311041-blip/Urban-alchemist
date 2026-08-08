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
import {
  JOKER_PLAN_ID,
  applyJokerDeltasToSatisfaction,
  revertJokerDeltasFromSatisfaction,
  validateJokerPlan,
} from '../../utils/jokerPlan';

import { appendPostEvent } from '../helpers/questLifecycle';
import { setTimedToast } from '../helpers/uiFeedback';

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
  startConsensusSession: () => {
    const { quests } = get();
    const pendingQuests = quests.filter(q => q.questStatus === QUEST_STATUS.PENDING_SPAWN);
    for (const q of pendingQuests) {
      get().spawnQuestOnIsland(q.id, { silent: true });
    }

    const activeBugs = get().bugs.filter(b => b.sourceQuestId && !b.solved);
    const { totalSessionBudget, budgetInitialFormula } = computeSessionBudget(activeBugs);

    const questDecisions = {};
    for (const bug of activeBugs) {
      const meta = TYPE_TO_BARRIER_META[bug.type] ?? DEFAULT_BARRIER_META;
      questDecisions[bug.sourceQuestId] = {
        questId: bug.sourceQuestId,
        bugId: bug.id,
        status: 'pending',
        chosenPlan: null,
        planMatrixCostApplied: 0,
        blockCostSpent: 0,
        scale: meta.scale || 'point',
        needType: bug.needType ?? meta.needType ?? 'P',
        satisfactionDeltaApplied: false,
      };
    }

    set({
      isSeriousMode: true,
      uiMode: 'macro',
      buildMode: null,
      buildSession: null,
      consensusSession: {
        sessionId: `session_${Date.now()}`,
        isActive: true,
        phase: 'planning',
        totalSessionBudget,
        remainingSessionBudget: totalSessionBudget,
        budgetInitialFormula,
        islandSatisfaction: createInitialSatisfaction(),
        questDecisions,
        jokerUsed: false,
        startedAt: Date.now(),
        submittedAt: null,
      },
    });
  },

  setUiMode: (mode) => {
    set({ uiMode: mode });
  },

  ignoreQuest: (questId) => {
    const state = get();
    if (!state.isSeriousMode || !state.consensusSession) return;

    const session = state.consensusSession;
    const decision = session.questDecisions[questId];
    if (!decision || decision.status !== 'pending') return;

    const nextSat = applyPlanDeltaToSatisfaction(session.islandSatisfaction, {
      needType: decision.needType,
      planId: 'ignore',
    });

    const nextDecision = {
      ...decision,
      status: 'ignored',
      chosenPlan: 'ignore',
      planMatrixCostApplied: 0,
      satisfactionDeltaApplied: true,
    };

    set({
      consensusSession: {
        ...session,
        islandSatisfaction: nextSat,
        questDecisions: {
          ...session.questDecisions,
          [questId]: nextDecision,
        },
      },
      postStats: appendPostEvent(get().postStats, {
        t: Date.now(),
        kind: 'quest_ignore',
        questId,
        isSeriousMode: true,
        ...satisfactionLogPayload(nextSat),
      }),
    });
    checkConsensusGameOver(set, get, nextSat);
  },

  resolveQuestDecision: (questId, chosenPlan) => {
    const state = get();
    if (!state.isSeriousMode || !state.consensusSession) return;

    const session = state.consensusSession;
    const decision = session.questDecisions[questId];
    if (!decision) return;

    const row = TRADEOFF_MATRIX[decision.needType] ?? TRADEOFF_MATRIX.P;
    if (!row[chosenPlan]) return false;

    const cost = getPlanBudgetCost(decision.needType, chosenPlan);
    if (cost > 0 && session.remainingSessionBudget < cost) {
      return false;
    }

    const nextSat = applyPlanDeltaToSatisfaction(session.islandSatisfaction, {
      needType: decision.needType,
      planId: chosenPlan,
    });

    const nextDecision = {
      ...decision,
      status: 'resolved',
      chosenPlan,
      planMatrixCostApplied: cost,
      satisfactionDeltaApplied: true,
    };

    set({
      consensusSession: {
        ...session,
        remainingSessionBudget: session.remainingSessionBudget - cost,
        islandSatisfaction: nextSat,
        questDecisions: {
          ...session.questDecisions,
          [questId]: nextDecision,
        },
      },
      postStats: appendPostEvent(get().postStats, {
        t: Date.now(),
        kind: 'plan_commit',
        questId,
        chosenPlan,
        budgetSpent: cost,
        remainingSessionBudget: session.remainingSessionBudget - cost,
        isSeriousMode: true,
        ...satisfactionLogPayload(nextSat),
      }),
    });

    checkConsensusGameOver(set, get, nextSat);
    return true;
  },

  commitJokerPlan: (questId, jokerInput) => {
    const state = get();
    if (!state.isSeriousMode || !state.consensusSession) return false;

    const session = state.consensusSession;
    if (session.jokerUsed) {
      setTimedToast({ set, get, message: 'このセッションではジョーカー施策は1回までです。', durationMs: 3200 });
      return false;
    }

    const decision = session.questDecisions[questId];
    if (!decision || decision.status !== 'pending' || decision.needType !== 'O') {
      return false;
    }

    const validation = validateJokerPlan(jokerInput);
    if (!validation.ok) {
      setTimedToast({ set, get, message: validation.message, durationMs: 3200 });
      return false;
    }

    const { payload } = validation;
    if (session.remainingSessionBudget < payload.budgetCost) {
      setTimedToast({ set, get, message: '残り予算が不足しています。', durationMs: 3200 });
      return false;
    }

    const nextSat = applyJokerDeltasToSatisfaction(session.islandSatisfaction, payload.deltas);
    const nextDecision = {
      ...decision,
      status: 'resolved',
      chosenPlan: JOKER_PLAN_ID,
      planMatrixCostApplied: payload.budgetCost,
      satisfactionDeltaApplied: true,
      jokerPlan: payload,
    };

    set({
      consensusSession: {
        ...session,
        remainingSessionBudget: session.remainingSessionBudget - payload.budgetCost,
        islandSatisfaction: nextSat,
        jokerUsed: true,
        questDecisions: {
          ...session.questDecisions,
          [questId]: nextDecision,
        },
      },
      postStats: appendPostEvent(get().postStats, {
        t: Date.now(),
        kind: 'joker_commit',
        questId,
        chosenPlan: JOKER_PLAN_ID,
        budgetSpent: payload.budgetCost,
        remainingSessionBudget: session.remainingSessionBudget - payload.budgetCost,
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
    if (!state.isSeriousMode || !state.consensusSession) return;

    const session = state.consensusSession;
    const decision = session.questDecisions[questId];
    if (!decision || decision.status === 'pending') return;

    const refundCost = decision.planMatrixCostApplied;
    const wasJoker = decision.chosenPlan === JOKER_PLAN_ID && decision.jokerPlan;
    const nextSat = wasJoker
      ? revertJokerDeltasFromSatisfaction(session.islandSatisfaction, decision.jokerPlan.deltas)
      : revertPlanDeltaFromSatisfaction(session.islandSatisfaction, {
        needType: decision.needType,
        planId: decision.chosenPlan,
      });

    const nextDecision = {
      ...decision,
      status: 'pending',
      chosenPlan: null,
      planMatrixCostApplied: 0,
      satisfactionDeltaApplied: false,
    };

    set({
      consensusSession: {
        ...session,
        remainingSessionBudget: session.remainingSessionBudget + refundCost,
        islandSatisfaction: nextSat,
        jokerUsed: wasJoker ? false : session.jokerUsed,
        questDecisions: {
          ...session.questDecisions,
          [questId]: nextDecision,
        },
      },
    });
  },
});
