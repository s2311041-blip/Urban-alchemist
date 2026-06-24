import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../store/useGameStore';

export const SignTextPromptOverlay = () => {
  const signTextPrompt = useGameStore(state => state.signTextPrompt);
  const setSignTextPrompt = useGameStore(state => state.setSignTextPrompt);
  const placedBlocks = useGameStore(state => state.placedBlocks);
  const setPlacedBlocks = useGameStore(state => state.setPlacedBlocks);
  
  const [text, setText] = useState('');

  useEffect(() => {
    if (signTextPrompt) {
      const block = placedBlocks.find(b => b.id === signTextPrompt);
      setText(block?.text || '');
    }
  }, [signTextPrompt, placedBlocks]);

  if (!signTextPrompt) return null;

  const handleSave = () => {
    const updated = placedBlocks.map(b => 
      b.id === signTextPrompt ? { ...b, text } : b
    );
    setPlacedBlocks(updated);
    setSignTextPrompt(null);
  };

  const handleCancel = () => {
    setSignTextPrompt(null);
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, width: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3>看板の文字を入力</h3>
        <input 
          type="text" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="看板のメッセージ..."
          style={{ padding: 8, fontSize: 16 }}
          autoFocus
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={handleCancel} style={{ padding: '8px 16px' }}>キャンセル</button>
          <button onClick={handleSave} style={{ padding: '8px 16px', backgroundColor: '#00e5ff', color: 'black', fontWeight: 'bold' }}>保存</button>
        </div>
      </div>
    </div>
  );
};
