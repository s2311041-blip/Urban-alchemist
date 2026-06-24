import React from 'react';
import { CuboidCollider } from '@react-three/rapier';
import { PALETTE, ZONE_LIGHTS } from '../../../constants/artDirection';
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

/** 主軸 Z。路地幅は狭く、両側に奥行きのある家屋が並ぶ */
const ALLEY_LEN = 11;
const ROAD_HALF_W = 0.85;
const LEFT_FACADE_X = -1.72;
const RIGHT_FACADE_X = 1.72;

const TONES = {
  wood: { body: '#BCAAA4', trim: PALETTE.buildingTrim, roof: '#8D6E63' },
  plaster: { body: PALETTE.buildingPlaster, trim: PALETTE.buildingTrim, roof: PALETTE.buildingRoof },
  concrete: { body: '#CFD8DC', trim: PALETTE.stone, roof: '#B0BEC5' },
  aged: { body: PALETTE.buildingWarm, trim: PALETTE.buildingTrim, roof: PALETTE.buildingRoof },
};

const LEFT_BUILDINGS = [
  {
    id: 'l1', z: 3.6, len: 2.8, h: 3.4, depth: 2.55, tone: 'wood', eave: 0.24,
    windows: [{ dz: -0.35, dy: 2.05, ww: 0.4, wh: 0.5 }, { dz: 0.45, dy: 1.0, ww: 0.36, wh: 0.42 }],
    ac: { dz: 0.55, dy: 2.35 }, pipeZ: -0.75,
  },
  {
    id: 'l2', z: 0.35, len: 2.35, h: 2.9, depth: 2.15, tone: 'aged', eave: 0.18,
    door: { dz: 0.05, dh: 1.08 }, windows: [{ dz: -0.4, dy: 1.65, ww: 0.34, wh: 0.38 }],
    meter: { dz: 0.48, dy: 0.58 }, upperLen: 1.6, upperH: 1.2,
  },
  {
    id: 'l3', z: -2.85, len: 3.2, h: 3.6, depth: 2.75, tone: 'concrete', eave: 0.2,
    windows: [{ dz: 0.2, dy: 2.1, ww: 0.38, wh: 0.46 }, { dz: -0.35, dy: 1.05, ww: 0.32, wh: 0.36 }],
    externalStairs: true, waterHeater: { dz: -0.5, dy: 3.05 },
  },
];

const RIGHT_BUILDINGS = [
  {
    id: 'r1', z: 3.1, len: 2.9, h: 3.2, depth: 2.45, tone: 'plaster', eave: 0.22,
    windows: [{ dz: -0.3, dy: 1.95, ww: 0.38, wh: 0.44 }, { dz: 0.4, dy: 1.0, ww: 0.34, wh: 0.4 }],
    pipeZ: 0.65, laundry: { dz: 0.15, dy: 1.45 },
  },
  {
    id: 'r2', z: -0.15, len: 2.5, h: 2.85, depth: 2.25, tone: 'wood', eave: 0.2,
    door: { dz: -0.12, dh: 1.02 },
    windows: [{ dz: 0.42, dy: 1.55, ww: 0.32, wh: 0.36 }],
    ac: { dz: 0.35, dy: 2.0 }, tileBase: true,
  },
  {
    id: 'r3', z: -3.55, len: 2.7, h: 3.05, depth: 2.5, tone: 'concrete', eave: 0.18,
    windows: [{ dz: 0.05, dy: 1.8, ww: 0.36, wh: 0.42 }],
    meter: { dz: -0.38, dy: 0.52 }, propane: { dz: 0.35, dy: 0.35 },
  },
];

const buildEndEntryMeshes = (zStart, isGhost, castShadow) => (
  Array.from({ length: 3 }, (_, i) => (
    <mesh
      key={`lane-entry-${zStart}-${i}`}
      position={[0, 0.03 + 0.05 * (i + 0.5), zStart + (zStart < 0 ? 0.28 * i : -0.28 * i)]}
      receiveShadow={castShadow}
      userData={WALK}
    >
      <boxGeometry args={[1.3, 0.05, 0.28]} />
      <meshStandardMaterial color="#bdbdbd" roughness={0.82} {...ghostProps(isGhost)} />
    </mesh>
  ))
);

