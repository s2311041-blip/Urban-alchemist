import { isNatureShape, SHAPE_META } from '../../constants/natureData'
import { isAgriShape, AGRI_META } from '../../constants/agriData'
import {
  isTerrainShape,
  normalizeTerrainShape,
  TERRAIN_META,
} from '../../constants/terrainData'
import { patchStateWithFerryRoutes, syncFerryRoutesForBlocks } from '../helpers/syncFerryRoutes'
import { buildStandardBlockPayload } from '../../utils/placement/buildBlockPayload'
import { computeFerryAutoDockBlocks } from '../../utils/placement/ferryAutoDockPlacement'
import { realignAllFerryDocks } from '../../utils/ferryDockPlacement'
import { setTimedToast } from '../helpers/uiFeedback'
import { findClosestBlock, isPresetLockedBlock } from '../helpers/blockProtection'
import { ENABLE_FREE_BUILD_PLACE_PRESETS } from '../../constants/buildFeatureFlags'
import { PLACE_PRESET_TEMPLATES } from '../../constants/placePresetTemplates'
import {
  createPresetForQuestPlacement,
  hasExistingPlaceSite,
  PLACE_ARCHETYPE_ALIASES,
  PLACE_ARCHETYPE_LABELS,
} from '../../utils/placePresets'




