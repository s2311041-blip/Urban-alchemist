import { buildFerryRoutesFromDocks } from './ferryRoutes';

const isVec3Array = (v) => Array.isArray(v) && v.length >= 3;
const distance2D = (a, b) => {
  if (!isVec3Array(a) || !isVec3Array(b)) return Infinity;
  return Math.hypot((a[0] ?? 0) - (b[0] ?? 0), (a[2] ?? 0) - (b[2] ?? 0));
};
const GRID_STEP = 0.5;
const keyFor = (x, z) => `${x},${z}`;
const snapHalf = (v) => Math.round(v / GRID_STEP) * GRID_STEP;
const SCALE_RADIUS_MULTIPLIER = {
  point: 1,
  line: 1.35,
  area: 1.8,
};
const SCALE_PATH_REQUIREMENT = {
  point: { minNodeCount: 3, minLongestSteps: 2 },
  line: { minNodeCount: 5, minLongestSteps: 4 },
  area: { minNodeCount: 6, minLongestSteps: 5 },
};

export const getRadiusByScale = (scale = 'point', baseRadius = 6) => {
  const multiplier = SCALE_RADIUS_MULTIPLIER[scale] ?? SCALE_RADIUS_MULTIPLIER.point;
  return baseRadius * multiplier;
};

export const getBlocksNear = (pos, placedBlocks = [], radius = 6) => {
  if (!isVec3Array(pos)) return [];
  return placedBlocks.filter((block) => distance2D(pos, block?.pos) <= radius);
};

export const countShapesNear = (pos, placedBlocks = [], shapes = [], radius = 6) =>
  getBlocksNear(pos, placedBlocks, radius).filter((block) => shapes.includes(block.shape)).length;

export const hasShapeNear = (pos, placedBlocks = [], shapes = [], radius = 6, minCount = 1) =>
  countShapesNear(pos, placedBlocks, shapes, radius) >= minCount;

const collectPathNodesNear = (pos, placedBlocks = [], radius = 6) => {
  const nodes = new Map();
  getBlocksNear(pos, placedBlocks, radius)
    .filter((block) => block.shape === 'path')
    .forEach((block) => {
      const x = snapHalf(block.pos[0] ?? 0);
      const z = snapHalf(block.pos[2] ?? 0);
      nodes.set(keyFor(x, z), { x, z });
    });
  return nodes;
};

const getAdjacentKeys = (node) => [
  keyFor(node.x + GRID_STEP, node.z),
  keyFor(node.x - GRID_STEP, node.z),
  keyFor(node.x, node.z + GRID_STEP),
  keyFor(node.x, node.z - GRID_STEP),
];

const bfsLongestDistance = (startKey, nodes) => {
  const queue = [{ key: startKey, dist: 0 }];
  const visited = new Set([startKey]);
  let longest = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    longest = Math.max(longest, current.dist);
    const node = nodes.get(current.key);
    if (!node) continue;
    getAdjacentKeys(node).forEach((nextKey) => {
      if (!nodes.has(nextKey) || visited.has(nextKey)) return;
      visited.add(nextKey);
      queue.push({ key: nextKey, dist: current.dist + 1 });
    });
  }
  return longest;
};

export const hasDetourPath = (pos, placedBlocks = [], radius = 6, minNodeCount = 3, minLongestSteps = 2) => {
  if (!isVec3Array(pos)) return false;
  const nodes = collectPathNodesNear(pos, placedBlocks, radius);
  if (nodes.size < minNodeCount) return false;

  const startX = snapHalf(pos[0] ?? 0);
  const startZ = snapHalf(pos[2] ?? 0);
  let startKey = keyFor(startX, startZ);
  if (!nodes.has(startKey)) {
    // 最も近い path ノードを始点にする
    let bestKey = null;
    let bestDist = Infinity;
    nodes.forEach((node, nodeKey) => {
      const d = Math.hypot(node.x - (pos[0] ?? 0), node.z - (pos[2] ?? 0));
      if (d < bestDist) {
        bestDist = d;
        bestKey = nodeKey;
      }
    });
    startKey = bestKey;
  }
  if (!startKey) return false;

  const longest = bfsLongestDistance(startKey, nodes);
  return longest >= minLongestSteps;
};

export const hasDetourPathByScale = (pos, placedBlocks = [], scale = 'point', baseRadius = 6) => {
  const radius = getRadiusByScale(scale, baseRadius);
  const rule = SCALE_PATH_REQUIREMENT[scale] ?? SCALE_PATH_REQUIREMENT.point;
  return hasDetourPath(pos, placedBlocks, radius, rule.minNodeCount, rule.minLongestSteps);
};

export const countShapesNearByScale = (pos, placedBlocks = [], shapes = [], scale = 'point', baseRadius = 6) =>
  countShapesNear(pos, placedBlocks, shapes, getRadiusByScale(scale, baseRadius));

export const hasShapeNearByScale = (pos, placedBlocks = [], shapes = [], scale = 'point', baseRadius = 6, minCount = 1) =>
  hasShapeNear(pos, placedBlocks, shapes, getRadiusByScale(scale, baseRadius), minCount);

const isPointInChunk = (pos, chunk) => {
  if (!Array.isArray(pos) || !chunk || !Array.isArray(chunk.pos) || !Array.isArray(chunk.size)) return false;
  const halfX = (chunk.size[0] ?? 10) / 2;
  const halfZ = (chunk.size[2] ?? 10) / 2;
  return Math.abs((pos[0] ?? 0) - (chunk.pos[0] ?? 0)) <= halfX
    && Math.abs((pos[2] ?? 0) - (chunk.pos[2] ?? 0)) <= halfZ;
};

export const getChunkAtPos = (pos, islandChunks = []) => islandChunks.find((chunk) => isPointInChunk(pos, chunk)) ?? null;

export const getChunkKindAtPos = (pos, islandChunks = []) => {
  const chunk = getChunkAtPos(pos, islandChunks);
  if (!chunk) return null;
  return chunk.kind === 'remote' ? 'remote' : 'main';
};

export const hasFerryRoute = (
  _bug,
  placedBlocks = [],
  ferryRoutes = [],
  islandChunks = [],
) => {
  let activeRoutes = (Array.isArray(ferryRoutes) ? ferryRoutes : []).filter((route) => route?.status === 'active');
  if (activeRoutes.length === 0) {
    const generated = buildFerryRoutesFromDocks(placedBlocks, islandChunks, getChunkKindAtPos);
    activeRoutes = generated.filter((route) => route?.status === 'active');
  }
  if (activeRoutes.length === 0) return false;

  return activeRoutes.some((route) => {
    const stopIds = Array.isArray(route.stopIds) ? route.stopIds : [];
    const docks = stopIds
      .map((id) => placedBlocks.find((block) => block?.id === id && block?.shape === 'ferry_dock'))
      .filter(Boolean);
    if (docks.length < 2) return false;

    const kinds = new Set(docks.map((dock) => getChunkKindAtPos(dock.pos, islandChunks)).filter(Boolean));
    if (!kinds.has('main') || !kinds.has('remote')) return false;

    // 航路接続（本島↔離島）が成立していれば達成。停船所の再配置で不満地点から離れてもOK。
    return true
  });
};
