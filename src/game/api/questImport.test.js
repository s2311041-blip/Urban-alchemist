import { describe, expect, it } from 'vitest';
import {
  annotationToQuestPost,
  isQuestAlreadyImported,
  parseImportJson,
} from '../../game/api/questImport.js';
import {
  spawnQuestOnIslandState,
  createQuestFromPost,
} from '../../store/helpers/questLifecycle.js';
import { QUEST_STATUS } from '../../store/helpers/questState.js';

const MOCK_ISLAND = [{
  id: 'center',
  pos: [0, -0.3, 0],
  size: [24, 0.6, 24],
}];

describe('annotationToQuestPost', () => {
  it('maps bad annotation to quest payload', () => {
    const post = annotationToQuestPost({
      id: 'ar-123',
      postKind: 'bad',
      needType: 'P',
      comment: '段差',
      placeArchetype: 'station',
      affectedGroups: ['高齢者'],
      photo: 'https://example.com/p.jpg',
    });
    expect(post.sourceAnnotationId).toBe('ar-123');
    expect(post.needType).toBe('P');
    expect(post.isMine).toBe(false);
    expect(post.demographic).toBe('高齢者');
  });

  it('skips good posts', () => {
    expect(annotationToQuestPost({ postKind: 'good', comment: 'nice' })).toBeNull();
  });
});

describe('parseImportJson', () => {
  it('parses schema v2 export', () => {
    const json = JSON.stringify({
      schema: 'urban-alchemist-ar-rq1-v2',
      annotations: [{
        id: 'a1',
        kind: 'barrier',
        comment: 'test',
        needType: 'V',
        placeArchetype: 'road',
      }],
    });
    const posts = parseImportJson(json);
    expect(posts).toHaveLength(1);
    expect(posts[0].sourceAnnotationId).toBe('a1');
  });
});

describe('isQuestAlreadyImported', () => {
  it('detects duplicate by sourceAnnotationId', () => {
    const quests = [{ id: 'quest_ar-1', sourceAnnotationId: 'ar-1' }];
    expect(isQuestAlreadyImported(quests, 'ar-1')).toBe(true);
    expect(isQuestAlreadyImported(quests, 'ar-2')).toBe(false);
  });
});

describe('spawnQuestOnIslandState two-layer spawn', () => {
  it('creates place site and accent on first station quest', () => {
    const quest = createQuestFromPost({
      needType: 'P',
      placeArchetype: 'station',
      comment: '段差',
      isMine: false,
    });

    const result = spawnQuestOnIslandState({
      quest,
      islandChunks: MOCK_ISLAND,
      placedBlocks: [],
      bugs: [],
    });

    expect(result).not.toBeNull();
    expect(result.updatedQuest.questStatus).toBe(QUEST_STATUS.ON_ISLAND);
    expect(result.nextBlocks.length).toBeGreaterThan(0);
    expect(result.bug.placeArchetype).toBe('station');
  });

  it('adds accent-only blocks on reuse of same placeArchetype', () => {
    const first = createQuestFromPost({
      needType: 'P',
      placeArchetype: 'station',
      comment: '1',
    });
    const firstSpawn = spawnQuestOnIslandState({
      quest: first,
      islandChunks: MOCK_ISLAND,
      placedBlocks: [],
      bugs: [],
    });
    expect(firstSpawn).not.toBeNull();

    const second = createQuestFromPost({
      needType: 'V',
      placeArchetype: 'station',
      comment: '2',
    });
    const secondSpawn = spawnQuestOnIslandState({
      quest: second,
      islandChunks: MOCK_ISLAND,
      placedBlocks: firstSpawn.nextBlocks,
      bugs: [firstSpawn.bug],
    });

    expect(secondSpawn).not.toBeNull();
    expect(secondSpawn.nextBlocks.length).toBeGreaterThan(firstSpawn.nextBlocks.length);
  });
});
