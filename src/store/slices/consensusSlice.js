import { computeSessionBudget, getScaleMultiplier } from '../../utils/consensusBudget';
import { QUEST_STATUS } from '../helpers/questState';
import { TRADEOFF_MATRIX } from '../../constants/tradeoffMatrix';
import { TYPE_TO_BARRIER_META, DEFAULT_BARRIER_META } from '../../constants/barrierData';

import { appendPostEvent } from '../helpers/questLifecycle';

const INITIAL_SATISFACTION = { general: 50, wheelchair: 50, senior: 50, childcare: 50 };

export const createConsensusSlice = (set, get) => ({
  startConsensusSession: () => {
    const { quests } = get();
    // 1. spawn all un-spawned quests silently
    const pendingQuests = quests.filter(q => q.questStatus === QUEST_STATUS.PENDING_SPAWN);
    for (const q of pendingQuests) {
      get().spawnQuestOnIsland(q.id, { silent: true });
    }
    
    // 2. update active bugs from get() again after spawn loop
    const activeBugs = get().bugs.filter(b => b.sourceQuestId && !b.solved);
    
    // 3. calculate budget
    const { totalSessionBudget, budgetInitialFormula } = computeSessionBudget(activeBugs);
    
    // 4. initialize questDecisions map
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
        needType: meta.needType || 'P',
        satisfactionDeltaApplied: false,
      };
    }

    // 5. set initial state
    set({
      isSeriousMode: true,
      uiMode: 'macro', // transition to macro view
      buildMode: null,
      buildSession: null, // clear existing
      consensusSession: {
        sessionId: `session_${Date.now()}`,
        isActive: true,
        phase: 'planning', // planning | building | submitted | closed
        totalSessionBudget,
        remainingSessionBudget: totalSessionBudget,
        budgetInitialFormula,
        islandSatisfaction: { ...INITIAL_SATISFACTION },
        questDecisions,
        startedAt: Date.now(),
        submittedAt: null,
      }
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

    const row = TRADEOFF_MATRIX[decision.needType] ?? TRADEOFF_MATRIX.P;
    const planData = row['ignore'];
    if (!planData) return;

    const scaleMult = getScaleMultiplier(decision.scale);

    const nextSat = { ...session.islandSatisfaction };
    nextSat.general = Math.min(100, Math.max(0, nextSat.general + (planData.general * scaleMult)));
    nextSat.wheelchair = Math.min(100, Math.max(0, nextSat.wheelchair + (planData.wheelchair * scaleMult)));
    nextSat.senior = Math.min(100, Math.max(0, nextSat.senior + (planData.senior * scaleMult)));
    nextSat.childcare = Math.min(100, Math.max(0, nextSat.childcare + (planData.childcare * scaleMult)));

    const nextDecision = {
      ...decision,
      status: 'ignored',
      chosenPlan: 'ignore',
      planMatrixCostApplied: 0,
      satisfactionDeltaApplied: true,
    };

    const { postStats } = get();

    set({
      consensusSession: {
        ...session,
        islandSatisfaction: nextSat,
        questDecisions: {
          ...session.questDecisions,
          [questId]: nextDecision,
        }
      },
      postStats: appendPostEvent(postStats, {
        t: Date.now(),
        kind: 'quest_ignore',
        questId,
        isSeriousMode: true,
        sat_general: nextSat.general,
        sat_wheelchair: nextSat.wheelchair,
        sat_senior: nextSat.senior,
        sat_childcare: nextSat.childcare,
      })
    });
  },

  resolveQuestDecision: (questId, chosenPlan) => {
    const state = get();
    if (!state.isSeriousMode || !state.consensusSession) return;

    const session = state.consensusSession;
    const decision = session.questDecisions[questId];
    if (!decision) return;

    const row = TRADEOFF_MATRIX[decision.needType] ?? TRADEOFF_MATRIX.P;
    const planData = row[chosenPlan];
    if (!planData) return;

    const scaleMult = getScaleMultiplier(decision.scale);
    const cost = Math.abs(planData.budget) * scaleMult;

    // Check budget
    if (session.remainingSessionBudget < cost) {
      // cannot afford
      return false;
    }

    const nextSat = { ...session.islandSatisfaction };
    nextSat.general = Math.min(100, Math.max(0, nextSat.general + (planData.general * scaleMult)));
    nextSat.wheelchair = Math.min(100, Math.max(0, nextSat.wheelchair + (planData.wheelchair * scaleMult)));
    nextSat.senior = Math.min(100, Math.max(0, nextSat.senior + (planData.senior * scaleMult)));
    nextSat.childcare = Math.min(100, Math.max(0, nextSat.childcare + (planData.childcare * scaleMult)));

    const nextDecision = {
      ...decision,
      status: 'resolved',
      chosenPlan,
      planMatrixCostApplied: cost,
      satisfactionDeltaApplied: true,
    };

    const { postStats } = get();

    set({
      consensusSession: {
        ...session,
        remainingSessionBudget: session.remainingSessionBudget - cost,
        islandSatisfaction: nextSat,
        questDecisions: {
          ...session.questDecisions,
          [questId]: nextDecision,
        }
      },
      postStats: appendPostEvent(postStats, {
        t: Date.now(),
        kind: 'plan_commit',
        questId,
        chosenPlan,
        budgetSpent: cost,
        remainingSessionBudget: session.remainingSessionBudget - cost,
        isSeriousMode: true,
        sat_general: nextSat.general,
        sat_wheelchair: nextSat.wheelchair,
        sat_senior: nextSat.senior,
        sat_childcare: nextSat.childcare,
      })
    });

    return true;
  },

  undoQuestDecision: (questId) => {
    const state = get();
    if (!state.isSeriousMode || !state.consensusSession) return;

    const session = state.consensusSession;
    const decision = session.questDecisions[questId];
    if (!decision || decision.status === 'pending') return;

    const row = TRADEOFF_MATRIX[decision.needType] ?? TRADEOFF_MATRIX.P;
    const planData = row[decision.chosenPlan];
    
    let refundCost = 0;
    let nextSat = { ...session.islandSatisfaction };

    if (planData) {
      const scaleMult = getScaleMultiplier(decision.scale);
      refundCost = decision.planMatrixCostApplied;
      
      nextSat.general = Math.min(100, Math.max(0, nextSat.general - (planData.general * scaleMult)));
      nextSat.wheelchair = Math.min(100, Math.max(0, nextSat.wheelchair - (planData.wheelchair * scaleMult)));
      nextSat.senior = Math.min(100, Math.max(0, nextSat.senior - (planData.senior * scaleMult)));
      nextSat.childcare = Math.min(100, Math.max(0, nextSat.childcare - (planData.childcare * scaleMult)));
    }

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
        remainingSessionBudget: session.remainingSessionBudget + refundCost, // blockCostSpent is kept or refunded per block
        islandSatisfaction: nextSat,
        questDecisions: {
          ...session.questDecisions,
          [questId]: nextDecision,
        }
      }
    });
  }
});
