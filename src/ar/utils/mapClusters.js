/** この縮尺より広いときだけ、近いピンを1つの丸にまとめる */
export const CLUSTER_MAX_ZOOM = 16;

function cellMeters(zoom) {
  return 36 * (156543.03 / (2 ** zoom));
}

/**
 * @param {Array<{ id: string, worldPin?: { lat: number, lng: number } }>} annotations
 * @param {number} zoom
 */
export function clusterAnnotations(annotations, zoom) {
  const pins = annotations.filter((item) => item.worldPin);
  if (zoom > CLUSTER_MAX_ZOOM) {
    return pins.map((item) => ({
      id: item.id,
      lat: item.worldPin.lat,
      lng: item.worldPin.lng,
      items: [item],
    }));
  }

  const meters = cellMeters(zoom);
  const buckets = new Map();
  pins.forEach((item) => {
    const latCell = meters / 111320;
    const lngCell = meters / (111320 * Math.cos((item.worldPin.lat * Math.PI) / 180));
    const key = `${Math.floor(item.worldPin.lat / latCell)}:${Math.floor(item.worldPin.lng / Math.max(lngCell, 1e-9))}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(item);
    buckets.set(key, bucket);
  });

  return [...buckets.values()].map((items) => {
    const lat = items.reduce((sum, item) => sum + item.worldPin.lat, 0) / items.length;
    const lng = items.reduce((sum, item) => sum + item.worldPin.lng, 0) / items.length;
    return {
      id: items.map((item) => item.id).join(':'),
      lat,
      lng,
      items,
    };
  });
}
