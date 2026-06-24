import React from 'react';
import { CuboidCollider } from '@react-three/rapier';

const WALK = { stationWalk: true };
const MESH_Y_OFFSET = -0.24;
const FLOOR_Y = 0.1;
/** 岸芝生より少し低く、くぼみの中で見える高さ */
const WATER_SURFACE_Y = 0.092;
const WATER_DEPTH = 0.16;
const GRASS_Y = FLOOR_Y + 0.012;
const colliderY = (localY) => localY + MESH_Y_OFFSET;

const ghostProps = (isGhost, opacity = 1) => ({
  transparent: isGhost,
  opacity: isGhost ? opacity : opacity,
});

const interactionProps = (handlers) => ({
  onPointerMove: handlers.onPointerMove,
  onPointerOut: handlers.onPointerOut,
  onClick: handlers.onClick,
  onDoubleClick: handlers.onDoubleClick,
});

const WalkFloor = ({ args, position, isGhost, castShadow, color = '#9ccc65' }) => (
  <mesh position={position} receiveShadow={castShadow} userData={WALK}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.88} {...ghostProps(isGhost)} />
  </mesh>
);

/** くぼ地の水（renderOrder で岸より手前に描画） */
const WaterBody = ({ pos, args, isGhost, castShadow, isPond = false }) => {
  const [w, , d] = args;
  const surfaceOpacity = isGhost ? 0.55 : 0.92;
  return (
    <group position={pos}>
      <mesh position={[0, -WATER_DEPTH * 0.55, 0]} receiveShadow={castShadow}>
        <boxGeometry args={[w * 0.96, WATER_DEPTH, d * 0.96]} />
        <meshStandardMaterial color="#01579b" roughness={0.95} {...ghostProps(isGhost, 0.95)} />
      </mesh>
      <mesh position={[0, -WATER_DEPTH * 0.2, 0]} receiveShadow={castShadow}>
        <boxGeometry args={[w * 0.94, WATER_DEPTH * 0.5, d * 0.94]} />
        <meshStandardMaterial
          color="#0288d1"
          transparent
          opacity={isGhost ? 0.4 : 0.78}
          roughness={0.12}
          metalness={0.08}
        />
      </mesh>
      <mesh position={[0, 0.018, 0]} receiveShadow={castShadow} renderOrder={8}>
        <boxGeometry args={[w * 0.99, 0.032, d * 0.99]} />
        <meshStandardMaterial
          color={isPond ? '#29b6f6' : '#4fc3f7'}
          emissive="#81d4fa"
          emissiveIntensity={isGhost ? 0.12 : 0.35}
          roughness={0.04}
          metalness={0.4}
          transparent
          opacity={surfaceOpacity}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

/** 水盤の下だけの土台（全面芝生は敷かない） */
const EARTH_BASE = { pos: [0, FLOOR_Y - 0.045, 0], args: [10, 0.04, 9] };

/**
 * 岸の芝生だけ（池・川の上には重ねない。隣接板は 0.08m 重ねて隙間を防ぐ）
 * WATER_SPECS の外側だけ（水面上に芝生を載せない）
 */
const GRASS_BANKS = [
  { pos: [-3.02, GRASS_Y, 0], args: [3.35, 0.052, 9.12] },
  { pos: [3.42, GRASS_Y, 3.02], args: [2.85, 0.052, 2.92] },
  { pos: [3.42, GRASS_Y, -2.68], args: [2.85, 0.052, 3.38] },
  { pos: [0, GRASS_Y, -4.08], args: [9.6, 0.052, 1.58] },
  { pos: [-2.35, GRASS_Y, 4.18], args: [2.15, 0.052, 1.48] },
  { pos: [3.12, GRASS_Y, 4.18], args: [2.45, 0.052, 1.48] },
  { pos: [-3.55, GRASS_Y, -3.55], args: [1.05, 0.052, 1.0] },
  { pos: [-1.55, GRASS_Y, 2.05], args: [0.95, 0.052, 1.45] },
  { pos: [2.38, GRASS_Y, 0.15], args: [1.45, 0.052, 1.0] },
];

const buildEndEntryMeshes = (zStart, isGhost, castShadow) => (
  Array.from({ length: 3 }, (_, i) => (
    <mesh
      key={`wf-entry-${zStart}-${i}`}
      position={[0, 0.03 + 0.05 * (i + 0.5), zStart + (zStart < 0 ? 0.28 * i : -0.28 * i)]}
      receiveShadow={castShadow}
      userData={WALK}
    >
      <boxGeometry args={[2, 0.05, 0.28]} />
      <meshStandardMaterial color="#bdbdbd" roughness={0.82} {...ghostProps(isGhost)} />
    </mesh>
  ))
);

const buildEndEntryColliders = (zStart, sx, sy, sz) => (
  Array.from({ length: 3 }, (_, i) => (
    <CuboidCollider
      key={`wf-entry-col-${zStart}-${i}`}
      args={[0.95 * sx, 0.025, 0.12 * sz]}
      position={[
        0,
        colliderY(0.03 + 0.05 * (i + 0.5)) * sy,
        (zStart + (zStart < 0 ? 0.28 * i : -0.28 * i)) * sz,
      ]}
    />
  ))
);

/**
 * 水盤の単一ソース（護岸石もここから自動生成）
 * cx/cz=中心, w/d=幅/奥行き（X/Z）
 */
const WATER_SPECS = [
  { id: 'pond', cx: 1.15, cz: 2.75, w: 4.75, d: 3.35, pond: true },
  { id: 'river', cx: 0.35, cz: -0.45, w: 1.5, d: 4.95 },
  { id: 'branchEw', cx: -2.1, cz: -3.05, w: 3.2, d: 1.5 },
  { id: 'branchNs', cx: -3.35, cz: -1.6, w: 1.3, d: 2.75 },
];

const SHORE_INSET = 0.11;
const SHORE_THICK = 0.2;
const SHORE_HEIGHT = 0.1;
const SHORE_Y = FLOOR_Y + 0.055;
const BRIDGE_Z = -0.5;
const BRIDGE_GAP_HALF = 0.85;

const toWaterSegments = (specs) => specs.map((s) => ({
  pos: [s.cx, WATER_SURFACE_Y, s.cz],
  args: [s.w, 0.12, s.d],
  pond: s.pond,
}));

const bounds = (s) => ({
  l: s.cx - s.w / 2,
  r: s.cx + s.w / 2,
  b: s.cz - s.d / 2,
  t: s.cz + s.d / 2,
});

const overlaps1D = (a0, a1, b0, b1, min = 0.2) => Math.min(a1, b1) - Math.max(a0, b0) > min;

const subtractSpan = (spans, cutStart, cutEnd) => {
  const out = [];
  spans.forEach(([a, b]) => {
    if (cutEnd <= a || cutStart >= b) out.push([a, b]);
    else {
      if (cutStart > a) out.push([a, cutStart]);
      if (cutEnd < b) out.push([cutEnd, b]);
    }
  });
  return out.filter(([a, b]) => b - a > 0.12);
};

const carveGap = (spans, gapCenter, gapHalf) => {
  if (gapCenter == null) return spans;
  return subtractSpan(spans, gapCenter - gapHalf, gapCenter + gapHalf);
};

/** 各辺で隣接水盤と重なる区間を除き、外側だけの護岸区間を求める */
const getExposedSpans = (spec, specs, side) => {
  const me = bounds(spec);
  let spans = side === 'north' || side === 'south'
    ? [[me.l, me.r]]
    : [[me.b, me.t]];

  specs.forEach((other) => {
    if (other.id === spec.id) return;
    const o = bounds(other);
    if (side === 'north' && overlaps1D(me.l, me.r, o.l, o.r) && o.b <= me.t && o.t >= me.t - 0.45) {
      spans = subtractSpan(spans, Math.max(me.l, o.l), Math.min(me.r, o.r));
    }
    if (side === 'south' && overlaps1D(me.l, me.r, o.l, o.r) && o.t >= me.b && o.b <= me.b + 0.45) {
      spans = subtractSpan(spans, Math.max(me.l, o.l), Math.min(me.r, o.r));
    }
    if (side === 'east' && overlaps1D(me.b, me.t, o.b, o.t) && o.l <= me.r && o.r >= me.r - 0.45) {
      spans = subtractSpan(spans, Math.max(me.b, o.b), Math.min(me.t, o.t));
    }
    if (side === 'west' && overlaps1D(me.b, me.t, o.b, o.t) && o.r >= me.l && o.l <= me.l + 0.45) {
      spans = subtractSpan(spans, Math.max(me.b, o.b), Math.min(me.t, o.t));
    }
  });

  if (side === 'east' || side === 'west') {
    spans = carveGap(spans, spec.id === 'river' ? BRIDGE_Z : null, BRIDGE_GAP_HALF);
  }
  return spans;
};

const pushShoreStones = (stones, specId, side, spans, fixedCoord, horizontal) => {
  spans.forEach(([a, b], i) => {
    const len = b - a;
    stones.push({
      key: `${specId}-${side}-${i}`,
      pos: horizontal
        ? [(a + b) / 2, SHORE_Y, fixedCoord]
        : [fixedCoord, SHORE_Y, (a + b) / 2],
      args: horizontal
        ? [len + SHORE_THICK, SHORE_HEIGHT, SHORE_THICK]
        : [SHORE_THICK, SHORE_HEIGHT, len + SHORE_THICK],
    });
  });
};

/** 水盤の外周だけに護岸石を配置 */
const buildShorelineFromWater = (specs) => {
  const stones = [];
  specs.forEach((spec) => {
    const me = bounds(spec);
    pushShoreStones(stones, spec.id, 'n', getExposedSpans(spec, specs, 'north'), me.t + SHORE_INSET, true);
    pushShoreStones(stones, spec.id, 's', getExposedSpans(spec, specs, 'south'), me.b - SHORE_INSET, true);
    pushShoreStones(stones, spec.id, 'e', getExposedSpans(spec, specs, 'east'), me.r + SHORE_INSET, false);
    pushShoreStones(stones, spec.id, 'w', getExposedSpans(spec, specs, 'west'), me.l - SHORE_INSET, false);
  });
  return stones;
};

const WATER_SEGMENTS = toWaterSegments(WATER_SPECS);
const SHORELINE = buildShorelineFromWater(WATER_SPECS);

const ReedCluster = ({ x, z, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y + 0.02, z]}>
    {[-0.12, 0, 0.14].map((ox, i) => (
      <mesh key={`reed-${i}`} position={[ox, 0.25, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.03, 0.5, 0.03]} />
        <meshStandardMaterial color="#558b2f" roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>
    ))}
  </group>
);

const BankTree = ({ x, z, willow = false, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 0.45, 0]} castShadow={castShadow}>
      <cylinderGeometry args={[willow ? 0.1 : 0.12, 0.15, 0.9, 8]} />
      <meshStandardMaterial color="#5d4037" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    {willow ? (
      <>
        <mesh position={[0, 1.1, 0.15]} castShadow={castShadow}>
          <sphereGeometry args={[0.55, 12, 10]} />
          <meshStandardMaterial color="#7cb342" roughness={0.82} {...ghostProps(isGhost, 0.9)} />
        </mesh>
        {[-0.35, 0.2, 0.4].map((ox, i) => (
          <mesh key={`willow-${i}`} position={[ox, 0.7, 0.2 + i * 0.1]} castShadow={castShadow}>
            <boxGeometry args={[0.04, 0.6, 0.04]} />
            <meshStandardMaterial color="#689f38" roughness={0.85} {...ghostProps(isGhost, 0.85)} />
          </mesh>
        ))}
      </>
    ) : (
      <mesh position={[0, 1.2, 0]} castShadow={castShadow}>
        <sphereGeometry args={[0.6, 12, 10]} />
        <meshStandardMaterial color="#66bb6a" roughness={0.82} {...ghostProps(isGhost)} />
      </mesh>
    )}
  </group>
);

