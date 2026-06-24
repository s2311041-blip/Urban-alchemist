/** 拡張タイル一辺（旧 10m → 14m） */
export const CHUNK_SIZE = 14;
/** 隣接チャンクの描画継ぎ目対策（わずかに食い込ませる） */
export const CHUNK_SEAM_OVERLAP = 0.06;
export const GRID_STEP = 0.5;
export const ISLAND_HALF_SIZE = CHUNK_SIZE / 2;
export const FERRY_DOCK_SURFACE_Y = 0.25;

/** 本島リング拡張はこの解決数まで。以降は離島へ。 */
export const REMOTE_ISLAND_TRIGGER_SOLVED = 4;
export const REMOTE_MAX_EXPANSION_LEVEL = 3;
export const REMOTE_ISLAND_BASE_POS = [96, -0.3, 48];

export const getRemoteIslandBasePos = (generationIndex = 0) => {
  if (generationIndex <= 0) return [...REMOTE_ISLAND_BASE_POS];
  const angle = ((generationIndex * 68) % 360) * Math.PI / 180;
  const dist = 88 + generationIndex * 14;
  return [
    Number((Math.cos(angle) * dist).toFixed(1)),
    -0.3,
    Number((Math.sin(angle) * dist).toFixed(1)),
  ];
};
