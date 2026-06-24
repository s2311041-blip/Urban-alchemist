import React from 'react';
import { CuboidCollider } from '@react-three/rapier';

const WALK = { stationWalk: true };
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

const WalkFloor = ({ args, position, isGhost, castShadow, color = '#aed581' }) => (
  <mesh position={position} receiveShadow={castShadow} userData={WALK}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.88} {...ghostProps(isGhost)} />
  </mesh>
);

const buildEndEntryMeshes = (zStart, isGhost, castShadow) => (
  Array.from({ length: 3 }, (_, i) => (
    <mesh
      key={`park-entry-${zStart}-${i}`}
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
      key={`park-entry-col-${zStart}-${i}`}
      args={[1.05 * sx, 0.025, 0.12 * sz]}
      position={[
        0,
        colliderY(0.03 + 0.05 * (i + 0.5)) * sy,
        (zStart + (zStart < 0 ? 0.28 * i : -0.28 * i)) * sz,
      ]}
    />
  ))
);

const Bench = ({ x, z, rot = 0, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.12, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.2, 0.08, 0.42]} />
      <meshStandardMaterial color="#6d4c41" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, -0.02, -0.22]} castShadow={castShadow}>
      <boxGeometry args={[1.2, 0.35, 0.06]} />
      <meshStandardMaterial color="#5d4037" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const PicnicTable = ({ x, z, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 0.38, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.4, 0.06, 0.8]} />
      <meshStandardMaterial color="#795548" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    {[[-0.55, -0.28], [0.55, -0.28], [-0.55, 0.28], [0.55, 0.28]].map(([bx, bz], i) => (
      <mesh key={`seat-${i}`} position={[bx, 0.2, bz]} castShadow={castShadow}>
        <boxGeometry args={[0.42, 0.05, 0.28]} />
        <meshStandardMaterial color="#6d4c41" roughness={0.88} {...ghostProps(isGhost)} />
      </mesh>
    ))}
  </group>
);

const ParkTree = ({ x, z, scale = 1, sakura = false, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]} scale={scale}>
    <mesh position={[0, 0.5, 0]} castShadow={castShadow}>
      <cylinderGeometry args={[0.12, 0.16, 1, 8]} />
      <meshStandardMaterial color="#6d4c41" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 1.35, 0]} castShadow={castShadow}>
      <sphereGeometry args={[sakura ? 0.95 : 0.65, 14, 12]} />
      <meshStandardMaterial color={sakura ? '#f8bbd0' : '#7cb342'} roughness={0.82} {...ghostProps(isGhost)} />
    </mesh>
    {sakura && (
      <>
        <mesh position={[0.45, 1.15, 0.25]} castShadow={castShadow}>
          <sphereGeometry args={[0.55, 12, 10]} />
          <meshStandardMaterial color="#f48fb1" roughness={0.85} {...ghostProps(isGhost, 0.92)} />
        </mesh>
        <mesh position={[-0.4, 1.1, -0.2]} castShadow={castShadow}>
          <sphereGeometry args={[0.5, 12, 10]} />
          <meshStandardMaterial color="#f06292" roughness={0.85} {...ghostProps(isGhost, 0.9)} />
        </mesh>
      </>
    )}
  </group>
);

const FlowerBed = ({ x, z, w, d, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y + 0.02, z]}>
    <mesh receiveShadow={castShadow}>
      <boxGeometry args={[w, 0.04, d]} />
      <meshStandardMaterial color="#5d4037" roughness={0.92} {...ghostProps(isGhost)} />
    </mesh>
    {[[-0.2, -0.15], [0.15, 0.1], [0, -0.2], [0.25, 0.2]].map(([fx, fz], i) => (
      <mesh key={`fl-${i}`} position={[fx, 0.12, fz]} castShadow={castShadow}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#ec407a' : '#ffee58'} roughness={0.8} {...ghostProps(isGhost)} />
      </mesh>
    ))}
  </group>
);

const PG = {
  frame: '#33691e',
  frameLight: '#558b2f',
  slide: '#2e7d32',
  slideEdge: '#1b5e20',
  tube: '#1565c0',
  tubeRim: '#0d47a1',
  deck: '#eceff1',
  rail: '#cfd8dc',
  step: '#8d6e63',
};

