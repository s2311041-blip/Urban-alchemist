import React from 'react';
import { CuboidCollider } from '@react-three/rapier';
import { PALETTE } from '../../../constants/artDirection';
import { resolvePlaceNeedStyle } from '../../../utils/placeNeedTypeStyle';

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

const WalkFloor = ({ args, position, isGhost, castShadow, color = PALETTE.road }) => (
  <mesh position={position} receiveShadow={castShadow} userData={WALK}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.78} {...ghostProps(isGhost)} />
  </mesh>
);

const RoadSurface = ({ args, position, isGhost, castShadow, color = PALETTE.roadDark }) => (
  <mesh position={position} receiveShadow={castShadow}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} roughness={0.92} metalness={0} flatShading {...ghostProps(isGhost)} />
  </mesh>
);

const WallCollider = ({ args, position }) => (
  <CuboidCollider args={args} position={position} />
);

/** 主軸 X（東西）。車道は Z±ROAD_HALF_Z、歩道は縁に密着 */
const MAIN_LEN = 14;
const ROAD_HALF_Z = 1;
const SIDEWALK_HALF_W = 0.5;
const NORTH_SW_Z = -(ROAD_HALF_Z + SIDEWALK_HALF_W);
const SOUTH_SW_Z = ROAD_HALF_Z + SIDEWALK_HALF_W;
const SIDEWALK_W = SIDEWALK_HALF_W * 2;
const NORTH_BUILDING_Z = NORTH_SW_Z - 1.45;
const SOUTH_BUILDING_Z = SOUTH_SW_Z + 1.45;
const CROSSWALK_HALF_X = 1.35;
const BRANCH_LEN = 5.5;
const BRANCH_SIDEWALK_X = ROAD_HALF_Z + SIDEWALK_HALF_W;
const CROSSWALK_X = -2.8;
const INTERSECTION_HALF = 1.15;
const CROSSWALK_STRIPE_W = 0.14;
const CROSSWALK_PITCH = 0.42;
const CROSSWALK_STRIPE_COUNT = 7;
const CROSSWALK_START_Z = -((CROSSWALK_STRIPE_COUNT - 1) * CROSSWALK_PITCH) / 2;

const NORTH_BUILDINGS = [
  { x: -5.8, h: 2.4, w: 1.8, mat: 'brick' },
  { x: -2.2, h: 2.8, w: 2, mat: 'glass' },
  { x: 2.2, h: 2.5, w: 1.9, mat: 'brick' },
  { x: 5.8, h: 2.3, w: 1.8, mat: 'brick' },
];

const SOUTH_BUILDINGS = [
  { x: -5.8, h: 2.2, w: 1.8, mat: 'brick' },
  { x: 2.5, h: 2.6, w: 2, mat: 'glass' },
  { x: 5.8, h: 2.2, w: 1.8, mat: 'brick' },
];

const buildEndEntryMeshes = (xStart, z, isGhost, castShadow) => (
  Array.from({ length: 3 }, (_, i) => (
    <mesh
      key={`road-entry-${xStart}-${z}-${i}`}
      position={[xStart + (xStart < 0 ? 0.28 * i : -0.28 * i), 0.03 + 0.05 * (i + 0.5), z]}
      receiveShadow={castShadow}
      userData={WALK}
    >
      <boxGeometry args={[0.28, 0.05, 1.2]} />
      <meshStandardMaterial color="#bdbdbd" roughness={0.82} {...ghostProps(isGhost)} />
    </mesh>
  ))
);

const buildEndEntryColliders = (xStart, z, sx, sy, sz) => (
  Array.from({ length: 3 }, (_, i) => (
    <CuboidCollider
      key={`road-entry-col-${xStart}-${z}-${i}`}
      args={[0.12 * sx, 0.025, 0.58 * sz]}
      position={[
        (xStart + (xStart < 0 ? 0.28 * i : -0.28 * i)) * sx,
        colliderY(0.03 + 0.05 * (i + 0.5)) * sy,
        z * sz,
      ]}
    />
  ))
);

