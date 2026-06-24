import React from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { KOTO_BOUNDS } from '../constants/kotoArea';

export function BoundsLock() {
  const map = useMap();
  React.useEffect(() => {
    map.setMaxBounds(L.latLngBounds(
      [KOTO_BOUNDS.minLat, KOTO_BOUNDS.minLng],
      [KOTO_BOUNDS.maxLat, KOTO_BOUNDS.maxLng],
    ));
    map.setMinZoom(14);
    map.setMaxZoom(19);
  }, [map]);
  return null;
}