const SlideChute = ({
  top, bottom, width = 0.42, side = 0, isGhost, castShadow, color = PG.slide,
}) => {
  const dx = bottom[0] - top[0];
  const dy = bottom[1] - top[1];
  const dz = bottom[2] - top[2];
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const horiz = Math.sqrt(dx * dx + dz * dz);
  const yaw = Math.atan2(dx, dz);
  const pitch = Math.atan2(top[1] - bottom[1], horiz);
  const mid = [
    (top[0] + bottom[0]) / 2,
    (top[1] + bottom[1]) / 2,
    (top[2] + bottom[2]) / 2,
  ];
  return (
    <group position={mid}>
      <group rotation={[0, yaw, 0]}>
        <group rotation={[pitch, 0, 0]}>
          <mesh castShadow={castShadow} receiveShadow={castShadow}>
            <boxGeometry args={[width, 0.05, len]} />
            <meshStandardMaterial color={color} roughness={0.55} metalness={0.08} {...ghostProps(isGhost)} />
          </mesh>
          {[-1, 1].map((sign) => (
            <mesh key={`rail-${side}-${sign}`} position={[sign * (width * 0.5 + 0.03), 0.08, 0]} castShadow={castShadow}>
              <boxGeometry args={[0.04, 0.12, len * 0.98]} />
              <meshStandardMaterial color={PG.slideEdge} roughness={0.65} {...ghostProps(isGhost)} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

const TubeSlideSegment = ({ pos, rot, len, isGhost, castShadow }) => (
  <mesh position={pos} rotation={rot} castShadow={castShadow}>
    <cylinderGeometry args={[0.26, 0.28, len, 14, 1, true]} />
    <meshStandardMaterial
      color={PG.tube}
      roughness={0.35}
      metalness={0.12}
      side={2}
      {...ghostProps(isGhost, 0.94)}
    />
  </mesh>
);

/** 複合遊具：2階タワー、双子滑り台、チューブ滑り台、階段、クライミング */
const Playground = ({ x, z, isGhost, castShadow }) => {
  const towerX = 0.35;
  const towerZ = -0.15;
  const deckY = 0.92;
  const towerHalf = 0.72;

  return (
    <group position={[x, FLOOR_Y, z]}>
      <mesh position={[0, 0.02, 0]} receiveShadow={castShadow} userData={WALK}>
        <boxGeometry args={[3.6, 0.04, 3.1]} />
        <meshStandardMaterial color="#5d4037" roughness={0.96} {...ghostProps(isGhost)} />
      </mesh>

      {/* 下段デッキ＋階段 */}
      <group position={[towerX, 0, towerZ]}>
        {[[-0.55, -0.45], [0.55, -0.45], [-0.55, 0.45], [0.55, 0.45]].map(([px, pz], i) => (
          <mesh key={`low-post-${i}`} position={[px, 0.22, pz]} castShadow={castShadow}>
            <cylinderGeometry args={[0.05, 0.055, 0.44, 10]} />
            <meshStandardMaterial color={PG.frame} roughness={0.7} {...ghostProps(isGhost)} />
          </mesh>
        ))}
        <mesh position={[0, 0.44, 0]} castShadow={castShadow} userData={WALK}>
          <boxGeometry args={[1.35, 0.07, 1.15]} />
          <meshStandardMaterial color={PG.deck} metalness={0.2} roughness={0.45} {...ghostProps(isGhost)} />
        </mesh>
        {Array.from({ length: 4 }, (_, i) => (
          <mesh key={`stair-${i}`} position={[0.72, 0.08 + i * 0.1, 0.55 - i * 0.12]} castShadow={castShadow}>
            <boxGeometry args={[0.38, 0.04, 0.22]} />
            <meshStandardMaterial color={PG.step} roughness={0.85} {...ghostProps(isGhost)} />
          </mesh>
        ))}
      </group>

      {/* 上段タワー */}
      <group position={[towerX, 0, towerZ]}>
        {[[-towerHalf, -towerHalf], [towerHalf, -towerHalf], [-towerHalf, towerHalf], [towerHalf, towerHalf]].map(([px, pz], i) => (
          <mesh key={`tower-post-${i}`} position={[px, deckY * 0.5, pz]} castShadow={castShadow}>
            <cylinderGeometry args={[0.055, 0.06, deckY, 10]} />
            <meshStandardMaterial color={PG.frame} roughness={0.68} {...ghostProps(isGhost)} />
          </mesh>
        ))}
        <mesh position={[0, deckY, 0]} castShadow={castShadow} userData={WALK}>
          <boxGeometry args={[1.65, 0.08, 1.45]} />
          <meshStandardMaterial color={PG.deck} metalness={0.22} roughness={0.42} {...ghostProps(isGhost)} />
        </mesh>
        {[-0.65, 0.65].map((px) => (
          <mesh key={`guard-${px}`} position={[px, deckY + 0.18, 0]} castShadow={castShadow}>
            <boxGeometry args={[0.04, 0.28, 1.35]} />
            <meshStandardMaterial color={PG.rail} metalness={0.35} roughness={0.4} {...ghostProps(isGhost)} />
          </mesh>
        ))}
        <mesh position={[0, deckY + 0.18, -0.62]} castShadow={castShadow}>
          <boxGeometry args={[1.4, 0.28, 0.04]} />
          <meshStandardMaterial color={PG.rail} metalness={0.35} roughness={0.4} {...ghostProps(isGhost)} />
        </mesh>
        {/* 屋根フレーム */}
        <mesh position={[0, deckY + 0.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow={castShadow}>
          <boxGeometry args={[2.1, 0.06, 2.1]} />
          <meshStandardMaterial color={PG.frameLight} roughness={0.72} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[0, deckY + 0.72, 0]} castShadow={castShadow}>
          <boxGeometry args={[0.08, 0.38, 1.55]} />
          <meshStandardMaterial color={PG.frameLight} roughness={0.72} {...ghostProps(isGhost)} />
        </mesh>
        {/* はしご */}
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={`ladder-${i}`} position={[-0.62, 0.28 + i * 0.14, 0.45]} castShadow={castShadow}>
            <boxGeometry args={[0.32, 0.03, 0.05]} />
            <meshStandardMaterial color={PG.rail} metalness={0.4} {...ghostProps(isGhost)} />
          </mesh>
        ))}
        <mesh position={[-0.62, 0.5, 0.48]} castShadow={castShadow}>
          <boxGeometry args={[0.04, 0.95, 0.04]} />
          <meshStandardMaterial color={PG.frame} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[-0.48, 0.5, 0.48]} castShadow={castShadow}>
          <boxGeometry args={[0.04, 0.95, 0.04]} />
          <meshStandardMaterial color={PG.frame} {...ghostProps(isGhost)} />
        </mesh>
      </group>

      {/* クライミングアーチ */}
      <group position={[towerX - 0.95, 0.35, towerZ + 0.55]}>
        <mesh rotation={[0, 0, 0.55]} castShadow={castShadow}>
          <cylinderGeometry args={[0.035, 0.035, 1.15, 8]} />
          <meshStandardMaterial color={PG.frameLight} {...ghostProps(isGhost)} />
        </mesh>
        <mesh rotation={[0, 0, -0.55]} castShadow={castShadow}>
          <cylinderGeometry args={[0.035, 0.035, 1.15, 8]} />
          <meshStandardMaterial color={PG.frameLight} {...ghostProps(isGhost)} />
        </mesh>
        {[-0.3, 0, 0.3].map((oy, i) => (
          <mesh key={`climb-${i}`} position={[0, oy, 0]} castShadow={castShadow}>
            <cylinderGeometry args={[0.025, 0.025, 0.75, 8]} />
            <meshStandardMaterial color={PG.rail} metalness={0.45} {...ghostProps(isGhost)} />
          </mesh>
        ))}
      </group>

      {/* 双子滑り台：タワー南面 → ウッドチップ南西へ */}
      <SlideChute
        top={[towerX - 0.3, deckY + 0.03, towerZ + 0.62]}
        bottom={[-1.05, 0.14, 1.05]}
        side={0}
        isGhost={isGhost}
        castShadow={castShadow}
      />
      <SlideChute
        top={[towerX + 0.3, deckY + 0.03, towerZ + 0.62]}
        bottom={[-0.55, 0.14, 1.28]}
        width={0.38}
        side={1}
        isGhost={isGhost}
        castShadow={castShadow}
      />

      {/* チューブ滑り台：タワー東面 → 南東へ螺旋 */}
      <TubeSlideSegment pos={[towerX + 0.72, deckY - 0.02, towerZ + 0.35]} rot={[0.25, 0.55, 0]} len={0.5} isGhost={isGhost} castShadow={castShadow} />
      <TubeSlideSegment pos={[towerX + 1.0, deckY - 0.22, towerZ + 0.62]} rot={[0.72, 0.85, 0.1]} len={0.48} isGhost={isGhost} castShadow={castShadow} />
      <TubeSlideSegment pos={[towerX + 1.08, deckY - 0.48, towerZ + 0.92]} rot={[1.05, 1.05, 0.08]} len={0.46} isGhost={isGhost} castShadow={castShadow} />
      <TubeSlideSegment pos={[towerX + 0.92, deckY - 0.7, towerZ + 1.15]} rot={[1.35, 0.95, 0]} len={0.42} isGhost={isGhost} castShadow={castShadow} />
      <mesh position={[towerX + 0.82, 0.18, towerZ + 1.28]} rotation={[1.48, 0.75, 0]} castShadow={castShadow}>
        <cylinderGeometry args={[0.3, 0.34, 0.32, 14]} />
        <meshStandardMaterial color={PG.tubeRim} roughness={0.4} {...ghostProps(isGhost)} />
      </mesh>
    </group>
  );
};

const ParkSign = ({ x, z, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 0.55, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.08, 1.1, 0.08]} />
      <meshStandardMaterial color="#5d4037" roughness={0.88} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 1.15, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.9, 0.55, 0.06]} />
      <meshStandardMaterial color="#2e7d32" roughness={0.75} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const LightPole = ({ x, z, isGhost, castShadow, lampIntensity }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 0.9, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.07, 1.8, 0.07]} />
      <meshStandardMaterial color="#37474f" metalness={0.4} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.1, 1.85, 0]}>
      <boxGeometry args={[0.3, 0.08, 0.1]} />
      <meshStandardMaterial
        color="#fff9c4"
        emissive="#fff59d"
        emissiveIntensity={lampIntensity}
        {...ghostProps(isGhost, 0.95)}
      />
    </mesh>
  </group>
);

