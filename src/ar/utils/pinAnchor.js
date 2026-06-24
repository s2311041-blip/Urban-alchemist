import { DEFAULT_PIN_DISTANCE_M } from '../constants/kotoArea';
import { destinationPoint, normalizeHeading } from './geoMath';

const H_FOV = 62;
const V_FOV = 48;

export function estimateDistanceFromTap(screenTap) {
  if (!screenTap) return DEFAULT_PIN_DISTANCE_M;
  const dx = screenTap.nx - 0.5;
  const dy = screenTap.ny - 0.5;
  const offset = Math.hypot(dx, dy);
  return DEFAULT_PIN_DISTANCE_M + offset * 18;
}

/**
 * 画面タップ + 端末ポーズからワールド上のピン座標を算出
 */
export function computePinWorldPosition({
  authorGeo,
  headingDeg = 0,
  pitchDeg = 0,
  screenTap,
  distanceM,
}) {
  const d = distanceM ?? estimateDistanceFromTap(screenTap);
  const yawOffset = ((screenTap?.nx ?? 0.5) - 0.5) * H_FOV;
  const pitchOffset = (0.5 - (screenTap?.ny ?? 0.5)) * V_FOV;
  const finalHeading = normalizeHeading(headingDeg + yawOffset);
  const finalPitch = pitchDeg + pitchOffset;
  const groundDist = Math.max(2, d * Math.cos(finalPitch * (Math.PI / 180)));
  const worldPin = destinationPoint(authorGeo.lat, authorGeo.lng, finalHeading, groundDist);
  return {
    worldPin,
    distanceM: d,
    capturePose: {
      headingDeg: finalHeading,
      pitchDeg: finalPitch,
      authorHeadingDeg: headingDeg,
      authorPitchDeg: pitchDeg,
    },
    screenTap: screenTap ?? { nx: 0.5, ny: 0.5 },
  };
}

export { H_FOV, V_FOV };
