import React from 'react';
import { AR_THEME } from '../constants/arTheme';

/**
 * 撮影時の照準（十字 + 角枠）
 * 端末を動かして不満の点を中心に合わせる
 */
export function ArCaptureReticle({ hint = '不満の点をここに合わせてください', showHint = true }) {
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
      <div style={{ position: 'relative', width: '72vw', maxWidth: 320, aspectRatio: '3/4' }}>
        {/* 角枠 */}
        {[
          { top: 0, left: 0, borderTop: true, borderLeft: true },
          { top: 0, right: 0, borderTop: true, borderRight: true },
          { bottom: 0, left: 0, borderBottom: true, borderLeft: true },
          { bottom: 0, right: 0, borderBottom: true, borderRight: true },
        ].map((corner, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 28,
              height: 28,
              ...corner,
              borderColor: AR_THEME.accent,
              borderStyle: 'solid',
              borderWidth: 0,
              ...(corner.borderTop && { borderTopWidth: 3 }),
              ...(corner.borderBottom && { borderBottomWidth: 3 }),
              ...(corner.borderLeft && { borderLeftWidth: 3 }),
              ...(corner.borderRight && { borderRightWidth: 3 }),
              opacity: 0.95,
            }}
          />
        ))}

        {/* 十字 */}
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
        {showHint ? hint : null}
      </div>
    </div>
  );
}
