import { PALETTE } from '../../../constants/artDirection';
import { ART_DIRECTION } from '../../../constants/buildFeatureFlags';

export const placeMat = (color, opts = {}) => ({
  color,
  roughness: opts.roughness ?? 0.9,
  metalness: opts.metalness ?? 0,
  ...(ART_DIRECTION.useFlatShading ? { flatShading: true } : {}),
  ...opts,
});

export const PLACE_COLORS = {
  walk: PALETTE.road,
  walkWarm: '#E8DCC8',
  plaster: PALETTE.buildingPlaster,
  wood: PALETTE.wood,
  trim: PALETTE.buildingTrim,
  warmGlow: PALETTE.lampEmissive,
  sign: '#5C6BC0',
};

/** 広場・駅のストリングライト（概念図の暖色灯り） */
export const StringLightRow = ({ from, to, y, count = 6, intensity = 0.55, isGhost }) => {
  if (isGhost) return null;
  const blocks = [];
  for (let i = 0; i < count; i += 1) {
    const t = count <= 1 ? 0.5 : i / (count - 1);
    blocks.push([
      from[0] + (to[0] - from[0]) * t,
      y,
      from[2] + (to[2] - from[2]) * t,
    ]);
  }
  return (
    <group>
      {blocks.map((pos, i) => (
        <mesh key={`sl-${i}`} position={pos}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial
            color={PLACE_COLORS.warmGlow}
            emissive={PLACE_COLORS.warmGlow}
            emissiveIntensity={intensity}
            roughness={0.8}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
};
