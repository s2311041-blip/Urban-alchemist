import React from 'react';
import { Sliders, Check, RotateCcw, RotateCw, X } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';


export const BuildEditStudioPanel = () => {
  const store = useGameStore(useShallow(state => ({
    buildMode: state.buildMode,
    cancelEditingInStudio: state.cancelEditingInStudio,
    finishEditingInStudio: state.finishEditingInStudio,
    isEditingInStudio: state.isEditingInStudio,
    pushStudioHistory: state.pushStudioHistory,
    redoStudio: state.redoStudio,
    setStudioMaterial: state.setStudioMaterial,
    setStudioPositionOffset: state.setStudioPositionOffset,
    setStudioScale: state.setStudioScale,
    setStudioShape: state.setStudioShape,
    studioHistory: state.studioHistory,
    studioHistoryIndex: state.studioHistoryIndex,
    studioMaterial: state.studioMaterial,
    studioPositionOffset: state.studioPositionOffset,
    studioScale: state.studioScale,
    studioShape: state.studioShape,
    studioStartScale: state.studioStartScale,
    undoStudio: state.undoStudio,
  })));
  return (
    <>
        {store.buildMode && store.isEditingInStudio && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '350px',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.85)',
            borderLeft: '1px solid rgba(0, 229, 255, 0.4)',
            boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(16px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: '30px 24px',
            color: 'white',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.3s ease',
            pointerEvents: 'auto'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sliders size={22} /> 3D形状スタジオ
                  </h2>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#aaa' }}>
                    ドラッグ伸縮、またはスライダーでミリ単位調整
                  </p>
                </div>
                {/* Undo / Redo ボタン */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={store.undoStudio} 
                    disabled={store.studioHistoryIndex <= 0}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: store.studioHistoryIndex > 0 ? '#00e5ff' : '#555',
                      cursor: store.studioHistoryIndex > 0 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      boxShadow: store.studioHistoryIndex > 0 ? '0 0 8px rgba(0, 229, 255, 0.2)' : 'none'
                    }}
                    title="一操作戻る"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button 
                    onClick={store.redoStudio} 
                    disabled={store.studioHistoryIndex >= store.studioHistory.length - 1}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: store.studioHistoryIndex < store.studioHistory.length - 1 ? '#00e5ff' : '#555',
                      cursor: store.studioHistoryIndex < store.studioHistory.length - 1 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      boxShadow: store.studioHistoryIndex < store.studioHistory.length - 1 ? '0 0 8px rgba(0, 229, 255, 0.2)' : 'none'
                    }}
                    title="一操作進む"
                  >
                    <RotateCw size={16} />
                  </button>
                </div>
              </div>

              {/* サイズカスタムスライダー */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#00e5ff' }}>📐 ミリ単位調整 (X, Y, Z)</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span>幅 X:</span>
                      <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{store.studioScale[0].toFixed(2)}m</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="3.0" step="0.05" value={store.studioScale[0]} 
                      onChange={(e) => store.setStudioScale([parseFloat(e.target.value), store.studioScale[1], store.studioScale[2]])}
                      onMouseUp={() => store.pushStudioHistory(store.studioScale, store.studioPositionOffset, store.studioMaterial, store.studioShape)}
                      onTouchEnd={() => store.pushStudioHistory(store.studioScale, store.studioPositionOffset, store.studioMaterial, store.studioShape)}
                      style={{ accentColor: '#00e5ff', height: '4px', cursor: 'pointer', width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span>高さ Y:</span>
                      <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{store.studioScale[1].toFixed(2)}m</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="3.0" step="0.05" value={store.studioScale[1]} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        store.setStudioScale([store.studioScale[0], val, store.studioScale[2]]);
                        const newOffsetY = (val - store.studioStartScale[1]) * 0.25;
                        store.setStudioPositionOffset([store.studioPositionOffset[0], newOffsetY, store.studioPositionOffset[2]]);
                      }}
                      onMouseUp={() => store.pushStudioHistory(store.studioScale, store.studioPositionOffset, store.studioMaterial, store.studioShape)}
                      onTouchEnd={() => store.pushStudioHistory(store.studioScale, store.studioPositionOffset, store.studioMaterial, store.studioShape)}
                      style={{ accentColor: '#00e5ff', height: '4px', cursor: 'pointer', width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span>奥行き Z:</span>
                      <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{store.studioScale[2].toFixed(2)}m</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="3.0" step="0.05" value={store.studioScale[2]} 
                      onChange={(e) => store.setStudioScale([store.studioScale[0], store.studioScale[1], parseFloat(e.target.value)])}
                      onMouseUp={() => store.pushStudioHistory(store.studioScale, store.studioPositionOffset, store.studioMaterial, store.studioShape)}
                      onTouchEnd={() => store.pushStudioHistory(store.studioScale, store.studioPositionOffset, store.studioMaterial, store.studioShape)}
                      style={{ accentColor: '#00e5ff', height: '4px', cursor: 'pointer', width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* 素材選択 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#00e5ff' }}>🎨 素材マテリアル</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['stone', 'wood', 'brick', 'water', 'light', 'grass', 'glass', 'iron', 'sand', 'mana'].map((matKey) => {
                    const active = store.studioMaterial === matKey;
                    const labels = { stone:'石', wood:'木', brick:'レンガ', water:'水', light:'光', grass:'芝生', glass:'ガラス', iron:'鉄', sand:'砂', mana:'魔力' };
                    return (
                      <button 
                        key={matKey}
                        onClick={() => {
                          store.setStudioMaterial(matKey);
                          store.pushStudioHistory(store.studioScale, store.studioPositionOffset, matKey, store.studioShape);
                        }}
                        style={{
                          background: active ? '#00e5ff' : 'rgba(255, 255, 255, 0.05)',
                          color: active ? '#000' : 'white',
                          border: active ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          padding: '8px 5px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: active ? '0 0 10px rgba(0, 229, 255, 0.4)' : 'none'
                        }}
                      >
                        {labels[matKey]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 形状選択 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#00e5ff' }}>📦 形状の変更</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {['block', 'half', 'slope', 'pole', 'path', 'rail', 'diagonal', 'door', 'bench', 'light_pole', 'sign_post', 'ferry_dock', 'hoverboard_station', 'flower', 'shrub', 'turf', 'hedge', 'street_tree', 'canopy_tree'].map((shapeKey) => {
                    const active = store.studioShape === shapeKey;
                    const labels = { block:'立方体', half:'ハーフ', slope:'階段', pole:'丸柱', path:'歩道', rail:'線路', diagonal:'斜め', door:'ゲート', bench:'ベンチ', light_pole:'街灯', sign_post:'案内看板', ferry_dock:'フェリー停', hoverboard_station:'乗り物台', flower:'草花', shrub:'低木', turf:'芝生', hedge:'垣根', street_tree:'街路樹', canopy_tree:'日陰樹' };
                    return (
                      <button 
                        key={shapeKey}
                        onClick={() => {
                          store.setStudioShape(shapeKey);
                          store.pushStudioHistory(store.studioScale, store.studioPositionOffset, store.studioMaterial, shapeKey);
                        }}
                        style={{
                          background: active ? '#00e5ff' : 'rgba(255, 255, 255, 0.05)',
                          color: active ? '#000' : 'white',
                          border: active ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          padding: '8px 5px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {labels[shapeKey]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={store.finishEditingInStudio}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
              >
                <Check size={18} /> 編集を確定して島に戻る
              </button>

              <button 
                onClick={store.cancelEditingInStudio}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <X size={16} /> 変更をキャンセル
              </button>
            </div>
          </div>
        )}
    </>
  );
};
