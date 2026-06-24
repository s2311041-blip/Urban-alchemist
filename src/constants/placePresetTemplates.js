/**
 * 場所プリセット骨格（space_priset 参照画像ベース）。
 * 既存 Block shape の組み合わせ。専用メッシュは今後追加。
 */
export const PLACE_PRESET_TEMPLATES = {
  /**
   * 参照: 駅.png ＋ バス停・駅前.png
   * 動線: ホーム(北・線路側) → 階段 → 室内改札 → 駅舎 → 出入り口 → 駅前広場
   * 配置の +Z = 駅前（南）方向
   */
  station: {
    base: [
      { shape: 'station_layout', material: 'stone', offset: [0, 0], scale: [1, 1, 1] },
      { shape: 'path', material: 'stone', offset: [0, 12.25], scale: [9, 1, 4.5] },
      { shape: 'path', material: 'light', offset: [0, 10.55], scale: [1.2, 1, 5.5] },
      { shape: 'path', material: 'light', offset: [-2.5, 10.75], scale: [0.6, 1, 3] },
      { shape: 'path', material: 'light', offset: [2.5, 10.75], scale: [0.6, 1, 3] },
      { shape: 'bench', material: 'wood', offset: [-3.5, 10.25], scale: [1, 1, 1] },
      { shape: 'bench', material: 'wood', offset: [3.5, 10.25], scale: [1, 1, 1] },
      { shape: 'light_pole', material: 'iron', offset: [-4.2, 11.25], scale: [1, 1, 1] },
      { shape: 'light_pole', material: 'iron', offset: [4.2, 11.25], scale: [1, 1, 1] },
      { shape: 'sign_post', material: 'wood', offset: [3.8, 9.25], scale: [1.1, 1, 1] },
    ],
    accents: {
      P: [
        { shape: 'half', material: 'stone', offset: [-3.2, -1.8], scale: [1.2, 1, 1] },
        { shape: 'half', material: 'stone', offset: [2.8, 11.55], scale: [1, 1, 1] },
      ],
      I: [{ shape: 'sign_post', material: 'wood', offset: [-3.8, 9.25], scale: [1.1, 1, 1] }],
      V: [{ shape: 'light_pole', material: 'iron', offset: [0, 12.25], scale: [1, 1, 1] }],
      L: [{ shape: 'station_stairs', material: 'stone', offset: [2.5, 0.5], scale: [1, 1, 1] }],
      S: [{ shape: 'bench', material: 'wood', offset: [0, 11.75], scale: [1.2, 1, 1] }],
    },
  },

  /**
   * 参照: バス停・駅前.png
   * 動線: 歩道接続(-Z) → 待合スペース → 車線縁(+Z)
   */
  bus_stop: {
    base: [
      { shape: 'bus_stop_layout', material: 'stone', offset: [0, 0], scale: [1, 1, 1] },
      { shape: 'path', material: 'stone', offset: [0, -2.2], scale: [4.5, 1, 2] },
      { shape: 'path', material: 'stone', offset: [0, 2.5], scale: [6, 1, 2.2] },
      { shape: 'path', material: 'light', offset: [0, 1.2], scale: [0.5, 1, 3.5] },
    ],
    accents: {
      P: [
        { shape: 'half', material: 'stone', offset: [2.2, 2.2], scale: [1.2, 1, 1] },
        { shape: 'half', material: 'stone', offset: [-2, -2.5], scale: [1, 1, 1] },
      ],
      I: [{ shape: 'sign_post', material: 'wood', offset: [-2.8, -1.8], scale: [1, 1, 1] }],
      R: [{ shape: 'bench', material: 'wood', offset: [2, -0.8], scale: [1, 1, 1] }],
      V: [{ shape: 'light_pole', material: 'iron', offset: [-2.8, 2], scale: [1, 1, 1] }],
      S: [{ shape: 'flower', material: 'grass', offset: [2.5, -1.5], scale: [1, 1, 1] }],
    },
  },

  /**
   * 参照: バス停・駅前.png
   * 動線: 駅・時計塔(-Z) → 歩行者広場 → ロータリー車道(+Z)
   */
  plaza: {
    base: [
      { shape: 'plaza_layout', material: 'stone', offset: [0, 0], scale: [1, 1, 1] },
      { shape: 'path', material: 'stone', offset: [0, -6.5], scale: [6, 1, 3] },
      { shape: 'path', material: 'stone', offset: [-5.5, 0], scale: [2.2, 1, 7] },
      { shape: 'path', material: 'stone', offset: [5.5, 0], scale: [2.2, 1, 7] },
      { shape: 'path', material: 'stone', offset: [0, 7.5], scale: [8, 1, 2.5] },
    ],
    accents: {
      R: [{ shape: 'bench', material: 'wood', offset: [-3.5, 0.5], scale: [1, 1, 1] }],
      P: [{ shape: 'half', material: 'stone', offset: [3.8, 2.8], scale: [1.2, 1, 1] }],
      M: [{ shape: 'block', material: 'brick', offset: [2.8, 1.2], scale: [0.5, 0.4, 0.5] }],
      S: [{ shape: 'light_pole', material: 'iron', offset: [0, 2.8], scale: [0.8, 1, 0.8] }],
      I: [{ shape: 'sign_post', material: 'wood', offset: [-3.5, 2.5], scale: [1, 1, 1] }],
    },
  },

  /**
   * 参照: 道路.png
   * 主軸 X（東西）、Z=0 が車道。歩道は南北、中央に横断歩道
   */
  road: {
    base: [
      { shape: 'road_layout', material: 'stone', offset: [0, 0], scale: [1, 1, 1] },
      { shape: 'path', material: 'stone', offset: [-9, 0], scale: [3, 1, 2.5] },
      { shape: 'path', material: 'stone', offset: [9, 0], scale: [3, 1, 2.5] },
      { shape: 'path', material: 'stone', offset: [0, 4.5], scale: [3.5, 1, 2.5] },
    ],
    accents: {
      P: [{ shape: 'half', material: 'stone', offset: [0, -2.5], scale: [1.2, 1, 1] }],
      V: [{ shape: 'light_pole', material: 'iron', offset: [-6, -2.8], scale: [1, 1, 1] }],
      I: [{ shape: 'sign_post', material: 'wood', offset: [4, 2.8], scale: [1, 1, 1] }],
      S: [{ shape: 'bench', material: 'wood', offset: [-2, 2.5], scale: [1, 1, 1] }],
    },
  },

  /**
   * 参照: 街区道.png
   * 主軸 Z（路地の奥行き）、両側に店舗・住宅が立ち並ぶ細道
   */
  lane: {
    base: [
      { shape: 'lane_layout', material: 'stone', offset: [0, 0], scale: [1, 1, 1] },
    ],
    accents: {
      V: [{ shape: 'half', material: 'stone', offset: [0, -4.5], scale: [1.2, 1, 1] }],
      S: [{ shape: 'block', material: 'iron', offset: [0, 3.8], scale: [0.5, 1.2, 0.5] }],
      P: [{ shape: 'half', material: 'stone', offset: [0, 2.2], scale: [1.2, 1, 1] }],
      C: [{ shape: 'bench', material: 'wood', offset: [0.6, -1.2], scale: [1, 1, 1] }],
    },
  },

  /**
   * 参照: 学校.png
   * 校舎外観・校門・通学路・横断歩道・校庭（校内は作らない）
   */
  campus: {
    base: [
      { shape: 'campus_layout', material: 'stone', offset: [0, 0], scale: [1, 1, 1] },
    ],
    accents: {
      P: [{ shape: 'half', material: 'stone', offset: [3.2, -1.15], scale: [1.2, 1, 1] }],
      V: [{ shape: 'light_pole', material: 'iron', offset: [0, -3.5], scale: [1, 1, 1] }],
      C: [{ shape: 'bench', material: 'wood', offset: [-2.5, 0.5], scale: [1, 1, 1] }],
      I: [{ shape: 'sign_post', material: 'wood', offset: [-2.8, 1.8], scale: [1, 1, 1] }],
    },
  },

  /**
   * 参照: 公園.jpg
   * 芝生・遊具・桜・花壇・ベンチ
   */
  park: {
    base: [
      { shape: 'park_layout', material: 'grass', offset: [0, 0], scale: [1, 1, 1] },
    ],
    accents: {
      M: [{ shape: 'path', material: 'sand', offset: [3.5, -2], scale: [1.5, 1, 1] }],
      R: [{ shape: 'bench', material: 'wood', offset: [-1, 3.2], scale: [1, 1, 1] }],
      V: [{ shape: 'light_pole', material: 'iron', offset: [3.5, 3], scale: [1, 1, 1] }],
      S: [{ shape: 'light_pole', material: 'iron', offset: [-3.5, -3], scale: [1, 1, 1] }],
    },
  },

  /**
   * 水辺：池＋曲がった川、護岸・木橋・遊歩道
   */
  waterfront: {
    base: [
      { shape: 'waterfront_layout', material: 'stone', offset: [0, 0], scale: [1, 1, 1] },
    ],
    accents: {
      L: [{ shape: 'half', material: 'stone', offset: [2.5, 4], scale: [1.2, 1, 1] }],
      V: [{ shape: 'light_pole', material: 'iron', offset: [-3.5, -2.5], scale: [1, 1, 1] }],
      R: [{ shape: 'bench', material: 'wood', offset: [3.5, 2], scale: [1, 1, 1] }],
      M: [{ shape: 'path', material: 'sand', offset: [-3.5, 2.5], scale: [1.5, 1, 1] }],
    },
  },

  /**
   * 参照: 商業施設.avif
   * 柏の葉ららぽーと風（白壁・テナント看板・駅前動線・needType 演出）
   */
  commerce: {
    base: [
      { shape: 'commerce_layout', material: 'stone', offset: [0, 0], scale: [1, 1, 1] },
    ],
    accents: {
      I: [
        { shape: 'sign_post', material: 'wood', offset: [-0.5, -1.2], scale: [1, 1, 1] },
        { shape: 'sign_post', material: 'wood', offset: [2.2, -0.5], scale: [0.9, 1, 0.9] },
      ],
      R: [{ shape: 'path', material: 'sand', offset: [0, -2.2], scale: [2.2, 1, 1] }],
      M: [{ shape: 'path', material: 'sand', offset: [5.9, 3.4], scale: [1.1, 1, 0.9] }],
      P: [{ shape: 'half', material: 'stone', offset: [0, -3.5], scale: [1.3, 1, 1] }],
      S: [{ shape: 'block', material: 'iron', offset: [6.0, 3.6], scale: [0.6, 1.2, 0.5] }],
      V: [{ shape: 'light_pole', material: 'iron', offset: [5.9, 2.8], scale: [0.7, 1, 0.7] }],
    },
  },
};
