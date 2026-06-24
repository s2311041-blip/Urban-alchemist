import { haversineDistanceM } from './geoMath';

/**
 * 精度が悪いときの GPS の「瞬間移動」を弾く。
 * 古い座標を保持し続けると AR 上でピンが実際より近く見えるため、
 * 明らかな外れ値だけ拒否し、それ以外は最新値をそのまま使う。
 */
export function acceptGeoUpdate(prev, next) {
  if (!next) return null;
  if (!prev) return next;

  const jumpM = haversineDistanceM(prev, next);
  const acc = next.accuracy ?? 999;

  if (jumpM > 80 && acc > 25) return prev;
  if (jumpM > Math.max(35, acc * 2.2) && acc > 18) return prev;

  return next;
}

export function isGeoAccuracyUsable(geo, maxAccuracyM = 28) {
  if (!geo) return false;
  const acc = geo.accuracy;
  if (acc == null) return true;
  return acc <= maxAccuracyM;
}
