import React from 'react';
import { ControlBottomBar } from '../ControlBottomBar';
import { useGameStore } from '../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { BuildResolutionBanner } from './BuildResolutionBanner';

/** 建築モード中の共通 UI（下部パレット・完成バナー） */
export const BuildModeLayer = () => {
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
  })));
  const showPalette = !store.isEditingInStudio
    && (!store.isDesigningInStudio || store.selectedShape !== 'diagonal');

  if (!store.buildMode) return null;

  return (
    <>
      <BuildResolutionBanner />

      {showPalette && (
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
      )}
    </>
  );
};
