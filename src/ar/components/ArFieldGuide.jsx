import React, { useMemo, useState } from 'react';
import { ChevronLeft, Download, Pencil, Search, Trash2 } from 'lucide-react';
import { NEED_CATEGORY_OPTIONS } from '../../constants/barrierData';
import { AR_THEME } from '../constants/arTheme';
import { ArPinCard } from './ArPinCard';
import {
  collectFilterChips,
  filterAnnotations,
  getAnnotationTags,
} from '../utils/fieldGuideFilter';

export function ArFieldGuide({
  annotations,
  authorId,
  totalPoints,
  onExport,
  onDelete,
  onEdit,
  onClose,
}) {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [scope, setScope] = useState('all');
  const [cardPin, setCardPin] = useState(null);

  const scoped = useMemo(
    () => filterAnnotations(annotations, { scope, authorId }),
    [annotations, scope, authorId],
  );

  const chips = useMemo(() => collectFilterChips(scoped), [scoped]);
  const filtered = useMemo(
    () => filterAnnotations(scoped, { query, activeTagIds: activeTags }),
    [scoped, query, activeTags],
  );

  const toggleTag = (id) => {
    setActiveTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

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
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
      >
        <button type="button" onClick={onClose} style={backBtnStyle}>
          <ChevronLeft size={20} />
          ホーム
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: AR_THEME.accent }}>街の記録図鑑</div>
          <div style={{ fontWeight: 'bold', fontSize: 17 }}>{filtered.length} 件 · {totalPoints} pt</div>
        </div>
      </header>

      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[
            { id: 'all', label: 'みんな' },
            { id: 'mine', label: '自分' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setScope(id)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 12,
                border: scope === id ? `2px solid ${AR_THEME.accent}` : '1px solid rgba(255,255,255,0.15)',
                background: scope === id ? 'rgba(79,195,247,0.15)' : 'rgba(255,255,255,0.04)',
                color: AR_THEME.text,
                fontWeight: 'bold',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          borderRadius: 14,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        >
          <Search size={18} color={AR_THEME.muted} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="コメント・場所・タグで検索"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: AR_THEME.text,
              fontSize: 15,
              outline: 'none',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '12px 0',
          WebkitOverflowScrolling: 'touch',
        }}
        >
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => toggleTag(chip.id)}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                borderRadius: 20,
                border: activeTags.includes(chip.id) ? `2px solid ${AR_THEME.accent}` : '1px solid rgba(255,255,255,0.15)',
                background: activeTags.includes(chip.id) ? 'rgba(79,195,247,0.18)' : 'rgba(255,255,255,0.04)',
                color: AR_THEME.text,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 100px' }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: AR_THEME.muted, marginTop: 48 }}>該当する記録がありません</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
          }}
          >
            {filtered.map((item) => (
              <FieldGuideCard
                key={item.id}
                item={item}
                onOpen={() => setCardPin(item)}
                onEdit={item.isMine ? () => onEdit?.(item) : undefined}
                onDelete={item.isMine ? () => onDelete(item.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        padding: `10px 16px ${AR_THEME.safeBottom}`,
        background: 'rgba(10,22,40,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
      >
        <button type="button" onClick={onExport} style={{
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
          JSON書き出し
        </button>
      </div>

      {cardPin && (
        <ArPinCard
          annotation={cardPin}
          authorId={authorId}
          onClose={() => setCardPin(null)}
          onEdit={cardPin.isMine ? () => { setCardPin(null); onEdit?.(cardPin); } : undefined}
        />
      )}
    </div>
  );
}

function FieldGuideCard({ item, onOpen, onEdit, onDelete }) {
  const needLabel = NEED_CATEGORY_OPTIONS.find((o) => o.needType === item.needType)?.label;
  const tags = getAnnotationTags(item).slice(0, 3);

  return (
    <article
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${item.kind === 'positive' ? 'rgba(102,187,106,0.35)' : 'rgba(239,83,80,0.35)'}`,
        cursor: 'pointer',
      }}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      role="button"
      tabIndex={0}
    >
      <div style={{
        height: 100,
        background: item.photo
          ? `url(${item.photo}) center/cover`
          : 'linear-gradient(135deg, #1a3a5c, #0d1b2a)',
      }}
      />
      <div style={{ padding: 10 }}>
        <div style={{ fontSize: 10, color: AR_THEME.muted, marginBottom: 4 }}>
          {item.kind === 'positive' ? '良い場所' : needLabel ?? 'バリア'}
        </div>
        <p style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
        >
          {item.comment || '—'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {tags.map((t) => (
            <span key={t.id} style={{
              fontSize: 9,
              padding: '2px 6px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.08)',
              color: AR_THEME.muted,
            }}
            >
              {t.label}
            </span>
          ))}
        </div>
        {item.isMine && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <button type="button" onClick={onEdit} style={iconBtnStyle} aria-label="編集"><Pencil size={14} /></button>
            <button type="button" onClick={onDelete} style={iconBtnStyle} aria-label="削除"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
    </article>
  );
}

const backBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  background: 'rgba(255,255,255,0.08)',
  border: 'none',
  borderRadius: 12,
  padding: '8px 12px',
  color: AR_THEME.text,
  cursor: 'pointer',
  fontSize: 14,
};

const iconBtnStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: 'none',
  borderRadius: 8,
  padding: 6,
  color: AR_THEME.muted,
  cursor: 'pointer',
};
