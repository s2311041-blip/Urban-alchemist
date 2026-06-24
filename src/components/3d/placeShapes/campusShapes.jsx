import React from 'react';
import { CuboidCollider } from '@react-three/rapier';

const WALK = { stationWalk: true };
const MESH_Y_OFFSET = -0.24;
const FLOOR_Y = 0.1;
const ROAD_Y = 0.06;
const PATH_Y = FLOOR_Y + 0.006;
const colliderY = (localY) => localY + MESH_Y_OFFSET;

const PATH_COLORS = {
  commute: '#b0b0b0',
  brick: '#b5715d',
  tactile: '#fdd835',
};

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

const WalkFloor = ({ args, position, isGhost, castShadow, color = '#aed581' }) => (
  <mesh position={position} receiveShadow={castShadow} userData={WALK}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.88} {...ghostProps(isGhost)} />
  </mesh>
);

const buildEndEntryMeshes = (zStart, isGhost, castShadow) => (
  Array.from({ length: 3 }, (_, i) => (
    <mesh
      key={`campus-entry-${zStart}-${i}`}
      position={[0, 0.03 + 0.05 * (i + 0.5), zStart + (zStart < 0 ? 0.28 * i : -0.28 * i)]}
      receiveShadow={castShadow}
      userData={WALK}
    >
      <boxGeometry args={[2.2, 0.05, 0.28]} />
      <meshStandardMaterial color="#bdbdbd" roughness={0.82} {...ghostProps(isGhost)} />
    </mesh>
  ))
);

const buildEndEntryColliders = (zStart, sx, sy, sz) => (
  Array.from({ length: 3 }, (_, i) => (
    <CuboidCollider
      key={`campus-entry-col-${zStart}-${i}`}
      args={[1.05 * sx, 0.025, 0.12 * sz]}
      position={[
        0,
        colliderY(0.03 + 0.05 * (i + 0.5)) * sy,
        (zStart + (zStart < 0 ? 0.28 * i : -0.28 * i)) * sz,
      ]}
    />
  ))
);

/** 塀の内側に沿った通学路 */
const COMMUTE_PATHS = [
  { pos: [0, PATH_Y, -2.35], args: [1.55, 0.05, 3.5], color: PATH_COLORS.commute },
  { pos: [0.1, PATH_Y + 0.001, 1.35], args: [2.5, 0.05, 2.35], color: PATH_COLORS.brick },
  { pos: [-2.72, PATH_Y, 2.15], args: [0.9, 0.05, 3.95], color: PATH_COLORS.commute },
  { pos: [-1.82, PATH_Y, 0.6], args: [1.45, 0.05, 0.82], color: PATH_COLORS.commute },
  { pos: [1.52, PATH_Y, 0.62], args: [1.35, 0.05, 0.82], color: PATH_COLORS.commute },
  { pos: [2.38, PATH_Y, 2.35], args: [0.85, 0.05, 2.85], color: PATH_COLORS.commute },
  { pos: [-0.15, PATH_Y, 3.55], args: [4.6, 0.05, 0.72], color: PATH_COLORS.commute },
  { pos: [0.95, PATH_Y, 2.55], args: [1.1, 0.05, 1.35], color: PATH_COLORS.brick },
];

const FENCE_SEGMENTS = [
  { pos: [-3.18, 0, 1.95], args: [0.35, 0.38, 4.85] },
  { pos: [-0.05, 0, 4.28], args: [6.4, 0.38, 0.35] },
  { pos: [2.88, 0, 3.25], args: [0.35, 0.38, 2.35] },
  { pos: [2.88, 0, 0.78], args: [0.35, 0.38, 0.95] },
  { pos: [-1.75, 0, 0.18], args: [2.15, 0.38, 0.35] },
  { pos: [1.85, 0, 0.18], args: [1.55, 0.38, 0.35] },
];

const CrosswalkStripes = ({ z, x0, x1, isGhost, castShadow }) => {
  const count = 6;
  const pitch = (x1 - x0) / (count + 1);
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={`cw-${z}-${i}`}
          position={[x0 + pitch * (i + 1), ROAD_Y + 0.008, z]}
          receiveShadow={castShadow}
          userData={WALK}
        >
          <boxGeometry args={[0.12, 0.02, 1.35]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.9} {...ghostProps(isGhost)} />
        </mesh>
      ))}
    </>
  );
};

