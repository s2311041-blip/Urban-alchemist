export const QUEST_STATUS = {
  PENDING_SPAWN: 'pending_spawn',
  ON_ISLAND: 'on_island',
  RESOLVED: 'resolved',
};

const VALID_QUEST_STATUS = new Set(Object.values(QUEST_STATUS));

export const normalizeQuestStatus = (status) => (
  VALID_QUEST_STATUS.has(status) ? status : QUEST_STATUS.PENDING_SPAWN
);

export const isQuestOnIsland = (questOrStatus) => (
  normalizeQuestStatus(
    typeof questOrStatus === 'string' ? questOrStatus : questOrStatus?.questStatus,
  ) === QUEST_STATUS.ON_ISLAND
);

export const isQuestResolved = (questOrStatus) => (
  normalizeQuestStatus(
    typeof questOrStatus === 'string' ? questOrStatus : questOrStatus?.questStatus,
  ) === QUEST_STATUS.RESOLVED
);

export const canStartQuestPlacement = (quest) => (
  !!quest && !isQuestOnIsland(quest) && !isQuestResolved(quest)
);

export const canFocusQuestOnIsland = (quest) => (
  !!quest && !!quest.linkedBugId && isQuestOnIsland(quest)
);
