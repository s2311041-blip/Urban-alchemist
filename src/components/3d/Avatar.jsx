import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { getIslandTopYAt } from '../../utils/terrainPlacement';
import { getBoatSpawnFromDock } from '../../utils/ferryDockPlacement';
import { getHoverboardGlowFromBlock } from '../../utils/hoverboardGlow';
import { ART_DIRECTION } from '../../constants/buildFeatureFlags';
import { VoxelAvatarBody } from './avatar/VoxelAvatarBody';

const AVATAR_FOOT_OFFSET = 0.9;
const FALL_RESPAWN_Y = -4;
const RECOVER_MS = 900;
const RESPAWN_COOLDOWN_MS = 1500;
const INTERACT_RADIUS_FERRY = 2.5;
const INTERACT_RADIUS_HOVERBOARD = 2.0;
const HINT_UPDATE_MS = 120;
const SEA_SURFACE_Y = -3.5;
const SWIM_TARGET_Y = SEA_SURFACE_Y + 0.9;
const SWIM_MIN_Y = SEA_SURFACE_Y - 0.4;
const SHORE_ASSIST_RADIUS = 1.7;
/** 船移動は地上歩行と同じ速度・カメラ相対入力 */
const BOAT_WALK_SPEED = 4;
const SHORE_SNAP_COOLDOWN_MS = 900;
const SHORE_Y_DEADZONE = 0.08;