const StreetLamp = ({ x, z, isGhost, castShadow, lampIntensity }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 0.95, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.08, 1.9, 0.08]} />
      <meshStandardMaterial color="#455a64" metalness={0.35} roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.12, 1.92, 0]}>
      <boxGeometry args={[0.34, 0.08, 0.12]} />
      <meshStandardMaterial
        color="#fff9c4"
        emissive="#fff59d"
        emissiveIntensity={lampIntensity}
        {...ghostProps(isGhost, 0.95)}
      />
    </mesh>
  </group>
);

const Bench = ({ x, z, rot = 0, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.12, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.1, 0.08, 0.4]} />
      <meshStandardMaterial color="#6d4c41" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, -0.02, -0.2]} castShadow={castShadow}>
      <boxGeometry args={[1.1, 0.35, 0.06]} />
      <meshStandardMaterial color="#5d4037" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const CampusMapBoard = ({ x, z, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 0.65, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.1, 1.3, 0.1]} />
      <meshStandardMaterial color="#757575" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 1.35, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.15, 0.72, 0.06]} />
      <meshStandardMaterial color="#eceff1" roughness={0.75} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 1.35, 0.04]} castShadow={castShadow}>
      <boxGeometry args={[0.95, 0.48, 0.02]} />
      <meshStandardMaterial color="#2e7d32" roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 1.52, 0.05]} castShadow={castShadow}>
      <boxGeometry args={[0.55, 0.08, 0.015]} />
      <meshStandardMaterial color="#37474f" roughness={0.8} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

/** 門看板の校章（紺＋金の菱形） */
const SchoolCrest = ({ isGhost, castShadow }) => (
  <group position={[-0.95, 1.62, 0.12]}>
    <mesh castShadow={castShadow}>
      <cylinderGeometry args={[0.24, 0.24, 0.05, 20]} />
      <meshStandardMaterial color="#1a237e" roughness={0.55} metalness={0.15} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0, 0.035]} rotation={[0, 0, Math.PI / 4]} castShadow={castShadow}>
      <boxGeometry args={[0.2, 0.2, 0.025]} />
      <meshStandardMaterial color="#ffd54f" roughness={0.45} metalness={0.25} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0, 0.05]} castShadow={castShadow}>
      <boxGeometry args={[0.08, 0.14, 0.02]} />
      <meshStandardMaterial color="#fafafa" roughness={0.6} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const SchoolGate = ({ z, isGhost, castShadow }) => (
  <group position={[0, FLOOR_Y, z]}>
    {[-1.35, 1.35].map((gx) => (
      <mesh key={`pillar-${gx}`} position={[gx, 0.75, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.45, 1.5, 0.45]} />
        <meshStandardMaterial color="#b0bec5" roughness={0.82} {...ghostProps(isGhost)} />
      </mesh>
    ))}
    <mesh position={[0, 1.62, 0]} castShadow={castShadow}>
      <boxGeometry args={[3.25, 0.35, 0.18]} />
      <meshStandardMaterial color="#fafafa" roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
    <SchoolCrest isGhost={isGhost} castShadow={castShadow} />
    <mesh position={[0.35, 1.62, 0.1]} castShadow={castShadow}>
      <boxGeometry args={[1.75, 0.2, 0.04]} />
      <meshStandardMaterial color="#1a237e" roughness={0.65} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.35, 1.48, 0.1]} castShadow={castShadow}>
      <boxGeometry args={[1.45, 0.06, 0.03]} />
      <meshStandardMaterial color="#455a64" roughness={0.75} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.08, 0.35]} receiveShadow={castShadow} userData={WALK}>
      <boxGeometry args={[2.5, 0.06, 0.5]} />
      <meshStandardMaterial color="#bcaaa4" roughness={0.88} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const FenceSegment = ({ pos, args, isGhost, castShadow }) => (
  <group position={pos}>
    <mesh position={[0, 0.22, 0]} castShadow={castShadow}>
      <boxGeometry args={[args[0], 0.38, args[2]]} />
      <meshStandardMaterial color="#cfd8dc" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.48, 0]} castShadow={castShadow}>
      <boxGeometry args={[args[0] * 0.98, 0.06, args[2] * 0.98]} />
      <meshStandardMaterial color="#66bb6a" roughness={0.85} transparent opacity={isGhost ? 0.35 : 0.6} />
    </mesh>
    {args[0] > args[2] ? (
      Array.from({ length: Math.floor(args[0] / 1.1) }, (_, i) => {
        const ox = -args[0] / 2 + 0.55 + i * 1.1;
        return (
          <mesh key={`post-${ox}`} position={[ox, 0.42, 0]} castShadow={castShadow}>
            <boxGeometry args={[0.06, 0.52, 0.06]} />
            <meshStandardMaterial color="#90a4ae" roughness={0.85} {...ghostProps(isGhost)} />
          </mesh>
        );
      })
    ) : (
      Array.from({ length: Math.floor(args[2] / 1.1) }, (_, i) => {
        const oz = -args[2] / 2 + 0.55 + i * 1.1;
        return (
          <mesh key={`post-${oz}`} position={[0, 0.42, oz]} castShadow={castShadow}>
            <boxGeometry args={[0.06, 0.52, 0.06]} />
            <meshStandardMaterial color="#90a4ae" roughness={0.85} {...ghostProps(isGhost)} />
          </mesh>
        );
      })
    )}
  </group>
);

