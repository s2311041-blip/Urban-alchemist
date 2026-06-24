import React from 'react';
import { CuboidCollider } from '@react-three/rapier';
import { PALETTE } from '../../../constants/artDirection';
import { placeMat, PLACE_COLORS, StringLightRow } from './placeVoxelHelpers';
import {
  resolvePlaceNeedStyle,
  STATION_ENTRY_BASE_COUNT,
  STATION_ENTRY_BASE_Y,
  STATION_ENTRY_RISE,
  STATION_ENTRY_RUN,
  STATION_ENTRY_START_Z,
  STATION_EXIT_BASE_COUNT,
  STATION_EXIT_BASE_Y,
  STATION_EXIT_RISE,
  STATION_EXIT_RUN,
  STATION_EXIT_START_Z,
} from '../../../utils/placeNeedTypeStyle';

const WALK = { stationWalk: true };
/** Block.jsx の meshPosition とコライダー位置を揃える */
const MESH_Y_OFFSET = -0.24;
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

const buildStairWalkColliders = (startZ, baseY, count = 10, rise = 0.13, run = 0.26, width = 2) => (
  Array.from({ length: count }, (_, i) => (
    <CuboidCollider
      key={`stair-walk-${startZ}-${i}`}
      args={[width * 0.5, 0.04, run * 0.45]}
      position={[0, baseY + rise * (i + 0.5), startZ + run * i]}
    />
  ))
);

const WallCollider = ({ args, position }) => (
  <CuboidCollider args={args} position={position} />
);

const PLATFORM_PILLAR_XS = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];

/** ホーム上の柱（細い当たり判定） */
const getStationPillarColliders = (sx, sy, sz) => (
  <>
    {PLATFORM_PILLAR_XS.map((x) => (
      <WallCollider
        key={`pillar-col-${x}`}
        args={[0.05 * sx, 1.1 * sy, 0.05 * sz]}
        position={[x * sx, colliderY(1.1) * sy, -2.55 * sz]}
      />
    ))}
  </>
);

/** 外壁のみ（改札機・内装・手すりには当たり判定なし） */
const getStationExteriorWallColliders = (sx, sy, sz) => {
  const t = 0.08;
  return (
    <>
      {/* 北：線路側バリア */}
      <WallCollider args={[3.4 * sx, 0.55 * sy, t * sz]} position={[0, colliderY(0.78) * sy, -4.35 * sz]} />
      {/* ホーム東西外壁 */}
      <WallCollider args={[t * sx, 1.1 * sy, 1.15 * sz]} position={[-3.35 * sx, colliderY(1.05) * sy, -3 * sz]} />
      <WallCollider args={[t * sx, 1.1 * sy, 1.15 * sz]} position={[3.35 * sx, colliderY(1.05) * sy, -3 * sz]} />
      {/* 改札コンコース東西外壁（南北は開口） */}
      <WallCollider args={[t * sx, 1.15 * sy, 1.55 * sz]} position={[-2.48 * sx, colliderY(2.38) * sy, 3.2 * sz]} />
      <WallCollider args={[t * sx, 1.15 * sy, 1.55 * sz]} position={[2.48 * sx, colliderY(2.38) * sy, 3.2 * sz]} />
      {/* 駅舎東西外壁 */}
      <WallCollider args={[t * sx, 1.15 * sy, 1.15 * sz]} position={[-2.72 * sx, colliderY(2.38) * sy, 5.8 * sz]} />
      <WallCollider args={[t * sx, 1.15 * sy, 1.15 * sz]} position={[2.72 * sx, colliderY(2.38) * sy, 5.8 * sz]} />
      {/* 南正面：出入口の間だけ壁（3扉分は開口） */}
      <WallCollider args={[0.55 * sx, 1.1 * sy, t * sz]} position={[-2.35 * sx, colliderY(2.35) * sy, 6.68 * sz]} />
      <WallCollider args={[0.38 * sx, 1.1 * sy, t * sz]} position={[-0.68 * sx, colliderY(2.35) * sy, 6.68 * sz]} />
      <WallCollider args={[0.38 * sx, 1.1 * sy, t * sz]} position={[0.68 * sx, colliderY(2.35) * sy, 6.68 * sz]} />
      <WallCollider args={[0.55 * sx, 1.1 * sy, t * sz]} position={[2.35 * sx, colliderY(2.35) * sy, 6.68 * sz]} />
      {/* 駅前広場東西端（外周） */}
      <WallCollider args={[t * sx, 0.85 * sy, 1.35 * sz]} position={[-3.2 * sx, colliderY(0.92) * sy, 10.2 * sz]} />
      <WallCollider args={[t * sx, 0.85 * sy, 1.35 * sz]} position={[3.2 * sx, colliderY(0.92) * sy, 10.2 * sz]} />
    </>
  );
};

