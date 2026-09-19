import React from 'react';

const DEFAULT_COLOR = '#4fc3f7';

/**
 * 撮影照準と写真ピンで同じ形・同じ原点（箱の中央）を使う。
 */
export function AimCrosshair({
  size = 48,
  color = DEFAULT_COLOR,
}) {
  const bar = Math.round(size * 0.75);
  const hole = Math.round(size * 0.21);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 2,
        height: bar,
        marginLeft: -1,
        marginTop: -bar / 2,
        background: color,
        boxShadow: '0 0 8px rgba(0,0,0,0.8)',
      }}
      />
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: bar,
        height: 2,
        marginLeft: -bar / 2,
        marginTop: -1,
        background: color,
        boxShadow: '0 0 8px rgba(0,0,0,0.8)',
      }}
      />
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: hole,
        height: hole,
        marginLeft: -hole / 2,
        marginTop: -hole / 2,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        background: 'rgba(0,0,0,0.35)',
      }}
      />
    </div>
  );
}
