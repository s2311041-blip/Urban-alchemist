import { describe, expect, it } from 'vitest';
import {
  isPinInCameraView,
  listPinsInCameraView,
  nearestOffScreenPin,
} from './geoProjection.js';
import { turnHintForBearing } from './viewAlignmentHint.js';

const viewerGeo = { lat: 35.6694, lng: 139.8214 };

describe('isPinInCameraView', () => {
  it('returns true when pin is straight ahead', () => {
    const pinGeo = { lat: 35.6695, lng: 139.8214 };
    expect(isPinInCameraView({
      viewerGeo,
      viewerHeadingDeg: 0,
      viewerPitchDeg: 0,
      pinGeo,
    })).toBe(true);
  });

  it('returns false when pin is behind viewer', () => {
    const pinGeo = { lat: 35.6684, lng: 139.8214 };
    expect(isPinInCameraView({
      viewerGeo,
      viewerHeadingDeg: 0,
      viewerPitchDeg: 0,
      pinGeo,
    })).toBe(false);
  });
});

describe('listPinsInCameraView', () => {
  it('lists only pins in the current view', () => {
    const annotations = [
      { id: 'a', worldPin: { lat: 35.6695, lng: 139.8214 }, distanceM: 10 },
      { id: 'b', worldPin: { lat: 35.6684, lng: 139.8214 }, distanceM: 10 },
    ];
    const visible = listPinsInCameraView({
      viewerGeo,
      viewerHeadingDeg: 0,
      viewerPitchDeg: 0,
      annotations,
    });
    expect(visible).toHaveLength(1);
    expect(visible[0].annotation.id).toBe('a');
  });
});

describe('nearestOffScreenPin', () => {
  it('finds closest pin outside the view', () => {
    const annotations = [
      { id: 'left', worldPin: { lat: 35.6694, lng: 139.8204 } },
      { id: 'behind', worldPin: { lat: 35.6684, lng: 139.8214 } },
    ];
    const nearest = nearestOffScreenPin({
      viewerGeo,
      viewerHeadingDeg: 0,
      viewerPitchDeg: 0,
      annotations,
    });
    expect(nearest?.annotation.id).toBe('left');
    expect(nearest?.relBearing).toBeLessThan(0);
  });
});

describe('turnHintForBearing', () => {
  it('suggests turning left when pin is to the left', () => {
    expect(turnHintForBearing(-30)).toBe('左を向く');
  });

  it('suggests turning right when pin is to the right', () => {
    expect(turnHintForBearing(30)).toBe('右を向く');
  });

  it('suggests looking up when pitch delta is positive after negation', () => {
    expect(turnHintForBearing(0, 15)).toBe('上を向く');
  });
});
