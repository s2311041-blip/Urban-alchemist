import { useEffect } from 'react';
import { BUILD_MATERIAL_KEY_MAP, BUILD_SHAPE_KEY_MAP } from '../constants/buildShortcuts';
import { useGameStore } from '../store/useGameStore';
import { commitQuestPlacement } from '../store/helpers/questPlacement';

/**
 * 建築モード中のキーボードショートカット（形状・素材・Undo 等）
 */
export function useBuildKeyboardShortcuts({ showBuildShortcutsRef, setShowBuildShortcuts }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const current = useGameStore.getState();
      if (!current.buildMode) return;

      const isQuestionMark = e.key === '?' || (e.code === 'Slash' && e.shiftKey);
      if (isQuestionMark) {
        e.preventDefault();
        setShowBuildShortcuts((open) => !open);
        return;
      }
      if (showBuildShortcutsRef.current) {
        if (e.code === 'Escape') {
          e.preventDefault();
          setShowBuildShortcuts(false);
        }
        return;
      }

      const store = current;

      if ((e.code === 'ArrowUp' || e.code === 'ArrowDown') && store.areaFirstPoint && store.selectedShape === 'area_select') {
        e.preventDefault();
        e.stopPropagation();
        if (e.code === 'ArrowUp') {
          store.setAreaHeightOffset(store.areaHeightOffset + 0.5);
        } else if (e.code === 'ArrowDown') {
          store.setAreaHeightOffset(store.areaHeightOffset - 0.5);
        }
        return;
      }

      if (!store.isEditingInStudio && !store.isDesigningInStudio) {
        if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && !e.shiftKey) {
          e.preventDefault();
          store.handleUndo();
          return;
        }
        if (((e.metaKey || e.ctrlKey) && e.code === 'KeyY') || ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ' && e.shiftKey)) {
          e.preventDefault();
          store.handleRedo();
          return;
        }
      }

      if (store.isEditingInStudio) {
        if (e.code === 'Enter') {
          e.preventDefault();
          store.finishEditingInStudio();
        } else if (e.code === 'Escape') {
          store.cancelEditingInStudio();
        }
        return;
      }

      if (store.isDesigningInStudio) {
        if (e.code === 'Enter') {
          e.preventDefault();
          if (store.customDiagonalPoints) {
            store.confirmDesigningDiagonal();
          }
        } else if (e.code === 'Escape') {
          store.cancelDesigningInStudio();
        }
        return;
      }

      if (store.selectedShape === 'diagonal' && store.isDesigningDiagonal) {
        if (e.code === 'Escape') {
          if (store.diagonalFirstPoint) {
            store.setDiagonalFirstPoint(null);
          } else {
            store.cancelDesigningInStudio();
          }
        }
        return;
      }

      if (e.code === 'KeyF') {
        store.setBlockRotation((store.blockRotation + 90) % 360);
        return;
      }

      if (e.code === 'Escape') {
        if (store.placingPresetArchetype) {
          store.cancelPlacingPreset();
        } else if (store.isAdjustingSize) {
          store.cancelSizeAdjust();
        } else if (store.areaFirstPoint || store.selectedAreaBlocks !== null || store.clipboardBlocks.length > 0) {
          store.handleAreaCancel();
        } else if (store.diagonalFirstPoint) {
          store.setDiagonalFirstPoint(null);
        } else if (store.selectedShape === 'diagonal') {
          store.cancelDesigningInStudio();
        } else if (store.selectedEditBlockId) {
          store.setSelectedEditBlockId(null);
        }
      }

      if (e.code === 'KeyS' && e.shiftKey) {
        store.setSelectedShape('area_select');
      }
      if (e.code === 'KeyP' && !e.shiftKey) {
        store.setSelectedMaterial('mana');
      }
      if (e.code === 'KeyO' && !e.shiftKey) {
        store.setSelectedMaterial('sand');
      }

      const shape = BUILD_SHAPE_KEY_MAP[e.code];
      if (shape) {
        if (shape === 'diagonal' && store.selectedShape === 'diagonal') {
          store.setIsDesigningInStudio(true);
          store.setDiagonalGuidePos([0, 0.25, 0]);
          store.setCustomDiagonalPoints(null);
          store.setIsDesigningDiagonal(true);
          store.setDiagonalFirstPoint(null);
        } else {
          store.setSelectedShape(shape);
        }
      }

      const material = BUILD_MATERIAL_KEY_MAP[e.code];
      if (material) {
        store.setSelectedMaterial(material);
      }

      if (e.code === 'Enter') {
        e.preventDefault();
        if (store.placingQuest && !store.buildMode && store.hoverPosition) {
          commitQuestPlacement(store.hoverPosition, {
            getState: useGameStore.getState,
            setState: useGameStore.setState,
          });
        } else if (store.placingPresetArchetype && store.hoverPosition) {
          store.commitPlacingPreset(store.hoverPosition);
        } else if (store.isAdjustingSize && store.previewFixedPos) {
          store.placeBlockAtHover(store.previewFixedPos);
          store.setIsAdjustingSize(false);
        } else if (store.selectedEditBlockId) {
          store.finishEditingInStudio();
        } else if (store.hoverPosition) {
          store.placeBlockAtHover(store.hoverPosition);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowBuildShortcuts, showBuildShortcutsRef]);
}
