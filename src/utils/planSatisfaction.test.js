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
    expect(preview.place).toBe(35);
    expect(preview.inclusive).toBe(75);
    expect(preview.livability).toBe(40);
  });

  it('uses fixed budget from matrix without scale multiplier', () => {
    const preview = getPlanPreviewDeltas('P', 'hard_fix', 'line');
    expect(preview.budgetCost).toBe(30);
    expect(preview.deltas.link).toBe(20);
    expect(preview.deltas.place).toBe(-15);
    expect(preview.deltas.livability).toBe(-10);
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
    expect(preview.deltas.livability).toBe(-15);
    expect(preview.budgetCost).toBe(5);
  });

  it('M maintenance trades stay space for a managed space', () => {
    const preview = getPlanPreviewDeltas('M', 'maintenance', 'point');
    expect(preview.deltas.place).toBe(-20);
    expect(preview.deltas.link).toBe(5);
    expect(preview.deltas.livability).toBe(10);
  });

  it('sign spam sets the specified movement and quiet penalties', () => {
    expect(getPlanPreviewDeltas('P', 'sign_info', 'point').deltas).toMatchObject({ link: -15, livability: -15 });
    expect(getPlanPreviewDeltas('L', 'sign_info', 'point').deltas).toMatchObject({ link: -15, livability: -15 });
    expect(getPlanPreviewDeltas('I', 'sign_info', 'point').deltas.link).toBe(15);
    expect(getPlanPreviewDeltas('S', 'sign_info', 'point').deltas).toMatchObject({ link: -15, livability: -20 });
    expect(getPlanPreviewDeltas('M', 'sign_info', 'point').deltas).toMatchObject({ link: -15, livability: -15 });
  });

  it('mid-cost compromises carry a severe penalty', () => {
    expect(getPlanPreviewDeltas('P', 'detour_path', 'point').deltas).toMatchObject({ inclusive: -25, livability: -10 });
    expect(getPlanPreviewDeltas('L', 'detour_path', 'point').deltas).toMatchObject({ place: -5, livability: -25 });
    expect(getPlanPreviewDeltas('R', 'maintenance', 'point').deltas.link).toBe(-25);
    expect(getPlanPreviewDeltas('V', 'lighting', 'point').deltas.livability).toBe(-25);
    expect(getPlanPreviewDeltas('S', 'lighting', 'point').deltas.livability).toBe(-25);
  });

  it('mobility support occupies stay space on L and C', () => {
    expect(getPlanPreviewDeltas('L', 'mobility_support', 'point').deltas.place).toBe(-15);
    expect(getPlanPreviewDeltas('L', 'mobility_support', 'point').deltas.link).toBe(25);
    expect(getPlanPreviewDeltas('C', 'mobility_support', 'point').deltas.place).toBe(-15);
    expect(getPlanPreviewDeltas('C', 'mobility_support', 'point').deltas.inclusive).toBe(25);
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
