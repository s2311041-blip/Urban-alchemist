import React from 'react';
import { Hammer, ClipboardList } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';

export const MainBottomNav = ({ setIsQuestBoardOpen }) => {
  const { startDIY } = useGameStore(useShallow(state => ({
    startDIY: state.startDIY
  })));

  return (
    <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', background: 'rgba(255,255,255,0.95)', padding: '15px 30px', borderRadius: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
      <button 
        onClick={() => { startDIY('free'); }} 
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <Hammer size={24} color="#00e5ff" />
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#00e5ff' }}>フリー建築</span>
      </button>
      
      <button 
        onClick={() => setIsQuestBoardOpen(true)} 
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <ClipboardList size={24} color="#333" />
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>クエスト</span>
      </button>
    </div>
  );
};
