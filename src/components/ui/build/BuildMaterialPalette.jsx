import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { BUILD_MATERIAL_OPTIONS } from '../../../constants/gameData';


export const BuildMaterialPalette = () => {
  const store = useGameStore(useShallow(state => ({
    buildMode: state.buildMode,
    isEditingInStudio: state.isEditingInStudio,
    isDesigningInStudio: state.isDesigningInStudio,
    selectedShape: state.selectedShape,
    selectedMaterial: state.selectedMaterial,
    setSelectedMaterial: state.setSelectedMaterial,
    glassColor: state.glassColor,
    setGlassColor: state.setGlassColor
  })));
  return (
    <>
        {store.buildMode && !store.isEditingInStudio && (!store.isDesigningInStudio || store.selectedShape !== 'diagonal') && store.selectedShape !== 'hoverboard_station' && (
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '120px',
            background: 'rgba(10, 11, 20, 0.75)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '24px',
            boxShadow: '0 0 35px rgba(0, 229, 255, 0.15), inset 0 0 12px rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 10px',
            gap: '12px',
            pointerEvents: 'auto',
            animation: 'slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: '"Outfit", "Inter", sans-serif'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '8px', textAlign: 'center', opacity: 0.9 }}>
              Material
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', paddingRight: '2px' }} className="material-scroll-container">
              {BUILD_MATERIAL_OPTIONS.map((mat) => {
                const active = store.selectedMaterial === mat.id;
                const isDiagonalDesign = store.selectedShape === 'diagonal' && store.isDesigningDiagonal;
                return (
                  <div key={mat.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                    <button
                      disabled={isDiagonalDesign}
                    onClick={() => store.setSelectedMaterial(mat.id)}
                    style={{
                      width: '100%',
                      background: active ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: 'white',
                      border: active ? '1.5px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '12px 6px',
                      cursor: isDiagonalDesign ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      position: 'relative',
                      opacity: isDiagonalDesign ? 0.4 : 1,
                      boxShadow: active ? '0 0 15px rgba(0, 229, 255, 0.35), inset 0 0 8px rgba(0, 229, 255, 0.2)' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      transformOrigin: 'left center'
                    }}
                    title={`${mat.label}を選択 (キー: ${mat.shortcut})`}
                    onMouseOver={(e) => {
                      if (!isDiagonalDesign && !active) {
                        e.currentTarget.style.transform = 'scale(1.08) translateX(5px)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isDiagonalDesign && !active) {
                        e.currentTarget.style.transform = 'scale(1) translateX(0)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                      } else if (active) {
                        e.currentTarget.style.transform = 'scale(1) translateX(0)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '22px', filter: active ? 'drop-shadow(0 0 4px rgba(0, 229, 255, 0.6))' : 'none' }}>{mat.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: active ? '#00e5ff' : '#ddd' }}>{mat.label}</span>
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '6px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: active ? '#00e5ff' : 'rgba(255, 255, 255, 0.4)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '1px 3px',
                      borderRadius: '4px'
                    }}>
                      {mat.shortcut}
                    </span>
                    </button>
                    {active && mat.id === 'glass' && (
                      <div style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginTop: '2px' }}>
                        <span style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>色指定:</span>
                        <input 
                          type="color" 
                          value={store.selectedGlassColor || '#E1F5FE'} 
                          onChange={(e) => store.setSelectedGlassColor(e.target.value)}
                          style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', background: 'transparent', cursor: 'pointer', width: '28px', height: '24px', padding: 0 }}
                          title="ガラスの色を変更"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </>
  );
};
