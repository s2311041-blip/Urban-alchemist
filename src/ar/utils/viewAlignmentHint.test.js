import { describe, expect, it } from 'vitest';
import { buildViewAlignmentHint, turnHintForBearing } from './viewAlignmentHint.js';

describe('buildViewAlignmentHint', () => {
  it('inverts horizontal guidance for portrait AR', () => {
    expect(buildViewAlignmentHint(30, null, 'perspective')).toBe('右に向ける');
    expect(buildViewAlignmentHint(-30, null, 'perspective')).toBe('左に向ける');
  });

  it('inverts vertical guidance for portrait AR', () => {
    expect(buildViewAlignmentHint(0, 12, 'perspective')).toBe('もう少し上を向く');
    expect(buildViewAlignmentHint(0, -12, 'perspective')).toBe('もう少し下を向く');
  });

  it('returns short off-screen copy', () => {
    expect(turnHintForBearing(-20)).toBe('左を向く');
  });
});
