import React, { useMemo } from 'react';
import { isInsideKotoBounds, MAX_AR_VIEW_DISTANCE_M } from '../constants/kotoArea';
import { projectPinToScreen } from '../utils/geoProjection';
import { ArPinMarker } from './ArPinMarker';

/**
 * GPS+コンパスで画面上に 2D ピンを投影（タップしやすく視認性が高い）
 */
export function ArScreenPinOverlay({
  annotations = [],
  viewerGeo,
  viewerHeadingDeg = 0,
  viewerPitchDeg = 0,
  selectedPinId,
  onSelectPin,
}) {
  const markers = useMemo(() => {
    if (!viewerGeo) return [];
    return annotations
      .filter((a) => a.worldPin && isInsideKotoBounds(a.worldPin.lat, a.worldPin.lng))
      .map((a) => {
        const screen = projectPinToScreen({
          viewerGeo,
          viewerHeadingDeg,
          viewerPitchDeg,
          pinGeo: a.worldPin,
          pinAnchor: a,
        });
        if (!screen) return null;
        return { annotation: a, ...screen };
      })
      .filter(Boolean)
      .sort((a, b) => a.distM - b.distM);
  }, [annotations, viewerGeo, viewerHeadingDeg, viewerPitchDeg]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
      {markers.map(({ annotation, nx, ny, distM, relBearing, scale }) => (
        <div key={annotation.id} style={{ pointerEvents: 'auto' }}>
          <ArPinMarker
            nx={nx}
            ny={ny}
            kind={annotation.kind}
            distM={distM}
            label={annotation.comment?.slice(0, 10)}
            relBearing={relBearing}
            scale={scale}
            pulsing={annotation.id === selectedPinId}
            onClick={() => onSelectPin?.(annotation)}
          />
        </div>
      ))}
    </div>
  );
}
