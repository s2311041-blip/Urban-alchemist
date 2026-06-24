import React from 'react';
import {
  DEFAULT_HOVERBOARD_COLOR,
  HOVERBOARD_COLOR_PRESETS,
  HOVERBOARD_HUE_PRESETS,
} from '../../constants/hoverboardData';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

const hslToHex = (h, s, l) => {
  const sat = s / 100;
  const lig = l / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = lig - c / 2;
  const [r, g, b] = h < 60
    ? [c, x, 0]
    : h < 120
      ? [x, c, 0]
      : h < 180
        ? [0, c, x]
        : h < 240
          ? [0, x, c]
          : h < 300
            ? [x, 0, c]
            : [c, 0, x];
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHue = (hex) => {
  const cleaned = (hex || '').replace('#', '');
  if (cleaned.length !== 6) return 0;
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  const h = max === r
    ? ((g - b) / d) % 6
    : max === g
      ? (b - r) / d + 2
      : (r - g) / d + 4;
  const hue = Math.round(h * 60);
  return hue < 0 ? hue + 360 : hue;
};

export const HoverboardPalette = ({ disabled = false }) => {
  const { selectedHoverboardColor, setSelectedHoverboardColor } = useGameStore(useShallow(state => ({
    selectedHoverboardColor: state.selectedHoverboardColor,
    setSelectedHoverboardColor: state.setSelectedHoverboardColor
  })));
  const currentColor = selectedHoverboardColor || DEFAULT_HOVERBOARD_COLOR;
  const currentHue = hexToHue(currentColor);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginTop: '8px',
      paddingTop: '8px',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      pointerEvents: disabled ? 'none' : 'auto',
      opacity: disabled ? 0.45 : 1,
    }}>
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#00e5ff', letterSpacing: '0.03em' }}>
        🛹 ボード色（自由色）
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.5)',
          background: currentColor,
          boxShadow: `0 0 10px ${currentColor}`,
        }} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)' }}>{currentColor}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setSelectedHoverboardColor(e.target.value)}
          style={{
            width: '34px',
            height: '28px',
            border: 'none',
            borderRadius: '7px',
            background: 'transparent',
            cursor: 'pointer',
          }}
        />
        <input
          type="range"
          min="0"
          max="360"
          value={currentHue}
          onChange={(e) => setSelectedHoverboardColor(hslToHex(Number(e.target.value), 82, 58))}
          style={{ flex: 1, accentColor: '#00e5ff' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '5px' }}>
        {HOVERBOARD_HUE_PRESETS.map((hue) => {
          const sw = hslToHex(hue, 82, 58);
          return (
            <button
              key={`hoverboard-hue-${hue}`}
              type="button"
              onClick={() => setSelectedHoverboardColor(sw)}
              style={{
                height: '16px',
                borderRadius: '999px',
                border: currentColor.toLowerCase() === sw.toLowerCase() ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.25)',
                background: sw,
                cursor: 'pointer',
              }}
              title={sw}
            />
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
        {HOVERBOARD_COLOR_PRESETS.map((sw) => (
          <button
            key={`hoverboard-preset-${sw}`}
            type="button"
            onClick={() => setSelectedHoverboardColor(sw)}
            style={{
              height: '22px',
              borderRadius: '8px',
              border: currentColor.toLowerCase() === sw.toLowerCase() ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.25)',
              background: sw,
              cursor: 'pointer',
              boxShadow: currentColor.toLowerCase() === sw.toLowerCase() ? `0 0 8px ${sw}` : 'none',
            }}
            title={sw}
          />
        ))}
      </div>
    </div>
  );
};
