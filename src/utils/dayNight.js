import { normalizeTimeOfDay } from '../constants/worldTimeConfig';
import { DAY_NIGHT_PALETTE, LIGHTING } from '../constants/artDirection';
import { ART_DIRECTION } from '../constants/buildFeatureFlags';

const lerp = (a, b, t) => a + (b - a) * t;

const clamp01 = (v) => Math.max(0, Math.min(1, v));

const hexToRgb = (hex) => {
  if (typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
    return [10, 25, 41];
  }
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
};

const rgbToHex = ([r, g, b]) =>
  `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g)
    .toString(16)
    .padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;

const lerpHex = (a, b, t) => {
  const ar = hexToRgb(a);
  const br = hexToRgb(b);
  return rgbToHex([
    lerp(ar[0], br[0], t),
    lerp(ar[1], br[1], t),
    lerp(ar[2], br[2], t),
  ]);
};

const DAY_NIGHT_KEYS = [
  {
    t: 0.0,
    ambient: 0.14,
    sun: 0.0,
    sunColor: '#7E57C2',
    fog: DAY_NIGHT_PALETTE.nightFog,
    background: DAY_NIGHT_PALETTE.nightBackground,
    fogNear: 8,
    fogFar: 44,
  },
  {
    t: 0.2,
    ambient: 0.24,
    sun: 0.5,
    sunColor: '#ffb26b',
    fog: '#263f62',
    background: '#274870',
    fogNear: 10,
    fogFar: 46,
  },
  {
    t: 0.38,
    ambient: 0.34,
    sun: 0.82,
    sunColor: LIGHTING.sunColorDay,
    fog: DAY_NIGHT_PALETTE.dayFog,
    background: DAY_NIGHT_PALETTE.dayBackground,
    fogNear: 16,
    fogFar: 52,
  },
  {
    t: 0.62,
    ambient: 0.3,
    sun: 0.72,
    sunColor: LIGHTING.sunColorSoft,
    fog: DAY_NIGHT_PALETTE.dayFog,
    background: DAY_NIGHT_PALETTE.dayBackground,
    fogNear: 16,
    fogFar: 50,
  },
  {
    t: 0.78,
    ambient: 0.24,
    sun: 0.38,
    sunColor: LIGHTING.sunColorSunset,
    fog: DAY_NIGHT_PALETTE.sunsetFog,
    background: DAY_NIGHT_PALETTE.sunsetBackground,
    fogNear: 10,
    fogFar: 48,
  },
  {
    t: 1.0,
    ambient: 0.14,
    sun: 0.0,
    sunColor: '#7E57C2',
    fog: DAY_NIGHT_PALETTE.nightFog,
    background: DAY_NIGHT_PALETTE.nightBackground,
    fogNear: 8,
    fogFar: 44,
  },
];

const getKeyframePair = (timeOfDay) => {
  const t = normalizeTimeOfDay(timeOfDay);
  for (let i = 0; i < DAY_NIGHT_KEYS.length - 1; i += 1) {
    const a = DAY_NIGHT_KEYS[i];
    const b = DAY_NIGHT_KEYS[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t || 1;
      return { a, b, mix: clamp01((t - a.t) / span) };
    }
  }
  return { a: DAY_NIGHT_KEYS[0], b: DAY_NIGHT_KEYS[1], mix: 0 };
};

export const getDayNightState = (timeOfDay) => {
  const t = normalizeTimeOfDay(timeOfDay);
  const { a, b, mix } = getKeyframePair(t);
  const sunPhase = (t - 0.25) * Math.PI * 2;
  const sunElevation = Math.sin(sunPhase);
  const sunY = sunElevation * 24;
  const sunX = Math.cos(sunPhase) * 20;
  const sunZ = Math.cos(sunPhase * 0.72) * 14;

  const sunRaw = lerp(a.sun, b.sun, mix);
  const nightFactor = clamp01(1 - sunRaw / 1.05);

  const ambientRaw = lerp(a.ambient, b.ambient, mix);
  const lightScale = ART_DIRECTION.enabled ? LIGHTING : { sunIntensityScale: 1, ambientScale: 1 };

  const moonPhase = sunPhase + Math.PI;
  const moonY = Math.max(Math.sin(moonPhase) * 18, 4);
  const moonX = Math.cos(moonPhase) * 16;
  const moonZ = Math.cos(moonPhase * 0.72) * 12;
  const moonIntensity = nightFactor > 0.45
    ? lerp(0.06, 0.22, clamp01((nightFactor - 0.45) / 0.55)) * lightScale.sunIntensityScale
    : 0;

  return {
    ambientIntensity: ambientRaw * lightScale.ambientScale,
    sunIntensity: sunElevation > 0.08 ? sunRaw * lightScale.sunIntensityScale : 0,
    sunColor: lerpHex(a.sunColor, b.sunColor, mix),
    fogColor: lerpHex(a.fog, b.fog, mix),
    background: lerpHex(a.background, b.background, mix),
    fogNear: lerp(a.fogNear, b.fogNear, mix),
    fogFar: lerp(a.fogFar, b.fogFar, mix),
    sunPosition: [sunX, sunY, sunZ],
    moonPosition: [moonX, moonY, moonZ],
    moonIntensity,
    moonColor: '#C5CAE9',
    nightFactor,
    hemisphereSky: lerpHex(DAY_NIGHT_PALETTE.dayFog, DAY_NIGHT_PALETTE.nightFog, nightFactor),
    hemisphereGround: lerpHex('#8BC34A', '#33691E', nightFactor),
  };
};
