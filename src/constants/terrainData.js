export const TERRAIN_SHAPES = [
  'pond_tile',
  'stream_tile',
  'waterfall',
  'hill',
  'beach_tile',
  'bog_tile',
  'cliff_face',
  'rock_field',
];

export const TERRAIN_CONNECTABLE_SHAPES = ['pond_tile', 'stream_tile'];
export const TERRAIN_COLORABLE_SHAPES = [...TERRAIN_SHAPES];

/** 旧セーブ互換 */
export const LEGACY_TERRAIN_SHAPE_ALIASES = { mountain: 'hill' };

export const isTerrainShape = (shape) =>
  TERRAIN_SHAPES.includes(shape) || shape === 'mountain';

export const normalizeTerrainShape = (shape) =>
  LEGACY_TERRAIN_SHAPE_ALIASES[shape] ?? shape;

export const isConnectableTerrainShape = (shape) =>
  TERRAIN_CONNECTABLE_SHAPES.includes(normalizeTerrainShape(shape));

export const isColorableTerrainShape = (shape) =>
  TERRAIN_COLORABLE_SHAPES.includes(normalizeTerrainShape(shape));

export const DEFAULT_TERRAIN_COLORS = {
  pond_tile: '#4fc3f7',
  stream_tile: '#81d4fa',
  waterfall: '#4fc3f7',
  hill: '#8d6e63',
  beach_tile: '#d8c39a',
  bog_tile: '#5d6b3f',
  cliff_face: '#607d8b',
  rock_field: '#757575',
};

/** 建築 0.5m/マス。丘は初期島サイズ寄りの広い地形として扱う */
export const TERRAIN_META = {
  pond_tile: {
    label: '池',
    icon: '💧',
    defaultMaterial: 'water',
    defaultScale: [2, 1, 2],
  },
  stream_tile: {
    label: '小川',
    icon: '〰️',
    defaultMaterial: 'water',
    defaultScale: [2, 1, 2],
  },
  waterfall: {
    label: '滝',
    icon: '🌊',
    defaultMaterial: 'water',
    defaultScale: [2.5, 3.5, 2.5],
  },
  hill: {
    label: '丘',
    icon: '🏔️',
    defaultMaterial: 'sand',
    // base径(約1.1m) * 5.5 ≒ 直径6m で1島(10m)内に余裕を持って収まる
    defaultScale: [5.5, 2.2, 5.5],
  },
  beach_tile: {
    label: '砂浜',
    icon: '🏖️',
    defaultMaterial: 'sand',
    defaultScale: [2.6, 1, 2.6],
  },
  bog_tile: {
    label: '沼地',
    icon: '🟤',
    defaultMaterial: 'water',
    defaultScale: [2.4, 1, 2.4],
  },
  cliff_face: {
    label: '崖',
    icon: '🪨',
    defaultMaterial: 'stone',
    defaultScale: [2.8, 3.2, 2.8],
  },
  rock_field: {
    label: '岩場',
    icon: '🪨',
    defaultMaterial: 'stone',
    defaultScale: [2.6, 1.4, 2.6],
  },
};

export const TERRAIN_COLOR_PRESETS = {
  pond_tile: ['#4fc3f7', '#81d4fa', '#26a69a', '#455a64'],
  stream_tile: ['#81d4fa', '#4fc3f7', '#26c6da', '#80deea'],
  waterfall: ['#4fc3f7', '#81d4fa', '#b3e5fc', '#e1f5fe'],
  hill: ['#8d6e63', '#a1887f', '#6d4c41', '#9ccc65'],
  beach_tile: ['#d8c39a', '#e6cfaa', '#c9b08a', '#e3d5b0'],
  bog_tile: ['#5d6b3f', '#6d7b48', '#4e5b34', '#7b8d56'],
  cliff_face: ['#607d8b', '#78909c', '#546e7a', '#8d6e63'],
  rock_field: ['#757575', '#9e9e9e', '#616161', '#8d8d8d'],
};