/** 駅全体（ホーム→階段→改札→駅舎→出口）。1座標系で高さを接続 */
export const renderStationLayout = ({
  isGhost, meshPosition, meshRotation, handlers, castShadow, isBuilding, nightFactor, needType, expressionResolved = false,
}) => {
  const style = resolvePlaceNeedStyle(needType, { expressionResolved });
  const lampIntensity = (isGhost ? 0.3 : (0.55 + nightFactor * 0.6)) * style.lightMul;
  const signIntensity = (isGhost ? 0.2 : (0.45 + nightFactor * 1.1)) * style.lightMul;
  const interiorLight = (isGhost ? 0.4 : (0.85 + nightFactor * 0.5)) * style.lightMul;
  const turnstiles = [-1.05, -0.35, 0.35, 1.05];
  const entrances = [-1.35, 0, 1.35];
  const entryStepCount = STATION_ENTRY_BASE_COUNT + style.extraNorthEntrySteps;
  const entryStartZ = STATION_ENTRY_START_Z - STATION_ENTRY_RUN * style.extraNorthEntrySteps;
  const exitStepCount = STATION_EXIT_BASE_COUNT + style.extraPlazaExitSteps;
  const exitStepWidth = needType === 'P' ? 2.8 : 3.2;

  return (
    <group position={meshPosition} rotation={meshRotation} {...interactionProps(handlers)}>
      {/* 島の地面からホームへ（北側・歩道接続） */}
      {Array.from({ length: entryStepCount }, (_, i) => (
        <mesh
          key={`station-entry-${i}`}
          position={[
            0,
            STATION_ENTRY_BASE_Y + STATION_ENTRY_RISE * (i + 0.5),
            entryStartZ + STATION_ENTRY_RUN * i,
          ]}
          receiveShadow={castShadow}
          userData={WALK}
        >
          <boxGeometry args={[needType === 'P' ? 2.3 : 2.6, 0.1, 0.22]} />
          <meshStandardMaterial color={style.walkwayTint} roughness={0.82} {...ghostProps(isGhost)} />
        </mesh>
      ))}

      {/* ガラスブロックの壁（左右）とゲート - Entrance */}
      <mesh position={[-1.8, STATION_ENTRY_BASE_Y + 1.25, entryStartZ + 1.2]} castShadow={castShadow}>
        <boxGeometry args={[1.2, 2.5, 0.1]} />
        <meshStandardMaterial color="#E1F5FE" roughness={0.2} metalness={0.15} transparent opacity={0.88} flatShading />
      </mesh>
      <mesh position={[1.8, STATION_ENTRY_BASE_Y + 1.25, entryStartZ + 1.2]} castShadow={castShadow}>
        <boxGeometry args={[1.2, 2.5, 0.1]} />
        <meshStandardMaterial color="#E1F5FE" roughness={0.2} metalness={0.15} transparent opacity={0.88} flatShading />
      </mesh>
      <mesh position={[0, STATION_ENTRY_BASE_Y + 2.4, entryStartZ + 1.2]} castShadow={castShadow}>
        <boxGeometry args={[2.4, 0.2, 0.1]} />
        <meshStandardMaterial color="#E1F5FE" roughness={0.2} metalness={0.15} transparent opacity={0.88} flatShading />
      </mesh>

      {/* --- ホーム（北・線路側） --- */}
      <WalkFloor args={[6.8, 0.1, 2.4]} position={[0, 0.5, -3]} isGhost={isGhost} castShadow={castShadow} />
      <mesh position={[0, 0.58, -3.95]} castShadow={castShadow}>
        <boxGeometry args={[6.4, 0.03, 0.14]} />
        <meshStandardMaterial color="#fdd835" emissive="#ffeb3b" emissiveIntensity={isGhost ? 0.2 : 0.55} {...ghostProps(isGhost, 0.95)} />
      </mesh>
      <mesh position={[0, 0.4, -4.2]} receiveShadow={castShadow}>
        <boxGeometry args={[7, 0.06, 0.55]} />
        <meshStandardMaterial color="#424242" roughness={0.95} {...ghostProps(isGhost)} />
      </mesh>
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x) => (
        <mesh key={`pl-${x}`} position={[x, 1.35, -2.55]} castShadow={castShadow}>
          <boxGeometry args={[0.14, 2.5, 0.14]} />
          <meshStandardMaterial color="#eceff1" metalness={0.35} roughness={0.45} {...ghostProps(isGhost)} />
        </mesh>
      ))}
      <mesh position={[0, 2.7, -2.65]} castShadow={castShadow}>
        <boxGeometry args={[7, 0.1, 2.6]} />
        <meshStandardMaterial {...placeMat(PLACE_COLORS.plaster)} {...ghostProps(isGhost, 0.88)} />
      </mesh>
      <StringLightRow from={[-3, 2.85, -2.65]} to={[3, 2.85, -2.65]} y={2.78} intensity={0.7} isGhost={isGhost} />
      <mesh position={[0, 0.56, -2.1]} userData={WALK}>
        <boxGeometry args={[2.2, 0.06, 0.5]} />
        <meshStandardMaterial color="#ffe082" emissive="#ffd54f" emissiveIntensity={isGhost ? 0.1 : 0.25} {...ghostProps(isGhost, 0.9)} />
      </mesh>
      <mesh position={[-3.35, 0.95, -3]} castShadow={castShadow}>
        <boxGeometry args={[0.1, 1.1, 2.3]} />
        <meshStandardMaterial {...placeMat(PALETTE.buildingWarm)} {...ghostProps(isGhost, 0.92)} />
      </mesh>
      <mesh position={[3.35, 0.95, -3]} castShadow={castShadow}>
        <boxGeometry args={[0.1, 1.1, 2.3]} />
        <meshStandardMaterial {...placeMat(PALETTE.buildingWarm)} {...ghostProps(isGhost, 0.92)} />
      </mesh>
      <mesh position={[0, 0.78, -4.35]} castShadow={castShadow}>
        <boxGeometry args={[6.8, 0.55, 0.1]} />
        <meshStandardMaterial color="#90a4ae" metalness={0.35} {...ghostProps(isGhost, 0.9)} />
      </mesh>

      {/* --- 階段（ホーム南→改札階） --- */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh
          key={`step-${i}`}
          position={[0, 0.5 + 0.13 * (i + 0.5), -1.2 + 0.26 * i]}
          castShadow={castShadow}
          receiveShadow={castShadow}
          userData={WALK}
        >
          <boxGeometry args={[2.2, 0.13, 0.26]} />
          <meshStandardMaterial color="#bdbdbd" roughness={0.82} {...ghostProps(isGhost)} />
        </mesh>
      ))}
      <mesh position={[-1.2, 1.2, 0.1]} castShadow={castShadow}>
        <boxGeometry args={[0.06, 1.5, 2.5]} />
        <meshStandardMaterial color="#cfd8dc" metalness={0.4} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[1.2, 1.2, 0.1]} castShadow={castShadow}>
        <boxGeometry args={[0.06, 1.5, 2.5]} />
        <meshStandardMaterial color="#cfd8dc" metalness={0.4} {...ghostProps(isGhost)} />
      </mesh>
      <WalkFloor args={[2.4, 0.08, 0.9]} position={[0, 1.82, 1.45]} isGhost={isGhost} castShadow={castShadow} />

      {/* --- 室内改札コンコース（開口＝南北貫通） --- */}
      <WalkFloor args={[4.8, 0.08, 3.2]} position={[0, 1.8, 3.2]} isGhost={isGhost} castShadow={castShadow} color={PLACE_COLORS.plaster} />
      <mesh position={[-2.45, 2.45, 3.2]} castShadow={castShadow}>
        <boxGeometry args={[0.1, 2.4, 3.2]} />
        <meshStandardMaterial color="#cfd8dc" {...ghostProps(isGhost, 0.9)} />
      </mesh>
      <mesh position={[2.45, 2.45, 3.2]} castShadow={castShadow}>
        <boxGeometry args={[0.1, 2.4, 3.2]} />
        <meshStandardMaterial color="#cfd8dc" {...ghostProps(isGhost, 0.9)} />
      </mesh>
      <mesh position={[0, 4.05, 3.2]}>
        <boxGeometry args={[4.8, 0.12, 3.2]} />
        <meshStandardMaterial {...placeMat('#FFFDE7', { emissive: PALETTE.lampEmissive, emissiveIntensity: 0.12 })} {...ghostProps(isGhost, 0.88)} />
      </mesh>
      <mesh position={[0, 3.55, 3.2]} castShadow={castShadow}>
        <boxGeometry args={[2.8, 0.35, 0.45]} />
        <meshStandardMaterial color="#263238" emissive="#37474f" emissiveIntensity={0.15} {...ghostProps(isGhost)} />
      </mesh>
      {turnstiles.map((x) => (
        <group key={`gate-${x}`} position={[x, 1.8, 3.05]}>
          <mesh position={[0, 0.48, 0]} castShadow={castShadow}>
            <boxGeometry args={[0.5, 0.96, 0.5]} />
            <meshStandardMaterial color="#546e7a" metalness={0.5} {...ghostProps(isGhost)} />
          </mesh>
          <mesh position={[0, 0.72, 0.14]} rotation={[0, 0, Math.PI / 5]}>
            <boxGeometry args={[0.05, 0.45, 0.05]} />
            <meshStandardMaterial color="#90a4ae" metalness={0.7} {...ghostProps(isGhost)} />
          </mesh>
          <mesh position={[0, 0.9, 0.2]}>
            <boxGeometry args={[0.2, 0.12, 0.03]} />
            <meshStandardMaterial color="#00c853" emissive="#69f0ae" emissiveIntensity={lampIntensity} {...ghostProps(isGhost, 0.9)} />
          </mesh>
        </group>
      ))}

      {/* --- 駅舎（改札南→出入り口→駅前へ下るスロープ） --- */}
      <WalkFloor args={[5.2, 0.08, 2.4]} position={[0, 1.8, 5.8]} isGhost={isGhost} castShadow={castShadow} />
      <mesh position={[0, 2.25, 6.35]} castShadow={castShadow}>
        <boxGeometry args={[5.4, 2.5, 0.1]} />
        <meshStandardMaterial color="#b3e5fc" transparent opacity={isGhost ? 0.22 : 0.38} metalness={0.75} roughness={0.12} />
      </mesh>

      <mesh position={[0, 3.55, 6.45]} castShadow={castShadow}>
        <boxGeometry args={[5.6, 0.2, 1.5]} />
        <meshStandardMaterial color="#fafafa" {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[2.2, 2.75, 6.55]} castShadow={castShadow}>
        <boxGeometry args={[0.55, 0.55, 0.1]} />
        <meshStandardMaterial color="#ffffff" emissive="#eceff1" emissiveIntensity={signIntensity * 0.5} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, 3.75, 6.6]} castShadow={castShadow}>
        <boxGeometry args={[3.2, 0.55, 0.12]} />
        <meshStandardMaterial color="#1565c0" emissive="#42a5f5" emissiveIntensity={signIntensity} {...ghostProps(isGhost, 0.95)} />
      </mesh>

      {/* ガラスブロックの壁（左右）とゲート - Exit */}
      <mesh position={[-1.8, STATION_EXIT_BASE_Y + 1.25, STATION_EXIT_START_Z - 1.2]} castShadow={castShadow}>
        <boxGeometry args={[1.2, 2.5, 0.1]} />
        <meshStandardMaterial color="#E1F5FE" roughness={0.2} metalness={0.15} transparent opacity={0.88} flatShading />
      </mesh>
      <mesh position={[1.8, STATION_EXIT_BASE_Y + 1.25, STATION_EXIT_START_Z - 1.2]} castShadow={castShadow}>
        <boxGeometry args={[1.2, 2.5, 0.1]} />
        <meshStandardMaterial color="#E1F5FE" roughness={0.2} metalness={0.15} transparent opacity={0.88} flatShading />
      </mesh>
      <mesh position={[0, STATION_EXIT_BASE_Y + 2.4, STATION_EXIT_START_Z - 1.2]} castShadow={castShadow}>
        <boxGeometry args={[2.4, 0.2, 0.1]} />
        <meshStandardMaterial color="#E1F5FE" roughness={0.2} metalness={0.15} transparent opacity={0.88} flatShading />
      </mesh>

      {/* 駅前へ下る階段 */}
      {Array.from({ length: exitStepCount }, (_, i) => (
        <mesh
          key={`exit-step-${i}`}
          position={[
            0,
            STATION_EXIT_BASE_Y + STATION_EXIT_RISE * (i + 0.5),
            STATION_EXIT_START_Z + STATION_EXIT_RUN * i,
          ]}
          receiveShadow={castShadow}
          userData={WALK}
        >
          <boxGeometry args={[exitStepWidth, 0.12, 0.28]} />
          <meshStandardMaterial color={style.walkwayTint} roughness={0.82} {...ghostProps(isGhost)} />
        </mesh>
      ))}
      <WalkFloor args={[6.5, 0.1, 3]} position={[0, 0.52, 10.2]} isGhost={isGhost} castShadow={castShadow} />

      {!isGhost && !isBuilding && (
        <>
          <pointLight position={[0, 3.2, 3.2]} distance={9} intensity={interiorLight * 1.1} color="#FFF8E1" />
          <pointLight position={[0, 2.5, -2.8]} distance={8} intensity={0.38 + nightFactor * 0.95} color={PALETTE.lampEmissive} />
          <pointLight position={[0, 2.8, 6]} distance={8} intensity={0.28 + nightFactor * 0.75} color="#B3E5FC" />
        </>
      )}
    </group>
  );
};