/**
 * 公園・緑：芝生広場、遊具、桜の大木、花壇、ベンチ
 */
export const renderParkLayout = ({
  isGhost, meshPosition, meshRotation, handlers, castShadow, isBuilding, nightFactor,
}) => {
  const lampIntensity = isGhost ? 0.3 : (0.4 + nightFactor * 0.6);

  return (
    <group position={meshPosition} rotation={meshRotation} {...interactionProps(handlers)}>
      {buildEndEntryMeshes(-4.8, isGhost, castShadow)}
      {buildEndEntryMeshes(4.8, isGhost, castShadow)}

      <WalkFloor args={[10, 0.06, 9]} position={[0, FLOOR_Y, 0]} isGhost={isGhost} castShadow={castShadow} color="#9ccc65" />
      <WalkFloor args={[2.2, 0.05, 8]} position={[-3.8, FLOOR_Y + 0.01, 0]} isGhost={isGhost} castShadow={castShadow} color="#c5e1a5" />
      <WalkFloor args={[8, 0.05, 1.2]} position={[0.5, FLOOR_Y + 0.01, -3.2]} isGhost={isGhost} castShadow={castShadow} color="#d7ccc8" />

      <Playground x={-2.8} z={0.2} isGhost={isGhost} castShadow={castShadow} />

      <ParkTree x={2.8} z={1.2} scale={1.35} sakura isGhost={isGhost} castShadow={castShadow} />
      <ParkTree x={-1.2} z={3} scale={0.9} isGhost={isGhost} castShadow={castShadow} />
      <ParkTree x={3.5} z={-2.5} scale={0.85} isGhost={isGhost} castShadow={castShadow} />
      <ParkTree x={-3.8} z={-2.8} scale={0.75} isGhost={isGhost} castShadow={castShadow} />

      <PicnicTable x={2.2} z={0.8} isGhost={isGhost} castShadow={castShadow} />
      <Bench x={1.4} z={-2.2} rot={0.3} isGhost={isGhost} castShadow={castShadow} />
      <Bench x={-0.5} z={2.5} rot={-0.5} isGhost={isGhost} castShadow={castShadow} />

      <FlowerBed x={3.2} z={2.8} w={1.6} d={1.2} isGhost={isGhost} castShadow={castShadow} />
      <FlowerBed x={2.5} z={-1} w={1.3} d={1} isGhost={isGhost} castShadow={castShadow} />

      <ParkSign x={0} z={-3.8} isGhost={isGhost} castShadow={castShadow} />
      <LightPole x={-2.5} z={2.2} isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity} />
      <LightPole x={3.8} z={-2.8} isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity * 0.7} />

      {!isGhost && !isBuilding && (
        <pointLight position={[2.5, 2.5, 1]} distance={7} intensity={0.12 + nightFactor * 0.3} color="#fff9c4" />
      )}
    </group>
  );
};

