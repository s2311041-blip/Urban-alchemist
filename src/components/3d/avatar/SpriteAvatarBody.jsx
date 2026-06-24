import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

export const SpriteAvatarBody = ({ parentMeshRef }) => {
  const { camera } = useThree();
  const materialRef = useRef();

  // Load textures
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const loadTex = (url) => {
      const tex = loader.load(url);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };
    return {
      front: loadTex('/models/avatar_front.png'),
      back: loadTex('/models/avatar_back.png'),
      left: loadTex('/models/avatar_left.png'),
      right: loadTex('/models/avatar_right.png'),
    };
  }, []);

  useFrame(() => {
    if (!parentMeshRef?.current || !materialRef.current) return;

    // Get world rotations
    const avatarY = parentMeshRef.current.rotation.y;
    // For TPS camera, it looks AT the avatar, so its rotation.y is roughly where it's looking.
    // However, getting Euler Y from quaternion is safest.
    const camEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    const cameraY = camEuler.y;

    // Calculate relative angle
    let diff = (avatarY - cameraY) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;

    let targetTex = textures.front;
    if (diff >= -Math.PI/4 && diff <= Math.PI/4) {
      targetTex = textures.back;
    } else if (diff > Math.PI/4 && diff < 3*Math.PI/4) {
      targetTex = textures.left;
    } else if (diff < -Math.PI/4 && diff > -3*Math.PI/4) {
      targetTex = textures.right;
    }

    if (materialRef.current.map !== targetTex) {
      materialRef.current.map = targetTex;
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
      {/* Sprite mesh, moved slightly up to align feet */}
      <mesh position={[0, 0.4, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          ref={materialRef} 
          map={textures.front} 
          transparent={true} 
          alphaTest={0.5} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </Billboard>
  );
};
