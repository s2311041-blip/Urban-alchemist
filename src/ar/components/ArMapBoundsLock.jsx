import React from 'react';
import { useMap } from 'react-leaflet';

/** 地図のズーム範囲のみ設定（エリアロックなし） */
export function BoundsLock() {
  const map = useMap();
  React.useEffect(() => {
    map.setMinZoom(3);
    map.setMaxZoom(19);
  }, [map]);
  return null;
}
