import { describe, expect, it } from 'vitest';
import { PLACE_PRESET_TEMPLATES } from '../constants/placePresetTemplates';
import { findLayoutGroundAt, selectLayoutSurfaceHit } from './placeLayoutPointer';
import { layoutBlockY, layoutSurfaceWorldY } from './placePresets';

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

  it('uses the visible preset floor, not the island grass', () => {
    const hit = findLayoutGroundAt({ x: 2, z: -1 }, [road], islandChunks);
    expect(hit.block).toBe(road);
    expect(hit.y).toBe(layoutSurfaceWorldY(road));
    expect(hit.y).not.toBe(0);
  });

  it('puts a freshly placed preset floor one half-block above the island', () => {
    const placed = {
      ...road,
      pos: [0, layoutBlockY('road_layout', 0), 0],
    };
    const hit = findLayoutGroundAt({ x: 0, z: 0 }, [placed], islandChunks);
    expect(hit.y).toBe(0.25);
  });

  it('does not claim points outside the preset footprint', () => {
    expect(findLayoutGroundAt({ x: 20, z: 20 }, [road], islandChunks)).toBeNull();
  });

  it('supports rotated preset footprints', () => {
    const rotated = { ...road, rotation: 90 };
    expect(findLayoutGroundAt({ x: 6, z: -1 }, [rotated], islandChunks)).toBeTruthy();
    expect(findLayoutGroundAt({ x: 2, z: 7.5 }, [rotated], islandChunks)).toBeNull();
  });

  it('defines a build surface for every place preset layout', () => {
    const layoutShapes = Object.values(PLACE_PRESET_TEMPLATES)
      .flatMap((template) => template.base)
      .map((block) => block.shape)
      .filter((shape) => shape.endsWith('_layout'));
    for (const shape of layoutShapes) {
      const block = { shape, pos: [0, layoutBlockY(shape, 0), 0], scale: [1, 1, 1], rotation: 0 };
      const hit = findLayoutGroundAt({ x: 0, z: 0 }, [block], islandChunks);
      expect(hit?.y, shape).toBe(0.25);
      expect(hit?.y, shape).toBe(layoutSurfaceWorldY(block));
    }
    expect(new Set(layoutShapes).size).toBe(9);
  });
});
