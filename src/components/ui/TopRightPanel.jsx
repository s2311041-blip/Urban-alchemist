import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ControlsGuidePanel } from './hud/ControlsGuidePanel';
import { GoodSpotPanel } from './hud/GoodSpotPanel';
import { FarmingToast } from './hud/FarmingToast';
import { CompassPanel } from './hud/CompassPanel';
import { WorldMapPanel } from './hud/WorldMapPanel';
import { SIDE_PANEL_INSET, SIDE_PANEL_WIDTH, ISLAND_SATISFACTION_HUD_HEIGHT } from '../../constants/uiLayout';
import { useGameStore } from '../../store/useGameStore';
import { useConsensusHudVisible } from './consensus/IslandSatisfactionBlock';

export const TopRightPanel = ({ viewMode, setViewMode }) => {
  const resetGameData = useGameStore((state) => state.resetGameData);
  const showSatisfactionHud = useConsensusHudVisible() && !useGameStore((s) => s.isQuestBoardOpen);
  const panelTop = SIDE_PANEL_INSET + (showSatisfactionHud ? ISLAND_SATISFACTION_HUD_HEIGHT : 0);
  const panelMaxHeight = `calc(100vh - ${panelTop}px - ${SIDE_PANEL_INSET}px - 16px)`;

  return (
    <>
      <div style={{
        position: 'absolute',
        top: `${panelTop}px`,
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
        <CompassPanel />
        <WorldMapPanel />
        <GoodSpotPanel />
        <FarmingToast />
        <button
          onClick={() => {
          if (window.confirm('これまでの進捗をリセットして最初の島に戻りますか？')) {
              resetGameData();
            }
          }}
          onMouseUp={(e) => e.currentTarget.blur()}
          onKeyDown={(e) => {
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
