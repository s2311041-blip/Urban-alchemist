import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';


export const BuildAreaSelectToolbar = () => {
  const store = useGameStore(useShallow(state => ({
    buildMode: state.buildMode,
    selectedShape: state.selectedShape,
    selectedAreaBlocks: state.selectedAreaBlocks,
    isEditingInStudio: state.isEditingInStudio,
    areaAction: state.areaAction,
    handleAreaMove: state.handleAreaMove,
    handleAreaCopy: state.handleAreaCopy,
    handleAreaDelete: state.handleAreaDelete,
    handleAreaCancel: state.handleAreaCancel
  })));
  return (
    <>
        {store.buildMode && store.selectedShape === 'area_select' && store.selectedAreaBlocks !== null && !store.isEditingInStudio && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'rgba(20, 20, 35, 0.9)',
            border: '1px solid rgba(255, 235, 59, 0.5)',
            boxShadow: '0 0 30px rgba(255, 235, 59, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            padding: '12px 24px',
            color: 'white',
            pointerEvents: 'auto',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffeb3b' }}>
                <span style={{ fontSize: '16px' }}>📦</span> {store.selectedAreaBlocks.length}個のブロックを選択中
              </div>
              <div style={{ fontSize: '11px', color: '#aaa' }}>
                {store.areaAction === 'copy' ? '配置先をクリックしてコピー' : 
                 store.areaAction === 'move' ? '配置先をクリックして移動' : 
                 '操作を選んでください'}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
              <button 
                onClick={store.handleAreaMove}
                style={{
                  background: store.areaAction === 'move' ? '#00e5ff' : 'rgba(0, 229, 255, 0.1)',
                  color: store.areaAction === 'move' ? '#000' : '#00e5ff',
                  border: '1px solid #00e5ff', padding: '6px 12px', borderRadius: '12px',
                  fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                移動
              </button>
              <button 
                onClick={store.handleAreaCopy}
                style={{
                  background: store.areaAction === 'copy' ? '#69f0ae' : 'rgba(105, 240, 174, 0.1)',
                  color: store.areaAction === 'copy' ? '#000' : '#69f0ae',
                  border: '1px solid #69f0ae', padding: '6px 12px', borderRadius: '12px',
                  fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                コピー
              </button>
              <button 
                onClick={store.handleAreaDelete}
                style={{
                  background: 'rgba(255, 82, 82, 0.1)',
                  color: '#ff5252',
                  border: '1px solid #ff5252', padding: '6px 12px', borderRadius: '12px',
                  fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                削除
              </button>
              <button 
                onClick={store.handleAreaCancel}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.3)', padding: '6px 12px', borderRadius: '12px',
                  fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                  marginLeft: '8px'
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
    </>
  );
};
