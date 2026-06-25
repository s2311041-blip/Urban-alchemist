import { buildQuestSpawnBlocks } from '../../utils/placePresets';
import {
  questToBug,
  snapManualQuestPosition,
  appendPostEvent,
  buildSpawnEvent,
} from './questLifecycle';
import { QUEST_STATUS, canStartQuestPlacement } from './questState';
import { setTimedToast } from './uiFeedback';

/** AR投稿・クエストボードからの島上配置を確定 */
export const commitQuestPlacement = (questPos, { getState, setState }) => {
  const current = getState();
  if (!current.placingQuest) return false;

  if (!canStartQuestPlacement(current.placingQuest)) {
    setState({ placingQuest: null });
    setTimedToast({
      set: setState,
      get: getState,
      message: 'この不満はもう配置できません。',
      durationMs: 2200,
    });
    return false;
  }

  if (!Array.isArray(questPos) || questPos.length < 3) {
    setTimedToast({
      set: setState,
      get: getState,
      message: '島の上を選んでからダブルクリックしてください。',
      durationMs: 2200,
    });
    return false;
  }

  const spawnBlocks = buildQuestSpawnBlocks({
    quest: current.placingQuest,
    spawnPos: questPos,
    islandChunks: current.islandChunks,
    placedBlocks: current.placedBlocks,
  });
  const nextBug = questToBug(current.placingQuest, questPos);
  if (spawnBlocks.archetype) {
    nextBug.placeArchetype = spawnBlocks.archetype;
  }

  const nextQuests = current.quests.map((q) => (
    q.id === current.placingQuest.id
      ? {
        ...q,
        questStatus: QUEST_STATUS.ON_ISLAND,
        linkedBugId: nextBug.id,
      }
      : q
  ));

  setState({
    bugs: [...current.bugs, nextBug],
    quests: nextQuests,
    placedBlocks: spawnBlocks.blocks.length > 0
      ? [...current.placedBlocks, ...spawnBlocks.blocks]
      : current.placedBlocks,
    placingQuest: null,
    hoverPosition: null,
    ...(current.placingQuest?.sourceQuestId || current.placingQuest?.isMine
      ? {
        postStats: appendPostEvent(current.postStats, buildSpawnEvent({
          questId: current.placingQuest.id,
          bugId: nextBug.id,
        })),
      }
      : {}),
  });

  if (spawnBlocks.label && !spawnBlocks.reuseSite) {
    setTimedToast({
      set: setState,
      get: getState,
      message: `${spawnBlocks.label}の場所セットを配置しました。`,
      durationMs: 2200,
    });
  } else if (spawnBlocks.reuseSite && spawnBlocks.blocks.length > 0) {
    setTimedToast({
      set: setState,
      get: getState,
      message: '不満の演出を追加しました。',
      durationMs: 2200,
    });
  }

  document.body.style.cursor = 'auto';
  return true;
};

export const resolveQuestPlacementPos = (point, islandChunks) => (
  snapManualQuestPosition(point, islandChunks)
);
