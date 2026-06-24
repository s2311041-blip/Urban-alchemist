import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { getDayNightState } from '../../../utils/dayNight';
import { ART_DIRECTION } from '../../../constants/buildFeatureFlags';
import { HEMISPHERE_LIGHT } from '../../../constants/artDirection';
import { StylizedSky } from './StylizedSky';
import { StylizedNightSky } from './StylizedNightSky';

export const DayNightEnvironment = () => {
  const timeOfDay = useGameStore((state) => state.worldTime.timeOfDay);
  const env = getDayNightState(timeOfDay);
  const useSky = ART_DIRECTION.enabled && ART_DIRECTION.useStylizedSky;

  return (
    <>
      <color attach="background" args={[env.background]} />
      {useSky && <StylizedSky />}
      <StylizedNightSky />
      <ambientLight intensity={env.ambientIntensity} />
      {ART_DIRECTION.enabled && (
        <hemisphereLight
          color={env.hemisphereSky ?? HEMISPHERE_LIGHT.skyColor}
          groundColor={env.hemisphereGround ?? HEMISPHERE_LIGHT.groundColor}
          intensity={HEMISPHERE_LIGHT.intensity}
        />
      )}
      {env.sunIntensity > 0.05 ? (
        <directionalLight
          castShadow={false}
          position={env.sunPosition}
          intensity={env.sunIntensity}
          color={env.sunColor}
        />
      ) : (
        <directionalLight
          castShadow={false}
          position={env.moonPosition ?? [0, 8, -12]}
          intensity={env.moonIntensity}
          color={env.moonColor ?? '#C5CAE9'}
        />
      )}
      <fog attach="fog" args={[env.fogColor, env.fogNear, env.fogFar]} />
    </>
  );
};
