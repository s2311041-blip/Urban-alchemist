/**
 * 崖 = 四方向同一の中空岩壁 + 上蓋
 * すべて boxGeometry の実寸（full size）で定義する。
 */

export const CLIFF_GROUND_Y = -0.24;

const OUTER_HALF = 0.46;
const INNER_HALF = 0.28;
const WALL_THICK = OUTER_HALF - INNER_HALF; // full thickness
const WALL_HALF_THICK = WALL_THICK * 0.5;
const WALL_CENTER_OFFSET = INNER_HALF + WALL_HALF_THICK;

const WALL_BOTTOM = CLIFF_GROUND_Y - 0.02; // 地面に少し埋める
const WALL_TOP = 0.98;
const WALL_HEIGHT = WALL_TOP - WALL_BOTTOM;
const WALL_CENTER_Y = (WALL_BOTTOM + WALL_TOP) * 0.5;
const WALL_HALF_H = WALL_HEIGHT * 0.5;

const TOP_THICK = 0.1;
const TOP_HALF_H = TOP_THICK * 0.5;
const TOP_CENTER_Y = WALL_TOP - TOP_HALF_H; // 壁に食い込ませて浮き防止

const FACE_Z = WALL_CENTER_OFFSET;

const rotate4 = (part, face) => {
  const [x, y, z] = part.pos;
  const [rx, ry, rz] = part.rot;
  const quarterTurn = (face * Math.PI) / 2;
  if (face === 0) return { pos: [x, y, z], rot: [rx, ry + quarterTurn, rz], args: part.args, mat: part.mat };
  if (face === 1) return { pos: [z, y, -x], rot: [rx, ry + quarterTurn, rz], args: part.args, mat: part.mat };
  if (face === 2) return { pos: [-x, y, -z], rot: [rx, ry + quarterTurn, rz], args: part.args, mat: part.mat };
  return { pos: [-z, y, x], rot: [rx, ry + quarterTurn, rz], args: part.args, mat: part.mat };
};

const replicateFourFaces = (parts) => {
  const out = [];
  for (let face = 0; face < 4; face += 1) {
    parts.forEach((part) => out.push(rotate4(part, face)));
  }
  return out;
};

const FACE_DECOR_TEMPLATE = [
  // 壁本体（各面1枚・重なりなし）
  { pos: [0, WALL_CENTER_Y, FACE_Z], rot: [0, 0, 0], args: [OUTER_HALF * 2, WALL_HEIGHT, WALL_THICK], mat: 'base' },
  // 前面のゴツゴツ（壁より手前に配置）
  { pos: [-0.28, WALL_BOTTOM + 0.24, FACE_Z + 0.08], rot: [0.03, 0, 0.06], args: [0.14, 0.11, 0.08], mat: 'light' },
  { pos: [0.24, WALL_BOTTOM + 0.46, FACE_Z + 0.09], rot: [0, 0, -0.05], args: [0.13, 0.1, 0.08], mat: 'mid' },
  { pos: [-0.2, WALL_BOTTOM + 0.68, FACE_Z + 0.08], rot: [0.02, 0, 0.04], args: [0.14, 0.12, 0.08], mat: 'dark' },
  { pos: [0.16, WALL_BOTTOM + 0.86, FACE_Z + 0.09], rot: [0, 0, -0.04], args: [0.12, 0.09, 0.07], mat: 'light' },
];

export const CLIFF_ALL_PARTS = [
  // 地面との接続土台
  { pos: [0, CLIFF_GROUND_Y - 0.02, 0], rot: [0, 0, 0], args: [OUTER_HALF * 2, 0.06, OUTER_HALF * 2], mat: 'dark' },
  // 中央芯（小さめ）
  { pos: [0, WALL_CENTER_Y, 0], rot: [0, 0, 0], args: [INNER_HALF * 2, WALL_HEIGHT * 0.98, INNER_HALF * 2], mat: 'dark' },
  // 四方向同一の壁 + 装飾
  ...replicateFourFaces(FACE_DECOR_TEMPLATE),
  // 上蓋
  { pos: [0, TOP_CENTER_Y, 0], rot: [0, 0, 0], args: [OUTER_HALF * 2, TOP_THICK, OUTER_HALF * 2], mat: 'light' },
];

export const CLIFF_COLLIDER = {
  centerY: WALL_CENTER_Y,
  halfHeight: WALL_HALF_H,
  outerHalf: OUTER_HALF,
  wallHalfThickness: WALL_HALF_THICK,
  wallCenterOffset: WALL_CENTER_OFFSET,
  topHalfHeight: TOP_HALF_H,
  topCenterY: TOP_CENTER_Y,
};