export const PARK_SHAPE_IDS = ['park_layout'];

export const isParkShape = (shape) => PARK_SHAPE_IDS.includes(shape);

export const getParkMeshPosition = (shape) => (
  PARK_SHAPE_IDS.includes(shape) ? [0, -0.24, 0] : [0, 0, 0]
);

export const getParkWalkColliders = (shape, sx, sy, sz) => {
  if (shape === 'park_layout') {
    return (
      <>
        {buildEndEntryColliders(-4.8, sx, sy, sz)}
        {buildEndEntryColliders(4.8, sx, sy, sz)}
        <CuboidCollider args={[4.8 * sx, 0.04, 4.2 * sz]} position={[0, colliderY(FLOOR_Y) * sy, 0]} />
        <CuboidCollider args={[1.05 * sx, 0.04, 3.8 * sz]} position={[-3.8 * sx, colliderY(FLOOR_Y) * sy, 0]} />
        <CuboidCollider args={[3.8 * sx, 0.04, 0.55 * sz]} position={[0.5 * sx, colliderY(FLOOR_Y) * sy, -3.2 * sz]} />
        <CuboidCollider args={[1.7 * sx, 0.04, 1.45 * sz]} position={[-2.8 * sx, colliderY(FLOOR_Y) * sy, 0.2 * sz]} />
      </>
    );
  }
  return null;
};

export const getParkCollider = (shape, sx, sy, sz) => getParkWalkColliders(shape, sx, sy, sz);
