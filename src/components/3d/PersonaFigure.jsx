import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const SKIN = '#ffccbc';
const EYE = '#212121';

function Head({ hair = '#4e342e' }) {
  return (
    <group position={[0, 1.16, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.32, 0.32]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      <mesh position={[0, 0.2, -0.01]} castShadow>
        <boxGeometry args={[0.4, 0.14, 0.38]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      <mesh position={[0, 0.05, -0.17]} castShadow>
        <boxGeometry args={[0.4, 0.28, 0.1]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      <mesh position={[-0.18, 0.02, 0.02]} castShadow>
        <boxGeometry args={[0.07, 0.24, 0.26]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      <mesh position={[0.18, 0.02, 0.02]} castShadow>
        <boxGeometry args={[0.07, 0.24, 0.26]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      <mesh position={[0, 0.1, 0.16]} castShadow>
        <boxGeometry args={[0.36, 0.1, 0.06]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      <mesh position={[-0.08, -0.02, 0.17]}>
        <boxGeometry args={[0.05, 0.06, 0.02]} />
        <meshStandardMaterial color={EYE} />
      </mesh>
      <mesh position={[0.08, -0.02, 0.17]}>
        <boxGeometry args={[0.05, 0.06, 0.02]} />
        <meshStandardMaterial color={EYE} />
      </mesh>
    </group>
  );
}

function Legs({ color }) {
  return (
    <mesh position={[0, 0.22, 0]} castShadow>
      <boxGeometry args={[0.32, 0.44, 0.2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Torso({ color }) {
  return (
    <mesh position={[0, 0.72, 0]} castShadow>
      <boxGeometry args={[0.46, 0.52, 0.26]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Limb({ from, to, color, thickness = 0.1 }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz) || 0.001;
  const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(dx / length, dy / length, dz / length),
  );

  return (
    <mesh position={mid} quaternion={quaternion} castShadow>
      <boxGeometry args={[thickness, length, thickness]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Hand({ position }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.11, 0.1, 0.11]} />
      <meshStandardMaterial color={SKIN} />
    </mesh>
  );
}

function StraightArm({ side = 1, color }) {
  const x = side * 0.32;
  const shoulder = [x, 0.98, 0.02];
  const wrist = [x, 0.5, 0.05];
  return (
    <group>
      <Limb from={shoulder} to={wrist} color={color} />
      <Hand position={wrist} />
    </group>
  );
}

function RushingFigure({ color }) {
  return (
    <group>
      <Legs color="#263238" />
      <Torso color="#1c2833" />
      <mesh position={[0, 0.8, 0.14]} castShadow>
        <boxGeometry args={[0.16, 0.24, 0.04]} />
        <meshStandardMaterial color="#eceff1" />
      </mesh>
      <mesh position={[0, 0.76, 0.17]} castShadow>
        <boxGeometry args={[0.06, 0.22, 0.03]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <StraightArm side={-1} color="#1c2833" />
      <StraightArm side={1} color="#1c2833" />
      <group position={[0.32, 0.5, 0.05]}>
        <mesh position={[0, -0.04, 0.02]} castShadow>
          <boxGeometry args={[0.14, 0.04, 0.04]} />
          <meshStandardMaterial color="#6d4c41" />
        </mesh>
        <mesh position={[0, -0.18, 0.04]} castShadow>
          <boxGeometry args={[0.2, 0.22, 0.1]} />
          <meshStandardMaterial color="#4e342e" />
        </mesh>
        <mesh position={[0, -0.06, 0.1]} castShadow>
          <boxGeometry args={[0.12, 0.03, 0.02]} />
          <meshStandardMaterial color="#d7ccc8" />
        </mesh>
      </group>
      <Head hair="#212121" />
    </group>
  );
}

function StayingFigure({ color }) {
  return (
    <group>
      <Legs color="#6d4c41" />
      <Torso color={color} />
      <StraightArm side={-1} color={color} />
      <Limb from={[0.32, 0.98, 0.02]} to={[0.36, 0.72, 0.08]} color={color} />
      <Limb from={[0.36, 0.72, 0.08]} to={[0.24, 0.68, 0.26]} color={color} />
      <Hand position={[0.24, 0.68, 0.26]} />
      <group position={[0.24, 0.74, 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.058, 0.13, 12]} />
          <meshStandardMaterial color="#fafafa" />
        </mesh>
        <mesh position={[0, 0.045, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 12]} />
          <meshStandardMaterial color="#4e342e" />
        </mesh>
        <mesh position={[0.075, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.038, 0.012, 8, 10]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>
      </group>
      <Head hair="#5d4037" />
    </group>
  );
}

function Wheel({ position, radius }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.05, 14]} />
        <meshStandardMaterial color="#212121" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.45, radius * 0.45, 0.06, 10]} />
        <meshStandardMaterial color="#cfd8dc" />
      </mesh>
    </group>
  );
}

function GuardingFigure({ color }) {
  return (
    <group>
      <Legs color="#455a64" />
      <Torso color={color} />
      <StraightArm side={-1} color={color} />
      <Limb from={[0.32, 0.98, 0.02]} to={[0.4, 0.7, 0.08]} color={color} />
      <Limb from={[0.4, 0.7, 0.08]} to={[0.58, 0.78, 0.24]} color={color} />
      <Hand position={[0.58, 0.78, 0.24]} />
      <group position={[0.7, 0, 0.28]}>
        <Wheel position={[0.14, 0.13, 0.12]} radius={0.13} />
        <Wheel position={[0.14, 0.13, -0.12]} radius={0.13} />
        <Wheel position={[-0.24, 0.08, 0.1]} radius={0.08} />
        <Wheel position={[-0.24, 0.08, -0.1]} radius={0.08} />
        <mesh position={[-0.04, 0.2, 0]} castShadow>
          <boxGeometry args={[0.52, 0.04, 0.08]} />
          <meshStandardMaterial color="#546e7a" />
        </mesh>
        <mesh position={[-0.08, 0.36, 0]} castShadow>
          <boxGeometry args={[0.42, 0.2, 0.3]} />
          <meshStandardMaterial color="#fafafa" />
        </mesh>
        <group position={[-0.08, 0.5, 0.02]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.12, 0.16]} />
            <meshStandardMaterial color="#fff8e1" />
          </mesh>
          <mesh position={[0.01, 0.12, 0.02]} castShadow>
            <boxGeometry args={[0.12, 0.11, 0.12]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <mesh position={[0.01, 0.18, 0.01]} castShadow>
            <boxGeometry args={[0.13, 0.06, 0.13]} />
            <meshStandardMaterial color="#6d4c41" />
          </mesh>
          <mesh position={[-0.025, 0.12, 0.08]}>
            <boxGeometry args={[0.02, 0.025, 0.015]} />
            <meshStandardMaterial color={EYE} />
          </mesh>
          <mesh position={[0.04, 0.12, 0.08]}>
            <boxGeometry args={[0.02, 0.025, 0.015]} />
            <meshStandardMaterial color={EYE} />
          </mesh>
        </group>
        <mesh position={[-0.08, 0.58, -0.12]} rotation={[0.7, 0, 0]} castShadow>
          <boxGeometry args={[0.36, 0.08, 0.22]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <Limb from={[-0.24, 0.34, 0.08]} to={[-0.16, 0.76, 0.04]} color="#455a64" thickness={0.045} />
        <Limb from={[-0.24, 0.34, -0.08]} to={[-0.16, 0.76, -0.1]} color="#455a64" thickness={0.045} />
        <mesh position={[-0.12, 0.78, -0.04]} castShadow>
          <boxGeometry args={[0.16, 0.05, 0.22]} />
          <meshStandardMaterial color="#37474f" />
        </mesh>
      </group>
      <Head />
    </group>
  );
}

function QuietFigure({ color }) {
  return (
    <group>
      <Legs color="#5d4037" />
      <Torso color="#fff3e0" />
      <mesh position={[-0.12, 0.96, 0.14]} castShadow>
        <boxGeometry args={[0.06, 0.16, 0.04]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.12, 0.96, 0.14]} castShadow>
        <boxGeometry args={[0.06, 0.16, 0.04]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.84, 0.15]} castShadow>
        <boxGeometry args={[0.28, 0.22, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.68, 0.15]} castShadow>
        <boxGeometry args={[0.4, 0.08, 0.06]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.16, 0.68, 0.18]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.05]} />
        <meshStandardMaterial color="#f8bbd0" />
      </mesh>
      <mesh position={[0.16, 0.68, 0.18]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.05]} />
        <meshStandardMaterial color="#f8bbd0" />
      </mesh>
      <mesh position={[0, 0.42, 0.12]} castShadow>
        <boxGeometry args={[0.56, 0.36, 0.16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 0.4, 0.2]} castShadow>
        <boxGeometry args={[0.14, 0.12, 0.03]} />
        <meshStandardMaterial color="#f3e5f5" />
      </mesh>
      <StraightArm side={1} color="#fff3e0" />
      <Limb from={[-0.3, 0.98, 0.02]} to={[-0.42, 0.58, 0.14]} color="#fff3e0" />
      <Hand position={[-0.42, 0.58, 0.14]} />
      <group position={[-0.42, 0, 0.22]}>
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.72, 8]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>
        <mesh position={[0, 0.3, 0.02]} castShadow>
          <boxGeometry args={[0.34, 0.08, 0.12]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        {[-0.16, -0.08, 0, 0.08, 0.16].map((x) => (
          <mesh
            key={x}
            position={[x, 0.14, 0.05]}
            rotation={[0.25, 0, x * 1.4]}
            castShadow
          >
            <boxGeometry args={[0.07, 0.34, 0.07]} />
            <meshStandardMaterial color={Math.abs(x) < 0.01 ? '#c4a574' : '#8d6e43'} />
          </mesh>
        ))}
      </group>
      <Head hair="#6d4c41" />
    </group>
  );
}

const LOOK_BY_KEY = {
  link: RushingFigure,
  place: StayingFigure,
  inclusive: GuardingFigure,
  livability: QuietFigure,
};

/** 島に立つペルソナ。足元を position の地面に合わせる。 */
export function PersonaFigure({
  persona,
  position = [0, 0, 0],
  onClick,
  onPointerOver,
  onPointerOut,
}) {
  if (!persona) return null;
  const [x, y, z] = position;
  const groundY = y - 0.5;
  const Look = LOOK_BY_KEY[persona.key] ?? StayingFigure;

  return (
    <group
      position={[x, groundY, z]}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <Look color={persona.color} />
      <Html position={[0, 1.62, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'auto' }}>
        <div
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.(event);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          style={{
            padding: '4px 8px',
            borderRadius: 999,
            background: 'rgba(8, 16, 28, 0.88)',
            border: `2px solid ${persona.color}`,
            color: '#fff',
            fontSize: 12,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            textAlign: 'center',
            lineHeight: 1.3,
            pointerEvents: 'auto',
            cursor: 'pointer',
          }}
        >
          <div style={{ color: persona.color }}>{persona.name}</div>
          <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.85 }}>{persona.role}</div>
        </div>
      </Html>
    </group>
  );
}
