import React from 'react';
import { PALETTE } from '../../../constants/artDirection';
import { createVoxelMatProps } from '../../../utils/voxelMaterial';
import { VoxelModel } from '../VoxelModel';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VOXEL = (color, extra = {}) => createVoxelMatProps({ color, ...extra });

const CodeVoxelAvatar = () => {
  const groupRef = React.useRef();
  const leftLeg = React.useRef();
  const rightLeg = React.useRef();
  const leftArm = React.useRef();
  const rightArm = React.useRef();
  
  const lastPos = React.useRef(new THREE.Vector3());
  const walkPhase = React.useRef(0);

  const skin = VOXEL('#FFCCBC');
  const hair = VOXEL('#5D4037');
  const tunic = VOXEL('#66BB6A'); // RPG Hero Green
  const belt = VOXEL('#795548');
  const boots = VOXEL('#8D6E63');

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Calculate movement speed using world position changes
    const currentPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(currentPos);
    
    const dist = currentPos.distanceTo(lastPos.current);
    const speed = dist / delta;
    lastPos.current.copy(currentPos);

    const isWalking = speed > 0.5;

    if (isWalking) {
      walkPhase.current += speed * 0.3 * delta; // slightly slower phase speed
      const swing = Math.sin(walkPhase.current * 10) * 0.4; // reduced swing amplitude and frequency
      
      leftLeg.current.rotation.x = swing;
      rightLeg.current.rotation.x = -swing;
      leftArm.current.rotation.x = -swing;
      rightArm.current.rotation.x = swing;
      
      // Bobbing
      groupRef.current.position.y = 0.4 + Math.abs(Math.sin(walkPhase.current * 10)) * 0.02; // reduced bobbing
    } else {
      walkPhase.current = 0;
      // Idle breathing
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, 0.1);
      rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, 0.1);
      leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, 0.1);
      rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, 0.1);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0.4 + breathe, 0.1);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      {/* Head */}
      <group position={[0, 0.5, 0]}>
        <mesh castShadow position={[0, 0.15, 0]}>
          <boxGeometry args={[0.4, 0.35, 0.4]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* Hair */}
        <mesh castShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[0.42, 0.15, 0.42]} />
          <meshStandardMaterial {...hair} />
        </mesh>
        <mesh castShadow position={[0, 0.25, -0.21]}>
          <boxGeometry args={[0.42, 0.25, 0.1]} />
          <meshStandardMaterial {...hair} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.08, 0.15, 0.21]}>
          <boxGeometry args={[0.06, 0.08, 0.02]} />
          <meshStandardMaterial color="#212121" />
        </mesh>
        <mesh position={[0.08, 0.15, 0.21]}>
          <boxGeometry args={[0.06, 0.08, 0.02]} />
          <meshStandardMaterial color="#212121" />
        </mesh>
      </group>

      {/* Body */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
        <meshStandardMaterial {...tunic} />
      </mesh>
      {/* Belt */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.32, 0.08, 0.22]} />
        <meshStandardMaterial {...belt} />
      </mesh>

      {/* Left Arm (Pivots at shoulder) */}
      <group ref={leftArm} position={[0.23, 0.4, 0]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.12, 0.35, 0.12]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* Sleeve */}
        <mesh castShadow position={[0, -0.049, 0]}>
          <boxGeometry args={[0.14, 0.15, 0.14]} />
          <meshStandardMaterial {...tunic} />
        </mesh>
      </group>

      {/* Right Arm (Pivots at shoulder) */}
      <group ref={rightArm} position={[-0.23, 0.4, 0]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.12, 0.35, 0.12]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* Sleeve */}
        <mesh castShadow position={[0, -0.049, 0]}>
          <boxGeometry args={[0.14, 0.15, 0.14]} />
          <meshStandardMaterial {...tunic} />
        </mesh>
      </group>

      {/* Left Leg (Pivots at hip) */}
      <group ref={leftLeg} position={[0.1, 0.05, 0]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.12, 0.3, 0.12]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* Boot */}
        <mesh castShadow position={[0, -0.25, 0.02]}>
          <boxGeometry args={[0.14, 0.15, 0.162]} />
          <meshStandardMaterial {...boots} />
        </mesh>
      </group>

      {/* Right Leg (Pivots at hip) */}
      <group ref={rightLeg} position={[-0.1, 0.05, 0]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.12, 0.3, 0.12]} />
          <meshStandardMaterial {...skin} />
        </mesh>
        {/* Boot */}
        <mesh castShadow position={[0, -0.25, 0.02]}>
          <boxGeometry args={[0.14, 0.15, 0.162]} />
          <meshStandardMaterial {...boots} />
        </mesh>
      </group>
    </group>
  );
};

/**
 * 概念図寄りのキューブ人間 + バックパック
 */
export const VoxelAvatarBody = ({
  isHoverboarding,
  isFerryRiding,
  hoverboardGlow,
}) => {
  const shirt = VOXEL('#5C6BC0');
  const pants = VOXEL('#3F51B5');
  const skin = VOXEL('#FFCCBC');
  const hair = VOXEL('#5D4037');
  const pack = VOXEL(PALETTE.buildingTrim);
  const packAccent = VOXEL(PALETTE.accent, {
    emissive: PALETTE.accentBright,
    emissiveIntensity: 0.35,
  });

  return (
    <group>
      <CodeVoxelAvatar />

      {isHoverboarding && !isFerryRiding && (
        <group position={[0, 0.12, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.06, 0.82]} />
            <meshStandardMaterial color="#37474F" roughness={0.85} metalness={0.1} flatShading />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.28, 0.05, 0.76]} />
            <meshStandardMaterial
              color={hoverboardGlow.color}
              transparent
              opacity={0.65}
              emissive={hoverboardGlow.emissive}
              emissiveIntensity={hoverboardGlow.emissiveIntensity}
              flatShading
            />
          </mesh>
          <pointLight position={[0, -0.15, 0]} intensity={1.8} distance={4} color={hoverboardGlow.color} />
        </group>
      )}

      {isFerryRiding && (
        <group position={[0, -0.075, 0]}>
          {/* 船体（下部） */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.4, 1.8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
          </mesh>
          {/* 船体（上部キャビン） */}
          <mesh position={[0, 0.3, -0.2]} castShadow>
            <boxGeometry args={[0.7, 0.3, 0.8]} />
            <meshStandardMaterial color="#1e88e5" roughness={0.6} />
          </mesh>
          {/* 窓 */}
          <mesh position={[0, 0.3, -0.2]}>
            <boxGeometry args={[0.72, 0.15, 0.82]} />
            <meshStandardMaterial color="#81d4fa" emissive="#4fc3f7" emissiveIntensity={0.3} transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
};
