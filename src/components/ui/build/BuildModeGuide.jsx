import React from 'react';
import { SIDE_PANEL_WIDTH } from '../../../constants/uiLayout';

/** 不満解決建築モード用の右下操作ガイド（フリー建築では非表示） */
export const BuildModeGuide = () => (
  <div style={{
    background: 'rgba(10, 10, 20, 0.88)',
    padding: '15px',
    borderRadius: '15px',
    color: 'white',
    fontSize: '11px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    backdropFilter: 'blur(10px)',
    pointerEvents: 'none',
    border: '1px solid rgba(0, 229, 255, 0.25)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    fontFamily: '"Outfit", "Inter", sans-serif',
    width: `${SIDE_PANEL_WIDTH}px`,
    boxSizing: 'border-box',
    animation: 'fadeIn 0.5s',
  }}
  >
    <div style={{
      fontWeight: 'bold',
      marginBottom: '4px',
      fontSize: '13px',
      color: '#00e5ff',
      borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
      paddingBottom: '4px',
    }}
    >
      🧱 建築モード 操作ガイド
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
      <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>矢印キー</span>
      <span>カメラの平行移動</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
      <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>ドラッグ (左/右)</span>
      <span>カメラの回転</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
      <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>スクロール</span>
      <span>ズーム</span>
    </div>

    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />

    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
      <span style={{ color: '#fff', fontWeight: 'bold' }}>F</span>
      <span>ブロックの回転</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
      <span style={{ color: '#fff', fontWeight: 'bold' }}>O / P</span>
      <span>素材「砂 / 魔力」選択</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
      <span style={{ color: '#ff5252', fontWeight: 'bold' }}>Esc</span>
      <span>範囲選択 / 設計の解除</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
      <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>?</span>
      <span>ショートカット一覧（左上）</span>
    </div>
  </div>
);
