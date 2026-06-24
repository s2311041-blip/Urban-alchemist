import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { SPECIES } from '../../../constants/natureData';
import { useGameStore } from '../../../store/useGameStore';
import { applySeasonTint } from '../../../utils/seasonTint';

const TRUNK = '#5d4037';
const STEM  = '#4caf50';

const getSpecies = (shape, speciesId) => {
  const list = SPECIES[shape];
  if (!list) return {};
  return list.find(s => s.id === speciesId) ?? list[0] ?? {};
};

export default function PlantMeshes({
  position,
  shape,
  rotation = 0,
  scale = [1, 1, 1],
  isGhost = false,
  isHoveredToDelete = false,
  isHoveredToEdit = false,
  selectedEditBlockId = false,
  onPointerMove,
  onPointerOut,
  onClick,
  onDoubleClick,
  nature = {},
}) {
  const [progress, setProgress] = useState(isGhost ? 1 : 0);
  const [flash,    setFlash]    = useState(0);
  const [pulse,    setPulse]    = useState(1);

  const pos = Array.isArray(position) && position.every(Number.isFinite) ? position : [0, 0, 0];
  const scl = Array.isArray(scale)    && scale.every(Number.isFinite)    ? scale    : [1, 1, 1];
  const sp  = getSpecies(shape, nature?.species);
  const customColor = typeof nature?.color === 'string' ? nature.color : null;
  const season = useGameStore((state) => state.worldTime.season);

  useFrame((state, delta) => {
    if (!isGhost && progress < 1) {
      const next = Math.min(progress + delta * 1.5, 1);
      setProgress(next);
      if (next === 1) setFlash(1);
    }
    if (flash > 0) setFlash(Math.max(flash - delta * 3, 0));
    if (selectedEditBlockId) setPulse(0.6 + Math.sin(state.clock.elapsedTime * 6) * 0.4);
  });

  const isBuilding = progress < 1 && !isGhost;

  const resolveColor = (base) => {
    if (isHoveredToDelete) return '#ff5252';
    if (isHoveredToEdit)   return '#ffeb3b';
    if (selectedEditBlockId || isBuilding) return '#00e5ff';
    return base;
  };

  const emissive  = isBuilding ? '#00e5ff' : selectedEditBlockId ? '#00b0ff' : flash > 0 ? '#ffffff' : '#000000';
  const emissiveI = isBuilding ? (1 - progress) : selectedEditBlockId ? (1 + pulse * 1.5) : flash > 0 ? flash * 2 : 0;
  const needsTransparent = isGhost || isBuilding || isHoveredToDelete || isHoveredToEdit;
  const opacity   = (isHoveredToDelete || isHoveredToEdit) ? 0.8 : isGhost ? 0.55 : isBuilding ? progress : 1;

  const mp = (base, rough = 0.8) => ({
    color: resolveColor(base),
    transparent: needsTransparent,
    opacity,
    emissive,
    emissiveIntensity: emissiveI,
    roughness: rough,
    metalness: 0,
  });

  const edgeCol = isHoveredToDelete ? '#ff1744' : isHoveredToEdit ? '#fdd835' : selectedEditBlockId ? '#00b0ff' : isBuilding ? '#00e5ff' : '#333';
  const edgeOpa = isGhost ? 0.15 : 0.35;

  const events = isGhost ? {} : { onPointerMove, onPointerOut, onClick, onDoubleClick };

  const groupProps = {
    position: pos,
    rotation: [0, rotation * Math.PI / 180, 0],
    scale: scl,
    ...events,
  };

  const tintLeaf = (hex) => applySeasonTint(hex, season, 'natureLeaf');
  const tintFlower = (hex) => applySeasonTint(hex, season, 'natureFlower');
  const tintGround = (hex) => applySeasonTint(hex, season, 'natureGround');

  if (shape === 'turf') {
    const baseColor = tintGround(sp.color ?? '#66bb6a');
    const accentColor = tintGround(sp.accentColor ?? '#7cb342');
    const tufts = [
      [-0.16, -0.24, -0.14], [-0.03, -0.24, -0.17], [0.12, -0.24, -0.13],
      [-0.18, -0.24,  0.00], [0.00, -0.24,  0.00], [0.16, -0.24,  0.02],
      [-0.14, -0.24,  0.14], [0.02, -0.24,  0.15], [0.15, -0.24,  0.12],
    ];
    return (
      <group {...groupProps}>
        {/* 下地 */}
        <mesh position={[0, -0.245, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[0.5, 0.02, 0.5]} />
          <meshStandardMaterial {...mp(baseColor)} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>

        {/* 草の束 */}
        {tufts.map((p, idx) => (
          <group key={idx} position={p}>
            <mesh castShadow={!isGhost}>
              <boxGeometry args={[0.02, 0.08, 0.004]} />
              <meshStandardMaterial {...mp(baseColor, 0.95)} />
            </mesh>
            <mesh castShadow={!isGhost} rotation={[0, Math.PI / 3, 0]}>
              <boxGeometry args={[0.02, 0.07, 0.004]} />
              <meshStandardMaterial {...mp(accentColor, 0.95)} />
            </mesh>
          </group>
        ))}

        {/* クローバーらしい葉（clover 時のみ） */}
        {nature?.species === 'clover' && (
          <>
            {[[-0.08, -0.20, 0.06], [0.07, -0.205, -0.03], [0.11, -0.20, 0.09]].map((p, idx) => (
              <mesh key={`leaf-${idx}`} position={p} castShadow={!isGhost}>
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshStandardMaterial {...mp(tintLeaf('#9ccc65'), 0.85)} />
              </mesh>
            ))}
          </>
        )}
      </group>
    );
  }

  if (shape === 'flower') {
    return (
      <group {...groupProps}>
        {/* 茎 */}
        <mesh position={[0, -0.1, 0]} castShadow={!isGhost}>
          <cylinderGeometry args={[0.012, 0.018, 0.28, 7]} />
          <meshStandardMaterial {...mp(tintLeaf(sp.stemColor ?? STEM))} />
        </mesh>
        {/* 花頭 */}
        <mesh position={[0, 0.08, 0]} castShadow={!isGhost}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial {...mp(tintFlower(customColor ?? sp.headColor ?? '#ef5350'))} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
      </group>
    );
  }

  if (shape === 'shrub') {
    return (
      <group {...groupProps}>
        {/* 細幹 */}
        <mesh position={[0, -0.18, 0]} castShadow={!isGhost}>
          <cylinderGeometry args={[0.03, 0.04, 0.12, 6]} />
          <meshStandardMaterial {...mp(sp.baseColor ?? TRUNK)} />
        </mesh>
        {/* 葉球 */}
        <mesh position={[0, 0.02, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <sphereGeometry args={[0.22, 12, 10]} />
          <meshStandardMaterial {...mp(tintLeaf(customColor ?? sp.leafColor ?? '#4caf50'))} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
      </group>
    );
  }

  if (shape === 'hedge') {
    return (
      <group {...groupProps}>
        <mesh position={[0, -0.05, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshStandardMaterial {...mp(tintLeaf(sp.color ?? '#2e7d32'))} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
      </group>
    );
  }

  if (shape === 'street_tree') {
    return (
      <group {...groupProps}>
        {/* 幹 */}
        <mesh position={[0, 0, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <cylinderGeometry args={[0.035, 0.046, 0.42, 8]} />
          <meshStandardMaterial {...mp(sp.trunkColor ?? TRUNK, 0.9)} />
        </mesh>
        {/* 樹冠 */}
        <mesh position={[0, 0.28, 0]} castShadow={!isGhost}>
          <sphereGeometry args={[0.19, 14, 12]} />
          <meshStandardMaterial {...mp(tintLeaf(customColor ?? sp.crownColor ?? '#388e3c'))} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
      </group>
    );
  }

  if (shape === 'canopy_tree') {
    const crown = tintLeaf(customColor ?? sp.crownColor ?? '#2e7d32');
    return (
      <group {...groupProps}>
        {/* 幹 */}
        <mesh position={[0, -0.04, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <cylinderGeometry args={[0.045, 0.06, 0.46, 8]} />
          <meshStandardMaterial {...mp(sp.trunkColor ?? TRUNK, 0.9)} />
        </mesh>
        {/* 主樹冠 */}
        <mesh position={[0, 0.3, 0]} castShadow={!isGhost}>
          <sphereGeometry args={[0.24, 14, 12]} />
          <meshStandardMaterial {...mp(crown)} />
        </mesh>
        {/* サブ樹冠 左 */}
        <mesh position={[-0.16, 0.2, 0.04]} castShadow={!isGhost}>
          <sphereGeometry args={[0.15, 10, 9]} />
          <meshStandardMaterial {...mp(crown)} />
        </mesh>
        {/* サブ樹冠 右 */}
        <mesh position={[0.16, 0.2, -0.04]} castShadow={!isGhost}>
          <sphereGeometry args={[0.15, 10, 9]} />
          <meshStandardMaterial {...mp(crown)} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
      </group>
    );
  }

  return null;
}
