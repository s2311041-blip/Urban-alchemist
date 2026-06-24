import { describe, expect, it } from 'vitest';
import { destinationPoint } from './geoMath';
import { geoToLocalPosition, localToGeo } from './xrGeoBridge';

describe('xrGeoBridge', () => {
  const origin = { lat: 35.6694, lng: 139.8271 };

  it('round-trips local ↔ geo within a few meters', () => {
    const target = destinationPoint(origin.lat, origin.lng, 45, 12);
    const local = geoToLocalPosition(origin, 0, target);
    const back = localToGeo(origin, 0, local);
    const dLat = Math.abs(back.lat - target.lat);
    const dLng = Math.abs(back.lng - target.lng);
    expect(dLat).toBeLessThan(0.00005);
    expect(dLng).toBeLessThan(0.00005);
  });

  it('places target east with positive x when heading north', () => {
    const target = destinationPoint(origin.lat, origin.lng, 90, 10);
    const local = geoToLocalPosition(origin, 0, target);
    expect(local.x).toBeGreaterThan(9);
    expect(Math.abs(local.z)).toBeLessThan(1);
  });
});
