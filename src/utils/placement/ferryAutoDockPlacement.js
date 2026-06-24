import { getChunkKindAtPos } from '../barrierValidation';
import {
  createAutoDockOnChunk,
  findNearestChunk,
  getActiveRemoteHub,
} from '../../store/helpers/islandExpansion';

/**
 * フェリー停配置時の対岸自動ドック
 * @returns {{ autoDockBlocks: object[], islandToast: string | null }}
 */
export const computeFerryAutoDockBlocks = ({
  newBlock,
  placedBlocks,
  islandChunks,
  activeRemoteHubId,
  selectedMaterial,
  selectedScale,
}) => {
  const autoDockBlocks = [];
  let islandToast = null;
  if (newBlock.shape !== 'ferry_dock') {
    return { autoDockBlocks, islandToast };
  }

  const draftBlocks = [...placedBlocks, newBlock];
  const originKind = getChunkKindAtPos(newBlock.pos, islandChunks);
  const remoteChunk = getActiveRemoteHub(islandChunks, activeRemoteHubId)
    ?? islandChunks.find((chunk) => chunk.kind === 'remote');
  const mainChunk = findNearestChunk(
    remoteChunk?.pos ?? [0, 0, 0],
    islandChunks.filter((chunk) => chunk.kind !== 'remote'),
  );
  const hasRemoteDock = draftBlocks.some(
    (block) => block.shape === 'ferry_dock' && getChunkKindAtPos(block.pos, islandChunks) === 'remote',
  );
  const hasMainDock = draftBlocks.some(
    (block) => block.shape === 'ferry_dock' && getChunkKindAtPos(block.pos, islandChunks) === 'main',
  );

  if (originKind === 'main' && remoteChunk && !hasRemoteDock) {
    const remoteDock = createAutoDockOnChunk({
      targetChunk: remoteChunk,
      towardPos: newBlock.pos,
      selectedMaterial,
      selectedScale,
      existingBlocks: draftBlocks,
      islandChunks,
    });
    if (remoteDock) {
      autoDockBlocks.push(remoteDock);
      islandToast = '向こうの離島の岸辺にもフェリー停を自動配置しました';
    }
  } else if (originKind === 'remote' && mainChunk && !hasMainDock) {
    const mainDock = createAutoDockOnChunk({
      targetChunk: mainChunk,
      towardPos: newBlock.pos,
      selectedMaterial,
      selectedScale,
      existingBlocks: draftBlocks,
      islandChunks,
    });
    if (mainDock) {
      autoDockBlocks.push(mainDock);
      islandToast = '本島の岸辺にもフェリー停を自動配置しました';
    }
  }

  return { autoDockBlocks, islandToast };
};