/** 本川（Z方向）を東西に渡る橋 */
const WoodenBridge = ({ x, z, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y + 0.08, z]}>
    <mesh position={[0, 0.06, 0]} receiveShadow={castShadow} userData={WALK}>
      <boxGeometry args={[2.5, 0.1, 1.35]} />
      <meshStandardMaterial color="#8d6e63" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    {[-0.58, 0.58].map((bz) => (
      <mesh key={`rail-${bz}`} position={[0, 0.22, bz]} castShadow={castShadow}>
        <boxGeometry args={[2.4, 0.22, 0.06]} />
        <meshStandardMaterial color="#6d4c41" roughness={0.88} {...ghostProps(isGhost)} />
      </mesh>
    ))}
    {[-0.95, -0.35, 0.25, 0.95].map((bx) => (
      <mesh key={`plank-${bx}`} position={[bx, 0.02, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.1, 0.06, 1.15]} />
        <meshStandardMaterial color="#795548" roughness={0.9} {...ghostProps(isGhost)} />
      </mesh>
    ))}
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

const DockDeck = ({ x, z, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y + 0.02, z]}>
    <mesh receiveShadow={castShadow} userData={WALK}>
      <boxGeometry args={[1.8, 0.06, 1.2]} />
      <meshStandardMaterial color="#a1887f" roughness={0.82} {...ghostProps(isGhost)} />
    </mesh>
    {[-0.7, 0.7].map((pz) => (
      <mesh key={`dock-post-${pz}`} position={[0, -0.08, pz]} castShadow={castShadow}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="#5d4037" {...ghostProps(isGhost)} />
      </mesh>
    ))}
  </group>
);

