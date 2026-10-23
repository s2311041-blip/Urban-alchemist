import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WORKSHOP_POST_IDS, WORKSHOP_SEED_VERSION } from '../helpers/workshopIslandSeed';
import { createInitialState } from './initialState';

describe('createInitialState workshop seed migration', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
  });

  it('replaces an old one-complaint demo save with the current four complaints', () => {
    const state = createInitialState({
      bugs: [{ id: 'old-demo-bug' }],
      quests: [{ id: 'old-demo-quest' }],
      placedBlocks: [],
      islandChunks: [],
    });

    expect(state.workshopSeedVersion).toBe(WORKSHOP_SEED_VERSION);
    expect(state.bugs).toHaveLength(4);
    expect(state.quests).toHaveLength(4);
  });

  it('restores four complaints even when a one-complaint save was stamped current', () => {
    const state = createInitialState({
      workshopSeedVersion: WORKSHOP_SEED_VERSION,
      bugs: [{ id: 'old-demo-bug' }],
      quests: [{ id: 'old-demo-quest', sourceAnnotationId: 'old-demo' }],
      placedBlocks: [],
      islandChunks: [],
    });

    expect(state.bugs).toHaveLength(4);
    expect(state.quests).toHaveLength(4);
  });

  it('keeps progress when all four workshop posts are present', () => {
    const quests = WORKSHOP_POST_IDS.map((id) => ({
      id: `quest_${id}`,
      sourceAnnotationId: id,
    }));
    const state = createInitialState({
      workshopSeedVersion: WORKSHOP_SEED_VERSION,
      bugs: [{ id: 'current-progress-bug' }],
      quests,
      placedBlocks: [],
      islandChunks: [],
    });

    expect(state.bugs).toEqual([{ id: 'current-progress-bug' }]);
    expect(state.quests).toEqual(quests);
  });
});
