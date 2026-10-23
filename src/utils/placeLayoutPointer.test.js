import { describe, expect, it } from 'vitest';
import { findLayoutGroundAt, selectLayoutSurfaceHit } from './placeLayoutPointer';

const layout = (distance, y = 1) => ({
  distance,
  object: { userData: { placeLayoutSurface: true } },
  normal: { y },
});

const buildSurface = (distance) => ({
  distance,
  object: {
    userData: {
      placeLayoutSurface: true,
      layoutBuildSurface: true,
    },
  },
  normal: { y: 1 },
});

const island = (distance) => ({
  distance,
  object: { userData: { islandSurface: true } },
});

const solid = (distance) => ({
  distance,
  object: { userData: {} },
});

const readNormal = (hit) => hit.normal ?? null;

describe('selectLayoutSurfaceHit', () => {
  it('uses the preset surface when the island is the closer hit', () => {
    const road = layout(2.4);
    const chosen = selectLayoutSurfaceHit([island(2.3), road], readNormal);
    expect(chosen.hit).toBe(road);
  });

  it('keeps stacking on a regular block that is in front of the preset', () => {
    const chosen = selectLayoutSurfaceHit([solid(1), layout(2)], readNormal);
    expect(chosen).toBeNull();
  });

  it('ignores vertical preset faces and uses the nearest upward face', () => {
    const wall = layout(1, 0);
    const roof = layout(1.4);
    const chosen = selectLayoutSurfaceHit([wall, roof], readNormal);
    expect(chosen.hit).toBe(roof);
  });

  it('uses the dedicated ground-zero surface instead of a preset roof', () => {
    const groundZero = buildSurface(2);
    const chosen = selectLayoutSurfaceHit([layout(1), groundZero], readNormal);
    expect(chosen.hit).toBe(groundZero);
  });
});

describe('findLayoutGroundAt', () => {
  const islandChunks = [{ pos: [0, -0.3, 0], size: [42, 0.6, 42] }];
  const road = {
    shape: 'road_layout',
    pos: [2, 3, -1],
    scale: [1, 1, 1],
    rotation: 0,
  };

  it('treats the preset footprint as ground zero regardless of its stored Y', () => {
    const hit = findLayoutGroundAt({ x: 2, z: -1 }, [road], islandChunks);
    expect(hit.block).toBe(road);
    expect(hit.y).toBe(0);
  });

  it('does not claim points outside the preset footprint', () => {
    expect(findLayoutGroundAt({ x: 20, z: 20 }, [road], islandChunks)).toBeNull();
  });

  it('supports rotated preset footprints', () => {
    const rotated = { ...road, rotation: 90 };
    expect(findLayoutGroundAt({ x: 6, z: -1 }, [rotated], islandChunks)).toBeTruthy();
    expect(findLayoutGroundAt({ x: 2, z: 7.5 }, [rotated], islandChunks)).toBeNull();
  });
});
