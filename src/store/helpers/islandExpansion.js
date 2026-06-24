import {
  ACTIVE_BARRIER_TYPE_IDS,
} from '../../constants/barrierData';
import {
  CHUNK_SIZE,
  CHUNK_SEAM_OVERLAP,
  GRID_STEP,
  getRemoteIslandBasePos,
} from '../../constants/seaData';
import { DEFAULT_CENTER_ISLAND_SIZE } from '../../constants/islandConfig';
import {
  TERRAIN_SHAPES,
  TERRAIN_META,
  DEFAULT_TERRAIN_COLORS,
} from '../../constants/terrainData';
import { getEdgePosToward } from '../../utils/ferryDockPlacement';
import { snapTerrainPosition } from '../../utils/terrainPlacement';
import { normalizeBug } from './bugFactory';

const chunkPosKey = (x, z) => `${Math.round(x * 10)}_${Math.round(z * 10)}`;
const chunkHalf = () => CHUNK_SIZE / 2;

const getChunkSize = (chunk) => ({
  w: chunk?.size?.[0] ?? CHUNK_SIZE,
  h: chunk?.size?.[1] ?? 0.6,
  d: chunk?.size?.[2] ?? CHUNK_SIZE,
});

export const getClusterChunks = (existingChunks = [], centerX, centerZ, kind, linkedTo) => {
  if (kind === 'remote' && linkedTo) {
    return existingChunks.filter((chunk) => (
      chunk.id === linkedTo || chunk.linkedTo === linkedTo
    ));
  }
  return existingChunks.filter((chunk) => chunk.kind !== 'remote');
};

export const getClusterBounds = (clusterChunks = [], centerX = 0, centerZ = 0) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  clusterChunks.forEach((chunk) => {
    const { w, d } = getChunkSize(chunk);
    const cx = chunk.pos?.[0] ?? centerX;
    const cz = chunk.pos?.[2] ?? centerZ;
    const hx = w / 2;
    const hz = d / 2;
    minX = Math.min(minX, cx - hx);
    maxX = Math.max(maxX, cx + hx);
    minZ = Math.min(minZ, cz - hz);
    maxZ = Math.max(maxZ, cz + hz);
  });

  if (!Number.isFinite(minX)) {
    const half = DEFAULT_CENTER_ISLAND_SIZE[0] / 2;
    return { minX: centerX - half, maxX: centerX + half, minZ: centerZ - half, maxZ: centerZ + half };
  }

  return { minX, maxX, minZ, maxZ };
};

/** 既存クラスターの外周に 14×14 を 1 層だけ追加（中心座標列） */
export const computeRingCandidatePositions = (clusterChunks = [], centerX = 0, centerZ = 0) => {
  const bounds = getClusterBounds(clusterChunks, centerX, centerZ);
  const half = chunkHalf();
  const seam = CHUNK_SEAM_OVERLAP;
  const eastX = bounds.maxX + half - seam;
  const westX = bounds.minX - half + seam;
  const northZ = bounds.maxZ + half - seam;
  const southZ = bounds.minZ - half + seam;

  const seen = new Set();
  const offsets = [];

  const push = (x, z) => {
    const wx = Number(x.toFixed(2));
    const wz = Number(z.toFixed(2));
    const key = chunkPosKey(wx, wz);
    if (seen.has(key)) return;
    seen.add(key);
    offsets.push([wx, wz]);
  };

  const xSteps = Math.max(1, Math.round((eastX - westX) / CHUNK_SIZE) + 1);
  const zSteps = Math.max(1, Math.round((northZ - southZ) / CHUNK_SIZE) + 1);
  const xAt = (xi) => (xi >= xSteps - 1 ? eastX : westX + xi * CHUNK_SIZE);
  const zAt = (zi) => (zi >= zSteps - 1 ? northZ : southZ + zi * CHUNK_SIZE);

  // 北南の辺（四隅含む）
  for (let xi = 0; xi < xSteps; xi += 1) {
    push(xAt(xi), southZ);
    push(xAt(xi), northZ);
  }
  // 東西の辺（四隅は北南で既に配置済みのため内側のみ）
  for (let zi = 1; zi < zSteps - 1; zi += 1) {
    const z = zAt(zi);
    push(eastX, z);
    push(westX, z);
  }

  return offsets;
};

const chunkFootprint = (chunk) => {
  const { w, d } = getChunkSize(chunk);
  const cx = chunk.pos?.[0] ?? 0;
  const cz = chunk.pos?.[2] ?? 0;
  return {
    minX: cx - w / 2,
    maxX: cx + w / 2,
    minZ: cz - d / 2,
    maxZ: cz + d / 2,
  };
};

