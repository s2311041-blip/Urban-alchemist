import React from 'react';
import { ChevronLeft, Download, Trash2, Pencil } from 'lucide-react';
import { AR_THEME } from '../constants/arTheme';

export function ArListPanel({
  annotations,
  totalPoints,
  onExport,
  onDelete,
  onEdit,
  onClose,
}) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9000,
      background: AR_THEME.bg,
      color: AR_THEME.text,
      display: 'flex',
      flexDirection: 'column',
    }}
    >
      <header style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      >
        <div>
          <div style={{ fontSize: 12, color: AR_THEME.accent }}>記録一覧</div>
          <div style={{ fontWeight: 'bold' }}>{totalPoints} pt</div>
        </div>
        <button type="button" onClick={onClose} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'transparent',
          border: 'none',
          color: AR_THEME.text,
          cursor: 'pointer',
          fontSize: 15,
        }}
        >
          <ChevronLeft size={20} />
          ホーム
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {annotations.length === 0 ? (
          <p style={{ color: AR_THEME.muted, textAlign: 'center', marginTop: 40 }}>まだ記録がありません</p>
        ) : (
          annotations.map((item) => (
            <article
              key={item.id}
              style={{
                padding: 14,
                marginBottom: 10,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: item.kind === 'positive' ? 'rgba(102,187,106,0.2)' : 'rgba(239,83,80,0.2)',
                  }}
                  >
                    {item.kind === 'positive' ? '良い' : 'バリア'}
                  </span>
                  <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5 }}>{item.comment || '—'}</p>
                </div>
                {item.isMine && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button type="button" onClick={() => onEdit?.(item)} style={{ background: 'transparent', border: 'none', color: AR_THEME.accent, cursor: 'pointer' }} aria-label="編集">
                      <Pencil size={18} />
                    </button>
                    <button type="button" onClick={() => onDelete(item.id)} style={{ background: 'transparent', border: 'none', color: AR_THEME.muted, cursor: 'pointer' }} aria-label="削除">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <div style={{ padding: `12px 16px ${AR_THEME.safeBottom}` }}>
        <button
          type="button"
          onClick={onExport}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)',
            color: AR_THEME.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontWeight: 'bold',
          }}
        >
          <Download size={18} />
          JSON書き出し（RQ2接続用）
        </button>
      </div>
    </div>
  );
}
