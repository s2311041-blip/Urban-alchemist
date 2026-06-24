import { PALETTE } from '../constants/artDirection';

export const BUG_ORB_COLORS = {
  mine: '#37474F',
  other: '#FF8F00',
  npcHuman: PALETTE.orbCore,
  npcDefault: '#8E24AA',
};

export const BUG_ORB_EMISSIVE = {
  mine: '#546E7A',
  other: '#FFB74D',
  npcHuman: PALETTE.orbEmissive,
  npcDefault: PALETTE.orbGlow,
};

export const resolveBugOrbKind = ({
  isMine = false,
  fromPost = false,
  factor,
} = {}) => {
  if (isMine) return 'mine';
  if (fromPost) return 'other';
  if (factor === 'human') return 'npcHuman';
  return 'npcDefault';
};

export const getBugOrbKind = (source = {}) => resolveBugOrbKind(source);

export const getBugOrbColor = (source = {}) => BUG_ORB_COLORS[resolveBugOrbKind(source)];

export const getBugOrbEmissive = (source = {}) => BUG_ORB_EMISSIVE[resolveBugOrbKind(source)];

/** @typedef {{ color: string, count: number, size: number, speed: number, opacity: number, scale: [number, number, number], noise: [number, number, number], position?: [number, number, number] }} BugOrbParticleLayer */

/** @type {Record<string, BugOrbParticleLayer[]>} */
export const BUG_ORB_PARTICLE_PRESETS = {
  mine: [],
  other: [
    {
      color: '#ffe082',
      count: 10,
      size: 3,
      speed: 0.55,
      opacity: 0.4,
      scale: [0.48, 0.55, 0.48],
      noise: [0.75, 0.4, 0.75],
      position: [0, 0.06, 0],
    },
    {
      color: '#ffcc80',
      count: 5,
      size: 2.4,
      speed: 0.68,
      opacity: 0.3,
      scale: [0.36, 0.4, 0.36],
      noise: [0.85, 0.45, 0.85],
      position: [0, 0.1, 0],
    },
  ],
  npcHuman: [
    {
      color: '#f3e5f5',
      count: 44,
      size: 8.5,
      speed: 0.14,
      opacity: 0.62,
      scale: [1.7, 0.62, 1.7],
      noise: [0.18, 0.18, 0.18],
      position: [0, 0.04, 0],
    },
    {
      color: '#ce93d8',
      count: 24,
      size: 10.5,
      speed: 0.09,
      opacity: 0.42,
      scale: [2.0, 0.42, 2.0],
      noise: [0.12, 0.12, 0.12],
      position: [0, 0.02, 0],
    },
    {
      color: '#ab47bc',
      count: 10,
      size: 13,
      speed: 0.06,
      opacity: 0.24,
      scale: [2.3, 0.32, 2.3],
      noise: [0.08, 0.08, 0.08],
      position: [0, 0, 0],
    },
  ],
  npcDefault: [
    {
      color: '#ffab91',
      count: 52,
      size: 3.6,
      speed: 2.6,
      opacity: 0.88,
      scale: [0.36, 1.85, 0.36],
      noise: [2.6, 3.2, 1.3],
      position: [0, 0.02, 0],
    },
    {
      color: '#ff5722',
      count: 32,
      size: 5.2,
      speed: 3.2,
      opacity: 0.78,
      scale: [0.26, 1.15, 0.26],
      noise: [3.2, 2.5, 1.55],
      position: [0, 0.07, 0],
    },
    {
      color: '#ffeb3b',
      count: 14,
      size: 2.8,
      speed: 3.8,
      opacity: 0.68,
      scale: [0.2, 0.62, 0.2],
      noise: [3.8, 2.0, 2.1],
      position: [0, 0.12, 0],
    },
  ],
};

/** @typedef {{
 *   radius: number,
 *   scale: [number, number, number],
 *   position: [number, number, number],
 *   color: string,
 *   emissive: string,
 *   opacity: number,
 *   emissiveIntensity: number,
 * }} BugOrbSmokeAuraLayer */

/** 黒オーブ専用。外殻〜0.5m 前後に収め、赤/オレンジと同規模。 */
/** @type {Record<string, BugOrbSmokeAuraLayer[]>} */
export const BUG_ORB_SMOKE_AURA_PRESETS = {
  mine: [
    {
      radius: 0.34,
      scale: [1.02, 0.9, 1.02],
      position: [0, 0.04, 0],
      color: '#1a1a1a',
      emissive: '#263238',
      opacity: 0.26,
      emissiveIntensity: 0.05,
    },
    {
      radius: 0.39,
      scale: [1.06, 0.96, 1.06],
      position: [0, 0.1, 0],
      color: '#212121',
      emissive: '#37474f',
      opacity: 0.18,
      emissiveIntensity: 0.04,
    },
    {
      radius: 0.44,
      scale: [1.1, 1.02, 1.1],
      position: [0, 0.15, 0],
      color: '#263238',
      emissive: '#455a64',
      opacity: 0.12,
      emissiveIntensity: 0.03,
    },
  ],
};

