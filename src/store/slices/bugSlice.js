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
} from '../helpers/questLifecycle';
import {
  QUEST_STATUS,
  canFocusQuestOnIsland,
  canStartQuestPlacement,
  isQuestResolved,
} from '../helpers/questState';
import { buildResolveToast } from '../../utils/questFeedback';
import { setTimedToast } from '../helpers/uiFeedback';

export const createBugSlice = (set, get) => ({
  finishBuildMode: () => {
    const { buildMode, bugs, islandChunks, placedBlocks, ferryRoutes } = get();
    set({
      selectedEditBlockId: null,
      diagonalFirstPoint: null,
      buildFinishError: null,
    });

    if (buildMode === 'free') {
      set({ buildMode: null, hoverPosition: null, placingPresetArchetype: null, isReturning: true });
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

      const updatedBugs = bugs.map((b) => (
        sameBugId(b.id, buildMode) ? { ...b, solved: true } : b
      ));
      const sideEffectToast = getBarrierSideEffectToast(targetBug, resolution);
      const solvedCount = updatedBugs.filter((b) => b.solved).length;
      const resolvedQuestPatch = targetBug.sourceQuestId
        ? {
          quests: markQuestResolved(get().quests, targetBug.sourceQuestId, targetBug.id),
        }
        : {};
      const shouldTrackResolve = !!targetBug.sourceQuestId;
      const resolveStatsPatch = shouldTrackResolve
        ? (() => {
          const nextStats = appendPostEvent(get().postStats, buildResolveEvent({
            t: Date.now(),
            questId: targetBug.sourceQuestId,
            bugId: targetBug.id,
            chosenPlan: resolution?.planId ?? targetBug.chosenPlan ?? null,
          }));
          return {
            postStats: {
              ...nextStats,
              totalResolved: nextStats.totalResolved + 1,
            },
          };
        })()
        : {};
      const resolveToast = targetBug.sourceQuestId
        ? buildResolveToast(
          get().quests.find((quest) => quest.id === targetBug.sourceQuestId),
          resolution?.planId ?? targetBug.chosenPlan,
        )
        : null;

      if (solvedCount > 0) {
        const expansion = computeWorldExpansionAfterSolve({
          updatedBugs,
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
          hoverPosition: null,
          isReturning: true,
          ...resolvedQuestPatch,
          ...resolveStatsPatch,
          ...(resolveToast ? { farmingToast: resolveToast } : {}),
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

  ingestQuestPost: (post = {}) => {
    const quest = createQuestFromPost(post);
    const state = get();
    const toast = '島の上を選んでダブルクリックで配置してください（半透明プレビュー）';
    const withPostEvent = appendPostEvent(state.postStats, buildPostEventFromQuest({
      ...quest,
      t: Date.now(),
    }));

    set({
      quests: [quest, ...state.quests],
      placingQuest: quest,
      isQuestBoardOpen: false,
      hoverPosition: null,
      postStats: withPostEvent,
    });
    setTimedToast({ set, get, message: toast, durationMs: 3200 });

    return quest;
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
      selectedShape: initialShape,
      bugs: state.bugs.map((bug) => {
        if (!sameBugId(bug.id, bugId)) return bug;
        return resolvedPlan ? normalizeBug({ ...bug, chosenPlan: resolvedPlan }) : normalizeBug(bug);
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
