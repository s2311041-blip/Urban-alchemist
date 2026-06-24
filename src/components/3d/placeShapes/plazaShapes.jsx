import React from 'react';
import { Text } from '@react-three/drei';
import { CuboidCollider } from '@react-three/rapier';
import { PALETTE } from '../../../constants/artDirection';
import { placeMat, PLACE_COLORS, StringLightRow } from './placeVoxelHelpers';

const WALK = { stationWalk: true };
const MESH_Y_OFFSET = -0.24;
const FLOOR_Y = 0.1;
const ROAD_Y = 0.06;
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

const WalkFloor = ({ args, position, isGhost, castShadow, color = PLACE_COLORS.walkWarm }) => (
  <mesh position={position} receiveShadow={castShadow} userData={WALK}>
    <boxGeometry args={args} />
    <meshStandardMaterial {...placeMat(color)} {...ghostProps(isGhost)} />
  </mesh>
);

const RoadSurface = ({ args, position, rotation = [0, 0, 0], isGhost, castShadow }) => (
  <mesh position={position} rotation={rotation} receiveShadow={castShadow}>
    <boxGeometry args={args} />
    <meshStandardMaterial color="#4a4a4a" roughness={0.92} metalness={0.05} {...ghostProps(isGhost)} />
  </mesh>
);

const WallCollider = ({ args, position }) => (
  <CuboidCollider args={args} position={position} />
);

const ROTARY_SEGMENTS = [
  { pos: [0, ROAD_Y, 3.6], args: [9.2, 0.06, 2], rot: [0, 0, 0] },
  { pos: [-3.8, ROAD_Y, 4.9], args: [3.2, 0.06, 2.4], rot: [0, 0.32, 0] },
  { pos: [3.8, ROAD_Y, 4.9], args: [3.2, 0.06, 2.4], rot: [0, -0.32, 0] },
  { pos: [0, ROAD_Y, 5.8], args: [6.5, 0.06, 1.4], rot: [0, 0, 0] },
];

const BUS_BAY_MARKS = [
  { pos: [-3.2, ROAD_Y + 0.035, 4.2], args: [1.8, 0.01, 0.08] },
  { pos: [0, ROAD_Y + 0.035, 4.5], args: [1.8, 0.01, 0.08] },
  { pos: [3.2, ROAD_Y + 0.035, 4.2], args: [1.8, 0.01, 0.08] },
];

const PLAZA_ENTRY_STEPS = 3;

const buildPlazaEntryMeshes = (isGhost, castShadow) => (
  Array.from({ length: PLAZA_ENTRY_STEPS }, (_, i) => (
    <mesh
      key={`plaza-entry-${i}`}
      position={[0, 0.03 + 0.05 * (i + 0.5), -3.35 + 0.28 * i]}
      receiveShadow={castShadow}
      userData={WALK}
    >
      <boxGeometry args={[4.2, 0.05, 0.28]} />
      <meshStandardMaterial color="#bdbdbd" roughness={0.82} {...ghostProps(isGhost)} />
    </mesh>
  ))
);

const buildPlazaEntryColliders = (sx, sy, sz) => (
  Array.from({ length: PLAZA_ENTRY_STEPS }, (_, i) => (
    <CuboidCollider
      key={`plaza-entry-col-${i}`}
      args={[2.05 * sx, 0.025, 0.12 * sz]}
      position={[0, colliderY(0.03 + 0.05 * (i + 0.5)) * sy, (-3.35 + 0.28 * i) * sz]}
    />
  ))
);

