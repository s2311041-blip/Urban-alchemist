import React from 'react';
import { MapPin } from 'lucide-react';

export const TopLeftPanel = ({ bugs }) => {
  return (
    <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ background: 'rgba(255,255,255,0.9)', padding: '15px 25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '22px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={24} color="#ff4444" /> Urban Alchemist</h1>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>私の島 (Lv.{bugs.filter(b=>b.solved).length})</p>
      </div>
    </div>
  );
};
