import React from 'react';
import { AR_THEME } from '../constants/arTheme';

/** AR 視界内のピンをリストから選べる（3D タップより確実） */
export function ArVisiblePinBar({ visiblePins = [], onSelectPin }) {
  if (visiblePins.length === 0) return null;

  return (
    <div
      data-ar-ui
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 88,
        zIndex: 20,
        padding: '0 12px 8px',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ fontSize: 11, color: AR_THEME.muted, marginBottom: 6, paddingLeft: 4 }}>
        視界内の記録（タップで視点置換）
      </div>
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 4,
        WebkitOverflowScrolling: 'touch',
      }}
      >
        {visiblePins.map(({ annotation, distM }) => (
          <button
            key={annotation.id}
            type="button"
            onClick={() => onSelectPin(annotation)}
            style={{
              flexShrink: 0,
              minWidth: 120,
              maxWidth: 180,
              padding: '10px 12px',
              borderRadius: 12,
              border: `2px solid ${annotation.kind === 'positive' ? AR_THEME.positive : AR_THEME.barrier}`,
              background: 'rgba(0,0,0,0.82)',
              color: AR_THEME.text,
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{
              fontSize: 13,
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            >
              {annotation.comment?.slice(0, 16) || '記録'}
            </div>
            <div style={{ fontSize: 11, color: AR_THEME.muted, marginTop: 4 }}>
              約{Math.round(distM)}m
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