const buildEndEntryColliders = (zStart, sx, sy, sz) => (
  Array.from({ length: 3 }, (_, i) => (
    <CuboidCollider
      key={`lane-entry-col-${zStart}-${i}`}
      args={[0.6 * sx, 0.025, 0.12 * sz]}
      position={[
        0,
        colliderY(0.03 + 0.05 * (i + 0.5)) * sy,
        (zStart + (zStart < 0 ? 0.28 * i : -0.28 * i)) * sz,
      ]}
    />
  ))
);

const FacadeDetail = ({
  facing, facadeLocalX, windows = [], door, ac, pipeZ, meter, laundry, tileBase,
  waterHeater, externalStairs, propane, len, h, isGhost, castShadow, windowGlow, palette,
}) => (
  <>
    {tileBase && (
      <mesh position={[facadeLocalX + facing * 0.02, 0.34, 0]} receiveShadow={castShadow}>
        <boxGeometry args={[0.03, 0.66, len * 0.9]} />
        <meshStandardMaterial color="#8d8d8d" roughness={0.95} {...ghostProps(isGhost)} />
      </mesh>
    )}
    <mesh position={[facadeLocalX + facing * 0.02, 0.15, 0]} receiveShadow={castShadow}>
      <boxGeometry args={[0.03, 0.28, len * 0.94]} />
      <meshStandardMaterial color={palette.trim} roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>

    {windows.map((win, i) => (
      <group key={`win-${i}`} position={[facadeLocalX + facing * 0.05, win.dy, win.dz]}>
        <mesh>
          <boxGeometry args={[0.05, win.wh, win.ww]} />
          <meshStandardMaterial color="#2c3540" roughness={0.35} metalness={0.2} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[facing * 0.025, 0, 0]}>
          <boxGeometry args={[0.01, win.wh * 0.88, 0.025]} />
          <meshStandardMaterial color="#cfd8dc" roughness={0.55} {...ghostProps(isGhost, 0.9)} />
        </mesh>
        {windowGlow > 0.2 && (
          <mesh position={[facing * 0.03, 0, 0]}>
            <boxGeometry args={[0.012, win.wh * 0.72, win.ww * 0.82]} />
            <meshStandardMaterial
              color="#fff8e1"
              emissive="#ffcc80"
              emissiveIntensity={windowGlow * 0.4}
              {...ghostProps(isGhost, 0.75)}
            />
          </mesh>
        )}
      </group>
    ))}

    {door && (
      <group position={[facadeLocalX + facing * 0.05, door.dh * 0.5, door.dz]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[0.06, door.dh, 0.64]} />
          <meshStandardMaterial color="#4e342e" roughness={0.88} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[0, door.dh * 0.5 + 0.04, 0.3]}>
          <boxGeometry args={[0.04, 0.08, 0.04]} />
          <meshStandardMaterial color={palette.trim} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[facing * 0.035, 0, 0.24]}>
          <boxGeometry args={[0.025, door.dh + 0.1, 0.05]} />
          <meshStandardMaterial color="#5d4037" roughness={0.9} {...ghostProps(isGhost)} />
        </mesh>
      </group>
    )}

    {ac && (
      <group position={[facadeLocalX + facing * 0.22, ac.dy, ac.dz]}>
        <mesh castShadow={castShadow}>
          <boxGeometry args={[0.24, 0.3, 0.44]} />
          <meshStandardMaterial color="#cfd8dc" metalness={0.3} roughness={0.5} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[facing * 0.13, -0.06, 0]}>
          <boxGeometry args={[0.05, 0.07, 0.34]} />
          <meshStandardMaterial color="#90a4ae" {...ghostProps(isGhost)} />
        </mesh>
      </group>
    )}

    {pipeZ != null && (
      <mesh position={[facadeLocalX + facing * 0.1, h * 0.48, pipeZ]} castShadow={castShadow}>
        <boxGeometry args={[0.06, h * 0.9, 0.06]} />
        <meshStandardMaterial color="#78909c" metalness={0.4} roughness={0.4} {...ghostProps(isGhost)} />
      </mesh>
    )}

    {meter && (
      <mesh position={[facadeLocalX + facing * 0.12, meter.dy, meter.dz]} castShadow={castShadow}>
        <boxGeometry args={[0.14, 0.24, 0.2]} />
        <meshStandardMaterial color="#eceff1" roughness={0.7} {...ghostProps(isGhost)} />
      </mesh>
    )}

    {laundry && (
      <group position={[facadeLocalX + facing * 0.16, laundry.dy, laundry.dz]}>
        <mesh position={[0, 0, -0.3]} castShadow={castShadow}>
          <boxGeometry args={[0.04, 0.04, 0.6]} />
          <meshStandardMaterial color="#b0bec5" metalness={0.45} {...ghostProps(isGhost)} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.025, 0.14, 0.38]} />
          <meshStandardMaterial color="#fafafa" roughness={0.95} {...ghostProps(isGhost, 0.88)} />
        </mesh>
      </group>
    )}

    {waterHeater && (
      <group position={[facadeLocalX + facing * 0.18, waterHeater.dy, waterHeater.dz]}>
        <mesh castShadow={castShadow}>
          <cylinderGeometry args={[0.14, 0.14, 0.55, 10]} />
          <meshStandardMaterial color="#cfd8dc" metalness={0.35} roughness={0.55} {...ghostProps(isGhost)} />
        </mesh>
      </group>
    )}

    {externalStairs && (
      <group position={[facadeLocalX + facing * 0.14, 0.9, -len * 0.28]}>
        {[0, 0.45, 0.9].map((dy, i) => (
          <mesh key={`stair-${i}`} position={[facing * 0.08 * i, dy, -0.18 * i]} castShadow={castShadow}>
            <boxGeometry args={[0.55, 0.05, 0.32]} />
            <meshStandardMaterial color="#78909c" metalness={0.35} roughness={0.5} {...ghostProps(isGhost)} />
          </mesh>
        ))}
        <mesh position={[facing * 0.2, 1.15, -0.42]} castShadow={castShadow}>
          <boxGeometry args={[0.04, 1.3, 0.04]} />
          <meshStandardMaterial color="#607d8b" metalness={0.4} {...ghostProps(isGhost)} />
        </mesh>
      </group>
    )}

    {propane && (
      <group position={[facadeLocalX + facing * 0.14, propane.dy, propane.dz]}>
        <mesh castShadow={castShadow}>
          <cylinderGeometry args={[0.1, 0.1, 0.42, 10]} />
          <meshStandardMaterial color="#eceff1" metalness={0.5} roughness={0.35} {...ghostProps(isGhost)} />
        </mesh>
      </group>
    )}
  </>
);

