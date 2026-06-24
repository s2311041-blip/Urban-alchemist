import React from 'react';
import { CuboidCollider } from '@react-three/rapier';

export const getAgriCollider = (shape, scale = [1, 1, 1]) => {
  const sx = Number.isFinite(scale[0]) ? scale[0] : 1;
  const sy = Number.isFinite(scale[1]) ? scale[1] : 1;
  const sz = Number.isFinite(scale[2]) ? scale[2] : 1;

  switch (shape) {
    case 'farm_plot':
    case 'rice_paddy':
    case 'garden_bed':
      return <CuboidCollider args={[0.25 * sx, 0.02 * sy, 0.25 * sz]} position={[0, -0.22 * sy, 0]} />;
    default:
      return <CuboidCollider args={[0.25 * sx, 0.25 * sy, 0.25 * sz]} />;
  }
};
