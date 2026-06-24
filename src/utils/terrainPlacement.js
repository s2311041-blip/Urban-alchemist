import { normalizeTerrainShape } from '../constants/terrainData';
import { CLIFF_GROUND_Y } from '../components/3d/terrain/cliffGeometry';

const GRID_STEP = 0.5;
const CONTACT_EPS = 0.02;
const SINK = 0.24;

/**
 * ローカル座標での最下点（group scale の Y を掛けたとき、世界座標の下端 = pos.y + localY * scaleY）
 */
export const TERRAIN_BOTTOM_LOCAL_Y = {
  pond_tile: -(SINK + 0.02),
  stream_tile: -(SINK + 0.02),
  waterfall: -(SINK + 0.02),
  beach_tile: -(SINK + 0.02),
  bog_tile: -(SINK + 0.02),
  rock_field: -(SINK + 0.02),
  cliff_face: CLIFF_GROUND_Y - 0.05,
  hill: -0.32,
  mountain: -0.32,
};

export const isOnIsland = (x, z, islandChunks = []) => islandChunks.some((chunk) => {
  const halfX = (chunk.size?.[0] ?? 10) / 2;
  const halfZ = (chunk.size?.[2] ?? 10) / 2;
  return Math.abs(x - chunk.pos[0]) <= halfX && Math.abs(z - chunk.pos[2]) <= halfZ;
});

export const getIslandTopYAt = (x, z, islandChunks = []) => {
  const hit = islandChunks.find((chunk) => {
    const halfX = (chunk.size?.[0] ?? 10) / 2;
    const halfZ = (chunk.size?.[2] ?? 10) / 2;
    return Math.abs(x - chunk.pos[0]) <= halfX && Math.abs(z - chunk.pos[2]) <= halfZ;
  });
  if (!hit) return 0;
  const cy = Number.isFinite(hit.pos?.[1]) ? hit.pos[1] : -0.3;
  const ch = Number.isFinite(hit.size?.[1]) ? hit.size[1] : 0.6;
  return Number((cy + ch / 2).toFixed(3));
};

/** 地形メッシュの下端が島上面に乗る配置中心Y */
export const computeTerrainPlacementY = (shape, scale, islandTopY = 0) => {
  const normalized = normalizeTerrainShape(shape);
  const bottomLocal = TERRAIN_BOTTOM_LOCAL_Y[normalized] ?? -(SINK + 0.02);
  const sy = Array.isArray(scale) && Number.isFinite(scale[1]) ? scale[1] : 1;

  // bottomLocal は負: worldBottom = pos.y + bottomLocal * sy
  const required = islandTopY - bottomLocal * sy + CONTACT_EPS;
  const snapY = Math.floor(required / GRID_STEP) * GRID_STEP + GRID_STEP / 2;
  return Number(Math.max(required, snapY).toFixed(3));
};

export const snapTerrainPosition = (shape, scale, x, z, islandChunks = []) => {
  const topY = getIslandTopYAt(x, z, islandChunks);
  const y = computeTerrainPlacementY(shape, scale, topY);
  const grid = GRID_STEP;
  return [
    Math.floor(x / grid) * grid + grid / 2,
    y,
    Math.floor(z / grid) * grid + grid / 2,
  ];
};
