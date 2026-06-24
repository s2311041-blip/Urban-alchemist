const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export function haversineDistanceM(a, b) {
  const lat1 = a.lat * DEG;
  const lat2 = b.lat * DEG;
  const dLat = (b.lat - a.lat) * DEG;
  const dLng = (b.lng - a.lng) * DEG;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function bearingDeg(from, to) {
  const lat1 = from.lat * DEG;
  const lat2 = to.lat * DEG;
  const dLng = (to.lng - from.lng) * DEG;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * RAD + 360) % 360;
}

export function destinationPoint(lat, lng, headingDeg, distanceM) {
  const angular = distanceM / 6371000;
  const bearing = headingDeg * DEG;
  const lat1 = lat * DEG;
  const lng1 = lng * DEG;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular)
    + Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing),
  );
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
    Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
  );
  return { lat: lat2 * RAD, lng: lng2 * RAD };
}

export function normalizeHeading(deg) {
  let h = deg % 360;
  if (h < 0) h += 360;
  return h;
}

export function relativeBearingDeg(viewerHeading, targetBearing) {
  let rel = targetBearing - viewerHeading;
  while (rel > 180) rel -= 360;
  while (rel < -180) rel += 360;
  return rel;
}
