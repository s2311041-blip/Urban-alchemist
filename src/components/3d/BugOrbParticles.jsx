import React, { useMemo } from 'react';
import { Sparkles } from '@react-three/drei';
import { getBugOrbParticleLayers } from '../../utils/bugOrbColor';

const scaleParticleLayer = (layer, ghostFactor) => ({
  count: Math.max(4, Math.round(layer.count * ghostFactor)),
  size: layer.size * (ghostFactor < 1 ? 0.85 : 1),
  speed: layer.speed * (ghostFactor < 1 ? 0.72 : 1),
  opacity: layer.opacity * ghostFactor,
});

export const BugOrbParticles = ({ bug, isGhost = false }) => {
  const layers = useMemo(() => getBugOrbParticleLayers(bug ?? {}), [bug]);
  const ghostFactor = isGhost ? 0.55 : 1;

  return (
    <group raycast={() => null}>
      {layers.map((layer, index) => {
        const scaled = scaleParticleLayer(layer, ghostFactor);
        return (
          <group key={`${layer.color}-${index}`} position={layer.position ?? [0, 0, 0]}>
            <Sparkles
              count={scaled.count}
              scale={layer.scale}
              size={scaled.size}
              speed={scaled.speed}
              opacity={scaled.opacity}
              color={layer.color}
              noise={layer.noise}
            />
          </group>
        );
      })}
    </group>
  );
};