/** アクセント用：追加階段のみ */
export const renderStationStairs = ({ isGhost, meshPosition, meshRotation, handlers, castShadow }) => (
  <group position={meshPosition} rotation={meshRotation} {...interactionProps(handlers)}>
    {Array.from({ length: 6 }, (_, i) => (
      <mesh
        key={`accent-step-${i}`}
        position={[0, 0.13 * (i + 0.5), 0.26 * i]}
        castShadow={castShadow}
        receiveShadow={castShadow}
        userData={WALK}
      >
        <boxGeometry args={[1.6, 0.13, 0.26]} />
        <meshStandardMaterial color="#bdbdbd" roughness={0.82} {...ghostProps(isGhost)} />
      </mesh>
    ))}
  </group>
);

export const renderStationPlatform = () => null;
export const renderStationGate = () => null;
export const renderStationBuilding = () => null;

export const STATION_SHAPE_IDS = [
  'station_layout',
  'station_platform',
  'station_stairs',
  'station_gate',
  'station_building',
];

export const isStationShape = (shape) => STATION_SHAPE_IDS.includes(shape);

export const getStationMeshPosition = (shape) => (
  STATION_SHAPE_IDS.includes(shape) ? [0, -0.24, 0] : [0, 0, 0]
);

/** 床コリジョン（歩行面） */
const buildStationEntryWalkColliders = (sx, sy, sz, extraSteps = 0) => {
  const count = STATION_ENTRY_BASE_COUNT + extraSteps;
  const startZ = STATION_ENTRY_START_Z - STATION_ENTRY_RUN * extraSteps;
  return Array.from({ length: count }, (_, i) => (
    <CuboidCollider
      key={`station-entry-col-${i}`}
      args={[1.25 * sx, 0.04, 0.1 * sz]}
      position={[
        0,
        colliderY(STATION_ENTRY_BASE_Y + STATION_ENTRY_RISE * (i + 0.5)) * sy,
        (startZ + STATION_ENTRY_RUN * i) * sz,
      ]}
    />
  ));
};

