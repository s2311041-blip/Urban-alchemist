/**
 * フリー建築パレットの「場所プリセット配置」UI・操作を有効にするか。
 * false: 非表示（場所セットは不満投稿→島配置時のみ）
 * true:  従来どおりフリー建築からもプリセット配置可能（検証・デバッグ用）
 */
export const ENABLE_FREE_BUILD_PLACE_PRESETS = false;

export const ART_DIRECTION = {
  enabled: true,
  useBloom: false,
  useStylizedSky: false,
  useStylizedOcean: false,
  useVoxelMaterials: true,
  useIsometricGodView: false,
  useOrthographicGodView: false,
  useFlatShading: false,
  useNightSky: false,
  useUnifiedIslandSurface: false,
  useDioramaPedestal: false,
};
