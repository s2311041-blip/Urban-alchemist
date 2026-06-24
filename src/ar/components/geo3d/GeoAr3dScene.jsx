import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { MAX_AR_VIEW_DISTANCE_M } from '../../constants/kotoArea';
import { geoToWorldNorth, viewerWorldPosition } from '../../utils/geo3dWorld';
import { computePinWorldPosition } from '../../utils/pinAnchor';
import { V_FOV } from '../../utils/pinAnchor';
import { GeoArPin3d, GeoArPlacementPin } from './GeoArPin3d';

const DEG = Math.PI / 180;

function CameraRig({ poseRef, viewerPosRef }) {
  const cameraRef = useRef(null);

  useFrame(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    const pose = poseRef?.current ?? { headingDeg: 0, pitchDeg: 0 };
    const pos = viewerPosRef?.current ?? { x: 0, y: 1.55, z: 0 };

    const pitchDeg = Math.max(-55, Math.min(55, pose.pitchDeg));

    camera.position.set(pos.x, pos.y, pos.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = -pose.headingDeg * DEG;
    camera.rotation.x = pitchDeg * DEG;
    camera.rotation.z = 0;
    camera.updateMatrixWorld();
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={V_FOV}
      near={0.1}
      far={500}
    />
  );
}

export function GeoAr3dScene({
  sessionOriginGeo,
  viewerGeo,
  poseRef,
  annotations = [],
  mode = 'view',
  placementTap,
  authorGeo,
  deviceHeading,
  devicePitch,
  selectedPinId,
  onSelectPin,
}) {
  const viewerPosRef = useRef({ x: 0, y: 1.55, z: 0 });

  if (sessionOriginGeo && viewerGeo) {
    viewerPosRef.current = viewerWorldPosition(sessionOriginGeo, viewerGeo);
  }

  const pins = useMemo(() => {
    if (!sessionOriginGeo) return [];
    return annotations
      .filter((a) => a.worldPin)
      .map((a) => {
        const w = geoToWorldNorth(sessionOriginGeo, a.worldPin);
        if (w.distM > MAX_AR_VIEW_DISTANCE_M) return null;
        return { annotation: a, world: w };
      })
      .filter(Boolean)
      .sort((a, b) => a.world.distM - b.world.distM);
  }, [annotations, sessionOriginGeo]);

  const placementWorld = useMemo(() => {
    if (!placementTap || !sessionOriginGeo || !authorGeo || mode !== 'place') return null;
    const anchor = computePinWorldPosition({
      authorGeo,
      headingDeg: deviceHeading,
      pitchDeg: devicePitch,
      screenTap: placementTap,
    });
    return geoToWorldNorth(sessionOriginGeo, anchor.worldPin);
  }, [placementTap, sessionOriginGeo, authorGeo, deviceHeading, devicePitch, mode]);

  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight position={[5, 12, 3]} intensity={0.9} />

      <CameraRig poseRef={poseRef} viewerPosRef={viewerPosRef} />

      {mode === 'view' && pins.map(({ annotation, world }) => (
        <GeoArPin3d
          key={annotation.id}
          position={[world.x, world.y, world.z]}
          kind={annotation.kind}
          label={annotation.comment?.slice(0, 12)}
          distM={world.distM}
          annotation={annotation}
          onSelect={() => onSelectPin?.(annotation)}
          pulsing={annotation.id === selectedPinId}
        />
      ))}

      {mode === 'place' && placementWorld && (
        <GeoArPlacementPin
          position={[placementWorld.x, placementWorld.y, placementWorld.z]}
        />
      )}
    </>
  );
}
