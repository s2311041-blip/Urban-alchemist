import React, { useState } from 'react';
import { Hammer, ChevronRight } from 'lucide-react';
import { ENABLE_FREE_BUILD_PLACE_PRESETS } from '../../constants/buildFeatureFlags';
import { isNatureShape } from '../../constants/natureData';
import { isAgriShape } from '../../constants/agriData';
import { BuildBottomBarCollapsedFab } from './build/controlBottomBar/BuildBottomBarCollapsedFab';
import { BuildPaletteTab } from './build/controlBottomBar/BuildPaletteTab';
import { BuildUtilityTab } from './build/controlBottomBar/BuildUtilityTab';
import { BuildBottomBarFooter } from './build/controlBottomBar/BuildBottomBarFooter';
export const ControlBottomBar = ({
  undoStack, handleUndo,
  redoStack, handleRedo,
  selectedShape, handleSelectShape,
  isDesigningDiagonal,
  selectedMaterial, setSelectedMaterial,
  selectedScale, setSelectedScale,
  gridSnapping, setGridSnapping,
  isDesigningInStudio, setIsDesigningInStudio,
  favorites, setFavorites,
  blockRotation, setBlockRotation,
  recentBlocks,
  selectedEditBlockId,
  diagonalFirstPoint,
  buildMode, finishBuildMode,
  startPlacingPreset,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('palette');
  const [manualPaletteMode, setManualPaletteMode] = useState('blocks');
  const paletteMode = isNatureShape(selectedShape)
    ? 'nature'
    : isAgriShape(selectedShape)
      ? 'agri'
      : manualPaletteMode;

  if (isCollapsed) {
    return <BuildBottomBarCollapsedFab onExpand={() => setIsCollapsed(false)} />;
  }

  const paletteTabProps = {
    paletteMode,
    setPaletteMode: setManualPaletteMode,
    selectedShape,
    handleSelectShape,
    isDesigningDiagonal,
    selectedMaterial,
    setSelectedMaterial,
    selectedScale,
    setSelectedScale,
    gridSnapping,
    setGridSnapping,
    isDesigningInStudio,
    setIsDesigningInStudio,
    selectedEditBlockId,
  };

  const utilityTabProps = {
    favorites,
    setFavorites,
    selectedShape,
    selectedMaterial,
    selectedScale,
    blockRotation,
    handleSelectShape,
    setSelectedMaterial,
    setSelectedScale,
    setBlockRotation,
    recentBlocks,
    buildMode,
    onSpawnPreset: (archetype) => {
      if (!ENABLE_FREE_BUILD_PLACE_PRESETS || buildMode !== 'free') return;
      startPlacingPreset?.(archetype);
    },
  };

  const footerProps = {
    selectedShape,
    selectedEditBlockId,
    diagonalFirstPoint,
    undoStack,
    handleUndo,
    redoStack,
    handleRedo,
    buildMode,
    finishBuildMode,
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: '15px',
        top: '15px',
        bottom: '15px',
        width: '340px',
        background: 'rgba(10, 11, 20, 0.88)',
        border: '1px solid rgba(0, 229, 255, 0.3)',
        borderRadius: '20px',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(16px)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto',
        color: 'white',
        overflow: 'hidden',
        fontFamily: '"Outfit", "Inter", sans-serif',
      }}
    >
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
      }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Hammer size={18} color="#00e5ff" />
          <span style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.5px' }}>
            {buildMode === 'free' ? '🧱 フリー建築パレット' : '🧱 建築パレット'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            color: '#aaa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(0, 229, 255, 0.15)';
            e.currentTarget.style.color = '#00e5ff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = '#aaa';
          }}
          title="パレットをたたむ"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(0, 0, 0, 0.2)',
      }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('palette')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'palette' ? 'transparent' : 'rgba(0,0,0,0.2)',
            color: activeTab === 'palette' ? '#00e5ff' : '#aaa',
            border: 'none',
            borderBottom: activeTab === 'palette' ? '2px solid #00e5ff' : 'none',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          🎨 形状＆素材
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('utility')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'utility' ? 'transparent' : 'rgba(0,0,0,0.2)',
            color: activeTab === 'utility' ? '#00e5ff' : '#aaa',
            border: 'none',
            borderBottom: activeTab === 'utility' ? '2px solid #00e5ff' : 'none',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ⚙️ 調整＆カスタム
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
      >
        {activeTab === 'palette' ? (
          <BuildPaletteTab {...paletteTabProps} />
        ) : (
          <BuildUtilityTab {...utilityTabProps} />
        )}
      </div>

      <BuildBottomBarFooter {...footerProps} />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 229, 255, 0.6); }
          50% { transform: scale(1.05); box-shadow: 0 0 28px rgba(0, 229, 255, 0.9); }
          100% { transform: scale(1); box-shadow: 0 0 20px rgba(0, 229, 255, 0.6); }
        }
      `}</style>
    </div>
  );
};
