import { bearingDeg, destinationPoint, haversineDistanceM, normalizeHeading } from './geoMath';

const DEG = Math.PI / 180;

/**
 * GPS 座標 → WebXR ローカル座標（メートル）。
 * 原点: セッション開始時の位置。+X=右、+Y=上、-Z=開始時の正面。
 */
export function geoToLocalPosition(originGeo, originHeadingDeg, targetGeo) {
  const distM = haversineDistanceM(originGeo, targetGeo);
  if (distM < 0.05) return { x: 0, y: 0, z: 0, distM: 0 };

  const bearing = bearingDeg(originGeo, targetGeo);
  const relRad = (bearing - originHeadingDeg) * DEG;
  return {
    x: distM * Math.sin(relRad),
    y: 0,
    z: -distM * Math.cos(relRad),
    distM,
  };
}

/** ローカル座標 → GPS（逆変換） */
export function localToGeo(originGeo, originHeadingDeg, local) {
  const x = local.x ?? 0;
  const z = local.z ?? 0;
  const distM = Math.hypot(x, z);
  if (distM < 0.05) {
    return { lat: originGeo.lat, lng: originGeo.lng };
  }
  const bearing = normalizeHeading(
    originHeadingDeg + Math.atan2(x, -z) * (180 / Math.PI),
  );
  return destinationPoint(originGeo.lat, originGeo.lng, bearing, distM);
}

export function buildSessionOrigin(geo, headingDeg) {
  return {
    geo: { lat: geo.lat, lng: geo.lng },
    headingDeg: normalizeHeading(headingDeg ?? 0),
    capturedAt: Date.now(),
  };
}

export function annotationToLocalPosition(annotation, sessionOrigin) {
  if (!annotation?.worldPin || !sessionOrigin?.geo) return null;
  const local = geoToLocalPosition(
    sessionOrigin.geo,
    sessionOrigin.headingDeg,
    annotation.worldPin,
  );
  return local;
}

export function placementFromXrHit(sessionOrigin, hitPosition, hitY = null) {
  const local = {
    x: hitPosition.x,
    y: hitY ?? hitPosition.y ?? 0,
    z: hitPosition.z,
  };
  const worldPin = localToGeo(sessionOrigin.geo, sessionOrigin.headingDeg, local);
  const distM = Math.hypot(local.x, local.z);
  return {
    worldPin,
    distanceM: distM,
    xrLocalAnchor: {
      x: local.x,
      y: local.y,
      z: local.z,
    },
    capturePose: {
      headingDeg: sessionOrigin.headingDeg,
      pitchDeg: 0,
      placementMode: 'webxr',
    },
    placementMode: 'webxr',
  };
}
