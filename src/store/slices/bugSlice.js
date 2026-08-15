import { TYPE_TO_BARRIER_META, normalizePlanId } from '../../constants/barrierData';
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
import { buildPlanResolutionFeedback, buildJokerResolutionFeedback } from '../../utils/planResolutionFeedback';
import { JOKER_PLAN_ID } from '../../utils/jokerPlan';
import { setTimedToast } from '../helpers/uiFeedback';
import { DEMO_QUEST_POSTS } from '../../constants/demoQuestSet';
import {
  applyBuildSpend,
  applyPlanCompletionBonus,
  buildImprovementBuildEvent,
  canPlaceBlockInImprovementSession,
  createImprovementSession,
  exportResearchLogCsv,
  extendResolveEvent,
  validateFinishSession,
} from '../../utils/improvementSession';
import { createTradeoffBugFromResolution } from '../../utils/tradeoffSpawn';
import { getImprovementBudgetLimit, getPlanRepairScale } from '../../constants/improvementConstraints';
import { getAllowedPlansForQuest } from '../../constants/tradeoffMatrix';
import { getPlanBudgetCost } from '../../utils/planSatisfaction';

export const createBugSlice = (set, get) => ({
  trackSessionBlockPlacement: (block) => {
    const { buildMode, buildSession, bugs, questDecisions } = get();
    if (!buildMode || buildMode === 'free' || !block) return;
    const bug = findBugById(bugs, buildMode);
    if (!bug) return;

    if (true) {
      const decision = questDecisions[bug.sourceQuestId];
      if (decision) {
        const nextBlocksPlaced = (decision.blocksPlaced ?? 0) + 1;
        set({
          questDecisions: {
            ...questDecisions,
            [bug.sourceQuestId]: {
              ...decision,
              blocksPlaced: nextBlocksPlaced,
            },
          },
          ...(buildSession ? {
            buildSession: applyBuildSpend(buildSession, block, bug, { skipBudget: true }),
          } : {}),
        });
      } else if (buildSession) {
        set({
          buildSession: applyBuildSpend(buildSession, block, bug, { skipBudget: true }),
        });
      }
    } else if (buildSession) {
      const nextSession = applyBuildSpend(buildSession, block, bug);
      set({ buildSession: nextSession });
    }
  },

  trackSessionBlockRemoval: (block) => {
    const { buildMode, buildSession, bugs, questDecisions } = get();
    if (!buildMode || buildMode === 'free' || !block) return;
    const bug = findBugById(bugs, buildMode);
    if (!bug) return;

    if (true) {
      const decision = questDecisions[bug.sourceQuestId];
      if (decision) {
        set({
          questDecisions: {
            ...questDecisions,
            [bug.sourceQuestId]: {
              ...decision,
              blocksPlaced: Math.max(0, (decision.blocksPlaced ?? 0) - 1),
            },
          },
          ...(buildSession ? {
            buildSession: {
              ...buildSession,
              blockCount: Math.max(0, buildSession.blockCount - 1),
            },
          } : {}),
        });
      } else if (buildSession) {
        set({
          buildSession: {
            ...buildSession,
            blockCount: Math.max(0, buildSession.blockCount - 1),
          },
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
    const alreadyHadDemo = imported === 0 && skipped > 0;
    const summary = imported > 0
      ? `デモ ${imported} 件を島に載せました${skipped > 0 ? `（${skipped} 件スキップ）` : ''}`
      : alreadyHadDemo
        ? 'デモは取り込み済みです'
        : 'デモデータは取り込み済みです';
    setTimedToast({ set, get, message: summary, durationMs: 4500 });
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
        if (!sessionCheck.ok) {
          set({ buildFinishError: sessionCheck.message, farmingToast: sessionCheck.message });
          setTimeout(() => {
            if (get().farmingToast === sessionCheck.message) set({ farmingToast: null });
          }, 2800);
          return;
        } else if (targetBug.sourceQuestId) {
          const planId = resolution?.planId ?? targetBug.chosenPlan;
          const needType = targetBug.needType ?? 'P';
          const decision = get().questDecisions[targetBug.sourceQuestId];
          if (!decision?.satisfactionDeltaApplied) {
            const policyCost = getPlanBudgetCost(needType, planId);
            const remaining = get().remainingBudget;
            if (policyCost > remaining) {
              const msg = `施策コスト（${policyCost}）に対してセッション予算（${remaining}）が不足しています。`;
              set({ buildFinishError: msg, farmingToast: msg });
              setTimeout(() => {
                if (get().farmingToast === msg) set({ farmingToast: null });
              }, 2800);
              return;
            }
          }
          const repair = getPlanRepairScale(planId);
          const blocksPlaced = decision?.blocksPlaced ?? sessionForFinish?.blockCount ?? 0;
          if (blocksPlaced > repair.maxBlocks) {
            const msg = `修理規模（${repair.label}）の上限 ${repair.maxBlocks} ブロックを超えています。`;
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
      const shouldTrackResolve = true;
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
              questId: targetBug.sourceQuestId || targetBug.id,
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
      const resolveToast = (targetBug.sourceQuestId || targetBug.id)
        ? (targetBug.needType
          ? buildPlanResolutionFeedback({
            needType: targetBug.needType,
            planId: resolution?.planId ?? targetBug.chosenPlan,
            affectedGroups: targetBug.affectedGroups,
            questComment: get().quests.find((q) => q.id === targetBug.sourceQuestId)?.comment
              ?? targetBug.comment,
          })
          : buildResolveToast(
            get().quests.find((quest) => quest.id === targetBug.sourceQuestId),
            resolution?.planId ?? targetBug.chosenPlan,
          ))
        : null;

      if (solvedCount > 0) {
        if (targetBug) {
          const planId = resolution?.planId ?? targetBug.chosenPlan;
          const questIdForDecision = targetBug.sourceQuestId || targetBug.id;
          get().commitQuestPlanChoice?.(questIdForDecision, planId);
          get().finalizeQuestDecision?.(questIdForDecision);
        }

        const expansion = null; // 満足度モードでは島は拡張しない（固定ルールにする）

        if (expansion) {
          set({
            ...expansion.patch,
            buildSession: null,
            narrativeFeedback: resolveToast,
            ...resolvedQuestPatch,
            ...resolveStatsPatch,
            ...(sideEffectToast ? { farmingToast: sideEffectToast } : {}),
          });

          if (sideEffectToast) setTimedToast({ set, get, message: sideEffectToast, durationMs: 2600 });

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
        } else {
          set({
            buildMode: null,
            buildSession: null,
            hoverPosition: null,
            placingPresetArchetype: null,
            isReturning: true,
            bugs: bugsWithTradeoff,
            narrativeFeedback: resolveToast,
            ...resolvedQuestPatch,
            ...resolveStatsPatch,
            ...(sideEffectToast ? { farmingToast: sideEffectToast } : {}),
          });
          if (sideEffectToast) {
            setTimedToast({ set, get, message: sideEffectToast, durationMs: 2600 });
          }
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
        if (resolveToast) {
          setTimedToast({
            set,
            get,
            message: resolveToast,
              durationMs: 9000,
          });
        }
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
    const needType = targetBug.needType
      ?? TYPE_TO_BARRIER_META[targetBug.type]?.needType
      ?? 'P';
    const matrixPlans = getAllowedPlansForQuest({ needType }).map(normalizePlanId);
    const allowedPlans = Array.isArray(targetBug.allowedPlans) ? targetBug.allowedPlans : [];
    const selectedNormalized = selectedPlan ? normalizePlanId(selectedPlan) : null;
    const canUseSelected = selectedNormalized
      && (
        allowedPlans.includes(selectedNormalized)
        || matrixPlans.includes(selectedNormalized)
      );
    const resolvedPlan = canUseSelected
      ? selectedNormalized
      : (targetBug.chosenPlan && (allowedPlans.includes(targetBug.chosenPlan) || matrixPlans.includes(targetBug.chosenPlan))
        ? targetBug.chosenPlan
        : (matrixPlans[0]
          ?? TYPE_TO_BARRIER_META[targetBug.type]?.defaultPlan
          ?? allowedPlans[0]
          ?? null));
    const initialShape = resolvedPlan === 'transit_link' ? 'ferry_dock' : 'block';
    const planForSession = resolvedPlan ?? targetBug.chosenPlan;

    const questIdForDecision = targetBug.sourceQuestId || targetBug.id;
    if (planForSession) {
      const committed = get().commitQuestPlanChoice?.(questIdForDecision, planForSession);
      if (!committed) {
        console.error('commitQuestPlanChoice failed for', questIdForDecision, planForSession);
        setTimedToast({ set, get, message: 'プランの確定に失敗しました。予算が足りないか、状態が不正です。', durationMs: 3000 });
        return;
      }
    }

    set((state) => ({
      ...buildModeDefaults,
      buildMode: bugId,
      buildFinishError: null,
      activeBug: null,
      buildSession: createImprovementSession(
        { ...targetBug, chosenPlan: planForSession ?? targetBug.chosenPlan },
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

  commitJokerQuest: (bugId, jokerInput) => {
    const targetBug = findBugById(get().bugs, bugId);
    const questIdForDecision = targetBug.sourceQuestId || bugId;
    if (targetBug.needType !== 'O') {
      setTimedToast({ set, get, message: 'ジョーカー施策は「その他」の困りごと専用です。', durationMs: 2800 });
      return false;
    }
    if (false) {
      setTimedToast({ set, get, message: '議会モード中のみジョーカー施策を使えます。', durationMs: 2800 });
      return false;
    }

    const committed = get().commitJokerPlan?.(questIdForDecision, jokerInput);
    if (!committed) return false;

    const jokerPayload = get().questDecisions?.[questIdForDecision]?.jokerPlan;
    const updatedBugs = get().bugs.map((b) => (
      sameBugId(b.id, bugId)
        ? normalizeBug({
          ...b,
          solved: true,
          chosenPlan: JOKER_PLAN_ID,
        })
        : b
    ));

    const quest = get().quests.find((q) => q.id === targetBug.sourceQuestId);
    const feedback = buildJokerResolutionFeedback({
      jokerPlan: jokerPayload,
      affectedGroups: targetBug.affectedGroups,
      questComment: quest?.comment ?? targetBug.comment,
    });

    set({
      bugs: updatedBugs,
      activeBug: null,
      isReturning: true,
      narrativeFeedback: feedback,
      quests: targetBug.sourceQuestId ? markQuestResolved(get().quests, targetBug.sourceQuestId, targetBug.id) : get().quests,
      postStats: appendPostEvent(get().postStats, buildResolveEvent({
        t: Date.now(),
        questId: questIdForDecision,
        bugId: targetBug.id,
        chosenPlan: JOKER_PLAN_ID,
      })),
    });

    return true;
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
