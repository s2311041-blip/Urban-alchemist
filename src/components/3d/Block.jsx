import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Edges } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { isNatureShape } from '../../constants/natureData';
import { PlantMeshes, getNatureCollider } from './nature';
import { isAgriShape } from '../../constants/agriData';
import { AgriMeshes, getAgriCollider } from './agri';
import { isTerrainShape } from '../../constants/terrainData';
import { TerrainMeshes, getTerrainCollider } from './terrain';
import { getDayNightState } from '../../utils/dayNight';
import { getHoverboardGlowFromBlock } from '../../utils/hoverboardGlow';
import { BLOCK_MATERIALS } from '../../constants/gameData';
import { ART_DIRECTION } from '../../constants/buildFeatureFlags';
import { PALETTE } from '../../constants/artDirection';
import { ANCHOR_POINTS } from './blockAnchors';
import { getBlockTexture } from '../../utils/textureLoader';
import { getPixelTexture } from '../../utils/textureGenerator';
import {
  getStationCollider,
  getStationMeshPosition,
  isStationShape,
  renderStationBuilding,
  renderStationGate,
  renderStationLayout,
  renderStationPlatform,
  renderStationStairs,
} from './placeShapes/stationShapes';
import {
  getBusStopCollider,
  getBusStopMeshPosition,
  isBusStopShape,
  renderBusStopLayout,
} from './placeShapes/busShapes';
import {
  getPlazaCollider,
  getPlazaMeshPosition,
  isPlazaShape,
  renderPlazaLayout,
} from './placeShapes/plazaShapes';
import {
  getRoadCollider,
  getRoadMeshPosition,
  isRoadShape,
  renderRoadLayout,
} from './placeShapes/roadShapes';
import {
  getLaneCollider,
  getLaneMeshPosition,
  isLaneShape,
  renderLaneLayout,
} from './placeShapes/laneShapes';
import {
  getParkCollider,
  getParkMeshPosition,
  isParkShape,
  renderParkLayout,
} from './placeShapes/parkShapes';
import {
  getWaterfrontCollider,
  getWaterfrontMeshPosition,
  isWaterfrontShape,
  renderWaterfrontLayout,
} from './placeShapes/waterfrontShapes';
import {
  getCampusCollider,
  getCampusMeshPosition,
  isCampusShape,
  renderCampusLayout,
} from './placeShapes/campusShapes';
import {
  getCommerceCollider,
  getCommerceMeshPosition,
  isCommerceShape,
  renderCommerceLayout,
} from './placeShapes/commerceShapes';
import { MergedLayout } from './MergedLayout';


