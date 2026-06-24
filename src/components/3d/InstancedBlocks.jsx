import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { getBlockTexture } from '../../utils/textureLoader';
import { getPixelTexture } from '../../utils/textureGenerator';
import { BLOCK_MATERIALS } from '../../constants/gameData';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export const InstancedBlocks = ({ blocks }) => {
  // ポジションが有効なブロックのみを対象にする
  const validBlocks = useMemo(() => {
    return blocks.filter((b) => b && Array.isArray(b.pos) && b.pos.length === 3 && b.pos.every(Number.isFinite));
  }, [blocks]);

  // マテリアルと形状の組み合わせでグループ化
  const groups = useMemo(() => {
    const map = {};
    validBlocks.forEach((block) => {
      const shape = block.shape || 'block';
      const material = block.material || 'stone';
      const key = `${shape}_${material}`;
      if (!map[key]) {
        map[key] = { key, shape, material, list: [] };
      }
      map[key].list.push(block);
    });
    return Object.values(map);
  }, [validBlocks]);

  return (
    <group>
      {/* 描画の最適化（InstancedMesh） */}
      {groups.map((group) => (
        <InstancedGroup
          key={group.key}
          shape={group.shape}
          material={group.material}
          list={group.list}
        />
      ))}

      {/* 物理演算コライダーの結合（Compound Colliderによる劇的なCPU負荷削減） */}
      <RigidBody type="fixed" colliders={false}>
        {validBlocks.map((block) => {
          const sx = block.scale?.[0] ?? 1;
          const sy = block.scale?.[1] ?? 1;
          const sz = block.scale?.[2] ?? 1;
          const shape = block.shape || 'block';

          // コライダーのサイズとオフセットを Block.jsx と合わせる
          let args = [0.25 * sx, 0.25 * sy, 0.25 * sz];
          let posYOffset = 0;

          if (shape === 'half') args = [0.25 * sx, 0.125 * sy, 0.25 * sz];
          else if (shape === 'pole') args = [0.05 * sx, 0.25 * sy, 0.05 * sz];
          else if (shape === 'path') {
            args = [0.25 * sx, 0.01 * sy, 0.25 * sz];
            posYOffset = -0.24;
          }

          return (
            <CuboidCollider
              key={`col-${block.id}`}
              args={args}
              position={[block.pos[0], block.pos[1] + posYOffset, block.pos[2]]}
            />
          );
        })}
      </RigidBody>
    </group>
  );
};

const InstancedGroup = ({ shape, material, list }) => {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    if (shape === 'half') return new THREE.BoxGeometry(0.5, 0.25, 0.5);
    if (shape === 'pole') return new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    if (shape === 'slope') {
      const s = new THREE.Shape();
      s.moveTo(-0.25, -0.25);
      s.lineTo(0.25, -0.25);
      s.lineTo(-0.25, 0.25);
      s.lineTo(-0.25, -0.25);
      const extrudeSettings = { depth: 0.5, bevelEnabled: false };
      const geo = new THREE.ExtrudeGeometry(s, extrudeSettings);
      geo.center(); // 中心を原点に合わせる
      return geo;
    }
    if (shape === 'leaf') return new THREE.SphereGeometry(0.25, 16, 16);
    if (shape === 'path') return new THREE.BoxGeometry(0.5, 0.02, 0.5);
    return new THREE.BoxGeometry(0.5, 0.5, 0.5);
  }, [shape]);

  const matProps = useMemo(() => {
    const mat = BLOCK_MATERIALS[material] || BLOCK_MATERIALS.stone;
    const customTexture = getBlockTexture(material);
    return {
      map: customTexture ? customTexture : getPixelTexture(mat.color),
      color: customTexture ? '#ffffff' : mat.color,
      roughness: mat.roughness,
      metalness: mat.metalness,
      transparent: mat.transparent,
      opacity: mat.opacity ?? 1,
    };
  }, [material]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const tempObject = new THREE.Object3D();
    list.forEach((block, idx) => {
      let yOffset = 0;
      if (shape === 'path') {
        yOffset = -0.24;
      }
      tempObject.position.set(block.pos[0], block.pos[1] + yOffset, block.pos[2]);

      const rad = ((block.rotation || 0) * Math.PI) / 180;
      tempObject.rotation.set(0, rad, 0);

      const s = block.scale || [1, 1, 1];
      tempObject.scale.set(s[0], s[1], s[2]);

      tempObject.updateMatrix();
      mesh.setMatrixAt(idx, tempObject.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [list, shape]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, null, list.length]}
      castShadow={false}
      receiveShadow={false}
    >
      <meshStandardMaterial {...matProps} />
    </instancedMesh>
  );
};
