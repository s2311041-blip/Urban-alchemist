import { SEASON_TINT } from '../constants/seasonData';

const hexToRgb = (hex) => {
  if (typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
    return [128, 128, 128];
  }
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
};

const rgbToHex = (rgb) =>
  `#${rgb
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('')}`;

export const applySeasonTint = (hexColor, season = 'spring', domain = 'agri') => {
  const tint = SEASON_TINT[season]?.[domain];
  if (!tint) return hexColor;

  const [r, g, b] = hexToRgb(hexColor);
  return rgbToHex([r * tint[0], g * tint[1], b * tint[2]]);
};
