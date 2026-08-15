import React from 'react';
import { BUILD_MATERIAL_OPTIONS } from '../../../../constants/gameData';
import { useGameStore } from '../../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

/** 右パレット内の素材選択（左フロートパレットの代替・モバイル向け） */
export function BuildMaterialSection({ disabled = false }) {
  const store = useGameStore(useShallow((state) => ({
    selectedMaterial: state.selectedMaterial,
    setSelectedMaterial: state.setSelectedMaterial,
    glassColor: state.glassColor,
    setGlassColor: state.setGlassColor,
  })));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 'bold', color: '#00e5ff' }}>
        🎨 素材
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      >
        {BUILD_MATERIAL_OPTIONS.map((mat) => {
          const active = store.selectedMaterial === mat.id;
          return (
            <div key={mat.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button
                type="button"
                onClick={() => store.setSelectedMaterial(mat.id)}
                style={{
                  width: '100%',
                  background: active ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: 'white',
                  border: active ? '1.5px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: '10px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: 'inherit',
                }}
              >
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: mat.color,
                  boxShadow: active ? '0 0 10px rgba(0,229,255,0.45)' : 'none',
                }}
                />
                <span style={{ fontSize: 11, fontWeight: 700 }}>{mat.label}</span>
              </button>
              {mat.id === 'glass' && active && (
                <input
                  type="color"
                  value={store.glassColor}
                  onChange={(e) => store.setGlassColor(e.target.value)}
                  style={{ width: '100%', height: 28, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
