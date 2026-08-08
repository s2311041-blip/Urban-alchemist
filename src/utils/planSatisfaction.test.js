import { describe, it, expect } from 'vitest';
import {
  previewIslandSatisfaction,
  getPlanPreviewDeltas,
  applyPlanDeltaToSatisfaction,
  revertPlanDeltaFromSatisfaction,
} from './planSatisfaction.js';
import { createInitialSatisfaction } from '../constants/satisfactionAttributes.js';
import { buildPlanResolutionFeedback } from './planResolutionFeedback.js';

describe('planSatisfaction', () => {
  const base = createInitialSatisfaction();

  it('previews P hard_fix deltas on link and inclusive', () => {
    const preview = previewIslandSatisfaction(base, {
      needType: 'P',
      planId: 'hard_fix',
    });
    expect(preview.link).toBe(70);
    expect(preview.inclusive).toBe(75);
  });

  it('uses fixed budget from matrix without scale multiplier', () => {
    const preview = getPlanPreviewDeltas('P', 'hard_fix', 'line');
    expect(preview.budgetCost).toBe(30);
    expect(preview.deltas.link).toBe(20);
  });

  it('apply and revert are inverse', () => {
    const applied = applyPlanDeltaToSatisfaction(base, {
      needType: 'V',
      planId: 'lighting',
    });
    const reverted = revertPlanDeltaFromSatisfaction(applied, {
      needType: 'V',
      planId: 'lighting',
    });
    expect(reverted).toEqual(base);
  });

  it('lighting boosts inclusive for V need type', () => {
    const preview = getPlanPreviewDeltas('V', 'lighting', 'point');
    expect(preview.deltas.inclusive).toBeGreaterThan(0);
    expect(preview.deltas.livability).toBeLessThan(0);
  });

  it('I sign_info is strong on link with tradeoffs', () => {
    const preview = getPlanPreviewDeltas('I', 'sign_info', 'point');
    expect(preview.deltas.link).toBe(15);
    expect(preview.budgetCost).toBe(5);
  });
});

describe('planResolutionFeedback', () => {
  it('builds RPG-style message with ups and downs', () => {
    const msg = buildPlanResolutionFeedback({
      needType: 'P',
      planId: 'detour_path',
      affectedGroups: ['車いす'],
      questComment: '段差があって怖い',
    });
    expect(msg).toContain('車いす');
    expect(msg).toContain('移動+10');
    expect(msg).toContain('安全-10');
  });
});
