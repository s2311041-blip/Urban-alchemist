import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../../store/useGameStore';
import { ART_DIRECTION } from '../../../constants/buildFeatureFlags';
import { ORTHO_GOD_VIEW } from '../../../constants/artDirection';

/**
 * 神ビュー時に Orthographic へ切替（概念図のアイソメ・ジオラマ構図）
 */
export const GodViewCamera = () => {
  const viewMode = useGameStore((s) => s.viewMode);
  const buildMode = useGameStore((s) => s.buildMode);
  const activeBug = useGameStore((s) => s.activeBug);
  const { camera, size, set } = useThree();
  const perspectiveRef = useRef(null);
  const orthoRef = useRef(null);

  const useOrtho = ART_DIRECTION.enabled
    && ART_DIRECTION.useOrthographicGodView
    && viewMode === 'god'
    && !buildMode
    && !activeBug;

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera && !perspectiveRef.current) {
      perspectiveRef.current = camera;
    }
  }, [camera]);

  useEffect(() => {
    if (!perspectiveRef.current) return;

    if (useOrtho) {
      if (!orthoRef.current) {
        orthoRef.current = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
      }
      const ortho = orthoRef.current;
      ortho.position.copy(camera.position);
      ortho.quaternion.copy(camera.quaternion);
      ortho.updateProjectionMatrix();
      if (!(camera instanceof THREE.OrthographicCamera)) {
        set({ camera: ortho });
      }
      return;
    }

    if (camera instanceof THREE.OrthographicCamera) {
      const persp = perspectiveRef.current;
      persp.position.copy(camera.position);
      persp.quaternion.copy(camera.quaternion);
      persp.updateProjectionMatrix();
      set({ camera: persp });
    }
  }, [useOrtho, set]);

  useFrame(() => {
    if (!useOrtho || !orthoRef.current) return;
    const ortho = orthoRef.current;
    const aspect = size.width / Math.max(size.height, 1);
    const h = ORTHO_GOD_VIEW.frustumHeight;
    ortho.left = -h * aspect;
    ortho.right = h * aspect;
    ortho.top = h;
    ortho.bottom = -h;
    ortho.updateProjectionMatrix();
  });

  return null;
};
