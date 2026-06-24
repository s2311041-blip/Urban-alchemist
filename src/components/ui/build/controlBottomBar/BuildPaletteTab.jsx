import React from 'react';
import { RotateCcw, Eye, Sliders } from 'lucide-react';
import { BlockButton } from '../../BlockButton';
import { NaturePalette } from '../../NaturePalette';
import { AgriPalette } from '../../AgriPalette';
import { HoverboardPalette } from '../../HoverboardPalette';
import { useGameStore } from '../../../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

export const BuildPaletteTab = (props) => {
  const {
    paletteMode, setPaletteMode,
    selectedShape, handleSelectShape, isDesigningDiagonal,
    setSelectedScale,
    gridSnapping, setGridSnapping, isDesigningInStudio, setIsDesigningInStudio,
  } = props;
  const store = useGameStore(useShallow(state => ({
    interactionMode: state.interactionMode,
    setInteractionMode: state.setInteractionMode
  })));
  return (
    <>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPaletteMode('blocks')}
                style={{
                  flex: 1,
                  background: paletteMode === 'blocks' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                  color: paletteMode === 'blocks' ? '#00e5ff' : '#aaa',
                  border: paletteMode === 'blocks' ? '1px solid rgba(0, 229, 255, 0.45)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🧱 建築
              </button>
              <button
                onClick={() => setPaletteMode('nature')}
                style={{
                  flex: 1,
                  background: paletteMode === 'nature' ? 'rgba(105, 240, 174, 0.15)' : 'rgba(255,255,255,0.04)',
                  color: paletteMode === 'nature' ? '#69f0ae' : '#aaa',
                  border: paletteMode === 'nature' ? '1px solid rgba(105,240,174,0.45)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🌿 植物
              </button>
              <button
                onClick={() => setPaletteMode('agri')}
                style={{
                  flex: 1,
                  background: paletteMode === 'agri' ? 'rgba(255, 209, 128, 0.15)' : 'rgba(255,255,255,0.04)',
                  color: paletteMode === 'agri' ? '#ffd180' : '#aaa',
                  border: paletteMode === 'agri' ? '1px solid rgba(255,209,128,0.45)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🌾 農地
              </button>
            </div>

            {paletteMode === 'blocks' ? (
            <>
            {/* 形状選択セクション */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📦 ブロック形状
              </div>
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '8px',
                  pointerEvents: (selectedShape === 'diagonal' && isDesigningDiagonal) ? 'none' : 'auto',
                  opacity: (selectedShape === 'diagonal' && isDesigningDiagonal) ? 0.5 : 1
                }}
              >
                <BlockButton active={selectedShape==='block'} onClick={()=>handleSelectShape('block')} color="#eceff1" label="立方体" shortcut="1" />
                <BlockButton active={selectedShape==='half'} onClick={()=>handleSelectShape('half')} color="#eceff1" label="ハーフ" shortcut="2" />
                <BlockButton active={selectedShape==='slope'} onClick={()=>handleSelectShape('slope')} color="#eceff1" label="階段" shortcut="3" />
                <BlockButton active={selectedShape==='pole'} onClick={()=>handleSelectShape('pole')} color="#eceff1" label="丸柱" shortcut="4" />
                <BlockButton active={selectedShape==='path'} onClick={()=>handleSelectShape('path')} color="#eceff1" label="歩道" shortcut="5" />
                <BlockButton active={selectedShape==='rail'} onClick={()=>handleSelectShape('rail')} color="#ffd54f" label="線路" shortcut="7" />
                <BlockButton active={selectedShape==='diagonal'} onClick={()=>handleSelectShape('diagonal')} color="#eceff1" label="斜め" shortcut="8" />
              </div>

              {/* 装飾ブロック */}
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                🪑 デコレーション
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <BlockButton active={selectedShape==='door'} onClick={()=>handleSelectShape('door')} color="#00e5ff" label="ゲート" />
                <BlockButton active={selectedShape==='bench'} onClick={()=>handleSelectShape('bench')} color="#00e5ff" label="ベンチ" />
                <BlockButton active={selectedShape==='light_pole'} onClick={()=>handleSelectShape('light_pole')} color="#00e5ff" label="街灯" />
                <BlockButton active={selectedShape==='hoverboard_station'} onClick={()=>handleSelectShape('hoverboard_station')} color="#00e5ff" label="乗り物台" />
                <BlockButton active={selectedShape==='sign_post'} onClick={()=>handleSelectShape('sign_post')} color="#00e5ff" label="案内看板" />
                <BlockButton active={selectedShape==='ferry_dock'} onClick={()=>handleSelectShape('ferry_dock')} color="#29b6f6" label="フェリー停" />
              </div>

              {selectedShape === 'hoverboard_station' && (
                <HoverboardPalette disabled={selectedShape === 'diagonal' && isDesigningDiagonal} />
              )}

              {/* 特殊ツール */}
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                🔨 建築ツール
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <BlockButton active={selectedShape==='eraser'} onClick={()=>handleSelectShape('eraser')} color="#ff5252" label="消去" isEraser={true} shortcut="9" />
                <BlockButton active={selectedShape==='edit'} onClick={()=>handleSelectShape('edit')} color="#ffd54f" label="編集" isEdit={true} shortcut="0" />
                <BlockButton active={selectedShape==='area_select'} onClick={()=>handleSelectShape('area_select')} color="#ffeb3b" label="範囲選択" shortcut="Shift+S" />
              </div>
            </div>
            </>
            ) : paletteMode === 'nature' ? (
              <NaturePalette
                handleSelectShape={handleSelectShape}
                disabled={selectedShape === 'diagonal' && isDesigningDiagonal}
              />
            ) : paletteMode === 'agri' ? (
              <AgriPalette
                handleSelectShape={handleSelectShape}
                disabled={selectedShape === 'diagonal' && isDesigningDiagonal}
                interactionMode={store.interactionMode}
                setInteractionMode={store.setInteractionMode}
              />
            ) : (
              <></>
            )}

            <div style={{ marginTop: '10px' }}>
              {selectedShape === 'edit' ? (
                <div style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#888',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                  <Sliders size={14} /> 編集モードでは直接ギズモをドラッグしてください
                </div>
              ) : (
                <button
                  onClick={() => useGameStore.getState().setIsAdjustingSize(true)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 229, 255, 0.1)',
                    color: '#00e5ff',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)'}
                >
                  <Sliders size={14} /> 3Dギズモでプレビューサイズ調整
                </button>
              )}
            </div>

            {/* スナップON/OFF と プレビュー（スタジオ）の2カラムボタン */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button 
                onClick={() => setGridSnapping(!gridSnapping)}
                style={{
                  flex: 1,
                  background: gridSnapping ? '#00e5ff' : 'rgba(255,255,255,0.08)',
                  color: gridSnapping ? '#000' : '#fff',
                  border: 'none', padding: '8px', borderRadius: '10px',
                  fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {gridSnapping ? 'スナップ ON' : 'スナップ OFF'}
              </button>
              <button 
                onClick={() => setIsDesigningInStudio(!isDesigningInStudio)}
                style={{
                  flex: 1,
                  background: isDesigningInStudio ? '#ffeb3b' : 'rgba(255,255,255,0.08)',
                  color: isDesigningInStudio ? '#000' : '#fff',
                  border: 'none', padding: '8px', borderRadius: '10px',
                  fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}
              >
                <Eye size={12} /> {isDesigningInStudio ? 'プレビュー中' : 'プレビュー'}
              </button>
            </div>

            {/* サイズ調整リセットボタン */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                サイズ調整:
              </span>
              <button 
                onClick={() => setSelectedScale([1, 1, 1])}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '12px',
                  fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <RotateCcw size={12} /> サイズリセット
              </button>
            </div>
    </>
  );
};
