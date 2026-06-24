import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { PALETTE } from '../../constants/artDirection';
import { ART_DIRECTION } from '../../constants/buildFeatureFlags';
import { createVoxelMatProps } from '../../utils/voxelMaterial';
import { StylizedOcean } from './environment/StylizedOcean';

export const Ocean = StylizedOcean;

export const Tree = ({ position, scale = 1, noPhysics }) => {
  const trunkProps = createVoxelMatProps({ color: PALETTE.treeTrunk });
  const leafA = createVoxelMatProps({ color: PALETTE.treeLeaf });
  const leafB = createVoxelMatProps({ color: PALETTE.treeLeafDark });

  const inner = ART_DIRECTION.enabled ? (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial {...trunkProps} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.9, 0.75, 0.9]} />
        <meshStandardMaterial {...leafA} />
      </mesh>
      <mesh position={[0.28, 1.35, 0.2]} castShadow>
        <boxGeometry args={[0.55, 0.5, 0.55]} />
        <meshStandardMaterial {...leafB} />
      </mesh>
      <mesh position={[-0.25, 1.2, -0.22]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.5]} />
        <meshStandardMaterial {...leafA} />
      </mesh>
    </group>
  ) : (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#8bc34a" roughness={0.8} />
      </mesh>
    </group>
  );

  if (noPhysics) return <group position={position} scale={scale}>{inner}</group>;
  return (
    <RigidBody type="fixed" colliders="hull" position={position} scale={scale}>
      {inner}
    </RigidBody>
  );
};
