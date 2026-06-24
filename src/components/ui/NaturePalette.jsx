import React, { useState } from 'react';
import { SPECIES, SHAPE_META, NATURE_CATEGORIES, isColorableNatureShape, DEFAULT_NATURE_COLORS } from '../../constants/natureData';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

const TABS = [
  { id: NATURE_CATEGORIES.DECORATE, label: '彩る',      icon: '🌸' },
  { id: NATURE_CATEGORIES.COMFORT,  label: '快適・安全', icon: '🌲' },
];
const HUE_PRESETS = [0, 30, 55, 120, 170, 220, 280, 330];

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
  const cleaned = hex.replace('#', '');
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

export const NaturePalette = ({ handleSelectShape, disabled = false }) => {
  const { 
    selectedShape, 
    selectedNatureSpecies, 
    setSelectedNatureSpecies, 
    selectedNatureColors, 
    setSelectedNatureColor 
  } = useGameStore(useShallow(state => ({
    selectedShape: state.selectedShape,
    selectedNatureSpecies: state.selectedNatureSpecies,
    setSelectedNatureSpecies: state.setSelectedNatureSpecies,
    selectedNatureColors: state.selectedNatureColors,
    setSelectedNatureColor: state.setSelectedNatureColor
  })));

  const [activeTab, setActiveTab] = useState(NATURE_CATEGORIES.DECORATE);

  const shapesInTab = Object.entries(SHAPE_META).filter(
    ([, meta]) => meta.category === activeTab
  );

  const handleSelect = (shape, speciesId = null) => {
    handleSelectShape(shape);
    setSelectedNatureSpecies(speciesId);
  };

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

      {/* ヘッダー */}
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#69f0ae', letterSpacing: '0.03em' }}>
        🌿 植物
      </div>

      {/* サブタブ */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                background: isActive ? 'rgba(105,240,174,0.14)' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#69f0ae' : '#999',
                border: isActive ? '1px solid rgba(105,240,174,0.5)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '5px 4px',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          );
        })}
      </div>

      {/* 種類ボタン一覧 */}
      {shapesInTab.map(([shapeKey, meta]) => {
        const speciesList = SPECIES[shapeKey] ?? [];
        const isColorShape = isColorableNatureShape(shapeKey);
        const currentColor = selectedNatureColors?.[shapeKey] ?? DEFAULT_NATURE_COLORS[shapeKey] ?? '#4caf50';
        const currentHue = hexToHue(currentColor);

        return (
          <div key={shapeKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>
              {meta.icon} {meta.label} {isColorShape ? '（自由色）' : ''}
            </div>
            {isColorShape ? (
              <>
                <button
                  onClick={() => handleSelect(shapeKey, null)}
                  style={{
                    background: selectedShape === shapeKey ? 'rgba(105,240,174,0.18)' : 'rgba(255,255,255,0.04)',
                    color: selectedShape === shapeKey ? '#69f0ae' : '#e0e0e0',
                    border: selectedShape === shapeKey ? '1.5px solid #69f0ae' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '8px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>この形を使う</span>
                  <span style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.5)',
                    background: currentColor
                  }} />
                </button>
                {selectedShape === shapeKey && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => setSelectedNatureColor(shapeKey, e.target.value)}
                        style={{
                          width: '34px',
                          height: '28px',
                          border: 'none',
                          borderRadius: '7px',
                          background: 'transparent',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={currentHue}
                        onChange={(e) => setSelectedNatureColor(shapeKey, hslToHex(Number(e.target.value), 75, 55))}
                        style={{
                          flex: 1,
                          accentColor: '#69f0ae'
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '5px' }}>
                      {HUE_PRESETS.map((hue) => {
                        const sw = hslToHex(hue, 75, 55);
                        return (
                          <button
                            key={`${shapeKey}-${hue}`}
                            onClick={() => setSelectedNatureColor(shapeKey, sw)}
                            style={{
                              height: '16px',
                              borderRadius: '999px',
                              border: currentColor.toLowerCase() === sw.toLowerCase() ? '1.5px solid #fff' : '1px solid rgba(255,255,255,0.25)',
                              background: sw,
                              cursor: 'pointer'
                            }}
                            title={sw}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(speciesList.length, 3)}, 1fr)`, gap: '5px' }}>
                {speciesList.map(sp => {
                  const isActive = selectedShape === shapeKey && selectedNatureSpecies === sp.id;
                  return (
                    <button
                      key={sp.id}
                      onClick={() => handleSelect(shapeKey, sp.id)}
                      style={{
                        background: isActive ? 'rgba(105,240,174,0.18)' : 'rgba(255,255,255,0.04)',
                        color: isActive ? '#69f0ae' : '#e0e0e0',
                        border: isActive ? '1.5px solid #69f0ae' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        padding: '7px 4px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                        boxShadow: isActive ? '0 0 8px rgba(105,240,174,0.28)' : 'none',
                      }}
                    >
                      {sp.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
