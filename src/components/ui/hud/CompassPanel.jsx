import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { hudPanelStyleCompact } from './hudPanelStyles';

const CARDINALS = ['N', 'E', 'S', 'W'];

export const CompassPanel = () => {
  const heading = useGameStore((state) => state.mapHeading);
  const safeHeading = Number.isFinite(heading) ? heading : 0;
  const headingDeg = ((safeHeading * 180) / Math.PI + 360) % 360;

  return (
    <div style={hudPanelStyleCompact({
      background: 'rgba(5, 12, 25, 0.82)',
      border: '1px solid rgba(0, 229, 255, 0.28)',
      color: '#e9f8ff',
    })}
    >
      <div style={{ fontSize: '11px', color: '#9fdff1', marginBottom: '6px', fontWeight: 'bold' }}>
        方位
      </div>
      <div style={{
        position: 'relative',
        height: '30px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '2px',
          background: '#00e5ff',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 8px rgba(0,229,255,0.7)',
        }} />
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          display: 'flex',
          gap: '26px',
          transform: `translate(-50%, -50%) translateX(${(headingDeg / 90) * 26}px)`,
          transition: 'transform 120ms linear',
        }}>
          {CARDINALS.concat(CARDINALS).map((c, idx) => (
            <span
              key={`${c}_${idx}`}
              style={{
                width: '16px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: c === 'N' ? 'bold' : 600,
                color: c === 'N' ? '#80deea' : '#cfd8dc',
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
