import React from 'react';
import { Sliders, Trash2, Check } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';


export const BuildEditBlockToolbar = () => {
  const store = useGameStore(useShallow(state => ({
    buildMode: state.buildMode,
    finishEditingInStudio: state.finishEditingInStudio,
    isEditingInStudio: state.isEditingInStudio,
    placedBlocks: state.placedBlocks,
    selectedEditBlockId: state.selectedEditBlockId,
    setPlacedBlocks: state.setPlacedBlocks,
    setSelectedEditBlockId: state.setSelectedEditBlockId
  })));
  return (
    <>
        {store.buildMode && store.selectedEditBlockId && !store.isEditingInStudio && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '12px 24px',
            color: 'white',
            pointerEvents: 'auto'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5ff' }}>
                <Sliders size={16} /> ブロック編集中
              </div>
              <div style={{ fontSize: '11px', color: '#aaa' }}>
                3Dギズモドラッグで伸縮 / 下パネルで形状・素材変更 【Esc】で選択解除
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  store.setPlacedBlocks(store.placedBlocks.filter(b => b.id !== store.selectedEditBlockId));
                  store.setSelectedEditBlockId(null);
                }}
                style={{
                  background: 'rgba(255, 82, 82, 0.2)',
                  color: '#ff5252',
                  border: '1px solid rgba(255, 82, 82, 0.4)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 82, 82, 0.3)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 82, 82, 0.2)'}
              >
                <Trash2 size={14} /> 削除する
              </button>
              
              <button
                onClick={() => store.finishEditingInStudio()}
                style={{
                  background: 'rgba(76, 175, 80, 0.2)',
                  color: '#4CAF50',
                  border: '1px solid rgba(76, 175, 80, 0.4)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(76, 175, 80, 0.3)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(76, 175, 80, 0.2)'}
              >
                <Check size={14} /> 編集完了
              </button>
            </div>
          </div>
        )}
    </>
  );
};
