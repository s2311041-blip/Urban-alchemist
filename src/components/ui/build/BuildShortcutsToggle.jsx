import React from 'react';

/** 建築モード: ショートカット一覧（?）— 右パレットと被らないよう左上に配置 */
export const BuildShortcutsToggle = ({ onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      zIndex: 110,
      pointerEvents: 'auto',
      padding: '8px 14px',
      borderRadius: '12px',
      border: '1px solid rgba(0, 229, 255, 0.45)',
      background: 'rgba(10, 10, 20, 0.92)',
      color: '#00e5ff',
      fontSize: '12px',
      fontWeight: 700,
      cursor: 'pointer',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
      fontFamily: '"Outfit", "Inter", sans-serif',
    }}
  >
    ? ショートカット一覧
  </button>
);