/** @type {Record<string, {
 *   pulseSpeed: number,
 *   coreRadius: number,
 *   shellRadius: number,
 *   showShell: boolean,
 *   useFlicker: boolean,
 *   flickerStrength: number,
 *   coreScaleMin: number,
 *   coreScaleMax: number,
 *   shellScaleMin: number,
 *   shellScaleMax: number,
 *   coreEmissiveBase: number,
 *   coreEmissiveRange: number,
 *   shellOpacityBase: number,
 *   shellOpacityRange: number,
 *   shellEmissiveRange: number,
 *   lightBase: number,
 *   lightRange: number,
 *   initialCoreEmissive: number,
 *   initialShellOpacity: number,
 *   initialLight: number,
 *   lightDistance: number,
 * }>} */
export const BUG_ORB_GLOW_PRESETS = {
  mine: {
    pulseSpeed: 0.65,
    coreRadius: 0.24,
    shellRadius: 0.36,
    showShell: true,
    useFlicker: false,
    flickerStrength: 0,
    coreScaleMin: 0.98,
    coreScaleMax: 1.02,
    shellScaleMin: 1.02,
    shellScaleMax: 1.1,
    coreEmissiveBase: 0.06,
    coreEmissiveRange: 0.08,
    shellOpacityBase: 0.1,
    shellOpacityRange: 0.06,
    shellEmissiveRange: 0.1,
    lightBase: 0.04,
    lightRange: 0.05,
    initialCoreEmissive: 0.1,
    initialShellOpacity: 0.12,
    initialLight: 0.06,
    lightDistance: 2.4,
  },
  other: {
    pulseSpeed: 1.05,
    coreRadius: 0.32,
    shellRadius: 0.46,
    showShell: true,
    useFlicker: false,
    flickerStrength: 0,
    coreScaleMin: 0.93,
    coreScaleMax: 1.08,
    shellScaleMin: 1.06,
    shellScaleMax: 1.22,
    coreEmissiveBase: 0.55,
    coreEmissiveRange: 0.72,
    shellOpacityBase: 0.32,
    shellOpacityRange: 0.22,
    shellEmissiveRange: 0.55,
    lightBase: 0.42,
    lightRange: 0.48,
    initialCoreEmissive: 0.95,
    initialShellOpacity: 0.42,
    initialLight: 0.72,
    lightDistance: 4.8,
  },
  npcDefault: {
    pulseSpeed: 1.65,
    coreRadius: 0.34,
    shellRadius: 0.44,
    showShell: true,
    useFlicker: true,
    flickerStrength: 0.55,
    coreScaleMin: 0.88,
    coreScaleMax: 1.14,
    shellScaleMin: 1.04,
    shellScaleMax: 1.24,
    coreEmissiveBase: 0.62,
    coreEmissiveRange: 0.95,
    shellOpacityBase: 0.3,
    shellOpacityRange: 0.28,
    shellEmissiveRange: 0.62,
    lightBase: 0.48,
    lightRange: 0.72,
    initialCoreEmissive: 1.1,
    initialShellOpacity: 0.38,
    initialLight: 0.85,
    lightDistance: 5.2,
  },
  npcHuman: {
    pulseSpeed: 0.55,
    coreRadius: 0.3,
    shellRadius: 0.62,
    showShell: true,
    useFlicker: false,
    flickerStrength: 0,
    coreScaleMin: 0.96,
    coreScaleMax: 1.04,
    shellScaleMin: 1.1,
    shellScaleMax: 1.42,
    coreEmissiveBase: 0.38,
    coreEmissiveRange: 0.42,
    shellOpacityBase: 0.28,
    shellOpacityRange: 0.2,
    shellEmissiveRange: 0.48,
    lightBase: 0.28,
    lightRange: 0.32,
    initialCoreEmissive: 0.72,
    initialShellOpacity: 0.34,
    initialLight: 0.48,
    lightDistance: 6.5,
  },
};

export const getBugOrbParticleLayers = (source = {}) => (
  BUG_ORB_PARTICLE_PRESETS[resolveBugOrbKind(source)] ?? BUG_ORB_PARTICLE_PRESETS.npcDefault
);

export const getBugOrbSmokeAuraLayers = (source = {}) => (
  BUG_ORB_SMOKE_AURA_PRESETS[resolveBugOrbKind(source)] ?? []
);

export const getBugOrbGlowPreset = (kind = 'npcDefault') => (
  BUG_ORB_GLOW_PRESETS[kind] ?? BUG_ORB_GLOW_PRESETS.npcDefault
);

export const getBugOrbAppearance = (source = {}) => {
  const kind = resolveBugOrbKind(source);
  return {
    kind,
    color: BUG_ORB_COLORS[kind],
    emissive: BUG_ORB_EMISSIVE[kind],
    glow: getBugOrbGlowPreset(kind),
  };
};
