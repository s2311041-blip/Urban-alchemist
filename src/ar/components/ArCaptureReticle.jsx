import React from 'react';
import { AimCrosshair } from '../../components/ui/AimCrosshair';

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
      <AimCrosshair size={48} />

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