const BuildingFacade = ({ x, z, h, w, material, isGhost, castShadow }) => {
  const color = material === 'glass' ? '#b3e5fc' : '#a1887f';
  const opacity = material === 'glass' ? (isGhost ? 0.25 : 0.4) : 1;
  return (
    <group position={[x, FLOOR_Y, z]}>
      <mesh position={[0, h * 0.5, 0]} castShadow={castShadow}>
        <boxGeometry args={[w, h, 0.85]} />
        <meshStandardMaterial
          color={color}
          transparent={material === 'glass'}
          opacity={opacity}
          metalness={material === 'glass' ? 0.7 : 0.05}
          roughness={material === 'glass' ? 0.15 : 0.85}
          {...(material === 'glass' ? {} : ghostProps(isGhost))}
        />
      </mesh>
      <mesh position={[0, h + 0.04, 0]} castShadow={castShadow}>
        <boxGeometry args={[w + 0.08, 0.08, 0.88]} />
        <meshStandardMaterial color="#eceff1" {...ghostProps(isGhost, 0.9)} />
      </mesh>
    </group>
  );
};

/** 車線中央の破線（横断歩道区間は描画しない） */
const LaneCenterDashes = ({ z, crosswalkX, isGhost }) => (
  Array.from({ length: 9 }, (_, i) => {
    const x = -5.6 + i * 1.4;
    if (Math.abs(x - crosswalkX) < CROSSWALK_HALF_X + 0.35) return null;
    return (
      <mesh key={`lane-dash-${z}-${i}`} position={[x, ROAD_Y + 0.035, z]}>
        <boxGeometry args={[0.75, 0.01, 0.06]} />
        <meshStandardMaterial color="#fafafa" {...ghostProps(isGhost, 0.92)} />
      </mesh>
    );
  })
);

/** 車線中央の白実線（横断歩道の前後で分断） */
const LaneCenterSolid = ({ crosswalkX, isGhost }) => {
  const westEnd = crosswalkX - CROSSWALK_HALF_X;
  const eastStart = crosswalkX + CROSSWALK_HALF_X;
  const westCenter = (-MAIN_LEN / 2 + westEnd) / 2;
  const eastCenter = (eastStart + MAIN_LEN / 2) / 2;
  const westLen = westEnd - (-MAIN_LEN / 2);
  const eastLen = MAIN_LEN / 2 - eastStart;
  return (
    <>
      {westLen > 0.4 && (
        <mesh position={[westCenter, ROAD_Y + 0.035, 0]}>
          <boxGeometry args={[westLen, 0.01, 0.05]} />
          <meshStandardMaterial color="#ffffff" {...ghostProps(isGhost, 0.9)} />
        </mesh>
      )}
      {eastLen > 0.4 && (
        <mesh position={[eastCenter, ROAD_Y + 0.035, 0]}>
          <boxGeometry args={[eastLen, 0.01, 0.05]} />
          <meshStandardMaterial color="#ffffff" {...ghostProps(isGhost, 0.9)} />
        </mesh>
      )}
    </>
  );
};

/** 横断歩道（縞は X 方向、縞幅・間隔を広めに） */
const CrosswalkStripes = ({ x, isGhost }) => (
  Array.from({ length: CROSSWALK_STRIPE_COUNT }, (_, i) => (
    <mesh
      key={`crosswalk-${x}-${i}`}
      position={[x, ROAD_Y + 0.04, CROSSWALK_START_Z + i * CROSSWALK_PITCH]}
      userData={WALK}
    >
      <boxGeometry args={[2.5, 0.01, CROSSWALK_STRIPE_W]} />
      <meshStandardMaterial color="#fafafa" emissive="#ffffff" emissiveIntensity={0.18} {...ghostProps(isGhost, 0.96)} />
    </mesh>
  ))
);

const TrafficSignal = ({ position, isGhost, castShadow, lampIntensity, facing = 1 }) => (
  <group position={position}>
    <mesh position={[0, 0.95, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.1, 1.9, 0.1]} />
      <meshStandardMaterial color="#37474f" metalness={0.4} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[facing * 0.12, 1.55, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.14, 0.55, 0.22]} />
      <meshStandardMaterial color="#263238" {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[facing * 0.2, 1.68, 0]}>
      <boxGeometry args={[0.04, 0.1, 0.08]} />
      <meshStandardMaterial color="#f44336" emissive="#ef5350" emissiveIntensity={lampIntensity * 0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[facing * 0.2, 1.55, 0]}>
      <boxGeometry args={[0.04, 0.1, 0.08]} />
      <meshStandardMaterial color="#ffeb3b" emissive="#fdd835" emissiveIntensity={lampIntensity * 0.35} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[facing * 0.2, 1.42, 0]}>
      <boxGeometry args={[0.04, 0.1, 0.08]} />
      <meshStandardMaterial color="#4caf50" emissive="#69f0ae" emissiveIntensity={lampIntensity * 0.55} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const renderMergedAsphalt = ({ isGhost, castShadow, asphaltColor = '#4a4a4a' }) => (
  <>
    {/* 東西本線（交差点部を含む） */}
    <RoadSurface args={[MAIN_LEN, 0.06, ROAD_HALF_Z * 2]} position={[0, ROAD_Y, 0]} isGhost={isGhost} castShadow={castShadow} color={asphaltColor} />
    {/* T字：+Z 支線（交差点 z=INTERSECTION_HALF から合流） */}
    <RoadSurface
      args={[ROAD_HALF_Z * 2, 0.06, BRANCH_LEN + INTERSECTION_HALF]}
      position={[0, ROAD_Y, (INTERSECTION_HALF + BRANCH_LEN + INTERSECTION_HALF) * 0.5]}
      isGhost={isGhost}
      castShadow={castShadow}
      color={asphaltColor}
    />
  </>
);

