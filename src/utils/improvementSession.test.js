import { describe, expect, it } from 'vitest';
import {
  applyBuildSpend,
  canPlaceBlockInImprovementSession,
  createImprovementSession,
  validateFinishSession,
} from './improvementSession';

describe('improvementSession', () => {
  const bug = {
    id: 'bug_1',
    scale: 'point',
    chosenPlan: 'hard_fix',
    affectedGroups: ['車いす'],
  };

  it('tracks budget spend for placed blocks', () => {
    let session = createImprovementSession(bug, [{ id: 'preset_1', presetLocked: true }]);
    session = applyBuildSpend(session, { id: 'b1', shape: 'slope' }, bug);
    expect(session.budgetSpent).toBe(4);
    expect(session.blockCount).toBe(1);
  });

  it('rejects finish when budget exceeded', () => {
    let session = createImprovementSession(bug, []);
    for (let i = 0; i < 8; i += 1) {
      session = applyBuildSpend(session, { id: `b${i}`, shape: 'slope' }, bug);
    }
    const result = validateFinishSession(session);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/改善予算/);
  });

  it('passes finish when within budget', () => {
    let session = createImprovementSession(bug, []);
    session = applyBuildSpend(session, { id: 'b1', shape: 'path' }, bug);
    session = applyBuildSpend(session, { id: 'b2', shape: 'half' }, bug);
    const result = validateFinishSession(session);
    expect(result.ok).toBe(true);
  });

  it('blocks placement beyond repair scale in serious mode', () => {
    const session = createImprovementSession(bug, []);
    const check = canPlaceBlockInImprovementSession(session, {
      isSeriousMode: true,
      blocksPlaced: 12,
      additionalBlocks: 1,
    });
    expect(check.ok).toBe(false);
    expect(check.message).toMatch(/大規模/);
  });
});
