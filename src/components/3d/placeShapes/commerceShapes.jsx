import React from 'react';
import { CuboidCollider } from '@react-three/rapier';

const WALK = { stationWalk: true };
const MESH_Y_OFFSET = -0.24;
const FLOOR_Y = 0.1;
const ROAD_Y = 0.06;
const PLAZA_Y = FLOOR_Y + 0.005;
const colliderY = (localY) => localY + MESH_Y_OFFSET;

const EARTH = {
  wall: '#f5f5f5',
  wallDark: '#eeeeee',
  trim: '#e0e0e0',
  glass: '#546e7a',
  plaza: '#eceff1',
  plazaAlt: '#e0e0e0',
  green: '#7cb342',
  lalaOrange: '#f57c00',
  solar: '#37474f',
};

/** 低く横に広い商業棟（2階風・高さ約2.4m） */
const MALL_H = 2.35;
const MALL_BODY_Y = MALL_H / 2 + 0.08;
const MALL_FIRST_H = 1.12;
const MALL_UPPER_H = MALL_H - MALL_FIRST_H;
const MALL_FRONT_Z = -1.95;
/** 東ウイング東面 x≈4.8 — 駐車場は西面が 5.15 以降（0.35m 隙間） */
const GARAGE_X = 5.95;
const MALL_BODY_W = 8.8;
const MALL_HALF_W = MALL_BODY_W / 2;

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
    <meshStandardMaterial color={color} roughness={0.82} {...ghostProps(isGhost)} />
  </mesh>
);

const buildEndEntryMeshes = (zStart, isGhost, castShadow) => (
  Array.from({ length: 3 }, (_, i) => (
    <mesh
      key={`commerce-entry-${zStart}-${i}`}
      position={[0, 0.03 + 0.05 * (i + 0.5), zStart + (zStart < 0 ? 0.28 * i : -0.28 * i)]}
      receiveShadow={castShadow}
      userData={WALK}
    >
      <boxGeometry args={[3.6, 0.05, 0.28]} />
      <meshStandardMaterial color="#bdbdbd" roughness={0.82} {...ghostProps(isGhost)} />
    </mesh>
  ))
);

const buildEndEntryColliders = (zStart, sx, sy, sz) => (
  Array.from({ length: 3 }, (_, i) => (
    <CuboidCollider
      key={`commerce-entry-col-${zStart}-${i}`}
      args={[1.75 * sx, 0.025, 0.12 * sz]}
      position={[
        0,
        colliderY(0.03 + 0.05 * (i + 0.5)) * sy,
        (zStart + (zStart < 0 ? 0.28 * i : -0.28 * i)) * sz,
      ]}
    />
  ))
);

const PLAZA_PATHS = [
  { pos: [0, PLAZA_Y, -3.1], args: [7.8, 0.05, 2.6], color: EARTH.plaza },
  { pos: [0, PLAZA_Y, -0.15], args: [8.8, 0.05, 2.2], color: EARTH.plazaAlt },
  { pos: [0, PLAZA_Y, 1.55], args: [7.2, 0.05, 1.1], color: EARTH.plaza },
];

const Bench = ({ x, z, rot = 0, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.12, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.2, 0.08, 0.42]} />
      <meshStandardMaterial color="#6d4c41" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, -0.02, -0.2]} castShadow={castShadow}>
      <boxGeometry args={[1.2, 0.35, 0.06]} />
      <meshStandardMaterial color="#5d4037" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const Tree = ({ x, z, scale = 1, isGhost, castShadow }) => (
  <group position={[x, FLOOR_Y, z]} scale={scale}>
    <mesh position={[0, 0.4, 0]} castShadow={castShadow}>
      <cylinderGeometry args={[0.09, 0.12, 0.75, 8]} />
      <meshStandardMaterial color="#5d4037" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.88, 0]} castShadow={castShadow}>
      <sphereGeometry args={[0.48, 10, 8]} />
      <meshStandardMaterial color={EARTH.green} roughness={0.82} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

/** 1階テナント看板列（I 演出の土台：看板が多い） */
const TENANT_SIGNS = [
  { x: -3.15, color: '#e53935', w: 0.82 },
  { x: -2.05, color: '#1e88e5', w: 0.78 },
  { x: -0.95, color: '#43a047', w: 0.8 },
  { x: 0.15, color: '#8e24aa', w: 0.76 },
  { x: 1.25, color: '#fb8c00', w: 0.8 },
  { x: 2.35, color: '#00897b', w: 0.78 },
  { x: 3.35, color: '#5e35b1', w: 0.75 },
];

const TenantSignRow = ({ frontZ, isGhost, castShadow }) => (
  <>
    {TENANT_SIGNS.map((sign) => (
      <group key={`tenant-${sign.x}`} position={[sign.x, 0.95, frontZ + 0.18]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[sign.w, 0.32, 0.06]} />
          <meshStandardMaterial color={sign.color} roughness={0.58} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[0, 0, 0.04]} castShadow={castShadow}>
          <boxGeometry args={[sign.w * 0.82, 0.14, 0.02]} />
          <meshStandardMaterial color="#fafafa" roughness={0.65} {...ghostProps(isGhost, 0.9)} />
        </mesh>
      </group>
    ))}
  </>
);

