import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ViewModeToggleButton } from './hud/ViewModeToggleButton';
import { WorldTimePanel } from './hud/WorldTimePanel';
import { FarmingStatusPanel } from './hud/FarmingStatusPanel';
import { ControlsGuidePanel } from './hud/ControlsGuidePanel';
import { WalletPanel } from './hud/WalletPanel';
import { AgriInteractionPanel } from './hud/AgriInteractionPanel';
import { GoodSpotPanel } from './hud/GoodSpotPanel';
import { FarmingToast } from './hud/FarmingToast';
import { CompassPanel } from './hud/CompassPanel';
import { WorldMapPanel } from './hud/WorldMapPanel';
import { CONTROLS_GUIDE_AVATAR_HEIGHT, SIDE_PANEL_INSET, SIDE_PANEL_WIDTH } from '../../constants/uiLayout';
import { useGameStore } from '../../store/useGameStore';

export const TopRightPanel = ({ viewMode, setViewMode }) => {
  const resetGameData = useGameStore((state) => state.resetGameData);
  const isWorldMapOpen = useGameStore((state) => state.isWorldMapOpen);
  const panelMaxHeight = isWorldMapOpen
    ? `calc(100vh - ${SIDE_PANEL_INSET * 2}px - 16px)`
    : `calc(100vh - ${SIDE_PANEL_INSET * 2}px - ${CONTROLS_GUIDE_AVATAR_HEIGHT}px - 16px)`;

  return (
    <>
      <div style={{
        position: 'absolute',
        top: `${SIDE_PANEL_INSET}px`,
        right: `${SIDE_PANEL_INSET}px`,
        width: `${SIDE_PANEL_WIDTH}px`,
        maxHeight: panelMaxHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 10,
        paddingRight: '2px',
        boxSizing: 'border-box',
      }}
      >
        <ViewModeToggleButton viewMode={viewMode} setViewMode={setViewMode} />
        <CompassPanel />
        <WorldMapPanel />
        <WorldTimePanel />
        <FarmingStatusPanel />
        <WalletPanel />
        <GoodSpotPanel />
        <AgriInteractionPanel />
        <FarmingToast />
        <button
          onClick={() => {
            if (window.confirm('これまでの進捗をリセットして最初の島に戻りますか？')) {
              resetGameData();
            }
          }}
          onMouseUp={(e) => e.currentTarget.blur()}
          onKeyDown={(e) => {
            // ゲーム中のSpaceはジャンプに固定したいので、ボタンのSpace発火を無効化
            if (e.code === 'Space') {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          tabIndex={-1}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#ffe0e0',
            border: '1px solid rgba(255, 138, 128, 0.4)',
            borderRadius: '10px',
            padding: '8px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
          }}
        >
          <RotateCcw size={14} />
          島データをリセット
        </button>
      </div>

      <ControlsGuidePanel viewMode={viewMode} />
    </>
  );
};
