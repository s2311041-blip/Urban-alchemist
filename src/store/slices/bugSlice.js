import { TYPE_TO_BARRIER_META } from '../../constants/barrierData';
import { evaluateActiveBuildResolution } from '../../utils/barrierActions';
import { findBugById, sameBugId } from '../../utils/bugIds';
import { getBarrierSideEffectToast } from '../../constants/barrierSideEffects';
import { normalizeBug, normalizePhotoPins } from '../helpers/bugFactory';
import {
  computeWorldExpansionAfterSolve,
  getRemoteIslandSpawnToast,
} from '../helpers/expandWorldAfterSolve';
import {
  createQuestFromPost,
  markQuestResolved,
  appendPostEvent,
  buildPostEventFromQuest,
  buildResolveEvent,
  buildSpawnEvent,
  spawnQuestOnIslandState,
} from '../helpers/questLifecycle';
import {
  annotationToQuestPost,
  fetchBadAnnotationsForImport,
  isQuestAlreadyImported,
  parseImportJson,
} from '../../game/api/questImport';
import {
  QUEST_STATUS,
  canFocusQuestOnIsland,
  canStartQuestPlacement,
  isQuestResolved,
} from '../helpers/questState';
import { buildResolveToast } from '../../utils/questFeedback';
import { setTimedToast } from '../helpers/uiFeedback';
import { DEMO_QUEST_POSTS } from '../../constants/demoQuestSet';
import {
  applyBuildSpend,
  applyPlanCompletionBonus,
  buildImprovementBuildEvent,
  createImprovementSession,
  exportResearchLogCsv,
  extendResolveEvent,
  validateFinishSession,
} from '../../utils/improvementSession';
import { createTradeoffBugFromResolution } from '../../utils/tradeoffSpawn';
import { getImprovementBudgetLimit } from '../../constants/improvementConstraints';

