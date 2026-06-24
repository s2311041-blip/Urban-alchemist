import React, { useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BakeShadows, OrbitControls, ContactShadows, Html } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import * as THREE from 'three'
import { Ocean } from './Environment'
import { Block } from './Block'
import { Island } from './Island'
import { Avatar } from './Avatar'
import { useGameStore } from '../../store/useGameStore'
import { useShallow } from 'zustand/react/shallow'
import { StudioEditor, PreviewGizmoEditor } from './Gizmos'
import { isAgriShape, isConnectableAgriShape } from '../../constants/agriData'
import { SEED_COST } from '../../constants/economyData'
import { isTerrainShape, isConnectableTerrainShape } from '../../constants/terrainData'
import { getCardinalNeighbors } from '../../utils/gridNeighbors'
import { DayNightEnvironment } from './environment/DayNightEnvironment'
import { GamePostProcessing } from './postprocessing/GamePostProcessing'
import { SceneErrorBoundary } from './SceneErrorBoundary'
import { CONTACT_SHADOWS } from '../../constants/artDirection'
import { ART_DIRECTION } from '../../constants/buildFeatureFlags'
import { WorldTimeTicker } from './environment/WorldTimeTicker'
import { WorldProximityHints } from './WorldProximityHints'
import { WORLD_PROXIMITY_HINT_STYLE } from '../../constants/worldHintStyles'
import { BUILD_ORBIT, GOD_ISO_ORBIT, TPS_ORBIT } from '../../constants/cameraControls'
import { BugOrb } from './BugOrb'
import { PLACE_ARCHETYPE_LABELS } from '../../utils/placePresets'
import {
  isPresetExpressionResolved,
  shouldHidePresetExpressionAccent,
} from '../../utils/placeNeedTypeStyle'
import { isNatureShape } from '../../constants/natureData'
import { InstancedBlocks } from './InstancedBlocks'
import { BuildModePreviews } from './BuildModePreviews'

// We will use standard React-Three-Drei useKeyboardControls if imported.
import { useKeyboardControls } from '@react-three/drei'

const GameCameraPanController = ({ buildMode, viewMode, controlsRef, disableKeys }) => {
  const [, get] = useKeyboardControls();
  const { camera } = useThree();
  
  useFrame((state, delta) => {
    if ((!buildMode && viewMode !== 'god') || !controlsRef.current || disableKeys) return;
    const keys = get();
    const { forward, backward, left, right } = keys;
    if (forward || backward || left || right) {
      const speed = 15 * delta;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      
      const rightDir = new THREE.Vector3();
      rightDir.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
      
      const moveVec = new THREE.Vector3();
      if (forward) moveVec.add(dir);
      if (backward) moveVec.sub(dir);
      if (left) moveVec.sub(rightDir);
      if (right) moveVec.add(rightDir);
      
      moveVec.normalize().multiplyScalar(speed);
      
      camera.position.add(moveVec);
      controlsRef.current.target.add(moveVec);
    }
  });
  return null;
};

