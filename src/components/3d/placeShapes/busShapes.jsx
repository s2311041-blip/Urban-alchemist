import React from 'react';
import { Text } from '@react-three/drei';
import { CuboidCollider } from '@react-three/rapier';
import {
  BUS_ENTRY_BASE_COUNT,
  BUS_ENTRY_BASE_Y,
  BUS_ENTRY_RISE,
  BUS_ENTRY_RUN,
  BUS_ENTRY_START_Z,
  resolvePlaceNeedStyle,
} from '../../../utils/placeNeedTypeStyle';

const WALK = { stationWalk: true };
/** Block.jsx の meshPosition とコライダー位置を揃える */
const MESH_Y_OFFSET = -0.24;
const FLOOR_Y = 0.1;
const colliderY = (localY) => localY + MESH_Y_OFFSET;

const ghostProps = (isGhost, opacity = 1) => ({
  transparent: isGhost,
  opacity: isGhost ? 0.62 : opacity,
});

const interactionProps = (handlers) => ({
  onPointerMove: handlers.onPointerMove,
  onPointerOut: handlers.onPointerOut,
  onClick: handlers.onClick,
  onDoubleClick: handlers.onDoubleClick,
});

const WalkFloor = ({ args, position, isGhost, castShadow, color = '#e0e0e0' }) => (
  <mesh position={position} receiveShadow={castShadow} userData={WALK}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.78} {...ghostProps(isGhost)} />
  </mesh>
);

const WallCollider = ({ args, position }) => (
  <CuboidCollider args={args} position={position} />
);

const SHELTER_PILLAR_XS = [-2, -0.65, 0.65, 2];

const getBusStopPillarColliders = (sx, sy, sz) => (
  <>
    {SHELTER_PILLAR_XS.map((x) => (
      <WallCollider
        key={`bus-pillar-${x}`}
        args={[0.05 * sx, 1.05 * sy, 0.05 * sz]}
        position={[x * sx, colliderY(0.65) * sy, 0.35 * sz]}
      />
    ))}
  </>
);

/** 車道側の低い手すり（端のみ・通路は開ける） */
const getBusStopRailColliders = (sx, sy, sz) => (
  <>
    <WallCollider args={[0.04 * sx, 0.45 * sy, 0.04 * sz]} position={[-2.35 * sx, colliderY(0.32) * sy, 1.25 * sz]} />
    <WallCollider args={[0.04 * sx, 0.45 * sy, 0.04 * sz]} position={[2.35 * sx, colliderY(0.32) * sy, 1.25 * sz]} />
    <WallCollider args={[0.7 * sx, 0.45 * sy, 0.04 * sz]} position={[-2.7 * sx, colliderY(0.32) * sy, 1.25 * sz]} />
    <WallCollider args={[0.7 * sx, 0.45 * sy, 0.04 * sz]} position={[2.7 * sx, colliderY(0.32) * sy, 1.25 * sz]} />
  </>
);

/**
 * バス停（待合スペース＋上屋＋車道縁）。
 * +Z = バス車線側、-Z = 歩道接続側
 */
