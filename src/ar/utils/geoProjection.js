import { MAX_AR_VIEW_DISTANCE_M } from '../constants/kotoArea';
import { bearingDeg, haversineDistanceM, relativeBearingDeg } from './geoMath';
import { H_FOV, V_FOV } from './pinAnchor';

const VIEWER_EYE_HEIGHT_M = 1.55;
const RAD = 180 / Math.PI;
const EDGE_MARGIN = 0.01;

function pitchToPinDeg(viewerGeo, pinGeo, viewerPitchDeg, pinAnchor) {
  const distM = haversineDistanceM(viewerGeo, pinGeo);
  const angleToGroundDeg = -Math.atan2(VIEWER_EYE_HEIGHT_M, Math.max(distM, 0.5)) * RAD;
  const pitchAdjust = pinAnchor?.capturePose?.pitchDeg != null
    ? (pinAnchor.capturePose.pitchDeg - viewerPitchDeg) * 0.08
    : 0;
  return angleToGroundDeg + pitchAdjust;
}

/**
 * 視聴者の GPS・向きから、ピンの画面上座標を推定。
 * 視野外のピンは null（画面端に張り付かない）。
 */
export function projectPinToScreen({
  viewerGeo,
  viewerHeadingDeg = 0,
  viewerPitchDeg = 0,
  pinGeo,
  pinAnchor = null,
  maxDistanceM = MAX_AR_VIEW_DISTANCE_M,
}) {
  if (!viewerGeo || !pinGeo) return null;

  const distM = haversineDistanceM(viewerGeo, pinGeo);
  if (distM > maxDistanceM) return null;

  const targetBearing = bearingDeg(viewerGeo, pinGeo);
  const relBearing = relativeBearingDeg(viewerHeadingDeg, targetBearing);

  if (Math.abs(relBearing) > H_FOV * 0.5) return null;

  const nx = 0.5 - relBearing / H_FOV;

  const pinDist = pinAnchor?.distanceM ?? distM;
  const targetPitchDeg = pitchToPinDeg(viewerGeo, pinGeo, viewerPitchDeg, pinAnchor);
  const ny = 0.5 - (targetPitchDeg - viewerPitchDeg) / V_FOV;

  if (
    nx < EDGE_MARGIN
    || nx > 1 - EDGE_MARGIN
    || ny < EDGE_MARGIN
    || ny > 1 - EDGE_MARGIN
  ) {
    return null;
  }

  const depth01 = Math.min(1, distM / maxDistanceM);

  return {
    nx,
    ny,
    distM,
    relBearing,
    depth01,
    scale: Math.max(0.85, 1.2 - depth01 * 0.45),
  };
}

/** カメラ（端末の向き）の視界内にピンがあるか */
export function isPinInCameraView(params) {
  return projectPinToScreen(params) != null;
}

/** 視界内のピン一覧（近い順） */
export function listPinsInCameraView({
  viewerGeo,
  viewerHeadingDeg = 0,
  viewerPitchDeg = 0,
  annotations = [],
  maxDistanceM = MAX_AR_VIEW_DISTANCE_M,
}) {
  if (!viewerGeo) return [];

  return annotations
    .filter((a) => a.worldPin)
    .map((a) => {
      const screen = projectPinToScreen({
        viewerGeo,
        viewerHeadingDeg,
        viewerPitchDeg,
        pinGeo: a.worldPin,
        pinAnchor: a,
        maxDistanceM,
      });
      if (!screen) return null;
      return { annotation: a, ...screen };
    })
    .filter(Boolean)
    .sort((a, b) => a.distM - b.distM);
}

/** 近くにあるが視界外の最寄りピン（向きのヒント用） */
export function nearestOffScreenPin({
  viewerGeo,
  viewerHeadingDeg = 0,
  viewerPitchDeg = 0,
  annotations = [],
  maxDistanceM = MAX_AR_VIEW_DISTANCE_M,
}) {
  if (!viewerGeo) return null;

  let nearest = null;

  for (const a of annotations) {
    if (!a.worldPin) continue;
    const distM = haversineDistanceM(viewerGeo, a.worldPin);
    if (distM > maxDistanceM) continue;
    if (isPinInCameraView({
      viewerGeo,
      viewerHeadingDeg,
      viewerPitchDeg,
      pinGeo: a.worldPin,
      pinAnchor: a,
      maxDistanceM,
    })) {
      continue;
    }

    const targetBearing = bearingDeg(viewerGeo, a.worldPin);
    const relBearing = relativeBearingDeg(viewerHeadingDeg, targetBearing);
    const targetPitch = pitchToPinDeg(viewerGeo, a.worldPin, viewerPitchDeg, a);
    const relPitch = targetPitch - viewerPitchDeg;

    if (!nearest || distM < nearest.distM) {
      nearest = { annotation: a, distM, relBearing, relPitch };
    }
  }

  return nearest;
}

