import { describe, it, expect } from 'vitest';
import { validateJokerPlan } from './jokerPlan.js';

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
