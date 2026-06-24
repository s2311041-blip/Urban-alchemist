import { haversineDistanceM, bearingDeg, normalizeHeading } from './geoMath';
import { H_FOV, V_FOV } from './pinAnchor';

/** 立っている場所＝ピン（GPS誤差のみ。最も信頼しやすい） */
export function computePinAtFeet({ authorGeo, headingDeg = 0, pitchDeg = 0 }) {
  if (!authorGeo) return null;
  return {
    worldPin: { lat: authorGeo.lat, lng: authorGeo.lng },
    distanceM: 0,
    capturePose: null,
    screenTap: { nx: 0.5, ny: 0.5 },
    placementMode: 'feet',
    accuracyM: authorGeo.accuracy,
  };
}

/** 地図で指定した座標＝ピン（位置は地図が正、距離は参考） */
export function computePinFromMap({ worldPin, authorGeo }) {
  if (!worldPin || !authorGeo) return null;
  return {
    worldPin: { lat: worldPin.lat, lng: worldPin.lng },
    distanceM: haversineDistanceM(authorGeo, worldPin),
    capturePose: null,
    screenTap: { nx: 0.5, ny: 0.5 },
    placementMode: 'map',
    accuracyM: authorGeo.accuracy,
  };
}

/**
 * 撮影瞬間のコンパス・俯角 + 画面タップ → capturePose（角度・高さの本体）
 * worldPin は①で確定済み。②撮影で「どう見ていたか」を記録する。
 */
export function buildCapturePoseAtPhoto({
  authorGeo,
  worldPin,
  headingDeg = 0,
  pitchDeg = 0,
  screenTap,
  placementMode = 'feet',
}) {
  const tap = screenTap ?? { nx: 0.5, ny: 0.5 };
  const yawOffset = (tap.nx - 0.5) * H_FOV;
  const pitchOffset = (0.5 - tap.ny) * V_FOV;

  const distM = authorGeo && worldPin
    ? haversineDistanceM(authorGeo, worldPin)
    : 0;

  const finalHeading = normalizeHeading(headingDeg + yawOffset);
  const finalPitch = pitchDeg + pitchOffset;

  return {
    authorGeo,
    worldPin,
    distanceM: distM,
    screenTap: tap,
    placementMode,
    capturePose: {
      headingDeg: finalHeading,
      pitchDeg: finalPitch,
      authorHeadingDeg: headingDeg,
      authorPitchDeg: pitchDeg,
      photoTap: tap,
      bearingToPinDeg: authorGeo && worldPin ? bearingDeg(authorGeo, worldPin) : null,
      capturedAt: Date.now(),
      placementMode,
    },
  };
}