export const Avatar = ({ controlsRef, buildMode, viewMode, avatarPos, activeBug, expandingLevel, isHoverboarding, setIsHoverboarding, placedBlocks = [] }) => {
  const [, get] = useKeyboardControls()
  const islandChunks = useGameStore((state) => state.islandChunks);
  const avatarResetNonce = useGameStore((state) => state.avatarResetNonce);
  const setInteractionHint = useGameStore((state) => state.setInteractionHint);
  const setCurrentHoverboardStationId = useGameStore((state) => state.setCurrentHoverboardStationId);
  const setMapPlayerPos = useGameStore((state) => state.setMapPlayerPos);
  const setMapBoatPos = useGameStore((state) => state.setMapBoatPos);
  const setMapHeading = useGameStore((state) => state.setMapHeading);
  const currentHoverboardStationId = useGameStore((state) => state.currentHoverboardStationId);
  const hoverboardGlow = useMemo(() => {
    const station = placedBlocks.find((block) => block.id === currentHoverboardStationId);
    return getHoverboardGlowFromBlock(station ?? {});
  }, [placedBlocks, currentHoverboardStationId]);
  const rbRef = useRef()
  const meshRef = useRef()
  const raycasterRef = useRef(new THREE.Raycaster())
  const { scene } = useThree()

  const wasJumpRef = useRef(false)
  const recoverUntilRef = useRef(0)
  const respawnCooldownUntilRef = useRef(0)
  const isGroundedRef = useRef(false)
  const lastResetNonceRef = useRef(avatarResetNonce)

  const lastAutoStepTime = useRef(0)
  const lastAutoStepY = useRef(null)
  const bogSlowUntil = useRef(0)
  const speedMultiplierRef = useRef(1)
  const lastHintUpdateMsRef = useRef(0)
  const ferryRideRef = useRef(null)
  const shoreSnapCooldownUntilRef = useRef(0)
  const lastShoreSnapKeyRef = useRef(null)
  const lastSentPosRef = useRef([0, 0])
  const lastSentHeadingRef = useRef(0)
  const [isFerryRiding, setIsFerryRiding] = useState(false)

  const distance2D = useCallback((a, b) => {
    const ax = a?.x ?? a?.[0] ?? 0;
    const az = a?.z ?? a?.[2] ?? 0;
    const bx = b?.x ?? b?.[0] ?? 0;
    const bz = b?.z ?? b?.[2] ?? 0;
    return Math.hypot(ax - bx, az - bz);
  }, []);

  const findNearestDockInRange = useCallback((pos, radius = INTERACT_RADIUS_FERRY) => {
    let nearest = null;
    let nearestDist = radius;
    placedBlocks.forEach((block) => {
      if (block?.shape !== 'ferry_dock' || !Array.isArray(block?.pos)) return;
      const dist = distance2D(pos, block.pos);
      if (dist <= nearestDist) {
        nearest = block;
        nearestDist = dist;
      }
    });
    return nearest;
  }, [placedBlocks, distance2D]);

  const findNearestShoreAnchorInRange = (pos, radius = SHORE_ASSIST_RADIUS) => {
    let nearest = null;
    let nearestDist = radius;
    placedBlocks.forEach((block) => {
      if (!Array.isArray(block?.pos)) return;
      const isBeach = block?.shape === 'beach_tile';
      const isSandMat = block?.material === 'sand';
      if (!isBeach && !isSandMat) return;
      const dist = distance2D(pos, block.pos);
      if (dist <= nearestDist) {
        nearest = block;
        nearestDist = dist;
      }
    });
    return nearest;
  };

  const findNearestChunkShorePoint = (pos, radius = SHORE_ASSIST_RADIUS) => {
    let best = null;
    let bestDist = radius;
    islandChunks.forEach((chunk) => {
      if (!Array.isArray(chunk?.pos) || !Array.isArray(chunk?.size)) return;
      const halfX = (chunk.size[0] ?? 10) / 2;
      const halfZ = (chunk.size[2] ?? 10) / 2;
      const cx = chunk.pos[0] ?? 0;
      const cz = chunk.pos[2] ?? 0;
      const x = THREE.MathUtils.clamp(pos.x, cx - halfX, cx + halfX);
      const z = THREE.MathUtils.clamp(pos.z, cz - halfZ, cz + halfZ);
      const dist = Math.hypot(pos.x - x, pos.z - z);
      const nearEdge = Math.abs(Math.abs(x - cx) - halfX) < 0.05 || Math.abs(Math.abs(z - cz) - halfZ) < 0.05;
      if (!nearEdge) return;
      if (dist <= bestDist) {
        best = { x, z };
        bestDist = dist;
      }
    });
    return best;
  };

  const isStandingOnSandSupport = (pos, groundHit) => {
    const nearSandBlock = placedBlocks.some((block) => {
      if (!Array.isArray(block?.pos)) return false;
      if (block.shape === 'beach_tile') {
        const sx = Array.isArray(block.scale) && Number.isFinite(block.scale[0]) ? block.scale[0] : 1;
        const sz = Array.isArray(block.scale) && Number.isFinite(block.scale[2]) ? block.scale[2] : 1;
        const halfX = 0.62 * sx + 0.08;
        const halfZ = 0.62 * sz + 0.08;
        return Math.abs(pos.x - block.pos[0]) <= halfX
          && Math.abs(pos.z - block.pos[2]) <= halfZ
          && Math.abs(pos.y - (block.pos[1] ?? 0)) <= 1.45;
      }
      if (block.material !== 'sand') return false;
      const sx = Array.isArray(block.scale) && Number.isFinite(block.scale[0]) ? block.scale[0] : 1;
      const sz = Array.isArray(block.scale) && Number.isFinite(block.scale[2]) ? block.scale[2] : 1;
      const halfX = 0.36 * sx + 0.16;
      const halfZ = 0.36 * sz + 0.16;
      return Math.abs(pos.x - block.pos[0]) <= halfX
        && Math.abs(pos.z - block.pos[2]) <= halfZ
        && Math.abs(pos.y - (block.pos[1] ?? 0)) <= 1.45;
    });
    if (nearSandBlock) return true;

    if (!groundHit || !groundHit.point) return false;
    const hitTerrain = getTerrainShapeFromObject(groundHit.object);
    if (hitTerrain === 'beach_tile') return true;
    if (groundHit.distance <= 0.42 && hitTerrain === 'bog_tile') return false;
    return false;
  };

  const isInsideChunk = (x, z, chunk) => {
    if (!chunk?.pos || !chunk?.size) return false;
    const halfX = (chunk.size[0] ?? 10) / 2;
    const halfZ = (chunk.size[2] ?? 10) / 2;
    return Math.abs(x - (chunk.pos[0] ?? 0)) <= halfX && Math.abs(z - (chunk.pos[2] ?? 0)) <= halfZ;
  };

  const getCenterIslandSpawn = useCallback(() => {
    const centerChunk = islandChunks.find((chunk) => chunk.id === 'center') ?? islandChunks[0];
    const cx = centerChunk?.pos?.[0] ?? 0;
    const cz = centerChunk?.pos?.[2] ?? 0;
    const topY = getIslandTopYAt(cx, cz, islandChunks);
    return { x: cx, y: topY + AVATAR_FOOT_OFFSET, z: cz };
  }, [islandChunks]);

  const getSafeSpawnPoint = useCallback((preferred = null, forceCenter = false) => {
    if (forceCenter) return getCenterIslandSpawn();

    const prefX = Number.isFinite(preferred?.x) ? preferred.x : 0;
    const prefZ = Number.isFinite(preferred?.z) ? preferred.z : 2;

    const onChunk = islandChunks.find((chunk) => isInsideChunk(prefX, prefZ, chunk));
    if (onChunk) {
      const topY = getIslandTopYAt(prefX, prefZ, islandChunks);
      return { x: prefX, y: topY + AVATAR_FOOT_OFFSET, z: prefZ };
    }

    const nearest = islandChunks.reduce((best, chunk) => {
      if (!chunk?.pos) return best;
      const dist = Math.hypot((chunk.pos[0] ?? 0) - prefX, (chunk.pos[2] ?? 0) - prefZ);
      if (!best || dist < best.dist) return { chunk, dist };
      return best;
    }, null)?.chunk ?? islandChunks.find((chunk) => chunk.id === 'center') ?? islandChunks[0];

    const cx = nearest?.pos?.[0] ?? 0;
    const cz = nearest?.pos?.[2] ?? 2;
    const topY = getIslandTopYAt(cx, cz, islandChunks);
    return { x: cx, y: topY + AVATAR_FOOT_OFFSET, z: cz };
  }, [getCenterIslandSpawn, islandChunks]);

  const getAvatarBasePos = useCallback(() => {
    const safe = getCenterIslandSpawn();
    return [safe.x, safe.y, safe.z];
  }, [getCenterIslandSpawn]);
  const initialSpawnPos = getAvatarBasePos();

  const resetPhysicsState = useCallback(() => {
    if (!rbRef.current) return;
    rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    rbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    rbRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
  }, []);

  const followTpsCamera = useCallback((nextPos, cameraObj) => {
    if (!controlsRef.current || viewMode !== 'tps' || activeBug || expandingLevel !== 0) return;
    const diffX = nextPos.x - avatarPos.current.x;
    const diffZ = nextPos.z - avatarPos.current.z;
    cameraObj.position.x += diffX;
    cameraObj.position.z += diffZ;
    const targetY = THREE.MathUtils.lerp(controlsRef.current.target.y, nextPos.y + 1, 0.15);
    controlsRef.current.target.set(nextPos.x, targetY, nextPos.z);
  }, [controlsRef, viewMode, activeBug, expandingLevel, avatarPos]);

  const startFerryBoatAtDock = useCallback((dock) => {
    if (!dock || !rbRef.current) return;
    const spawn = getBoatSpawnFromDock(dock, islandChunks);
    if (!spawn) return;

    ferryRideRef.current = {
      sourceDock: dock,
      pos: { x: spawn.x, z: spawn.z },
    };
    if (meshRef.current) {
      meshRef.current.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), spawn.heading);
    }
    const nextY = SEA_SURFACE_Y + 0.45;
    rbRef.current.setTranslation({ x: spawn.x, y: nextY, z: spawn.z }, true);
    resetPhysicsState();
    recoverUntilRef.current = Date.now() + RECOVER_MS;
    respawnCooldownUntilRef.current = Date.now() + RESPAWN_COOLDOWN_MS;
    setInteractionHint('矢印: 移動  E: 停船');
    setIsFerryRiding(true);
    setIsHoverboarding(false);
    setCurrentHoverboardStationId(null);
    setMapBoatPos([spawn.x, spawn.z]);
    setMapPlayerPos([spawn.x, spawn.z]);
    setMapHeading(spawn.heading);
    if (controlsRef.current?.object) {
      followTpsCamera({ x: spawn.x, y: nextY, z: spawn.z }, controlsRef.current.object);
    }
    avatarPos.current.set(spawn.x, nextY, spawn.z);
  }, [
    islandChunks,
    resetPhysicsState,
    setInteractionHint,
    setIsHoverboarding,
    setCurrentHoverboardStationId,
    setMapBoatPos,
    setMapPlayerPos,
    setMapHeading,
    followTpsCamera,
    controlsRef,
    avatarPos,
  ]);

  const finishFerryRideAtDock = useCallback((dock) => {
    if (!dock || !rbRef.current) return;
    const topY = getIslandTopYAt(dock.pos[0], dock.pos[2], islandChunks);
    const target = { x: dock.pos[0], y: topY + AVATAR_FOOT_OFFSET, z: dock.pos[2] };
    rbRef.current.setTranslation(target, true);
    resetPhysicsState();
    ferryRideRef.current = null;
    setIsFerryRiding(false);
    setInteractionHint(null);
    if (meshRef.current) {
      meshRef.current.rotation.y = 0;
    }
    setMapBoatPos(null);
    setMapPlayerPos([target.x, target.z]);
    setMapHeading(0);
    if (controlsRef.current?.object) {
      followTpsCamera(target, controlsRef.current.object);
    }
    avatarPos.current.set(target.x, target.y, target.z);
  }, [
    islandChunks,
    resetPhysicsState,
    setInteractionHint,
    setMapBoatPos,
    setMapPlayerPos,
    setMapHeading,
    followTpsCamera,
    controlsRef,
    avatarPos,
  ]);

  const recoverAvatarAtSpawn = useCallback((preferred = null, forceCenter = false) => {
    if (!rbRef.current) return;
    const nowMs = Date.now();
    const safe = getSafeSpawnPoint(preferred, forceCenter);
    const spawnY = safe.y + 0.35;

    recoverUntilRef.current = nowMs + RECOVER_MS;
    respawnCooldownUntilRef.current = nowMs + RESPAWN_COOLDOWN_MS;
    wasJumpRef.current = false;

    rbRef.current.setTranslation({ x: safe.x, y: spawnY, z: safe.z }, true);
    resetPhysicsState();

    if (controlsRef.current?.object) {
      controlsRef.current.object.position.set(safe.x, spawnY + 5.5, safe.z + 8);
    }
    if (controlsRef.current) {
      controlsRef.current.target.set(safe.x, safe.y + 0.2, safe.z);
    }
    avatarPos.current.set(safe.x, spawnY, safe.z);
  }, [getSafeSpawnPoint, resetPhysicsState, controlsRef, avatarPos]);

  const getDirectionOffset = (f, b, l, r) => {
    let directionOffset = 0
    if (f) {
      if (l) directionOffset = Math.PI / 4
      else if (r) directionOffset = -Math.PI / 4
    } else if (b) {
      if (l) directionOffset = Math.PI / 4 + Math.PI / 2
      else if (r) directionOffset = -Math.PI / 4 - Math.PI / 2
      else directionOffset = Math.PI
    } else if (l) directionOffset = Math.PI / 2
    else if (r) directionOffset = -Math.PI / 2
    return directionOffset
  }

  const getTerrainShapeFromObject = (obj) => {
    let p = obj
    while (p) {
      if (p.userData?.terrainShape) return p.userData.terrainShape
      p = p.parent
    }
    return null
  }

  const isIgnoredHitObject = (obj) => {
    let p = obj
    while (p) {
      if (p.name === 'avatar' || p.userData?.isGhost || p.userData?.isAvatar) return true
      p = p.parent
    }
    return false
  }

  const castGroundHit = (originY, pos) => {
    raycasterRef.current.set(
      new THREE.Vector3(pos.x, originY, pos.z),
      new THREE.Vector3(0, -1, 0),
    );
    const hits = raycasterRef.current.intersectObjects(scene.children, true);
    return hits.find((hit) => !isIgnoredHitObject(hit.object)) ?? null;
  };

  useEffect(() => {
    if (avatarResetNonce === lastResetNonceRef.current) return;
    lastResetNonceRef.current = avatarResetNonce;
    const center = getCenterIslandSpawn();
    avatarPos.current.set(center.x, center.y, center.z);
    requestAnimationFrame(() => {
      if (!rbRef.current) return;
      recoverAvatarAtSpawn(null, true);
    });
  }, [avatarResetNonce, islandChunks, avatarPos, getCenterIslandSpawn, recoverAvatarAtSpawn]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code !== 'KeyE' || buildMode || viewMode !== 'tps') return;

      if (isFerryRiding && ferryRideRef.current) {
        const pos = rbRef.current?.translation();
        const nearDock = pos ? findNearestDockInRange(pos, INTERACT_RADIUS_FERRY) : null;
        if (nearDock) {
          finishFerryRideAtDock(nearDock);
        } else {
          setInteractionHint('停船所の近くで E を押すと下船できます');
        }
        return;
      }

      if (isHoverboarding) {
        setIsHoverboarding(false);
        setCurrentHoverboardStationId(null);
        return;
      }

      if (!rbRef.current) return;
      const pos = rbRef.current.translation();
      const nearFerryDock = findNearestDockInRange(pos, INTERACT_RADIUS_FERRY);
      if (nearFerryDock) {
        startFerryBoatAtDock(nearFerryDock);
        return;
      }

      const station = placedBlocks
        .filter((b) => (
          b.shape === 'hoverboard_station'
          && Array.isArray(b.pos)
          && distance2D(pos, b.pos) < INTERACT_RADIUS_HOVERBOARD
        ))
        .sort((a, b) => distance2D(pos, a.pos) - distance2D(pos, b.pos))[0];
      if (station) {
        setIsHoverboarding(true);
        setCurrentHoverboardStationId(station.id ?? null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      setInteractionHint(null);
    };
  }, [
    avatarPos,
    buildMode,
    controlsRef,
    isHoverboarding,
    isFerryRiding,
    islandChunks,
    placedBlocks,
    setCurrentHoverboardStationId,
    setInteractionHint,
    setIsHoverboarding,
    distance2D,
    findNearestDockInRange,
    finishFerryRideAtDock,
    startFerryBoatAtDock,
    viewMode,
  ]);

  useFrame((state, delta) => {
    if (buildMode || viewMode !== 'tps') return;
    if (!rbRef.current) return;

    const pos = rbRef.current.translation();
    const nowMs = Date.now();
    const recovering = nowMs < recoverUntilRef.current;
    const groundHit = castGroundHit(pos.y + 0.55, pos);
    isGroundedRef.current = !!groundHit && groundHit.distance < 0.55;
    const onAnyChunk = islandChunks.some((chunk) => isInsideChunk(pos.x, pos.z, chunk));
    const onSandSupport = isStandingOnSandSupport(pos, groundHit);
    const isSeaSwimming = !onAnyChunk && !onSandSupport && pos.y < 0.8 && pos.y > SWIM_MIN_Y;

    const ride = ferryRideRef.current;
    if (ride) {
      const raw = get();
      const forward = !!raw.forward;
      const backward = !!raw.backward;
      const left = !!raw.left;
      const right = !!raw.right;
      const moveInputActive = forward || backward || left || right;

      if (moveInputActive) {
        const angleYCameraDirection = Math.atan2(
          (state.camera.position.x - ride.pos.x),
          (state.camera.position.z - ride.pos.z),
        );
        const directionOffset = getDirectionOffset(forward, backward, left, right);
        const rotateQuat = new THREE.Quaternion();
        rotateQuat.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          angleYCameraDirection + directionOffset + Math.PI,
        );
        if (meshRef.current) {
          meshRef.current.quaternion.rotateTowards(rotateQuat, 0.2);
        }
        const moveDir = new THREE.Vector3(0, 0, 1).applyQuaternion(rotateQuat).normalize();
        ride.pos.x += moveDir.x * BOAT_WALK_SPEED * delta;
        ride.pos.z += moveDir.z * BOAT_WALK_SPEED * delta;
      }

      const nextX = ride.pos.x;
      const nextZ = ride.pos.z;
      const nextY = SEA_SURFACE_Y + 0.45 + Math.sin(state.clock.elapsedTime * 3.1) * 0.05;

      rbRef.current.setTranslation({ x: nextX, y: nextY, z: nextZ }, true);
      resetPhysicsState();

      let mapHeading = 0;
      if (meshRef.current) {
        const euler = new THREE.Euler().setFromQuaternion(meshRef.current.quaternion, 'YXZ');
        mapHeading = euler.y;
      }

      setMapBoatPos([nextX, nextZ]);
      setMapPlayerPos([nextX, nextZ]);
      setMapHeading(mapHeading);
      followTpsCamera({ x: nextX, y: nextY, z: nextZ }, state.camera);
      avatarPos.current.set(nextX, nextY, nextZ);

      const nearDock = findNearestDockInRange({ x: nextX, z: nextZ }, INTERACT_RADIUS_FERRY);
      setInteractionHint(nearDock ? '矢印: 移動  E: 停船' : '矢印: 移動  停船所へ');
      return;
    }

    if (!buildMode && viewMode === 'tps' && nowMs - lastHintUpdateMsRef.current > HINT_UPDATE_MS) {
      lastHintUpdateMsRef.current = nowMs;
      const nearFerryDock = findNearestDockInRange(pos, INTERACT_RADIUS_FERRY);
      if (isSeaSwimming) {
        setInteractionHint('泳いでいます… 岸へ戻ろう');
      } else if (nearFerryDock) {
        setInteractionHint('E: 船を出す');
      } else {
        setInteractionHint(null);
      }
    }

    if (pos.y < FALL_RESPAWN_Y && nowMs >= respawnCooldownUntilRef.current) {
      const nearestDock = placedBlocks
        .filter((block) => block?.shape === 'ferry_dock' && Array.isArray(block?.pos))
        .sort((a, b) => distance2D(pos, a.pos) - distance2D(pos, b.pos))[0];
      if (nearestDock) {
        recoverAvatarAtSpawn({ x: nearestDock.pos[0], z: nearestDock.pos[2] });
      } else {
        recoverAvatarAtSpawn({ x: pos.x, z: pos.z });
      }
      return;
    }

    if (recovering) {
      wasJumpRef.current = !!get().jump;
      resetPhysicsState();
      avatarPos.current.set(pos.x, pos.y, pos.z);
      return;
    }

    const raw = get();
    const jumpPressed = !!raw.jump && !wasJumpRef.current;
    wasJumpRef.current = !!raw.jump;

    const activeTag = document.activeElement?.tagName;
    const focusOnUi = activeTag && activeTag !== 'BODY' && activeTag !== 'HTML';
    if (jumpPressed && !focusOnUi && isGroundedRef.current && !isSeaSwimming) {
      const jumpForce = isHoverboarding ? 1.5 : 0.8;
      rbRef.current.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true);
    }

    const forward = !!raw.forward;
    const backward = !!raw.backward;
    const left = !!raw.left;
    const right = !!raw.right;
    const moveInputActive = forward || backward || left || right;
    const currentVel = rbRef.current.linvel();
    const walkVelocity = new THREE.Vector3(0, 0, 0);
    const nearbyShoreAnchor = isSeaSwimming ? findNearestShoreAnchorInRange(pos, SHORE_ASSIST_RADIUS) : null;
    const nearbyChunkShore = isSeaSwimming ? findNearestChunkShorePoint(pos, SHORE_ASSIST_RADIUS) : null;

    let speedMultiplier = 1;
    if (!isHoverboarding) {
      const groundTerrainShape = groundHit ? getTerrainShapeFromObject(groundHit.object) : null;
      const now = state.clock.elapsedTime;
      if (groundTerrainShape === 'bog_tile') {
        bogSlowUntil.current = now + 0.16;
      }
      const onBog = now < bogSlowUntil.current;
      const targetMultiplier = onBog ? 0.45 : 1;
      const smooth = 1 - Math.exp(-delta * 16);
      speedMultiplierRef.current = THREE.MathUtils.lerp(speedMultiplierRef.current, targetMultiplier, smooth);
      speedMultiplier = speedMultiplierRef.current;
    } else {
      speedMultiplierRef.current = 1;
    }

    if (moveInputActive) {
      const angleYCameraDirection = Math.atan2(
        (state.camera.position.x - pos.x),
        (state.camera.position.z - pos.z),
      );
      const directionOffset = getDirectionOffset(forward, backward, left, right);

      const rotateQuat = new THREE.Quaternion();
      rotateQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleYCameraDirection + directionOffset + Math.PI);

      if (meshRef.current) {
        meshRef.current.quaternion.rotateTowards(rotateQuat, 0.2);
      }

      const swimMultiplier = isSeaSwimming ? 0.4 : 1;
      const speed = (isHoverboarding ? 12 : 4) * speedMultiplier * swimMultiplier;
      walkVelocity.set(0, 0, 1).applyQuaternion(rotateQuat).normalize().multiplyScalar(speed);
    }

    let swimYVel = isSeaSwimming
      ? THREE.MathUtils.clamp((SWIM_TARGET_Y - pos.y) * 2.2, -0.95, 0.95)
      : currentVel.y;
    if (isSeaSwimming && moveInputActive && (nearbyShoreAnchor || nearbyChunkShore)) {
      const anchorX = nearbyShoreAnchor?.pos?.[0] ?? nearbyChunkShore?.x ?? pos.x;
      const anchorZ = nearbyShoreAnchor?.pos?.[2] ?? nearbyChunkShore?.z ?? pos.z;
      const toShore = new THREE.Vector2(anchorX - pos.x, anchorZ - pos.z);
      const toShoreLen = Math.max(0.001, toShore.length());
      const toShoreNormX = toShore.x / toShoreLen;
      const toShoreNormZ = toShore.y / toShoreLen;
      const moveLen = Math.hypot(walkVelocity.x, walkVelocity.z);
      const moveNormX = moveLen > 0.0001 ? walkVelocity.x / moveLen : 0;
      const moveNormZ = moveLen > 0.0001 ? walkVelocity.z / moveLen : 0;
      const towardShoreDot = moveNormX * toShoreNormX + moveNormZ * toShoreNormZ;
      const movingTowardShore = towardShoreDot > 0.12;
      if (movingTowardShore) {
        const assistFactor = THREE.MathUtils.clamp(1 - (toShoreLen / SHORE_ASSIST_RADIUS), 0.08, 1);
        walkVelocity.x += toShoreNormX * 2.2 * assistFactor;
        walkVelocity.z += toShoreNormZ * 2.2 * assistFactor;

      const shoreTopY = nearbyShoreAnchor
          ? Math.max(
            getIslandTopYAt(anchorX, anchorZ, islandChunks) + AVATAR_FOOT_OFFSET,
            (nearbyShoreAnchor.pos?.[1] ?? 0) + 0.42,
          )
          : getIslandTopYAt(anchorX, anchorZ, islandChunks) + AVATAR_FOOT_OFFSET;
      const dyToShore = shoreTopY - pos.y;
      if (Math.abs(dyToShore) > SHORE_Y_DEADZONE) {
        swimYVel = THREE.MathUtils.clamp(dyToShore * (2.8 + assistFactor), -0.45, 2.3);
      } else {
        swimYVel = THREE.MathUtils.lerp(swimYVel, 0, 0.5);
      }
      const snapKey = `${Math.round(anchorX * 4)}_${Math.round(anchorZ * 4)}`;
      if (
        toShoreLen < 0.68
        && pos.y > SWIM_TARGET_Y - 0.12
        && nowMs >= shoreSnapCooldownUntilRef.current
        && lastShoreSnapKeyRef.current !== snapKey
      ) {
          rbRef.current.setTranslation({
            x: anchorX,
            y: shoreTopY,
            z: anchorZ,
          }, true);
          rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          avatarPos.current.set(anchorX, shoreTopY, anchorZ);
        shoreSnapCooldownUntilRef.current = nowMs + SHORE_SNAP_COOLDOWN_MS;
        lastShoreSnapKeyRef.current = snapKey;
          return;
        }
      }
    }
    rbRef.current.setLinvel({ x: walkVelocity.x, y: swimYVel, z: walkVelocity.z }, true);

    if (walkVelocity.lengthSq() > 0.001 && isGroundedRef.current && !isSeaSwimming) {
      const dir = new THREE.Vector3(walkVelocity.x, 0, walkVelocity.z).normalize();
      const rayOrigin = new THREE.Vector3(pos.x + dir.x * 0.35, pos.y + 0.8, pos.z + dir.z * 0.35);
      raycasterRef.current.set(rayOrigin, new THREE.Vector3(0, -1, 0));
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      const validHits = intersects.filter((hit) => !isIgnoredHitObject(hit.object));
      const onHill = validHits.some((hit) => getTerrainShapeFromObject(hit.object) === 'hill');

      if (!onHill && validHits.length > 0) {
        const hit = validHits[0];
        const hitY = hit.point.y;
        const stepHeight = hitY - pos.y;

        const now = state.clock.elapsedTime;
        const elapsed = now - lastAutoStepTime.current;
        const targetY = hitY + 0.02;
        const targetDelta = targetY - pos.y;
        const repeatedSameHeight =
          lastAutoStepY.current !== null &&
          Math.abs(targetY - lastAutoStepY.current) < 0.03;

        if (
          stepHeight > 0.1 &&
          stepHeight <= 0.35 &&
          targetDelta > 0.08 &&
          elapsed > 0.14 &&
          !repeatedSameHeight
        ) {
          rbRef.current.setTranslation({ x: pos.x, y: targetY, z: pos.z }, true);
          rbRef.current.setLinvel({ x: walkVelocity.x, y: 0, z: walkVelocity.z }, true);
          lastAutoStepTime.current = now;
          lastAutoStepY.current = targetY;
        }
      }
    }

    if (controlsRef.current && viewMode === 'tps' && !activeBug && expandingLevel === 0) {
      followTpsCamera(pos, state.camera);
    }
    const heading = meshRef.current?.rotation?.y ?? 0;
    const dx = pos.x - lastSentPosRef.current[0];
    const dz = pos.z - lastSentPosRef.current[1];
    const dh = heading - lastSentHeadingRef.current;

    // 位置や向きが一定以上変化した場合のみストアを更新する
    if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
      setMapPlayerPos([pos.x, pos.z]);
      lastSentPosRef.current = [pos.x, pos.z];
    }
    if (Math.abs(dh) > 0.02) {
      setMapHeading(Number.isFinite(heading) ? heading : 0);
      lastSentHeadingRef.current = heading;
    }
    setMapBoatPos(null);

    avatarPos.current.set(pos.x, pos.y, pos.z);
  });

  return (
    <RigidBody
      ref={rbRef}
      position={initialSpawnPos}
      type="dynamic"
      colliders={false}
      ccd
      gravityScale={buildMode ? 0 : 1}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.2, 0.25]} position={[0, 0.45, 0]} />
      <group ref={meshRef} name="avatar" visible={!buildMode}>
        {ART_DIRECTION.enabled ? (
          <VoxelAvatarBody
            isHoverboarding={isHoverboarding}
            isFerryRiding={isFerryRiding}
            hoverboardGlow={hoverboardGlow}
          />
        ) : (
          <>
            <mesh position={[0, 0.4, 0]} castShadow>
              <capsuleGeometry args={[0.25, 0.4, 4, 16]} />
              <meshStandardMaterial color="#64b5f6" roughness={0.6} />
            </mesh>
            <mesh position={[0, 1.05, 0]} castShadow>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial color="#ffccbc" />
            </mesh>
          </>
        )}
      </group>
    </RigidBody>
  );
};
