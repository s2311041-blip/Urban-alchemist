import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { isQuestOnIsland } from '../../../store/helpers/questState';

const STORAGE_KEY = 'ua-rq2-tutorial-seen';

export function QuestTutorialOverlay({ quests = [] }) {
  const [visible, setVisible] = useState(false);
  const hasQuestOnIsland = quests.some((q) => isQuestOnIsland(q));

  useEffect(() => {
    if (!hasQuestOnIsland) return;
    if (localStorage.getItem(STORAGE_KEY) === '1') return;
    setVisible(true);
  }, [hasQuestOnIsland]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9500,
      background: 'rgba(0,0,0,0.72)',
      display: 'grid',
      placeItems: 'center',
      padding: 20,
    }}
    >
      <div style={{
        width: 'min(440px, 100%)',
        borderRadius: 16,
        background: 'linear-gradient(160deg, #0d2137 0%, #1a237e 100%)',
        border: '1px solid rgba(129, 199, 132, 0.45)',
        color: '#eaf4ff',
        padding: '22px 20px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>島へようこそ</h2>
          <button type="button" onClick={dismiss} style={closeBtnStyle} aria-label="閉じる">
            <X size={20} />
          </button>
        </div>
        <ul style={{ margin: '0 0 16px', paddingLeft: 18, lineHeight: 1.65, fontSize: 13, color: '#cfd8dc' }}>
          <li><strong style={{ color: '#81c784' }}>黒オーブ</strong> = 誰かの声（写真・コメント）</li>
          <li><strong style={{ color: '#ffb74d' }}>周りのブロック</strong> = 不満の見た目（段差・暗さなど）</li>
          <li>タップ → プラン選択 → <strong>改善予算</strong>内で DIY → 完成</li>
        </ul>
        <button type="button" onClick={dismiss} style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 12,
          border: 'none',
          background: '#43a047',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 14,
          cursor: 'pointer',
        }}
        >
          わかった！
        </button>
      </div>
    </div>
  );
}

const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#90caf9',
  cursor: 'pointer',
  padding: 4,
};
