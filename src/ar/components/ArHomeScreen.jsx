import React, { useMemo } from 'react';
import {
  Calendar,
  Camera,
  ChevronRight,
  HelpCircle,
  Megaphone,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { AR_HOME } from '../constants/arTheme';
import { PPS_GROUP_META } from '../constants/promptSpecs';
import {
  getActiveSpecialPrompts,
  getPpsGroupLabel,
  getStandingPrompt,
} from '../utils/promptRotation';

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function ArHomeScreen({
  onRecord,
  onView,
  onHelp,
}) {
  const now = useMemo(() => new Date(), []);
  const standingPrompt = useMemo(() => getStandingPrompt(now), [now]);
  const specialPrompts = useMemo(() => getActiveSpecialPrompts(now), [now]);
  const featuredPrompt = specialPrompts[0] ?? standingPrompt;
  const isSpecialFeatured = specialPrompts.length > 0;
  const monthLabel = MONTH_LABELS[now.getMonth()];
  const ppsMeta = featuredPrompt.ppsGroup ? PPS_GROUP_META[featuredPrompt.ppsGroup] : null;

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <header style={styles.header}>
          <div>
            <div style={styles.badge}>
              <Sparkles size={14} color={AR_HOME.primary} />
              現地AR · 街の記録
            </div>
            <h1 style={styles.title}>AR街記録</h1>
            <p style={styles.lead}>
              街の気づきを記録し、みんなの声を見る
            </p>
          </div>
          <button type="button" onClick={onHelp} aria-label="使い方" style={styles.helpBtn}>
            <HelpCircle size={22} color={AR_HOME.textSecondary} />
          </button>
        </header>

        <section style={styles.section} aria-labelledby="standing-heading">
          <div style={styles.sectionHead}>
            {isSpecialFeatured
              ? <Megaphone size={18} color={AR_HOME.special} />
              : <Calendar size={18} color={AR_HOME.standing} />}
            <h2 id="standing-heading" style={styles.sectionTitle}>
              {isSpecialFeatured ? '今日のお題（特設）' : '今月のお題'}
            </h2>
            {!isSpecialFeatured && <span style={styles.monthChip}>{monthLabel}</span>}
          </div>

          <article style={{
            ...styles.standingCard,
            ...(isSpecialFeatured ? styles.specialCard : {}),
          }}
          >
            {ppsMeta && (
              <span style={{
                ...styles.ppsBadge,
                background: `${ppsMeta.color}18`,
                color: ppsMeta.color,
                borderColor: `${ppsMeta.color}40`,
              }}
              >
                {ppsMeta.emoji}
                {' '}
                {getPpsGroupLabel(featuredPrompt.ppsGroup)}
              </span>
            )}
            <h3 style={styles.promptTitle}>{featuredPrompt.title}</h3>
            <p style={styles.promptQuestion}>{featuredPrompt.question}</p>
            {featuredPrompt.subtitle && (
              <p style={styles.promptSub}>{featuredPrompt.subtitle}</p>
            )}
            {featuredPrompt.exampleHints?.length > 0 && (
              <div style={styles.hintRow}>
                {featuredPrompt.exampleHints.map((h) => (
                  <span key={h} style={styles.hintChip}>{h}</span>
                ))}
              </div>
            )}
          </article>
        </section>

        <div style={styles.actions}>
          <button type="button" onClick={onRecord} style={styles.recordBtn}>
            <Camera size={22} />
            記録する
            <ChevronRight size={20} />
          </button>
          <p style={styles.recordHint}>撮影 → 印 → 質問</p>

          <button type="button" onClick={onView} style={styles.viewBtn}>
            <Smartphone size={22} />
            スマホをかざして近くの投稿を見る
            <ChevronRight size={20} />
          </button>
          <p style={styles.viewHint}>地図や一覧でも見られます</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100dvh',
    height: '100dvh',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    background: AR_HOME.bg,
    color: AR_HOME.text,
  },
  inner: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '20px 18px 40px',
    paddingBottom: AR_HOME.safeBottom,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: AR_HOME.primary,
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: AR_HOME.text,
    lineHeight: 1.15,
  },
  lead: {
    margin: '8px 0 0',
    fontSize: 15,
    lineHeight: 1.5,
    color: AR_HOME.textSecondary,
    fontWeight: 600,
  },
  helpBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: `1px solid ${AR_HOME.border}`,
    background: AR_HOME.surface,
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    boxShadow: AR_HOME.shadow,
    flexShrink: 0,
  },
  section: {
    marginBottom: 28,
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: AR_HOME.text,
    flex: 1,
  },
  monthChip: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 999,
    background: AR_HOME.standingSoft,
    color: AR_HOME.standing,
  },
  standingCard: {
    background: AR_HOME.surface,
    border: `1px solid ${AR_HOME.border}`,
    borderRadius: AR_HOME.radiusLg,
    padding: '18px 18px 16px',
    boxShadow: AR_HOME.shadowLg,
    borderTop: `4px solid ${AR_HOME.standing}`,
  },
  specialCard: {
    borderTop: `4px solid ${AR_HOME.special}`,
  },
  ppsBadge: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 10px',
    borderRadius: 999,
    border: '1px solid',
    marginBottom: 10,
  },
  promptTitle: {
    margin: '0 0 8px',
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.3,
    color: AR_HOME.text,
  },
  promptQuestion: {
    margin: '0 0 8px',
    fontSize: 15,
    lineHeight: 1.55,
    color: AR_HOME.textSecondary,
  },
  promptSub: {
    margin: '0 0 10px',
    fontSize: 14,
    color: AR_HOME.textSecondary,
    lineHeight: 1.45,
  },
  hintRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  hintChip: {
    fontSize: 12,
    padding: '5px 10px',
    borderRadius: 999,
    background: AR_HOME.surfaceMuted,
    color: AR_HOME.textSecondary,
    border: `1px solid ${AR_HOME.border}`,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  recordBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '18px 20px',
    borderRadius: 16,
    border: 'none',
    background: AR_HOME.primary,
    color: '#fff',
    fontSize: 18,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
  },
  recordHint: {
    margin: '8px 0 16px',
    fontSize: 14,
    fontWeight: 600,
    color: AR_HOME.textSecondary,
    textAlign: 'center',
  },
  viewBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '16px 16px',
    borderRadius: 16,
    border: `2px solid ${AR_HOME.primary}`,
    background: AR_HOME.surface,
    color: AR_HOME.primary,
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    textAlign: 'center',
    lineHeight: 1.35,
  },
  viewHint: {
    margin: '8px 0 0',
    fontSize: 14,
    fontWeight: 600,
    color: AR_HOME.textSecondary,
    textAlign: 'center',
  },
};
