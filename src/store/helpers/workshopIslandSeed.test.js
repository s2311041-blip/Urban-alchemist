import { describe, expect, it } from 'vitest';
import { QUEST_STATUS } from './questState.js';
import { createWorkshopIslandState } from './workshopIslandSeed.js';

describe('createWorkshopIslandState', () => {
  it('starts the island with the four demo complaints already placed', () => {
    const { bugs, quests } = createWorkshopIslandState();

    expect(quests).toHaveLength(4);
    expect(bugs).toHaveLength(4);
    expect(quests.every((quest) => quest.questStatus === QUEST_STATUS.ON_ISLAND)).toBe(true);
    expect(quests.map((quest) => quest.linkedBugId)).toEqual(bugs.map((bug) => bug.id));
    expect(bugs.map((bug) => bug.comment)).toEqual([
      '歩道に上がる段差のブロックの一個が周りより少し浮いていて転びそうになる',
      '自転車がスピードを出して降りてきて歩行者とぶつかりそうになる。歩道橋の道自体も広くないから危ない。',
      '歩道を舗装して欲しい。ボロボロになっていてつまづいた。階段だから危なかった。',
      '自販機の近くというだけで飲料のゴミが捨てられている。',
    ]);
    expect(bugs.map((bug) => [bug.pos[0], bug.pos[2]])).toEqual([
      [-11, -11],
      [11, -11],
      [-11, 11],
      [11, 11],
    ]);
    const gap = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const corners = bugs.map((bug) => [bug.pos[0], bug.pos[2]]);
    expect(gap(corners[0], corners[1])).toBe(gap(corners[0], corners[2]));
    expect(gap(corners[1], corners[3])).toBe(gap(corners[2], corners[3]));
    expect(quests.map((quest) => quest.placeText)).toEqual([
      '歩道・道路',
      '歩道・道路',
      '歩道橋',
      '駅前・広場',
    ]);
  });
});
