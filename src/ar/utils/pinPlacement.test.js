import { describe, expect, it } from 'vitest';
import { buildCapturePoseAtPhoto, computePinAtFeet } from './pinPlacement.js';

describe('computePinAtFeet', () => {
  it('sets worldPin only; capturePose comes at photo', () => {
    const r = computePinAtFeet({ authorGeo: { lat: 35.65, lng: 139.82 } });
    expect(r.worldPin.lat).toBe(35.65);
    expect(r.capturePose).toBeNull();
    expect(r.placementMode).toBe('feet');
  });
});

describe('buildCapturePoseAtPhoto', () => {
  it('records heading and pitch at shutter time', () => {
    const r = buildCapturePoseAtPhoto({
      authorGeo: { lat: 35.65, lng: 139.82 },
      worldPin: { lat: 35.65, lng: 139.82 },
      headingDeg: 90,
      pitchDeg: -10,
      screenTap: { nx: 0.5, ny: 0.5 },
      placementMode: 'feet',
    });
    expect(r.capturePose.headingDeg).toBe(90);
    expect(r.capturePose.pitchDeg).toBe(-10);
    expect(r.capturePose.placementMode).toBe('feet');
    expect(r.photoPins ?? r.screenTap).toBeDefined();
  });
});
