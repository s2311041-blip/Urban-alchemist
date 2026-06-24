import React from 'react';
import { Trash2, Sliders } from 'lucide-react';

export const BlockButton = ({ color, label, active, onClick, isEraser, isEdit, shortcut }) => (
  <button 
    onClick={onClick}
    style={{
      position: 'relative',
      background: active ? color : '#333',
      color: active ? '#333' : ((isEraser || isEdit) ? color : 'white'),
      border: `2px solid ${color}`,
      padding: '12px 15px 8px 15px',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
      transform: active ? 'scale(1.1)' : 'scale(1)',
      transition: 'all 0.2s',
      boxShadow: active ? `0 0 15px ${color}` : 'none'
    }}
  >
    {shortcut && (
      <span style={{
        position: 'absolute',
        top: '2px',
        right: '4px',
        fontSize: '8px',
        background: active ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
        color: active ? '#333' : '#aaa',
        padding: '1px 3px',
        borderRadius: '3px',
        fontWeight: 'bold'
      }}>
        {shortcut}
      </span>
    )}
    {isEraser ? (
      <Trash2 size={16} color={active ? '#333' : color} />
    ) : isEdit ? (
      <Sliders size={16} color={active ? '#333' : color} />
    ) : (
      <div style={{ width: '16px', height: '16px', background: color, borderRadius: '4px', border: '1px solid rgba(0,0,0,0.2)' }}></div>
    )}
    <span style={{ fontSize: '11px', marginTop: '2px' }}>{label}</span>
  </button>
);
