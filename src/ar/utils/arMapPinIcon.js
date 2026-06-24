import L from 'leaflet';
import { AR_THEME } from '../constants/arTheme';

function pinSvg(color) {
  return `
    <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C10.8 0 5 5.8 5 13c0 9.75 13 31 13 31s13-21.25 13-31c0-7.2-5.8-13-13-13z"
        fill="${color}" stroke="#fff" stroke-width="2.5"/>
      <circle cx="18" cy="13" r="5" fill="#fff" opacity="0.95"/>
    </svg>
  `;
}

/** 地図用の AR ピン（Leaflet の壊れたデフォルトアイコンを使わない） */
export function createArMapPinIcon(kind = 'barrier') {
  const color = kind === 'positive' ? AR_THEME.positive : AR_THEME.barrier;
  return L.divIcon({
    className: 'ar-map-pin-icon',
    html: pinSvg(color),
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  });
}

/** 現在地（青点） */
export function createArMapUserIcon() {
  return L.divIcon({
    className: 'ar-map-user-icon',
    html: `
      <div style="
        width:16px;height:16px;border-radius:50%;
        background:#42a5f5;border:3px solid #fff;
        box-shadow:0 0 0 2px rgba(66,165,245,0.45);
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}