const getRoadBuildingColliders = (sx, sy, sz) => (
  <>
    {NORTH_BUILDINGS.map((b) => (
      <WallCollider
        key={`north-bldg-col-${b.x}`}
        args={[(b.w * 0.5) * sx, (b.h * 0.5) * sy, 0.05 * sz]}
        position={[b.x * sx, colliderY(b.h * 0.5) * sy, NORTH_BUILDING_Z * sz]}
      />
    ))}
    {SOUTH_BUILDINGS.map((b) => (
      <WallCollider
        key={`south-bldg-col-${b.x}`}
        args={[(b.w * 0.5) * sx, (b.h * 0.5) * sy, 0.05 * sz]}
        position={[b.x * sx, colliderY(b.h * 0.5) * sy, SOUTH_BUILDING_Z * sz]}
      />
    ))}
  </>
);

/**
 * 道路：片側一車線×2＋両側歩道、横断歩道＋信号、T字合流（+Z支線）。
 * 主軸 X（東西）、+Z が支線合流方向
 */
export const renderRoadLayout = ({
  isGhost, meshPosition, meshRotation, handlers, castShadow, isBuilding, nightFactor, needType, expressionResolved = false,
}) => {
  const style = resolvePlaceNeedStyle(needType, { expressionResolved });
  const lampIntensity = (isGhost ? 0.3 : (0.55 + nightFactor * 0.65)) * style.lightMul;
  const branchCenterZ = INTERSECTION_HALF + BRANCH_LEN * 0.5;
  const sidewalkTint = style.walkwayTint ?? '#e0e0e0';

  return (
    <group position={meshPosition} rotation={meshRotation} {...interactionProps(handlers)}>
      {buildEndEntryMeshes(-6.5, SOUTH_SW_Z, isGhost, castShadow)}
      {buildEndEntryMeshes(6.5, SOUTH_SW_Z, isGhost, castShadow)}
      {buildEndEntryMeshes(-BRANCH_SIDEWALK_X, branchCenterZ + 2, isGhost, castShadow)}

      {renderMergedAsphalt({ isGhost, castShadow, asphaltColor: style.asphaltColor })}
      {style.bleakMood && (
        <mesh position={[0, ROAD_Y + 0.04, 0]}>
          <boxGeometry args={[MAIN_LEN - 0.5, 0.02, ROAD_HALF_Z * 2.2]} />
          <meshStandardMaterial color="#0d0d0d" transparent opacity={isGhost ? 0.08 : 0.14} roughness={1} />
        </mesh>
      )}

      <LaneCenterSolid crosswalkX={CROSSWALK_X} isGhost={isGhost} />
      <LaneCenterDashes z={-0.5} crosswalkX={CROSSWALK_X} isGhost={isGhost} />
      <LaneCenterDashes z={0.5} crosswalkX={CROSSWALK_X} isGhost={isGhost} />

      <CrosswalkStripes x={CROSSWALK_X} isGhost={isGhost} />
      <TrafficSignal position={[CROSSWALK_X - 0.55, FLOOR_Y, NORTH_SW_Z - 0.35]} facing={1} isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity} />
      <TrafficSignal position={[CROSSWALK_X - 0.55, FLOOR_Y, SOUTH_SW_Z + 0.35]} facing={1} isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity} />

      {/* 歩道：車道縁に密着（内側エッジ = ±ROAD_HALF_Z） */}
      <WalkFloor args={[MAIN_LEN, 0.08, SIDEWALK_W]} position={[0, FLOOR_Y, NORTH_SW_Z]} isGhost={isGhost} castShadow={castShadow} color={sidewalkTint} />
      <WalkFloor args={[4.8, 0.08, SIDEWALK_W]} position={[-4.4, FLOOR_Y, SOUTH_SW_Z]} isGhost={isGhost} castShadow={castShadow} color={style.walkwayTint} />
      <WalkFloor args={[4.8, 0.08, SIDEWALK_W]} position={[4.4, FLOOR_Y, SOUTH_SW_Z]} isGhost={isGhost} castShadow={castShadow} color={style.walkwayTint} />
      <WalkFloor args={[SIDEWALK_W, 0.08, BRANCH_LEN]} position={[-BRANCH_SIDEWALK_X, FLOOR_Y, branchCenterZ]} isGhost={isGhost} castShadow={castShadow} />
      <WalkFloor args={[SIDEWALK_W, 0.08, BRANCH_LEN]} position={[BRANCH_SIDEWALK_X, FLOOR_Y, branchCenterZ]} isGhost={isGhost} castShadow={castShadow} color="#d7ccc8" />
      <WalkFloor args={[1.6, 0.08, SIDEWALK_W]} position={[-INTERSECTION_HALF - 0.4, FLOOR_Y, SOUTH_SW_Z]} isGhost={isGhost} castShadow={castShadow} />
      <WalkFloor args={[1.6, 0.08, SIDEWALK_W]} position={[INTERSECTION_HALF + 0.4, FLOOR_Y, SOUTH_SW_Z]} isGhost={isGhost} castShadow={castShadow} />
      <WalkFloor args={[SIDEWALK_W, 0.08, 1.4]} position={[-BRANCH_SIDEWALK_X, FLOOR_Y, INTERSECTION_HALF + 0.5]} isGhost={isGhost} castShadow={castShadow} />
      <WalkFloor args={[SIDEWALK_W, 0.08, 1.4]} position={[BRANCH_SIDEWALK_X, FLOOR_Y, INTERSECTION_HALF + 0.5]} isGhost={isGhost} castShadow={castShadow} />

      {/* 縁石（歩道と車道の境目） */}
      <mesh position={[0, FLOOR_Y + 0.03, -ROAD_HALF_Z]} receiveShadow={castShadow}>
        <boxGeometry args={[MAIN_LEN, 0.07, 0.08]} />
        <meshStandardMaterial color="#9e9e9e" roughness={0.9} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, FLOOR_Y + 0.03, ROAD_HALF_Z]} receiveShadow={castShadow}>
        <boxGeometry args={[MAIN_LEN, 0.07, 0.08]} />
        <meshStandardMaterial color="#9e9e9e" roughness={0.9} {...ghostProps(isGhost)} />
      </mesh>
      {[-ROAD_HALF_Z, ROAD_HALF_Z].map((x) => (
        <mesh key={`curb-branch-${x}`} position={[x, FLOOR_Y + 0.03, branchCenterZ]} receiveShadow={castShadow}>
          <boxGeometry args={[0.08, 0.07, BRANCH_LEN]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.9} {...ghostProps(isGhost)} />
        </mesh>
      ))}

      {NORTH_BUILDINGS.map((b) => (
        <BuildingFacade key={`north-${b.x}`} x={b.x} z={NORTH_BUILDING_Z} {...b} isGhost={isGhost} castShadow={castShadow} />
      ))}
      {SOUTH_BUILDINGS.map((b) => (
        <BuildingFacade key={`south-${b.x}`} x={b.x} z={SOUTH_BUILDING_Z} {...b} isGhost={isGhost} castShadow={castShadow} />
      ))}

      {[-5.5, -1.5, 2, 5.5].map((x) => (
        <group key={`road-light-n-${x}`} position={[x, FLOOR_Y, NORTH_SW_Z - 0.35]}>
          <mesh position={[0, 0.9, 0]} castShadow={castShadow}>
            <boxGeometry args={[0.07, 1.8, 0.07]} />
            <meshStandardMaterial color="#37474f" metalness={0.4} {...ghostProps(isGhost)} />
          </mesh>
          <mesh position={[0.12, 1.85, 0]}>
            <boxGeometry args={[0.35, 0.08, 0.12]} />
            <meshStandardMaterial color="#fff9c4" emissive="#fff59d" emissiveIntensity={lampIntensity} {...ghostProps(isGhost, 0.95)} />
          </mesh>
        </group>
      ))}

      {[-4.5, 4.5].map((x) => (
        <group key={`road-light-s-${x}`} position={[x, FLOOR_Y, SOUTH_SW_Z + 0.35]}>
          <mesh position={[0, 0.9, 0]} castShadow={castShadow}>
            <boxGeometry args={[0.07, 1.8, 0.07]} />
            <meshStandardMaterial color="#37474f" metalness={0.4} {...ghostProps(isGhost)} />
          </mesh>
          <mesh position={[0.12, 1.85, 0]}>
            <boxGeometry args={[0.35, 0.08, 0.12]} />
            <meshStandardMaterial color="#fff9c4" emissive="#fff59d" emissiveIntensity={lampIntensity} {...ghostProps(isGhost, 0.95)} />
          </mesh>
        </group>
      ))}

      {[-2.2, 2.2].map((x) => (
        <group key={`bench-${x}`} position={[x, FLOOR_Y, SOUTH_SW_Z + 0.15]}>
          <mesh position={[0, 0.12, 0]} castShadow={castShadow}>
            <boxGeometry args={[1.2, 0.08, 0.42]} />
            <meshStandardMaterial color="#6d4c41" roughness={0.85} {...ghostProps(isGhost)} />
          </mesh>
          <mesh position={[0, -0.02, -0.22]} castShadow={castShadow}>
            <boxGeometry args={[1.2, 0.35, 0.06]} />
            <meshStandardMaterial color="#5d4037" roughness={0.9} {...ghostProps(isGhost)} />
          </mesh>
        </group>
      ))}

      {!isGhost && !isBuilding && (
        <pointLight
          position={[CROSSWALK_X, 2.5, 0]}
          distance={8}
          intensity={(0.25 + nightFactor * 0.55) * style.lightMul}
          color={style.bleakMood ? '#cfd8dc' : '#fff9c4'}
        />
      )}
    </group>
  );
};