const HouseBlock = ({
  side, z, len, h, depth, tone, eave = 0.18, upperLen, upperH,
  isGhost, castShadow, windowGlow, ...facade
}) => {
  const palette = TONES[tone] ?? TONES.plaster;
  const facadeX = side === 'left' ? LEFT_FACADE_X : RIGHT_FACADE_X;
  const centerX = side === 'left' ? facadeX - depth / 2 : facadeX + depth / 2;
  const facing = side === 'left' ? 1 : -1;
  const facadeLocalX = facing * (depth / 2);

  return (
    <group position={[centerX, FLOOR_Y, z]}>
      <mesh position={[0, h * 0.5, 0]} castShadow={castShadow} receiveShadow={castShadow}>
        <boxGeometry args={[depth, h, len]} />
        <meshStandardMaterial color={palette.body} roughness={0.9} {...ghostProps(isGhost)} />
      </mesh>

      {upperLen && upperH && (
        <mesh position={[facing * (-depth * 0.12), h + upperH * 0.5 - 0.05, 0]} castShadow={castShadow}>
          <boxGeometry args={[depth * 0.72, upperH, upperLen]} />
          <meshStandardMaterial color={palette.body} roughness={0.88} {...ghostProps(isGhost, 0.96)} />
        </mesh>
      )}

      <mesh position={[0, h + 0.1, 0]} castShadow={castShadow}>
        <boxGeometry args={[depth + 0.08, 0.16, len + 0.12]} />
        <meshStandardMaterial color={palette.roof} roughness={0.85} {...ghostProps(isGhost)} />
      </mesh>

      <mesh position={[facadeLocalX + facing * (eave * 0.45), h + 0.04, 0]} castShadow={castShadow}>
        <boxGeometry args={[eave, 0.1, len + 0.16]} />
        <meshStandardMaterial color={palette.trim} roughness={0.82} {...ghostProps(isGhost)} />
      </mesh>

      <mesh position={[0, h * 0.5, len * 0.5 + 0.04]} castShadow={castShadow}>
        <boxGeometry args={[depth * 0.92, h * 0.98, 0.08]} />
        <meshStandardMaterial color="#8d8378" roughness={0.92} {...ghostProps(isGhost, 0.9)} />
      </mesh>

      <FacadeDetail
        facing={facing}
        facadeLocalX={facadeLocalX}
        len={len}
        h={h}
        isGhost={isGhost}
        castShadow={castShadow}
        windowGlow={windowGlow}
        palette={palette}
        {...facade}
      />
    </group>
  );
};

