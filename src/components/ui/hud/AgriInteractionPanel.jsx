import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { hudPanelStyle } from './hudPanelStyles';

export const AgriInteractionPanel = () => {
  const interactionMode = useGameStore((state) => state.interactionMode);
  const setInteractionMode = useGameStore((state) => state.setInteractionMode);
  const sowingMode = interactionMode === 'plant';

  return (
    <div style={hudPanelStyle({ background: 'rgba(10, 14, 24, 0.82)', border: '1px solid rgba(129, 199, 132, 0.35)', color: '#f1f8e9' })}>
      <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '7px' }}>🧑‍🌾 農作業モード</div>
      <button
        onClick={() => setInteractionMode(sowingMode ? null : 'plant')}
        style={{
          width: '100%',
          background: sowingMode ? 'rgba(129, 199, 132, 0.2)' : 'rgba(255,255,255,0.06)',
          color: sowingMode ? '#c5e1a5' : '#e0e0e0',
          border: sowingMode ? '1px solid rgba(129, 199, 132, 0.65)' : '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          cursor: 'pointer',
          padding: '7px 8px',
          fontSize: '11px',
          fontWeight: 'bold',
          lineHeight: 1.2,
        }}
      >
        🌱 種まきモード: {sowingMode ? 'ON' : 'OFF'}
      </button>
      <div style={{ marginTop: '5px', fontSize: '10px', color: 'rgba(241, 248, 233, 0.72)', lineHeight: 1.45 }}>
        更地は種まきモード ON のあと<strong>ダブルクリック</strong>で播種（コイン消費）。
        食べごろの収穫はモード不要・クリック1回。
      </div>
    </div>
  );
};