const FoodCourtSign = ({ isGhost, castShadow }) => (
  <group position={[-3.72, 1.62, 0.35]}>
    <mesh castShadow={castShadow}>
      <boxGeometry args={[1.35, 0.38, 0.1]} />
      <meshStandardMaterial color="#ff6f00" roughness={0.55} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0, 0.06]} castShadow={castShadow}>
      <boxGeometry args={[1.05, 0.18, 0.03]} />
      <meshStandardMaterial color="#fff3e0" roughness={0.65} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const CartRack = ({ isGhost, castShadow }) => (
  <group position={[2.35, FLOOR_Y, 0.45]}>
    {[-0.45, 0, 0.45].map((cx, i) => (
      <mesh key={`cart-${i}`} position={[cx, 0.22, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.38, 0.28, 0.55]} />
        <meshStandardMaterial color="#90a4ae" metalness={0.35} roughness={0.7} {...ghostProps(isGhost)} />
      </mesh>
    ))}
    <mesh position={[0, 0.08, -0.35]} castShadow={castShadow}>
      <boxGeometry args={[1.35, 0.06, 0.08]} />
      <meshStandardMaterial color="#bdbdbd" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const DirectoryPylon = ({ isGhost, castShadow }) => (
  <group position={[1.2, FLOOR_Y, -0.35]}>
    <mesh position={[0, 0.7, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.12, 1.4, 0.12]} />
      <meshStandardMaterial color={EARTH.trim} roughness={0.8} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 1.5, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.9, 1.05, 0.09]} />
      <meshStandardMaterial color={EARTH.wallDark} roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 1.5, 0.05]} castShadow={castShadow}>
      <boxGeometry args={[0.7, 0.18, 0.03]} />
      <meshStandardMaterial color={EARTH.lalaOrange} roughness={0.55} {...ghostProps(isGhost)} />
    </mesh>
    {['#ef5350', '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#8d6e63'].map((c, i) => (
      <mesh key={`dir-floor-${i}`} position={[-0.32 + i * 0.13, 1.38 - i * 0.1, 0.06]} castShadow={castShadow}>
        <boxGeometry args={[0.1, 0.06, 0.02]} />
        <meshStandardMaterial color={c} roughness={0.65} {...ghostProps(isGhost)} />
      </mesh>
    ))}
  </group>
);

/** 広場の分岐（I 演出の土台：案内が錯綜しやすい） */
const PlazaForkSigns = ({ isGhost, castShadow }) => (
  <>
    <group position={[-1.1, FLOOR_Y, -0.9]}>
      <mesh position={[0, 0.55, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.08, 1.1, 0.08]} />
        <meshStandardMaterial color={EARTH.trim} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0.22, 0.95, 0]} rotation={[0, 0.5, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.55, 0.35, 0.04]} />
        <meshStandardMaterial color="#42a5f5" roughness={0.65} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[-0.2, 0.75, 0]} rotation={[0, -0.45, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.48, 0.3, 0.04]} />
        <meshStandardMaterial color="#66bb6a" roughness={0.65} {...ghostProps(isGhost)} />
      </mesh>
    </group>
    <group position={[1.4, FLOOR_Y, -1.1]}>
      <mesh position={[0, 0.5, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.08, 1.0, 0.08]} />
        <meshStandardMaterial color={EARTH.trim} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, 0.92, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.62, 0.32, 0.04]} />
        <meshStandardMaterial color="#ef5350" roughness={0.65} {...ghostProps(isGhost)} />
      </mesh>
    </group>
  </>
);

const GARAGE_W = 1.65;
const GARAGE_H = 2.1;
const GARAGE_D = 7.8;
const GARAGE_HALF_W = GARAGE_W / 2;
const GARAGE_HALF_D = GARAGE_D / 2;
const GARAGE_DECK_LEVELS = [0.35, 1.0, 1.65];

/** ガラスは単面＋depthWrite オフで z-fight によるモザイクを防ぐ */
const garageGlassProps = (isGhost, opacity = 0.38) => ({
  color: '#b3e5fc',
  transparent: true,
  opacity: isGhost ? 0.18 : opacity,
  metalness: 0.5,
  roughness: 0.1,
  depthWrite: false,
});

const garageFrameProps = (isGhost) => ({
  color: '#cfd8dc',
  roughness: 0.78,
  metalness: 0.18,
  ...(isGhost ? { transparent: true, opacity: 0.62 } : {}),
});

/** 駐車場ファサード：ガラス1枚＋枠を手前に分離配置 */
const GarageGlassFacade = ({ face, isGhost, castShadow }) => {
  const glassDepth = 0.04;
  const frameDepth = 0.07;
  const glassSpanZ = GARAGE_D - 0.45;
  const glassSpanX = GARAGE_W - 0.3;
  const glassH = GARAGE_H * 0.88;
  const glassY = GARAGE_H / 2;

  const isWest = face === 'west';
  const glassPos = isWest
    ? [-GARAGE_HALF_W + glassDepth / 2, glassY, 0]
    : [0, glassY, -GARAGE_HALF_D + glassDepth / 2];
  const glassArgs = isWest
    ? [glassDepth, glassH, glassSpanZ]
    : [glassSpanX, glassH, glassDepth];

  const frameX = isWest ? -GARAGE_HALF_W + frameDepth / 2 + 0.02 : null;
  const frameZ = isWest ? null : -GARAGE_HALF_D + frameDepth / 2 + 0.02;
  const mullionSpan = isWest ? glassSpanZ : glassSpanX;
  const mullionCount = isWest ? 4 : 3;

  return (
    <group>
      <mesh position={glassPos} renderOrder={1}>
        <boxGeometry args={glassArgs} />
        <meshStandardMaterial {...garageGlassProps(isGhost)} />
      </mesh>
      {Array.from({ length: mullionCount }, (_, i) => {
        const t = mullionCount === 1 ? 0 : (i / (mullionCount - 1) - 0.5) * mullionSpan;
        const pos = isWest
          ? [frameX, glassY, t]
          : [t, glassY, frameZ];
        const args = isWest
          ? [frameDepth, glassH, 0.09]
          : [0.09, glassH, frameDepth];
        return (
          <mesh key={`${face}-mullion-${i}`} position={pos} castShadow={castShadow}>
            <boxGeometry args={args} />
            <meshStandardMaterial {...garageFrameProps(isGhost)} />
          </mesh>
        );
      })}
      {GARAGE_DECK_LEVELS.map((dy) => {
        const pos = isWest
          ? [frameX, dy + 0.04, 0]
          : [0, dy + 0.04, frameZ];
        const args = isWest
          ? [frameDepth, 0.09, mullionSpan]
          : [mullionSpan, 0.09, frameDepth];
        return (
          <mesh key={`${face}-spandrel-${dy}`} position={pos} castShadow={castShadow}>
            <boxGeometry args={args} />
            <meshStandardMaterial {...garageFrameProps(isGhost)} />
          </mesh>
        );
      })}
    </group>
  );
};

