import { VOXEL_MATERIAL_DEFAULTS } from '../constants/artDirection';

/**
 * meshStandardMaterial 向けのコージー・ボクセル既定プロパティ
 * @param {object} opts
 * @returns {object}
 */
export const createVoxelMatProps = ({
  color,
  emissive,
  emissiveIntensity = 0,
  roughness,
  metalness,
  flatShading,
  transparent,
  opacity,
  isGhost = false,
  ghostOpacity = 0.62,
} = {}) => ({
  color,
  ...(emissive ? { emissive, emissiveIntensity } : {}),
  roughness: roughness ?? VOXEL_MATERIAL_DEFAULTS.roughness,
  metalness: metalness ?? VOXEL_MATERIAL_DEFAULTS.metalness,
  flatShading: flatShading ?? VOXEL_MATERIAL_DEFAULTS.flatShading,
  ...(transparent || isGhost
    ? { transparent: true, opacity: isGhost ? ghostOpacity : opacity }
    : {}),
});

export const ghostVoxelProps = (isGhost, opacity = 0.62) =>
  isGhost ? { transparent: true, opacity } : {};
