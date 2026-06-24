/**
 * OrbitControls: アバター散歩（TPS・非建築）
 * zoomSpeed は小さいほどスクロール1目盛りの変化が細かい（0.25前後が目安）
 */
export const TPS_ORBIT = {
  minDistance: 1.75,
  maxDistance: 48,
  zoomSpeed: 0.22,
  maxPolarAngle: Math.PI / 2.1,
};

/** OrbitControls: 建築・神様視点 */
export const BUILD_ORBIT = {
  minDistance: 2,
  maxDistance: 60,
  zoomSpeed: 0.35,
  maxPolarAngle: Math.PI / 2,
};

/** 神ビュー: アイソメ・ジオラマ寄りプリセット */
export const GOD_ISO_ORBIT = {
  minDistance: 8,
  maxDistance: 72,
  zoomSpeed: 0.3,
  maxPolarAngle: Math.PI / 2.35,
  minPolarAngle: 0.35,
};