const WindowRow = ({ x, y, z, w, isGhost, castShadow }) => (
  <mesh position={[x, y, z]} castShadow={castShadow}>
    <boxGeometry args={[w, 0.42, 0.05]} />
    <meshStandardMaterial color="#37474f" roughness={0.35} metalness={0.25} {...ghostProps(isGhost)} />
  </mesh>
);

const SchoolBuilding = ({ isGhost, castShadow, windowGlow }) => {
  const baseZ = 3.15;
  const bodyY = FLOOR_Y + 1.55;
  return (
    <group position={[0.2, FLOOR_Y, baseZ]}>
      <mesh position={[0, bodyY, 0]} castShadow={castShadow}>
        <boxGeometry args={[6.2, 3.1, 2.35]} />
        <meshStandardMaterial color="#cfd8dc" roughness={0.82} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[-2.85, bodyY - 0.35, -0.35]} castShadow={castShadow}>
        <boxGeometry args={[2.4, 2.4, 1.85]} />
        <meshStandardMaterial color="#b0bec5" roughness={0.84} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, bodyY + 1.72, 0.1]} castShadow={castShadow}>
        <boxGeometry args={[0.55, 0.95, 0.55]} />
        <meshStandardMaterial color="#eceff1" roughness={0.75} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, bodyY + 2.35, 0.1]} castShadow={castShadow}>
        <boxGeometry args={[0.38, 0.22, 0.38]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, bodyY - 1.15, -1.22]} castShadow={castShadow}>
        <boxGeometry args={[2.2, 0.18, 0.55]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>
      {[0.55, 1.35, 2.15].map((wy, fi) => (
        <group key={`floor-${fi}`}>
          {[-2.1, -1.1, 0, 1.1, 2.1].map((wx) => (
            <WindowRow
              key={`win-${fi}-${wx}`}
              x={wx}
              y={bodyY - 0.95 + fi * 0.95}
              z={-1.2}
              w={0.62}
              isGhost={isGhost}
              castShadow={castShadow}
            />
          ))}
        </group>
      ))}
      <mesh position={[2.35, bodyY - 0.2, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.35, 2.2, 1.6]} />
        <meshStandardMaterial color="#90a4ae" roughness={0.88} {...ghostProps(isGhost)} />
      </mesh>
      {[-0.9, -0.3, 0.3, 0.9].map((sx) => (
        <mesh key={`shoe-${sx}`} position={[sx, bodyY - 1.38, -1.05]} castShadow={castShadow}>
          <boxGeometry args={[0.42, 0.28, 0.35]} />
          <meshStandardMaterial color="#efebe9" roughness={0.9} {...ghostProps(isGhost)} />
        </mesh>
      ))}
      {!isGhost && (
        <pointLight position={[0, bodyY + 0.5, -1.5]} distance={4} intensity={windowGlow * 0.35} color="#fff8e1" />
      )}
    </group>
  );
};

