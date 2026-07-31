import { describe, expect, it } from 'vitest';
import {
  countPostsForPrompt,
  getActiveSpecialPrompts,
  getDaysLeftInMonth,
  getStandingPrompt,
} from './promptRotation.js';

describe('getStandingPrompt', () => {
  it('returns January prompt for month 1', () => {
    const p = getStandingPrompt(new Date(2026, 0, 15));
    expect(p.calendarMonth).toBe(1);
    expect(p.id).toBe('standing-01-winter-comfort');
  });

  it('returns August prompt for month 8', () => {
    const p = getStandingPrompt(new Date(2026, 7, 1));
    expect(p.calendarMonth).toBe(8);
    expect(p.ppsGroup).toBe('access');
  });
});

describe('getActiveSpecialPrompts', () => {
  it('returns empty when no special is active', () => {
    expect(getActiveSpecialPrompts(new Date(2026, 6, 1))).toEqual([]);
  });
});

describe('getDaysLeftInMonth', () => {
  it('counts remaining days including today', () => {
    const days = getDaysLeftInMonth(new Date(2026, 0, 31));
    expect(days).toBe(1);
  });
});

describe('countPostsForPrompt', () => {
  it('counts matching promptId', () => {
    const n = countPostsForPrompt([
      { promptId: 'a' },
      { promptId: 'b' },
      { promptId: 'a' },
    ], 'a');
    expect(n).toBe(2);
  });
});
