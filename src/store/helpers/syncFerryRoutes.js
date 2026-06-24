import { buildFerryRoutesFromDocks } from '../../utils/ferryRoutes';
import { getChunkKindAtPos } from '../../utils/barrierValidation';

/** placedBlocks + islandChunks から ferryRoutes を再計算 */
export const syncFerryRoutesForBlocks = (placedBlocks, islandChunks) => (
  buildFerryRoutesFromDocks(placedBlocks, islandChunks, getChunkKindAtPos)
);

/** set 用: 配置変更とルート同期をまとめて適用 */
export const setPlacedBlocksWithFerryRoutes = (set, placedBlocks, islandChunks, extra = {}) => {
  set({
    placedBlocks,
    ferryRoutes: syncFerryRoutesForBlocks(placedBlocks, islandChunks),
    ...extra,
  });
};

/** set((state)=>…) 用 */
export const patchStateWithFerryRoutes = (state, placedBlocks, extra = {}) => ({
  ...state,
  placedBlocks,
  ferryRoutes: syncFerryRoutesForBlocks(placedBlocks, state.islandChunks),
  ...extra,
});
