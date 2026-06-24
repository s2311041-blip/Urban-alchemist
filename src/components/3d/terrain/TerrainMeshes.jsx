import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { HILL_VISUAL } from './hillGeometry';
import { CLIFF_ALL_PARTS, CLIFF_GROUND_Y } from './cliffGeometry';
import { useGameStore } from '../../../store/useGameStore';
import { applySeasonTint } from '../../../utils/seasonTint';

/** 1 配置 = 建築 2×2 マス（1m）を基準。defaultScale でさらに拡大可能 */
const FOOTPRINT = 1.0;
const HALF = FOOTPRINT / 2;
const SINK = 0.24;
/** 隣接タイル（0.5m 間隔）へ水面を伸ばすオフセット */
const CELL_BRIDGE = 0.25;

const toLocalNeighbors = (worldNeighbors, rotation) => {
  const has = worldNeighbors ?? {};
  const keyToVec = {
    plusX: [1, 0],
    minusX: [-1, 0],
    plusZ: [0, 1],
    minusZ: [0, -1],
  };
  const vecToKey = {
    '1,0': 'plusX',
    '-1,0': 'minusX',
    '0,1': 'plusZ',
    '0,-1': 'minusZ',
  };
  const quarterTurns = ((((Math.round(rotation / 90) % 4) + 4) % 4));
  const rotateToLocal = (x, z) => {
    if (quarterTurns === 0) return [x, z];
    if (quarterTurns === 1) return [z, -x];
    if (quarterTurns === 2) return [-x, -z];
    return [-z, x];
  };

  const local = { plusX: false, minusX: false, plusZ: false, minusZ: false };
  Object.entries(has).forEach(([key, connected]) => {
    if (!connected || !keyToVec[key]) return;
    const [rx, rz] = rotateToLocal(keyToVec[key][0], keyToVec[key][1]);
    const lk = vecToKey[`${rx},${rz}`];
    if (lk) local[lk] = true;
  });
  return local;
};

