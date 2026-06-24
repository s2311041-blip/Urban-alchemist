import { useCallback, useRef } from 'react';
import { isTerrainShape, normalizeTerrainShape } from '../constants/terrainData';
import { computeTerrainPlacementY, getIslandTopYAt, snapTerrainPosition } from '../utils/terrainPlacement';
import { useGameStore } from '../store/useGameStore';
import { snapManualQuestPosition } from '../store/helpers/questLifecycle';
import { commitQuestPlacement } from '../store/helpers/questPlacement';
import { setTimedToast } from '../store/helpers/uiFeedback';
import { findClosestBlock } from '../store/helpers/blockProtection';

/**
 * 建築・クエスト配置時の地面クリック / ポインタ移動（ホバー位置・消去/編集ターゲット）
 */
export function useBuildPointerPlacement() {
  const lastPointerMoveMsRef = useRef(0);

  const setHoveredIdsSafely = useCallback((deleteId, editId) => {
    const current = useGameStore.getState();
    if (current.hoveredDeleteBlockId !== deleteId) {
      current.setHoveredDeleteBlockId(deleteId);
    }
    if (current.hoveredEditBlockId !== editId) {
      current.setHoveredEditBlockId(editId);
    }
  }, []);

  const handleGroundClick = useCallback((e) => {
    const current = useGameStore.getState();
    if (current.selectedShape === 'diagonal' && current.isDesigningDiagonal) return;

    if (current.placingPresetArchetype) {
      e.stopPropagation();
      return;
    }

    if (current.placingQuest && !current.buildMode) {
      e.stopPropagation();
      return;
    } else if (current.buildMode) {
      e.stopPropagation();
      if (current.selectedShape === 'edit' && current.selectedEditBlockId) {
        current.finishEditingInStudio();
      }
    }
  }, []);

  const handleGroundDoubleClick = useCallback((e) => {
    e.stopPropagation();
    const current = useGameStore.getState();
    if (current.placingPresetArchetype) {
      if (current.hoverPosition) {
        current.commitPlacingPreset(current.hoverPosition);
      } else {
        setTimedToast({
          set: useGameStore.setState,
          get: useGameStore.getState,
          message: '島の上を選んでからダブルクリックしてください。',
          durationMs: 2200,
        });
      }
      return;
    }
    if (current.placingQuest && !current.buildMode) {
      const questPos = current.hoverPosition
        ?? snapManualQuestPosition(e.point, current.islandChunks);
      commitQuestPlacement(questPos, {
        getState: useGameStore.getState,
        setState: useGameStore.setState,
      });
      return;
    }
    if (current.buildMode && current.hoverPosition) {
      if (current.selectedShape === 'diagonal' && current.isDesigningDiagonal) return;
      if (current.selectedShape === 'edit') return;
      if (current.isAdjustingSize) {
        if (!current.previewFixedPos) {
          current.setPreviewFixedPos(current.hoverPosition);
        } else {
          current.placeBlockAtHover(current.previewFixedPos);
          current.setIsAdjustingSize(false);
        }
        return;
      }
      current.placeBlockAtHover(current.hoverPosition);
    }
  }, []);

  const handlePointerMove = useCallback((e, normal = null) => {
    const current = useGameStore.getState();
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - lastPointerMoveMsRef.current < 16) return;
    lastPointerMoveMsRef.current = now;

    if (current.isTransforming) return;
    if (!current.buildMode && !current.placingQuest && !current.placingPresetArchetype) return;

    e.stopPropagation();

    if (current.placingPresetArchetype) {
      const presetPos = snapManualQuestPosition(e.point, current.islandChunks);
      if (!presetPos) {
        if (current.hoverPosition) current.setHoverPosition(null);
        return;
      }
      const prevHover = current.hoverPosition;
      const hoverChanged = !prevHover
        || Math.abs(prevHover[0] - presetPos[0]) > 0.001
        || Math.abs(prevHover[1] - presetPos[1]) > 0.001
        || Math.abs(prevHover[2] - presetPos[2]) > 0.001;
      if (hoverChanged) current.setHoverPosition(presetPos);
      return;
    }

    if (current.placingQuest) {
      const questPos = snapManualQuestPosition(e.point, current.islandChunks);
      if (!questPos) {
        if (current.hoverPosition) current.setHoverPosition(null);
        return;
      }
      const prevHover = current.hoverPosition;
      const hoverChanged = !prevHover
        || Math.abs(prevHover[0] - questPos[0]) > 0.001
        || Math.abs(prevHover[1] - questPos[1]) > 0.001
        || Math.abs(prevHover[2] - questPos[2]) > 0.001;
      if (hoverChanged) current.setHoverPosition(questPos);
      return;
    }
    const gridSize = 0.5;
    const point = e.point.clone();
    const isTallTree = current.selectedShape === 'street_tree' || current.selectedShape === 'canopy_tree';
    if (normal) {
      if (current.selectedShape !== 'eraser' && current.selectedShape !== 'edit') {
        const lift = isTallTree ? 0.08 : (0.25 * current.selectedScale[1]);
        point.add(normal.clone().multiplyScalar(lift));
      } else {
        point.sub(normal.clone().multiplyScalar(0.25 * 1.0));
      }
    }

    let finalPos = [point.x, point.y, point.z];
    const terrainSelected = isTerrainShape(current.selectedShape);
    const terrainShape = terrainSelected ? normalizeTerrainShape(current.selectedShape) : null;
    const sandSeaPlaceMode = current.selectedMaterial === 'sand'
      && !terrainSelected
      && current.selectedShape !== 'ferry_dock'
      && current.selectedShape !== 'hoverboard_station'
      && current.selectedShape !== 'edit'
      && current.selectedShape !== 'eraser'
      && current.selectedShape !== 'area_select';

    if (current.gridSnapping) {
      const snapX = Math.floor(point.x / gridSize) * gridSize + (gridSize / 2);
      const snapY = Math.floor(point.y / gridSize) * gridSize + (gridSize / 2);
      const snapZ = Math.floor(point.z / gridSize) * gridSize + (gridSize / 2);

      if (terrainSelected) {
        finalPos = snapTerrainPosition(terrainShape, current.selectedScale, snapX, snapZ, current.islandChunks);
      } else if (current.selectedShape === 'ferry_dock') {
        const topY = getIslandTopYAt(snapX, snapZ, current.islandChunks);
        finalPos = [snapX, topY + 0.25, snapZ];
      } else if (isTallTree) {
        const topY = getIslandTopYAt(snapX, snapZ, current.islandChunks);
        const sy = Number.isFinite(current.selectedScale?.[1]) ? current.selectedScale[1] : 1;
        const treeBottomLocal = current.selectedShape === 'canopy_tree' ? -0.27 : -0.21;
        const y = Number((topY - treeBottomLocal * sy + 0.01).toFixed(3));
        finalPos = [snapX, y, snapZ];
      } else {
        const minY = (current.selectedShape === 'path' || current.selectedShape === 'rail') ? 0.01 : (0.25 * (current.selectedShape === 'eraser' || current.selectedShape === 'edit' ? 1.0 : current.selectedScale[1]));
        finalPos = [snapX, sandSeaPlaceMode ? snapY : Math.max(minY, snapY), snapZ];
      }
    } else if (terrainSelected) {
      const topY = getIslandTopYAt(point.x, point.z, current.islandChunks);
      const y = computeTerrainPlacementY(terrainShape, current.selectedScale, topY);
      finalPos = [point.x, y, point.z];
    } else if (current.selectedShape === 'ferry_dock') {
      const topY = getIslandTopYAt(point.x, point.z, current.islandChunks);
      finalPos = [point.x, topY + 0.25, point.z];
    } else if (isTallTree) {
      const topY = getIslandTopYAt(point.x, point.z, current.islandChunks);
      const sy = Number.isFinite(current.selectedScale?.[1]) ? current.selectedScale[1] : 1;
      const treeBottomLocal = current.selectedShape === 'canopy_tree' ? -0.27 : -0.21;
      const y = Number((topY - treeBottomLocal * sy + 0.01).toFixed(3));
      finalPos = [point.x, y, point.z];
    } else {
      const minY = (current.selectedShape === 'path' || current.selectedShape === 'rail') ? 0.01 : (0.25 * (current.selectedShape === 'eraser' || current.selectedShape === 'edit' ? 1.0 : current.selectedScale[1]));
      finalPos = [point.x, sandSeaPlaceMode ? point.y : Math.max(minY, point.y), point.z];
    }

    const prevHover = current.hoverPosition;
    const hoverChanged = !prevHover
      || Math.abs(prevHover[0] - finalPos[0]) > 0.001
      || Math.abs(prevHover[1] - finalPos[1]) > 0.001
      || Math.abs(prevHover[2] - finalPos[2]) > 0.001;
    if (hoverChanged) {
      current.setHoverPosition(finalPos);
    }

    if (current.selectedEditBlockId) {
      setHoveredIdsSafely(null, null);
    } else if (current.selectedShape === 'eraser') {
      const closestBlock = findClosestBlock({
        blocks: current.placedBlocks,
        targetPos: finalPos,
        maxDist: 1.0,
        allowLocked: false,
      });
      setHoveredIdsSafely(closestBlock ? closestBlock.id : null, null);
    } else if (current.selectedShape === 'edit') {
      let closestBlock = null;
      let minDist = 1.0;
      current.placedBlocks.forEach((b) => {
        const dist = Math.sqrt(
          (b.pos[0] - finalPos[0]) ** 2
          + (b.pos[1] - finalPos[1]) ** 2
          + (b.pos[2] - finalPos[2]) ** 2,
        );
        if (dist < minDist) {
          minDist = dist;
          closestBlock = b;
        }
      });
      setHoveredIdsSafely(null, closestBlock ? closestBlock.id : null);
    } else {
      setHoveredIdsSafely(null, null);
    }
  }, [setHoveredIdsSafely]);

  return {
    handleGroundClick,
    handleGroundDoubleClick,
    handlePointerMove,
  };
}
