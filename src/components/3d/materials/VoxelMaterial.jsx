import React from 'react';
import { createVoxelMatProps } from '../../../utils/voxelMaterial';

/**
 * コージー・ボクセル向け meshStandardMaterial ラッパー
 */
export const VoxelMaterial = ({
  color,
  emissive,
  emissiveIntensity,
  roughness,
  metalness,
  flatShading,
  transparent,
  opacity,
  isGhost = false,
  ref,
  ...rest
}) => (
  <meshStandardMaterial
    ref={ref}
    {...createVoxelMatProps({
      color,
      emissive,
      emissiveIntensity,
      roughness,
      metalness,
      flatShading,
      transparent,
      opacity,
      isGhost,
    })}
    {...rest}
  />
);
