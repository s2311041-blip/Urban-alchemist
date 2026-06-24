import React from 'react';
import { Eye, Accessibility } from 'lucide-react';

export const ViewModeToggleButton = ({ viewMode, setViewMode }) => (
  <button
    onClick={() => setViewMode(viewMode === 'tps' ? 'god' : 'tps')}
    style={{
      width: '100%',
      boxSizing: 'border-box',
      background: 'rgba(255,255,255,0.9)',
      padding: '10px 15px',
      borderRadius: '15px',
      border: 'none',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: 'bold',
      color: '#333',
    }}
  >
    {viewMode === 'tps' ? <Eye size={20} /> : <Accessibility size={20} />}
    {viewMode === 'tps' ? '神様視点へ' : 'アバター視点へ'}
  </button>
);
