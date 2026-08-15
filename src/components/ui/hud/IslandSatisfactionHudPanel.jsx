import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { IslandSatisfactionBlock, useConsensusHudVisible } from '../consensus/IslandSatisfactionBlock';
import { SIDE_PANEL_INSET, SIDE_PANEL_WIDTH } from '../../../constants/uiLayout';

/** 通常プレイ中（アバター移動・建築中）の右上満足度 */
export const IslandSatisfactionHudPanel = () => {
  const visible = useConsensusHudVisible();
  const activeBug = useGameStore((s) => s.activeBug);
  const isQuestBoardOpen = useGameStore((s) => s.isQuestBoardOpen);

  // 不満詳細はオーバーレイ内のブロックを、クエストボードではボード内のHUDを使う
  if (!visible || activeBug || isQuestBoardOpen) return null;

  return (
    <div
      data-testid="island-satisfaction-hud"
      style={{
        position: 'absolute',
        top: `${SIDE_PANEL_INSET}px`,
        right: `${SIDE_PANEL_INSET}px`,
        width: `${SIDE_PANEL_WIDTH}px`,
        zIndex: 250,
        pointerEvents: 'none',
      }}
    >
      <IslandSatisfactionBlock compact variant="hud" />
    </div>
  );
};