const darkenHex = (hex, factor = 0.82) => {
  if (typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) return '#607d8b';
  const r = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * factor)));
  const b = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * factor)));
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default function TerrainMeshes({
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
  terrain = {},
  terrainNeighbors = null,
}) {
  const [progress, setProgress] = useState(isGhost ? 1 : 0);
  const [flash, setFlash] = useState(0);
  const [pulse, setPulse] = useState(1);

  const pos = Array.isArray(position) && position.every(Number.isFinite) ? position : [0, 0, 0];
  const scl = Array.isArray(scale) && scale.every(Number.isFinite) ? scale : [1, 1, 1];
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
    if (isHoveredToEdit) return '#ffeb3b';
    if (selectedEditBlockId || isBuilding) return '#00e5ff';
    return base;
  };

  const emissive = isBuilding ? '#00e5ff' : selectedEditBlockId ? '#00b0ff' : flash > 0 ? '#ffffff' : '#000000';
  const emissiveIntensity = isBuilding ? (1 - progress) : selectedEditBlockId ? (1 + pulse * 1.5) : flash > 0 ? flash * 2 : 0;
  const edgeCol = isHoveredToDelete ? '#ff1744' : isHoveredToEdit ? '#fdd835' : selectedEditBlockId ? '#00b0ff' : isBuilding ? '#00e5ff' : '#333';
  const edgeOpa = isGhost ? 0.18 : 0.38;
  const needsTransparent = isGhost || isBuilding || isHoveredToDelete || isHoveredToEdit;
  const opacity = (isHoveredToDelete || isHoveredToEdit) ? 0.8 : isGhost ? 0.55 : isBuilding ? progress : 1;

  const mp = (base, roughness = 0.8, metalness = 0.05, alpha = opacity) => ({
    color: resolveColor(base),
    transparent: needsTransparent || alpha < 1,
    opacity: alpha,
    emissive,
    emissiveIntensity,
    roughness,
    metalness,
  });

  const events = isGhost ? {} : { onPointerMove, onPointerOut, onClick, onDoubleClick };
  const groupProps = {
    position: pos,
    rotation: [0, rotation * Math.PI / 180, 0],
    scale: scl,
    ...events,
  };

  const fallbackColorByShape = {
    pond_tile: '#4fc3f7',
    stream_tile: '#81d4fa',
    waterfall: '#4fc3f7',
    hill: '#8d6e63',
    mountain: '#8d6e63',
    beach_tile: '#d8c39a',
    bog_tile: '#5d6b3f',
    cliff_face: '#607d8b',
    rock_field: '#757575',
  };
  const tintDomain = shape === 'pond_tile' || shape === 'stream_tile' || shape === 'waterfall'
    ? 'terrainWater'
    : 'terrainSoil';
  const rawBaseColor = terrain?.color ?? fallbackColorByShape[shape] ?? '#90a4ae';
  const baseColor = applySeasonTint(rawBaseColor, season, tintDomain);
  const soilColor = darkenHex(baseColor, 0.68);
  const has = toLocalNeighbors(terrainNeighbors, rotation);
  const bank = HALF - 0.04;

  if (shape === 'pond_tile') {
    return (
      <group {...groupProps}>
        <mesh position={[0, -SINK, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT, 0.02, FOOTPRINT]} />
          <meshStandardMaterial {...mp('#5d4037', 0.9, 0)} />
        </mesh>
        <mesh position={[0, -SINK + 0.01, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT * 0.82, 0.02, FOOTPRINT * 0.82]} />
          <meshStandardMaterial {...mp(baseColor, 0.15, 0.15, Math.min(opacity, 0.82))} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
        {!has.plusX && (
          <mesh position={[bank, -SINK + 0.02, 0]} castShadow={!isGhost}>
            <boxGeometry args={[0.06, 0.05, FOOTPRINT * 0.9]} />
            <meshStandardMaterial {...mp(soilColor)} />
          </mesh>
        )}
        {!has.minusX && (
          <mesh position={[-bank, -SINK + 0.02, 0]} castShadow={!isGhost}>
            <boxGeometry args={[0.06, 0.05, FOOTPRINT * 0.9]} />
            <meshStandardMaterial {...mp(soilColor)} />
          </mesh>
        )}
        {!has.plusZ && (
          <mesh position={[0, -SINK + 0.02, bank]} castShadow={!isGhost}>
            <boxGeometry args={[FOOTPRINT * 0.9, 0.05, 0.06]} />
            <meshStandardMaterial {...mp(soilColor)} />
          </mesh>
        )}
        {!has.minusZ && (
          <mesh position={[0, -SINK + 0.02, -bank]} castShadow={!isGhost}>
            <boxGeometry args={[FOOTPRINT * 0.9, 0.05, 0.06]} />
            <meshStandardMaterial {...mp(soilColor)} />
          </mesh>
        )}
      </group>
    );
  }

  if (shape === 'stream_tile') {
    const alongX = has.plusX || has.minusX;
    const alongZ = has.plusZ || has.minusZ;
    const showX = alongX;
    const showZ = alongZ || (!alongX && !alongZ);

    const extendX = (has.plusX ? CELL_BRIDGE : 0) + (has.minusX ? CELL_BRIDGE : 0);
    const extendZ = (has.plusZ ? CELL_BRIDGE : 0) + (has.minusZ ? CELL_BRIDGE : 0);
    const offsetX = (has.plusX ? CELL_BRIDGE * 0.5 : 0) + (has.minusX ? -CELL_BRIDGE * 0.5 : 0);
    const offsetZ = (has.plusZ ? CELL_BRIDGE * 0.5 : 0) + (has.minusZ ? -CELL_BRIDGE * 0.5 : 0);
    const channelW = 0.44;

    return (
      <group {...groupProps}>
        <mesh position={[0, -SINK, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT, 0.02, FOOTPRINT]} />
          <meshStandardMaterial {...mp('#6d4c41', 0.9, 0)} />
        </mesh>

        {showX && (
          <mesh position={[offsetX, -SINK + 0.01, 0]} castShadow={!isGhost} receiveShadow>
            <boxGeometry args={[FOOTPRINT + extendX, 0.02, channelW]} />
            <meshStandardMaterial {...mp(baseColor, 0.15, 0.12, Math.min(opacity, 0.88))} />
          </mesh>
        )}
        {showZ && (
          <mesh position={[0, -SINK + 0.01, offsetZ]} castShadow={!isGhost} receiveShadow>
            <boxGeometry args={[channelW, 0.02, FOOTPRINT + extendZ]} />
            <meshStandardMaterial {...mp(baseColor, 0.15, 0.12, Math.min(opacity, 0.88))} />
          </mesh>
        )}

        {!has.plusX && (
          <mesh position={[bank, -SINK + 0.02, 0]} castShadow={!isGhost}>
            <boxGeometry args={[0.04, 0.05, FOOTPRINT]} />
            <meshStandardMaterial {...mp(soilColor)} />
          </mesh>
        )}
        {!has.minusX && (
          <mesh position={[-bank, -SINK + 0.02, 0]} castShadow={!isGhost}>
            <boxGeometry args={[0.04, 0.05, FOOTPRINT]} />
            <meshStandardMaterial {...mp(soilColor)} />
          </mesh>
        )}
        {!has.plusZ && (
          <mesh position={[0, -SINK + 0.02, bank]} castShadow={!isGhost}>
            <boxGeometry args={[FOOTPRINT, 0.05, 0.04]} />
            <meshStandardMaterial {...mp(soilColor)} />
          </mesh>
        )}
        {!has.minusZ && (
          <mesh position={[0, -SINK + 0.02, -bank]} castShadow={!isGhost}>
            <boxGeometry args={[FOOTPRINT, 0.05, 0.04]} />
            <meshStandardMaterial {...mp(soilColor)} />
          </mesh>
        )}
      </group>
    );
  }

  if (shape === 'waterfall') {
    return (
      <group {...groupProps}>
        <mesh position={[0, 0.42, -0.28]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT * 0.82, 0.95, 0.42]} />
          <meshStandardMaterial {...mp('#607d8b', 0.85, 0.1)} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
        <mesh position={[0, 0.48, 0.04]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[0.28, 0.82, 0.52]} />
          <meshStandardMaterial {...mp(baseColor, 0.12, 0.2, Math.min(opacity, 0.78))} />
        </mesh>
        <mesh position={[0, -SINK + 0.02, 0.36]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT * 0.62, 0.04, FOOTPRINT * 0.48]} />
          <meshStandardMaterial {...mp(baseColor, 0.1, 0.2, Math.min(opacity, 0.82))} />
        </mesh>
        <mesh position={[0, -SINK, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT, 0.02, FOOTPRINT]} />
          <meshStandardMaterial {...mp('#5d4037', 0.95, 0)} />
        </mesh>
      </group>
    );
  }

  if (shape === 'beach_tile') {
    const sand = applySeasonTint(terrain?.color ?? '#d8c39a', season, 'terrainSoil');
    const beachUserData = { terrainShape: 'beach_tile' };
    return (
      <group {...groupProps} userData={beachUserData}>
        <mesh position={[0, -SINK, 0]} userData={beachUserData} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT, 0.02, FOOTPRINT]} />
          <meshStandardMaterial {...mp(darkenHex(sand, 0.62), 0.92, 0)} />
        </mesh>
        <mesh position={[0, -SINK + 0.015, 0]} userData={beachUserData} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT * 0.96, 0.03, FOOTPRINT * 0.96]} />
          <meshStandardMaterial {...mp(sand, 0.95, 0.01)} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
      </group>
    );
  }

  if (shape === 'bog_tile') {
    const moss = applySeasonTint(terrain?.color ?? '#5d6b3f', season, 'terrainSoil');
    const mud = darkenHex(moss, 0.66);
    const bogUserData = { terrainShape: 'bog_tile' };
    return (
      <group {...groupProps} userData={bogUserData}>
        <mesh position={[0, -SINK, 0]} userData={bogUserData} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT, 0.02, FOOTPRINT]} />
          <meshStandardMaterial {...mp(mud, 0.92, 0)} />
        </mesh>
        <mesh position={[0, -SINK + 0.01, 0]} userData={bogUserData} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT * 0.92, 0.03, FOOTPRINT * 0.92]} />
          <meshStandardMaterial {...mp(moss, 0.88, 0.01)} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
        <mesh position={[0.06, -SINK + 0.018, -0.04]} userData={bogUserData} castShadow={!isGhost} receiveShadow>
          <cylinderGeometry args={[0.18, 0.2, 0.02, 20]} />
          <meshStandardMaterial {...mp('#38482c', 0.55, 0.08, Math.min(opacity, 0.9))} />
        </mesh>
      </group>
    );
  }

  if (shape === 'cliff_face') {
    const rock = applySeasonTint(terrain?.color ?? '#607d8b', season, 'terrainSoil');
    const cliffMp = (base, roughness = 0.9, metalness = 0.05, offset = 0) => ({
      ...mp(base, roughness, metalness),
      polygonOffset: offset !== 0,
      polygonOffsetFactor: offset,
      polygonOffsetUnits: offset,
    });
    const cliffMats = {
      base: cliffMp(rock, 0.9, 0.06, 0),
      mid: cliffMp(darkenHex(rock, 0.78), 0.92, 0.05, 1),
      dark: cliffMp(darkenHex(rock, 0.58), 0.94, 0.04, 0),
      light: cliffMp(darkenHex(rock, 0.92), 0.86, 0.08, 2),
    };

    return (
      <group {...groupProps}>
        {CLIFF_ALL_PARTS.map((part, i) => (
          <mesh
            key={`cliff-part-${i}`}
            position={part.pos}
            rotation={part.rot}
            castShadow={!isGhost}
            receiveShadow
          >
            <boxGeometry args={part.args} />
            <meshStandardMaterial {...cliffMats[part.mat] ?? cliffMats.base} />
          </mesh>
        ))}
        <mesh position={[0, CLIFF_GROUND_Y, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT, 0.03, FOOTPRINT]} />
          <meshStandardMaterial {...mp('#4e342e', 0.95, 0)} />
        </mesh>
      </group>
    );
  }

  if (shape === 'rock_field') {
    const rock = applySeasonTint(terrain?.color ?? '#757575', season, 'terrainSoil');
    const darkRock = darkenHex(rock, 0.78);
    return (
      <group {...groupProps}>
        <mesh position={[0, -SINK, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[FOOTPRINT, 0.02, FOOTPRINT]} />
          <meshStandardMaterial {...mp('#5d4037', 0.95, 0)} />
        </mesh>
        <mesh position={[-0.16, -SINK + 0.11, -0.08]} castShadow={!isGhost} receiveShadow>
          <dodecahedronGeometry args={[0.17, 0]} />
          <meshStandardMaterial {...mp(rock, 0.85, 0.06)} />
        </mesh>
        <mesh position={[0.14, -SINK + 0.09, 0.1]} castShadow={!isGhost} receiveShadow>
          <dodecahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial {...mp(darkRock, 0.88, 0.05)} />
        </mesh>
        <mesh position={[0.02, -SINK + 0.06, -0.02]} castShadow={!isGhost} receiveShadow>
          <dodecahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial {...mp('#9e9e9e', 0.84, 0.04)} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
      </group>
    );
  }

  if (shape === 'hill' || shape === 'mountain') {
    const soil = darkenHex(baseColor, 0.72);
    const grass = terrain?.color ? baseColor : '#81c784';
    const moss = darkenHex(grass, 0.9);
    const v = HILL_VISUAL;

    const hillUserData = { terrainShape: 'hill' };

    return (
      <group {...groupProps} userData={hillUserData}>
        <mesh position={[0, v.base.y, 0]} userData={hillUserData} castShadow={!isGhost} receiveShadow>
          <cylinderGeometry args={[v.base.bottomR, v.base.topR, 0.08, 32]} />
          <meshStandardMaterial {...mp(soil, 0.92, 0.03)} />
        </mesh>

        <mesh position={[0, v.mid.y, 0]} userData={hillUserData} castShadow={!isGhost} receiveShadow>
          <cylinderGeometry args={[v.mid.bottomR, v.mid.topR, v.mid.height, 32]} />
          <meshStandardMaterial {...mp(moss, 0.9, 0)} />
        </mesh>

        <mesh position={[0, v.upper.y, 0]} userData={hillUserData} castShadow={!isGhost} receiveShadow>
          <cylinderGeometry args={[v.upper.bottomR, v.upper.topR, v.upper.height, 32]} />
          <meshStandardMaterial {...mp(grass, 0.9, 0)} />
        </mesh>

        <mesh position={[0, v.plateau.y, 0]} userData={hillUserData} castShadow={!isGhost} receiveShadow>
          <cylinderGeometry args={[v.plateau.radius, v.plateau.radius, v.plateau.height, 32]} />
          <meshStandardMaterial {...mp('#a5d6a7', 0.9, 0)} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
      </group>
    );
  }

  return null;
}