const AlleyGap = ({ side, z, isGhost }) => {
  const x = side === 'left' ? LEFT_FACADE_X - 0.55 : RIGHT_FACADE_X + 0.55;
  return (
    <mesh position={[x, FLOOR_Y + 1.2, z]}>
      <boxGeometry args={[0.35, 2.4, 0.42]} />
      <meshStandardMaterial color="#1a1a1a" roughness={1} {...ghostProps(isGhost, 0.85)} />
    </mesh>
  );
};

const AlleyCurbs = ({ isGhost, castShadow, roadHalfW = ROAD_HALF_W }) => (
  <>
    {[-1, 1].map((sign) => (
      <mesh key={`curb-${sign}`} position={[sign * (roadHalfW + 0.06), ROAD_Y + 0.05, 0]} receiveShadow={castShadow}>
        <boxGeometry args={[0.1, 0.1, ALLEY_LEN - 0.6]} />
        <meshStandardMaterial color="#9e9e9e" roughness={0.92} {...ghostProps(isGhost)} />
      </mesh>
    ))}
  </>
);

const DeadEndWall = ({ isGhost, castShadow }) => (
  <group position={[0, FLOOR_Y, 5.35]}>
    <mesh position={[0, 1.75, 0]} castShadow={castShadow} receiveShadow={castShadow}>
      <boxGeometry args={[4.6, 3.5, 0.22]} />
      <meshStandardMaterial color="#a69b8c" roughness={0.92} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[-1.55, 2.4, 0.12]} castShadow={castShadow}>
      <boxGeometry args={[1.2, 0.9, 0.08]} />
      <meshStandardMaterial color="#3e4a59" {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[1.4, 1.3, 0.12]} castShadow={castShadow}>
      <boxGeometry args={[0.55, 1.05, 0.64]} />
      <meshStandardMaterial color="#4e342e" roughness={0.88} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.3, 0.45, 0.14]}>
      <boxGeometry args={[0.42, 0.32, 0.38]} />
      <meshStandardMaterial color="#78909c" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
  </group>
);

const GroundClutter = ({ isGhost, castShadow }) => (
  <>
    <mesh position={[0.35, FLOOR_Y + 0.06, -1.2]} castShadow={castShadow}>
      <boxGeometry args={[0.32, 0.12, 0.28]} />
      <meshStandardMaterial color="#8d6e63" roughness={0.9} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[-0.45, FLOOR_Y + 0.1, 1.8]} castShadow={castShadow}>
      <boxGeometry args={[0.24, 0.2, 0.24]} />
      <meshStandardMaterial color="#6d4c41" roughness={0.88} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.55, FLOOR_Y + 0.04, 2.6]} castShadow={castShadow}>
      <boxGeometry args={[0.38, 0.08, 0.3]} />
      <meshStandardMaterial color="#546e7a" roughness={0.85} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0, ROAD_Y + 0.045, -0.5]} receiveShadow={castShadow}>
      <boxGeometry args={[0.22, 0.01, 0.35]} />
      <meshStandardMaterial color="#616161" metalness={0.4} roughness={0.5} {...ghostProps(isGhost, 0.8)} />
    </mesh>
  </>
);

