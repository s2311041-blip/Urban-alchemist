import { describe, expect, it } from 'vitest';
import { createDefaultCenterIslandChunk } from '../../constants/islandConfig';
import { CHUNK_SEAM_OVERLAP, CHUNK_SIZE } from '../../constants/seaData';
import {
  computeRingCandidatePositions,
  createRingExpansionChunks,
  getClusterBounds,
  migrateMainIslandChunkLayout,
} from './islandExpansion';

const footprint = (chunk) => {
  const w = chunk.size?.[0] ?? CHUNK_SIZE;
  const d = chunk.size?.[2] ?? CHUNK_SIZE;
  const cx = chunk.pos?.[0] ?? 0;
  const cz = chunk.pos?.[2] ?? 0;
  return {
    minX: cx - w / 2,
    maxX: cx + w / 2,
    minZ: cz - d / 2,
    maxZ: cz + d / 2,
  };
};

const overlapArea = (a, b) => {
  const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
  if (overlapX <= 0 || overlapZ <= 0) return 0;
  return overlapX * overlapZ;
};

describe('island ring expansion geometry', () => {
  it('places first ring flush with 28x28 center (center at x≈21 east)', () => {
    const center = createDefaultCenterIslandChunk();
    const ring = computeRingCandidatePositions([center], 0, 0);
    const east = ring.find(([x]) => x > 18);
    expect(east).toBeDefined();
    expect(east[0]).toBeCloseTo(14 + CHUNK_SIZE / 2 - CHUNK_SEAM_OVERLAP, 2);
  });

  it('first ring includes four corners (12 tiles around 28x28 center)', () => {
    const center = createDefaultCenterIslandChunk();
    const candidates = computeRingCandidatePositions([center], 0, 0);
    expect(candidates.length).toBe(12);
    const newChunks = createRingExpansionChunks({
      centerX: 0,
      centerZ: 0,
      ringLevel: 1,
      idPrefix: 'test_ring1',
      existingChunks: [center],
    });
    expect(newChunks.length).toBe(12);
    const corners = newChunks.filter((chunk) => (
      Math.abs(Math.abs(chunk.pos[0]) - (14 + CHUNK_SIZE / 2 - CHUNK_SEAM_OVERLAP)) < 0.2
      && Math.abs(Math.abs(chunk.pos[2]) - (14 + CHUNK_SIZE / 2 - CHUNK_SEAM_OVERLAP)) < 0.2
    ));
    expect(corners.length).toBe(4);
  });

  it('first ring does not overlap center beyond seam tolerance', () => {
    const center = createDefaultCenterIslandChunk();
    const centerFp = footprint(center);
    const newChunks = createRingExpansionChunks({
      centerX: 0,
      centerZ: 0,
      ringLevel: 1,
      idPrefix: 'test_ring1',
      existingChunks: [center],
    });
    expect(newChunks.length).toBeGreaterThan(0);
    newChunks.forEach((chunk) => {
      const area = overlapArea(centerFp, footprint(chunk));
      expect(area).toBeLessThanOrEqual((CHUNK_SEAM_OVERLAP + 0.05) * CHUNK_SIZE);
    });
  });

  it('second ring attaches outside first ring without overlap', () => {
    const center = createDefaultCenterIslandChunk();
    const ring1 = createRingExpansionChunks({
      centerX: 0,
      centerZ: 0,
      ringLevel: 1,
      idPrefix: 'ring1',
      existingChunks: [center],
    });
    const ring2 = createRingExpansionChunks({
      centerX: 0,
      centerZ: 0,
      ringLevel: 2,
      idPrefix: 'ring2',
      existingChunks: [center, ...ring1],
    });
    expect(ring2.length).toBeGreaterThan(0);
    ring2.forEach((chunk) => {
      const fp = footprint(chunk);
      ring1.forEach((inner) => {
        const area = overlapArea(fp, footprint(inner));
        expect(area).toBeLessThanOrEqual((CHUNK_SEAM_OVERLAP + 0.05) * CHUNK_SIZE);
      });
    });
  });

  it('migrates legacy overlapping chunks to outer ring', () => {
    const center = createDefaultCenterIslandChunk();
    const legacy = {
      id: 'chunk_lvl1_0',
      pos: [14, -0.3, 0],
      size: [CHUNK_SIZE, 0.6, CHUNK_SIZE],
    };
    const migrated = migrateMainIslandChunkLayout([center, legacy]);
    const fixed = migrated.find((c) => c.id === 'chunk_lvl1_0');
    expect(Math.abs(fixed.pos[0])).toBeGreaterThan(18);
    expect(overlapArea(footprint(center), footprint(fixed)))
      .toBeLessThanOrEqual((CHUNK_SEAM_OVERLAP + 0.05) * CHUNK_SIZE);
  });
});