const GarageCar = ({ x, y, z, color, isGhost, castShadow }) => (
  <group position={[x, y, z]}>
    <mesh castShadow={castShadow}>
      <boxGeometry args={[0.62, 0.26, 1.18]} />
      <meshStandardMaterial color={color} roughness={0.75} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.18, 0.08]} castShadow={castShadow}>
      <boxGeometry args={[0.52, 0.14, 0.55]} />
      <meshStandardMaterial color="#455a64" roughness={0.4} metalness={0.2} {...ghostProps(isGhost, 0.85)} />
    </mesh>
  </group>
);

/** 立体駐車場：中空＋西面ガラスで中が見える・3層デッキ */
const ParkingGarage = ({ isGhost, castShadow, lampIntensity = 0.5 }) => (
  <group position={[GARAGE_X, FLOOR_Y, 0.3]}>
    {/* 基礎スラブ */}
    <mesh position={[0, 0.04, 0]} receiveShadow={castShadow}>
      <boxGeometry args={[GARAGE_W, 0.08, GARAGE_D]} />
      <meshStandardMaterial color="#bdbdbd" roughness={0.92} {...ghostProps(isGhost)} />
    </mesh>

    {/* 東側背壁（コンクリート） */}
    <mesh position={[GARAGE_HALF_W - 0.06, GARAGE_H / 2, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.12, GARAGE_H, GARAGE_D]} />
      <meshStandardMaterial color="#e0e0e0" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>

    {/* 北端壁（奥） */}
    <mesh position={[0, GARAGE_H * 0.45, GARAGE_HALF_D - 0.06]} castShadow={castShadow}>
      <boxGeometry args={[GARAGE_W, GARAGE_H * 0.9, 0.12]} />
      <meshStandardMaterial color="#eceff1" roughness={0.88} {...ghostProps(isGhost)} />
    </mesh>

    {/* 西面ガラス（モール・駐車場間）＋南面ガラス（ららぽーと広場側） */}
    <GarageGlassFacade face="west" isGhost={isGhost} castShadow={castShadow} />
    <GarageGlassFacade face="south" isGhost={isGhost} castShadow={castShadow} />

    {/* 内部柱（ガラス面と同一平面に載せない） */}
    {[-2.0, -0.65, 0.65, 2.0].map((z) => (
      <mesh key={`pillar-${z}`} position={[0.28, GARAGE_H / 2, z]} castShadow={castShadow}>
        <boxGeometry args={[0.12, GARAGE_H * 0.86, 0.12]} />
        <meshStandardMaterial color="#9e9e9e" roughness={0.92} {...ghostProps(isGhost)} />
      </mesh>
    ))}

    {/* 各階デッキ＋車線・照明 */}
    {GARAGE_DECK_LEVELS.map((dy, i) => (
      <group key={`deck-${i}`} position={[0, dy, 0]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[GARAGE_W - 0.1, 0.08, GARAGE_D - 0.25]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.88} {...ghostProps(isGhost)} />
        </mesh>
        {[-2.4, -0.8, 0.8, 2.4].map((z) => (
          <mesh key={`lane-${i}-${z}`} position={[0, 0.05, z]} receiveShadow={castShadow}>
            <boxGeometry args={[1.1, 0.02, 0.06]} />
            <meshStandardMaterial color="#fdd835" roughness={0.88} {...ghostProps(isGhost, 0.9)} />
          </mesh>
        ))}
        {[-2.2, 0, 2.1].map((z, li) => (
          <mesh key={`ceiling-light-${i}-${z}`} position={[0.2, 0.28, z]}>
            <boxGeometry args={[0.55, 0.04, 0.18]} />
            <meshStandardMaterial
              color="#fff9c4"
              emissive="#fff59d"
              emissiveIntensity={lampIntensity * (i === 2 ? 0.35 : 0.65)}
              {...ghostProps(isGhost, 0.9)}
            />
          </mesh>
        ))}
      </group>
    ))}

    {/* スロープ（1階→2階） */}
    <mesh position={[0.25, 0.68, -2.85]} rotation={[0.18, 0, 0]} castShadow={castShadow} receiveShadow={castShadow}>
      <boxGeometry args={[0.9, 0.06, 2.4]} />
      <meshStandardMaterial color="#bdbdbd" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.55, 0.55, -2.85]} rotation={[0.18, 0, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.06, 0.35, 2.4]} />
      <meshStandardMaterial color="#eceff1" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>

    {/* 駐車車両（各階） */}
    {[
      { x: -0.15, y: 0.18, z: -1.5, c: '#eceff1' },
      { x: 0.2, y: 0.18, z: 0.2, c: '#cfd8dc' },
      { x: -0.1, y: 0.18, z: 2.5, c: '#b0bec5' },
      { x: 0.15, y: 0.83, z: -0.6, c: '#e0e0e0' },
      { x: -0.2, y: 0.83, z: 1.8, c: '#90a4ae' },
      { x: 0.1, y: 1.48, z: -2.0, c: '#cfd8dc' },
      { x: -0.15, y: 1.48, z: 0.9, c: '#eceff1' },
      { x: 0.2, y: 1.48, z: 2.6, c: '#b0bec5' },
    ].map((car, i) => (
      <GarageCar key={`garage-car-${i}`} x={car.x} y={car.y} z={car.z} color={car.c} isGhost={isGhost} castShadow={castShadow} />
    ))}

    {/* 精算機ブース */}
    <group position={[-0.35, 0.12, -3.15]}>
      <mesh castShadow={castShadow}>
        <boxGeometry args={[0.55, 0.85, 0.45]} />
        <meshStandardMaterial color="#fafafa" roughness={0.8} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, 0.55, 0.24]} castShadow={castShadow}>
        <boxGeometry args={[0.38, 0.28, 0.06]} />
        <meshStandardMaterial color="#37474f" roughness={0.5} {...ghostProps(isGhost)} />
      </mesh>
    </group>

    {/* 入口スロープ */}
    <mesh position={[0, ROAD_Y - FLOOR_Y, -3.65]} receiveShadow={castShadow}>
      <boxGeometry args={[1.4, 0.06, 0.4]} />
      <meshStandardMaterial color="#fdd835" roughness={0.88} {...ghostProps(isGhost)} />
    </mesh>

    {/* M 演出：奥の汚れエリア */}
    <mesh position={[0, ROAD_Y - FLOOR_Y + 0.01, 3.35]} receiveShadow={castShadow}>
      <boxGeometry args={[1.2, 0.02, 0.9]} />
      <meshStandardMaterial color="#bcaaa4" roughness={0.95} {...ghostProps(isGhost, 0.85)} />
    </mesh>
    <mesh position={[0.35, 0.12, 3.45]} castShadow={castShadow}>
      <boxGeometry args={[0.18, 0.1, 0.12]} />
      <meshStandardMaterial color="#757575" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

