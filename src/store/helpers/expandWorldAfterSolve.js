import {
  REMOTE_ISLAND_TRIGGER_SOLVED,
  REMOTE_MAX_EXPANSION_LEVEL,
} from '../../constants/seaData';
import { realignAllFerryDocks } from '../../utils/ferryDockPlacement';
import {
  createExpansionBug,
  createExpansionTerrainBlock,
  createRemoteAccessBug,
  createRemoteIslandChunk,
  createRingExpansionChunks,
  getActiveRemoteHub,
} from './islandExpansion';
import { syncFerryRoutesForBlocks } from './syncFerryRoutes';

/**
 * 不満解決後の島拡張結果を計算（純関数）
 * @returns {null | object} applyExpansion 用パッチ + メタ
 */
export const computeWorldExpansionAfterSolve = ({
  updatedBugs,
  islandChunks,
  placedBlocks,
  solvedCount,
  activeRemoteHubId,
  remoteExpansionLevel: currentRemoteExpansionLevel,
  remoteIslandGeneration: currentRemoteGeneration,
}) => {
  if (solvedCount <= 0) return null;

  const hasRemoteIsland = islandChunks.some((chunk) => chunk.kind === 'remote');
  const shouldSpawnRemoteIsland = solvedCount >= REMOTE_ISLAND_TRIGGER_SOLVED && !hasRemoteIsland;

  let newChunks = [];
  let remoteChunks = [];
  let nextRemoteExpansionLevel = currentRemoteExpansionLevel;
  let nextRemoteGeneration = currentRemoteGeneration;
  let nextActiveRemoteHubId = activeRemoteHubId;
  let shouldSpawnNewRemoteHub = false;

  if (shouldSpawnRemoteIsland) {
    remoteChunks = [createRemoteIslandChunk(0)];
    nextRemoteGeneration = 1;
    nextRemoteExpansionLevel = 0;
    nextActiveRemoteHubId = remoteChunks[0].id;
  } else if (hasRemoteIsland) {
    const activeHub = getActiveRemoteHub(islandChunks, activeRemoteHubId);
    if (currentRemoteExpansionLevel >= REMOTE_MAX_EXPANSION_LEVEL) {
      nextRemoteGeneration = currentRemoteGeneration + 1;
      remoteChunks = [createRemoteIslandChunk(nextRemoteGeneration - 1)];
      nextRemoteExpansionLevel = 0;
      nextActiveRemoteHubId = remoteChunks[0].id;
      shouldSpawnNewRemoteHub = true;
    } else if (activeHub?.pos) {
      nextRemoteExpansionLevel = currentRemoteExpansionLevel + 1;
      newChunks = createRingExpansionChunks({
        centerX: activeHub.pos[0],
        centerZ: activeHub.pos[2],
        ringLevel: nextRemoteExpansionLevel,
        kind: 'remote',
        idPrefix: `remote_ring_${activeHub.id}_lvl${nextRemoteExpansionLevel}`,
        existingChunks: islandChunks,
        linkedTo: activeHub.id,
      });
    }
  } else {
    newChunks = createRingExpansionChunks({
      centerX: 0,
      centerZ: 0,
      ringLevel: solvedCount,
      kind: 'main',
      idPrefix: `chunk_lvl${solvedCount}`,
      existingChunks: islandChunks,
    });
  }

  const expansionChunks = shouldSpawnRemoteIsland || shouldSpawnNewRemoteHub
    ? remoteChunks
    : newChunks;

  const generatedTerrain = createExpansionTerrainBlock(expansionChunks, placedBlocks);
  const generatedBug = createExpansionBug(expansionChunks, updatedBugs);
  const remoteBug = shouldSpawnRemoteIsland
    ? createRemoteAccessBug(
      remoteChunks[0],
      [...islandChunks, ...newChunks, ...remoteChunks],
      generatedBug ? [generatedBug, ...updatedBugs] : updatedBugs,
    )
    : null;
  const nextBugs = [remoteBug, generatedBug, ...updatedBugs].filter(Boolean);
  const nextIslandChunks = [...islandChunks, ...newChunks, ...remoteChunks];
  const realignedBlocks = realignAllFerryDocks(placedBlocks, nextIslandChunks);
  const nextPlacedBlocks = generatedTerrain
    ? [...realignedBlocks, generatedTerrain]
    : realignedBlocks;
  const nextFerryRoutes = syncFerryRoutesForBlocks(nextPlacedBlocks, nextIslandChunks);

  const focusTarget = shouldSpawnRemoteIsland || shouldSpawnNewRemoteHub
    ? [remoteChunks[0]?.pos?.[0] ?? 0, 0.5, remoteChunks[0]?.pos?.[2] ?? 0]
    : newChunks[0]?.pos
      ? [newChunks[0].pos[0], 0.5, newChunks[0].pos[2]]
      : [0, 0.5, -2];

  return {
    patch: {
      bugs: nextBugs,
      islandChunks: nextIslandChunks,
      placedBlocks: nextPlacedBlocks,
      ferryRoutes: nextFerryRoutes,
      buildMode: null,
      hoverPosition: null,
      viewMode: 'god',
      expandingLevel: solvedCount,
      expansionFocusTarget: focusTarget,
      activeRemoteHubId: nextActiveRemoteHubId,
      remoteExpansionLevel: nextRemoteExpansionLevel,
      remoteIslandGeneration: nextRemoteGeneration,
      selectedEditBlockId: null,
      diagonalFirstPoint: null,
      buildFinishError: null,
    },
    meta: {
      shouldSpawnRemoteIsland,
      shouldSpawnNewRemoteHub,
      remoteChunks,
      solvedCount,
    },
  };
};

/** 離島出現トースト文 */
export const getRemoteIslandSpawnToast = (remoteChunks, shouldSpawnNewRemoteHub) => {
  const remotePos = remoteChunks[0]?.pos;
  if (!remotePos) return '離島が海の向こうに出現しました';
  if (shouldSpawnNewRemoteHub) {
    return `新しい離島が海の向こうに出現しました（x:${Math.round(remotePos[0])}, z:${Math.round(remotePos[2])}）。ここからまた島が広がっていきます`;
  }
  return `離島が海の向こうに出現しました（x:${Math.round(remotePos[0])}, z:${Math.round(remotePos[2])}）。本島の拡張はここで止まり、離島が育っていきます。海沿いの不満地点にフェリー停を置いてみよう`;
};
