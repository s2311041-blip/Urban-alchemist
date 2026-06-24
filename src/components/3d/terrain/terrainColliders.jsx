import React from 'react';
import { CuboidCollider, CylinderCollider } from '@react-three/rapier';
import { buildHillColliderLayers } from './hillGeometry';
import { CLIFF_COLLIDER } from './cliffGeometry';

const FOOTPRINT = 1.0;

export const getTerrainCollider = (shape, scale = [1, 1, 1]) => {
  const sx = Number.isFinite(scale[0]) ? scale[0] : 1;
  const sy = Number.isFinite(scale[1]) ? scale[1] : 1;
  const sz = Number.isFinite(scale[2]) ? scale[2] : 1;
  const hx = (FOOTPRINT / 2) * sx;
  const hz = (FOOTPRINT / 2) * sz;
  const hillRadius = (sx + sz) * 0.5;

  switch (shape) {
    case 'pond_tile':
    case 'stream_tile':
      return <CuboidCollider args={[hx, 0.02 * sy, hz]} position={[0, -0.22 * sy, 0]} />;
    case 'waterfall':
      return (
        <CuboidCollider
          args={[FOOTPRINT * 0.42 * sx, 0.42 * sy, FOOTPRINT * 0.42 * sz]}
          position={[0, 0.12 * sy, 0]}
        />
      );
    case 'beach_tile':
      return <CuboidCollider args={[hx, 0.035 * sy, hz]} position={[0, -0.205 * sy, 0]} />;
    case 'bog_tile':
      return <CuboidCollider args={[hx * 0.94, 0.04 * sy, hz * 0.94]} position={[0, -0.2 * sy, 0]} />;
    case 'cliff_face': {
      const c = CLIFF_COLLIDER;
      return (
        <group>
          <CuboidCollider
            args={[FOOTPRINT * c.outerHalf * sx, c.halfHeight * sy, c.wallHalfThickness * sz]}
            position={[0, c.centerY * sy, c.wallCenterOffset * sz]}
          />
          <CuboidCollider
            args={[FOOTPRINT * c.outerHalf * sx, c.halfHeight * sy, c.wallHalfThickness * sz]}
            position={[0, c.centerY * sy, -c.wallCenterOffset * sz]}
          />
          <CuboidCollider
            args={[c.wallHalfThickness * sx, c.halfHeight * sy, FOOTPRINT * c.outerHalf * sz]}
            position={[c.wallCenterOffset * sx, c.centerY * sy, 0]}
          />
          <CuboidCollider
            args={[c.wallHalfThickness * sx, c.halfHeight * sy, FOOTPRINT * c.outerHalf * sz]}
            position={[-c.wallCenterOffset * sx, c.centerY * sy, 0]}
          />
          <CuboidCollider
            args={[FOOTPRINT * c.outerHalf * sx, c.topHalfHeight * sy, FOOTPRINT * c.outerHalf * sz]}
            position={[0, c.topCenterY * sy, 0]}
          />
        </group>
      );
    }
    case 'rock_field':
      return <CuboidCollider args={[FOOTPRINT * 0.38 * sx, 0.16 * sy, FOOTPRINT * 0.38 * sz]} position={[0, -0.08 * sy, 0]} />;
    case 'hill':
    case 'mountain':
      return (
        <group>
          {buildHillColliderLayers().map((c, i) => (
            <CylinderCollider
              key={`hill-cyl-${i}`}
              args={[c.halfHeight * sy, c.radius * hillRadius]}
              position={[0, c.y * sy, 0]}
            />
          ))}
        </group>
      );
    default:
      return <CuboidCollider args={[hx, 0.25 * sy, hz]} />;
  }
};