/** 裏側テナント（正面は入り口、東西ウイングは wing 内） */
const MALL_BACK_SHOPS = [
  { id: 'back-a', x: -2.1, z: 1.42, rotY: Math.PI, w: 1.05, floor: '#e8f5e9', accent: '#43a047', goods: ['#2e7d32', '#66bb6a'] },
  { id: 'back-b', x: 2.0, z: 1.42, rotY: Math.PI, w: 1.05, floor: '#fff3e0', accent: '#fb8c00', goods: ['#ef6c00', '#ffb74d'] },
];

const MALL_BACK_GLASS = [
  { x: -2.1, z: 1.94, axis: 'z', w: 1.1, h: MALL_FIRST_H * 0.78 },
  { x: 2.0, z: 1.94, axis: 'z', w: 1.1, h: MALL_FIRST_H * 0.78 },
];

const ENTRANCE_HALF_W = 1.85;
const ENTRANCE_H = 1.75;

const MallShopBay = ({ x, w, floor, accent, goods, depthZ, rotY = 0, isGhost, castShadow, windowGlow }) => (
  <group position={[x, FLOOR_Y, depthZ]} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.04, 0]} receiveShadow={castShadow}>
      <boxGeometry args={[w, 0.06, 0.85]} />
      <meshStandardMaterial color={floor} roughness={0.78} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.48, 0.38]} castShadow={castShadow}>
      <boxGeometry args={[w * 0.92, 0.82, 0.06]} />
      <meshStandardMaterial color={accent} roughness={0.72} {...ghostProps(isGhost, 0.92)} />
    </mesh>
    <mesh position={[-w * 0.42, 0.42, 0.05]} castShadow={castShadow}>
      <boxGeometry args={[0.05, 0.72, 0.7]} />
      <meshStandardMaterial color="#eceff1" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.28, -0.18]} castShadow={castShadow}>
      <boxGeometry args={[w * 0.72, 0.42, 0.22]} />
      <meshStandardMaterial color="#fafafa" roughness={0.65} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.52, -0.08]} castShadow={castShadow}>
      <boxGeometry args={[w * 0.55, 0.08, 0.12]} />
      <meshStandardMaterial color="#37474f" roughness={0.55} {...ghostProps(isGhost)} />
    </mesh>
    {goods.map((c, i) => (
      <mesh key={`goods-${x}-${i}`} position={[-0.18 + i * 0.18, 0.62 + (i % 2) * 0.12, 0.22]} castShadow={castShadow}>
        <boxGeometry args={[0.14, 0.12, 0.1]} />
        <meshStandardMaterial color={c} roughness={0.68} {...ghostProps(isGhost)} />
      </mesh>
    ))}
    <mesh position={[0, 0.78, 0.12]}>
      <boxGeometry args={[w * 0.65, 0.03, 0.04]} />
      <meshStandardMaterial
        color="#fff9c4"
        emissive="#fff59d"
        emissiveIntensity={windowGlow * 0.45}
        {...ghostProps(isGhost, 0.9)}
      />
    </mesh>
  </group>
);

const MallGlassPanel = ({
  x, y, z, axis = 'x', w, h, isGhost, windowGlow, opacity = 0.34,
}) => (
  <mesh position={[x, y, z]} renderOrder={2}>
    <boxGeometry args={axis === 'x' ? [0.05, h, w] : [w, h, 0.05]} />
    <meshStandardMaterial
      {...garageGlassProps(isGhost, opacity)}
      emissive="#b3e5fc"
      emissiveIntensity={windowGlow * 0.15}
    />
  </mesh>
);

const MallPerimeterInterior = ({ isGhost, castShadow, windowGlow }) => (
  <group>
    {MALL_BACK_SHOPS.map((shop) => (
      <MallShopBay
        key={shop.id}
        x={shop.x}
        w={shop.w}
        floor={shop.floor}
        accent={shop.accent}
        goods={shop.goods}
        depthZ={shop.z}
        rotY={shop.rotY}
        isGhost={isGhost}
        castShadow={castShadow}
        windowGlow={windowGlow}
      />
    ))}
  </group>
);

/** 正面入り口（モール幅 8.8m 内に収める） */
const MallFrontEntrance = ({ frontZ, isGhost, castShadow, windowGlow }) => {
  const wallZ = frontZ + 0.12;
  const flankWallW = MALL_HALF_W - ENTRANCE_HALF_W;
  const leftWallCenterX = -(ENTRANCE_HALF_W + MALL_HALF_W) / 2;
  const rightWallCenterX = (ENTRANCE_HALF_W + MALL_HALF_W) / 2;

  return (
    <group>
      <mesh position={[leftWallCenterX, MALL_FIRST_H / 2, wallZ]} castShadow={castShadow}>
        <boxGeometry args={[flankWallW, MALL_FIRST_H, 0.16]} />
        <meshStandardMaterial color={EARTH.wall} roughness={0.86} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[rightWallCenterX, MALL_FIRST_H / 2, wallZ]} castShadow={castShadow}>
        <boxGeometry args={[flankWallW, MALL_FIRST_H, 0.16]} />
        <meshStandardMaterial color={EARTH.wall} roughness={0.86} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, MALL_FIRST_H - 0.1, wallZ]} castShadow={castShadow}>
        <boxGeometry args={[ENTRANCE_HALF_W * 2 + 0.2, 0.28, 0.16]} />
        <meshStandardMaterial color={EARTH.wallDark} roughness={0.84} {...ghostProps(isGhost)} />
      </mesh>
      {[-ENTRANCE_HALF_W + 0.08, ENTRANCE_HALF_W - 0.08].map((px) => (
        <mesh key={`door-jamb-${px}`} position={[px, ENTRANCE_H / 2, wallZ + 0.02]} castShadow={castShadow}>
          <boxGeometry args={[0.14, ENTRANCE_H, 0.12]} />
          <meshStandardMaterial color={EARTH.trim} roughness={0.8} {...ghostProps(isGhost)} />
        </mesh>
      ))}
      <mesh position={[0, 0.06, frontZ + 0.42]} receiveShadow={castShadow} userData={WALK}>
        <boxGeometry args={[ENTRANCE_HALF_W * 1.7, 0.06, 0.55]} />
        <meshStandardMaterial color={EARTH.plaza} roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, 0.55, frontZ + 0.72]}>
        <boxGeometry args={[ENTRANCE_HALF_W * 1.35, 0.95, 0.45]} />
        <meshStandardMaterial color="#eceff1" roughness={0.9} transparent opacity={isGhost ? 0.35 : 0.55} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.85, frontZ + 0.55]} castShadow={castShadow}>
        <boxGeometry args={[ENTRANCE_HALF_W * 0.9, 0.35, 0.12]} />
        <meshStandardMaterial color="#fafafa" roughness={0.7} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, MALL_FIRST_H + 0.22, frontZ + 0.28]} castShadow={castShadow}>
        <boxGeometry args={[ENTRANCE_HALF_W * 2.1, 0.1, 0.85]} />
        <meshStandardMaterial color="#fafafa" roughness={0.72} {...ghostProps(isGhost)} />
      </mesh>
      {!isGhost && (
        <pointLight position={[0, 1.2, frontZ + 0.65]} distance={4} intensity={0.15 + windowGlow * 0.25} color="#fff8e1" />
      )}
    </group>
  );
};

