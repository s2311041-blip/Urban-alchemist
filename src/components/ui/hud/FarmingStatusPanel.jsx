import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { getFarmingNeedXp } from '../../../constants/farmingProgressData';
import { hudPanelStyle } from './hudPanelStyles';

export const FarmingStatusPanel = () => {
  const farmingProgress = useGameStore((state) => state.farmingProgress);
  const nextNeedXp = getFarmingNeedXp(farmingProgress.level);

  return (
    <div style={hudPanelStyle({ background: 'rgba(11, 20, 8, 0.82)', border: '1px solid rgba(139, 195, 74, 0.35)', color: '#f1ffe5' })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>🌾 農業レベル</div>
        <div style={{ fontSize: '12px', color: '#c8e6a4' }}>Lv.{farmingProgress.level}</div>
      </div>
      <div style={{ fontSize: '12px', opacity: 0.9 }}>
        XP: {farmingProgress.xp}/{nextNeedXp} ・ 総収穫 {farmingProgress.totalHarvests}
      </div>
      <div style={{ fontSize: '11px', marginTop: '4px', color: '#c5e1a5' }}>
        成長ボーナス: +{farmingProgress.growthBonusDays}日
      </div>
    </div>
  );
};