export const createBuildSlice = (set, get) => ({
  setSelectedShape: (shape) => {
    const { lastDiagonalPoints } = get();
    set({
      selectedShape: shape,
      interactionMode: null,
      selectedEditBlockId: null,
      isAdjustingSize: false,
      previewFixedPos: null,
      areaFirstPoint: (shape !== 'area_place' && shape !== 'area_erase') ? null : get().areaFirstPoint,
      areaHeightOffset: (shape !== 'area_place' && shape !== 'area_erase') ? 0 : get().areaHeightOffset,
      selectedScale: (isNatureShape(shape) && SHAPE_META[shape]?.defaultScale)
        ? [...SHAPE_META[shape].defaultScale]
        : (isAgriShape(shape) && AGRI_META[shape]?.defaultScale)
          ? [...AGRI_META[shape].defaultScale]
          : (isTerrainShape(shape) && TERRAIN_META[normalizeTerrainShape(shape)]?.defaultScale)
            ? [...TERRAIN_META[normalizeTerrainShape(shape)].defaultScale]
            : [1, 1, 1], // ブロック変更時はサイズをデフォルトにリセット
      ...(isAgriShape(shape) && AGRI_META[shape]?.defaultMaterial
        ? { selectedMaterial: AGRI_META[shape].defaultMaterial }
        : {}),
      ...(isTerrainShape(shape) && TERRAIN_META[normalizeTerrainShape(shape)]?.defaultMaterial
        ? { selectedMaterial: TERRAIN_META[normalizeTerrainShape(shape)].defaultMaterial }
        : {}),
    });

    if (shape === 'diagonal') {
      set({
        diagonalGuidePos: [0, 0.25, 0],
        isDesigningInStudio: true,
      });

      if (lastDiagonalPoints) {
        set({
          customDiagonalPoints: lastDiagonalPoints,
          isDesigningDiagonal: false,
          diagonalFirstPoint: null
        });
      } else {
        set({
          customDiagonalPoints: null,
          isDesigningDiagonal: true,
          diagonalFirstPoint: null
        });
      }
    } else {
      set({
        isDesigningInStudio: false,
        diagonalGuidePos: null
      });
    }
  },

  addToHistory: (block) => {
    set(state => {
      const filtered = state.recentBlocks.filter(b => b.shape !== block.shape);
      return { recentBlocks: [block, ...filtered].slice(0, 3) };
    });
  },

  saveToUndoStack: (currentBlocks = get().placedBlocks) => {
    const snapshot = JSON.parse(JSON.stringify(currentBlocks));
    set(state => ({
      undoStack: [...state.undoStack, snapshot].slice(-30),
      redoStack: []
    }));
  },

  handleUndo: () => {
    const { undoStack, placedBlocks } = get();
    if (undoStack.length === 0) return;

    const nextStack = [...undoStack];
    const previousState = nextStack.pop();
    const currentSnapshot = JSON.parse(JSON.stringify(placedBlocks));

    set(state => ({
      undoStack: nextStack,
      redoStack: [...state.redoStack, currentSnapshot],
      placedBlocks: previousState,
      ferryRoutes: syncFerryRoutesForBlocks(previousState, state.islandChunks),
    }));
  },

  handleRedo: () => {
    const { redoStack, placedBlocks } = get();
    if (redoStack.length === 0) return;

    const nextStack = [...redoStack];
    const nextState = nextStack.pop();
    const currentSnapshot = JSON.parse(JSON.stringify(placedBlocks));

    set(state => ({
      redoStack: nextStack,
      undoStack: [...state.undoStack, currentSnapshot],
      placedBlocks: nextState,
      ferryRoutes: syncFerryRoutesForBlocks(nextState, state.islandChunks),
    }));
  },

  handleSelectAnchorPoint: (worldPt) => {
    const { customDiagonalPoints, isDesigningDiagonal, diagonalFirstPoint, diagonalGuidePos } = get();
    if (customDiagonalPoints || !isDesigningDiagonal) {
      set({
        customDiagonalPoints: null,
        isDesigningDiagonal: true,
        diagonalFirstPoint: worldPt,
        hoveredAnchor: null
      });
      return;
    }

    if (!diagonalFirstPoint) {
      set({ diagonalFirstPoint: worldPt });
    } else {
      const p1 = diagonalFirstPoint;
      const p2 = worldPt;

      if (diagonalGuidePos) {
        const localP1 = [
          p1[0] - diagonalGuidePos[0],
          p1[1] - diagonalGuidePos[1],
          p1[2] - diagonalGuidePos[2]
        ];
        const localP2 = [
          p2[0] - diagonalGuidePos[0],
          p2[1] - diagonalGuidePos[1],
          p2[2] - diagonalGuidePos[2]
        ];

        set({
          customDiagonalPoints: [localP1, localP2],
          isDesigningDiagonal: false,
          isDesigningInStudio: false
        });

        // 斜め履歴に保存
        const p0 = localP1;
        const pts = [localP1, localP2];
        const { recentDiagonals } = get();
        const isDuplicate = recentDiagonals.some(item => {
          const ip0 = item[0];
          const ip1 = item[1];
          const matchDirect = 
            Math.abs(ip0[0] - p0[0]) < 0.01 && Math.abs(ip0[1] - p0[1]) < 0.01 && Math.abs(ip0[2] - p0[2]) < 0.01 &&
            Math.abs(ip1[0] - pts[1][0]) < 0.01 && Math.abs(ip1[1] - pts[1][1]) < 0.01 && Math.abs(ip1[2] - pts[1][2]) < 0.01;
          const matchReverse = 
            Math.abs(ip0[0] - pts[1][0]) < 0.01 && Math.abs(ip0[1] - pts[1][1]) < 0.01 && Math.abs(ip0[2] - pts[1][2]) < 0.01 &&
            Math.abs(ip1[0] - p0[0]) < 0.01 && Math.abs(ip1[1] - p0[1]) < 0.01 && Math.abs(ip1[2] - p0[2]) < 0.01;
          return matchDirect || matchReverse;
        });

        if (!isDuplicate) {
          set({ recentDiagonals: [pts, ...recentDiagonals].slice(0, 5) });
        }
      }

      set({
        diagonalFirstPoint: null,
        hoveredAnchor: null
      });
    }
  },

  confirmDesigningDiagonal: () => {
    const { customDiagonalPoints } = get();
    if (customDiagonalPoints) {
      set({
        lastDiagonalPoints: customDiagonalPoints,
        isDesigningInStudio: false,
        isDesigningDiagonal: false
      });
    }
  },

  finishEditingInStudio: () => {
    const { selectedEditBlockId, studioPositionOffset, studioMaterial, studioShape, studioScale, placedBlocks } = get();
    if (!selectedEditBlockId) return;

    get().saveToUndoStack();

    const updatedBlocks = placedBlocks.map(b => {
      if (b.id === selectedEditBlockId) {
        const newPos = [
          b.pos[0] + studioPositionOffset[0],
          b.pos[1] + studioPositionOffset[1],
          b.pos[2] + studioPositionOffset[2]
        ];

        const updated = {
          ...b,
          material: studioMaterial,
          shape: studioShape,
          scale: [...studioScale],
          pos: newPos
        };

        if (studioShape !== 'diagonal') {
          delete updated.diagonalPoints;
        } else if (!updated.diagonalPoints) {
          updated.diagonalPoints = [
            [newPos[0] - 0.25, newPos[1] - 0.25, newPos[2] - 0.25],
            [newPos[0] + 0.25, newPos[1] + 0.25, newPos[2] + 0.25]
          ];
        }
        return updated;
      }
      return b;
    });

    set((state) => ({
      placedBlocks: updatedBlocks,
      ferryRoutes: syncFerryRoutesForBlocks(updatedBlocks, state.islandChunks),
      isEditingInStudio: false,
      selectedEditBlockId: null
    }));
  },

  cancelEditingInStudio: () => {
    set({
      isEditingInStudio: false,
      selectedEditBlockId: null
    });
  },

  cancelDesigningInStudio: () => {
    set({
      isDesigningInStudio: false,
      customDiagonalPoints: null,
      diagonalFirstPoint: null
    });
    get().setSelectedShape('block');
  },

  placeBlockAtHover: (targetPos = get().hoverPosition) => {
    if (!targetPos) return;
    set({ buildFinishError: null });
    const { selectedEditBlockId, selectedShape, isDesigningDiagonal, customDiagonalPoints, selectedMaterial, selectedGlassColor, selectedScale, blockRotation, placedBlocks, clipboardBlocks, areaAction, selectedAreaBlocks, areaFirstPoint, areaHeightOffset, selectedNatureSpecies, selectedNatureColors, selectedAgriColors, selectedTerrainColors, selectedHoverboardColor, worldTime, islandChunks } = get();

    if (selectedEditBlockId) return;
    if (selectedShape === 'diagonal' && isDesigningDiagonal) return;

    let finalPos = [...targetPos];
    if (get().isAdjustingSize && get().previewPositionOffset) {
      finalPos[0] += get().previewPositionOffset[0];
      finalPos[1] += get().previewPositionOffset[1];
      finalPos[2] += get().previewPositionOffset[2];
    }

    if (selectedShape === 'eraser') {
      const closestBlock = findClosestBlock({
        blocks: placedBlocks,
        targetPos: finalPos,
        maxDist: 1.0,
        allowLocked: true,
      });
      if (closestBlock) {
        if (isPresetLockedBlock(closestBlock)) {
          const message = '場所セットは削除できません。';
          setTimedToast({ set, get, message });
          return;
        }
        get().saveToUndoStack();
        const nextPlacedBlocks = placedBlocks.filter(b => b.id !== closestBlock.id);
        set((state) => patchStateWithFerryRoutes(state, nextPlacedBlocks));
      }
    } else if (selectedShape === 'edit') {
      set({ selectedEditBlockId: null });
    } else if (selectedShape === 'area_select') {
      if (areaAction) {
        get().saveToUndoStack();
        const newBlocks = clipboardBlocks.map(b => ({
          ...b,
          id: Math.random().toString(),
          pos: [
            finalPos[0] + b.relativePos[0],
            finalPos[1] + b.relativePos[1],
            finalPos[2] + b.relativePos[2]
          ],
          placedAt: Date.now()
        }));
        
        let updated = [...placedBlocks];
        if (areaAction === 'move') {
          const selectedIds = selectedAreaBlocks.map(sb => sb.id);
          updated = updated.filter(pb => !selectedIds.includes(pb.id));
        }
        
        const nextPlacedBlocks = [...updated, ...newBlocks];
        set((state) => patchStateWithFerryRoutes(state, nextPlacedBlocks));

        if (areaAction === 'move') {
          set({
            clipboardBlocks: [],
            selectedAreaBlocks: null,
            areaAction: null,
            areaFirstPoint: null,
            areaHeightOffset: 0
          });
        }
        return;
      }

      if (!areaFirstPoint) {
        set({
          areaFirstPoint: finalPos,
          selectedAreaBlocks: null
        });
      } else {
        const adjustedTargetY = finalPos[1] + areaHeightOffset;
        const xMin = Math.min(areaFirstPoint[0], finalPos[0]);
        const xMax = Math.max(areaFirstPoint[0], finalPos[0]);
        const yMin = Math.min(areaFirstPoint[1], adjustedTargetY);
        const yMax = Math.max(areaFirstPoint[1], adjustedTargetY);
        const zMin = Math.min(areaFirstPoint[2], finalPos[2]);
        const zMax = Math.max(areaFirstPoint[2], finalPos[2]);

        const selected = [];
        placedBlocks.forEach(b => {
          if (
            b.pos[0] >= xMin - 0.05 && b.pos[0] <= xMax + 0.05 &&
            b.pos[1] >= yMin - 0.05 && b.pos[1] <= yMax + 0.05 &&
            b.pos[2] >= zMin - 0.05 && b.pos[2] <= zMax + 0.05
          ) {
            selected.push(b);
          }
        });

        set({ selectedAreaBlocks: selected });
      }
    } else if (selectedShape === 'diagonal') {
      if (!isDesigningDiagonal && customDiagonalPoints) {
        get().saveToUndoStack();
        const newBlock = {
          id: Math.random().toString(),
          pos: [...finalPos],
          shape: 'diagonal',
          material: selectedMaterial,
          ...(selectedMaterial === 'glass' && selectedGlassColor ? { glassColor: selectedGlassColor } : {}),
          rotation: 0,
          scale: [...selectedScale],
          diagonalPoints: [
            [finalPos[0] + customDiagonalPoints[0][0], finalPos[1] + customDiagonalPoints[0][1], finalPos[2] + customDiagonalPoints[0][2]],
            [finalPos[0] + customDiagonalPoints[1][0], finalPos[1] + customDiagonalPoints[1][1], finalPos[2] + customDiagonalPoints[1][2]]
          ],
          placedAt: Date.now()
        };
        get().addToHistory(newBlock);
        const nextPlacedBlocks = [...placedBlocks, newBlock];
        set((state) => patchStateWithFerryRoutes(state, nextPlacedBlocks));
      }
    } else {
      const exists = placedBlocks.some(b => 
        Math.abs(b.pos[0] - finalPos[0]) < 0.05 && 
        Math.abs(b.pos[1] - finalPos[1]) < 0.05 && 
        Math.abs(b.pos[2] - finalPos[2]) < 0.05
      );
      if (!exists) {
        get().saveToUndoStack();
        const newBlock = buildStandardBlockPayload({
          selectedShape,
          selectedMaterial,
          blockRotation,
          selectedScale,
          finalPos,
          worldTime,
          selectedNatureSpecies,
          selectedNatureColors,
          selectedAgriColors,
          selectedTerrainColors,
          selectedHoverboardColor,
          selectedGlassColor,
          islandChunks,
        });
        get().addToHistory(newBlock);
        const { autoDockBlocks, islandToast } = computeFerryAutoDockBlocks({
          newBlock,
          placedBlocks,
          islandChunks,
          activeRemoteHubId: get().activeRemoteHubId,
          selectedMaterial,
          selectedScale,
        });
        const nextPlacedBlocks = [...placedBlocks, newBlock, ...autoDockBlocks];
        const realignedBlocks = realignAllFerryDocks(nextPlacedBlocks, islandChunks);
        set({
          placedBlocks: realignedBlocks,
          ferryRoutes: syncFerryRoutesForBlocks(realignedBlocks, islandChunks),
          previewPositionOffset: [0, 0, 0],
          ...(islandToast ? { islandToast } : {}),
        });
        if (islandToast) {
          setTimeout(() => {
            if (get().islandToast === islandToast) set({ islandToast: null });
          }, 4200);
        }
      }
    }
  },

  handleAreaDelete: () => {
    const { selectedAreaBlocks, placedBlocks } = get();
    const selectedIds = selectedAreaBlocks ? selectedAreaBlocks.map(b => b.id) : [];
    const protectedIds = new Set(
      placedBlocks.filter((b) => selectedIds.includes(b.id) && b.presetLocked).map((b) => b.id),
    );
    const deletableIds = selectedIds.filter((id) => !protectedIds.has(id));
    if (deletableIds.length === 0) {
      const message = protectedIds.size > 0
        ? '選択範囲は場所セットのため削除できません。'
        : '削除できるブロックが選択されていません。';
      setTimedToast({ set, get, message });
      return;
    }
    get().saveToUndoStack();
    const nextPlacedBlocks = placedBlocks.filter(b => !deletableIds.includes(b.id));
    set((state) => patchStateWithFerryRoutes(state, nextPlacedBlocks, {
      selectedAreaBlocks: null,
      areaFirstPoint: null,
      areaHeightOffset: 0,
      areaAction: null,
    }));
    if (protectedIds.size > 0) {
      const message = '場所セットは残して、選択範囲の一部を削除しました。';
      setTimedToast({ set, get, message });
    }
  },

  handleAreaCopy: () => {
    const { selectedAreaBlocks } = get();
    if (!selectedAreaBlocks || selectedAreaBlocks.length === 0) return;
    let minX = Infinity; let minY = Infinity; let minZ = Infinity;
    selectedAreaBlocks.forEach(b => {
      minX = Math.min(minX, b.pos[0]);
      minY = Math.min(minY, b.pos[1]);
      minZ = Math.min(minZ, b.pos[2]);
    });
    const clipboard = selectedAreaBlocks.map(b => ({
      ...b,
      relativePos: [b.pos[0] - minX, b.pos[1] - minY, b.pos[2] - minZ],
    }));
    set({ clipboardBlocks: clipboard, areaAction: 'copy' });
  },

  handleAreaMove: () => {
    const { selectedAreaBlocks } = get();
    if (!selectedAreaBlocks || selectedAreaBlocks.length === 0) return;
    let minX = Infinity; let minY = Infinity; let minZ = Infinity;
    selectedAreaBlocks.forEach(b => {
      minX = Math.min(minX, b.pos[0]);
      minY = Math.min(minY, b.pos[1]);
      minZ = Math.min(minZ, b.pos[2]);
    });
    const clipboard = selectedAreaBlocks.map(b => ({
      ...b,
      relativePos: [b.pos[0] - minX, b.pos[1] - minY, b.pos[2] - minZ],
    }));
    set({ clipboardBlocks: clipboard, areaAction: 'move' });
  },

  handleAreaCancel: () => {
    set({
      areaFirstPoint: null,
      areaHeightOffset: 0,
      selectedAreaBlocks: null,
      clipboardBlocks: [],
      areaAction: null,
    });
  },

  startPlacingPreset: (archetype) => {
    if (!ENABLE_FREE_BUILD_PLACE_PRESETS) return;
    const state = get();
    if (state.buildMode !== 'free') return;
    const normalizedArchetype = PLACE_ARCHETYPE_ALIASES[archetype] ?? archetype;
    if (!PLACE_PRESET_TEMPLATES[normalizedArchetype]) return;
    if (hasExistingPlaceSite(normalizedArchetype, state.placedBlocks)) {
      const label = PLACE_ARCHETYPE_LABELS[normalizedArchetype] ?? normalizedArchetype;
      setTimedToast({
        set,
        get,
        message: `「${label}」は既に島にあります。`,
        durationMs: 2200,
      });
      return;
    }
    set({
      placingPresetArchetype: normalizedArchetype,
      hoverPosition: null,
      selectedEditBlockId: null,
    });
    setTimedToast({
      set,
      get,
      message: '島をダブルクリックしてプリセットの配置場所を選んでください',
      durationMs: 2800,
    });
  },

  commitPlacingPreset: (presetPos) => {
    const state = get();
    if (!state.placingPresetArchetype) return false;
    if (hasExistingPlaceSite(state.placingPresetArchetype, state.placedBlocks)) {
      setTimedToast({
        set,
        get,
        message: 'この場所型は既に島にあります。',
        durationMs: 2200,
      });
      get().cancelPlacingPreset();
      return false;
    }
    if (!Array.isArray(presetPos) || presetPos.length < 3) {
      setTimedToast({
        set,
        get,
        message: '島の上を選んでからダブルクリックしてください。',
        durationMs: 2200,
      });
      return false;
    }
    const pseudoQuest = { needType: 'P', placeArchetype: state.placingPresetArchetype };
    const preset = createPresetForQuestPlacement({
      quest: pseudoQuest,
      basePos: presetPos,
      islandChunks: state.islandChunks,
      existingBlocks: state.placedBlocks,
    });
    if (!preset.blocks.length) {
      setTimedToast({
        set,
        get,
        message: 'ここには配置できません。別の場所を選んでください。',
        durationMs: 2200,
      });
      return false;
    }
    get().saveToUndoStack();
    set({ placedBlocks: [...state.placedBlocks, ...preset.blocks] });
    const toast = `${preset.label}のプリセットを配置しました。`;
    setTimedToast({ set, get, message: toast, durationMs: 2200 });
    get().cancelPlacingPreset();
    document.body.style.cursor = 'auto';
    return true;
  },

  cancelPlacingPreset: () => {
    set({ placingPresetArchetype: null, hoverPosition: null });
    document.body.style.cursor = 'auto';
  },

});
