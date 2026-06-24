import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

export const IslandSpawnToast = () => {
  const islandToast = useGameStore((state) => state.islandToast);
  if (!islandToast) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        pointerEvents: 'none',
        maxWidth: 'min(92vw, 560px)',
        background: 'rgba(1, 30, 48, 0.94)',
        border: '1px solid rgba(79, 195, 247, 0.55)',
        color: '#e1f5fe',
        padding: '14px 20px',
        borderRadius: '14px',
        fontSize: '14px',
        fontWeight: 'bold',
        lineHeight: 1.5,
        textAlign: 'center',
        boxShadow: '0 10px 32px rgba(0, 0, 0, 0.35)',
      }}
    >
      {islandToast}
    </div>
  );
};
