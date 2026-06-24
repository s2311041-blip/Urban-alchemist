import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Matrix4, Vector3 } from 'three';
import { XRHitTest, useXR } from '@react-three/xr';
import { MAX_AR_VIEW_DISTANCE_M } from '../../constants/kotoArea';
import { annotationToLocalPosition } from '../../utils/xrGeoBridge';
import { ArXrPin3d, ArXrReticle } from './ArXrPin3d';

const matrixHelper = new Matrix4();
const hitPos = new Vector3();

export function ArXrSceneContent({
  mode = 'view',
  annotations = [],
  sessionOrigin,
  placedLocal = null,
  onHitMatrix,
  onSelectPin,
  captureRef,
}) {
  const reticleRef = useRef(null);
  const session = useXR((s) => s.session);
  const gl = useThree((s) => s.gl);

  const pins = useMemo(() => {
    if (!sessionOrigin?.geo) return [];
    return annotations
      .map((annotation) => {
        const local = annotationToLocalPosition(annotation, sessionOrigin);
        if (!local || local.distM > MAX_AR_VIEW_DISTANCE_M) return null;
        return { annotation, local };
      })
      .filter(Boolean)
      .sort((a, b) => a.local.distM - b.local.distM);
  }, [annotations, sessionOrigin]);

  useFrame(() => {
    if (captureRef) {
      captureRef.current = () => {
        try {
          return gl.domElement.toDataURL('image/jpeg', 0.88);
        } catch {
          return null;
        }
      };
    }
  });

  if (!session) return null;

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 8, 2]} intensity={0.9} />

      {mode === 'place' && (
        <XRHitTest
          space="viewer"
          trackableType={['plane', 'mesh', 'point']}
          onResults={(results, getWorldMatrix) => {
            if (results.length === 0) {
              if (reticleRef.current) reticleRef.current.visible = false;
              return;
            }
            getWorldMatrix(matrixHelper, results[0]);
            hitPos.setFromMatrixPosition(matrixHelper);
            if (reticleRef.current) {
              reticleRef.current.position.copy(hitPos);
              reticleRef.current.visible = true;
            }
            onHitMatrix?.(hitPos.clone(), matrixHelper.clone());
          }}
        />
      )}

      {mode === 'place' && !placedLocal && <ArXrReticle innerRef={reticleRef} />}

      {mode === 'place' && placedLocal && (
        <ArXrPin3d
          position={[placedLocal.x, placedLocal.y, placedLocal.z]}
          kind="barrier"
          label="ここ"
        />
      )}

      {mode === 'view' && pins.map(({ annotation, local }) => (
        <ArXrPin3d
          key={annotation.id}
          position={[local.x, local.y ?? 0, local.z]}
          kind={annotation.kind}
          label={annotation.comment?.slice(0, 14)}
          distM={local.distM}
          onSelect={() => onSelectPin?.(annotation)}
        />
      ))}
    </>
  );
}
