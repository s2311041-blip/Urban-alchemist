import React, { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { applySeasonTint } from '../../../utils/seasonTint';
import { PALETTE } from '../../../constants/artDirection';
import { ART_DIRECTION } from '../../../constants/buildFeatureFlags';
import { createVoxelMatProps } from '../../../utils/voxelMaterial';
import { clusterToSurface, getIslandClusters } from '../../../utils/islandSurface';

const GRASS_PATCHES = [];

const tintGrass = (hex, amount) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + amount * 255));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amount * 200));
  const b = Math.min(255, Math.max(0, (n & 255) + amount * 120));
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
};

const IslandSurfacePlate = ({ surface, season, isPlacing, buildMode }) => {
  const baseColor = surface.isRemote
    ? (isPlacing ? PALETTE.waterGlow : (buildMode ? PALETTE.waterGlow : PALETTE.water))
    : (isPlacing ? PALETTE.grassPlacing : (buildMode ? PALETTE.grassBuild : PALETTE.grassLight));

  const seasonColor = applySeasonTint(baseColor, season, 'islandGrass');
  const mat = createVoxelMatProps({ color: seasonColor });

  const patches = useMemo(() => {
    if (surface.isRemote) return [];
    return GRASS_PATCHES.map((p, i) => ({
      ...p,
      color: tintGrass(seasonColor, p.tint),
      key: `patch-${i}`,
    }));
  }, [seasonColor, surface.isRemote]);

  const [cx, cy, cz] = surface.position;
  const [w, h, d] = surface.size;

  return (
    <group>
      <mesh position={surface.position} receiveShadow>
        <boxGeometry args={surface.size} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {surface.isRemote && (
        <mesh position={[cx, surface.topY + 0.015, cz]} receiveShadow>
          <boxGeometry args={[w * 0.92, 0.03, d * 0.92]} />
          <meshStandardMaterial
            {...createVoxelMatProps({
              color: PALETTE.waterGlow,
              emissive: PALETTE.water,
              emissiveIntensity: 0.12,
            })}
          />
        </mesh>
      )}
    </group>
  );
};

/**
 * チャンク境界のない一体のジオラマ地面（概念図寄り）
 */
export const UnifiedIslandSurface = ({ islandChunks, isPlacing, buildMode }) => {
  const season = useGameStore((state) => state.worldTime.season);

  const surfaces = useMemo(() => {
    const { main, remoteClusters } = getIslandClusters(islandChunks);
    const list = [];
    if (main.length > 0) list.push(clusterToSurface(main));
    remoteClusters.forEach((cluster, i) => {
      if (cluster.length > 0) list.push({ ...clusterToSurface(cluster), key: `remote-${i}` });
    });
    return list;
  }, [islandChunks]);

  if (!ART_DIRECTION.enabled || !ART_DIRECTION.useUnifiedIslandSurface) return null;
  if (surfaces.length === 0) return null;

  return (
    <group>
      {surfaces.map((surface, i) => (
        <IslandSurfacePlate
          key={surface.key ?? `main-${i}`}
          surface={surface}
          season={season}
          isPlacing={isPlacing}
          buildMode={buildMode}
        />
      ))}
    </group>
  );
};