export const renderBusStopLayout = ({
  isGhost, meshPosition, meshRotation, handlers, castShadow, isBuilding, nightFactor, needType, expressionResolved = false,
}) => {
  const style = resolvePlaceNeedStyle(needType, { expressionResolved });
  const lampIntensity = (isGhost ? 0.3 : (0.55 + nightFactor * 0.65)) * style.lightMul;
  const signIntensity = (isGhost ? 0.2 : (0.5 + nightFactor * 1.0)) * style.lightMul;
  const entryStepCount = BUS_ENTRY_BASE_COUNT + style.extraNorthEntrySteps;
  const entryStartZ = BUS_ENTRY_START_Z - BUS_ENTRY_RUN * style.extraNorthEntrySteps;
  const entryWidth = needType === 'P' ? 2.0 : 2.4;

  return (
    <group position={meshPosition} rotation={meshRotation} {...interactionProps(handlers)}>
      {/* 歩道からの段差（島の地面 → 待合床） */}
      {Array.from({ length: entryStepCount }, (_, i) => (
        <mesh
          key={`bus-entry-${i}`}
          position={[
            0,
            BUS_ENTRY_BASE_Y + BUS_ENTRY_RISE * (i + 0.5),
            entryStartZ + BUS_ENTRY_RUN * i,
          ]}
          receiveShadow={castShadow}
          userData={WALK}
        >
          <boxGeometry args={[entryWidth, 0.05, 0.24]} />
          <meshStandardMaterial color={style.walkwayTint} roughness={0.82} {...ghostProps(isGhost)} />
        </mesh>
      ))}

      {/* 待合床（島上面から約15cm） */}
      <WalkFloor args={[5.2, 0.1, 2.8]} position={[0, FLOOR_Y, 0]} isGhost={isGhost} castShadow={castShadow} />
      <mesh position={[0, FLOOR_Y + 0.06, 1.05]} receiveShadow={castShadow}>
        <boxGeometry args={[4.8, 0.03, 0.32]} />
        <meshStandardMaterial color="#fdd835" emissive="#ffeb3b" emissiveIntensity={isGhost ? 0.15 : 0.35} {...ghostProps(isGhost, 0.95)} />
      </mesh>
      <mesh position={[0, FLOOR_Y + 0.04, 1.35]} receiveShadow={castShadow}>
        <boxGeometry args={[5.4, 0.05, 0.18]} />
        <meshStandardMaterial color="#424242" roughness={0.95} {...ghostProps(isGhost)} />
      </mesh>

      {/* 上屋 */}
      {SHELTER_PILLAR_XS.map((x) => (
        <mesh key={`bus-pl-${x}`} position={[x, FLOOR_Y + 0.55, 0.35]} castShadow={castShadow}>
          <boxGeometry args={[0.1, 2.1, 0.1]} />
          <meshStandardMaterial color="#546e7a" metalness={0.45} roughness={0.4} {...ghostProps(isGhost)} />
        </mesh>
      ))}
      <mesh position={[0, FLOOR_Y + 1.7, 0.1]} castShadow={castShadow}>
        <boxGeometry args={[4.9, 0.08, 2.3]} />
        <meshStandardMaterial color="#eceff1" transparent opacity={isGhost ? 0.35 : 0.72} metalness={0.2} roughness={0.25} />
      </mesh>
      <mesh position={[0, FLOOR_Y + 1.62, 0.1]}>
        <boxGeometry args={[4.5, 0.04, 2]} />
        <meshStandardMaterial color="#b3e5fc" transparent opacity={isGhost ? 0.2 : 0.45} metalness={0.6} roughness={0.15} />
      </mesh>

      {/* ベンチ */}
      <mesh position={[0.6, FLOOR_Y + 0.12, -0.35]} castShadow={castShadow}>
        <boxGeometry args={[1.4, 0.08, 0.45]} />
        <meshStandardMaterial color="#6d4c41" roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0.6, FLOOR_Y - 0.02, -0.62]} castShadow={castShadow}>
        <boxGeometry args={[1.4, 0.35, 0.06]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} {...ghostProps(isGhost)} />
      </mesh>

      {/* バス停標識 */}
      <group position={[-2.15, FLOOR_Y, -0.55]}>
        <mesh position={[0, 0.75, 0]} castShadow={castShadow}>
          <boxGeometry args={[0.08, 1.5, 0.08]} />
          <meshStandardMaterial color="#1565c0" metalness={0.35} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[0, 1.55, 0.06]} castShadow={castShadow}>
          <boxGeometry args={[0.55, 0.42, 0.04]} />
          <meshStandardMaterial color="#ffffff" emissive="#e3f2fd" emissiveIntensity={signIntensity * 0.4} {...ghostProps(isGhost)} />
        </mesh>
        <Text position={[0, 1.55, 0.09]} fontSize={0.11} color="#1565c0" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#ffffff">
          バス
        </Text>
      </group>

      {/* 時刻表・案内板 */}
      <group position={[2.05, FLOOR_Y, -0.45]}>
        <mesh position={[0, 0.85, 0]} castShadow={castShadow}>
          <boxGeometry args={[0.06, 1.7, 0.5]} />
          <meshStandardMaterial color="#cfd8dc" roughness={0.7} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[-0.04, 1.1, 0]} castShadow={castShadow}>
          <boxGeometry args={[0.02, 1.1, 0.42]} />
          <meshStandardMaterial color="#ffffff" emissive="#fafafa" emissiveIntensity={signIntensity * 0.25} {...ghostProps(isGhost)} />
        </mesh>
      </group>

      {/* 発車案内ディスプレイ */}
      <mesh position={[0, FLOOR_Y + 1.55, 0.95]} castShadow={castShadow}>
        <boxGeometry args={[1.6, 0.35, 0.06]} />
        <meshStandardMaterial color="#263238" emissive="#37474f" emissiveIntensity={0.2} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, FLOOR_Y + 1.55, 0.99]}>
        <boxGeometry args={[1.35, 0.22, 0.02]} />
        <meshStandardMaterial color="#00c853" emissive="#69f0ae" emissiveIntensity={lampIntensity} {...ghostProps(isGhost, 0.9)} />
      </mesh>

      {/* 車道側手すり（見た目のみ） */}
      {[-2.35, 2.35].map((x) => (
        <group key={`rail-${x}`} position={[x, FLOOR_Y + 0.22, 1.25]}>
          <mesh castShadow={castShadow}>
            <boxGeometry args={[0.04, 0.9, 0.04]} />
            <meshStandardMaterial color="#90a4ae" metalness={0.55} {...ghostProps(isGhost)} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, FLOOR_Y + 0.38, 1.25]} castShadow={castShadow}>
        <boxGeometry args={[4.2, 0.04, 0.04]} />
        <meshStandardMaterial color="#90a4ae" metalness={0.55} {...ghostProps(isGhost)} />
      </mesh>

      {/* 街灯（コンパクト） */}
      <group position={[-2.3, FLOOR_Y, 1.1]}>
        <mesh position={[0, 0.9, 0]} castShadow={castShadow}>
          <boxGeometry args={[0.07, 1.8, 0.07]} />
          <meshStandardMaterial color="#37474f" metalness={0.4} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[0.12, 1.85, 0]}>
          <boxGeometry args={[0.35, 0.08, 0.12]} />
          <meshStandardMaterial color="#fff9c4" emissive="#fff59d" emissiveIntensity={lampIntensity} {...ghostProps(isGhost, 0.95)} />
        </mesh>
      </group>

      {style.bleakMood && (
        <mesh position={[0, FLOOR_Y + 0.12, 0.1]}>
          <boxGeometry args={[4.8, 0.02, 2.4]} />
          <meshStandardMaterial color="#1a1a1a" transparent opacity={isGhost ? 0.12 : 0.2} roughness={1} />
        </mesh>
      )}

      {!isGhost && !isBuilding && (
        <pointLight
          position={[0, FLOOR_Y + 1.6, 0.2]}
          distance={5}
          intensity={(0.35 + nightFactor * 0.55) * style.lightMul}
          color={style.bleakMood ? '#cfd8dc' : '#fffde7'}
        />
      )}
    </group>
  );
};