const OverheadWires = ({ isGhost }) => (
  <>
    {[-2.5, 0, 2.8, 4.5].map((z) => (
      <mesh key={`wire-${z}`} position={[0, 3.45, z]}>
        <boxGeometry args={[3.5, 0.015, 0.015]} />
        <meshStandardMaterial color="#37474f" {...ghostProps(isGhost, 0.55)} />
      </mesh>
    ))}
    {[-1.2, 1.5].map((z, i) => (
      <mesh key={`wire-diag-${i}`} position={[0, 3.55, z]} rotation={[0, 0, i === 0 ? 0.15 : -0.12]}>
        <boxGeometry args={[3.2, 0.012, 0.012]} />
        <meshStandardMaterial color="#455a64" {...ghostProps(isGhost, 0.5)} />
      </mesh>
    ))}
  </>
);

const StreetLamp = ({ x, z, isGhost, castShadow, lampIntensity }) => (
  <group position={[x, FLOOR_Y, z]}>
    <mesh position={[0, 1.5, 0]} castShadow={castShadow}>
      <boxGeometry args={[0.08, 3, 0.08]} />
      <meshStandardMaterial color="#455a64" metalness={0.4} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[0.55, 2.85, 0]} castShadow={castShadow}>
      <boxGeometry args={[1.1, 0.06, 0.06]} />
      <meshStandardMaterial color="#37474f" metalness={0.35} {...ghostProps(isGhost)} />
    </mesh>
    <mesh position={[1.05, 2.78, 0]}>
      <boxGeometry args={[0.12, 0.18, 0.12]} />
      <meshStandardMaterial
        color="#fff9c4"
        emissive="#fff59d"
        emissiveIntensity={lampIntensity}
        {...ghostProps(isGhost, 0.95)}
      />
    </mesh>
  </group>
);

const getBuildingColliders = (buildings, side, sx, sy, sz) => {
  const facadeX = side === 'left' ? LEFT_FACADE_X : RIGHT_FACADE_X;
  return buildings.map((b) => {
    const centerX = side === 'left' ? facadeX - b.depth / 2 : facadeX + b.depth / 2;
    return (
      <CuboidCollider
        key={`lane-bldg-col-${b.id}`}
        args={[(b.depth * 0.5) * sx, (b.h * 0.5) * sy, (b.len * 0.5) * sz]}
        position={[centerX * sx, colliderY(b.h * 0.5) * sy, b.z * sz]}
      />
    );
  });
};

const getLaneBuildingColliders = (sx, sy, sz) => (
  <>
    {getBuildingColliders(LEFT_BUILDINGS, 'left', sx, sy, sz)}
    {getBuildingColliders(RIGHT_BUILDINGS, 'right', sx, sy, sz)}
    <CuboidCollider args={[2.2 * sx, 1.65 * sy, 0.08 * sz]} position={[0, colliderY(1.65) * sy, 5.35 * sz]} />
    <CuboidCollider args={[0.04 * sx, 1.45 * sy, 0.04 * sz]} position={[(LEFT_FACADE_X + 0.25) * sx, colliderY(1.45) * sy, 0.2 * sz]} />
  </>
);

/**
 * 街区・路地：奥行きのある家屋に挟まれた路地裏。主軸 Z。
 */
