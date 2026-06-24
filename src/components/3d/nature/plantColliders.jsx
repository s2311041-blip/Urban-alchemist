import React from 'react';
import { CuboidCollider } from '@react-three/rapier';

export const getNatureCollider = (shape, scale = [1, 1, 1]) => {
  const sx = Number.isFinite(scale[0]) ? scale[0] : 1;
  const sy = Number.isFinite(scale[1]) ? scale[1] : 1;
  const sz = Number.isFinite(scale[2]) ? scale[2] : 1;

  switch (shape) {
    case 'turf':
      return <CuboidCollider args={[0.25 * sx, 0.01, 0.25 * sz]} position={[0, -0.24, 0]} />;
    case 'flower':
      return <CuboidCollider args={[0.05 * sx, 0.17 * sy, 0.05 * sz]} />;
    case 'shrub':
      return <CuboidCollider args={[0.22 * sx, 0.22 * sy, 0.22 * sz]} />;
    case 'hedge':
      return <CuboidCollider args={[0.25 * sx, 0.2 * sy, 0.25 * sz]} position={[0, -0.05, 0]} />;
    case 'street_tree':
      return (
        <>
          <CuboidCollider args={[0.046 * sx, 0.21 * sy, 0.046 * sz]} />
          <CuboidCollider args={[0.19 * sx, 0.15 * sy, 0.19 * sz]} position={[0, 0.28 * sy, 0]} />
        </>
      );
    case 'canopy_tree':
      return (
        <>
          <CuboidCollider args={[0.06 * sx, 0.23 * sy, 0.06 * sz]} position={[0, -0.04, 0]} />
          <CuboidCollider args={[0.24 * sx, 0.2 * sy, 0.24 * sz]} position={[0, 0.3 * sy, 0]} />
        </>
      );
    default:
      return <CuboidCollider args={[0.25 * sx, 0.25 * sy, 0.25 * sz]} />;
  }
};