export const ROAD_SHAPE_IDS = ['road_layout'];

export const isRoadShape = (shape) => ROAD_SHAPE_IDS.includes(shape);

export const getRoadMeshPosition = (shape) => (
  ROAD_SHAPE_IDS.includes(shape) ? [0, -0.24, 0] : [0, 0, 0]
);

export const getRoadWalkColliders = (shape, sx, sy, sz) => {
  if (shape === 'road_layout') {
    const branchCenterZ = INTERSECTION_HALF + BRANCH_LEN * 0.5;
    return (
      <>
        {buildEndEntryColliders(-6.5, SOUTH_SW_Z, sx, sy, sz)}
        {buildEndEntryColliders(6.5, SOUTH_SW_Z, sx, sy, sz)}
        {buildEndEntryColliders(-BRANCH_SIDEWALK_X, branchCenterZ + 2, sx, sy, sz)}
        <CuboidCollider args={[6.8 * sx, 0.04, 0.48 * sz]} position={[0, colliderY(FLOOR_Y) * sy, NORTH_SW_Z * sz]} />
        <CuboidCollider args={[2.3 * sx, 0.04, 0.48 * sz]} position={[-4.4 * sx, colliderY(FLOOR_Y) * sy, SOUTH_SW_Z * sz]} />
        <CuboidCollider args={[2.3 * sx, 0.04, 0.48 * sz]} position={[4.4 * sx, colliderY(FLOOR_Y) * sy, SOUTH_SW_Z * sz]} />
        <CuboidCollider args={[0.48 * sx, 0.04, 2.6 * sz]} position={[-BRANCH_SIDEWALK_X * sx, colliderY(FLOOR_Y) * sy, branchCenterZ * sz]} />
        <CuboidCollider args={[0.48 * sx, 0.04, 2.6 * sz]} position={[BRANCH_SIDEWALK_X * sx, colliderY(FLOOR_Y) * sy, branchCenterZ * sz]} />
        <CuboidCollider args={[0.48 * sx, 0.04, 0.65 * sz]} position={[-BRANCH_SIDEWALK_X * sx, colliderY(FLOOR_Y) * sy, (INTERSECTION_HALF + 0.5) * sz]} />
        <CuboidCollider args={[0.48 * sx, 0.04, 0.65 * sz]} position={[BRANCH_SIDEWALK_X * sx, colliderY(FLOOR_Y) * sy, (INTERSECTION_HALF + 0.5) * sz]} />
        <CuboidCollider args={[1.2 * sx, 0.04, 2.6 * sz]} position={[CROSSWALK_X * sx, colliderY(FLOOR_Y) * sy, 0]} />
        {getRoadBuildingColliders(sx, sy, sz)}
      </>
    );
  }
  return null;
};

export const getRoadCollider = (shape, sx, sy, sz, needType = null, expressionResolved = false) => (
  getRoadWalkColliders(shape, sx, sy, sz, needType, expressionResolved)
);
