import React from 'react';
import { BuildAreaSelectToolbar } from './BuildAreaSelectToolbar';
import { BuildEditBlockToolbar } from './BuildEditBlockToolbar';
import { BuildSizeAdjustPanel } from './BuildSizeAdjustPanel';
import { BuildEditStudioPanel } from './BuildEditStudioPanel';
import { BuildDiagonalStudioPanel } from './BuildDiagonalStudioPanel';
import { BuildMaterialPalette } from './BuildMaterialPalette';
import { SignTextPromptOverlay } from './SignTextPromptOverlay';

/** 建築モード UI（BuildModeLayer の前後で App から挟む） */
export const BuildPreLayerOverlays = () => (
  <>
    <BuildAreaSelectToolbar />
    <BuildEditBlockToolbar />
    <BuildSizeAdjustPanel />
  </>
);

export const BuildPostLayerOverlays = () => (
  <>
    <BuildEditStudioPanel />
    <BuildDiagonalStudioPanel />
    <BuildMaterialPalette />
    <SignTextPromptOverlay />
  </>
);
