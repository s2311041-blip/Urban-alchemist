import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { getBugOrbSmokeAuraLayers } from '../../utils/bugOrbColor';

export const BugOrbFog = ({ bug, phaseOffset = 0, isGhost = false }) => {
  const layers = useMemo(() => getBugOrbSmokeAuraLayers(bug ?? {}), [bug]);
  const meshRefs = useRef([]);
  const materialRefs = useRef([]);

  useFrame((state) => {
    if (layers.length === 0) return;

    const pulse = (Math.sin(state.clock.elapsedTime * 0.5 + phaseOffset) + 1) * 0.5;
    const drift = Math.sin(state.clock.elapsedTime * 0.28 + phaseOffset * 0.6) * 0.012;
    const ghostFactor = isGhost ? 0.55 : 1;

    layers.forEach((layer, index) => {
      const mesh = meshRefs.current[index];
      const material = materialRefs.current[index];
      const breathe = 0.96 + pulse * 0.06;
      const lift = drift * (index + 1);

      if (mesh) {
        mesh.scale.set(
          layer.scale[0] * breathe,
          layer.scale[1] * (breathe + pulse * 0.03),
          layer.scale[2] * breathe,
        );
        mesh.position.set(layer.position[0], layer.position[1] + lift, layer.position[2]);
      }
      if (material) {
        material.opacity = layer.opacity * ghostFactor * (0.88 + pulse * 0.12);
        material.emissiveIntensity = layer.emissiveIntensity * (0.85 + pulse * 0.15);
      }
    });
  });

  if (layers.length === 0) return null;

  return (
    <group raycast={() => null}>
      {layers.map((layer, index) => (
        <mesh
          key={`${layer.color}-${index}`}
          ref={(node) => { meshRefs.current[index] = node; }}
        >
          <sphereGeometry args={[layer.radius, 20, 16]} />
          <meshStandardMaterial
            ref={(node) => { materialRefs.current[index] = node; }}
            color={layer.color}
            emissive={layer.emissive}
            emissiveIntensity={layer.emissiveIntensity}
            transparent
            opacity={layer.opacity}
            roughness={1}
            metalness={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};