const MALL_WING_SHOPS = [
  { z: -0.35, floor: '#fff8e1', accent: '#ff8f00', goods: ['#ff6f00', '#ffb300'] },
  { z: 0.85, floor: '#fce4ec', accent: '#d81b60', goods: ['#c2185b', '#f06292'] },
];

/** ウイング内テナント（回転なし・翼の内側座標に軸平行配置） */
const MallWingShopBay = ({
  centerX, centerZ, face, floor, accent, goods, isGhost, castShadow, windowGlow,
}) => {
  const isEast = face === 'east';
  const inward = isEast ? -1 : 1;
  const shopW = 0.88;
  const shopD = 0.68;
  const frontX = centerX + inward * 0.14;
  const backX = centerX - inward * 0.48;

  return (
    <group>
      <mesh position={[centerX, FLOOR_Y + 0.04, centerZ]} receiveShadow={castShadow}>
        <boxGeometry args={[shopW, 0.06, shopD]} />
        <meshStandardMaterial color={floor} roughness={0.78} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[backX, FLOOR_Y + 0.48, centerZ]} castShadow={castShadow}>
        <boxGeometry args={[0.06, 0.78, shopD * 0.88]} />
        <meshStandardMaterial color={accent} roughness={0.72} {...ghostProps(isGhost, 0.92)} />
      </mesh>
      <mesh position={[frontX, FLOOR_Y + 0.28, centerZ]} castShadow={castShadow}>
        <boxGeometry args={[0.2, 0.4, shopD * 0.62]} />
        <meshStandardMaterial color="#fafafa" roughness={0.65} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[frontX - inward * 0.06, FLOOR_Y + 0.5, centerZ]} castShadow={castShadow}>
        <boxGeometry args={[0.1, 0.08, shopD * 0.45]} />
        <meshStandardMaterial color="#37474f" roughness={0.55} {...ghostProps(isGhost)} />
      </mesh>
      {goods.map((c, i) => (
        <mesh
          key={`wing-goods-${centerZ}-${i}`}
          position={[backX - inward * 0.08, FLOOR_Y + 0.6 + (i % 2) * 0.1, centerZ - 0.12 + i * 0.22]}
          castShadow={castShadow}
        >
          <boxGeometry args={[0.12, 0.1, 0.08]} />
          <meshStandardMaterial color={c} roughness={0.68} {...ghostProps(isGhost)} />
        </mesh>
      ))}
      <mesh position={[centerX, FLOOR_Y + 0.76, centerZ]}>
        <boxGeometry args={[shopW * 0.55, 0.03, 0.35]} />
        <meshStandardMaterial
          color="#fff9c4"
          emissive="#fff59d"
          emissiveIntensity={windowGlow * 0.4}
          {...ghostProps(isGhost, 0.9)}
        />
      </mesh>
    </group>
  );
};

const MallWingInterior = ({
  outerX, innerX, centerZ, wingD, face, isGhost, castShadow, windowGlow,
}) => {
  const isEast = face === 'east';
  const shopCenterX = isEast
    ? outerX - 0.34 - 0.44
    : outerX + 0.34 + 0.44;
  const shopHalfD = 0.34;
  const zMin = centerZ - wingD / 2 + 0.22;
  const zMax = centerZ + wingD / 2 - 0.22;

  return (
    <group>
      {MALL_WING_SHOPS.map((bay) => {
        const shopZ = Math.min(zMax - shopHalfD, Math.max(zMin + shopHalfD, centerZ + bay.z));
        return (
          <MallWingShopBay
            key={`${face}-shop-${bay.z}`}
            centerX={shopCenterX}
            centerZ={shopZ}
            face={face}
            floor={bay.floor}
            accent={bay.accent}
            goods={bay.goods}
            isGhost={isGhost}
            castShadow={castShadow}
            windowGlow={windowGlow}
          />
        );
      })}
    </group>
  );
};

