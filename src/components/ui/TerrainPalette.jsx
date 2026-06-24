import React from 'react';
import {
  TERRAIN_SHAPES,
  TERRAIN_META,
  DEFAULT_TERRAIN_COLORS,
  TERRAIN_COLOR_PRESETS,
} from '../../constants/terrainData';
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

export const TerrainPalette = ({ handleSelectShape, disabled = false }) => {
  const { selectedShape, selectedTerrainColors, setSelectedTerrainColor } = useGameStore(useShallow(state => ({
    selectedShape: state.selectedShape,
    selectedTerrainColors: state.selectedTerrainColors,
    setSelectedTerrainColor: state.setSelectedTerrainColor
  })));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        pointerEvents: disabled ? 'none' : 'auto',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#80cbc4', letterSpacing: '0.03em' }}>⛰️ 地形</div>

      {TERRAIN_SHAPES.map((shapeKey) => {
        const meta = TERRAIN_META[shapeKey];
        const currentColor = selectedTerrainColors?.[shapeKey] ?? DEFAULT_TERRAIN_COLORS[shapeKey];
        const currentHue = hexToHue(currentColor);
        const isActive = selectedShape === shapeKey;

        return (
          <div key={shapeKey} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button
              onClick={() => handleSelectShape(shapeKey)}
              style={{
                background: isActive ? 'rgba(128,203,196,0.2)' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#80cbc4' : '#e0e0e0',
                border: isActive ? '1.5px solid #80cbc4' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '8px 6px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                {meta.icon} {meta.label}
              </span>
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.5)',
                  background: currentColor,
                }}
              />
            </button>

            {isActive && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => setSelectedTerrainColor(shapeKey, e.target.value)}
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
                    onChange={(e) => setSelectedTerrainColor(shapeKey, hslToHex(Number(e.target.value), 58, 56))}
                    style={{ flex: 1, accentColor: '#80cbc4' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
                  {(TERRAIN_COLOR_PRESETS[shapeKey] ?? []).map((sw) => (
                    <button
                      key={`${shapeKey}-${sw}`}
                      onClick={() => setSelectedTerrainColor(shapeKey, sw)}
                      style={{
                        height: '16px',
                        borderRadius: '999px',
                        border: currentColor.toLowerCase() === sw.toLowerCase() ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.25)',
                        background: sw,
                        cursor: 'pointer',
                      }}
                      title={sw}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