export const getStationWalkColliders = (shape, sx, sy, sz, needType = null, expressionResolved = false) => {
  if (shape === 'station_layout') {
    const style = resolvePlaceNeedStyle(needType, { expressionResolved });
    const exitCount = STATION_EXIT_BASE_COUNT + style.extraPlazaExitSteps;
    const exitWidth = needType === 'P' ? 2.8 : 3.2;
    return (
      <>
        {buildStationEntryWalkColliders(sx, sy, sz, style.extraNorthEntrySteps)}
        <CuboidCollider args={[3.3 * sx, 0.04, 1.1 * sz]} position={[0, colliderY(0.5) * sy, -3 * sz]} />
        {buildStairWalkColliders(-1.2, colliderY(0.5), 10, 0.13, 0.26, 2.2 * sx)}
        <CuboidCollider args={[0.45 * sx, 0.04, 0.4 * sz]} position={[0, colliderY(1.82) * sy, 1.45 * sz]} />
        <CuboidCollider args={[2.3 * sx, 0.04, 1.5 * sz]} position={[0, colliderY(1.8) * sy, 3.2 * sz]} />
        <CuboidCollider args={[2.5 * sx, 0.04, 1.1 * sz]} position={[0, colliderY(1.8) * sy, 5.8 * sz]} />
        {buildStairWalkColliders(STATION_EXIT_START_Z, colliderY(STATION_EXIT_BASE_Y), exitCount, STATION_EXIT_RISE, STATION_EXIT_RUN, exitWidth * sx)}
        <CuboidCollider args={[3.1 * sx, 0.04, 1.4 * sz]} position={[0, colliderY(0.52) * sy, 10.2 * sz]} />
        {getStationExteriorWallColliders(sx, sy, sz)}
        {getStationPillarColliders(sx, sy, sz)}
      </>
    );
  }
  if (shape === 'station_platform') {
    return <CuboidCollider args={[3.3 * sx, 0.04, 1.1 * sz]} position={[0, colliderY(0.5) * sy, 0.1 * sz]} />;
  }
  if (shape === 'station_stairs') {
    return <>{buildStairWalkColliders(-1.2, colliderY(0.5), 10, 0.13, 0.26, 2.2 * sx)}</>;
  }
  if (shape === 'station_gate') {
    return <CuboidCollider args={[2.3 * sx, 0.04, 1.5 * sz]} position={[0, colliderY(1.8) * sy, 0]} />;
  }
  if (shape === 'station_building') {
    return (
      <>
        <CuboidCollider args={[2.5 * sx, 0.04, 1.1 * sz]} position={[0, colliderY(1.8) * sy, 0.35 * sz]} />
        {buildStairWalkColliders(7.2, colliderY(1.8), 8, -0.12, 0.28, 3.2 * sx)}
      </>
    );
  }
  return null;
};

export const getStationCollider = (shape, sx, sy, sz, needType = null, expressionResolved = false) => (
  getStationWalkColliders(shape, sx, sy, sz, needType, expressionResolved)
);