const GreenIsland = ({ position, isGhost, castShadow }) => (
  <group position={position}>
    <mesh position={[0, FLOOR_Y + 0.12, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.6, 0.24, 1.2]} />
      <meshStandardMaterial color="#8d6e63" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, FLOOR_Y + 0.42, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.1, 0.35, 0.9]} />
      <meshStandardMaterial color="#558b2f" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.25, FLOOR_Y + 0.78, 0.15]} castShadow={castShadow}>
      <cylinderGeometry args={[0.08, 0.1, 0.75, 8]} />
      <meshStandardMaterial color="#6d4c41" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.25, FLOOR_Y + 1.2, 0.15]} castShadow={castShadow}>
      <sphereGeometry args={[0.42, 12, 12]} />
      <meshStandardMaterial color="#7cb342" roughness={0.8} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const renderClockTower = ({ isGhost, castShadow, signIntensity }) => (
  <group position={[0, FLOOR_Y, -4.85]}>
    <mesh position={[0, 0.22, 0]} receiveShadow={castShadow}>
      <boxGeometry args={[8.5, 0.12, 1.6]} />
      <meshStandardMaterial color="#eceff1" roughness={0.75} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[-3.4, 1.55, 0.15]} castShadow={castShadow}>
      <boxGeometry args={[1.1, 3.1, 0.85]} />
      <meshStandardMaterial color="#cfd8dc" roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[3.4, 1.55, 0.15]} castShadow={castShadow}>
      <boxGeometry args={[1.1, 3.1, 0.85]} />
      <meshStandardMaterial color="#cfd8dc" roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 1.75, 0.2]} castShadow={castShadow}>
      <boxGeometry args={[5.8, 3.2, 0.12]} />
      <meshStandardMaterial
        color="#b3e5fc"
        transparent
        opacity={isGhost ? 0.25 : 0.42}
        metalness={0.72}
        roughness={0.12}
      />
    </mesh>
    {[-1.35, 0, 1.35].map((x) => (
      <group key={`facade-door-${x}`} position={[x, 0.95, 0.42]}>
        <mesh>
          <boxGeometry args={[1.15, 2.1, 0.06]} />
          <meshStandardMaterial color="#263238" transparent opacity={isGhost ? 0.35 : 0.55} />
        </mesh>
      </group>
    ))}
    <mesh position={[0, 3.35, 0.35]} castShadow={castShadow}>
      <boxGeometry args={[6.2, 0.18, 1.4]} />
      <meshStandardMaterial color="#fafafa" {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 3.55, 0.48]} castShadow={castShadow}>
      <boxGeometry args={[3.4, 0.42, 0.1]} />
      <meshStandardMaterial color="#1565c0" emissive="#42a5f5" emissiveIntensity={signIntensity} {...ghostProps(isGhost, 0.95)} />
    </mesh>
    <group position={[-1.55, 0, -0.15]}>
      <mesh position={[0, 1.9, 0]} castShadow={castShadow}>
        <boxGeometry args={[1.15, 3.8, 1.15]} />
        <meshStandardMaterial color="#eceff1" roughness={0.55} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, 3.95, 0.42]} castShadow={castShadow}>
        <boxGeometry args={[0.95, 0.95, 0.08]} />
        <meshStandardMaterial color="#ffffff" emissive="#fff9c4" emissiveIntensity={signIntensity * 0.35} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, 3.95, 0.47]}>
        <cylinderGeometry args={[0.34, 0.34, 0.03, 24]} />
        <meshStandardMaterial color="#263238" emissive="#37474f" emissiveIntensity={0.15} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, 3.95, 0.5]}>
        <boxGeometry args={[0.04, 0.28, 0.02]} />
        <meshStandardMaterial color="#263238" {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, 3.95, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.04, 0.2, 0.02]} />
        <meshStandardMaterial color="#263238" {...ghostProps(isGhost)} />
      </mesh>
    </group>
  </group>
);

const renderRotary = ({ isGhost, castShadow }) => (
  <group>
    {ROTARY_SEGMENTS.map((seg, i) => (
      <RoadSurface
        key={`rotary-${i}`}
        position={seg.pos}
        args={seg.args}
        rotation={seg.rot}
        isGhost={isGhost}
        castShadow={castShadow}
      />
    ))}
    {BUS_BAY_MARKS.map((mark, i) => (
      <mesh key={`bus-mark-${i}`} position={mark.pos}>
        <boxGeometry args={mark.args} />
        <meshStandardMaterial color="#fafafa" emissive="#ffffff" emissiveIntensity={0.2} {...ghostProps(isGhost, 0.95)} />
      </mesh>
    ))}
    <mesh position={[0, ROAD_Y + 0.18, 5.15]} castShadow={castShadow}>
      <cylinderGeometry args={[1.1, 1.2, 0.32, 16]} />
      <meshStandardMaterial color="#8d6e63" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, ROAD_Y + 0.52, 5.15]} castShadow={castShadow}>
      <cylinderGeometry args={[0.85, 0.9, 0.42, 16]} />
      <meshStandardMaterial color="#689f38" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, ROAD_Y + 0.86, 5.15]} castShadow={castShadow}>
      <sphereGeometry args={[0.35, 12, 12]} />
      <meshStandardMaterial color="#7cb342" roughness={0.8} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const getPlazaFacadeColliders = (sx, sy, sz) => (
  <>
    <WallCollider args={[0.5 * sx, 1.45 * sy, 0.06 * sz]} position={[-3.4 * sx, colliderY(1.45) * sy, -4.7 * sz]} />
    <WallCollider args={[0.5 * sx, 1.45 * sy, 0.06 * sz]} position={[3.4 * sx, colliderY(1.45) * sy, -4.7 * sz]} />
    <WallCollider args={[1.2 * sx, 1.75 * sy, 0.06 * sz]} position={[-1.55 * sx, colliderY(1.9) * sy, -4.95 * sz]} />
    <WallCollider args={[0.9 * sx, 0.55 * sy, 0.06 * sz]} position={[-2.75 * sx, colliderY(1.35) * sy, -4.65 * sz]} />
    <WallCollider args={[0.9 * sx, 0.55 * sy, 0.06 * sz]} position={[2.75 * sx, colliderY(1.35) * sy, -4.65 * sz]} />
  </>
);