const SoccerGoal = ({ x, z, rot = 0, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y + 0.05, z]} rotation={[0, rot, 0]}>
    <mesh position={[-0.55, 0.45, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.05, 0.9, 0.05]} />
      <meshStandardMaterial color="#fafafa" roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.55, 0.45, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.05, 0.9, 0.05]} />
      <meshStandardMaterial color="#fafafa" roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.9, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.15, 0.05, 0.05]} />
      <meshStandardMaterial color="#fafafa" roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const AthleticField = ({ isGhost, castShadow }) => (
  <group position={[-1.55, FLOOR_Y + 0.01, 2.2]}>
    <mesh receiveShadow={castShadow}>
      <boxGeometry args={[4.35, 0.04, 3.55]} />
      <meshStandardMaterial color="#c9a66b" roughness={0.95} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.025, 0]} receiveShadow={castShadow}>
      <boxGeometry args={[3.7, 0.02, 2.75]} />
      <meshStandardMaterial color="#b8956a" roughness={0.96} {...ghostProps(isGhost)} />
    </mesh>
    {[-1.55, -0.75, 0.05, 0.85, 1.65].map((lz) => (
      <mesh key={`lane-${lz}`} position={[0, 0.03, lz]} receiveShadow={castShadow}>
        <boxGeometry args={[3.5, 0.015, 0.05]} />
        <meshStandardMaterial color="#fafafa" roughness={0.9} {...ghostProps(isGhost, 0.9)} />
      </mesh>
    ))}
    {[-1.55, 1.55].map((lx) => (
      <mesh key={`curve-${lx}`} position={[lx, 0.03, 0]} receiveShadow={castShadow}>
        <boxGeometry args={[0.05, 0.015, 2.55]} />
        <meshStandardMaterial color="#fafafa" roughness={0.9} {...ghostProps(isGhost, 0.9)} />
      </mesh>
    ))}
    <mesh position={[0, 0.032, 0]} receiveShadow={castShadow}>
      <boxGeometry args={[0.55, 0.012, 0.55]} />
      <meshStandardMaterial color="#fafafa" roughness={0.9} {...ghostProps(isGhost, 0.85)} />
    </mesh>
    <SoccerGoal x={-1.55} z={-1.35} rot={0} isGhost={isGhost} castShadow={castShadow} />
    <SoccerGoal x={1.55} z={1.35} rot={Math.PI} isGhost={isGhost} castShadow={castShadow} />
  </group>
);

const TennisCourt = ({ isGhost, castShadow }) => (
  <group position={[1.35, FLOOR_Y + 0.008, 1.85]}>
    <mesh receiveShadow={castShadow}>
      <boxGeometry args={[1.85, 0.035, 2.65]} />
      <meshStandardMaterial color="#558b2f" roughness={0.88} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.02, 0]} receiveShadow={castShadow}>
      <boxGeometry args={[1.55, 0.015, 2.35]} />
      <meshStandardMaterial color="#689f38" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.025, 0]} receiveShadow={castShadow}>
      <boxGeometry args={[0.04, 0.01, 2.35]} />
      <meshStandardMaterial color="#fafafa" roughness={0.85} {...ghostProps(isGhost, 0.9)} />
    </mesh>
    {[-0.55, 0.55].map((tx) => (
      <mesh key={`tc-${tx}`} position={[tx, 0.025, 0]} receiveShadow={castShadow}>
        <boxGeometry args={[0.04, 0.01, 2.35]} />
        <meshStandardMaterial color="#fafafa" roughness={0.85} {...ghostProps(isGhost, 0.9)} />
      </mesh>
    ))}
  </group>
);

const GymStorageShed = ({ isGhost, castShadow }) => (
  <group position={[-3.05, FLOOR_Y, 3.35]}>
    <mesh position={[0, 0.55, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.35, 1.1, 1.6]} />
      <meshStandardMaterial color="#a1887f" roughness={0.88} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 1.18, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.45, 0.14, 1.7]} />
      <meshStandardMaterial color="#6d4c41" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.55, 0.82]} castShadow={castShadow}>
      <boxGeometry args={[0.65, 0.75, 0.05]} />
      <meshStandardMaterial color="#5d4037" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const FlagPole = ({ x, z, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 1.35, 0]} castShadow={castShadow}>
      <cylinderGeometry args={[0.04, 0.05, 2.7, 8]} />
      <meshStandardMaterial color="#cfd8dc" metalness={0.45} roughness={0.55} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.35, 2.35, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.7, 0.42, 0.03]} />
      <meshStandardMaterial color="#fafafa" roughness={0.75} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.35, 2.35, 0.02]} castShadow={castShadow}>
      <boxGeometry args={[0.22, 0.22, 0.02]} />
      <meshStandardMaterial color="#c62828" roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const BikeRack = ({ x, z, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 0.35, 0]} castShadow={castShadow}>
      <boxGeometry args={[2.1, 0.06, 0.55]} />
      <meshStandardMaterial color="#78909c" roughness={0.8} {...ghostProps(isGhost)} />
    </mesh>
    {[-0.8, -0.35, 0.15, 0.65].map((bx) => (
      <mesh key={`rack-${bx}`} position={[bx, 0.18, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.05, 0.32, 0.42]} />
        <meshStandardMaterial color="#546e7a" metalness={0.35} {...ghostProps(isGhost)} />
      </mesh>
    ))}
  </group>
);