export const MainGameScene = ({
  controlsRef,
  avatarPos,
  handleGroundClick,
  handlePointerMove,
  onDoubleClick
}) => {
  const {
    viewMode,
    buildMode,
    islandChunks,
    selectedShape,
    activeBug,
    expandingLevel,
    isHoverboarding,
    setIsHoverboarding,
    placedBlocks,
    selectedEditBlockId,
    hoveredDeleteBlockId,
    hoveredEditBlockId,
    studioScale,
    studioPositionOffset,
    studioShape,
    studioMaterial,
    setHoverPosition,
    setHoveredDeleteBlockId,
    setHoveredEditBlockId,
    setSelectedEditBlockId,
    setSelectedMaterial,
    setSelectedScale,
    setStudioScale,
    setStudioStartScale,
    setStudioPositionOffset,
    setStudioMaterial,
    setStudioShape,
    setIsEditingInStudio,
    initStudioHistory,
    setBlockRotation,
    blockRotation,
    selectedScale,
    selectedMaterial,
    saveToUndoStack,
    setPlacedBlocks,
    areaFirstPoint,
    areaHeightOffset,
    areaAction,
    clipboardBlocks,
    isDesigningDiagonal,
    customDiagonalPoints,
    bugs,
    quests,
    placingQuest,
    placingPresetArchetype,
    isEditingInStudio,
    setActiveBug,
    isQuestBoardOpen,
    isARMode,
    isGoodSpotBookOpen,
    isReturning,
    isTransforming,
    setIsTransforming,
    selectedAreaBlocks,
    isAdjustingSize,
    selectedNatureSpecies,
    selectedNatureColors,
    selectedAgriColors,
    selectedTerrainColors,
    selectedHoverboardColor,
    harvestAgriBlock,
    plantAgriBlock,
    interactionMode,
    setFarmingToast,
  } = useGameStore(useShallow(state => ({
    viewMode: state.viewMode,
    buildMode: state.buildMode,
    islandChunks: state.islandChunks,
    selectedShape: state.selectedShape,
    activeBug: state.activeBug,
    expandingLevel: state.expandingLevel,
    isHoverboarding: state.isHoverboarding,
    setIsHoverboarding: state.setIsHoverboarding,
    placedBlocks: state.placedBlocks,
    studioScale: state.studioScale,
    studioPositionOffset: state.studioPositionOffset,
    studioShape: state.studioShape,
    studioMaterial: state.studioMaterial,
    setStudioScale: state.setStudioScale,
    setStudioStartScale: state.setStudioStartScale,
    setStudioPositionOffset: state.setStudioPositionOffset,
    setStudioMaterial: state.setStudioMaterial,
    setStudioShape: state.setStudioShape,
    setIsEditingInStudio: state.setIsEditingInStudio,
    initStudioHistory: state.initStudioHistory,
    setHoverPosition: state.setHoverPosition,
    setBlockRotation: state.setBlockRotation,
    blockRotation: state.blockRotation,
    selectedScale: state.selectedScale,
    selectedMaterial: state.selectedMaterial,
    saveToUndoStack: state.saveToUndoStack,
    setPlacedBlocks: state.setPlacedBlocks,
    bugs: state.bugs,
    quests: state.quests,
    isEditingInStudio: state.isEditingInStudio,
    setActiveBug: state.setActiveBug,
    isQuestBoardOpen: state.isQuestBoardOpen,
    isARMode: state.isARMode,
    isGoodSpotBookOpen: state.isGoodSpotBookOpen,
    isReturning: state.isReturning,
    harvestAgriBlock: state.harvestAgriBlock,
    plantAgriBlock: state.plantAgriBlock,
    interactionMode: state.interactionMode,
    setFarmingToast: state.setFarmingToast,
    areaFirstPoint: state.areaFirstPoint,
    areaHeightOffset: state.areaHeightOffset,
    areaAction: state.areaAction,
    clipboardBlocks: state.clipboardBlocks,
    isDesigningDiagonal: state.isDesigningDiagonal,
    customDiagonalPoints: state.customDiagonalPoints,
    placingQuest: state.placingQuest,
    placingPresetArchetype: state.placingPresetArchetype,
    isTransforming: state.isTransforming,
    setIsTransforming: state.setIsTransforming,
    selectedAreaBlocks: state.selectedAreaBlocks,
    isAdjustingSize: state.isAdjustingSize,
    selectedNatureSpecies: state.selectedNatureSpecies,
    selectedNatureColors: state.selectedNatureColors,
    selectedAgriColors: state.selectedAgriColors,
    selectedTerrainColors: state.selectedTerrainColors,
    selectedHoverboardColor: state.selectedHoverboardColor,
  })));

  const neighborById = useMemo(() => {
    const map = new Map();
    placedBlocks.forEach((block) => {
      if (isConnectableAgriShape(block.shape) || isConnectableTerrainShape(block.shape) || block.shape === 'rail') {
        map.set(block.id, getCardinalNeighbors(block, placedBlocks));
      }
    });
    return map;
  }, [placedBlocks]);

  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const hasNewlyPlaced = placedBlocks.some(b => Date.now() - (b.placedAt || 0) < 1000);
    if (!hasNewlyPlaced) return;
    const timer = setInterval(() => {
      const stillHasNewlyPlaced = useGameStore.getState().placedBlocks.some(b => Date.now() - (b.placedAt || 0) < 1000);
      if (stillHasNewlyPlaced) {
        forceUpdate(prev => prev + 1);
      } else {
        clearInterval(timer);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [placedBlocks]);

  const { instancedBlocks, individualBlocks } = useMemo(() => {
    const instanced = [];
    const individual = [];
    
    placedBlocks.forEach((block) => {
      const shape = block.shape || 'block';

      // 1. 配置から1秒以内のブロックは個別Blockとして描画（アニメーションを再生するため）
      const isNewlyPlaced = Date.now() - (block.placedAt || 0) < 1000;
      if (isNewlyPlaced) {
        individual.push(block);
        return;
      }

      // 2. 特殊なインタラクティブ形状（ドア、ホバーボードステーション、フェリーポート、施設レイアウトなど）
      const isSpecialShape = [
        'door', 'hoverboard_station', 'ferry_dock', 'rail', 'bench', 'light_pole', 'sign_post',
        'station_layout', 'station_platform', 'station_stairs', 'station_gate', 'station_building',
        'bus_stop_layout', 'plaza_layout', 'road_layout', 'lane_layout', 'park_layout',
        'waterfront_layout', 'campus_layout', 'commerce_layout'
      ].includes(shape);

      if (isSpecialShape) {
        individual.push(block);
        return;
      }

      // 3. 自然、農業、地形系
      if (isNatureShape(shape) || isAgriShape(shape) || isTerrainShape(shape)) {
        individual.push(block);
        return;
      }

      // その他（通常の block, half, pole, slope, path）は InstancedMesh として高速描画
      instanced.push(block);
    });

    return { instancedBlocks: instanced, individualBlocks: individual };
  }, [placedBlocks]);

  const showBugExperienceHints = !activeBug
    && !placingQuest
    && !placingPresetArchetype
    && !buildMode
    && !isQuestBoardOpen
    && !isARMode
    && !isGoodSpotBookOpen
    && !isReturning
    && expandingLevel === 0
    && !isTransforming;

  return (
    <SceneErrorBoundary>
      <DayNightEnvironment />
      <GamePostProcessing />
      <WorldTimeTicker />

      <Physics>
        <Ocean
          onPointerMove={buildMode && selectedMaterial === 'sand' ? (e) => {
            e.stopPropagation();
            handlePointerMove(e, new THREE.Vector3(0, 1, 0));
          } : undefined}
          onClick={buildMode && selectedMaterial === 'sand' ? handleGroundClick : undefined}
          onDoubleClick={buildMode && selectedMaterial === 'sand' ? onDoubleClick : undefined}
        />
        <group>
          <Island 
            islandChunks={islandChunks}
            onGroundClick={handleGroundClick}
            onDoubleClick={onDoubleClick}
            onPointerMove={(e) => {
              e.stopPropagation();
              let normal = e.face ? e.face.normal.clone().applyQuaternion(e.object.quaternion) : new THREE.Vector3(0, 1, 0);
              if (normal.y > 0.1) normal.set(0, 1, 0); 
              handlePointerMove(e, normal);
            }}
            setHoverPosition={setHoverPosition}
            isPlacing={!!placingQuest || (!!buildMode && selectedShape !== 'eraser' && selectedShape !== 'edit')}
            buildMode={buildMode || !!placingQuest} 
          />
          <Avatar 
            controlsRef={controlsRef} 
            buildMode={buildMode} 
            viewMode={viewMode} 
            avatarPos={avatarPos} 
            activeBug={activeBug} 
            expandingLevel={expandingLevel} 
            isHoverboarding={isHoverboarding} 
            setIsHoverboarding={setIsHoverboarding} 
            placedBlocks={placedBlocks} 
          />
          <WorldProximityHints />

          <InstancedBlocks blocks={instancedBlocks} />

          {individualBlocks.map(block => {
            if (shouldHidePresetExpressionAccent(block, quests)) return null;
            const isSelected = block.id === selectedEditBlockId;
            const sharedNeighbors = neighborById.get(block.id) ?? null;
            const agriNeighbors = isConnectableAgriShape(block.shape) ? sharedNeighbors : null;
            const terrainNeighbors = isConnectableTerrainShape(block.shape) ? sharedNeighbors : null;
            const railNeighbors = block.shape === 'rail' ? sharedNeighbors : null;
            if (isSelected && isEditingInStudio) {
              return (
                <StudioEditor
                  key={block.id}
                  basePosition={block.pos}
                  studioScale={studioScale}
                  setStudioScale={setStudioScale}
                  studioPositionOffset={studioPositionOffset}
                  setStudioPositionOffset={setStudioPositionOffset}
                  studioShape={studioShape}
                  studioMaterial={studioMaterial}
                  blockRotation={blockRotation}
                  setIsTransforming={setIsTransforming}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (selectedShape === 'edit') {
                      useGameStore.getState().finishEditingInStudio();
                    }
                  }}
                />
              );
            }
            const agriPhase = block.agri?.phase;
            const agriHarvestable = !!block.agri?.harvestable;
            const agriActionable = !buildMode && isAgriShape(block.shape)
              && (agriHarvestable || (interactionMode === 'plant' && agriPhase === 'fallow'));
            return (
              <Block 
                key={block.id}
                id={block.id}
                position={block.pos}
                shape={block.shape || 'block'} 
                material={block.material || 'stone'} 
                rotation={block.rotation || 0} 
                scale={block.scale || [1, 1, 1]}
                isGhost={false} 
                selectedEditBlockId={isSelected}
                diagonalPoints={block.diagonalPoints}
                nature={block.nature}
                agri={block.agri}
                terrain={block.terrain}
                hoverboard={block.hoverboard}
                presetNeedType={block.presetNeedType ?? null}
                presetExpressionResolved={isPresetExpressionResolved(block, quests)}
                agriNeighbors={isConnectableAgriShape(block.shape) ? sharedNeighbors : null}
                terrainNeighbors={isConnectableTerrainShape(block.shape) ? sharedNeighbors : null}
                railNeighbors={block.shape === 'rail' ? sharedNeighbors : null}
                onPointerMove={buildMode ? (e) => { 
                  e.stopPropagation(); 
                  let normal = e.face ? e.face.normal.clone().applyQuaternion(e.object.quaternion) : null;
                  
                  if (block.shape === 'path' || block.shape === 'rail' || isAgriShape(block.shape) || isTerrainShape(block.shape)) {
                    e.point.y = block.pos[1] + 0.25;
                    normal = new THREE.Vector3(0, 1, 0);
                  } else if (normal && normal.y > 0.1 && (block.shape === 'diagonal' || block.shape === 'slope')) {
                    normal.set(0, 1, 0);
                  }
                  handlePointerMove(e, normal); 
                } : (agriActionable ? () => {
                  document.body.style.cursor = 'pointer';
                } : undefined)} 
                onPointerOut={buildMode ? () => { document.body.style.cursor = 'auto'; } : () => { document.body.style.cursor = 'auto'; }}
                onPointerDown={buildMode ? (e) => {
                  e.stopPropagation();
                  if (selectedShape === 'diagonal' && isDesigningDiagonal) return;
                  if (isAdjustingSize && !previewFixedPos) {
                    setPreviewFixedPos(useGameStore.getState().hoverPosition);
                    return;
                  }

                  if (selectedShape === 'edit') {
                    if (selectedEditBlockId === block.id) {
                      // 編集中のブロックをダブルクリックしたら完了して保存
                      useGameStore.getState().finishEditingInStudio();
                    } else {
                      // 未編集または別のブロックをダブルクリックしたら編集を開始
                      setSelectedEditBlockId(block.id);
                      setSelectedMaterial(block.material);
                      setSelectedScale(block.scale || [1, 1, 1]);
                      setStudioScale(block.scale || [1, 1, 1]);
                      setStudioStartScale(block.scale || [1, 1, 1]);
                      setStudioPositionOffset([0, 0, 0]);
                      setStudioMaterial(block.material || 'stone');
                      setStudioShape(block.shape || 'block');
                      initStudioHistory(block.scale || [1, 1, 1], [0, 0, 0], block.material || 'stone', block.shape || 'block');
                      setIsEditingInStudio(true);
                      setBlockRotation(block.rotation || 0);
                    }
                  } else if (selectedShape === 'eraser') {
                    if (selectedEditBlockId) return;
                    if (block.presetLocked) {
                      const message = '場所セットは削除できません。';
                      setFarmingToast(message);
                      window.setTimeout(() => {
                        if (useGameStore.getState().farmingToast === message) setFarmingToast(null);
                      }, 2200);
                      return;
                    }
                    saveToUndoStack();
                    setPlacedBlocks(placedBlocks.filter(b => b.id !== block.id));
                  } else if (selectedShape === 'area_select') {
                    if (selectedEditBlockId) return;
                    const targetPos = useGameStore.getState().hoverPosition || block.pos;
                    useGameStore.getState().placeBlockAtHover(targetPos);
                  } else {
                    if (selectedEditBlockId) return;
                    if (onDoubleClick) onDoubleClick(e);
                  }
                } : (e) => {
                  if (!isAgriShape(block.shape)) {
                    if (onDoubleClick) onDoubleClick(e);
                    return;
                  }
                  e.stopPropagation();
                  const harvested = harvestAgriBlock(block.id);
                  if (!harvested && interactionMode === 'plant' && agriPhase === 'fallow') {
                    plantAgriBlock(block.id);
                    return;
                  }
                  if (onDoubleClick) onDoubleClick(e);
                }}
                onClick={!buildMode ? () => {
                  if (!isAgriShape(block.shape)) return;
                  const harvested = harvestAgriBlock(block.id);
                  if (harvested) return;
                  if (interactionMode !== 'plant' || agriPhase !== 'fallow') return;
                  const blockId = block.id;
                  const hint = `ダブルクリックで種まき（種代 ${SEED_COST}コイン）`;
                  window.setTimeout(() => {
                    const state = useGameStore.getState();
                    const target = state.placedBlocks.find((b) => b.id === blockId);
                    if (state.interactionMode !== 'plant' || target?.agri?.phase !== 'fallow') return;
                    setFarmingToast(hint);
                    window.setTimeout(() => {
                      if (useGameStore.getState().farmingToast === hint) setFarmingToast(null);
                    }, 2200);
                  }, 320);
                } : undefined}
              />
            );
          })}

          <BuildModePreviews islandChunks={islandChunks} />
          
          {bugs.map(bug => 
            !bug.solved && Array.isArray(bug?.pos) && bug.pos.length === 3 && (
              <group key={bug.id}>
                <BugOrb
                  bug={bug}
                  position={bug.pos}
                  onClick={(e) => {
                    if (showBugExperienceHints) {
                      e.stopPropagation();
                      setActiveBug(bug.id);
                    }
                  }}
                  onPointerOver={() => { if (showBugExperienceHints) document.body.style.cursor = 'pointer' }}
                  onPointerOut={() => { if (showBugExperienceHints) document.body.style.cursor = 'auto' }}
                />
                
                {!showBugExperienceHints ? null : (
                  <Html position={[bug.pos[0], bug.pos[1] + 0.6, bug.pos[2]]} center>
                    <div style={{ ...WORLD_PROXIMITY_HINT_STYLE, animation: 'bounce 2s infinite' }}>
                      タップして追体験
                    </div>
                  </Html>
                )}
              </group>
            )
          )}
        </group>
      </Physics>
      
      {!buildMode && <BakeShadows />}
      
      
      <GameCameraPanController
        buildMode={buildMode}
        viewMode={viewMode}
        controlsRef={controlsRef}
        disableKeys={selectedShape === 'area_select' && areaFirstPoint !== null}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={
          viewMode === 'tps' && !buildMode
            ? TPS_ORBIT.maxPolarAngle
            : (viewMode === 'god' && ART_DIRECTION.useIsometricGodView ? GOD_ISO_ORBIT.maxPolarAngle : BUILD_ORBIT.maxPolarAngle)
        }
        minPolarAngle={viewMode === 'god' && ART_DIRECTION.useIsometricGodView ? GOD_ISO_ORBIT.minPolarAngle : 0}
        minDistance={
          viewMode === 'tps' && !buildMode
            ? TPS_ORBIT.minDistance
            : (viewMode === 'god' && ART_DIRECTION.useIsometricGodView ? GOD_ISO_ORBIT.minDistance : BUILD_ORBIT.minDistance)
        }
        maxDistance={
          viewMode === 'tps' && !buildMode
            ? TPS_ORBIT.maxDistance
            : (viewMode === 'god' && ART_DIRECTION.useIsometricGodView ? GOD_ISO_ORBIT.maxDistance : BUILD_ORBIT.maxDistance)
        }
        enabled={!activeBug && !isQuestBoardOpen && expandingLevel === 0 && !isTransforming}
        enablePan
        enableZoom
        enableRotate
        zoomSpeed={
          viewMode === 'tps' && !buildMode
            ? TPS_ORBIT.zoomSpeed
            : (viewMode === 'god' && ART_DIRECTION.useIsometricGodView ? GOD_ISO_ORBIT.zoomSpeed : BUILD_ORBIT.zoomSpeed)
        }
        dollyToCursor={viewMode === 'tps' && !buildMode}
        mouseButtons={{ 
          LEFT: THREE.MOUSE.ROTATE, 
          MIDDLE: THREE.MOUSE.DOLLY, 
          RIGHT: THREE.MOUSE.PAN 
        }}
      />
    </SceneErrorBoundary>
  );
};