const footprintsOverlap = (a, b, allowedSeam = CHUNK_SEAM_OVERLAP + 0.02) => {
  const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const overlapZ = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
  return overlapX > allowedSeam && overlapZ > allowedSeam;
};

export const createRingExpansionChunks = ({
  centerX,
  centerZ,
  ringLevel: _ringLevel,
  kind = 'main',
  idPrefix,
  existingChunks = [],
  linkedTo = null,
}) => {
  const clusterChunks = getClusterChunks(existingChunks, centerX, centerZ, kind, linkedTo);
  const existingKeys = new Set(
    existingChunks.map((chunk) => chunkPosKey(chunk.pos?.[0] ?? 0, chunk.pos?.[2] ?? 0)),
  );
  const existingFootprints = existingChunks.map(chunkFootprint);
  const offsets = computeRingCandidatePositions(clusterChunks, centerX, centerZ)
    .filter(([wx, wz]) => {
      if (existingKeys.has(chunkPosKey(wx, wz))) return false;
      const candidate = {
        minX: wx - CHUNK_SIZE / 2,
        maxX: wx + CHUNK_SIZE / 2,
        minZ: wz - CHUNK_SIZE / 2,
        maxZ: wz + CHUNK_SIZE / 2,
      };
      return !existingFootprints.some((fp) => footprintsOverlap(candidate, fp));
    });

  return offsets.map((offset, index) => normalizeIslandChunk({
    id: `${idPrefix}_${index}`,
    pos: [offset[0], -0.3, offset[1]],
    size: [CHUNK_SIZE, 0.6, CHUNK_SIZE],
    dropIn: true,
    ...(kind === 'remote' ? { kind: 'remote', linkedTo: linkedTo ?? idPrefix } : {}),
  }, `${idPrefix}_${index}`));
};

/** 旧ロジックで重なった本島拡張タイルを外周リングへ再配置 */
export const migrateMainIslandChunkLayout = (islandChunks = []) => {
  const center = islandChunks.find((chunk) => chunk.id === 'center');
  if (!center) return islandChunks;

  const remoteChunks = islandChunks.filter((chunk) => chunk.kind === 'remote');
  const mainExpansions = islandChunks.filter((chunk) => chunk.kind !== 'remote' && chunk.id !== 'center');
  if (mainExpansions.length === 0) return islandChunks;

  const centerHalf = (center.size?.[0] ?? DEFAULT_CENTER_ISLAND_SIZE[0]) / 2;
  const misplaced = mainExpansions.some((chunk) => {
    const cx = Math.abs(chunk.pos?.[0] ?? 0);
    const cz = Math.abs(chunk.pos?.[2] ?? 0);
    const edgeDist = Math.max(cx, cz);
    return edgeDist < centerHalf + chunkHalf() - 1.5;
  });
  if (!misplaced) return islandChunks;

  let cluster = [center];
  const slotQueue = [];
  while (slotQueue.length < mainExpansions.length) {
    const ring = computeRingCandidatePositions(cluster, center.pos?.[0] ?? 0, center.pos?.[2] ?? 0);
    ring.forEach((pos) => {
      if (!slotQueue.some(([x, z]) => chunkPosKey(x, z) === chunkPosKey(pos[0], pos[1]))) {
        slotQueue.push(pos);
      }
    });
    ring.forEach(([x, z]) => {
      cluster = [
        ...cluster,
        {
          pos: [x, -0.3, z],
          size: [CHUNK_SIZE, 0.6, CHUNK_SIZE],
        },
      ];
    });
    if (slotQueue.length > 64) break;
  }

  const migratedExpansions = mainExpansions.map((chunk, index) => {
    const slot = slotQueue[index];
    if (!slot) return chunk;
    return {
      ...chunk,
      pos: [slot[0], chunk.pos?.[1] ?? -0.3, slot[1]],
      size: [CHUNK_SIZE, 0.6, CHUNK_SIZE],
    };
  });

  return [center, ...migratedExpansions, ...remoteChunks];
};

export const getActiveRemoteHub = (islandChunks = [], activeRemoteHubId = null) => {
  if (activeRemoteHubId) {
    const hit = islandChunks.find((chunk) => chunk.id === activeRemoteHubId);
    if (hit) return hit;
  }
  return islandChunks.find((chunk) => chunk.kind === 'remote' && chunk.remoteHub)
    ?? islandChunks.find((chunk) => chunk.id === 'remote_alpha')
    ?? islandChunks.find((chunk) => chunk.kind === 'remote')
    ?? null;
};

