import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { ART_DIRECTION } from '../../constants/buildFeatureFlags';
import { ISO_CAMERA_PRESET } from '../../constants/artDirection';

export const CameraRig = ({ 
  controlsRef, 
  avatarPos 
}) => {
  const { camera } = useThree()
  const targetCameraPos = useRef(null)
  const targetControlTarget = useRef(null)
  const [, getKeys] = useKeyboardControls()

  const {
    activeBug,
    buildMode,
    bugs,
    isReturning,
    setIsReturning,
    viewMode,
    expandingLevel,
    expansionFocusTarget,
    questFocusTarget,
    setQuestFocusTarget,
    isDesigningInStudio,
    isEditingInStudio
  } = useGameStore();

  const wasDesigning = useRef(false)
  const wasEditing = useRef(false)
  const prevBuildModeRef = useRef(null)
  const prevViewModeRef = useRef(viewMode)
  const buildFocusDoneRef = useRef(false)
  const questFocusStartedAtRef = useRef(0)

  const focusBuildBugCamera = useCallback((bugId) => {
    const bug = bugs.find((b) => b.id === bugId)
    if (bug && Array.isArray(bug.pos) && bug.pos.length === 3) {
      targetCameraPos.current = new THREE.Vector3(bug.pos[0], 4, bug.pos[2] + 4)
      targetControlTarget.current = new THREE.Vector3(bug.pos[0], 0, bug.pos[2])
      buildFocusDoneRef.current = false
      return
    }
    targetCameraPos.current = null
    targetControlTarget.current = null
    buildFocusDoneRef.current = true
  }, [bugs])

  useEffect(() => {
    const endedDesigning = wasDesigning.current && !isDesigningInStudio;
    const endedEditing = wasEditing.current && !isEditingInStudio;

    if (endedDesigning || endedEditing) {
      if (avatarPos && avatarPos.current) {
        const aPos = avatarPos.current;
        // アバターから十分に引いた位置（Y+5, Z+7）
        camera.position.set(aPos.x, aPos.y + 5, aPos.z + 7);
        if (controlsRef && controlsRef.current) {
          controlsRef.current.target.set(aPos.x, aPos.y + 1, aPos.z);
          controlsRef.current.update();
        }
      }
    }

    wasDesigning.current = !!isDesigningInStudio;
    wasEditing.current = !!isEditingInStudio;
  }, [isDesigningInStudio, isEditingInStudio, camera, avatarPos, controlsRef]);

  useEffect(() => {
    if (!isReturning) return;
    if (avatarPos && avatarPos.current) {
      const aPos = avatarPos.current;
      camera.position.set(aPos.x, aPos.y + 5, aPos.z + 7);
      if (controlsRef && controlsRef.current) {
        controlsRef.current.target.set(aPos.x, aPos.y + 1, aPos.z);
        controlsRef.current.update();
      }
    }

    const timer = setTimeout(() => {
      setIsReturning(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [isReturning, setIsReturning, avatarPos, camera, controlsRef]);

  useEffect(() => {
    if (Array.isArray(questFocusTarget) && questFocusTarget.length === 3) {
      questFocusStartedAtRef.current = Date.now();
      targetControlTarget.current = new THREE.Vector3(questFocusTarget[0], questFocusTarget[1], questFocusTarget[2]);
      targetCameraPos.current = new THREE.Vector3(questFocusTarget[0], questFocusTarget[1] + 5, questFocusTarget[2] + 6);
      buildFocusDoneRef.current = false;
    } else if (expandingLevel > 0) {
      const target = Array.isArray(expansionFocusTarget) && expansionFocusTarget.length === 3
        ? expansionFocusTarget
        : [0, 0.5, -2];
      targetControlTarget.current = new THREE.Vector3(target[0], target[1], target[2]);
      const dist = 12 + expandingLevel * 3;
      targetCameraPos.current = new THREE.Vector3(target[0], target[1] + dist * 0.8, target[2] + dist);
      buildFocusDoneRef.current = false;
    } else if (buildMode && buildMode !== 'free' && buildMode !== prevBuildModeRef.current) {
      focusBuildBugCamera(buildMode);
    } else if (!buildMode) {
      if (viewMode === 'god' && !activeBug) {
        const switchedToGod = prevViewModeRef.current !== 'god';
        if (switchedToGod) {
          if (ART_DIRECTION.enabled && ART_DIRECTION.useIsometricGodView) {
            const [tx, ty, tz] = ISO_CAMERA_PRESET.target;
            const d = ISO_CAMERA_PRESET.distance;
            const h = ISO_CAMERA_PRESET.height;
            targetCameraPos.current = new THREE.Vector3(tx + d, ty + h, tz + d);
            targetControlTarget.current = new THREE.Vector3(tx, ty, tz);
          } else {
            targetCameraPos.current = new THREE.Vector3(camera.position.x, 8, camera.position.z + 5);
            targetControlTarget.current = new THREE.Vector3(controlsRef.current?.target.x || 0, 0, controlsRef.current?.target.z || 0);
          }
          buildFocusDoneRef.current = false;
        }
      } else {
        targetCameraPos.current = null;
        targetControlTarget.current = null;
      }
      buildFocusDoneRef.current = false;
    } else if (buildMode === 'free' && buildMode !== prevBuildModeRef.current) {
      targetCameraPos.current = null;
      targetControlTarget.current = null;
      buildFocusDoneRef.current = true;
    }

    prevBuildModeRef.current = buildMode;
    prevViewModeRef.current = viewMode;
  }, [
    buildMode,
    viewMode,
    activeBug,
    bugs,
    camera,
    expandingLevel,
    expansionFocusTarget,
    questFocusTarget,
    controlsRef,
    focusBuildBugCamera,
  ])

  useFrame((state, delta) => {
    if (expandingLevel > 0) {
      const target = Array.isArray(expansionFocusTarget) && expansionFocusTarget.length === 3
        ? expansionFocusTarget
        : [0, 0.5, -2];
      const dist = 12 + expandingLevel * 3;
      camera.position.set(target[0], target[1] + dist * 0.8, target[2] + dist);
      if (controlsRef && controlsRef.current) {
        controlsRef.current.target.set(target[0], target[1], target[2]);
        controlsRef.current.update();
      }
    } else if (targetCameraPos.current && targetControlTarget.current && !buildFocusDoneRef.current) {
      camera.position.lerp(targetCameraPos.current, 0.08)
      if (controlsRef && controlsRef.current) {
        controlsRef.current.target.lerp(targetControlTarget.current, 0.08)
        controlsRef.current.update()
      }

      if (expandingLevel === 0) {
        const dist = camera.position.distanceTo(targetCameraPos.current)
        const targetDist = controlsRef.current ? controlsRef.current.target.distanceTo(targetControlTarget.current) : 0
        const focusingQuest = Array.isArray(questFocusTarget) && questFocusTarget.length === 3;
        const focusElapsedMs = Date.now() - (questFocusStartedAtRef.current || 0);
        const timedOut = focusingQuest && focusElapsedMs > 2000;
        if (dist < 0.35 && targetDist < 0.35) {
          targetCameraPos.current = null
          targetControlTarget.current = null
          buildFocusDoneRef.current = true
          if (questFocusTarget) setQuestFocusTarget(null);
        } else if (timedOut) {
          // Safety: if focus interpolation stalls, release camera lock.
          targetCameraPos.current = null
          targetControlTarget.current = null
          buildFocusDoneRef.current = true
          setQuestFocusTarget(null);
        }
      }
    } else if (buildMode) {
      // 建築モード: 矢印キーでカメラ平行移動（WASD は素材ショートカット用）
      const { forward: panForward, backward: panBackward, left: panLeft, right: panRight } = getKeys()
      if (panForward || panBackward || panLeft || panRight) {
        const forwardVec = new THREE.Vector3()
        camera.getWorldDirection(forwardVec)
        forwardVec.y = 0
        forwardVec.normalize()

        const rightVec = new THREE.Vector3()
        rightVec.crossVectors(forwardVec, camera.up).normalize()

        const moveVec = new THREE.Vector3()
        if (panForward) moveVec.add(forwardVec)
        if (panBackward) moveVec.sub(forwardVec)
        if (panLeft) moveVec.sub(rightVec)
        if (panRight) moveVec.add(rightVec)
        moveVec.normalize()

        // 建築モード移動スピード
        const speed = 12 * delta
        moveVec.multiplyScalar(speed)

        camera.position.add(moveVec)
        if (controlsRef && controlsRef.current) {
          controlsRef.current.target.add(moveVec)
          controlsRef.current.update()
        }
      }
    }
  })

  return null
}
