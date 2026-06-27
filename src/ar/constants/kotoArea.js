/** 地図の初期中心（GPS 未取得時のフォールバック・江東区） */
export const KOTO_CENTER = { lat: 35.653, lng: 139.826 };

/** @deprecated 投稿範囲ロック廃止。互換のため残す */
export const KOTO_BOUNDS = {
  minLat: 35.618,
  maxLat: 35.692,
  minLng: 139.792,
  maxLng: 139.912,
};

export const KOTO_MAP_ZOOM = 14;
export const MAX_AR_VIEW_DISTANCE_M = 120;
export const DEFAULT_PIN_DISTANCE_M = 8;

/** ゲーム placeArchetype 互換の場所チップ（id は spawn プリセットと一致） */
export const KOTO_PLACE_OPTIONS = [
  { id: 'station', label: '駅（改札・ホーム）' },
  { id: 'plaza', label: '駅前・広場' },
  { id: 'bus_stop', label: 'バス停' },
  { id: 'waterfront', label: '水辺・運河沿い' },
  { id: 'road', label: '歩道・道路' },
  { id: 'commerce', label: '商業施設・店舗街' },
  { id: 'park', label: '公園・広場' },
  { id: 'lane', label: '路地・住宅街' },
  { id: 'none', label: 'どれにも当てはまらない' },
];

export function isValidGeoCoordinate(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/** 全世界の有効な緯度経度を許可（旧名互換） */
export function isInsideKotoBounds(lat, lng) {
  return isValidGeoCoordinate(lat, lng);
}

/** @deprecated 旧名互換 */
export const KASHIWA_CENTER = KOTO_CENTER;
export const KASHIWA_BOUNDS = KOTO_BOUNDS;
export const KASHIWA_MAP_ZOOM = KOTO_MAP_ZOOM;
export const KASHIWA_PLACE_OPTIONS = KOTO_PLACE_OPTIONS;
export const isInsideKashiwaBounds = isInsideKotoBounds;
