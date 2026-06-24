import { CHUNK_SIZE, GRID_STEP, FERRY_DOCK_SURFACE_Y } from '../constants/seaData';
import { getIslandTopYAt } from './terrainPlacement';
import { getChunkKindAtPos } from './barrierValidation';

export const snapFerryDockPos = (x, z, islandChunks = []) => {
  const snapX = Math.floor(x / GRID_STEP) * GRID_STEP + GRID_STEP / 2;
  const snapZ = Math.floor(z / GRID_STEP) * GRID_STEP + GRID_STEP / 2;
  const topY = getIslandTopYAt(snapX, snapZ, islandChunks);
  return [
    Number(snapX.toFixed(2)),
    Number((topY + FERRY_DOCK_SURFACE_Y).toFixed(2)),
    Number(snapZ.toFixed(2)),
  ];
};

const normalizeKind = (kind) => (kind === 'remote' ? 'remote' : 'main');

const edgePointOnChunk = (chunk, towardPos) => {
  const vx = (towardPos[0] ?? 0) - (chunk.pos[0] ?? 0);
  const vz = (towardPos[2] ?? 0) - (chunk.pos[2] ?? 0);
  const len = Math.hypot(vx, vz) || 1;
  const ux = vx / len;
  const uz = vz / len;
  const half = ((chunk.size?.[0] ?? CHUNK_SIZE) / 2) - 1.0;
  const x = (chunk.pos[0] ?? 0) + ux * half;
  const z = (chunk.pos[2] ?? 0) + uz * half;
  return {
    x,
    z,
    distToTarget: Math.hypot((towardPos[0] ?? 0) - x, (towardPos[2] ?? 0) - z),
  };
};

/** 島全体のうち、向かう側の最前線チャンクの岸辺に停船所を置く */
export const getLeadingEdgeDockPos = (islandChunks = [], kind = 'main', towardPos = null) => {
  if (!Array.isArray(towardPos) || towardPos.length < 3) return null;
  const targetKind = normalizeKind(kind);
  const chunks = islandChunks.filter((chunk) => normalizeKind(chunk?.kind) === targetKind);
  if (chunks.length === 0) return null;

  let bestEdge = null;
  chunks.forEach((chunk) => {
    const edge = edgePointOnChunk(chunk, towardPos);
    if (!bestEdge || edge.distToTarget < bestEdge.distToTarget) {
      bestEdge = edge;
    }
  });
  if (!bestEdge) return null;
  return snapFerryDockPos(bestEdge.x, bestEdge.z, islandChunks);
};

export const getEdgePosToward = (fromChunk, towardPos, islandChunks = []) => {
  if (!fromChunk?.pos || !Array.isArray(towardPos)) return null;
  const kind = fromChunk.kind === 'remote' ? 'remote' : 'main';
  return getLeadingEdgeDockPos(islandChunks, kind, towardPos);
};

const findPairTargetPos = (dock, docks, islandChunks) => {
  const kind = getChunkKindAtPos(dock?.pos, islandChunks);
  if (!kind) return null;
  const otherKind = kind === 'remote' ? 'main' : 'remote';
  const paired = docks
    .filter((candidate) => (
      candidate?.id !== dock?.id
      && getChunkKindAtPos(candidate?.pos, islandChunks) === otherKind
    ))
    .sort((a, b) => {
      const da = Math.hypot((dock.pos[0] ?? 0) - (a.pos[0] ?? 0), (dock.pos[2] ?? 0) - (a.pos[2] ?? 0));
      const db = Math.hypot((dock.pos[0] ?? 0) - (b.pos[0] ?? 0), (dock.pos[2] ?? 0) - (b.pos[2] ?? 0));
      return da - db;
    })[0];
  if (paired?.pos) return paired.pos;

  const fallbackChunks = islandChunks.filter((chunk) => normalizeKind(chunk?.kind) === otherKind);
  if (fallbackChunks.length === 0) return null;
  const cx = fallbackChunks.reduce((sum, chunk) => sum + (chunk.pos?.[0] ?? 0), 0) / fallbackChunks.length;
  const cz = fallbackChunks.reduce((sum, chunk) => sum + (chunk.pos?.[2] ?? 0), 0) / fallbackChunks.length;
  return [cx, 0, cz];
};

/** 離島拡張後も停船所が岸辺（島の最前線）に残るよう座標を更新 */
export const realignAllFerryDocks = (placedBlocks = [], islandChunks = []) => {
  const docks = placedBlocks.filter((block) => block?.shape === 'ferry_dock' && Array.isArray(block?.pos));
  if (docks.length === 0) return placedBlocks;

  const dockPosById = new Map();
  docks.forEach((dock) => {
    const kind = getChunkKindAtPos(dock.pos, islandChunks);
    const towardPos = findPairTargetPos(dock, docks, islandChunks);
    if (!kind || !towardPos) return;
    const nextPos = getLeadingEdgeDockPos(islandChunks, kind, towardPos);
    if (nextPos) dockPosById.set(dock.id, nextPos);
  });

  if (dockPosById.size === 0) return placedBlocks;
  return placedBlocks.map((block) => {
    if (block?.shape !== 'ferry_dock' || !dockPosById.has(block.id)) return block;
    return { ...block, pos: dockPosById.get(block.id) };
  });
};

export const getBoatSpawnFromDock = (dock, islandChunks = []) => {
  if (!dock?.pos) return null;
  const chunk = islandChunks.find((entry) => {
    if (!Array.isArray(entry?.pos) || !Array.isArray(entry?.size)) return false;
    const halfX = (entry.size[0] ?? CHUNK_SIZE) / 2;
    const halfZ = (entry.size[2] ?? CHUNK_SIZE) / 2;
    return Math.abs((dock.pos[0] ?? 0) - (entry.pos[0] ?? 0)) <= halfX
      && Math.abs((dock.pos[2] ?? 0) - (entry.pos[2] ?? 0)) <= halfZ;
  });
  let heading = 0;
  if (chunk) {
    const dx = (dock.pos[0] ?? 0) - (chunk.pos[0] ?? 0);
    const dz = (dock.pos[2] ?? 0) - (chunk.pos[2] ?? 0);
    if (Math.hypot(dx, dz) > 0.01) {
      heading = Math.atan2(dx, dz);
    }
  }
  const launchDist = 1.35;
  return {
    x: (dock.pos[0] ?? 0) + Math.sin(heading) * launchDist,
    z: (dock.pos[2] ?? 0) + Math.cos(heading) * launchDist,
    heading,
  };
};
