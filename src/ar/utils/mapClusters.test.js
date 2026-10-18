import { describe, expect, it } from 'vitest';
import { clusterAnnotations } from './mapClusters.js';

const near = [
  { id: 'a', worldPin: { lat: 35.65000, lng: 139.81000 } },
  { id: 'b', worldPin: { lat: 35.65002, lng: 139.81002 } },
];
const far = { id: 'c', worldPin: { lat: 35.68000, lng: 139.85000 } };

describe('clusterAnnotations', () => {
  it('groups nearby pins when zoomed out', () => {
    const groups = clusterAnnotations([...near, far], 14);
    const counts = groups.map((group) => group.items.length).sort();
    expect(counts).toEqual([1, 2]);
  });

  it('keeps every pin separate when zoomed in', () => {
    const groups = clusterAnnotations([...near, far], 17);
    expect(groups).toHaveLength(3);
    expect(groups.every((group) => group.items.length === 1)).toBe(true);
  });
});