export const createBugSlice = (set, get) => ({
  trackSessionBlockPlacement: (block) => {
    const { buildMode, buildSession, bugs, consensusSession, isSeriousMode } = get();
    if (!buildMode || buildMode === 'free' || !block) return;
    const bug = findBugById(bugs, buildMode);
    if (!bug) return;

    if (isSeriousMode && consensusSession) {
      const { getBlockImprovementCost } = require('../../constants/improvementConstraints');
      const cost = getBlockImprovementCost(block);
      const decision = consensusSession.questDecisions[bug.sourceQuestId];
      if (decision) {
        set({
          consensusSession: {
            ...consensusSession,
            remainingSessionBudget: consensusSession.remainingSessionBudget - cost,
            questDecisions: {
              ...consensusSession.questDecisions,
              [bug.sourceQuestId]: {
                ...decision,
                blockCostSpent: decision.blockCostSpent + cost,
              }
            }
          }
        });
      }
    } else if (buildSession) {
      const nextSession = applyBuildSpend(buildSession, block, bug);
      set({ buildSession: nextSession });
    }
  },

  trackSessionBlockRemoval: (block) => {
    const { buildMode, bugs, consensusSession, isSeriousMode } = get();
    if (!buildMode || buildMode === 'free' || !block) return;
    const bug = findBugById(bugs, buildMode);
    if (!bug) return;

    if (isSeriousMode && consensusSession) {
      const { getBlockImprovementCost } = require('../../constants/improvementConstraints');
      const cost = getBlockImprovementCost(block);
      const decision = consensusSession.questDecisions[bug.sourceQuestId];
      if (decision) {
        set({
          consensusSession: {
            ...consensusSession,
            remainingSessionBudget: consensusSession.remainingSessionBudget + cost,
            questDecisions: {
              ...consensusSession.questDecisions,
              [bug.sourceQuestId]: {
                ...decision,
                blockCostSpent: Math.max(0, decision.blockCostSpent - cost),
              }
            }
          }
        });
      }
    }
  },

  exportResearchLog: () => {
    const csv = exportResearchLogCsv(get().postStats);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rq2-research-log-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimedToast({ set, get, message: '研究ログを CSV で保存しました。', durationMs: 2600 });
  },

  loadDemoQuestSet: () => {
    let imported = 0;
    let skipped = 0;
    for (const post of DEMO_QUEST_POSTS) {
      if (isQuestAlreadyImported(get().quests, post.sourceAnnotationId)) {
        skipped += 1;
        continue;
      }
      get().ingestQuestPost(post, { silent: true });
      imported += 1;
    }
    const summary = imported > 0
      ? `デモ ${imported} 件を島に載せました${skipped > 0 ? `（${skipped} 件スキップ）` : ''}`
      : 'デモデータは取り込み済みです';
    setTimedToast({ set, get, message: summary, durationMs: 4000 });
    return { imported, skipped };
  },

  finishBuildMode: () => {
    const { buildMode, bugs, islandChunks, placedBlocks, ferryRoutes, buildSession } = get();
    set({
      selectedEditBlockId: null,
      diagonalFirstPoint: null,
      buildFinishError: null,
    });

    if (buildMode === 'free') {
      set({ buildMode: null, buildSession: null, hoverPosition: null, placingPresetArchetype: null, isReturning: true });
      return;
    }

    try {
      const targetBug = findBugById(bugs, buildMode);
      if (!targetBug) {
        set({
          buildFinishError: '対象の不満が見つかりません。建築を一度終了してやり直してください。',
        });
        return;
      }

      const resolution = evaluateActiveBuildResolution(buildMode, bugs, placedBlocks, {
        islandChunks,
        ferryRoutes,
      });
      if (!resolution?.ok) {
        const message = resolution?.message ?? 'まだ条件を満たしていません。';
        set({ buildFinishError: message, farmingToast: message });
        setTimeout(() => {
          if (get().farmingToast === message) set({ farmingToast: null });
        }, 2200);
        return;
      }

      let sessionForFinish = buildSession;
      if (sessionForFinish) {
        sessionForFinish = {
          ...sessionForFinish,
          stakeholderSatisfaction: applyPlanCompletionBonus(sessionForFinish, targetBug),
        };
        const sessionCheck = validateFinishSession(sessionForFinish);
        if (!get().isSeriousMode && !sessionCheck.ok) {
          set({ buildFinishError: sessionCheck.message, farmingToast: sessionCheck.message });
          setTimeout(() => {
            if (get().farmingToast === sessionCheck.message) set({ farmingToast: null });
          }, 2800);
          return;
        } else if (get().isSeriousMode && get().consensusSession) {
          if (get().consensusSession.remainingSessionBudget < 0) {
            const msg = '全体予算が不足しています。ブロックを減らすか、他のQuestを調整してください。';
            set({ buildFinishError: msg, farmingToast: msg });
            setTimeout(() => {
              if (get().farmingToast === msg) set({ farmingToast: null });
            }, 2800);
            return;
          }
        }
      }

      const tradeoffBug = createTradeoffBugFromResolution({
        ...targetBug,
        chosenPlan: resolution?.planId ?? targetBug.chosenPlan,
      });

      const updatedBugs = bugs.map((b) => (
        sameBugId(b.id, buildMode) ? { ...b, solved: true } : b
      ));
      const bugsWithTradeoff = tradeoffBug ? [...updatedBugs, tradeoffBug] : updatedBugs;
      const sideEffectToast = tradeoffBug
        ? '通行は改善しましたが、急な勾配で新たな不満が浮上しました…'
        : getBarrierSideEffectToast(targetBug, resolution);
      const solvedCount = updatedBugs.filter((b) => b.solved).length;
      const resolvedQuestPatch = targetBug.sourceQuestId
        ? {
          quests: markQuestResolved(get().quests, targetBug.sourceQuestId, targetBug.id),
        }
        : {};
      const shouldTrackResolve = !!targetBug.sourceQuestId;
      const sessionValidation = sessionForFinish
        ? {
          sessionId: sessionForFinish.sessionId,
          budgetSpent: sessionForFinish.budgetSpent,
          budgetRemaining: sessionForFinish.budgetLimit - sessionForFinish.budgetSpent,
          minStakeholderSatisfaction: validateFinishSession(sessionForFinish).minStakeholderSatisfaction,
        }
        : null;
      const resolveStatsPatch = shouldTrackResolve || sessionForFinish
        ? (() => {
          let nextStats = get().postStats;
          if (shouldTrackResolve) {
            nextStats = appendPostEvent(nextStats, extendResolveEvent(buildResolveEvent({
              t: Date.now(),
              questId: targetBug.sourceQuestId,
              bugId: targetBug.id,
              chosenPlan: resolution?.planId ?? targetBug.chosenPlan ?? null,
            }), sessionValidation));
            nextStats = {
              ...nextStats,
              totalResolved: nextStats.totalResolved + (shouldTrackResolve ? 1 : 0),
            };
          }
          if (sessionForFinish) {
            nextStats = appendPostEvent(nextStats, buildImprovementBuildEvent(sessionForFinish));
          }
          return { postStats: nextStats };
        })()
        : {};
      const resolveToast = targetBug.sourceQuestId
        ? buildResolveToast(
          get().quests.find((quest) => quest.id === targetBug.sourceQuestId),
          resolution?.planId ?? targetBug.chosenPlan,
        )
        : null;

      if (solvedCount > 0) {
        if (get().isSeriousMode) {
          get().resolveQuestDecision?.(targetBug.sourceQuestId, resolution?.planId ?? targetBug.chosenPlan);
        }

        const expansion = get().isSeriousMode ? null : computeWorldExpansionAfterSolve({
          updatedBugs: bugsWithTradeoff,
          islandChunks,
          placedBlocks,
          solvedCount,
          activeRemoteHubId: get().activeRemoteHubId,
          remoteExpansionLevel: get().remoteExpansionLevel,
          remoteIslandGeneration: get().remoteIslandGeneration,
        });

        if (expansion) {
          set({
            ...expansion.patch,
            buildSession: null,
            ...resolvedQuestPatch,
            ...resolveStatsPatch,
            ...(resolveToast ? { farmingToast: resolveToast } : sideEffectToast ? { farmingToast: sideEffectToast } : {}),
          });

          if (resolveToast) setTimedToast({ set, get, message: resolveToast, durationMs: 5000 });
          else if (sideEffectToast) setTimedToast({ set, get, message: sideEffectToast, durationMs: 2600 });

          const { meta } = expansion;
          setTimeout(() => {
            const nextState = {
              expandingLevel: 0,
              viewMode: 'tps',
              isReturning: true,
              expansionFocusTarget: null,
            };
            if (meta.shouldSpawnRemoteIsland || meta.shouldSpawnNewRemoteHub) {
              const toast = getRemoteIslandSpawnToast(meta.remoteChunks, meta.shouldSpawnNewRemoteHub);
              set({ ...nextState, islandToast: toast });
              setTimeout(() => {
                if (get().islandToast === toast) set({ islandToast: null });
              }, 6000);
              return;
            }
            set(nextState);
          }, 2500);
        }
      } else {
        set({
          buildMode: null,
          buildSession: null,
          hoverPosition: null,
          isReturning: true,
          bugs: bugsWithTradeoff,
          ...resolvedQuestPatch,
          ...resolveStatsPatch,
          ...(resolveToast ? { farmingToast: resolveToast } : sideEffectToast ? { farmingToast: sideEffectToast } : {}),
        });
        if (resolveToast) setTimedToast({ set, get, message: resolveToast, durationMs: 5000 });
      }
    } catch (error) {
      console.error('finishBuildMode failed', error);
      const errorMessage = error instanceof Error ? error.message : String(error ?? '');
      set({
        buildFinishError: `完成処理でエラーが発生しました。${errorMessage || 'もう一度試してください。'}`,
      });
    }
  },

  updateMyQuestPost: (questId, updates = {}) => {
    const quest = get().quests.find((q) => q.id === questId && q.isMine);
    if (!quest) {
      setTimedToast({ set, get, message: '自分の投稿だけ編集できます。', durationMs: 2200 });
      return false;
    }
    if (isQuestResolved(quest.questStatus)) {
      setTimedToast({ set, get, message: '解決済みの投稿は編集できません。', durationMs: 2400 });
      return false;
    }
    const patch = {
      ...updates,
      photoPins: normalizePhotoPins(updates.photoPins ?? quest.photoPins),
    };
    const nextQuests = get().quests.map((q) => (
      q.id === questId ? { ...q, ...patch } : q
    ));
    const linkedBugId = quest.linkedBugId;
    const nextBugs = linkedBugId
      ? get().bugs.map((b) => (
        sameBugId(b.id, linkedBugId) ? normalizeBug({ ...b, ...patch }) : b
      ))
      : get().bugs;
    set({ quests: nextQuests, bugs: nextBugs.filter(Boolean) });
    setTimedToast({ set, get, message: '投稿を更新しました。', durationMs: 2200 });
    return true;
  },

  spawnQuestOnIsland: (questId, options = {}) => {
    const state = get();
    const quest = state.quests.find((q) => q.id === questId);
    if (!quest) return false;

    const result = spawnQuestOnIslandState({
      quest,
      islandChunks: state.islandChunks,
      placedBlocks: state.placedBlocks,
      bugs: state.bugs,
    });
    if (!result) return false;

    const { bug, updatedQuest, nextBlocks, toast } = result;
    const trackSpawn = !!quest.sourceAnnotationId || quest.isMine;

    set({
      bugs: [...state.bugs, bug],
      quests: state.quests.map((q) => (q.id === questId ? updatedQuest : q)),
      placedBlocks: nextBlocks,
      placingQuest: null,
      hoverPosition: null,
      ...(trackSpawn
        ? {
          postStats: appendPostEvent(state.postStats, buildSpawnEvent({
            questId: quest.id,
            bugId: bug.id,
          })),
        }
        : {}),
    });
    if (!options.silent) {
      setTimedToast({ set, get, message: toast, durationMs: 3200 });
    }
    return true;
  },

  ingestQuestPost: (post = {}, options = {}) => {
    const quest = createQuestFromPost(post);
    const state = get();
    const nextStats = appendPostEvent(state.postStats, buildPostEventFromQuest({
      ...quest,
      t: Date.now(),
    }));

    set({
      quests: [quest, ...state.quests],
      isQuestBoardOpen: false,
      hoverPosition: null,
      postStats: {
        ...nextStats,
        totalPosts: nextStats.totalPosts + 1,
      },
    });

    get().spawnQuestOnIsland(quest.id, { silent: options.silent });
    return quest;
  },

  importArAnnotations: async ({ fromCloud = false, jsonText = null } = {}) => {
    let posts = [];
    try {
      if (fromCloud) {
        const annotations = await fetchBadAnnotationsForImport();
        posts = annotations.map(annotationToQuestPost).filter(Boolean);
      } else if (jsonText) {
        posts = parseImportJson(jsonText);
      } else {
        throw new Error('取り込み元が指定されていません');
      }
    } catch (err) {
      const message = err?.message ?? '取り込みに失敗しました';
      setTimedToast({ set, get, message, durationMs: 4000 });
      return { imported: 0, skipped: 0, error: message };
    }

    let imported = 0;
    let skipped = 0;

    for (const post of posts) {
      const quests = get().quests;
      if (isQuestAlreadyImported(quests, post.sourceAnnotationId)) {
        skipped += 1;
        continue;
      }
      get().ingestQuestPost(post, { silent: true });
      imported += 1;
    }

    const summary = imported > 0
      ? `${imported} 件を島に載せました${skipped > 0 ? `（${skipped} 件スキップ）` : ''}`
      : skipped > 0
        ? `新規投稿はありません（${skipped} 件は取り込み済み）`
        : '取り込める Bad 投稿がありません';

    setTimedToast({ set, get, message: summary, durationMs: 4500 });
    return { imported, skipped };
  },

  startPlacingQuest: (quest) => {
    if (!canStartQuestPlacement(quest)) {
      return;
    }
    set({ placingQuest: quest, isQuestBoardOpen: false });
  },

  cancelPlacing: () => {
    set({ placingQuest: null, isQuestBoardOpen: true });
    document.body.style.cursor = 'auto';
  },

  focusQuestOnIsland: (quest) => {
    if (!canFocusQuestOnIsland(quest)) {
      setTimedToast({ set, get, message: 'この不満はまだ島に出現していません。', durationMs: 2200 });
      return;
    }
    const bug = findBugById(get().bugs, quest.linkedBugId);
    if (!bug || bug.solved || !Array.isArray(bug.pos) || bug.pos.length < 3) {
      setTimedToast({ set, get, message: 'この不満の位置を表示できません。', durationMs: 2200 });
      return;
    }
    set({
      isQuestBoardOpen: false,
      questFocusTarget: [bug.pos[0], bug.pos[1], bug.pos[2]],
      viewMode: 'tps',
    });
  },

  startDIY: (bugId, selectedPlan = null) => {
    const buildModeDefaults = {
      activeBug: null,
      interactionMode: null,
      isEditingInStudio: false,
      isDesigningInStudio: false,
      isDesigningDiagonal: false,
      isAdjustingSize: false,
      selectedEditBlockId: null,
      hoverPosition: null,
      selectedMaterial: 'stone',
    };

    if (bugId === 'free') {
      set({
        ...buildModeDefaults,
        buildMode: 'free',
        selectedShape: 'block',
        placingQuest: null,
        placingPresetArchetype: null,
        isQuestBoardOpen: false,
      });
      document.body.style.cursor = 'auto';
      return;
    }

    const targetBug = findBugById(get().bugs, bugId);
    if (!targetBug) {
      set({ farmingToast: '対象の不満データが見つかりません。' });
      setTimeout(() => {
        if (get().farmingToast === '対象の不満データが見つかりません。') set({ farmingToast: null });
      }, 2200);
      return;
    }
    if (!Array.isArray(targetBug.pos) || targetBug.pos.length < 3 || !targetBug.pos.every(Number.isFinite)) {
      set({ farmingToast: 'この不満の位置データが壊れているため建築を開始できません。' });
      setTimeout(() => {
        if (get().farmingToast === 'この不満の位置データが壊れているため建築を開始できません。') {
          set({ farmingToast: null });
        }
      }, 2600);
      return;
    }
    const allowedPlans = Array.isArray(targetBug.allowedPlans) ? targetBug.allowedPlans : [];
    const resolvedPlan = (selectedPlan && allowedPlans.includes(selectedPlan))
      ? selectedPlan
      : (targetBug.chosenPlan && allowedPlans.includes(targetBug.chosenPlan)
        ? targetBug.chosenPlan
        : (TYPE_TO_BARRIER_META[targetBug.type]?.defaultPlan ?? allowedPlans[0] ?? null));
    const initialShape = resolvedPlan === 'transit_link' ? 'ferry_dock' : 'block';

    set((state) => ({
      ...buildModeDefaults,
      buildMode: bugId,
      buildFinishError: null,
      buildSession: createImprovementSession(
        { ...targetBug, chosenPlan: resolvedPlan ?? targetBug.chosenPlan },
        state.placedBlocks,
      ),
      selectedShape: initialShape,
      bugs: state.bugs.map((bug) => {
        if (!sameBugId(bug.id, bugId)) return bug;
        const normalized = resolvedPlan
          ? normalizeBug({ ...bug, chosenPlan: resolvedPlan })
          : normalizeBug(bug);
        return {
          ...normalized,
          improvementBudgetLimit: getImprovementBudgetLimit(normalized),
        };
      }),
    }));
  },

  removeBug: (bugId) => {
    const { bugs, quests } = get();
    const bug = findBugById(bugs, bugId);
    if (!bug) {
      setTimedToast({ set, get, message: '対象の不満データが見つかりません。' });
      return;
    }
    set({
      bugs: bugs.filter((b) => !sameBugId(b.id, bugId)),
      quests: [...quests, {
        ...bug,
        id: `quest_${Date.now()}`,
        type: bug.type,
        demographic: bug.demographic,
        comment: bug.comment,
        questStatus: QUEST_STATUS.PENDING_SPAWN,
        linkedBugId: null,
        isMine: false,
      }],
      activeBug: null,
      isReturning: true,
    });
  },
});
