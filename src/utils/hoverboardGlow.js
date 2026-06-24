import { MATERIAL_COLORS } from '../constants/gameData';
import { DEFAULT_HOVERBOARD_COLOR } from '../constants/hoverboardData';

const GLOW_INTENSITY = {
  mana: 2.0,
  light: 1.8,
  water: 1.4,
  glass: 1.2,
  grass: 1.2,
  sand: 1.1,
  brick: 1.1,
  wood: 1.0,
  stone: 0.95,
  iron: 0.9,
};

export const getHoverboardGlowStyleFromColor = (color = DEFAULT_HOVERBOARD_COLOR) => ({
  color,
  emissive: color,
  emissiveIntensity: 1.55,
});

export const getHoverboardGlowStyle = (material = 'mana') => {
  const color = MATERIAL_COLORS[material] ?? MATERIAL_COLORS.mana;
  const emissiveIntensity = GLOW_INTENSITY[material] ?? 1.25;
  return { color, emissive: color, emissiveIntensity };
};

export const getHoverboardGlowFromBlock = (block = {}) => {
  if (block?.hoverboard?.color) {
    return getHoverboardGlowStyleFromColor(block.hoverboard.color);
  }
  if (block?.material) {
    return getHoverboardGlowStyle(block.material);
  }
  return getHoverboardGlowStyleFromColor(DEFAULT_HOVERBOARD_COLOR);
};
