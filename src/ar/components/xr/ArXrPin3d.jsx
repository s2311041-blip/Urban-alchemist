import React from 'react';
import { Html } from '@react-three/drei';
import { AR_THEME } from '../../constants/arTheme';

export function ArXrPin3d({
  position = [0, 0, 0],
  kind = 'barrier',
  label,
  distM,
  onSelect,
}) {
  const color = kind === 'positive' ? AR_THEME.positive : AR_THEME.barrier;
  const y = position[1] ?? 0;

  return (
    <group
      position={[position[0], y, position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.14, 0.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.7, 10]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.78, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.09, 0.22, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {(label || distM != null) && (
        <Html
          center
          distanceFactor={6}
          position={[0, 1.15, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            background: 'rgba(0,0,0,0.78)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 'bold',
            maxWidth: 140,
            textAlign: 'center',
            lineHeight: 1.35,
            border: `2px solid ${color}`,
          }}
          >
            {label && <div>{label}</div>}
            {distM != null && (
              <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>
                約{Math.round(distM)}m
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export function ArXrReticle({ innerRef, visible = true }) {
  return (
    <group ref={innerRef} visible={visible}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.14, 32]} />
        <meshBasicMaterial color="#4fc3f7" transparent opacity={0.85} side={2} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.025, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