const getPlazaRailColliders = (sx, sy, sz) => (
  <>
    {[-4.6, 4.6].map((x) => (
      <WallCollider
        key={`plaza-rail-${x}`}
        args={[0.04 * sx, 0.42 * sy, 0.04 * sz]}
        position={[x * sx, colliderY(0.32) * sy, 3.15 * sz]}
      />
    ))}
    <WallCollider args={[3.6 * sx, 0.04 * sy, 0.04 * sz]} position={[0, colliderY(0.52) * sy, 3.15 * sz]} />
  </>
);

/**
 * 駅前広場（時計塔ファサード・歩行者広場・バスロータリー）。
 * -Z = 駅・時計塔側、+Z = ロータリー（車道）側
 */
export const renderPlazaLayout = ({
  isGhost, meshPosition, meshRotation, handlers, castShadow, isBuilding, nightFactor,
}) => {
  const lampIntensity = isGhost ? 0.35 : (0.75 + nightFactor * 0.85);
  const signIntensity = isGhost ? 0.25 : (0.65 + nightFactor * 1.1);
  const lightPolePositions = [[-4.2, 1.2], [4.2, 1.2], [-4.2, -1.2], [4.2, -1.2]];
  const benchPositions = [[-2.2, 1.5], [2.2, 1.5], [0, -1.3]];

  return (
    <group position={meshPosition} rotation={meshRotation} {...interactionProps(handlers)}>
      {buildPlazaEntryMeshes(isGhost, castShadow)}
      {renderClockTower({ isGhost, castShadow, signIntensity })}

      <WalkFloor args={[9.5, 0.1, 5.2]} position={[0, FLOOR_Y, -0.2]} isGhost={isGhost} castShadow={castShadow} color={PLACE_COLORS.plaster} />
      <StringLightRow from={[-4.2, FLOOR_Y + 2.2, -2.2]} to={[4.2, FLOOR_Y + 2.2, -2.2]} y={FLOOR_Y + 2.15} intensity={0.8} isGhost={isGhost} />
      <mesh position={[0, FLOOR_Y + 0.06, -0.2]} receiveShadow={castShadow}>
        <boxGeometry args={[0.45, 0.03, 4.8]} />
        <meshStandardMaterial {...placeMat(PALETTE.lampWarm, { emissive: PALETTE.lampEmissive, emissiveIntensity: isGhost ? 0.2 : 0.55 })} {...ghostProps(isGhost, 0.95)} />
      </mesh>

      <GreenIsland position={[-2.6, 0, 0.4]} isGhost={isGhost} castShadow={castShadow} />
      <GreenIsland position={[2.6, 0, -0.6]} isGhost={isGhost} castShadow={castShadow} />

      {benchPositions.map(([x, z]) => (
        <group key={`plaza-bench-${x}-${z}`} position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.12, 0]} castShadow={castShadow}>
            <boxGeometry args={[1.35, 0.08, 0.45]} />
            <meshStandardMaterial color="#6d4c41" roughness={0.85} {...ghostProps(isGhost)} />
          </mesh>
          <mesh position={[0, -0.02, -0.25]} castShadow={castShadow}>
            <boxGeometry args={[1.35, 0.35, 0.06]} />
            <meshStandardMaterial color="#5d4037" roughness={0.9} {...ghostProps(isGhost)} />
          </mesh>
        </group>
      ))}

      <group position={[3.2, FLOOR_Y, -1.8]}>
        <mesh position={[0, 0.85, 0]} castShadow={castShadow}>
          <boxGeometry args={[0.06, 1.7, 0.9]} />
          <meshStandardMaterial color="#cfd8dc" roughness={0.7} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[-0.04, 1.05, 0]} castShadow={castShadow}>
          <boxGeometry args={[0.02, 1.2, 0.75]} />
          <meshStandardMaterial color="#ffffff" emissive="#fafafa" emissiveIntensity={signIntensity * 0.25} {...ghostProps(isGhost)} />
        </mesh>
        <Text position={[0, 1.45, 0.08]} fontSize={0.1} color="#1565c0" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#ffffff">
          駅前
        </Text>
      </group>

      {lightPolePositions.map(([x, z]) => (
        <group key={`plaza-light-${x}-${z}`} position={[x, FLOOR_Y, z]}>
          <mesh position={[0, 0.95, 0]} castShadow={castShadow}>
            <boxGeometry args={[0.08, 1.9, 0.08]} />
            <meshStandardMaterial color="#37474f" metalness={0.4} {...ghostProps(isGhost)} />
          </mesh>
          <mesh position={[0.14, 1.95, 0]}>
            <boxGeometry args={[0.42, 0.1, 0.14]} />
            <meshStandardMaterial color="#fff9c4" emissive="#fff59d" emissiveIntensity={lampIntensity} {...ghostProps(isGhost, 0.95)} />
          </mesh>
        </group>
      ))}

      <WalkFloor args={[9.2, 0.08, 1.1]} position={[0, FLOOR_Y, 2.55]} isGhost={isGhost} castShadow={castShadow} color="#d7ccc8" />
      {[-4.6, 4.6].map((x) => (
        <group key={`plaza-rail-vis-${x}`} position={[x, FLOOR_Y + 0.22, 3.15]}>
          <mesh castShadow={castShadow}>
            <boxGeometry args={[0.04, 0.85, 0.04]} />
            <meshStandardMaterial color="#90a4ae" metalness={0.55} {...ghostProps(isGhost)} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, FLOOR_Y + 0.38, 3.15]} castShadow={castShadow}>
        <boxGeometry args={[8.4, 0.04, 0.04]} />
        <meshStandardMaterial color="#90a4ae" metalness={0.55} {...ghostProps(isGhost)} />
      </mesh>

      {renderRotary({ isGhost, castShadow })}

      {!isGhost && !isBuilding && (
        <>
          <pointLight position={[0, 3.8, -4.5]} distance={11} intensity={0.42 + nightFactor * 0.75} color="#FFF8E1" />
          <pointLight position={[0, 1.8, 0]} distance={10} intensity={0.36 + nightFactor * 0.55} color={PALETTE.lampEmissive} />
          <pointLight position={[-3, 2.2, 1]} distance={7} intensity={0.24 + nightFactor * 0.42} color="#FFCC80" />
          <pointLight position={[3, 2.2, -1]} distance={7} intensity={0.24 + nightFactor * 0.42} color="#FFCC80" />
        </>
      )}
    </group>
  );
};

export const PLAZA_SHAPE_IDS = ['plaza_layout'];

export const isPlazaShape = (shape) => PLAZA_SHAPE_IDS.includes(shape);

export const getPlazaMeshPosition = (shape) => (
  PLAZA_SHAPE_IDS.includes(shape) ? [0, -0.24, 0] : [0, 0, 0]
);

export const getPlazaWalkColliders = (shape, sx, sy, sz) => {
  if (shape === 'plaza_layout') {
    return (
      <>
        {buildPlazaEntryColliders(sx, sy, sz)}
        <CuboidCollider args={[4.6 * sx, 0.04, 2.5 * sz]} position={[0, colliderY(FLOOR_Y) * sy, -0.2 * sz]} />
        <CuboidCollider args={[4.5 * sx, 0.04, 0.5 * sz]} position={[0, colliderY(FLOOR_Y) * sy, 2.55 * sz]} />
        {getPlazaFacadeColliders(sx, sy, sz)}
        {getPlazaRailColliders(sx, sy, sz)}
      </>
    );
  }
  return null;
};

export const getPlazaCollider = (shape, sx, sy, sz) => getPlazaWalkColliders(shape, sx, sy, sz);
