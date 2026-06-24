import { isAgriShape } from '../../constants/agriData';
import { normalizeEconomy } from '../../constants/economyData';
import {
  normalizeFarmingProgress,
} from '../../constants/farmingProgressData';
import { isTerrainShape, normalizeTerrainShape } from '../../constants/terrainData';
import {
  DEFAULT_WORLD_TIME,
  WORLD_TIME_SPEED_OPTIONS,
  getSeasonFromDay,
  normalizeTimeOfDay,
} from '../../constants/worldTimeConfig';
import { normalizeAgriState } from '../../utils/agriGrowth';
import { getIslandTopYAt, snapTerrainPosition } from '../../utils/terrainPlacement';
import { normalizeBug, normalizeGoodSpot, normalizeQuest } from './bugFactory';
import {
  createDefaultCenterIslandChunk,
  DEFAULT_CENTER_ISLAND_SIZE,
  LEGACY_CENTER_ISLAND_SIZE,
} from '../../constants/islandConfig';
import { migrateMainIslandChunkLayout, normalizeIslandChunk } from './islandExpansion';

export const SAVE_KEY = 'urban-alchemist-save-v8';
export const FAV_KEY = 'urban_alchemist_favorites_v1';

export const createDefaultIslandChunks = () => ([
  normalizeIslandChunk(createDefaultCenterIslandChunk()),
]);

export const createDefaultFavorites = () => ([
  { id: 1, label: '大黒柱', shape: 'pole', material: 'wood', scale: [1, 3, 1], rotation: 0 },
  { id: 2, label: 'ガラス窓', shape: 'block', material: 'glass', scale: [0.1, 2, 2], rotation: 0 },
  { id: 3, label: '芝生広場', shape: 'path', material: 'grass', scale: [3, 1, 3], rotation: 0 }
]);

