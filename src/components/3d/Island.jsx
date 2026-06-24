import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Edges, Grid } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Tree } from './Environment';
import { useGameStore } from '../../store/useGameStore';
import { applySeasonTint } from '../../utils/seasonTint';
import { PALETTE } from '../../constants/artDirection';
import { ART_DIRECTION } from '../../constants/buildFeatureFlags';
import { createVoxelMatProps } from '../../utils/voxelMaterial';
import { IslandRimFoam } from './environment/IslandRimFoam';
import { UnifiedIslandSurface } from './environment/UnifiedIslandSurface';
import { DioramaPedestal } from './environment/DioramaPedestal';

export const IslandChunk = ({ chunk, isPlacing, buildMode, onGroundClick, onPointerMove, setHoverPosition, noPhysics, onDoubleClick }) => {
  const isValidChunk = Array.isArray(chunk?.pos) && chunk.pos.length >= 3;
  const isBase = chunk?.level === 0 || chunk?.id === 'base' || chunk?.id === 'center' || !chunk?.dropIn;
  const isRemote = chunk?.kind === 'remote';
  const meshRef = useRef();
  const [hasDropped, setHasDropped] = useState(isBase || !chunk.dropIn);
  const flashOpacity = useRef(0);
  const [flashOpacityValue, setFlashOpacityValue] = useState(() => (isBase ? 0 : 1));
  const season = useGameStore((state) => state.worldTime.season);

  useEffect(() => {
    if (!isBase) {
      flashOpacity.current = 1;
    }
  }, [isBase]);

  useFrame((state) => {
    if (!isValidChunk) return;
    if (!hasDropped && !isBase && meshRef.current) {
      const dropSpeed = 0.05;
      if (meshRef.current.position.y < chunk.pos[1]) {
        meshRef.current.position.y += (chunk.pos[1] - meshRef.current.position.y) * dropSpeed;
        if (meshRef.current.position.y > chunk.pos[1] - 0.05) {
          meshRef.current.position.y = chunk.pos[1];
          setHasDropped(true);
          // 結合時に少し揺らす
          meshRef.current.position.y = chunk.pos[1] + Math.sin(state.clock.elapsedTime * 20) * 0.1;
        }
      }
    } else if (hasDropped && !isBase && meshRef.current) {
      meshRef.current.position.y = chunk.pos[1];
    }

    if (flashOpacity.current > 0) {
      flashOpacity.current = Math.max(flashOpacity.current - 0.02, 0);
      setFlashOpacityValue(flashOpacity.current);
    }
  });

  if (!isValidChunk) return null;

  const size = chunk.size || [9, 0.5, 9];
  const baseColor = isRemote
    ? (isPlacing ? PALETTE.waterGlow : (buildMode ? PALETTE.waterGlow : PALETTE.water))
    : (isPlacing ? PALETTE.grassPlacing : (buildMode ? PALETTE.grassBuild : PALETTE.grassLight));
  const seasonColor = applySeasonTint(
    ART_DIRECTION.enabled ? baseColor : (
      isRemote
        ? (isPlacing ? '#b3e5fc' : (buildMode ? '#b3e5fc' : '#81d4fa'))
        : (isPlacing ? '#c5e1a5' : (buildMode ? '#dcedc8' : '#aed581'))
    ),
    season,
    'islandGrass',
  );
  const islandMat = ART_DIRECTION.enabled
    ? createVoxelMatProps({ color: seasonColor })
    : { color: seasonColor, roughness: 0.8 };
  const useUnified = ART_DIRECTION.enabled && ART_DIRECTION.useUnifiedIslandSurface;
  const showChunkMesh = !useUnified || isPlacing || buildMode;
  
  return (
    <>
      <group ref={meshRef} position={[chunk.pos[0], (!hasDropped && !isBase) ? -10 : chunk.pos[1], chunk.pos[2]]}>
        <RoundedBox 
          args={size} 
          radius={ART_DIRECTION.enabled ? 0.03 : 0.05} 
          smoothness={4} 
          receiveShadow
          onClick={(e) => {
            if (onGroundClick && (isPlacing || buildMode)) {
              e.stopPropagation();
              onGroundClick(e);
            }
          }}
          onDoubleClick={(e) => {
            if (isPlacing || buildMode) {
              e.stopPropagation();
              if (onDoubleClick) onDoubleClick(e);
            }
          }}
          onPointerMove={(e) => {
            if (onPointerMove) {
              const normal = e.face.normal.clone().applyQuaternion(e.object.quaternion);
              onPointerMove(e, normal);
            }
          }}
          onPointerOut={() => {
            if (setHoverPosition && (buildMode || isPlacing)) setHoverPosition(null);
          }}
        >
          <meshStandardMaterial
            {...islandMat}
            transparent={useUnified && !showChunkMesh}
            opacity={useUnified && !showChunkMesh ? 0.001 : 1}
            depthWrite={!(useUnified && !showChunkMesh)}
          />
          {ART_DIRECTION.enabled && showChunkMesh && (
            <Edges scale={1.0} threshold={15} color={PALETTE.edge} opacity={0.22} transparent />
          )}
          {!isBase && flashOpacityValue > 0 && showChunkMesh && (
            <Edges scale={1.0} threshold={15} color={ART_DIRECTION.enabled ? PALETTE.accentBright : '#00e5ff'} />
          )}
        </RoundedBox>
        
        {!isBase && flashOpacityValue > 0 && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[size[0] + 0.1, size[1] + 0.1, size[2] + 0.1]} />
            <meshBasicMaterial color={isRemote ? PALETTE.waterGlow : PALETTE.accentBright} transparent opacity={flashOpacityValue * 0.3} wireframe />
          </mesh>
        )}
      </group>
      
      {hasDropped && !noPhysics && (
        <RigidBody type="fixed" colliders={false} position={[chunk.pos[0], chunk.pos[1], chunk.pos[2]]}>
          <CuboidCollider args={[size[0]/2, size[1]/2, size[2]/2]} />
        </RigidBody>
      )}
    </>
  );
}