export const renderLaneLayout = ({
  isGhost, meshPosition, meshRotation, handlers, castShadow, isBuilding, nightFactor, needType, expressionResolved = false,
}) => {
  const style = resolvePlaceNeedStyle(needType, { expressionResolved });
  const roadHalfW = ROAD_HALF_W * style.roadWidthMul;
  const lampIntensity = (isGhost ? 0.3 : (0.45 + nightFactor * 0.75)) * style.lightMul;
  const windowGlow = (isGhost ? 0.15 : (0.4 + nightFactor * 0.7)) * style.windowGlowMul;

  return (
    <group position={meshPosition} rotation={meshRotation} {...interactionProps(handlers)}>
      {buildEndEntryMeshes(-5.2, isGhost, castShadow)}
      {buildEndEntryMeshes(5.2, isGhost, castShadow)}

      <mesh position={[0, ROAD_Y, 0]} receiveShadow={castShadow} userData={WALK}>
        <boxGeometry args={[roadHalfW * 2, 0.06, ALLEY_LEN]} />
        <meshStandardMaterial color={style.asphaltColor} roughness={0.96} metalness={0.03} {...ghostProps(isGhost)} />
      </mesh>

      {style.bleakMood && (
        <mesh position={[0, ROAD_Y + 0.04, 0]}>
          <boxGeometry args={[roadHalfW * 2.1, 0.02, ALLEY_LEN - 0.4]} />
          <meshStandardMaterial color="#0d0d0d" transparent opacity={isGhost ? 0.1 : 0.18} roughness={1} />
        </mesh>
      )}

      <AlleyCurbs isGhost={isGhost} castShadow={castShadow} roadHalfW={roadHalfW} />

      {LEFT_BUILDINGS.map((b) => (
        <HouseBlock key={b.id} side="left" isGhost={isGhost} castShadow={castShadow} windowGlow={windowGlow} {...b} />
      ))}
      {RIGHT_BUILDINGS.map((b) => (
        <HouseBlock key={b.id} side="right" isGhost={isGhost} castShadow={castShadow} windowGlow={windowGlow} {...b} />
      ))}

      <AlleyGap side="left" z={2.1} isGhost={isGhost} />
      <AlleyGap side="left" z={-1.4} isGhost={isGhost} />
      <AlleyGap side="right" z={1.5} isGhost={isGhost} />
      <AlleyGap side="right" z={-2.4} isGhost={isGhost} />

      <DeadEndWall isGhost={isGhost} castShadow={castShadow} />
      <GroundClutter isGhost={isGhost} castShadow={castShadow} />

      <OverheadWires isGhost={isGhost} />
      <StreetLamp x={LEFT_FACADE_X + 0.35} z={0.2} isGhost={isGhost} castShadow={castShadow} lampIntensity={lampIntensity} />

      {!isGhost && !isBuilding && (
        style.bleakMood ? (
          <>
            <pointLight position={[0, 2.6, 0]} distance={7} intensity={(0.22 + nightFactor * 0.32) * style.lightMul} color={ZONE_LIGHTS.alleyCold} />
            <pointLight position={[0, 1.3, -2]} distance={5.5} intensity={(0.14 + nightFactor * 0.22) * style.lightMul} color={ZONE_LIGHTS.alleyColdDim} />
            <pointLight position={[0.7, 3.0, 0.2]} distance={4} intensity={(0.06 + nightFactor * 0.12) * style.lightMul} color="#7986CB" />
          </>
        ) : (
          <>
            <pointLight position={[0.7, 3.0, 0.2]} distance={5.5} intensity={(0.14 + nightFactor * 0.35) * style.lightMul} color="#fff9c4" />
            <pointLight position={[-2.2, 1.8, 0.5]} distance={3.5} intensity={(0.05 + nightFactor * 0.18) * style.lightMul} color="#ffcc80" />
            <pointLight position={[2.3, 1.6, -0.6]} distance={3.2} intensity={(0.04 + nightFactor * 0.14) * style.lightMul} color="#ffcc80" />
          </>
        )
      )}
    </group>
  );
};

export const LANE_SHAPE_IDS = ['lane_layout'];

export const isLaneShape = (shape) => LANE_SHAPE_IDS.includes(shape);

export const getLaneMeshPosition = (shape) => (
  LANE_SHAPE_IDS.includes(shape) ? [0, -0.24, 0] : [0, 0, 0]
);

export const getLaneWalkColliders = (shape, sx, sy, sz, needType = null, expressionResolved = false) => {
  if (shape === 'lane_layout') {
    const style = resolvePlaceNeedStyle(needType, { expressionResolved });
    const roadHalfW = ROAD_HALF_W * style.roadWidthMul;
    return (
      <>
        {buildEndEntryColliders(-5.2, sx, sy, sz)}
        {buildEndEntryColliders(5.2, sx, sy, sz)}
        <CuboidCollider args={[roadHalfW * sx, 0.04, 5.2 * sz]} position={[0, colliderY(FLOOR_Y) * sy, 0]} />
        {getLaneBuildingColliders(sx, sy, sz)}
      </>
    );
  }
  return null;
};

export const getLaneCollider = (shape, sx, sy, sz, needType = null, expressionResolved = false) => (
  getLaneWalkColliders(shape, sx, sy, sz, needType, expressionResolved)
);