export const loadSavedData = () => {
  try {
    if (typeof localStorage === 'undefined') return null;
  } catch {
    return null;
  }
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (!data || typeof data !== 'object') return null;

      // 1. placedBlocks バリデーション
      if (Array.isArray(data.placedBlocks)) {
        data.placedBlocks = data.placedBlocks.filter(b => {
          if (!b || typeof b !== 'object') return false;
          
          const hasValidPos = b.pos && 
            Array.isArray(b.pos) && 
            b.pos.length === 3 && 
            b.pos.every(Number.isFinite);
          if (!hasValidPos) return false;

          if (b.scale) {
            const hasValidScale = Array.isArray(b.scale) && 
              b.scale.length === 3 && 
              b.scale.every(Number.isFinite);
            if (!hasValidScale) return false;
          } else {
            b.scale = [1, 1, 1];
          }

          if (!Number.isFinite(b.rotation)) {
            b.rotation = 0;
          }

          return true;
        }).map(b => {
          if (b.shape === 'diagonal') {
            const hasValidPoints = b.diagonalPoints &&
              Array.isArray(b.diagonalPoints) &&
              b.diagonalPoints.length === 2 &&
              Array.isArray(b.diagonalPoints[0]) &&
              Array.isArray(b.diagonalPoints[1]) &&
              b.diagonalPoints[0].length === 3 &&
              b.diagonalPoints[1].length === 3 &&
              b.diagonalPoints[0].every(Number.isFinite) &&
              b.diagonalPoints[1].every(Number.isFinite);
            
            if (!hasValidPoints) {
              const px = b.pos[0];
              const py = b.pos[1];
              const pz = b.pos[2];
              return {
                ...b,
                pos: [px, py, pz],
                diagonalPoints: [
                  [px - 0.25, py - 0.25, pz - 0.25],
                  [px + 0.25, py + 0.25, pz + 0.25]
                ]
              };
            }
          }
          if (b.shape === 'mountain') {
            return { ...b, shape: 'hill' };
          }
          if (isAgriShape(b.shape)) {
            return {
              ...b,
              agri: normalizeAgriState(b.shape, b.agri ?? {}, data.worldTime?.dayIndex ?? 0),
            };
          }
          return b;
        });
      } else {
        data.placedBlocks = [];
      }

      // 2. bugs バリデーション
      if (Array.isArray(data.bugs)) {
        data.bugs = data.bugs
          .filter(b => b && typeof b === 'object' && b.id && b.pos && Array.isArray(b.pos) && b.pos.length === 3 && b.pos.every(Number.isFinite))
          .map((b) => normalizeBug(b))
          .filter(Boolean);
      } else {
        data.bugs = [];
      }

      // 3. quests バリデーション
      if (Array.isArray(data.quests)) {
        data.quests = data.quests
          .filter((q) => {
            if (!q || typeof q !== 'object') return false;
            if (q.pos) {
              return Array.isArray(q.pos) && q.pos.length === 3 && q.pos.every(Number.isFinite);
            }
            return !!q.id;
          })
          .map((q) => normalizeQuest(q))
          .filter(Boolean);
      } else {
        data.quests = [];
      }

      // 4. recentDiagonals バリデーション
      if (Array.isArray(data.recentDiagonals)) {
        data.recentDiagonals = data.recentDiagonals.filter(rd => {
          return Array.isArray(rd) && rd.length === 2 &&
                 Array.isArray(rd[0]) && rd[0].length === 3 && rd[0].every(Number.isFinite) &&
                 Array.isArray(rd[1]) && rd[1].length === 3 && rd[1].every(Number.isFinite);
        });
      } else {
        data.recentDiagonals = [];
      }

      // 5. islandChunks バリデーション
      if (Array.isArray(data.islandChunks)) {
        data.islandChunks = data.islandChunks.filter(c => {
          if (!c || typeof c !== 'object') return false;
          const hasValidPos = c.pos && Array.isArray(c.pos) && c.pos.length === 3 && c.pos.every(Number.isFinite);
          const hasValidSize = c.size && Array.isArray(c.size) && c.size.length === 3 && c.size.every(Number.isFinite);
          return hasValidPos && hasValidSize;
        });
        if (data.islandChunks.length === 0) {
          data.islandChunks = [normalizeIslandChunk(createDefaultCenterIslandChunk())];
        }
        data.islandChunks = data.islandChunks.map((chunk, idx) => {
          const normalized = normalizeIslandChunk(chunk, `chunk_${idx}`);
          if (normalized.id !== 'center' || !Array.isArray(normalized.size)) return normalized;
          const isLegacyCenter = normalized.size[0] <= LEGACY_CENTER_ISLAND_SIZE[0]
            && normalized.size[2] <= LEGACY_CENTER_ISLAND_SIZE[2];
          if (!isLegacyCenter) return normalized;
          return {
            ...normalized,
            size: [...DEFAULT_CENTER_ISLAND_SIZE],
          };
        });
        data.islandChunks = migrateMainIslandChunkLayout(data.islandChunks);
      } else {
        data.islandChunks = [normalizeIslandChunk(createDefaultCenterIslandChunk())];
      }

      // 5.5 ferryRoutes バリデーション
      if (Array.isArray(data.ferryRoutes)) {
        data.ferryRoutes = data.ferryRoutes
          .filter((route) => route && typeof route === 'object')
          .map((route) => ({
            id: typeof route.id === 'string' ? route.id : `route_${Math.random().toString(36).slice(2, 8)}`,
            status: route.status === 'planned' ? 'planned' : 'active',
            stopIds: Array.isArray(route.stopIds)
              ? route.stopIds.filter((id) => typeof id === 'string').slice(0, 8)
              : [],
            chunkKinds: Array.isArray(route.chunkKinds)
              ? route.chunkKinds.filter((kind) => kind === 'main' || kind === 'remote')
              : [],
          }))
          .filter((route) => route.stopIds.length >= 1);
      } else {
        data.ferryRoutes = [];
      }

      // 6. worldTime バリデーション
      if (!data.worldTime || typeof data.worldTime !== 'object') {
        data.worldTime = { ...DEFAULT_WORLD_TIME };
      } else {
        const rawDay = Number.isFinite(data.worldTime.dayIndex) ? Math.max(0, Math.floor(data.worldTime.dayIndex)) : DEFAULT_WORLD_TIME.dayIndex;
        const rawSpeed = WORLD_TIME_SPEED_OPTIONS.includes(data.worldTime.speed) ? data.worldTime.speed : DEFAULT_WORLD_TIME.speed;
        const rawTime = normalizeTimeOfDay(data.worldTime.timeOfDay);
        data.worldTime = {
          dayIndex: rawDay,
          timeOfDay: rawTime,
          season: getSeasonFromDay(rawDay),
          paused: !!data.worldTime.paused,
          speed: rawSpeed,
        };
      }
      data.pauseTimeInBuildMode = data.pauseTimeInBuildMode ?? true;

      // 6.5 farmingProgress バリデーション
      data.farmingProgress = normalizeFarmingProgress(data.farmingProgress);
      data.economy = normalizeEconomy(data.economy);
      if (Array.isArray(data.goodSpots)) {
        data.goodSpots = data.goodSpots.map((spot) => normalizeGoodSpot(spot)).filter(Boolean);
      } else {
        data.goodSpots = [];
      }

      // 7. 地形ブロックのYを島上面に合わせて補正（スケールで下端が沈む問題の救済）
      if (Array.isArray(data.placedBlocks) && Array.isArray(data.islandChunks)) {
        data.placedBlocks = data.placedBlocks.map((b) => {
          if (!isTerrainShape(b.shape)) return b;
          const terrainShape = normalizeTerrainShape(b.shape);
          const scale = Array.isArray(b.scale) ? b.scale : [1, 1, 1];
          const pos = snapTerrainPosition(terrainShape, scale, b.pos[0], b.pos[2], data.islandChunks);
          if (Math.abs((b.pos[1] ?? 0) - pos[1]) < 0.01) return b;
          return { ...b, pos };
        }).filter((b) => !(isAgriShape(b.shape) && b.agri?.vanished));
      }

      // 8. 樹木系（街路樹・日陰樹）の旧Y座標を地面接地へ補正
      if (Array.isArray(data.placedBlocks) && Array.isArray(data.islandChunks)) {
        data.placedBlocks = data.placedBlocks.map((b) => {
          if (b.shape !== 'street_tree' && b.shape !== 'canopy_tree') return b;
          const sy = Array.isArray(b.scale) && Number.isFinite(b.scale[1]) ? b.scale[1] : 1;
          const topY = getIslandTopYAt(b.pos[0], b.pos[2], data.islandChunks);
          const treeBottomLocal = b.shape === 'canopy_tree' ? -0.27 : -0.21;
          const y = Number((topY - treeBottomLocal * sy + 0.01).toFixed(3));
          if (Math.abs((b.pos[1] ?? 0) - y) < 0.01) return b;
          return { ...b, pos: [b.pos[0], y, b.pos[2]] };
        });
      }

      return data;
    } catch(e) {
      console.error("Save data parse error", e);
      try {
        localStorage.removeItem(SAVE_KEY);
      } catch (_) {
        // ignore localStorage cleanup failures
      }
    }
  }
  return null;
};

export const loadFavorites = () => {
  const saved = localStorage.getItem(FAV_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(f => {
          if (!f || typeof f !== 'object') return false;
          if (f.scale) {
            const hasValidScale = Array.isArray(f.scale) && f.scale.length === 3 && f.scale.every(Number.isFinite);
            if (!hasValidScale) return false;
          } else {
            f.scale = [1, 1, 1];
          }
          if (!Number.isFinite(f.rotation)) {
            f.rotation = 0;
          }
          return true;
        });
      }
    } catch (_e) {
      try {
        localStorage.removeItem(FAV_KEY);
      } catch (_e) {
        // ignore localStorage cleanup failures
      }
    }
  }
  return createDefaultFavorites();
};
