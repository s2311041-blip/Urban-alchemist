import { describe, expect, it } from 'vitest';
import { layoutBlockY } from '../../utils/placePresets.js';
import { getIslandTopYAt } from '../../utils/terrainPlacement.js';
import { QUEST_STATUS } from './questState.js';
import { createWorkshopIslandState, workshopPersonaKey } from './workshopIslandSeed.js';

describe('createWorkshopIslandState', () => {
  it('starts the island with the four demo complaints already placed', () => {
    const { bugs, quests, placedBlocks, islandChunks } = createWorkshopIslandState();

    expect(quests).toHaveLength(4);
    expect(bugs).toHaveLength(4);
    expect(quests.every((quest) => quest.questStatus === QUEST_STATUS.ON_ISLAND)).toBe(true);
    expect(quests.map((quest) => quest.linkedBugId)).toEqual(bugs.map((bug) => bug.id));
    expect(bugs.map((bug) => bug.comment[0])).toEqual(['駅', '歩', '高', '歩']);
    expect(bugs.map((bug) => bug.photo)).toEqual([
      '/workshop/shiomi-bikes.jpg',
      '/workshop/slope-blind.jpg',
      '/workshop/underpass-rest.jpg',
      '/workshop/lane-night.jpg',
    ]);
    expect(bugs.map((bug) => bug.personaKey)).toEqual([
      'inclusive',
      'link',
      'place',
      'livability',
    ]);
    expect(bugs.map((bug) => bug.demographic)).toEqual([
      '安全・安心にまちを利用したい人（車椅子・ベビーカー）',
      'スムーズに移動したい人（通勤・通学）',
      '街でゆっくり過ごしたい人（高齢者・家族連れ）',
      '静かに暮らしたい人（近隣住民）',
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
      '駅前・広場',
      '歩道・道路',
      '水辺の広場',
      '路地・住宅街',
    ]);
    expect(workshopPersonaKey({ sourceAnnotationId: 'ws-slope-blind' })).toBe('link');
    expect(workshopPersonaKey({ sourceAnnotationId: 'ar-1792483946203-3yxt010' })).toBe('link');
    expect(workshopPersonaKey({ personaKey: 'place' })).toBe('place');
    placedBlocks.filter((block) => String(block.shape).endsWith('_layout')).forEach((block) => {
      const topY = getIslandTopYAt(block.pos[0], block.pos[2], islandChunks);
      expect(block.pos[1]).toBe(layoutBlockY(block.shape, topY));
    });
  });
});
