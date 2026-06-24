import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { getBugOrbAppearance, getBugOrbGlowPreset } from '../../utils/bugOrbColor';
import { BugOrbParticles } from './BugOrbParticles';
import { BugOrbFog } from './BugOrbFog';

const getOrbPhaseOffset = (key) => {
  if (!key) return 0;
  const id = String(key);
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  }
  return (hash / 1000) * Math.PI * 2;
};

export const BugOrb = ({
  bug,
  color,
  emissive,
  position = [0, 0, 0],
  phaseKey,
  isGhost = false,
  castShadow = true,
  onClick,
  onPointerOver,
  onPointerOut,
  raycast,
}) => {
  const coreRef = useRef(null);
  const shellRef = useRef(null);
  const coreMaterialRef = useRef(null);
  const shellMaterialRef = useRef(null);
  const lightRef = useRef(null);
  const appearance = useMemo(
    () => (bug ? getBugOrbAppearance(bug) : {
      kind: 'npcDefault',
      color,
      emissive,
      glow: getBugOrbGlowPreset('npcDefault'),
    }),
    [bug, color, emissive],
  );
  const glow = appearance.glow;
  const phaseOffset = useMemo(() => getOrbPhaseOffset(phaseKey ?? bug?.id), [phaseKey, bug?.id]);

  useFrame((state) => {
    const pulse = (Math.sin(state.clock.elapsedTime * glow.pulseSpeed + phaseOffset) + 1) * 0.5;
    const flicker = glow.useFlicker
      ? (Math.sin(state.clock.elapsedTime * 5.2 + phaseOffset * 1.7) + 1) * 0.5
      : 0;
    const energy = pulse + flicker * glow.flickerStrength;
    const coreScale = glow.coreScaleMin + (glow.coreScaleMax - glow.coreScaleMin) * energy;
    const shellScale = glow.shellScaleMin + (glow.shellScaleMax - glow.shellScaleMin) * pulse;
    const ghostFactor = isGhost ? 0.55 : 1;

    if (coreRef.current) {
      coreRef.current.scale.setScalar(coreScale);
    }
    if (shellRef.current) {
      shellRef.current.scale.setScalar(shellScale);
    }
    if (coreMaterialRef.current) {
      const baseIntensity = glow.coreEmissiveBase * ghostFactor;
      const range = glow.coreEmissiveRange * ghostFactor;
      coreMaterialRef.current.emissiveIntensity = baseIntensity + energy * range;
    }
    if (shellMaterialRef.current) {
      const baseOpacity = glow.shellOpacityBase * ghostFactor;
      const opacityRange = glow.shellOpacityRange * ghostFactor;
      shellMaterialRef.current.opacity = baseOpacity + pulse * opacityRange;
      shellMaterialRef.current.emissiveIntensity = (
        glow.shellEmissiveRange * 0.12 + energy * glow.shellEmissiveRange * ghostFactor
      );
    }
    if (lightRef.current) {
      const baseLight = glow.lightBase * ghostFactor;
      const lightRange = glow.lightRange * ghostFactor;
      lightRef.current.intensity = baseLight + energy * lightRange;
    }
  });

  const ghostFactor = isGhost ? 0.55 : 1;

  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      raycast={raycast}
    >
      <mesh ref={coreRef} castShadow={castShadow && !isGhost}>
        <sphereGeometry args={[glow.coreRadius, 32, 32]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color={appearance.color}
          emissive={appearance.emissive}
          emissiveIntensity={glow.initialCoreEmissive * ghostFactor}
          roughness={0.15}
          metalness={0.05}
          transparent={isGhost}
          opacity={isGhost ? 0.45 : 1}
        />
      </mesh>

      {glow.showShell ? (
        <mesh ref={shellRef} raycast={() => null}>
          <sphereGeometry args={[glow.shellRadius, 24, 24]} />
          <meshStandardMaterial
            ref={shellMaterialRef}
            color={appearance.emissive}
            emissive={appearance.emissive}
            emissiveIntensity={glow.shellEmissiveRange * 0.2}
            transparent
            opacity={glow.initialShellOpacity * ghostFactor}
            roughness={0.05}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      <pointLight
        ref={lightRef}
        color={appearance.emissive}
        distance={glow.lightDistance}
        decay={2}
        intensity={glow.initialLight * ghostFactor}
      />

      {appearance.kind === 'mine' ? (
        <BugOrbFog bug={bug} phaseOffset={phaseOffset} isGhost={isGhost} />
      ) : (
        <BugOrbParticles bug={bug} isGhost={isGhost} />
      )}
    </group>
  );
};
