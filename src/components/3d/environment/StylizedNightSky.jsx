import React from 'react';
import { Stars } from '@react-three/drei';
import { useGameStore } from '../../../store/useGameStore';
import { getDayNightState } from '../../../utils/dayNight';
import { ART_DIRECTION } from '../../../constants/buildFeatureFlags';

/**
 * 夜専用の空 — 太陽なし、星＋月明かり（背景色は DayNightEnvironment が担当）
 */
export const StylizedNightSky = () => {
  const timeOfDay = useGameStore((state) => state.worldTime.timeOfDay);
  const env = getDayNightState(timeOfDay);

  const nightFactor = env.nightFactor;
  const active = ART_DIRECTION.enabled
    && ART_DIRECTION.useStylizedSky
    && ART_DIRECTION.useNightSky
    && nightFactor >= 0.38;
  const showStars = active && nightFactor > 0.42;
  const starsOpacity = showStars ? Math.min(1, (nightFactor - 0.42) * 5) : 0;

  const moonPos = env.moonPosition ?? [0, 8, -12];
  const moonOpacity = active ? Math.min(0.85, (nightFactor - 0.4) * 1.4) : 0;

  return (
    <group visible={active}>
      {showStars && (
        <Stars
          radius={180}
          depth={60}
          count={800}
          factor={3.2}
          saturation={0.35}
          fade
          speed={0.15}
        />
      )}
      {moonOpacity > 0.12 && (
        <mesh position={moonPos}>
          <sphereGeometry args={[1.8, 12, 12]} />
          <meshBasicMaterial
            color="#E8EAF6"
            transparent
            opacity={moonOpacity * 0.55}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};