/** 東西ウイング共通：1階外周ガラス＋2階壁 */
const MallSideWing = ({ side, centerX, centerZ, wingW, wingD, isGhost, castShadow, windowGlow }) => {
  const isEast = side === 'east';
  const outerX = isEast ? centerX + wingW / 2 - 0.03 : centerX - wingW / 2 + 0.03;
  const innerX = isEast ? centerX - wingW / 2 + 0.06 : centerX + wingW / 2 - 0.06;
  const glassSpanZ = wingD - 0.28;

  return (
    <group>
      <mesh position={[innerX, MALL_BODY_Y, centerZ]} castShadow={castShadow}>
        <boxGeometry args={[0.12, MALL_H * 0.9, wingD]} />
        <meshStandardMaterial color={EARTH.wallDark} roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[centerX, MALL_BODY_Y, centerZ - wingD / 2 + 0.06]} castShadow={castShadow}>
        <boxGeometry args={[wingW, MALL_H * 0.9, 0.12]} />
        <meshStandardMaterial color={EARTH.wallDark} roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[centerX, MALL_BODY_Y, centerZ + wingD / 2 - 0.06]} castShadow={castShadow}>
        <boxGeometry args={[wingW, MALL_H * 0.9, 0.12]} />
        <meshStandardMaterial color={EARTH.wallDark} roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[centerX, MALL_FIRST_H + MALL_UPPER_H / 2, centerZ]} castShadow={castShadow}>
        <boxGeometry args={[wingW, MALL_UPPER_H, wingD]} />
        <meshStandardMaterial color={EARTH.wallDark} roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>
      {/* 1階：外周はガラスのみ（床スラブで壁代わりにしない） */}
      <mesh position={[outerX, MALL_FIRST_H / 2, centerZ]} renderOrder={2}>
        <boxGeometry args={[0.05, MALL_FIRST_H * 0.9, glassSpanZ]} />
        <meshStandardMaterial
          {...garageGlassProps(isGhost, 0.38)}
          emissive="#b3e5fc"
          emissiveIntensity={windowGlow * 0.2}
        />
      </mesh>
      <MallWingInterior
        outerX={outerX}
        innerX={innerX}
        centerZ={centerZ}
        wingD={wingD}
        face={side}
        isGhost={isGhost}
        castShadow={castShadow}
        windowGlow={windowGlow}
      />
    </group>
  );
};

const LalaportSign = ({ isGhost, castShadow }) => (
  <group position={[0, 2.05, -2.05]}>
    <mesh castShadow={castShadow}>
      <boxGeometry args={[4.6, 0.42, 0.14]} />
      <meshStandardMaterial color={EARTH.lalaOrange} roughness={0.48} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0, 0.08]} castShadow={castShadow}>
      <boxGeometry args={[3.5, 0.22, 0.04]} />
      <meshStandardMaterial color="#fff8e1" roughness={0.6} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[-1.35, 0, 0.09]} castShadow={castShadow}>
      <boxGeometry args={[0.5, 0.32, 0.03]} />
      <meshStandardMaterial color="#ffcc80" roughness={0.5} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const MallMainBuilding = ({ isGhost, castShadow, windowGlow }) => {
  const baseZ = 2.15;
  const frontZ = MALL_FRONT_Z;
  const upperY = MALL_FIRST_H + MALL_UPPER_H / 2;
  const eastWingX = 3.55;
  const eastWingZ = 0.55;
  const eastWingW = 2.5;
  const eastWingD = 2.55;

  return (
    <group position={[0, FLOOR_Y, baseZ]}>
      {/* 奥側躯体（1階正面は空けてガラス＋店内が見える） */}
      <mesh position={[0, MALL_BODY_Y, 0.95]} castShadow={castShadow} receiveShadow={castShadow}>
        <boxGeometry args={[8.8, MALL_H, 1.95]} />
        <meshStandardMaterial color={EARTH.wall} roughness={0.86} {...ghostProps(isGhost)} />
      </mesh>

      {/* 2階フロアスラブ（モール幅内） */}
      <mesh position={[0, MALL_FIRST_H + 0.03, -0.35]} castShadow={castShadow}>
        <boxGeometry args={[MALL_BODY_W, 0.08, 2.35]} />
        <meshStandardMaterial color={EARTH.wallDark} roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>

      <MallSideWing
        side="east"
        centerX={eastWingX}
        centerZ={eastWingZ}
        wingW={eastWingW}
        wingD={eastWingD}
        isGhost={isGhost}
        castShadow={castShadow}
        windowGlow={windowGlow}
      />
      <MallSideWing
        side="west"
        centerX={-3.75}
        centerZ={0.15}
        wingW={2.1}
        wingD={2.15}
        isGhost={isGhost}
        castShadow={castShadow}
        windowGlow={windowGlow}
      />

      <MallFrontEntrance
        frontZ={frontZ}
        isGhost={isGhost}
        castShadow={castShadow}
        windowGlow={windowGlow}
      />

      {/* 裏側壁（ガラス開口部のみ） */}
      <mesh position={[0, MALL_FIRST_H / 2, 1.88]} castShadow={castShadow}>
        <boxGeometry args={[5.4, MALL_FIRST_H, 0.12]} />
        <meshStandardMaterial color={EARTH.wallDark} roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>

      {MALL_BACK_GLASS.map((panel) => (
        <MallGlassPanel
          key={`side-glass-${panel.x}-${panel.z}`}
          x={panel.x}
          y={MALL_FIRST_H / 2}
          z={panel.z}
          axis={panel.axis}
          w={panel.w}
          h={panel.h}
          isGhost={isGhost}
          windowGlow={windowGlow}
        />
      ))}
      <MallPerimeterInterior
        isGhost={isGhost}
        castShadow={castShadow}
        windowGlow={windowGlow}
      />

      {/* 2階正面：単一面の壁＋窓（モール幅内） */}
      <mesh position={[0, upperY, frontZ + 0.13]} castShadow={castShadow}>
        <boxGeometry args={[MALL_BODY_W - 0.3, MALL_UPPER_H * 0.94, 0.14]} />
        <meshStandardMaterial color={EARTH.wallDark} roughness={0.84} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, MALL_FIRST_H + 0.04, frontZ + 0.14]} castShadow={castShadow}>
        <boxGeometry args={[MALL_BODY_W - 0.4, 0.1, 0.12]} />
        <meshStandardMaterial color={EARTH.trim} roughness={0.8} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, upperY, frontZ + 0.22]} renderOrder={2}>
        <boxGeometry args={[3.0, MALL_UPPER_H * 0.58, 0.04]} />
        <meshStandardMaterial
          {...garageGlassProps(isGhost, 0.42)}
          emissive="#b3e5fc"
          emissiveIntensity={windowGlow * 0.4}
        />
      </mesh>
      {[-3.05, -1.35, 1.35, 3.05].map((wx) => (
        <mesh key={`upper-win-${wx}`} position={[wx, upperY, frontZ + 0.21]} renderOrder={2}>
          <boxGeometry args={[0.72, MALL_UPPER_H * 0.42, 0.035]} />
          <meshStandardMaterial
            color="#455a64"
            emissive="#90caf9"
            emissiveIntensity={windowGlow * 0.18}
            roughness={0.3}
            metalness={0.3}
            depthWrite={false}
            transparent
            opacity={isGhost ? 0.55 : 0.82}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.08, -1.55]} receiveShadow={castShadow} userData={WALK}>
        <boxGeometry args={[4.5, 0.06, 1.2]} />
        <meshStandardMaterial color={EARTH.plaza} roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>

      <TenantSignRow frontZ={frontZ} isGhost={isGhost} castShadow={castShadow} />
      <FoodCourtSign isGhost={isGhost} castShadow={castShadow} />
      <LalaportSign isGhost={isGhost} castShadow={castShadow} />

      <group position={[0, MALL_H + 0.1, 0.2]}>
        <mesh position={[0, 0, 0.45]} castShadow={castShadow}>
          <boxGeometry args={[5.5, 0.1, 1.45]} />
          <meshStandardMaterial color={EARTH.green} roughness={0.85} {...ghostProps(isGhost)} />
        </mesh>
        {[-2.2, -0.8, 0.6, 2.0].map((gx) => (
          <mesh key={`garden-box-${gx}`} position={[gx, 0.12, 0.15]} castShadow={castShadow}>
            <boxGeometry args={[0.75, 0.18, 0.55]} />
            <meshStandardMaterial color="#689f38" roughness={0.82} {...ghostProps(isGhost)} />
          </mesh>
        ))}
        {[-2.8, -1.6, -0.8, 0, 0.8, 1.6, 2.8].map((sx) => (
          <mesh key={`solar-${sx}`} position={[sx, 0.05, -0.35]} castShadow={castShadow}>
            <boxGeometry args={[0.55, 0.04, 0.75]} />
            <meshStandardMaterial color={EARTH.solar} roughness={0.4} metalness={0.35} {...ghostProps(isGhost)} />
          </mesh>
        ))}
        <group position={[3.1, 0.25, -0.5]}>
          <mesh position={[0, 0.45, 0]} castShadow={castShadow}>
            <cylinderGeometry args={[0.035, 0.045, 0.85, 8]} />
            <meshStandardMaterial color="#cfd8dc" metalness={0.4} {...ghostProps(isGhost)} />
          </mesh>
          <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow={castShadow}>
            <boxGeometry args={[0.55, 0.03, 0.06]} />
            <meshStandardMaterial color="#eceff1" roughness={0.6} {...ghostProps(isGhost)} />
          </mesh>
        </group>
      </group>

      {!isGhost && (
        <pointLight position={[0, 1.5, -2.5]} distance={8} intensity={windowGlow * 0.4} color="#fff8e1" />
      )}
    </group>
  );
};

