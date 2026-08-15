import React from 'react';
import { SATISFACTION_ATTRS, MIN_ISLAND_SATISFACTION } from '../../../constants/satisfactionAttributes';

const gaugeRowStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
};

const gaugeBarContainerStyle = (height = 12) => ({
  flex: 1,
  height: `${height}px`,
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  overflow: 'hidden',
  position: 'relative',
  marginRight: '8px',
});

function gaugeBarStyle(percent, color, preview = false) {
  return {
    height: '100%',
    width: `${Math.max(0, Math.min(100, percent))}%`,
    background: color,
    opacity: preview ? 0.55 : 1,
    transition: 'width 0.35s ease, opacity 0.25s ease',
  };
}

function formatDelta(delta) {
  if (delta === 0) return '±0';
  return delta > 0 ? `+${delta}` : `${delta}`;
}

export function SatisfactionGaugePanel({
  values = {},
  baseline = null,
  deltas = null,
  compact = false,
  showMinLine = true,
  showNumericDetail = false,
  title = null,
}) {
  const labelWidth = compact ? 72 : 108;
  const fontSize = compact ? 11 : 13;
  const barHeight = showNumericDetail ? 14 : (compact ? 12 : 14);
  const valueColumnWidth = showNumericDetail ? 108 : (compact ? 36 : 52);

  return (
    <div>
      {title && (
        <div style={{
          fontSize: compact ? 12 : 14,
          color: '#cfd8dc',
          marginBottom: 8,
          fontWeight: 600,
        }}
        >
          {title}
        </div>
      )}
      {SATISFACTION_ATTRS.map((attr) => {
        const value = values[attr.key] ?? 0;
        const baseValue = baseline?.[attr.key];
        const delta = deltas?.[attr.key]
          ?? (baseline != null ? Math.round(value - (baseValue ?? 0)) : null);

        return (
          <div style={gaugeRowStyle} key={attr.key}>
            <div style={{
              width: labelWidth,
              fontSize,
              fontWeight: 'bold',
              color: '#eceff1',
              flexShrink: 0,
            }}
            >
              {compact ? attr.shortLabel : attr.label}
            </div>
            <div style={gaugeBarContainerStyle(barHeight)}>
              {baseline != null && (
                <div style={{
                  ...gaugeBarStyle(baseValue ?? 0, attr.color, true),
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  zIndex: 0,
                }}
                />
              )}
              <div style={{
                ...gaugeBarStyle(value, attr.color, false),
                position: 'relative',
                zIndex: 1,
              }}
              />
              {showMinLine && (
                <div style={{
                  position: 'absolute',
                  left: `${MIN_ISLAND_SATISFACTION}%`,
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: 'rgba(255,80,80,0.55)',
                  zIndex: 2,
                }}
                />
              )}
            </div>
            <div style={{
              width: valueColumnWidth,
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: showNumericDetail ? 12 : (compact ? 11 : 13),
              color: value < MIN_ISLAND_SATISFACTION ? '#ef9a9a' : '#fff',
              flexShrink: 0,
              lineHeight: 1.25,
            }}
            >
              {showNumericDetail && baseline != null ? (
                <>
                  <span style={{ color: '#90a4ae', fontWeight: 600 }}>
                    {Math.round(baseValue ?? 0)}
                  </span>
                  <span style={{ color: '#78909c', margin: '0 3px' }}>→</span>
                  <span>{Math.round(value)}</span>
                </>
              ) : (
                `${Math.round(value)}%`
              )}
            </div>
            {delta != null && (showNumericDetail || delta !== 0) && (
              <div style={{
                width: showNumericDetail ? 40 : 32,
                textAlign: 'right',
                fontSize: showNumericDetail ? 12 : 11,
                fontWeight: 700,
                color: delta > 0 ? '#81c784' : (delta < 0 ? '#ef5350' : '#b0bec5'),
                flexShrink: 0,
              }}
              >
                {formatDelta(Math.round(delta))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PlanSatisfactionDeltas({ deltas }) {
  if (!deltas) return null;
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px 8px',
      marginTop: 6,
    }}
    >
      {SATISFACTION_ATTRS.map((attr) => {
        const d = deltas[attr.key] ?? 0;
        if (d === 0) return null;
        return (
          <span
            key={attr.key}
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: d > 0 ? '#81c784' : '#ef5350',
            }}
          >
            {attr.shortLabel}
            {' '}
            {formatDelta(Math.round(d))}
          </span>
        );
      })}
    </div>
  );
}
