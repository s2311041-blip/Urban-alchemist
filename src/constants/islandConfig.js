/** 初期センター島。場所プリセット複数配置のため 18→42 に拡大。 */
export const DEFAULT_CENTER_ISLAND_SIZE = [42, 0.6, 42];
export const LEGACY_CENTER_ISLAND_SIZE = [18, 0.6, 18];
export const DEFAULT_CENTER_ISLAND_POS = [0, -0.3, 0];

export const createDefaultCenterIslandChunk = () => ({
  id: 'center',
  pos: [...DEFAULT_CENTER_ISLAND_POS],
  size: [...DEFAULT_CENTER_ISLAND_SIZE],
  dropIn: false,
});
