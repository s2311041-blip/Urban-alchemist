import { describe, expect, it } from 'vitest';
import {
  appendPostEvent,
  buildPostEventFromQuest,
  buildResolveEvent,
  buildSpawnEvent,
  createQuestFromPost,
  markQuestResolved,
  questToBug,
} from './questLifecycle';
import { QUEST_STATUS } from './questState';

describe('quest flow regression', () => {
  it('keeps post -> spawn -> resolve lifecycle consistent', () => {
    const quest = createQuestFromPost({
      needType: 'P',
      comment: '段差が怖い',
      placeArchetype: 'road',
      isMine: true,
    });

    expect(quest.questStatus).toBe(QUEST_STATUS.PENDING_SPAWN);
    expect(quest.linkedBugId).toBeNull();

    const bug = questToBug(quest, [2.5, 0.5, 1.5]);
    expect(bug.sourceQuestId).toBe(quest.id);
    expect(bug.fromPost).toBe(true);
    expect(bug.solved).toBe(false);

    const onIslandQuest = {
      ...quest,
      questStatus: QUEST_STATUS.ON_ISLAND,
      linkedBugId: bug.id,
    };

    const resolvedQuests = markQuestResolved([onIslandQuest], quest.id, bug.id);
    expect(resolvedQuests[0].questStatus).toBe(QUEST_STATUS.RESOLVED);

    let postStats = { totalPosts: 0, firstPostBonusClaimed: false, totalResolved: 0, events: [] };
    postStats = appendPostEvent(postStats, buildPostEventFromQuest(quest));
    postStats = appendPostEvent(postStats, buildSpawnEvent({ questId: quest.id, bugId: bug.id }));
    postStats = appendPostEvent(postStats, buildResolveEvent({ questId: quest.id, bugId: bug.id, chosenPlan: 'hard_fix' }));

    expect(postStats.events).toHaveLength(3);
    expect(postStats.events.map((e) => e.kind)).toEqual(['post', 'spawn', 'resolve']);
    expect(postStats.events.every((e) => Number.isFinite(e.t))).toBe(true);
  });
});
