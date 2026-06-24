import React, { useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { AR_THEME } from '../../constants/arTheme';
import { pinElevationM, pinTiltRad, stakeHeightM } from '../../utils/geo3dWorld';

export function GeoArPin3d({
  position = [0, 0, 0],
  kind = 'barrier',
  label,
  distM,
  annotation,
  onSelect,
  pulsing = false,
}) {
  const color = kind === 'positive' ? AR_THEME.positive : AR_THEME.barrier;
  const elev = annotation ? pinElevationM(annotation) : 0;
  const tilt = annotation ? pinTiltRad(annotation) : 0;
  const stakeH = stakeHeightM(distM ?? 8);
  const groupRef = useRef(null);

  useFrame(({ clock }) => {
    if (!pulsing || !groupRef.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 4) * 0.06;
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1] + elev, position[2]]}
      rotation={[tilt, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {/* タップしやすい透明の当たり判定 */}
      <mesh visible={false}>
        <sphereGeometry args={[0.55, 8, 8]} />
        <meshBasicMaterial />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.18, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, stakeH * 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.02, stakeH, 10]} />
        <meshStandardMaterial color={color} metalness={0.25} roughness={0.45} />
      </mesh>
      <mesh position={[0, stakeH + 0.08, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, stakeH + 0.2, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {(label || distM != null) && (
        <Html
          center
          distanceFactor={5}
          position={[0, stakeH + 0.55, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 'bold',
            maxWidth: 130,
            textAlign: 'center',
            lineHeight: 1.35,
            border: `2px solid ${color}`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          >
            {label && <div>{label}</div>}
            {distM != null && (
              <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>
                約{Math.round(distM)}m
                {annotation?.capturePose?.pitchDeg != null && (
                  <>
                    {' · '}
                    {Math.round(annotation.capturePose.pitchDeg)}°
                  </>
                )}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export function GeoArPlacementPin({ position = [0, 0, 0] }) {
  return (
    <GeoArPin3d
      position={position}
      kind="barrier"
      label="ここ"
      distM={5}
      pulsing
    />
  );
}
