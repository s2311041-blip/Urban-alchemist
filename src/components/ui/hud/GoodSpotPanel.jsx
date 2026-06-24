import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

const FACTOR_LABEL = {
  hard: '物理',
  soft: '制度',
  human: '心理',
};

export const GoodSpotPanel = () => {
  const goodSpots = useGameStore((state) => state.goodSpots ?? []);
  const setIsGoodSpotBookOpen = useGameStore((state) => state.setIsGoodSpotBookOpen);
  const latest = goodSpots[0] ?? null;

  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: 'rgba(22, 28, 36, 0.72)',
        border: '1px solid rgba(129, 212, 250, 0.45)',
        borderRadius: '10px',
        padding: '8px 10px',
        color: '#d7f3ff',
        boxShadow: '0 6px 16px rgba(0,0,0,0.22)',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>📍 Good Spot</span>
        <span style={{ color: '#81d4fa' }}>{goodSpots.length}</span>
      </div>
      {latest ? (
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#b3e5fc', lineHeight: 1.35 }}>
          <div>{latest.tagLabel}</div>
          <div style={{ opacity: 0.88 }}>分類: {FACTOR_LABEL[latest.factor] ?? latest.factor}</div>
        </div>
      ) : (
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#90a4ae' }}>
          未記録
        </div>
      )}
      <button
        onClick={() => setIsGoodSpotBookOpen(true)}
        style={{
          marginTop: '8px',
          width: '100%',
          background: 'rgba(129,212,250,0.14)',
          color: '#b3e5fc',
          border: '1px solid rgba(129,212,250,0.45)',
          borderRadius: '8px',
          padding: '6px 8px',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        図鑑を開く
      </button>
    </div>
  );
};
