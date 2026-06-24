import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PALETTE } from '../../../constants/artDirection';
import { ART_DIRECTION } from '../../../constants/buildFeatureFlags';
import { createVoxelMatProps } from '../../../utils/voxelMaterial';

const OCEAN_Y = -3.5;

export const StylizedOcean = ({ onPointerMove, onClick, onDoubleClick }) => {
  const ref = useRef();
  const matRef = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = OCEAN_Y + Math.sin(t * 0.45) * 0.15;
    if (matRef.current && ART_DIRECTION.useStylizedOcean) {
      const pulse = (Math.sin(t * 0.8) + 1) * 0.5;
      matRef.current.emissiveIntensity = 0.08 + pulse * 0.12;
    }
  });

  const oceanProps = ART_DIRECTION.useStylizedOcean
    ? createVoxelMatProps({
        color: PALETTE.water,
        emissive: PALETTE.waterGlow,
        emissiveIntensity: 0.1,
        roughness: 0.15,
        metalness: 0.05,
      })
    : { color: '#0288d1', roughness: 0.1, metalness: 0.2 };

  return (
    <mesh
      ref={ref}
      position={[0, OCEAN_Y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      onPointerMove={onPointerMove}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial
        ref={matRef}
        {...oceanProps}
        transparent
        opacity={ART_DIRECTION.useStylizedOcean ? 0.88 : 0.85}
      />
    </mesh>
  );
};