export const normalizeIslandChunk = (chunk, fallbackId = 'center') => ({
  ...chunk,
  id: chunk.id ?? fallbackId,
  kind: chunk.kind === 'remote' ? 'remote' : 'main',
});

export const findNearestChunk = (originPos, chunks = []) => {
  if (!Array.isArray(originPos) || chunks.length === 0) return null;
  return chunks.reduce((best, chunk) => {
    if (!Array.isArray(chunk?.pos)) return best;
    const dist = Math.hypot((chunk.pos[0] ?? 0) - (originPos[0] ?? 0), (chunk.pos[2] ?? 0) - (originPos[2] ?? 0));
    if (!best || dist < best.dist) return { chunk, dist };
    return best;
  }, null)?.chunk ?? null;
};

export const createAutoDockOnChunk = ({
  targetChunk,
  towardPos,
  selectedMaterial = 'stone',
  selectedScale = [1, 1, 1],
  existingBlocks = [],
  islandChunks = [],
}) => {
  if (!targetChunk?.pos || !Array.isArray(towardPos)) return null;
  const pos = getEdgePosToward(targetChunk, towardPos, islandChunks);
  if (!pos) return null;
  const existsAtPos = existingBlocks.some((block) => (
    block.shape === 'ferry_dock'
    && Math.abs((block.pos?.[0] ?? 0) - pos[0]) < 0.5
    && Math.abs((block.pos?.[2] ?? 0) - pos[2]) < 0.5
  ));
  if (existsAtPos) return null;

  const vx = (towardPos[0] ?? 0) - pos[0];
  const vz = (towardPos[2] ?? 0) - pos[2];
  const yawDeg = (Math.atan2(vx, vz) * 180 / Math.PI + 360) % 360;
  return {
    id: Math.random().toString(),
    pos,
    shape: 'ferry_dock',
    material: selectedMaterial,
    rotation: yawDeg,
    scale: [...selectedScale],
    autoGeneratedDock: true,
  };
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const createExpansionTerrainBlock = (newChunks = [], placedBlocks = []) => {
  if (!Array.isArray(newChunks) || newChunks.length === 0) return null;
  if (!Array.isArray(TERRAIN_SHAPES) || TERRAIN_SHAPES.length === 0) return null;

  const shape = pickRandom(TERRAIN_SHAPES);
  const meta = TERRAIN_META[shape] ?? {};
  const scale = Array.isArray(meta.defaultScale) ? [...meta.defaultScale] : [1, 1, 1];
  const allChunks = newChunks;
  const validPlacedBlocks = (Array.isArray(placedBlocks) ? placedBlocks : []).filter((block) => (
    Array.isArray(block?.pos)
    && block.pos.length >= 3
    && Number.isFinite(block.pos[0])
    && Number.isFinite(block.pos[1])
    && Number.isFinite(block.pos[2])
  ));

  const isOccupied = (pos) =>
    !validPlacedBlocks.some((b) =>
      Math.abs(b.pos[0] - pos[0]) < 0.05 &&
      Math.abs(b.pos[2] - pos[2]) < 0.05 &&
      Math.abs((b.pos[1] ?? 0) - pos[1]) < 0.35
    );

  const shuffledChunks = [...newChunks];
  for (let i = shuffledChunks.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledChunks[i], shuffledChunks[j]] = [shuffledChunks[j], shuffledChunks[i]];
  }

  // まずは新チャンク中心を優先（見つけやすく、島内に収まりやすい）
  const centerCandidates = [];
  shuffledChunks.forEach((chunk) => {
    if (!Array.isArray(chunk?.pos) || chunk.pos.length < 3) return;
    const xzPairs = [
      [chunk.pos[0], chunk.pos[2]],
      [chunk.pos[0] + 1, chunk.pos[2]],
      [chunk.pos[0] - 1, chunk.pos[2]],
      [chunk.pos[0], chunk.pos[2] + 1],
      [chunk.pos[0], chunk.pos[2] - 1],
    ];
    xzPairs.forEach(([x, z]) => {
      centerCandidates.push(snapTerrainPosition(shape, scale, x, z, allChunks));
    });
  });

  let targetPos = centerCandidates.find((pos) => isOccupied(pos));

  // 万一中心付近が埋まっていたらチャンク内グリッドへフォールバック
  if (!targetPos) {
    const half = CHUNK_SIZE / 2 - 0.5;
    const candidates = [];
    shuffledChunks.forEach((chunk) => {
      if (!Array.isArray(chunk?.pos) || chunk.pos.length < 3) return;
      for (let x = -half; x <= half + 1e-9; x += GRID_STEP) {
        for (let z = -half; z <= half + 1e-9; z += GRID_STEP) {
          candidates.push(
            snapTerrainPosition(shape, scale, chunk.pos[0] + x, chunk.pos[2] + z, allChunks)
          );
        }
      }
    });
    for (let i = candidates.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    targetPos = candidates.find((pos) => isOccupied(pos));
  }

  if (!targetPos) return null;

  return {
    id: Math.random().toString(),
    pos: targetPos,
    shape,
    material: meta.defaultMaterial ?? 'stone',
    rotation: 0,
    // 自動生成は各地形のデフォルトサイズを使う
    scale,
    autoGeneratedTerrain: true,
    terrain: {
      color: DEFAULT_TERRAIN_COLORS[shape] ?? '#90a4ae',
    },
  };
};

const EXPANSION_BUG_COMMENT_BY_TYPE = {
  dark: 'このあたり、暗くて先が見えにくいです。',
  danger: 'この場所、段差が多くて移動がこわいです。',
  dirty: '通るところが荒れていて、気持ちよく使えません。',
  lonely: 'ここは声をかけられる場所がなくて不安です。',
  line_sign_confusion: '道が分かりにくくて、何度も迷ってしまいます。',
  area_maintenance_gap: '座れる場所が少なくて、休めません。',
  line_step_gap: 'この通り道は段差が続いて進みにくいです。',
  area_isolation: 'この周辺は頼れる場所がなくて心細いです。',
};

export const createExpansionBug = (newChunks = [], existingBugs = []) => {
  if (!Array.isArray(newChunks) || newChunks.length === 0) return null;
  if (!Array.isArray(ACTIVE_BARRIER_TYPE_IDS) || ACTIVE_BARRIER_TYPE_IDS.length === 0) return null;

  const chunk = pickRandom(newChunks);
  if (!chunk?.pos) return null;

  const jitter = () => (Math.floor(Math.random() * 13) - 6) * GRID_STEP;
  const pos = [chunk.pos[0] + jitter(), 0.5, chunk.pos[2] + jitter()];
  const tooClose = existingBugs.some((bug) => {
    if (!Array.isArray(bug?.pos)) return false;
    const dx = (bug.pos[0] ?? 0) - pos[0];
    const dz = (bug.pos[2] ?? 0) - pos[2];
    return Math.hypot(dx, dz) < 2;
  });
  if (tooClose) return null;

  const type = pickRandom(ACTIVE_BARRIER_TYPE_IDS);
  const comment = EXPANSION_BUG_COMMENT_BY_TYPE[type] ?? 'このあたりに不便を感じています。';

  return normalizeBug({
    id: `exp_bug_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    pos,
    type,
    solved: false,
    demographic: pickRandom(['あなた', '20代', '30代', '60代・男性', '70代・女性']),
    comment,
    isMine: false,
  });
};

export const createRemoteIslandChunk = (generationIndex = 0) => normalizeIslandChunk({
  id: generationIndex <= 0 ? 'remote_alpha' : `remote_gen${generationIndex}`,
  pos: getRemoteIslandBasePos(generationIndex),
  size: [CHUNK_SIZE, 0.6, CHUNK_SIZE],
  dropIn: true,
  kind: 'remote',
  remoteHub: true,
  remoteGeneration: generationIndex,
  linkedTo: generationIndex <= 0 ? 'center' : `remote_gen${generationIndex - 1}`,
});

export const createRemoteAccessBug = (remoteChunk, islandChunks = [], existingBugs = []) => {
  if (!remoteChunk?.pos) return null;
  const mainChunks = islandChunks.filter((chunk) => (chunk.kind ?? 'main') !== 'remote');
  const nearestMain = findNearestChunk(remoteChunk.pos, mainChunks);
  if (!nearestMain) return null;
  const edgePos = getEdgePosToward(nearestMain, remoteChunk.pos, islandChunks);
  if (!edgePos) return null;
  const pos = edgePos;
  const tooClose = existingBugs.some((bug) => {
    if (!Array.isArray(bug?.pos)) return false;
    const dx = (bug.pos[0] ?? 0) - pos[0];
    const dz = (bug.pos[2] ?? 0) - pos[2];
    return Math.hypot(dx, dz) < 2;
  });
  if (tooClose) return null;

  return normalizeBug({
    id: `remote_bug_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    pos,
    type: 'line_step_gap',
    solved: false,
    chosenPlan: 'transit_link',
    demographic: '島の住民',
    comment: '向こうの島への行き来が難しく、海沿いの移動が不便です。',
    isMine: false,
  });
};
