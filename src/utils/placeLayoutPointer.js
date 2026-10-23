import { getIslandTopYAt } from './terrainPlacement';

export const LAYOUT_FOUNDATION_HEIGHT = 0.25;

export const objectIsPlaceLayoutSurface = (object) => {
  let node = object;
  while (node) {
    if (node.userData?.placeLayoutSurface) return true;
    node = node.parent ?? null;
  }
  return false;
};

const LAYOUT_BUILD_SURFACES = {
  station_layout: { size: [7, 22] },
  bus_stop_layout: { size: [5, 5] },
  plaza_layout: { size: [12, 12] },
  road_layout: { size: [14, 9] },
  lane_layout: { size: [5, 11] },
  park_layout: { size: [10, 9] },
  waterfront_layout: { size: [12, 10] },
  campus_layout: { size: [12, 12] },
  commerce_layout: { size: [14, 12] },
};

export const getLayoutBuildSurface = (shape) => LAYOUT_BUILD_SURFACES[shape] ?? null;

/**
 * レイキャスト結果に依存せず、XZ が場所プリセットの敷地内なら建築上の地面を返す。
 * 表示メッシュの結合・透明度・描画順に左右されない、配置ロジック側の当たり判定。
 */
export const findLayoutGroundAt = (point, blocks = [], islandChunks = []) => {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.z)) return null;
  for (const block of blocks) {
    const surface = getLayoutBuildSurface(block?.shape);
    if (!surface || !Array.isArray(block?.pos)) continue;
    const scaleX = Number.isFinite(block.scale?.[0]) && block.scale[0] !== 0 ? block.scale[0] : 1;
    const scaleZ = Number.isFinite(block.scale?.[2]) && block.scale[2] !== 0 ? block.scale[2] : 1;
    const angle = ((block.rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - block.pos[0];
    const dz = point.z - block.pos[2];
    const localX = (dx * cos + dz * sin) / scaleX;
    const localZ = (-dx * sin + dz * cos) / scaleZ;
    if (
      Math.abs(localX) <= surface.size[0] / 2
      && Math.abs(localZ) <= surface.size[1] / 2
    ) {
      return {
        block,
        y: getIslandTopYAt(point.x, point.z, islandChunks) + LAYOUT_FOUNDATION_HEIGHT,
      };
    }
  }
  return null;
};

/**
 * 島の上面がプリセット床と重なると、島が先に当たり判定を取る。
 * その場合でも、カーソル線上にあるプリセットの上向き面を配置面として使う。
 * より手前に通常ブロックがあるときは、そのブロックへの積み上げを優先する。
 */
export const selectLayoutSurfaceHit = (intersections, readNormal) => {
  const hits = Array.isArray(intersections) ? intersections : [];
  const explicitBuildHits = hits.filter((hit) => hit?.object?.userData?.layoutBuildSurface);
  const candidates = explicitBuildHits.length > 0 ? explicitBuildHits : hits;
  let best = null;
  for (const hit of candidates) {
    if (!hit?.object || !objectIsPlaceLayoutSurface(hit.object)) continue;
    const normal = readNormal(hit);
    if (!normal || !(normal.y > 0.1)) continue;
    if (!best || hit.distance < best.hit.distance) best = { hit, normal };
  }
  if (!best) return null;
  const blockedByCloserSolid = hits.some((hit) => (
    hit !== best.hit
    && Number.isFinite(hit?.distance)
    && hit.distance < best.hit.distance - 0.001
    && !hit.object?.userData?.islandSurface
    && !objectIsPlaceLayoutSurface(hit.object)
  ));
  return blockedByCloserSolid ? null : best;
};
