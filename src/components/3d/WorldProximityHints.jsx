import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { WORLD_PROXIMITY_HINT_STYLE } from '../../constants/worldHintStyles';

const HOVERBOARD_HINT_RADIUS = 2.5;

/**
 * 近接インタラクトの案内（不満の「タップして追体験」と同サイズ）
 */
export const WorldProximityHints = () => {
  const viewMode = useGameStore((s) => s.viewMode);
  const buildMode = useGameStore((s) => s.buildMode);
  const activeBug = useGameStore((s) => s.activeBug);
  const placedBlocks = useGameStore((s) => s.placedBlocks);
  const mapPlayerPos = useGameStore((s) => s.mapPlayerPos);
  const isHoverboarding = useGameStore((s) => s.isHoverboarding);

  const nearestHoverboard = useMemo(() => {
    if (!Array.isArray(mapPlayerPos) || mapPlayerPos.length < 2) return null;
    const px = mapPlayerPos[0] ?? 0;
    const pz = mapPlayerPos[1] ?? 0;
    let nearest = null;
    let nearestDist = HOVERBOARD_HINT_RADIUS;

    placedBlocks.forEach((block) => {
      if (block?.shape !== 'hoverboard_station' || !Array.isArray(block?.pos)) return;
      const dx = (block.pos[0] ?? 0) - px;
      const dz = (block.pos[2] ?? 0) - pz;
      const dist = Math.hypot(dx, dz);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = block;
      }
    });

    return nearest;
  }, [mapPlayerPos, placedBlocks]);

  const showHoverboardHint = !buildMode
    && viewMode === 'tps'
    && !activeBug
    && nearestHoverboard;

  if (!showHoverboardHint) return null;

  const y = (nearestHoverboard.pos[1] ?? 0.5) + 0.6;
  const label = isHoverboarding ? 'E で降りる' : 'E で乗る';

  return (
    <Html
      position={[nearestHoverboard.pos[0], y, nearestHoverboard.pos[2]]}
      center
      style={{ pointerEvents: 'none' }}
    >
      <div style={WORLD_PROXIMITY_HINT_STYLE}>
        {label}
      </div>
    </Html>
  );
};