const SakuraTree = ({ x, z, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 0.55, 0]} castShadow={castShadow}>
      <cylinderGeometry args={[0.12, 0.16, 1.1, 8]} />
      <meshStandardMaterial color="#5d4037" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 1.35, 0]} castShadow={castShadow}>
      <sphereGeometry args={[0.75, 12, 10]} />
      <meshStandardMaterial color="#f48fb1" roughness={0.82} {...ghostProps(isGhost, 0.92)} />
    </mesh>
  </group>
);

/**
 * 学校・キャンパス：校舎外観・校門・塀沿い通学路・グラウンド・校庭施設
 * 主軸 Z（-Z 手前＝島接続、+Z 奥＝校舎）
 */
export const renderCampusLayout = ({
  isGhost, meshPosition, meshRotation, handlers, castShadow, isBuilding, nightFactor,
}) => {
  const lampIntensity = isGhost ? 0.3 : (0.45 + nightFactor * 0.75);
  const windowGlow = isGhost ? 0.15 : (0.35 + nightFactor * 0.55);

  return (
    <group position={meshPosition} rotation={meshRotation} {...interactionProps(handlers)}>
      {buildEndEntryMeshes(-4.6, isGhost, castShadow)}
      {buildEndEntryMeshes(4.6, isGhost, castShadow)}

      <WalkFloor args={[10, 0.05, 9]} position={[0, FLOOR_Y - 0.02, 0]} isGhost={isGhost} castShadow={castShadow} color="#7cb342" />
      <WalkFloor args={[3.2, 0.05, 7.5]} position={[-3.3, FLOOR_Y, 0.2]} isGhost={isGhost} castShadow={castShadow} color="#9ccc65" />

      <mesh position={[3.65, ROAD_Y, -0.8]} receiveShadow={castShadow}>
        <boxGeometry args={[1.7, 0.06, 8.5]} />
        <meshStandardMaterial color="#424242" roughness={0.94} {...ghostProps(isGhost)} />
      </mesh>
      <WalkFloor args={[0.55, 0.05, 8.2]} position={[2.75, FLOOR_Y + 0.003, -0.8]} isGhost={isGhost} castShadow={castShadow} color="#e0e0e0" />

      {COMMUTE_PATHS.map((path, i) => (
        <WalkFloor
          key={`commute-${i}`}
          args={path.args}
          position={path.pos}
          isGhost={isGhost}
          castShadow={castShadow}
          color={path.color}
        />
      ))}

      <CrosswalkStripes z={-1.15} x0={2.35} x1={4.35} isGhost={isGhost} castShadow={castShadow} />
      <WalkFloor args={[0.35, 0.05, 1.5]} position={[3.15, PATH_Y + 0.002, -1.15]} isGhost={isGhost} castShadow={castShadow} color={PATH_COLORS.tactile} />

      <AthleticField isGhost={isGhost} castShadow={castShadow} />
      <TennisCourt isGhost={isGhost} castShadow={castShadow} />
      <SchoolBuilding isGhost={isGhost} castShadow={castShadow} windowGlow={windowGlow} />
      <SchoolGate z={0.35} isGhost={isGhost} castShadow={castShadow} />
      <GymStorageShed isGhost={isGhost} castShadow={castShadow} />
      <FlagPole x={-2.35} z={3.75} isGhost={isGhost} castShadow={castShadow} />

      {FENCE_SEGMENTS.map((seg, i) => (
        <FenceSegment key={`fence-${i}`} pos={[seg.pos[0], FLOOR_Y, seg.pos[2]]} args={seg.args} isGhost={isGhost} castShadow={castShadow} />
      ))}

      <BikeRack x={2.35} z={2.55} isGhost={isGhost} castShadow={castShadow} />
      <CampusMapBoard x={2.1} z={0.55} isGhost={isGhost} castShadow={castShadow} />
      <Bench x={-2.05} z={-0.3} rot={0.55} isGhost={isGhost} castShadow={castShadow} />
      <Bench x={2.45} z={3.35} rot={-0.2} isGhost={isGhost} castShadow={castShadow} />
      <SakuraTree x={-3.2} z={1.6} isGhost={isGhost} castShadow={castShadow} />

      <StreetLamp x={-1.05} z={-3.1} isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity} />
      <StreetLamp x={-2.55} z={0.85} isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity * 0.9} />
      <StreetLamp x={2.05} z={1.2} isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity * 0.85} />
      <StreetLamp x={3.15} z={-2.5} isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity * 0.85} />

      {!isGhost && !isBuilding && (
        <>
          <pointLight position={[-1.05, 2.2, -2.3]} distance={5.5} intensity={0.15 + nightFactor * 0.4} color="#fff9c4" />
          <pointLight position={[-2.55, 2.0, 0.9]} distance={4.5} intensity={0.1 + nightFactor * 0.28} color="#fff9c4" />
          <pointLight position={[0.2, 2.5, 3.2]} distance={5} intensity={0.08 + nightFactor * 0.2} color="#e3f2fd" />
        </>
      )}
    </group>
  );
};

