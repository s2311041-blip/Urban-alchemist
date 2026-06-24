import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../store/useGameStore';

export const WorldTimeTicker = () => {
  const accumulatorRef = useRef(0);
  const advanceWorldTimeSeconds = useGameStore((state) => state.advanceWorldTimeSeconds);
  const paused = useGameStore((state) => state.worldTime.paused);
  const isARMode = useGameStore((state) => state.isARMode);
  const isDesigningInStudio = useGameStore((state) => state.isDesigningInStudio);
  const isEditingInStudio = useGameStore((state) => state.isEditingInStudio);
  const expandingLevel = useGameStore((state) => state.expandingLevel);
  const buildMode = useGameStore((state) => state.buildMode);
  const pauseTimeInBuildMode = useGameStore((state) => state.pauseTimeInBuildMode);

  useFrame((_, delta) => {
    const frozen = paused
      || isARMode
      || isDesigningInStudio
      || isEditingInStudio
      || expandingLevel > 0
      || (pauseTimeInBuildMode && !!buildMode);
    if (frozen) return;

    accumulatorRef.current += delta;
    while (accumulatorRef.current >= 1) {
      advanceWorldTimeSeconds(1);
      accumulatorRef.current -= 1;
    }
  });

  return null;
};
