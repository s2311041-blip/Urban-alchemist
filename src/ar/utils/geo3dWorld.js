import { bearingDeg, haversineDistanceM } from './geoMath';

const DEG = Math.PI / 180;
export const VIEWER_EYE_HEIGHT_M = 1.55;

/** 北基準のワールド座標（原点 = セッション開始地点） */
export function geoToWorldNorth(originGeo, targetGeo) {
  const distM = haversineDistanceM(originGeo, targetGeo);
  if (distM < 0.05) {
    return { x: 0, y: 0, z: 0, distM: 0, bearing: 0 };
  }
  const bearing = bearingDeg(originGeo, targetGeo);
  const br = bearing * DEG;
  return {
    x: distM * Math.sin(br),
    y: 0,
    z: -distM * Math.cos(br),
    distM,
    bearing,
  };
}

export function viewerWorldPosition(originGeo, viewerGeo) {
  const p = geoToWorldNorth(originGeo, viewerGeo);
  return { x: p.x, y: VIEWER_EYE_HEIGHT_M, z: p.z };
}

/** 投稿時の俯角からピン先端の高さ（m）を推定 */
export function pinElevationM(annotation) {
  const distFromPin = annotation.authorGeo && annotation.worldPin
    ? haversineDistanceM(annotation.authorGeo, annotation.worldPin)
    : null;
  const dist = Math.max(1, annotation.distanceM ?? distFromPin ?? 8);
  const pitch = annotation.capturePose?.pitchDeg
    ?? annotation.capturePose?.authorPitchDeg
    ?? 0;
  return Math.tan(Math.max(-35, Math.min(35, pitch)) * DEG) * dist * 0.35;
}

export function pinTiltRad(annotation) {
  const pitch = annotation.capturePose?.pitchDeg ?? 0;
  return Math.max(-0.5, Math.min(0.5, pitch * DEG * 0.4));
}

export function stakeHeightM(distM) {
  return Math.min(1.2, Math.max(0.45, 0.35 + distM * 0.012));
}
