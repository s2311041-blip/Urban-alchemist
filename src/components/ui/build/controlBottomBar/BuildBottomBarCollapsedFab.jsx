import React from 'react';
import { Hammer } from 'lucide-react';

export const BuildBottomBarCollapsedFab = ({ onExpand }) => (
  <button
    type="button"
    onClick={onExpand}
    style={{
      position: 'absolute',
      bottom: '25px',
      right: '25px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'rgba(15, 23, 42, 0.95)',
      border: '2px solid #00e5ff',
      boxShadow: '0 0 20px rgba(0, 229, 255, 0.6), 0 8px 32px rgba(0,0,0,0.5)',
      color: '#00e5ff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      pointerEvents: 'auto',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'scale(1.1)';
      e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 229, 255, 0.8), 0 8px 32px rgba(0,0,0,0.5)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.6), 0 8px 32px rgba(0,0,0,0.5)';
    }}
    title="建築メニューを開く"
  >
    <Hammer size={24} style={{ animation: 'pulse 2s infinite' }} />
  </button>
);
