import { describe, expect, it } from 'vitest';
import { acceptGeoUpdate, isGeoAccuracyUsable } from './geoPosition.js';

describe('acceptGeoUpdate', () => {
  const prev = { lat: 35.6694, lng: 139.8214, accuracy: 8, capturedAt: 1 };

  it('accepts first reading', () => {
    const next = { lat: 35.6695, lng: 139.8215, accuracy: 8, capturedAt: 2 };
    expect(acceptGeoUpdate(null, next)).toEqual(next);
  });

  it('rejects large jump with poor accuracy', () => {
    const next = { lat: 35.6720, lng: 139.8214, accuracy: 40, capturedAt: 2 };
    expect(acceptGeoUpdate(prev, next)).toEqual(prev);
  });

  it('accepts small movement', () => {
    const next = { lat: 35.66945, lng: 139.82142, accuracy: 10, capturedAt: 2 };
    expect(acceptGeoUpdate(prev, next)).toEqual(next);
  });
});

describe('isGeoAccuracyUsable', () => {
  it('returns false when accuracy is too poor', () => {
    expect(isGeoAccuracyUsable({ lat: 0, lng: 0, accuracy: 40 })).toBe(false);
  });

  it('returns true when accuracy is good', () => {
    expect(isGeoAccuracyUsable({ lat: 0, lng: 0, accuracy: 12 })).toBe(true);
  });
});