export const Island = ({ islandChunks, onGroundClick, isPlacing, buildMode, onPointerMove, setHoverPosition, noPhysics, onDoubleClick }) => {
  const buildGrid = useMemo(() => {
    if (!buildMode) return null;
    const validChunks = (Array.isArray(islandChunks) ? islandChunks : []).filter(
      (chunk) => Array.isArray(chunk?.pos) && chunk.pos.length >= 3,
    );
    if (validChunks.length === 0) return null;

    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    let topY = 0.01;
    let hasRemote = false;

    validChunks.forEach((chunk) => {
      const size = Array.isArray(chunk?.size) ? chunk.size : [10, 0.6, 10];
      const halfX = (size[0] ?? 10) / 2;
      const halfZ = (size[2] ?? 10) / 2;
      minX = Math.min(minX, (chunk.pos[0] ?? 0) - halfX);
      maxX = Math.max(maxX, (chunk.pos[0] ?? 0) + halfX);
      minZ = Math.min(minZ, (chunk.pos[2] ?? 0) - halfZ);
      maxZ = Math.max(maxZ, (chunk.pos[2] ?? 0) + halfZ);
      const chunkTop = (chunk.pos[1] ?? -0.3) + (size[1] ?? 0.6) / 2 + 0.01;
      topY = Math.max(topY, chunkTop);
      if (chunk.kind === 'remote') hasRemote = true;
    });

    const width = Math.max(maxX - minX + 2, 11);
    const depth = Math.max(maxZ - minZ + 2, 11);
    return {
      position: [(minX + maxX) / 2, topY, (minZ + maxZ) / 2],
      args: [width, depth],
      cellColor: hasRemote ? '#4fc3f7' : '#90a4ae',
      fadeDistance: Math.max(width, depth) + 8,
    };
  }, [buildMode, islandChunks]);

  return (
    <group>
      {buildGrid && (
        <Grid
          position={buildGrid.position}
          args={buildGrid.args}
          cellSize={0.5}
          cellThickness={1.5}
          cellColor={buildGrid.cellColor}
          sectionSize={0}
          fadeDistance={buildGrid.fadeDistance}
          fadeStrength={1}
        />
      )}
      <UnifiedIslandSurface
        islandChunks={islandChunks}
        isPlacing={isPlacing}
        buildMode={buildMode}
      />
      <DioramaPedestal islandChunks={islandChunks} />
      {islandChunks.map((chunk, index) => (
        <IslandChunk 
          key={chunk?.id ?? `chunk-${index}`} chunk={chunk} isPlacing={isPlacing} buildMode={buildMode}
          onPointerMove={onPointerMove} onGroundClick={onGroundClick} setHoverPosition={setHoverPosition}
          noPhysics={noPhysics} onDoubleClick={onDoubleClick}
        />
      ))}
      <IslandRimFoam islandChunks={islandChunks} />
      <Tree position={[-3.5, 0, -3.5]} scale={1.2} noPhysics={noPhysics} />
      <Tree position={[3, 0, -3]} scale={0.8} noPhysics={noPhysics} />
      <Tree position={[3.2, 0, 2.5]} scale={1} noPhysics={noPhysics} />
      <Tree position={[-2, 0, 3]} scale={0.9} noPhysics={noPhysics} />
    </group>
  );
}
