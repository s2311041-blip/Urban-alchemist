import React from 'react';
import { useGameStore } from '../../../store/useGameStore';

export const FarmingToast = () => {
  const farmingToast = useGameStore((state) => state.farmingToast);
  if (!farmingToast) return null;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(18, 36, 12, 0.92)', border: '1px solid rgba(139, 195, 74, 0.45)', color: '#e9ffda', padding: '8px 10px', borderRadius: '12px', fontSize: '12px', boxShadow: '0 6px 18px rgba(0,0,0,0.25)' }}>
      {farmingToast}
    </div>
  );
};
