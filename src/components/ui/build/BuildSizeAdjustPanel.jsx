import React from 'react';
import { Sliders, Check, RotateCcw, RotateCw } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';


export const BuildSizeAdjustPanel = () => {
  const store = useGameStore(useShallow(state => ({
    buildMode: state.buildMode,
    cancelSizeAdjust: state.cancelSizeAdjust,
    isAdjustingSize: state.isAdjustingSize,
    placeBlockAtHover: state.placeBlockAtHover,
    previewFixedPos: state.previewFixedPos,
    redoSizeAdjust: state.redoSizeAdjust,
    setIsAdjustingSize: state.setIsAdjustingSize,
    sizeAdjustHistory: state.sizeAdjustHistory,
    sizeAdjustHistoryIndex: state.sizeAdjustHistoryIndex,
    undoSizeAdjust: state.undoSizeAdjust,
  })));
  return (
    <>
        {store.buildMode && store.isAdjustingSize && (
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
            {!store.previewFixedPos ? (
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5ff' }}>
                    <Sliders size={16} /> 配置場所を選択
                  </div>
                  <div style={{ fontSize: '11px', color: '#aaa' }}>
                    プレビューを置きたい場所をダブルクリックしてください
                  </div>
                </div>
                <button onClick={() => store.cancelSizeAdjust()} style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>キャンセル</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5ff' }}>
                    <Sliders size={16} /> プレビューサイズ調整中
                  </div>
                  <div style={{ fontSize: '11px', color: '#aaa' }}>
                    3Dギズモをドラッグし、Enterキーで確定してください
                  </div>
                </div>

                {/* Undo / Redo ボタン */}
                <div style={{ display: 'flex', gap: '8px', marginLeft: '5px', marginRight: '5px' }}>
                  <button 
                    onClick={store.undoSizeAdjust} 
                    disabled={store.sizeAdjustHistoryIndex <= 0}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '8px',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: store.sizeAdjustHistoryIndex > 0 ? '#00e5ff' : '#555',
                      cursor: store.sizeAdjustHistoryIndex > 0 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                    }}
                    title="一操作戻る"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button 
                    onClick={store.redoSizeAdjust} 
                    disabled={store.sizeAdjustHistoryIndex >= store.sizeAdjustHistory.length - 1}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '8px',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: store.sizeAdjustHistoryIndex < store.sizeAdjustHistory.length - 1 ? '#00e5ff' : '#555',
                      cursor: store.sizeAdjustHistoryIndex < store.sizeAdjustHistory.length - 1 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                    }}
                    title="一操作進む"
                  >
                    <RotateCw size={14} />
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    store.placeBlockAtHover(store.previewFixedPos);
                    store.setIsAdjustingSize(false);
                  }}
                  style={{
                    background: '#00e5ff',
                    color: '#000',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={14} /> 確定して配置
                </button>
                <button onClick={() => store.cancelSizeAdjust()} style={{ background: 'transparent', color: '#888', border: '1px solid #555', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>キャンセル</button>
              </>
            )}
          </div>
        )}
    </>
  );
};
