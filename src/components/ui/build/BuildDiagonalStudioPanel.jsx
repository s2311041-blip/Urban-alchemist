import React from 'react';
import { Sliders, Check, RotateCcw, X, Hammer, Eye } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';


export const BuildDiagonalStudioPanel = () => {
  const store = useGameStore(useShallow(state => ({
    buildMode: state.buildMode,
    cancelDesigningInStudio: state.cancelDesigningInStudio,
    confirmDesigningDiagonal: state.confirmDesigningDiagonal,
    customDiagonalPoints: state.customDiagonalPoints,
    diagonalFirstPoint: state.diagonalFirstPoint,
    isDesigningInStudio: state.isDesigningInStudio,
    recentDiagonals: state.recentDiagonals,
    selectedScale: state.selectedScale,
    selectedShape: state.selectedShape,
    setCustomDiagonalPoints: state.setCustomDiagonalPoints,
    setDiagonalFirstPoint: state.setDiagonalFirstPoint,
    setIsDesigningDiagonal: state.setIsDesigningDiagonal,
    setSelectedScale: state.setSelectedScale,
  })));
  return (
    <>
        {store.buildMode && store.isDesigningInStudio && (
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', flex: 1, overflow: 'hidden' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {store.selectedShape === 'diagonal' ? <><Hammer size={22} /> 斜め設計スタジオ</> : <><Eye size={22} /> プレビュー</>}
                </h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>
                  {store.selectedShape === 'diagonal' ? 'カメラを回しながら、立方体上のホログラムアンカーを 2 点選択してください' : 'スライダーを動かしてサイズの調整をリアルタイムに確認できます'}
                </p>
              </div>

              {store.selectedShape === 'diagonal' ? (
                <>
                  {/* 選択ステータス */}
                  <div style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    fontSize: '13px', 
                    fontWeight: 'bold',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: store.diagonalFirstPoint ? '#ffd54f' : '#00e5ff',
                    lineHeight: '1.4'
                  }}>
                    {store.diagonalFirstPoint ? (
                      <span>📍 1点目選択完了！残り 1 点を選択してください（辺の中点も可）</span>
                    ) : (
                      <span>🎯 1点目のアンカーポイントを選択中...</span>
                    )}
                  </div>

                  {/* 過去の斜め履歴 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
                    <span style={{ fontSize: '13px', color: '#00e5ff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ⏳ 過去の斜め履歴 (クリックで復元)
                    </span>
                    
                    {store.recentDiagonals && store.recentDiagonals.length > 0 ? (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px', 
                        overflowY: 'auto', 
                        paddingRight: '4px',
                        flex: 1
                      }}>
                        {store.recentDiagonals.map((pts, idx) => {
                          const p0 = pts[0];
                          const p1 = pts[1];
                          const dx = p1[0] - p0[0];
                          const dy = p1[1] - p0[1];
                          const dz = p1[2] - p0[2];
                          const length = Math.sqrt(dx*dx + dy*dy + dz*dz);
                          const label = `斜め形状 #${idx + 1}`;
                          const desc = `p0(${p0[0].toFixed(2)}, ${p0[1].toFixed(2)}, ${p0[2].toFixed(2)}) → p1(${p1[0].toFixed(2)}, ${p1[1].toFixed(2)}, ${p1[2].toFixed(2)})`;
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                store.setCustomDiagonalPoints(pts);
                                store.setIsDesigningDiagonal(false);
                                store.setDiagonalFirstPoint(null);
                              }}
                              style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                color: 'white',
                                border: '1px solid rgba(0, 229, 255, 0.15)',
                                borderRadius: '12px',
                                padding: '12px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                width: '100%'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 229, 255, 0.08)';
                                e.currentTarget.style.border = '1px solid #00e5ff';
                                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 229, 255, 0.2)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.currentTarget.style.border = '1px solid rgba(0, 229, 255, 0.15)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span style={{ fontWeight: 'bold', color: '#00e5ff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <RotateCcw size={12} /> {label}
                                </span>
                                <span style={{ fontSize: '11px', color: '#aaa' }}>長さ: {length.toFixed(2)}m</span>
                              </div>
                              <span style={{ fontSize: '10px', color: '#ccc', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: 'rgba(0,0,0,0.15)', 
                        borderRadius: '12px',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        color: '#aaa',
                        fontSize: '12px',
                        padding: '20px',
                        textAlign: 'center'
                      }}>
                        配置した斜めブロックの形状がここに履歴として自動保存されます
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* 通常ブロック用のサイズ調整コントロール */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#00e5ff', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sliders size={16} /> サイズ詳細設定 (X, Y, Z)
                      </span>
                      <button 
                        onClick={() => store.setSelectedScale([1, 1, 1])}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '12px',
                          fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                      >
                        <RotateCcw size={12} /> リセット
                      </button>
                    </div>

                    <div style={{ 
                      background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '16px',
                      display: 'flex', flexDirection: 'column', gap: '16px',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#aaa' }}>幅 X:</span>
                          <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{store.selectedScale[0].toFixed(2)}m</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="range" min="0.1" max="3.0" step="0.05" value={store.selectedScale[0]} 
                            onChange={(e) => store.setSelectedScale([parseFloat(e.target.value), store.selectedScale[1], store.selectedScale[2]])}
                            style={{ flex: 1, accentColor: '#00e5ff', height: '4px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#aaa' }}>高さ Y:</span>
                          <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{store.selectedScale[1].toFixed(2)}m</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="range" min="0.1" max="3.0" step="0.05" value={store.selectedScale[1]} 
                            onChange={(e) => store.setSelectedScale([store.selectedScale[0], parseFloat(e.target.value), store.selectedScale[2]])}
                            style={{ flex: 1, accentColor: '#00e5ff', height: '4px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#aaa' }}>奥行き Z:</span>
                          <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{store.selectedScale[2].toFixed(2)}m</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="range" min="0.1" max="3.0" step="0.05" value={store.selectedScale[2]} 
                            onChange={(e) => store.setSelectedScale([store.selectedScale[0], store.selectedScale[1], parseFloat(e.target.value)])}
                            style={{ flex: 1, accentColor: '#00e5ff', height: '4px', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 下部アクションエリア */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
              {store.selectedShape === 'diagonal' && store.customDiagonalPoints && (
                <button 
                  onClick={store.confirmDesigningDiagonal}
                  style={{
                    width: '100%',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#45a049'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#4CAF50'}
                >
                  <Check size={18} /> この形状で決定して配置 (Enter)
                </button>
              )}

              <button 
                onClick={store.cancelDesigningInStudio}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              >
                <X size={16} /> {store.selectedShape === 'diagonal' ? '設計をキャンセル' : 'プレビューを閉じる'}
              </button>
            </div>
          </div>
        )}
    </>
  );
};
