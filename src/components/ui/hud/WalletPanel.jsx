import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { hudPanelStyle } from './hudPanelStyles';

export const WalletPanel = () => {
  const economy = useGameStore((state) => state.economy);
  return (
    <div style={hudPanelStyle({ background: 'rgba(30, 20, 8, 0.82)', border: '1px solid rgba(255, 193, 7, 0.35)', color: '#fff7e1' })}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>💰 通貨</div>
        <div style={{ fontSize: '12px', color: '#ffe082' }}>コイン</div>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffd54f', lineHeight: 1.1 }}>{economy.coin.toLocaleString()}</div>
      <div style={{ fontSize: '11px', marginTop: '3px', color: '#ffecb3' }}>累計獲得: {economy.lifetimeEarned.toLocaleString()}</div>
    </div>
  );
};
