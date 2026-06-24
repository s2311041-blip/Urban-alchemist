import React, { useMemo } from 'react';
import { Sky } from '@react-three/drei';
import { useGameStore } from '../../../store/useGameStore';
import { getDayNightState } from '../../../utils/dayNight';
import { ART_DIRECTION } from '../../../constants/buildFeatureFlags';

export const StylizedSky = () => {
  const timeOfDay = useGameStore((state) => state.worldTime.timeOfDay);
  const env = getDayNightState(timeOfDay);

  const nightFactor = env.nightFactor;

  const [sunX, sunY, sunZ] = env.sunPosition;
  const sunPosition = useMemo(() => {
    const scale = 0.045;
    return [sunX * scale, sunY * scale, sunZ * scale];
  }, [sunX, sunY, sunZ]);

  if (!ART_DIRECTION.enabled || !ART_DIRECTION.useStylizedSky) return null;
  // 夜は NightSky に任せる（空に太陽が残らない）
  if (nightFactor > 0.42) return null;
  if (sunY <= 0.5) return null;
  const dayFactor = 1 - nightFactor;
  // 昼は turbidity を上げて太陽の眩しさを柔らかく（概念図のやわらかい空）
  const turbidity = 4 + dayFactor * 6 + nightFactor * 4;
  const rayleigh = 0.9 + dayFactor * 0.2 - nightFactor * 0.4;
  const mieCoefficient = 0.002 + dayFactor * 0.004 + nightFactor * 0.008;

  return (
    <Sky
      distance={450000}
      sunPosition={sunPosition}
      turbidity={turbidity}
      rayleigh={rayleigh}
      mieCoefficient={mieCoefficient}
      mieDirectionalG={0.55}
    />
  );
};