/** 柏の葉キャンパス駅→モール：屋根付き歩道＋バス乗り場 */
const StationApproach = ({ isGhost, castShadow }) => (
  <group position={[-3.85, FLOOR_Y, -1.85]}>
    {[-0.35, 0.85].map((px) => (
      <mesh key={`cover-col-${px}`} position={[px, 0.95, 0.35]} castShadow={castShadow}>
        <boxGeometry args={[0.12, 1.9, 0.12]} />
        <meshStandardMaterial color="#fafafa" roughness={0.75} metalness={0.1} {...ghostProps(isGhost)} />
      </mesh>
    ))}
    <mesh position={[0.25, 1.85, 0.55]} castShadow={castShadow}>
      <boxGeometry args={[1.75, 0.08, 2.1]} />
      <meshStandardMaterial color="#f5f5f5" roughness={0.7} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.55, 0.08, 0.55]} receiveShadow={castShadow} userData={WALK}>
      <boxGeometry args={[1.05, 0.05, 2.0]} />
      <meshStandardMaterial color="#bdbdbd" roughness={0.88} {...ghostProps(isGhost)} />
    </mesh>
    <group position={[-0.15, 0, -0.55]}>
      <mesh position={[0, 0.55, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.1, 1.1, 0.1]} />
        <meshStandardMaterial color={EARTH.trim} {...ghostProps(isGhost)} />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow={castShadow}>
        <boxGeometry args={[0.5, 0.32, 0.05]} />
        <meshStandardMaterial color="#1565c0" roughness={0.65} {...ghostProps(isGhost)} />
      </mesh>
    </group>
    <mesh position={[0.9, ROAD_Y - FLOOR_Y + 0.01, -0.15]} receiveShadow={castShadow}>
      <boxGeometry args={[0.7, 0.015, 1.2]} />
      <meshStandardMaterial color="#fdd835" roughness={0.88} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

/** 入口の点字ブロック（P 演出の土台） */
const TactileEntrance = ({ isGhost, castShadow }) => (
  <mesh position={[0, PLAZA_Y + 0.003, 0.95]} receiveShadow={castShadow} userData={WALK}>
    <boxGeometry args={[3.2, 0.04, 0.35]} />
    <meshStandardMaterial color="#fdd835" roughness={0.88} {...ghostProps(isGhost)} />
  </mesh>
);

/** イベント広場（R：日陰・座席が少ない開放空間） */
const EventPlaza = ({ isGhost, castShadow }) => (
  <group position={[0, FLOOR_Y, -2.15]}>
    <mesh position={[0, 0.06, 0]} receiveShadow={castShadow} userData={WALK}>
      <boxGeometry args={[3.8, 0.1, 1.6]} />
      <meshStandardMaterial color={EARTH.plazaAlt} roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, 0.22, 0]} castShadow={castShadow}>
      <boxGeometry args={[2.2, 0.12, 0.8]} />
      <meshStandardMaterial color="#e0e0e0" roughness={0.8} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const StreetLamp = ({ x, z, isGhost, castShadow, lampIntensity }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 0.85, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.09, 1.7, 0.09]} />
      <meshStandardMaterial color="#455a64" metalness={0.35} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.12, 1.75, 0]}>
      <boxGeometry args={[0.38, 0.08, 0.12]} />
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
 * 商業施設：柏の葉ららぽーと風（低く横長・needType 演出土台あり・店内は作らない）
 * 主軸 Z（-Z 手前＝駅前広場、+Z 奥＝モール本体）
 */