/**
 * 水辺：池と曲がった川、護岸石、木製橋、葦、遊歩道
 */
export const renderWaterfrontLayout = ({
  isGhost, meshPosition, meshRotation, handlers, castShadow, isBuilding, nightFactor,
}) => (
  <group position={meshPosition} rotation={meshRotation} {...interactionProps(handlers)}>
    {buildEndEntryMeshes(-4.5, isGhost, castShadow)}
    {buildEndEntryMeshes(4.5, isGhost, castShadow)}

    <WalkFloor
      args={EARTH_BASE.args}
      position={EARTH_BASE.pos}
      isGhost={isGhost}
      castShadow={castShadow}
      color="#4e6b3a"
    />
    {GRASS_BANKS.map((grass, i) => (
      <WalkFloor
        key={`grass-bank-${i}`}
        args={grass.args}
        position={grass.pos}
        isGhost={isGhost}
        castShadow={castShadow}
        color="#8bc34a"
      />
    ))}
    <WalkFloor args={[2.2, 0.05, 7]} position={[-3.8, GRASS_Y + 0.003, 0.5]} isGhost={isGhost} castShadow={castShadow} color="#d7ccc8" />
    <WalkFloor args={[2, 0.05, 2.5]} position={[3.5, GRASS_Y + 0.003, -2]} isGhost={isGhost} castShadow={castShadow} color="#bcaaa4" />

    {WATER_SEGMENTS.map((seg, i) => (
      <WaterBody
        key={`water-${i}`}
        pos={seg.pos}
        args={seg.args}
        isGhost={isGhost}
        castShadow={castShadow}
        isPond={seg.pond}
      />
    ))}

    {SHORELINE.map((edge) => (
      <mesh key={edge.key} position={edge.pos} receiveShadow={castShadow} castShadow={castShadow}>
        <boxGeometry args={edge.args} />
        <meshStandardMaterial color="#bdbdbd" roughness={0.88} metalness={0.05} {...ghostProps(isGhost)} />
      </mesh>
    ))}

    <WoodenBridge x={0.35} z={-0.5} isGhost={isGhost} castShadow={castShadow} />
    <DockDeck x={2.8} z={3.8} isGhost={isGhost} castShadow={castShadow} />

    <BankTree x={-3.5} z={2.5} willow isGhost={isGhost} castShadow={castShadow} />
    <BankTree x={3.8} z={0.5} isGhost={isGhost} castShadow={castShadow} />
    <BankTree x={-3.2} z={-3.5} isGhost={isGhost} castShadow={castShadow} />
    <BankTree x={3.5} z={-3.2} isGhost={isGhost} castShadow={castShadow} />

    <ReedCluster x={-1.2} z={1.8} isGhost={isGhost} castShadow={castShadow} />
    <ReedCluster x={2.5} z={1.2} isGhost={isGhost} castShadow={castShadow} />
    <ReedCluster x={-3} z={-2.2} isGhost={isGhost} castShadow={castShadow} />
    <ReedCluster x={0.2} z={-3.8} isGhost={isGhost} castShadow={castShadow} />

    <Bench x={-3.5} z={0} rot={0.4} isGhost={isGhost} castShadow={castShadow} />
    <Bench x={3.2} z={-1.5} rot={-0.3} isGhost={isGhost} castShadow={castShadow} />

    {!isGhost && !isBuilding && (
      <>
        <pointLight position={[1, 1.5, 2.5]} distance={6} intensity={0.08 + nightFactor * 0.2} color="#b3e5fc" />
        <pointLight position={[-2, 1.2, -1]} distance={5} intensity={0.06 + nightFactor * 0.15} color="#e1f5fe" />
      </>
    )}
  </group>
);

