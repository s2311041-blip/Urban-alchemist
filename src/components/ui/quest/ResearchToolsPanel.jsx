import React, { useState } from 'react';
import { Download, FlaskConical, PlayCircle } from 'lucide-react';

const panelStyle = {
  marginBottom: 16,
  padding: 14,
  borderRadius: 12,
  background: 'rgba(171, 71, 188, 0.08)',
  border: '1px solid rgba(171, 71, 188, 0.25)',
};

const btnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 12px',
  borderRadius: 10,
  border: 'none',
  fontSize: 12,
  fontWeight: 'bold',
  cursor: 'pointer',
};

export function ResearchToolsPanel({ exportResearchLog, loadDemoQuestSet, postStats }) {
  const [loading, setLoading] = useState(false);
  const eventCount = postStats?.events?.length ?? 0;

  const runDemo = async () => {
    setLoading(true);
    try {
      loadDemoQuestSet?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 12, color: '#ce93d8', fontWeight: 'bold', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <FlaskConical size={16} />
        研究・WS ツール
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#b0bec5', lineHeight: 1.5 }}>
        デモ 3 件（同一駅 + 異 needType）と研究ログ CSV（
        {eventCount}
        {' '}
        イベント）。
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={loading}
          style={{ ...btnStyle, background: '#7b1fa2', color: '#fff' }}
          onClick={runDemo}
        >
          <PlayCircle size={14} />
          WS デモ 3 件を載せる
        </button>
        <button
          type="button"
          style={{ ...btnStyle, background: 'rgba(255,255,255,0.12)', color: '#e1bee7' }}
          onClick={() => exportResearchLog?.()}
        >
          <Download size={14} />
          研究ログ CSV
        </button>
      </div>
    </div>
  );
}
