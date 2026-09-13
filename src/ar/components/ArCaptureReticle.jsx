import React from 'react';
import { AR_THEME } from '../constants/arTheme';

/**
 * 撮影時の照準（十字のみ）
 */
export function ArCaptureReticle({ hint, showHint = false }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 9,
        pointerEvents: 'none',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 2,
          height: 36,
          marginLeft: -1,
          marginTop: -18,
          background: AR_THEME.accent,
          boxShadow: '0 0 8px rgba(0,0,0,0.8)',
        }}
        />
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 36,
          height: 2,
          marginLeft: -18,
          marginTop: -1,
          background: AR_THEME.accent,
          boxShadow: '0 0 8px rgba(0,0,0,0.8)',
        }}
        />
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 10,
          height: 10,
          marginLeft: -5,
          marginTop: -5,
          borderRadius: '50%',
          border: `2px solid ${AR_THEME.accent}`,
          background: 'rgba(0,0,0,0.35)',
        }}
        />
      </div>

      {showHint && hint && (
        <div style={{
          position: 'absolute',
          bottom: '28%',
          left: 16,
          right: 16,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#fff',
          textShadow: '0 2px 10px #000',
          lineHeight: 1.45,
        }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
