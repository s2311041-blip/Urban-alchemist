import React, { useState } from 'react';
import { Trophy, Vote, RotateCcw } from 'lucide-react';
import { rankCompetitionEntries } from '../../../constants/competitionData';

const panelStyle = {
  marginBottom: 16,
  padding: 14,
  borderRadius: 12,
  background: 'rgba(255, 183, 77, 0.08)',
  border: '1px solid rgba(255, 183, 77, 0.25)',
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

export function CompetitionPanel({
  competition,
  voteCompetitionEntry,
  resetCompetition,
  setCompetitionTopic,
}) {
  const [topicDraft, setTopicDraft] = useState(competition?.topic?.title ?? '');
  const ranked = rankCompetitionEntries(competition?.entries ?? [], competition?.votes ?? []);

  return (
    <div style={panelStyle}>
      <div style={{ fontSize: 12, color: '#ffcc80', fontWeight: 'bold', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Trophy size={16} />
        匿名コンペ（投票）
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#b0bec5', lineHeight: 1.5 }}>
        {competition?.topic?.description}
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={topicDraft}
          onChange={(e) => setTopicDraft(e.target.value)}
          placeholder="お題タイトル"
          style={{
            flex: 1,
            minWidth: 160,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(0,0,0,0.25)',
            color: '#fff',
            fontSize: 12,
          }}
        />
        <button
          type="button"
          style={{ ...btnStyle, background: '#ff8f00', color: '#1a1a1a' }}
          onClick={() => setCompetitionTopic?.({ title: topicDraft.trim() || competition.topic.title })}
        >
          お題更新
        </button>
        <button
          type="button"
          style={{ ...btnStyle, background: 'rgba(255,255,255,0.12)', color: '#cfd8dc' }}
          onClick={() => resetCompetition?.()}
        >
          <RotateCcw size={14} />
          リセット
        </button>
      </div>

      <div style={{ fontSize: 13, fontWeight: 'bold', color: '#ffe0b2', marginBottom: 8 }}>
        お題:
        {' '}
        {competition?.topic?.title}
      </div>

      {ranked.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12, color: '#90a4ae' }}>
          改善 DIY 中に「コンペにエントリー」で案を登録できます（下部バー）。
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ranked.map((entry, index) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>
                  {index + 1}
                  .
                  {' '}
                  {entry.label}
                </div>
                <div style={{ fontSize: 11, color: '#90a4ae' }}>
                  {entry.plan ?? '—'}
                  {' '}
                  ·
                  {' '}
                  {entry.blockSnapshot.length}
                  {' '}
                  ブロック
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#ffcc80', fontWeight: 'bold' }}>
                  {entry.voteCount}
                  {' '}
                  票
                </span>
                <button
                  type="button"
                  style={{ ...btnStyle, background: '#5c6bc0', color: '#fff' }}
                  onClick={() => voteCompetitionEntry?.(entry.id)}
                >
                  <Vote size={14} />
                  投票
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
