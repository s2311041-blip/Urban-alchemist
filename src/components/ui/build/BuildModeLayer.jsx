import React from 'react';
import { ControlBottomBar } from '../ControlBottomBar';
import { BuildShortcutsOverlay } from '../BuildShortcutsOverlay';
import { useGameStore } from '../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { BuildModeGuide } from './BuildModeGuide';
import { BuildResolutionBanner } from './BuildResolutionBanner';
import { BuildShortcutsToggle } from './BuildShortcutsToggle';
import { ImprovementHudPanel } from './ImprovementHudPanel';
import { useGameStore } from '../../../store/useGameStore';

/**
 * 建築モード中の共通 UI（ショートカット・ガイド・下部パレット）
 */
export const BuildModeLayer = ({
  showBuildShortcuts,
  setShowBuildShortcuts,
}) => {
  const store = useGameStore(useShallow(state => ({
    buildMode: state.buildMode,
    isEditingInStudio: state.isEditingInStudio,
    isDesigningInStudio: state.isDesigningInStudio,
    selectedShape: state.selectedShape,
    isDesigningDiagonal: state.isDesigningDiagonal,
    undoStack: state.undoStack,
    handleUndo: state.handleUndo,
    redoStack: state.redoStack,
    handleRedo: state.handleRedo,
    setSelectedShape: state.setSelectedShape,
    selectedMaterial: state.selectedMaterial,
    setSelectedMaterial: state.setSelectedMaterial,
    selectedScale: state.selectedScale,
    setSelectedScale: state.setSelectedScale,
    gridSnapping: state.gridSnapping,
    setGridSnapping: state.setGridSnapping,
    setIsDesigningInStudio: state.setIsDesigningInStudio,
    favorites: state.favorites,
    setFavorites: state.setFavorites,
    blockRotation: state.blockRotation,
    setBlockRotation: state.setBlockRotation,
    recentBlocks: state.recentBlocks,
    selectedEditBlockId: state.selectedEditBlockId,
    diagonalFirstPoint: state.diagonalFirstPoint,
    finishBuildMode: state.finishBuildMode,
    startPlacingPreset: state.startPlacingPreset,
    isSeriousMode: state.isSeriousMode,
  })));
  const showPalette = !store.isEditingInStudio
    && (!store.isDesigningInStudio || store.selectedShape !== 'diagonal');

  if (!store.buildMode) return null;

  return (
    <>
      <BuildResolutionBanner />
      {!store.isSeriousMode && <ImprovementHudPanel />}

      <BuildShortcutsOverlay
        open={showBuildShortcuts}
        onClose={() => setShowBuildShortcuts(false)}
        isEditingInStudio={store.isEditingInStudio}
        isDesigningInStudio={store.isDesigningInStudio}
        isDesigningDiagonal={store.isDesigningDiagonal}
        selectedShape={store.selectedShape}
      />

      {showPalette && (
        <>
          <BuildShortcutsToggle onOpen={() => setShowBuildShortcuts(true)} />

          {store.buildMode !== 'free' && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '8px',
              pointerEvents: 'none',
            }}
            >
              <BuildModeGuide />
            </div>
          )}

          <ControlBottomBar
            undoStack={store.undoStack}
            handleUndo={store.handleUndo}
            redoStack={store.redoStack}
            handleRedo={store.handleRedo}
            selectedShape={store.selectedShape}
            handleSelectShape={store.setSelectedShape}
            isDesigningDiagonal={store.isDesigningDiagonal}
            selectedMaterial={store.selectedMaterial}
            setSelectedMaterial={store.setSelectedMaterial}
            selectedScale={store.selectedScale}
            setSelectedScale={store.setSelectedScale}
            gridSnapping={store.gridSnapping}
            setGridSnapping={store.setGridSnapping}
            isDesigningInStudio={store.isDesigningInStudio}
            setIsDesigningInStudio={store.setIsDesigningInStudio}
            favorites={store.favorites}
            setFavorites={store.setFavorites}
            blockRotation={store.blockRotation}
            setBlockRotation={store.setBlockRotation}
            recentBlocks={store.recentBlocks}
            selectedEditBlockId={store.selectedEditBlockId}
            diagonalFirstPoint={store.diagonalFirstPoint}
            buildMode={store.buildMode}
            finishBuildMode={store.finishBuildMode}
            startPlacingPreset={store.startPlacingPreset}
          />
        </>
      )}
    </>
  );
};
