// 20 anchor points relative coordinates (base cube size 0.5)
export const ANCHOR_POINTS = [
  // 8 vertices
  [-0.25, -0.25, -0.25], [0.25, -0.25, -0.25], [-0.25, 0.25, -0.25], [0.25, 0.25, -0.25],
  [-0.25, -0.25, 0.25], [0.25, -0.25, 0.25], [-0.25, 0.25, 0.25], [0.25, 0.25, 0.25],
  // Edge midpoints parallel to X axis
  [0, -0.25, -0.25], [0, 0.25, -0.25], [0, -0.25, 0.25], [0, 0.25, 0.25],
  // Edge midpoints parallel to Y axis
  [-0.25, 0, -0.25], [0.25, 0, -0.25], [-0.25, 0, 0.25], [0.25, 0, 0.25],
  // Edge midpoints parallel to Z axis
  [-0.25, -0.25, 0], [0.25, -0.25, 0], [-0.25, 0.25, 0], [0.25, 0.25, 0],
];
