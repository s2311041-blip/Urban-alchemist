import React from 'react';
import { Pause, Play, FastForward, SkipForward } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { SEASON_LABELS, getTimePeriodLabel } from '../../../constants/worldTimeConfig';
import { hudPanelStyle } from './hudPanelStyles';

export const WorldTimePanel = () => {
  const worldTime = useGameStore((state) => state.worldTime);
  const toggleWorldTimePaused = useGameStore((state) => state.toggleWorldTimePaused);
  const setWorldTimeSpeed = useGameStore((state) => state.setWorldTimeSpeed);
  const skipToNextMorning = useGameStore((state) => state.skipToNextMorning);
  const pauseTimeInBuildMode = useGameStore((state) => state.pauseTimeInBuildMode);
  const togglePauseTimeInBuildMode = useGameStore((state) => state.togglePauseTimeInBuildMode);

  const dayLabel = `第${worldTime.dayIndex + 1}日`;
  const seasonLabel = SEASON_LABELS[worldTime.season] ?? '春';
  const periodLabel = getTimePeriodLabel(worldTime.timeOfDay);

  return (
    <div style={hudPanelStyle({ background: 'rgba(5, 9, 20, 0.82)', border: '1px solid rgba(0, 229, 255, 0.25)', color: '#e9f8ff' })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>⏳ 時間</div>
        <div style={{ fontSize: '12px', opacity: 0.95 }}>{dayLabel} / {seasonLabel} / {periodLabel}</div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={toggleWorldTimePaused}
          style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '9px', cursor: 'pointer', padding: '6px 8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}
          title={worldTime.paused ? '再生' : '停止'}
        >
          {worldTime.paused ? <Play size={14} /> : <Pause size={14} />}
          {worldTime.paused ? '再生' : '停止'}
        </button>
        <button
          onClick={skipToNextMorning}
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '9px', cursor: 'pointer', padding: '6px 8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          title="次の朝へ"
        >
          <SkipForward size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
        {[1, 2, 4].map((speed) => {
          const active = worldTime.speed === speed;
          return (
            <button
              key={speed}
              onClick={() => setWorldTimeSpeed(speed)}
              style={{
                flex: 1,
                background: active ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255,255,255,0.06)',
                color: active ? '#00e5ff' : '#d4dbe0',
                border: active ? '1px solid rgba(0,229,255,0.55)' : '1px solid rgba(255,255,255,0.18)',
                borderRadius: '8px',
                cursor: 'pointer',
                padding: '5px 0',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <FastForward size={12} />
              x{speed}
            </button>
          );
        })}
      </div>
      <button
        onClick={togglePauseTimeInBuildMode}
        style={{
          marginTop: '8px',
          width: '100%',
          background: pauseTimeInBuildMode ? 'rgba(129, 199, 132, 0.18)' : 'rgba(255,255,255,0.06)',
          color: pauseTimeInBuildMode ? '#d7ffd5' : '#d4dbe0',
          border: pauseTimeInBuildMode ? '1px solid rgba(129,199,132,0.55)' : '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          padding: '6px 8px',
          fontWeight: 'bold',
          fontSize: '11px',
        }}
      >
        建築中の時間停止: {pauseTimeInBuildMode ? 'ON' : 'OFF'}
      </button>
    </div>
  );
};