export const CAMPUS_SHAPE_IDS = ['campus_layout'];

export const isCampusShape = (shape) => CAMPUS_SHAPE_IDS.includes(shape);

export const getCampusMeshPosition = (shape) => (
  CAMPUS_SHAPE_IDS.includes(shape) ? [0, -0.24, 0] : [0, 0, 0]
);

const pathCollider = (path, sx, sy, sz, key) => (
  <CuboidCollider
    key={key}
    args={[(path.args[0] * 0.5) * sx, 0.04 * sy, (path.args[2] * 0.5) * sz]}
    position={[path.pos[0] * sx, colliderY(FLOOR_Y) * sy, path.pos[2] * sz]}
  />
);

export const getCampusWalkColliders = (shape, sx, sy, sz) => {
  if (shape === 'campus_layout') {
    return (
      <>
        {buildEndEntryColliders(-4.6, sx, sy, sz)}
        {buildEndEntryColliders(4.6, sx, sy, sz)}
        {COMMUTE_PATHS.map((path, i) => pathCollider(path, sx, sy, sz, `campus-path-${i}`))}
        <CuboidCollider args={[0.25 * sx, 0.04, 1.8 * sz]} position={[3.15 * sx, colliderY(FLOOR_Y) * sy, -1.15 * sz]} />
        <CuboidCollider args={[1.2 * sx, 0.04, 0.22 * sz]} position={[0, colliderY(FLOOR_Y) * sy, 0.35 * sz]} />
        <CuboidCollider args={[3.0 * sx, 1.55 * sy, 1.1 * sz]} position={[0.2 * sx, colliderY(1.55) * sy, 3.15 * sz]} />
        <CuboidCollider args={[1.15 * sx, 1.2 * sy, 0.85 * sz]} position={[-2.65 * sx, colliderY(1.2) * sy, 2.8 * sz]} />
        <CuboidCollider args={[0.65 * sx, 0.55 * sy, 0.75 * sz]} position={[-3.05 * sx, colliderY(0.55) * sy, 3.35 * sz]} />
        <CuboidCollider args={[0.2 * sx, 0.7 * sy, 0.2 * sz]} position={[-1.35 * sx, colliderY(0.7) * sy, 0.35 * sz]} />
        <CuboidCollider args={[0.2 * sx, 0.7 * sy, 0.2 * sz]} position={[1.35 * sx, colliderY(0.7) * sy, 0.35 * sz]} />
        <CuboidCollider args={[0.15 * sx, 0.9 * sy, 0.15 * sz]} position={[-1.05 * sx, colliderY(0.9) * sy, -3.1 * sz]} />
        <CuboidCollider args={[0.15 * sx, 0.9 * sy, 0.15 * sz]} position={[-2.55 * sx, colliderY(0.9) * sy, 0.85 * sz]} />
        <CuboidCollider args={[0.15 * sx, 0.9 * sy, 0.15 * sz]} position={[2.05 * sx, colliderY(0.9) * sy, 1.2 * sz]} />
        <CuboidCollider args={[0.15 * sx, 0.9 * sy, 0.15 * sz]} position={[3.15 * sx, colliderY(0.9) * sy, -2.5 * sz]} />
      </>
    );
  }
  return null;
};

export const getCampusCollider = (shape, sx, sy, sz) => getCampusWalkColliders(shape, sx, sy, sz);
