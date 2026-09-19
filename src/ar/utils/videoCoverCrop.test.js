import { describe, expect, it } from 'vitest';
import { getCoverCropSource } from './videoCoverCrop.js';

describe('getCoverCropSource', () => {
  it('crops left and right when the frame is wider than the view', () => {
    const crop = getCoverCropSource(1920, 1080, 390, 844);
    expect(crop.sy).toBe(0);
    expect(crop.sh).toBe(1080);
    expect(crop.sw).toBeCloseTo(1080 * (390 / 844));
    expect(crop.sx).toBeCloseTo((1920 - crop.sw) / 2);
  });

  it('crops top and bottom when the frame is taller than the view', () => {
    const crop = getCoverCropSource(1080, 1920, 800, 1000);
    expect(crop.sx).toBe(0);
    expect(crop.sw).toBe(1080);
    expect(crop.sh).toBeCloseTo(1080 / (800 / 1000));
    expect(crop.sy).toBeCloseTo((1920 - crop.sh) / 2);
  });

  it('keeps the full frame when aspect ratios match', () => {
    const crop = getCoverCropSource(1080, 1920, 1080, 1920);
    expect(crop).toEqual({ sx: 0, sy: 0, sw: 1080, sh: 1920 });
  });
});
