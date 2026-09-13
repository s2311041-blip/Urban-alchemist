import { describe, it, expect } from 'vitest';
import {
  JOKER_PLAN_ID,
  getJokerMaxBlocks,
  getJokerRequiredBlocks,
  validateJokerPlan,
} from './jokerPlan.js';
import { TRADEOFF_MATRIX, getSelectablePlansForQuest } from '../constants/tradeoffMatrix.js';

describe('validateJokerPlan', () => {
  it('accepts balanced joker payload', () => {
    const result = validateJokerPlan({
      title: '相談デー',
      description: '住民が集まって相談できる日を設ける',
      budgetCost: 20,
      deltas: { link: 0, place: 15, inclusive: 10, livability: -13 },
    });
    expect(result.ok).toBe(true);
    expect(result.payload.budgetCost).toBe(20);
  });

  it('rejects when plus exceeds budget cap', () => {
    const result = validateJokerPlan({
      title: '相談デー',
      description: '住民が集まって相談できる日を設ける',
      budgetCost: 10,
      deltas: { link: 20, place: 0, inclusive: 0, livability: -10 },
    });
    expect(result.ok).toBe(false);
  });

  it('rejects when minus side effect is too small', () => {
    const result = validateJokerPlan({
      title: '相談デー',
      description: '住民が集まって相談できる日を設ける',
      budgetCost: 20,
      deltas: { link: 10, place: 10, inclusive: 0, livability: -5 },
    });
    expect(result.ok).toBe(false);
  });
});

describe('joker plan availability', () => {
  it('offers the joker plan for every need type', () => {
    for (const needType of Object.keys(TRADEOFF_MATRIX)) {
      const plans = getSelectablePlansForQuest({ needType });
      expect(plans).toContain(JOKER_PLAN_ID);
    }
  });

  it('offers ignore alongside the joker plan for the other category', () => {
    const plans = getSelectablePlansForQuest({ needType: 'O' });
    expect(plans).toEqual([JOKER_PLAN_ID, 'ignore']);
  });

  it('keeps fixed plans ahead of joker and ignore', () => {
    const plans = getSelectablePlansForQuest({ needType: 'P' });
    expect(plans.slice(-2)).toEqual([JOKER_PLAN_ID, 'ignore']);
    expect(plans.length).toBe(5);
  });

  it('can exclude the joker plan when asked', () => {
    const plans = getSelectablePlansForQuest({ needType: 'P', includeJoker: false });
    expect(plans).not.toContain(JOKER_PLAN_ID);
  });
});

describe('joker DIY scale', () => {
  it('scales the block budget with the chosen cost', () => {
    expect(getJokerMaxBlocks(10)).toBe(5);
    expect(getJokerMaxBlocks(30)).toBe(15);
  });

  it('clamps to the minimum for missing or tiny budgets', () => {
    expect(getJokerMaxBlocks(undefined)).toBe(3);
    expect(getJokerMaxBlocks(2)).toBe(3);
  });

  it('requires at least one block to count as built', () => {
    expect(getJokerRequiredBlocks(10)).toBe(1);
    expect(getJokerRequiredBlocks(30)).toBe(5);
  });
});
