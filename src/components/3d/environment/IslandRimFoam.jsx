import React, { useMemo } from 'react';
import { PALETTE } from '../../../constants/artDirection';
import { ART_DIRECTION } from '../../../constants/buildFeatureFlags';
import { clusterRimFoamPositions, getIslandClusters } from '../../../utils/islandSurface';

const FOAM_Y = -3.15;
const BLOCK = 0.45;

/**
 * 浮遊島の外周だけに白いフォーム — チャンク格子ではなくジオラマの縁
 */
export const IslandRimFoam = ({ islandChunks }) => {
  const foamBlocks = useMemo(() => {
    if (!ART_DIRECTION.enabled) return [];
    const { main, remoteClusters } = getIslandClusters(islandChunks);
    const blocks = [];
    const addClusterFoam = (cluster, prefix) => {
      clusterRimFoamPositions(cluster, FOAM_Y, BLOCK).forEach((pos, i) => {
        blocks.push({ key: `${prefix}-foam-${i}`, pos });
      });
    };
    if (main.length > 0) addClusterFoam(main, 'main');
    remoteClusters.forEach((cluster, i) => {
      if (cluster.length > 0) addClusterFoam(cluster, `remote-${i}`);
    });
    return blocks.slice(0, 96);
  }, [islandChunks]);

  if (foamBlocks.length === 0) return null;

  return (
    <group>
      {foamBlocks.map(({ key, pos }) => (
        <mesh key={key} position={pos}>
          <boxGeometry args={[BLOCK, BLOCK * 0.35, BLOCK]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive={PALETTE.waterGlow}
            emissiveIntensity={0.25}
            roughness={0.95}
            metalness={0}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
};