export const BUS_STOP_SHAPE_IDS = ['bus_stop_layout'];

export const isBusStopShape = (shape) => BUS_STOP_SHAPE_IDS.includes(shape);

export const getBusStopMeshPosition = (shape) => (
  BUS_STOP_SHAPE_IDS.includes(shape) ? [0, -0.24, 0] : [0, 0, 0]
);

const buildBusEntryWalkColliders = (sx, sy, sz, extraSteps = 0) => {
  const count = BUS_ENTRY_BASE_COUNT + extraSteps;
  const startZ = BUS_ENTRY_START_Z - BUS_ENTRY_RUN * extraSteps;
  return Array.from({ length: count }, (_, i) => (
    <CuboidCollider
      key={`bus-entry-col-${i}`}
      args={[1.15 * sx, 0.025, 0.11 * sz]}
      position={[
        0,
        colliderY(BUS_ENTRY_BASE_Y + BUS_ENTRY_RISE * (i + 0.5)) * sy,
        (startZ + BUS_ENTRY_RUN * i) * sz,
      ]}
    />
  ));
};

export const getBusStopWalkColliders = (shape, sx, sy, sz, needType = null, expressionResolved = false) => {
  if (shape === 'bus_stop_layout') {
    const style = resolvePlaceNeedStyle(needType, { expressionResolved });
    return (
      <>
        {buildBusEntryWalkColliders(sx, sy, sz, style.extraNorthEntrySteps)}
        <CuboidCollider args={[2.5 * sx, 0.04, 1.3 * sz]} position={[0, colliderY(FLOOR_Y) * sy, 0]} />
        {getBusStopPillarColliders(sx, sy, sz)}
        {getBusStopRailColliders(sx, sy, sz)}
      </>
    );
  }
  return null;
};

export const getBusStopCollider = (shape, sx, sy, sz, needType = null, expressionResolved = false) => (
  getBusStopWalkColliders(shape, sx, sy, sz, needType, expressionResolved)
);
