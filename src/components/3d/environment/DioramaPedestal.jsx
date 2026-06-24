import React, { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { PALETTE } from '../../../constants/artDirection';
import { ART_DIRECTION } from '../../../constants/buildFeatureFlags';
import { createVoxelMatProps } from '../../../utils/voxelMaterial';
import { clusterToSurface, getIslandClusters } from '../../../utils/islandSurface';

/**
 * 浮遊島の下に置く台座 — ジオラマRPGの「模型」感
 */
export const DioramaPedestal = ({ islandChunks }) => {
  const layout = useMemo(() => {
    const { main } = getIslandClusters(islandChunks);
    if (main.length === 0) return null;
    const surface = clusterToSurface(main, { pad: 0.4 });
    const [cx, , cz] = surface.position;
    const [w, , d] = surface.size;
    const pedestalW = Math.min(w * 0.72, 22);
    const pedestalD = Math.min(d * 0.72, 22);
    const islandBottom = surface.topY - surface.size[1];
    return {
      position: [cx, islandBottom - 2.8, cz],
      size: [pedestalW, 0.55, pedestalD],
      stem: [pedestalW * 0.38, 2.2, pedestalD * 0.38],
      stemY: islandBottom - 1.45,
    };
  }, [islandChunks]);

  if (!ART_DIRECTION.enabled || !ART_DIRECTION.useDioramaPedestal || !layout) return null;

  const wood = createVoxelMatProps({ color: PALETTE.buildingTrim });
  const trim = createVoxelMatProps({ color: PALETTE.buildingRoof });
  const accent = createVoxelMatProps({
    color: PALETTE.accent,
    emissive: PALETTE.accentBright,
    emissiveIntensity: 0.08,
  });

  return (
    <group>
      <RoundedBox args={layout.stem} position={[layout.position[0], layout.stemY, layout.position[2]]} radius={0.06} smoothness={4}>
        <meshStandardMaterial {...wood} />
      </RoundedBox>
      <RoundedBox args={layout.size} position={layout.position} radius={0.1} smoothness={5} receiveShadow>
        <meshStandardMaterial {...trim} />
      </RoundedBox>
      <mesh position={[layout.position[0], layout.position[1] + layout.size[1] / 2 + 0.04, layout.position[2]]}>
        <boxGeometry args={[layout.size[0] * 0.88, 0.06, layout.size[2] * 0.88]} />
        <meshStandardMaterial {...accent} />
      </mesh>
    </group>
  );
};
