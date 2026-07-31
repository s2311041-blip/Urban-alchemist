import React, { useMemo, useState } from 'react';
import { ChevronLeft, Download, Heart, Pencil, Search, Trash2 } from 'lucide-react';
import { NEED_CATEGORY_OPTIONS } from '../../constants/barrierData';
import { AR_HOME } from '../constants/arTheme';
import { isFacilitatorMode } from '../constants/facilitatorMode';
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
  availablePoints = totalPoints,
  onLike,
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
    <div style={styles.page}>
      <header style={styles.header}>
        <button type="button" onClick={onClose} style={styles.backBtn}>
          <ChevronLeft size={20} />
          ホーム
        </button>
        <div style={{ flex: 1 }}>
          <div style={styles.headerEyebrow}>記録図鑑</div>
          <div style={styles.headerTitle}>
            {filtered.length}
            {' '}
            件 · 共感に使える
            {availablePoints}
            {' '}
            pt
          </div>
        </div>
      </header>

      <div style={styles.toolbar}>
        <div style={styles.scopeRow}>
          {[
            { id: 'all', label: 'みんな' },
            { id: 'mine', label: '自分' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setScope(id)}
              style={{
                ...styles.scopeBtn,
                ...(scope === id ? styles.scopeBtnActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={styles.searchBox}>
          <Search size={18} color={AR_HOME.muted} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="コメント・場所・タグで検索"
            style={styles.searchInput}
          />
        </div>

        {chips.length > 0 && (
          <div style={styles.chipScroll}>
            {chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => toggleTag(chip.id)}
                style={{
                  ...styles.chip,
                  ...(activeTags.includes(chip.id) ? styles.chipActive : {}),
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{
        ...styles.listArea,
        paddingBottom: isFacilitatorMode() ? '100px' : '24px',
      }}
      >
        {filtered.length === 0 ? (
          <p style={styles.empty}>該当する記録がありません</p>
        ) : (
          <div style={styles.grid}>
            {filtered.map((item) => (
              <FieldGuideCard
                key={item.id}
                item={item}
                onOpen={() => setCardPin(item)}
                onEdit={item.isMine ? () => onEdit?.(item) : undefined}
                onDelete={item.isMine ? () => onDelete(item.id) : undefined}
                onLike={!item.isMine ? () => onLike?.(item.id) : undefined}
                canLike={!item.isMine && !item.likedByMe && availablePoints >= 1}
              />
            ))}
          </div>
        )}
      </div>

      {isFacilitatorMode() && (
        <div style={styles.footer}>
          <button type="button" onClick={onExport} style={styles.exportBtn}>
            <Download size={18} />
            JSON書き出し（ゲーム取り込み用）
          </button>
        </div>
      )}

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

function FieldGuideCard({ item, onOpen, onEdit, onDelete, onLike, canLike = false }) {
  const needLabel = NEED_CATEGORY_OPTIONS.find((o) => o.needType === item.needType)?.label;
  const tags = getAnnotationTags(item).slice(0, 3);
  const isPositive = item.kind === 'positive';

  return (
    <article
      style={{
        ...styles.card,
        borderColor: isPositive ? '#86efac' : '#fecaca',
      }}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      role="button"
      tabIndex={0}
    >
      <div style={{
        ...styles.cardThumb,
        background: item.photo
          ? `url(${item.photo}) center/cover`
          : isPositive ? AR_HOME.positiveSoft : '#fee2e2',
      }}
      />
      <div style={styles.cardBody}>
        <div style={styles.cardKind}>
          {isPositive ? '良い場所' : needLabel ?? '困りごと'}
        </div>
        <p style={styles.cardText}>{item.comment || '—'}</p>
        <div style={styles.tagRow}>
          {tags.map((t) => (
            <span key={t.id} style={styles.tag}>{t.label}</span>
          ))}
        </div>
        {item.isMine ? (
          <div style={styles.actions} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <button type="button" onClick={onEdit} style={styles.iconBtn} aria-label="編集"><Pencil size={14} /></button>
            <button type="button" onClick={onDelete} style={styles.iconBtn} aria-label="削除"><Trash2 size={14} /></button>
          </div>
        ) : (
          <div style={styles.actions} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              disabled={!canLike && !item.likedByMe}
              onClick={onLike}
              style={{
                ...styles.iconBtn,
                color: item.likedByMe ? '#dc2626' : AR_HOME.muted,
                opacity: canLike || item.likedByMe ? 1 : 0.45,
              }}
              aria-label="共感"
            >
              <Heart size={14} fill={item.likedByMe ? '#dc2626' : 'none'} />
            </button>
            <span style={styles.likeHint}>
              {item.likedByMe ? '共感済み' : canLike ? '1 pt で共感' : 'pt 不足'}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

const styles = {
  page: {
    position: 'fixed',
    inset: 0,
    zIndex: 9000,
    background: AR_HOME.bg,
    color: AR_HOME.text,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '14px 16px',
    borderBottom: `1px solid ${AR_HOME.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: AR_HOME.surface,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: AR_HOME.surfaceMuted,
    border: `1px solid ${AR_HOME.border}`,
    borderRadius: 12,
    padding: '8px 12px',
    color: AR_HOME.text,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  headerEyebrow: {
    fontSize: 11,
    color: AR_HOME.primary,
    fontWeight: 600,
  },
  headerTitle: {
    fontWeight: 800,
    fontSize: 17,
    color: AR_HOME.text,
  },
  toolbar: {
    padding: '12px 16px 0',
    background: AR_HOME.surface,
    borderBottom: `1px solid ${AR_HOME.border}`,
  },
  scopeRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 10,
  },
  scopeBtn: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: 12,
    border: `1px solid ${AR_HOME.border}`,
    background: AR_HOME.surfaceMuted,
    color: AR_HOME.textSecondary,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  scopeBtnActive: {
    border: `2px solid ${AR_HOME.primary}`,
    background: AR_HOME.primarySoft,
    color: AR_HOME.primary,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 14,
    background: AR_HOME.surfaceMuted,
    border: `1px solid ${AR_HOME.border}`,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: AR_HOME.text,
    fontSize: 15,
    outline: 'none',
  },
  chipScroll: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    padding: '4px 0 12px',
    WebkitOverflowScrolling: 'touch',
  },
  chip: {
    flexShrink: 0,
    padding: '8px 14px',
    borderRadius: 20,
    border: `1px solid ${AR_HOME.border}`,
    background: AR_HOME.surface,
    color: AR_HOME.textSecondary,
    fontSize: 13,
    cursor: 'pointer',
  },
  chipActive: {
    border: `2px solid ${AR_HOME.primary}`,
    background: AR_HOME.primarySoft,
    color: AR_HOME.primary,
    fontWeight: 600,
  },
  listArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 16px 100px',
    WebkitOverflowScrolling: 'touch',
  },
  empty: {
    textAlign: 'center',
    color: AR_HOME.muted,
    marginTop: 48,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 12,
  },
  footer: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    padding: `10px 16px ${AR_HOME.safeBottom}`,
    background: 'rgba(255,255,255,0.96)',
    borderTop: `1px solid ${AR_HOME.border}`,
    backdropFilter: 'blur(8px)',
  },
  exportBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    border: `1px solid ${AR_HOME.border}`,
    background: AR_HOME.surface,
    color: AR_HOME.textSecondary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontWeight: 700,
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    background: AR_HOME.surface,
    border: '1px solid',
    boxShadow: AR_HOME.shadow,
    cursor: 'pointer',
  },
  cardThumb: {
    height: 100,
  },
  cardBody: {
    padding: 10,
  },
  cardKind: {
    fontSize: 10,
    color: AR_HOME.muted,
    marginBottom: 4,
    fontWeight: 600,
  },
  cardText: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.4,
    color: AR_HOME.text,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  tag: {
    fontSize: 9,
    padding: '2px 6px',
    borderRadius: 6,
    background: AR_HOME.surfaceMuted,
    color: AR_HOME.muted,
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  iconBtn: {
    background: AR_HOME.surfaceMuted,
    border: `1px solid ${AR_HOME.border}`,
    borderRadius: 8,
    padding: 6,
    color: AR_HOME.textSecondary,
    cursor: 'pointer',
  },
  likeHint: {
    fontSize: 10,
    color: AR_HOME.muted,
  },
};
