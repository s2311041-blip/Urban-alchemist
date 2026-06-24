/** 東京都江東区（ワークショップ想定エリア） */
export const KOTO_CENTER = { lat: 35.653, lng: 139.826 };

export const KOTO_BOUNDS = {
  minLat: 35.618,
  maxLat: 35.692,
  minLng: 139.792,
  maxLng: 139.912,
};

export const KOTO_MAP_ZOOM = 14;
export const MAX_AR_VIEW_DISTANCE_M = 120;
export const DEFAULT_PIN_DISTANCE_M = 8;

/** ゲーム placeArchetype 互換の場所チップ（江東区向けラベル） */
export const KOTO_PLACE_OPTIONS = [
  { id: 'station', label: '駅・駅前' },
  { id: 'bus_stop', label: 'バス停' },
  { id: 'waterfront', label: '水辺・運河沿い' },
  { id: 'road', label: '歩道・道路' },
  { id: 'commerce', label: '商業施設・店舗街' },
  { id: 'park', label: '公園・広場' },
  { id: 'lane', label: '路地・住宅街' },
  { id: 'none', label: 'どれにも当てはまらない' },
];

export function isInsideKotoBounds(lat, lng) {
  return lat >= KOTO_BOUNDS.minLat
    && lat <= KOTO_BOUNDS.maxLat
    && lng >= KOTO_BOUNDS.minLng
    && lng <= KOTO_BOUNDS.maxLng;
}

/** @deprecated 旧名互換 */
export const KASHIWA_CENTER = KOTO_CENTER;
export const KASHIWA_BOUNDS = KOTO_BOUNDS;
export const KASHIWA_MAP_ZOOM = KOTO_MAP_ZOOM;
export const KASHIWA_PLACE_OPTIONS = KOTO_PLACE_OPTIONS;
export const isInsideKashiwaBounds = isInsideKotoBounds;