export const renderCommerceLayout = ({
  isGhost, meshPosition, meshRotation, handlers, castShadow, isBuilding, nightFactor,
}) => {
  const lampIntensity = isGhost ? 0.35 : (0.5 + nightFactor * 0.8);
  const windowGlow = isGhost ? 0.2 : (0.5 + nightFactor * 0.85);

  return (
    <group position={meshPosition} rotation={meshRotation} {...interactionProps(handlers)}>
      {buildEndEntryMeshes(-4.8, isGhost, castShadow)}
      {buildEndEntryMeshes(4.8, isGhost, castShadow)}

      <WalkFloor args={[10, 0.05, 9]} position={[0, FLOOR_Y - 0.02, 0]} isGhost={isGhost} castShadow={castShadow} color="#a8c686" />
      {PLAZA_PATHS.map((path, i) => (
        <WalkFloor
          key={`plaza-${i}`}
          args={path.args}
          position={path.pos}
          isGhost={isGhost}
          castShadow={castShadow}
          color={path.color}
        />
      ))}

      <EventPlaza isGhost={isGhost} castShadow={castShadow} />
      <TactileEntrance isGhost={isGhost} castShadow={castShadow} />
      <MallMainBuilding isGhost={isGhost} castShadow={castShadow} windowGlow={windowGlow} />
      <CartRack isGhost={isGhost} castShadow={castShadow} />
      <WalkFloor
        args={[0.55, 0.05, 2.6]}
        position={[5.12, FLOOR_Y, 1.85]}
        isGhost={isGhost}
        castShadow={castShadow}
        color={EARTH.plazaAlt}
      />
      <ParkingGarage isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity} />
      <StationApproach isGhost={isGhost} castShadow={castShadow} />
      <PlazaForkSigns isGhost={isGhost} castShadow={castShadow} />

      <Tree x={-3.5} z={-3.0} isGhost={isGhost} castShadow={castShadow} />
      <Tree x={3.2} z={-2.8} scale={0.9} isGhost={isGhost} castShadow={castShadow} />
      <Tree x={-2.5} z={1.2} scale={0.85} isGhost={isGhost} castShadow={castShadow} />

      <DirectoryPylon isGhost={isGhost} castShadow={castShadow} />
      <Bench x={3.0} z={-2.4} rot={-0.2} isGhost={isGhost} castShadow={castShadow} />
      <StreetLamp x={-3.5} z={-0.5} isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity} />

      {!isGhost && !isBuilding && (
        <>
          <pointLight position={[0, 2.2, 1.5]} distance={9} intensity={0.2 + nightFactor * 0.45} color="#fff8e1" />
          <pointLight position={[0, 1.8, 2.5]} distance={7} intensity={0.14 + nightFactor * 0.32} color="#ffe0b2" />
          <pointLight position={[GARAGE_X, 1.2, 3.4]} distance={3.5} intensity={0.03 + nightFactor * 0.08} color="#90a4ae" />
        </>
      )}
    </group>
  );
};

export const COMMERCE_SHAPE_IDS = ['commerce_layout'];

export const isCommerceShape = (shape) => COMMERCE_SHAPE_IDS.includes(shape);

export const getCommerceMeshPosition = (shape) => (
  COMMERCE_SHAPE_IDS.includes(shape) ? [0, -0.24, 0] : [0, 0, 0]
);

export const getCommerceWalkColliders = (shape, sx, sy, sz) => {
  if (shape === 'commerce_layout') {
    return (
      <>
        {buildEndEntryColliders(-4.8, sx, sy, sz)}
        {buildEndEntryColliders(4.8, sx, sy, sz)}
        {PLAZA_PATHS.map((path, i) => (
          <CuboidCollider
            key={`commerce-plaza-${i}`}
            args={[(path.args[0] * 0.5) * sx, 0.04 * sy, (path.args[2] * 0.5) * sz]}
            position={[path.pos[0] * sx, colliderY(FLOOR_Y) * sy, path.pos[2] * sz]}
          />
        ))}
        <CuboidCollider args={[2.2 * sx, 0.04, 0.55 * sz]} position={[0, colliderY(FLOOR_Y) * sy, 0.65 * sz]} />
        <CuboidCollider args={[4.35 * sx, MALL_BODY_Y * sy, 1.85 * sz]} position={[0, colliderY(MALL_BODY_Y) * sy, 2.15 * sz]} />
        <CuboidCollider args={[1.2 * sx, MALL_BODY_Y * 0.9 * sy, 1.05 * sz]} position={[3.55 * sx, colliderY(MALL_BODY_Y) * sy, 2.7 * sz]} />
        <CuboidCollider args={[1.0 * sx, MALL_BODY_Y * 0.9 * sy, 1.0 * sz]} position={[-3.75 * sx, colliderY(MALL_BODY_Y) * sy, 2.3 * sz]} />
        <CuboidCollider args={[0.8 * sx, 1.05 * sy, 3.85 * sz]} position={[GARAGE_X * sx, colliderY(1.05) * sy, 0.3 * sz]} />
        <CuboidCollider args={[0.25 * sx, 0.04, 1.25 * sz]} position={[5.12 * sx, colliderY(FLOOR_Y) * sy, 1.85 * sz]} />
        <CuboidCollider args={[0.15 * sx, 0.85 * sy, 0.15 * sz]} position={[1.2 * sx, colliderY(0.85) * sy, -0.35 * sz]} />
        <CuboidCollider args={[0.15 * sx, 0.85 * sy, 0.15 * sz]} position={[-3.5 * sx, colliderY(0.85) * sy, -0.5 * sz]} />
        <CuboidCollider args={[1.85 * sx, 0.04, 0.75 * sz]} position={[0, colliderY(FLOOR_Y) * sy, -2.15 * sz]} />
        <CuboidCollider args={[0.55 * sx, 0.04, 0.9 * sz]} position={[-3.2 * sx, colliderY(FLOOR_Y) * sy, -1.85 * sz]} />
      </>
    );
  }
  return null;
};

export const getCommerceCollider = (shape, sx, sy, sz) => getCommerceWalkColliders(shape, sx, sy, sz);
