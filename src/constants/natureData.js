export const NATURE_CATEGORIES = {
  DECORATE: 'decorate',
  COMFORT:  'comfort',
};

export const NATURE_SHAPES = ['flower', 'shrub', 'turf', 'hedge', 'street_tree', 'canopy_tree'];
export const NATURE_COLORABLE_SHAPES = ['flower', 'shrub', 'street_tree', 'canopy_tree'];

export const isNatureShape = (shape) => NATURE_SHAPES.includes(shape);
export const isColorableNatureShape = (shape) => NATURE_COLORABLE_SHAPES.includes(shape);

export const DEFAULT_NATURE_COLORS = {
  flower: '#ef5350',
  shrub: '#4caf50',
  street_tree: '#388e3c',
  canopy_tree: '#2e7d32',
};

/** 種別ごとのバリエーション定義（カラーの根拠はここだけで管理する） */
export const SPECIES = {
  flower: [
    { id: 'flower_red',    label: '赤', stemColor: '#4caf50', headColor: '#ef5350', swatch: '#ef5350' },
    { id: 'flower_white',  label: '白', stemColor: '#4caf50', headColor: '#f5f5f5', swatch: '#f5f5f5' },
    { id: 'flower_purple', label: '紫', stemColor: '#66bb6a', headColor: '#9c27b0', swatch: '#9c27b0' },
    { id: 'flower_yellow', label: '黄', stemColor: '#66bb6a', headColor: '#fdd835', swatch: '#fdd835' },
  ],
  shrub: [
    { id: 'shrub_green',  label: '緑',   baseColor: '#5d4037', leafColor: '#4caf50', swatch: '#4caf50' },
    { id: 'shrub_lime',   label: '黄緑', baseColor: '#5d4037', leafColor: '#8bc34a', swatch: '#8bc34a' },
    { id: 'shrub_pink',   label: '桃',   baseColor: '#5d4037', leafColor: '#ec407a', swatch: '#ec407a' },
    { id: 'shrub_purple', label: '紫',   baseColor: '#5d4037', leafColor: '#ab47bc', swatch: '#ab47bc' },
  ],
  turf: [
    { id: 'normal', label: '芝生',       color: '#66bb6a' },
    { id: 'clover', label: 'クローバー', color: '#43a047', accentColor: '#7cb342' },
  ],
  hedge: [
    { id: 'normal',  label: '垣根',       color: '#2e7d32' },
    { id: 'trimmed', label: '刈込み垣根', color: '#388e3c' },
  ],
  street_tree: [
    { id: 'tree_green',  label: '緑', trunkColor: '#5d4037', crownColor: '#388e3c', swatch: '#388e3c' },
    { id: 'tree_pink',   label: '桃', trunkColor: '#6d4c41', crownColor: '#f48fb1', swatch: '#f48fb1' },
    { id: 'tree_deep',   label: '深緑', trunkColor: '#4e342e', crownColor: '#1b5e20', swatch: '#1b5e20' },
    { id: 'tree_orange', label: '橙', trunkColor: '#5d4037', crownColor: '#e64a19', swatch: '#e64a19' },
  ],
  canopy_tree: [
    { id: 'canopy_green',  label: '緑', trunkColor: '#4e342e', crownColor: '#2e7d32', swatch: '#2e7d32' },
    { id: 'canopy_autumn', label: '紅葉', trunkColor: '#5d4037', crownColor: '#e64a19', swatch: '#e64a19' },
    { id: 'canopy_blue',   label: '青緑', trunkColor: '#4e342e', crownColor: '#00897b', swatch: '#00897b' },
  ],
};

/** パレット表示・デフォルト値などのメタ情報 */
export const SHAPE_META = {
  flower:      { label: '草花',   icon: '🌸', category: NATURE_CATEGORIES.DECORATE, defaultScale: [1, 1, 1],   defaultMaterial: 'grass' },
  shrub:       { label: '低木',   icon: '🌿', category: NATURE_CATEGORIES.DECORATE, defaultScale: [1, 1, 1],   defaultMaterial: 'grass' },
  turf:        { label: '芝生',   icon: '🟩', category: NATURE_CATEGORIES.DECORATE, defaultScale: [1, 1, 1],   defaultMaterial: 'grass' },
  hedge:       { label: '垣根',   icon: '🌳', category: NATURE_CATEGORIES.DECORATE, defaultScale: [1, 1, 1],   defaultMaterial: 'grass' },
  // 低木との差を保ちつつ、大きすぎない快適・安全系の木サイズ
  street_tree: { label: '街路樹', icon: '🌲', category: NATURE_CATEGORIES.COMFORT,  defaultScale: [2.5, 2.5, 2.5], defaultMaterial: 'wood'  },
  canopy_tree: { label: '日陰樹', icon: '🌳', category: NATURE_CATEGORIES.COMFORT,  defaultScale: [2.8, 2.8, 2.8], defaultMaterial: 'wood'  },
};
