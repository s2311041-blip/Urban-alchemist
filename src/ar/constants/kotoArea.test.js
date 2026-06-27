import { describe, expect, it } from 'vitest';
import { KOTO_PLACE_OPTIONS } from './kotoArea.js';

describe('KOTO_PLACE_OPTIONS', () => {
  it('keeps station and plaza as separate game archetypes', () => {
    const ids = KOTO_PLACE_OPTIONS.map((o) => o.id);
    expect(ids).toContain('station');
    expect(ids).toContain('plaza');
    expect(ids.indexOf('plaza')).toBeGreaterThan(ids.indexOf('station'));
  });

  it('does not merge station front into station id', () => {
    const station = KOTO_PLACE_OPTIONS.find((o) => o.id === 'station');
    const plaza = KOTO_PLACE_OPTIONS.find((o) => o.id === 'plaza');
    expect(station?.label).not.toMatch(/駅前/);
    expect(plaza?.label).toMatch(/駅前/);
  });
});