export const WATERFRONT_SHAPE_IDS = ['waterfront_layout'];

export const isWaterfrontShape = (shape) => WATERFRONT_SHAPE_IDS.includes(shape);

export const getWaterfrontMeshPosition = (shape) => (
  WATERFRONT_SHAPE_IDS.includes(shape) ? [0, -0.24, 0] : [0, 0, 0]
);

export const getWaterfrontWalkColliders = (shape, sx, sy, sz) => {
  if (shape === 'waterfront_layout') {
    return (
      <>
        {buildEndEntryColliders(-4.5, sx, sy, sz)}
        {buildEndEntryColliders(4.5, sx, sy, sz)}
        {GRASS_BANKS.map((grass, i) => (
          <CuboidCollider
            key={`wf-grass-col-${i}`}
            args={[(grass.args[0] * 0.5) * sx, 0.04 * sy, (grass.args[2] * 0.5) * sz]}
            position={[grass.pos[0] * sx, colliderY(FLOOR_Y) * sy, grass.pos[2] * sz]}
          />
        ))}
        <CuboidCollider args={[1.05 * sx, 0.04, 3.4 * sz]} position={[-3.8 * sx, colliderY(FLOOR_Y) * sy, 0.5 * sz]} />
        <CuboidCollider args={[1.2 * sx, 0.04, 0.65 * sz]} position={[0.35 * sx, colliderY(FLOOR_Y + 0.08) * sy, -0.5 * sz]} />
        <CuboidCollider args={[0.85 * sx, 0.04, 0.55 * sz]} position={[2.8 * sx, colliderY(FLOOR_Y) * sy, 3.8 * sz]} />
      </>
    );
  }
  return null;
};

export const getWaterfrontCollider = (shape, sx, sy, sz) => getWaterfrontWalkColliders(shape, sx, sy, sz);
