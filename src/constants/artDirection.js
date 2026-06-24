/**
 * コージー・ボクセル都市ファンタジー / アイソメ・ジオラマRPG
 * 画風の単一の正（パレット・光・カメラ）
 */

export const PALETTE = {
  grass: '#8BC34A',
  grassLight: '#AED581',
  grassDark: '#689F38',
  grassPlacing: '#C5E1A5',
  grassBuild: '#DCEDC8',
  water: '#4FC3F7',
  waterDeep: '#0288D1',
  waterGlow: '#81D4FA',
  skyDayTop: '#87CEEB',
  skyDayHorizon: '#B3E5FC',
  skySunset: '#FFB74D',
  skyNight: '#1A237E',
  orbCore: '#AB47BC',
  orbGlow: '#E1BEE7',
  orbEmissive: '#CE93D8',
  lampWarm: '#FFD54F',
  lampEmissive: '#FFF59D',
  road: '#BDBDBD',
  roadDark: '#9E9E9E',
  buildingWarm: '#FFCC80',
  buildingPlaster: '#FFF3E0',
  buildingTrim: '#8D6E63',
  buildingRoof: '#A1887F',
  wood: '#A1887F',
  stone: '#90A4AE',
  accent: '#7E57C2',
  accentBright: '#B39DDB',
  mana: '#9575CD',
  edge: '#FFFFFF',
  treeTrunk: '#6D4C41',
  treeLeaf: '#7CB342',
  treeLeafDark: '#558B2F',
};

export const VOXEL_MATERIAL_DEFAULTS = {
  roughness: 0.92,
  metalness: 0,
  flatShading: true,
};

export const BLOOM = {
  intensity: 0.52,
  luminanceThreshold: 0.52,
  luminanceSmoothing: 0.4,
  mipmapBlur: true,
  resolutionScale: 0.7,
};

/** 概念図に近づけるポストプロセス（彩度・コントラスト） */
export const POST_PROCESSING = {
  saturation: 0.25, // Increased slightly for a fresher/vibrant look
  contrast: 0.05,
  brightness: 0,
  vignetteOffset: 0.38,
  vignetteDarkness: 0.38,
};

export const DOF = {
  focusDistance: 0.0,
  focalLength: 0.02,
  bokehScale: 2.5,
};

export const SSAO = {
  blendFunction: 2, // Multiply
  samples: 21,
  radius: 0.15,
  intensity: 15,
  luminanceInfluence: 0.6,
  color: '#000000',
};


export const RENDERER = {
  toneMappingExposure: 0.92,
};

/** 太陽・環境光のスケール（眩しさ抑制） */
export const LIGHTING = {
  sunIntensityScale: 0.68,
  ambientScale: 0.82,
  hemisphereIntensity: 0.16,
  sunColorSoft: '#F5E6C8',
  sunColorDay: '#FFE8B8',
  sunColorSunset: '#FFBC85',
};

export const ISO_CAMERA_PRESET = {
  distance: 20,
  height: 18,
  target: [0, 0.5, 0],
};

export const HEMISPHERE_LIGHT = {
  skyColor: '#B3E5FC',
  groundColor: '#8BC34A',
  intensity: LIGHTING.hemisphereIntensity,
};

/** 神ビュー用 Orthographic（概念図のアイソメ寄り） */
export const ORTHO_GOD_VIEW = {
  frustumHeight: 16,
};

export const ZONE_LIGHTS = {
  alleyCold: '#6A5ACD',
  alleyColdDim: '#483D8B',
  plazaWarm: '#FFE082',
  stationWarm: '#FFF8E1',
};

export const CONTACT_SHADOWS = {
  opacity: 0.35,
  scale: 28,
  blur: 2.2,
  far: 5,
};

/** dayNight.js のキーフレームを画風寄せに上書きするマップ */
export const DAY_NIGHT_PALETTE = {
  dayBackground: '#87CEEB',
  dayFog: '#B3E5FC',
  sunsetBackground: '#FF8A65', // warmer sunset
  sunsetFog: '#FFCC80',
  nightBackground: '#0D1136', // deeper night sky
  nightFog: '#1A237E', // deep blue fog
};
