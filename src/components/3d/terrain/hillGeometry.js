/** 丘の形状定義（ローカル座標・scale 前）。初期島(10m)内に収めるサイズ感 */

export const HILL_VISUAL = {
  base: { y: -0.21, bottomR: 0.55, topR: 0.56 },
  mid: { y: -0.09, bottomR: 0.38, topR: 0.38, height: 0.24 },
  upper: { y: 0.08, bottomR: 0.22, topR: 0.22, height: 0.22 },
  plateau: { y: 0.2, radius: 0.2, height: 0.05 },
};

/** 丘の斜面コライダー層。細かく重ねて段差感を減らし、歩いて登れるようにする。 */
const COLLIDER_LAYER_COUNT = 16;
const COLLIDER_Y_MIN = -0.255;
const COLLIDER_Y_MAX = 0.2;
const COLLIDER_RADIUS_MIN = 0.2;
const COLLIDER_RADIUS_MAX = 0.56;
const COLLIDER_HALF_HEIGHT = 0.028;

export const buildHillColliderLayers = () => {
  const layers = [];

  // 地面から最初の踏み出しを滑らかにする裾（ここが急だと最初の1段だけ登りづらい）
  layers.push({ y: -0.285, radius: 0.6, halfHeight: 0.03 });

  for (let i = 0; i < COLLIDER_LAYER_COUNT; i++) {
    const t = i / (COLLIDER_LAYER_COUNT - 1);
    const y = COLLIDER_Y_MIN + (COLLIDER_Y_MAX - COLLIDER_Y_MIN) * t;
    const radius = COLLIDER_RADIUS_MAX + (COLLIDER_RADIUS_MIN - COLLIDER_RADIUS_MAX) * t;
    layers.push({ y, radius, halfHeight: COLLIDER_HALF_HEIGHT });
  }
  // 頂上の接地安定用に平坦キャップを追加
  layers.push({ y: HILL_VISUAL.plateau.y, radius: HILL_VISUAL.plateau.radius, halfHeight: 0.032 });
  return layers;
};