export const Block = React.memo(({
  id,
  position: rawPosition,
  shape = 'block',
  material = 'stone',
  rotation: rawRotation = 0,
  text = '',
  isGhost,
  onPointerMove,
  onPointerOut,
  onClick,
  onDoubleClick,
  scale: rawScale = [1, 1, 1],
  isHoveredToDelete,
  isHoveredToEdit,
  selectedEditBlockId,
  diagonalPoints,
  diagonalFirstPoint,
  hoveredAnchor,
  onSelectAnchor,
  onHoverAnchor,
  noPhysics,
  nature = {},
  agri = {},
  agriNeighbors = null,
  terrain = {},
  terrainNeighbors = null,
  railNeighbors = null,
  hoverboard = {},
  presetNeedType = null,
  presetExpressionResolved = false,
  glassColor = null,
}) => {
  const position = rawPosition && Array.isArray(rawPosition) && rawPosition.length === 3 && rawPosition.every(Number.isFinite) ? rawPosition : [0, 0, 0];
  const scale = rawScale && Array.isArray(rawScale) && rawScale.length === 3 && rawScale.every(Number.isFinite) ? rawScale : [1, 1, 1];
  const [hovered, setHovered] = useState(false);
  const rotation = Number.isFinite(rawRotation) ? rawRotation : 0;

  const isHoverboardStation = shape === 'hoverboard_station';
  const isHoverboarding = useGameStore(state => isHoverboardStation ? state.isHoverboarding : false);
  const currentHoverboardStationId = useGameStore(state => isHoverboardStation ? state.currentHoverboardStationId : null);
  const needsNight = material === 'light' || material === 'mana' || shape === 'hoverboard_station' || 
    isStationShape(shape) || isBusStopShape(shape) || isPlazaShape(shape) || isRoadShape(shape) || 
    isLaneShape(shape) || isParkShape(shape) || isWaterfrontShape(shape) || isCampusShape(shape) || 
    isCommerceShape(shape);

  const isNight = useGameStore(state => {
    if (!needsNight) return false;
    return getDayNightState(state.worldTime.timeOfDay).nightFactor > 0.5;
  });
  const nightFactor = isNight ? 1 : 0;
  const { camera, scene } = useThree();

  const [progress, setProgress] = useState(isGhost ? 1 : 0)
  const [flash, setFlash] = useState(0)
  const [pulse, setPulse] = useState(1)
  const [transformTarget, setTransformTarget] = useState(null);
  const meshRef = useRef();
  const doorRef = useRef();
  const hoverboardBoardRef = useRef();

  const handlersRef = useRef({ onPointerMove, onPointerOut, onClick, onDoubleClick });
  useEffect(() => {
    handlersRef.current = { onPointerMove, onPointerOut, onClick, onDoubleClick };
  });

  const stableHandlers = useMemo(() => ({
    onPointerMove: (e) => handlersRef.current.onPointerMove?.(e),
    onPointerOut: (e) => handlersRef.current.onPointerOut?.(e),
    onClick: (e) => handlersRef.current.onClick?.(e),
    onDoubleClick: (e) => handlersRef.current.onDoubleClick?.(e),
  }), []);

  const mat = BLOCK_MATERIALS[material] || BLOCK_MATERIALS.stone;

  useFrame((state, delta) => {
    if (!isGhost && progress < 1) {
      const nextProgress = Math.min(progress + delta * 1.5, 1) 
      setProgress(nextProgress)
      if (nextProgress === 1) setFlash(1) 
    }
    if (flash > 0) setFlash(Math.max(flash - delta * 3, 0)) 
    
    if (selectedEditBlockId) {
      setPulse(0.6 + Math.sin(state.clock.elapsedTime * 6) * 0.4)
    }

    if (shape === 'door' && !isGhost && doorRef.current) {
      const worldPos = new THREE.Vector3();
      doorRef.current.getWorldPosition(worldPos);
      let dist = Infinity;
      const avatar = scene.getObjectByName('avatar');
      if (avatar) {
        const avatarPos = new THREE.Vector3();
        avatar.getWorldPosition(avatarPos);
        dist = avatarPos.distanceTo(worldPos);
      } else {
        dist = camera.position.distanceTo(worldPos);
      }
      const targetY = dist < 2.5 ? 1.5 * 1.5 : 1.5 / 2; // doorH = 1.5
      doorRef.current.position.y = THREE.MathUtils.lerp(doorRef.current.position.y, targetY, delta * 10);
    }

    if (shape === 'hoverboard_station' && !isGhost && hoverboardBoardRef.current) {
      hoverboardBoardRef.current.position.y = 0.02 + Math.sin(state.clock.elapsedTime * 2.4) * 0.018;
    }
  })

  useEffect(() => {
    if (selectedEditBlockId === id) {
      setTransformTarget(meshRef.current ?? null);
      return;
    }
    setTransformTarget(null);
  }, [id, selectedEditBlockId]);

  const isBuilding = progress < 1 && !isGhost

  const getGeometry = () => {
    if (shape === 'half') return <boxGeometry args={[0.5, 0.25, 0.5]} />;
    if (shape === 'pole') return <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />;
    if (shape === 'slope') {
      const s = new THREE.Shape();
      s.moveTo(-0.25, -0.25);
      s.lineTo(0.25, -0.25);
      s.lineTo(-0.25, 0.25);
      s.lineTo(-0.25, -0.25);
      const extrudeSettings = { depth: 0.5, bevelEnabled: false };
      return <extrudeGeometry args={[s, extrudeSettings]} />;
    }
    if (shape === 'leaf') return <sphereGeometry args={[0.25, 16, 16]} />;
    if (shape === 'path') return <boxGeometry args={[0.5, 0.02, 0.5]} />;
    if (shape === 'diagonal') {
      return <boxGeometry args={[0.5, 0.05, 0.05]} />;
    }
    return <boxGeometry args={[0.5, 0.5, 0.5]} />;
  };

  const meshPosition = useMemo(() => {
    if (shape === 'station_layout' || shape === 'station_platform' || shape === 'station_stairs' || shape === 'station_gate' || shape === 'station_building') return getStationMeshPosition(shape);
    if (shape === 'bus_stop_layout') return getBusStopMeshPosition(shape);
    if (shape === 'plaza_layout') return getPlazaMeshPosition(shape);
    if (shape === 'road_layout') return getRoadMeshPosition(shape);
    if (shape === 'lane_layout') return getLaneMeshPosition(shape);
    if (shape === 'park_layout') return getParkMeshPosition(shape);
    if (shape === 'waterfront_layout') return getWaterfrontMeshPosition(shape);
    if (shape === 'campus_layout') return getCampusMeshPosition(shape);
    if (shape === 'commerce_layout') return getCommerceMeshPosition(shape);
    if (shape === 'door') return [0, -0.25, 0.25];
    if (shape === 'hoverboard_station') return [0, -0.22, 0];
    if (shape === 'bench') return [0, -0.15, 0];
    if (shape === 'light_pole') return [0, 0, 0];
    if (shape === 'sign_post') return [0, -0.24, 0];
    if (shape === 'ferry_dock') return [0, -0.24, 0];
    if (shape === 'half') return [0, -0.125, 0];
    if (shape === 'slope') return [0, 0, -0.25];
    if (shape === 'path' || shape === 'rail') return [0, -0.24, 0];
    if (isAgriShape(shape)) return [0, -0.24, 0];
    return [0, 0, 0];
  }, [shape]);

  const baseRotation = useMemo(() => (
    shape === 'slope' ? [0, (rotation - 90) * Math.PI / 180, 0] : [0, rotation * Math.PI / 180, 0]
  ), [shape, rotation]);

  const meshRotation = useMemo(() => {
    if (shape === 'bench' || shape === 'sign_post') return [0, Math.PI, 0];
    if (shape === 'ferry_dock') return [0, Math.PI / 2, 0];
    return [0, 0, 0];
  }, [shape]);

  const getCollider = () => {
    const safeScale = scale || [1, 1, 1];
    const sx = safeScale[0] ?? 1;
    const sy = safeScale[1] ?? 1;
    const sz = safeScale[2] ?? 1;

    if (shape === 'diagonal' && diagonalPoints && diagonalPoints.length === 2 && Array.isArray(diagonalPoints[0]) && Array.isArray(diagonalPoints[1]) && diagonalPoints[0].length === 3 && diagonalPoints[1].length === 3) {
      const p1 = new THREE.Vector3().fromArray(diagonalPoints[0]);
      const p2 = new THREE.Vector3().fromArray(diagonalPoints[1]);
      const L = p1.distanceTo(p2);
      const thicknessX = sx * 0.05;
      const thicknessY = sy * 0.05;
      return <CuboidCollider args={[thicknessX / 2, L / 2, thicknessY / 2]} />;
    }

    if (shape === 'slope') {
      const length = 0.25 * Math.sqrt(sx * sx + sy * sy);
      const angle = -Math.atan2(sy, sx);
      return (
        <CuboidCollider 
          args={[length, 0.02 * sy, 0.25 * sz]} 
          position={[0, 0, -0.25 * sz]} 
          rotation={[0, 0, angle]} 
        />
      );
    }

    if (shape === 'half') return <CuboidCollider args={[0.25 * sx, 0.125 * sy, 0.25 * sz]} position={[0, -0.125 * sy, 0]} />;
    if (shape === 'pole') return <CuboidCollider args={[0.05 * sx, 0.25 * sy, 0.05 * sz]} />;
    if (shape === 'path' || shape === 'rail') return <CuboidCollider args={[0.25 * sx, 0.01 * sy, 0.25 * sz]} position={[0, -0.24 * sy, 0]} />;
    if (shape === 'door') {
      return (
        <group>
          <CuboidCollider args={[0.05, 0.8 * sy, 0.25 * sz]} position={[-0.5 * sx, 0.8 * sy, 0]} />
          <CuboidCollider args={[0.05, 0.8 * sy, 0.25 * sz]} position={[0.5 * sx, 0.8 * sy, 0]} />
          <CuboidCollider args={[0.55 * sx, 0.05, 0.25 * sz]} position={[0, (1.6 * sy - 0.05), 0]} />
        </group>
      );
    }
    if (shape === 'bench') return <CuboidCollider args={[0.4 * sx, 0.125 * sy, 0.15 * sz]} position={[0, -0.125 * sy, 0]} />;
    if (shape === 'hoverboard_station') return <CuboidCollider args={[0.25 * sx, 0.05 * sy, 0.25 * sz]} position={[0, -0.2 * sy, 0]} />;
    if (shape === 'ferry_dock') return <CuboidCollider args={[0.3 * sx, 0.09 * sy, 0.42 * sz]} position={[0, -0.16 * sy, 0]} />;
    if (shape === 'light_pole') return <CuboidCollider args={[0.05 * sx, 0.75 * sy, 0.05 * sz]} position={[0, 0.5 * sy, 0]} />;
    if (shape === 'sign_post') return <CuboidCollider args={[0.08 * sx, 0.45 * sy, 0.06 * sz]} position={[0, 0.25 * sy, 0]} />;
    if (isStationShape(shape)) {
      const stationCollider = getStationCollider(shape, sx, sy, sz, presetNeedType, presetExpressionResolved);
      if (stationCollider) return stationCollider;
    }
    if (isBusStopShape(shape)) {
      const busStopCollider = getBusStopCollider(shape, sx, sy, sz, presetNeedType, presetExpressionResolved);
      if (busStopCollider) return busStopCollider;
    }
    if (isPlazaShape(shape)) {
      const plazaCollider = getPlazaCollider(shape, sx, sy, sz);
      if (plazaCollider) return plazaCollider;
    }
    if (isRoadShape(shape)) {
      const roadCollider = getRoadCollider(shape, sx, sy, sz, presetNeedType, presetExpressionResolved);
      if (roadCollider) return roadCollider;
    }
    if (isLaneShape(shape)) {
      const laneCollider = getLaneCollider(shape, sx, sy, sz, presetNeedType, presetExpressionResolved);
      if (laneCollider) return laneCollider;
    }
    if (isParkShape(shape)) {
      const parkCollider = getParkCollider(shape, sx, sy, sz);
      if (parkCollider) return parkCollider;
    }
    if (isWaterfrontShape(shape)) {
      const waterfrontCollider = getWaterfrontCollider(shape, sx, sy, sz);
      if (waterfrontCollider) return waterfrontCollider;
    }
    if (isCampusShape(shape)) {
      const campusCollider = getCampusCollider(shape, sx, sy, sz);
      if (campusCollider) return campusCollider;
    }
    if (isCommerceShape(shape)) {
      const commerceCollider = getCommerceCollider(shape, sx, sy, sz);
      if (commerceCollider) return commerceCollider;
    }
    return <CuboidCollider args={[0.25 * sx, 0.25 * sy, 0.25 * sz]} />;
  };

  const setSignTextPrompt = useGameStore(state => state.setSignTextPrompt);

  const handleClick = useCallback((e) => {
    e.stopPropagation();

    if (shape === 'sign_post' && !isGhost) {
      setSignTextPrompt(id);
      return;
    }

    if (isGhost) return;

    // 編集モードでのクリック吸収は建築中のみ有効にする
    const state = useGameStore.getState();
    if (state.buildMode && state.selectedShape === 'edit' && typeof id !== 'undefined') {
      state.setSelectedEditBlockId(id);
      return;
    }
    if (onClick) onClick(e);
  }, [shape, isGhost, id, onClick, setSignTextPrompt]);

  const laserY = -0.25 + (progress * 0.5) 

  const renderRail = () => {
    const sleeperColor = '#5d4037';
    const railColor = material === 'mana' ? '#00e5ff' : '#78909c';
    const neighborWorld = railNeighbors || { plusX: false, minusX: false, plusZ: false, minusZ: false };

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

    const localNeighbors = { plusX: false, minusX: false, plusZ: false, minusZ: false };
    Object.entries(neighborWorld).forEach(([key, connected]) => {
      if (!connected || !keyToVec[key]) return;
      const [rx, rz] = rotateToLocal(keyToVec[key][0], keyToVec[key][1]);
      const lk = vecToKey[`${rx},${rz}`];
      if (lk) localNeighbors[lk] = true;
    });

    const hasAny = Object.values(localNeighbors).some(Boolean);
    const dirs = hasAny ? localNeighbors : { plusX: false, minusX: false, plusZ: true, minusZ: true };
    const all = dirs.plusX && dirs.minusX && dirs.plusZ && dirs.minusZ;
    const sleepersZ = all ? [-0.18, 0, 0.18] : [-0.125, 0.125];
    const sleepersX = all ? [-0.18, 0, 0.18] : [-0.125, 0.125];

    return (
      <group position={meshPosition} onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={handleClick} onDoubleClick={onDoubleClick}>
        <mesh>
          <boxGeometry args={[0.5, 0.01, 0.5]} />
          <meshStandardMaterial color={mat.color} transparent opacity={isGhost ? 0.3 : 0.05} />
        </mesh>

        {(dirs.plusZ || dirs.minusZ) && sleepersZ.map((zOffset, i) => (
          <mesh key={`sz-${i}`} position={[0, 0.02, zOffset]}>
            <boxGeometry args={[0.45, 0.03, 0.06]} />
            <meshStandardMaterial color={sleeperColor} roughness={0.9} />
          </mesh>
        ))}
        {(dirs.plusX || dirs.minusX) && sleepersX.map((xOffset, i) => (
          <mesh key={`sx-${i}`} position={[xOffset, 0.02, 0]}>
            <boxGeometry args={[0.06, 0.03, 0.45]} />
            <meshStandardMaterial color={sleeperColor} roughness={0.9} />
          </mesh>
        ))}

        {[ -0.12, 0.12 ].map((xOffset, i) => (
          <group key={`rz-${i}`}>
            {(dirs.plusZ || dirs.minusZ) && (
              <mesh position={[xOffset, 0.045, (dirs.plusZ && dirs.minusZ) ? 0 : (dirs.plusZ ? 0.125 : -0.125)]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.01, 0.01, (dirs.plusZ && dirs.minusZ) ? 0.5 : 0.25, 6]} />
                <meshStandardMaterial
                  color={railColor}
                  metalness={0.8}
                  roughness={0.2}
                  emissive={material === 'mana' ? '#00e5ff' : '#000'}
                  emissiveIntensity={material === 'mana' ? 1.5 : 0}
                />
              </mesh>
            )}
          </group>
        ))}

        {[ -0.12, 0.12 ].map((zOffset, i) => (
          <group key={`rx-${i}`}>
            {(dirs.plusX || dirs.minusX) && (
              <mesh position={[(dirs.plusX && dirs.minusX) ? 0 : (dirs.plusX ? 0.125 : -0.125), 0.045, zOffset]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.01, 0.01, (dirs.plusX && dirs.minusX) ? 0.5 : 0.25, 6]} />
                <meshStandardMaterial
                  color={railColor}
                  metalness={0.8}
                  roughness={0.2}
                  emissive={material === 'mana' ? '#00e5ff' : '#000'}
                  emissiveIntensity={material === 'mana' ? 1.5 : 0}
                />
              </mesh>
            )}
          </group>
        ))}
      </group>
    );
  };

  const renderDoor = () => {
    // ゲートを人が通れる「ちょうど良いサイズ（横1.2, 高さ1.5）」に調整
    const doorW = 1.2;
    const doorH = 1.5;
    const frameT = 0.1; // 枠の厚み
    return (
      <group position={meshPosition} rotation={meshRotation} onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={handleClick} onDoubleClick={onDoubleClick}>
        {/* 左枠 */}
        <mesh position={[-doorW/2 - frameT/2, doorH/2, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <boxGeometry args={[frameT, doorH, 0.3]} />
          <meshStandardMaterial color="#37474f" metalness={0.8} roughness={0.2} transparent={isGhost} opacity={isGhost ? 0.6 : 1} />
        </mesh>
        {/* 右枠 */}
        <mesh position={[doorW/2 + frameT/2, doorH/2, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <boxGeometry args={[frameT, doorH, 0.3]} />
          <meshStandardMaterial color="#37474f" metalness={0.8} roughness={0.2} transparent={isGhost} opacity={isGhost ? 0.6 : 1} />
        </mesh>
        {/* 上枠 */}
        <mesh position={[0, doorH + frameT/2, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <boxGeometry args={[doorW + frameT*2, frameT, 0.3]} />
          <meshStandardMaterial color="#37474f" metalness={0.8} roughness={0.2} transparent={isGhost} opacity={isGhost ? 0.6 : 1} />
        </mesh>
        {/* 開閉するドア部分（光のバリア） */}
        <mesh ref={doorRef} position={[0, doorH/2, 0]}>
          <boxGeometry args={[doorW, doorH, 0.05]} />
          <meshStandardMaterial color="#00e5ff" transparent opacity={0.6} emissive="#00e5ff" emissiveIntensity={1.0} />
        </mesh>
      </group>
    );
  };

  const renderBench = () => {
    const customTexture = getBlockTexture(material);
    return (
      <group position={meshPosition} rotation={meshRotation} onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={handleClick} onDoubleClick={onDoubleClick}>
        <mesh position={[0, 0, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <boxGeometry args={[0.8, 0.08, 0.35]} />
          <meshStandardMaterial 
            map={customTexture || null} 
            color={customTexture ? '#ffffff' : '#e0f7fa'} 
            transparent={isGhost} 
            opacity={isGhost ? 0.6 : 1} 
            emissive={customTexture ? '#ffffff' : '#00e5ff'} 
            emissiveMap={customTexture || null}
            emissiveIntensity={customTexture ? 0.25 : 0.5} 
          />
        </mesh>
        {/* 脚 */}
        <mesh position={[-0.3, -0.15, 0]} castShadow={!isGhost}>
          <cylinderGeometry args={[0.02, 0.01, 0.25, 4]} />
          <meshStandardMaterial color="#fff" emissive="#00e5ff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.3, -0.15, 0]} castShadow={!isGhost}>
          <cylinderGeometry args={[0.02, 0.01, 0.25, 4]} />
          <meshStandardMaterial color="#fff" emissive="#00e5ff" emissiveIntensity={0.5} />
        </mesh>
      </group>
    );
  };

  const renderLightPole = () => {
    const sx = 1;
    const sy = 1;
    const sz = 1;
    const bottomY = -0.25;
    const lampIntensity = isGhost ? 0.5 : (0.6 + nightFactor * 1.8);
    const pointLightIntensity = 0.2 + nightFactor * 2.4;
    return (
      <group position={meshPosition} rotation={meshRotation} onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={handleClick} onDoubleClick={onDoubleClick}>
        <mesh position={[0, bottomY + 0.75 * sy, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <cylinderGeometry args={[0.02 * sx, 0.03 * sx, 1.5 * sy, 8]} />
          <meshStandardMaterial color="#5d4037" roughness={0.9} transparent={isGhost} opacity={isGhost ? 0.6 : 1} />
        </mesh>
        <mesh position={[0, bottomY + 1.5 * sy + 0.1, 0]}>
          <octahedronGeometry args={[0.1 * Math.max(sx, sz)]} />
          <meshStandardMaterial color="#fff59d" emissive="#ffeb3b" emissiveIntensity={lampIntensity} transparent={isGhost} opacity={isGhost ? 0.8 : 1} />
          {!isGhost && !isBuilding && (
            <pointLight distance={6 * Math.max(sx, sz)} intensity={pointLightIntensity} color="#ffeb3b" />
          )}
        </mesh>
      </group>
    );
  };

  const renderHoverboardStation = () => {
    const isHoverboardInUseHere = isHoverboarding
      && currentHoverboardStationId
      && id
      && currentHoverboardStationId === id;
    const boardGlow = getHoverboardGlowFromBlock({ hoverboard, material });
    const pedestalCenterY = -0.2;
    const boardCenterY = 0.02;
    return (
      <group position={meshPosition} rotation={meshRotation} onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={handleClick} onDoubleClick={onDoubleClick}>
        <mesh position={[0, pedestalCenterY, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
          <meshStandardMaterial color="#212121" metalness={0.85} roughness={0.3} transparent={isGhost} opacity={isGhost ? 0.6 : 1} />
        </mesh>
        {!isHoverboardInUseHere && (
          <>
            <mesh ref={hoverboardBoardRef} position={[0, boardCenterY, 0]}>
              <boxGeometry args={[0.1, 0.02, 0.4]} />
              <meshStandardMaterial
                color={boardGlow.color}
                emissive={boardGlow.emissive}
                emissiveIntensity={isGhost ? boardGlow.emissiveIntensity * 0.35 : boardGlow.emissiveIntensity}
                transparent={isGhost}
                opacity={isGhost ? 0.8 : 1}
              />
            </mesh>
            {!isGhost && !isBuilding && (
              <pointLight
                position={[0, boardCenterY + 0.08, 0]}
                distance={2}
                intensity={Math.min(boardGlow.emissiveIntensity * 0.65, 1.4)}
                color={boardGlow.color}
              />
            )}
          </>
        )}
      </group>
    );
  };

  const renderFerryDock = () => {
    // もっと大きくし、近くに船が見えるようにする
    return (
      <group position={meshPosition} rotation={meshRotation} onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={handleClick} onDoubleClick={onDoubleClick}>
        {/* フェリー停の土台（桟橋）大きくする */}
        <mesh position={[0, -0.16, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <boxGeometry args={[1.5, 0.18, 2.0]} />
          <meshStandardMaterial color="#455a64" metalness={0.35} roughness={0.7} transparent={isGhost} opacity={isGhost ? 0.6 : 1} />
        </mesh>
        {/* 船を係留する杭 */}
        <mesh position={[0.6, 0.05, -0.8]} castShadow={!isGhost}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#795548" roughness={0.9} transparent={isGhost} opacity={isGhost ? 0.7 : 1} />
        </mesh>
        <mesh position={[0.6, 0.05, 0.8]} castShadow={!isGhost}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#795548" roughness={0.9} transparent={isGhost} opacity={isGhost ? 0.7 : 1} />
        </mesh>
        <mesh position={[-0.6, 0.05, -0.8]} castShadow={!isGhost}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#795548" roughness={0.9} transparent={isGhost} opacity={isGhost ? 0.7 : 1} />
        </mesh>
        <mesh position={[-0.6, 0.05, 0.8]} castShadow={!isGhost}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#795548" roughness={0.9} transparent={isGhost} opacity={isGhost ? 0.7 : 1} />
        </mesh>
        
        {/* 停泊している船（4つの杭の間に配置） */}
        <group position={[0, 0.05, 0]}>
          {/* 船体（下部） */}
          <mesh castShadow={!isGhost} receiveShadow={!isGhost}>
            <boxGeometry args={[0.9, 0.4, 1.8]} />
            <meshStandardMaterial color="#ffffff" roughness={0.5} transparent={isGhost} opacity={isGhost ? 0.6 : 1} />
          </mesh>
          {/* 船体（上部キャビン） */}
          <mesh position={[0, 0.3, -0.2]} castShadow={!isGhost}>
            <boxGeometry args={[0.7, 0.3, 0.8]} />
            <meshStandardMaterial color="#1e88e5" roughness={0.6} transparent={isGhost} opacity={isGhost ? 0.6 : 1} />
          </mesh>
          {/* 窓 */}
          <mesh position={[0, 0.3, -0.2]}>
            <boxGeometry args={[0.72, 0.15, 0.82]} />
            <meshStandardMaterial color="#81d4fa" emissive="#4fc3f7" emissiveIntensity={0.3} transparent opacity={isGhost ? 0.4 : 0.8} />
          </mesh>
        </group>
      </group>
    );
  };

  const layoutChildren = useMemo(() => {
    const meshPosition = [0, 0, 0];
    const meshRotation = [0, 0, 0];
    const stationShapeProps = {
      isGhost,
      meshPosition,
      meshRotation,
      handlers: stableHandlers,
      castShadow: !isGhost,
      isBuilding,
      nightFactor,
      needType: presetNeedType,
      expressionResolved: presetExpressionResolved,
    };

    switch (shape) {
      case 'station_layout': return <MergedLayout disable={isGhost}>{renderStationLayout(stationShapeProps)}</MergedLayout>;
      case 'station_platform': return <MergedLayout disable={isGhost}>{renderStationPlatform(stationShapeProps)}</MergedLayout>;
      case 'station_stairs': return <MergedLayout disable={isGhost}>{renderStationStairs(stationShapeProps)}</MergedLayout>;
      case 'station_gate': return <MergedLayout disable={isGhost}>{renderStationGate(stationShapeProps)}</MergedLayout>;
      case 'station_building': return <MergedLayout disable={isGhost}>{renderStationBuilding(stationShapeProps)}</MergedLayout>;
      case 'bus_stop_layout': return <MergedLayout disable={isGhost}>{renderBusStopLayout(stationShapeProps)}</MergedLayout>;
      case 'plaza_layout': return <MergedLayout disable={isGhost}>{renderPlazaLayout(stationShapeProps)}</MergedLayout>;
      case 'road_layout': return <MergedLayout disable={isGhost}>{renderRoadLayout(stationShapeProps)}</MergedLayout>;
      case 'lane_layout': return <MergedLayout disable={isGhost}>{renderLaneLayout(stationShapeProps)}</MergedLayout>;
      case 'park_layout': return <MergedLayout disable={isGhost}>{renderParkLayout(stationShapeProps)}</MergedLayout>;
      case 'waterfront_layout': return <MergedLayout disable={isGhost}>{renderWaterfrontLayout(stationShapeProps)}</MergedLayout>;
      case 'campus_layout': return <MergedLayout disable={isGhost}>{renderCampusLayout(stationShapeProps)}</MergedLayout>;
      case 'commerce_layout': return <MergedLayout disable={isGhost}>{renderCommerceLayout(stationShapeProps)}</MergedLayout>;
      default: return null;
    }
  }, [
    shape, isGhost, meshPosition, meshRotation,
    stableHandlers,
    isBuilding, nightFactor, presetNeedType, presetExpressionResolved
  ]);

  const renderSignPost = () => {
    // 看板を大きくし、文字を描画する
    const sx = 1.5;
    const sy = 1.5;
    const sz = 1.5;
    return (
      <group position={meshPosition} rotation={meshRotation} onPointerMove={onPointerMove} onPointerOut={onPointerOut} onClick={handleClick} onDoubleClick={onDoubleClick}>
        {/* 柱 */}
        <mesh position={[0, 0.45 * sy, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <boxGeometry args={[0.12 * sx, 0.9 * sy, 0.08 * sz]} />
          <meshStandardMaterial color="#795548" roughness={0.85} transparent={isGhost} opacity={isGhost ? 0.6 : 1} />
        </mesh>
        {/* 看板の板 */}
        <mesh position={[0, 0.8 * sy, 0]} castShadow={!isGhost} receiveShadow={!isGhost}>
          <boxGeometry args={[0.8 * sx, 0.5 * sy, 0.06 * sz]} />
          <meshStandardMaterial color="#eceff1" roughness={0.72} metalness={0.08} transparent={isGhost} opacity={isGhost ? 0.7 : 1} />
        </mesh>
        {/* 飾り */}
        <mesh position={[0, 0.8 * sy, 0.034 * sz]}>
          <boxGeometry args={[0.6 * sx, 0.04 * sy, 0.01]} />
          <meshStandardMaterial color="#546e7a" emissive="#90a4ae" emissiveIntensity={isGhost ? 0.1 : 0.25} />
        </mesh>
        {/* 文字の描画 */}
        {text && (
          <Text
            position={[0, 0.8 * sy, 0.035 * sz + 0.001]} // 板の表面よりわずかに手前
            fontSize={0.15 * sx}
            color="#263238"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.7 * sx} // はみ出ないように改行
            textAlign="center"
          >
            {text}
          </Text>
        )}
      </group>
    );
  };

  const renderDiagonalPlaced = () => {
    if (!diagonalPoints || diagonalPoints.length !== 2 || !Array.isArray(diagonalPoints[0]) || !Array.isArray(diagonalPoints[1]) || diagonalPoints[0].length !== 3 || diagonalPoints[1].length !== 3) return null;

    const p1 = new THREE.Vector3().fromArray(diagonalPoints[0]);
    const p2 = new THREE.Vector3().fromArray(diagonalPoints[1]);
    const L = p1.distanceTo(p2);

    const center = new THREE.Vector3().copy(p1).add(p2).multiplyScalar(0.5);
    const dir = new THREE.Vector3().copy(p2).sub(p1).normalize();
    const up = new THREE.Vector3(0, 1, 0); 
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir);

    const safeScale = scale || [1, 1, 1];
    const thicknessX = (safeScale[0] ?? 1) * 0.05;
    const thicknessY = (safeScale[1] ?? 1) * 0.05;

    let meshColor = mat.color;
    let emissiveColor = '#000000';
    let emissiveInt = 0;
    let opacityVal = mat.opacity || 1;

    if (selectedEditBlockId) {
      meshColor = '#00e5ff';
      emissiveColor = '#00b0ff';
      emissiveInt = 1.0 + pulse * 1.5;
    } else if (material === 'light' || material === 'mana') {
      emissiveColor = mat.emissive;
      emissiveInt = mat.emissiveIntensity;
    } else if (flash > 0) {
      emissiveColor = '#ffffff';
      emissiveInt = flash * 2;
    }

    return (
      <group>
        <mesh 
          position={[center.x, center.y, center.z]} 
          quaternion={q}
          castShadow={!isGhost}
          receiveShadow={!isGhost}
          onPointerMove={onPointerMove}
          onPointerOut={onPointerOut}
          onClick={handleClick}
          onDoubleClick={onDoubleClick}
        >
          <boxGeometry args={[thicknessX, L, thicknessY]} />
          <meshStandardMaterial 
            map={(!isGhost && !selectedEditBlockId) ? getPixelTexture(meshColor) : null}
            color={meshColor} 
            transparent={mat.transparent || isGhost || isBuilding || !!selectedEditBlockId}
            opacity={isGhost ? 0.6 : (isBuilding ? progress : opacityVal)}
            emissive={isBuilding ? (ART_DIRECTION.enabled ? PALETTE.accentBright : '#00e5ff') : emissiveColor}
            emissiveIntensity={isBuilding ? (1 - progress) : emissiveInt}
            roughness={mat.roughness}
            metalness={mat.metalness}
            flatShading={mat.flatShading ?? false}
          />
          <Edges 
            scale={1} 
            threshold={15} 
            color={selectedEditBlockId ? PALETTE.accent : isBuilding ? PALETTE.accentBright : '#455A64'} 
            opacity={isGhost ? 0.2 : isBuilding ? 1 : selectedEditBlockId ? pulse : 0.4} 
            transparent 
          />
          {(material === 'light' || material === 'mana') && !isGhost && !isBuilding && (
            <pointLight position={[0, 0, 0]} intensity={material === 'mana' ? 2.2 : 1.8} distance={5} color={material === 'mana' ? PALETTE.accentBright : PALETTE.lampEmissive} castShadow={false} />
          )}
        </mesh>
      </group>
    );
  };

  const renderDiagonalGhost = () => {
    const ghostColor = '#00e5ff';
    
    const renderPreviewLine = () => {
      let p1 = null;
      let p2Abs = null;

      if (diagonalFirstPoint) {
        p1 = new THREE.Vector3().fromArray(diagonalFirstPoint);
        if (hoveredAnchor) {
          p2Abs = new THREE.Vector3(
            position[0] + hoveredAnchor[0],
            position[1] + hoveredAnchor[1],
            position[2] + hoveredAnchor[2]
          );
        } else {
          p2Abs = new THREE.Vector3(...position);
        }
      } else if (diagonalPoints && diagonalPoints.length === 2 && Array.isArray(diagonalPoints[0]) && Array.isArray(diagonalPoints[1]) && diagonalPoints[0].length === 3 && diagonalPoints[1].length === 3) {
        p1 = new THREE.Vector3().fromArray(diagonalPoints[0]);
        p2Abs = new THREE.Vector3().fromArray(diagonalPoints[1]);
      }

      if (!p1 || !p2Abs) return null;

      const L = p1.distanceTo(p2Abs);
      
      const center = new THREE.Vector3().copy(p1).add(p2Abs).multiplyScalar(0.5);
      const dir = new THREE.Vector3().copy(p2Abs).sub(p1).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(up, dir);

      const safeScale = scale || [1, 1, 1];
      const thicknessX = (safeScale[0] ?? 1) * 0.05;
      const thicknessY = (safeScale[1] ?? 1) * 0.05;

      const isCompleted = diagonalPoints && !diagonalFirstPoint;

      return (
        <mesh position={[center.x, center.y, center.z]} quaternion={q} raycast={() => null}>
          <boxGeometry args={[thicknessX, L, thicknessY]} />
          <meshBasicMaterial color={isCompleted ? "#4caf50" : "#ffd54f"} transparent opacity={0.7} />
          <Edges scale={1} threshold={15} color={isCompleted ? "#4caf50" : "#ffd54f"} opacity={0.9} transparent />
        </mesh>
      );
    };

    return (
      <group>
        <mesh position={position} onPointerMove={onPointerMove} onPointerOut={onPointerOut}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={ghostColor} transparent opacity={0.15} wireframe />
        </mesh>

        {ANCHOR_POINTS.map((localPt, idx) => {
          const worldPt = [
            position[0] + localPt[0],
            position[1] + localPt[1],
            position[2] + localPt[2]
          ];

          const isSelected = (diagonalFirstPoint && 
            Math.abs(diagonalFirstPoint[0] - worldPt[0]) < 0.01 &&
            Math.abs(diagonalFirstPoint[1] - worldPt[1]) < 0.01 &&
            Math.abs(diagonalFirstPoint[2] - worldPt[2]) < 0.01) ||
            (diagonalPoints && diagonalPoints.length === 2 && Array.isArray(diagonalPoints[0]) && Array.isArray(diagonalPoints[1]) && diagonalPoints[0].length === 3 && diagonalPoints[1].length === 3 && !diagonalFirstPoint &&
              (
                (Math.abs(diagonalPoints[0][0] - worldPt[0]) < 0.01 &&
                 Math.abs(diagonalPoints[0][1] - worldPt[1]) < 0.01 &&
                 Math.abs(diagonalPoints[0][2] - worldPt[2]) < 0.01) ||
                (Math.abs(diagonalPoints[1][0] - worldPt[0]) < 0.01 &&
                 Math.abs(diagonalPoints[1][1] - worldPt[1]) < 0.01 &&
                 Math.abs(diagonalPoints[1][2] - worldPt[2]) < 0.01)
              )
            );

          const isHovered = hoveredAnchor &&
            Math.abs(hoveredAnchor[0] - localPt[0]) < 0.01 &&
            Math.abs(hoveredAnchor[1] - localPt[1]) < 0.01 &&
            Math.abs(hoveredAnchor[2] - localPt[2]) < 0.01;

          let anchorColor = "#ffffff";
          let scaleMul = 1.0;
          if (isSelected) {
            anchorColor = "#4caf50";
            scaleMul = 1.5;
          } else if (isHovered) {
            anchorColor = "#fdd835";
            scaleMul = 1.4;
          }

          return (
            <mesh 
              key={idx} 
              position={worldPt}
              scale={[scaleMul, scaleMul, scaleMul]}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectAnchor) onSelectAnchor(worldPt);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
                if (onHoverAnchor) onHoverAnchor(localPt);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'auto';
                if (onHoverAnchor) onHoverAnchor(null);
              }}
            >
              <sphereGeometry args={[0.02, 16, 16]} />
              <meshBasicMaterial color={anchorColor} depthTest={false} transparent opacity={0.9} />
            </mesh>
          );
        })}

        {/* 1点目から伸びるリアルタイムプレビュー線 */}
        {renderPreviewLine()}
      </group>
    );
  };

  // 通常ブロック（斜め以外）の描画カラーの決定
  let meshColor = (material === 'glass' && glassColor) ? glassColor : mat.color;
  let emissiveColor = '#000000';
  let emissiveInt = 0;
  let opacityVal = mat.opacity || 1;

  if (selectedEditBlockId) {
    meshColor = '#00e5ff';
    emissiveColor = '#00b0ff';
    emissiveInt = 1.0 + pulse * 1.5;
  } else if (isBuilding) {
    emissiveColor = '#00e5ff';
    emissiveInt = 1 - progress;
  } else if (material === 'light' || material === 'mana') {
    emissiveColor = mat.emissive;
    emissiveInt = mat.emissiveIntensity;
  } else if (flash > 0) {
    emissiveColor = '#ffffff';
    emissiveInt = flash * 2;
  }

  // 斜めブロックの配置済みレンダリング
  if (shape === 'diagonal' && !isGhost && diagonalPoints && diagonalPoints.length === 2 && Array.isArray(diagonalPoints[0]) && Array.isArray(diagonalPoints[1]) && diagonalPoints[0].length === 3 && diagonalPoints[1].length === 3) {
    const p1 = new THREE.Vector3().fromArray(diagonalPoints[0]);
    const p2 = new THREE.Vector3().fromArray(diagonalPoints[1]);
    const center = new THREE.Vector3().copy(p1).add(p2).multiplyScalar(0.5);
    const dir = new THREE.Vector3().copy(p2).sub(p1).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const euler = new THREE.Euler().setFromQuaternion(q);

    return (
      <>
        {renderDiagonalPlaced()}
        {progress === 1 && !isGhost && !selectedEditBlockId && !noPhysics && (
          <RigidBody 
            type="fixed" 
            colliders={false} 
            position={[center.x, center.y, center.z]} 
            rotation={[euler.x, euler.y, euler.z]}
          >
            {getCollider()}
          </RigidBody>
        )}
      </>
    );
  }

  // 斜めブロックのゴーストレンダリング
  if (shape === 'diagonal' && isGhost) {
    if (diagonalPoints && diagonalPoints.length === 2 && !onSelectAnchor) {
      return renderDiagonalPlaced();
    }
    return renderDiagonalGhost();
  }

  // 自然ブロック（植物）のレンダリング委譲
  if (isNatureShape(shape)) {
    return (
      <>
        <PlantMeshes
          position={position}
          shape={shape}
          rotation={rotation}
          scale={scale}
          isGhost={isGhost}
          selectedEditBlockId={selectedEditBlockId}
          onPointerMove={stableHandlers.onPointerMove}
          onPointerOut={stableHandlers.onPointerOut}
          onClick={stableHandlers.onClick}
          onDoubleClick={stableHandlers.onDoubleClick}
          nature={nature}
        />
        {progress === 1 && !isGhost && !selectedEditBlockId && !noPhysics && (
          <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
            {getNatureCollider(shape, scale)}
          </RigidBody>
        )}
      </>
    );
  }

  // 農地ブロック（畑・田んぼ・菜園）のレンダリング委譲
  if (isAgriShape(shape)) {
    return (
      <>
        <AgriMeshes
          position={position}
          shape={shape}
          rotation={rotation}
          scale={scale}
          isGhost={isGhost}
          selectedEditBlockId={selectedEditBlockId}
          onPointerMove={stableHandlers.onPointerMove}
          onPointerOut={stableHandlers.onPointerOut}
          onClick={stableHandlers.onClick}
          onDoubleClick={stableHandlers.onDoubleClick}
          agri={agri}
          agriNeighbors={agriNeighbors}
        />
        {progress === 1 && !isGhost && !selectedEditBlockId && !noPhysics && (
          <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
            {getAgriCollider(shape, scale)}
          </RigidBody>
        )}
      </>
    );
  }

  // 地形ブロック（池・小川・滝・山）のレンダリング委譲
  if (isTerrainShape(shape)) {
    return (
      <>
        <TerrainMeshes
          position={position}
          shape={shape}
          rotation={rotation}
          scale={scale}
          isGhost={isGhost}
          selectedEditBlockId={selectedEditBlockId}
          onPointerMove={stableHandlers.onPointerMove}
          onPointerOut={stableHandlers.onPointerOut}
          onClick={stableHandlers.onClick}
          onDoubleClick={stableHandlers.onDoubleClick}
          terrain={terrain}
          terrainNeighbors={terrainNeighbors}
        />
        {progress === 1 && !isGhost && !selectedEditBlockId && !noPhysics && (
          <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
            {getTerrainCollider(shape, scale)}
          </RigidBody>
        )}
      </>
    );
  }

  return (
    <>
      <group 
        position={position} 
        rotation={baseRotation} 
        scale={scale}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); stableHandlers.onPointerOut?.(e); }}
        onPointerMove={stableHandlers.onPointerMove}
        onClick={stableHandlers.onClick}
        onDoubleClick={stableHandlers.onDoubleClick}
      >
        {shape === 'rail' ? renderRail() :
         shape === 'door' ? renderDoor() :
         shape === 'bench' ? renderBench() :
         shape === 'light_pole' ? renderLightPole() :
         shape === 'sign_post' ? renderSignPost() :
         shape === 'ferry_dock' ? renderFerryDock() :
         shape === 'hoverboard_station' ? renderHoverboardStation() :
         layoutChildren ? layoutChildren : (() => {
           const customTexture = getBlockTexture(material);
           
           return (
           <>
             <mesh 
               ref={meshRef}
               castShadow={!isGhost} 
               receiveShadow={!isGhost} 
               position={meshPosition}
               rotation={meshRotation}
               onPointerMove={onPointerMove}
               onPointerOut={onPointerOut}
               onClick={onClick}
               onDoubleClick={onDoubleClick}
             >
               {getGeometry()}
               <meshStandardMaterial 
                 map={customTexture ? customTexture : (!isGhost && !selectedEditBlockId) ? getPixelTexture(meshColor) : null}
                 color={customTexture ? '#ffffff' : meshColor} 
                 transparent={mat.transparent || isGhost || isBuilding || !!selectedEditBlockId} 
                 opacity={isGhost ? 0.6 : (isBuilding ? progress : opacityVal)}
                 emissive={emissiveColor !== '#000000' ? emissiveColor : (customTexture ? '#ffffff' : '#000000')}
                 emissiveMap={customTexture ? customTexture : null}
                 emissiveIntensity={emissiveInt > 0 ? emissiveInt : (customTexture ? 0.25 : 0)}
                 roughness={mat.roughness}
                 metalness={mat.metalness}
               />
               <Edges 
                 scale={1} 
                 threshold={15} 
                 color={selectedEditBlockId ? PALETTE.accent : isBuilding ? PALETTE.accentBright : '#455A64'} 
                 opacity={isGhost ? 0.2 : isBuilding ? 1 : selectedEditBlockId ? pulse : 0.4} 
                 transparent 
               />
               {(material === 'light' || material === 'mana') && !isGhost && !isBuilding && (
                 <pointLight position={[0, 0.5, 0]} intensity={material === 'mana' ? 2.0 : 1.5} distance={5} color={material === 'mana' ? '#00e5ff' : '#fff59d'} castShadow={false} />
               )}
             </mesh>
             
            {selectedEditBlockId && selectedEditBlockId === id && transformTarget && (
               <TransformControls
                object={transformTarget}
                 mode="translate"
                 onObjectChange={() => {
                  const { placedBlocks, setPlacedBlocks } = useGameStore.getState();
                   const updated = placedBlocks.map(b => {
                     if (b.id === id) {
                       const pos = meshRef.current.position;
                       return { ...b, pos: [pos.x, pos.y, pos.z] };
                     }
                     return b;
                   });
                   setPlacedBlocks(updated);
                 }}
               />
             )}
             </>
           );
         })()}
        {isBuilding && progress > 0.05 && (
          <mesh position={[0, laserY, 0]}>
            <boxGeometry args={[0.55, 0.02, 0.55]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={1 - progress} />
          </mesh>
        )}
      </group>
      
      {progress === 1 && !isGhost && !selectedEditBlockId && !noPhysics && (
        <RigidBody type="fixed" colliders={false} position={position} rotation={baseRotation}>
          {getCollider()}
        </RigidBody>
      )}
    </>
  )
}, (prev, next) => {
  return prev.id === next.id &&
         prev.shape === next.shape &&
         prev.material === next.material &&
         prev.rotation === next.rotation &&
         prev.isGhost === next.isGhost &&
         prev.isHoveredToDelete === next.isHoveredToDelete &&
         prev.isHoveredToEdit === next.isHoveredToEdit &&
         prev.selectedEditBlockId === next.selectedEditBlockId &&
         prev.presetExpressionResolved === next.presetExpressionResolved &&
         prev.presetNeedType === next.presetNeedType &&
         prev.text === next.text &&
         prev.agri?.phase === next.agri?.phase &&
         prev.agri?.harvestable === next.agri?.harvestable &&
         prev.position?.[0] === next.position?.[0] &&
         prev.position?.[1] === next.position?.[1] &&
         prev.position?.[2] === next.position?.[2] &&
         prev.scale?.[0] === next.scale?.[0] &&
         prev.scale?.[1] === next.scale?.[1] &&
         prev.scale?.[2] === next.scale?.[2] &&
         prev.diagonalPoints === next.diagonalPoints;
});

Block.displayName = 'Block';

