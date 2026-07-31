import React, { useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  ChevronRight,
  HelpCircle,
  Map,
  Megaphone,
  PenLine,
  Sparkles,
} from 'lucide-react';
import { AR_HOME } from '../constants/arTheme';
import { PPS_GROUP_META } from '../constants/promptSpecs';
import { getApiModeLabel } from '../api/annotationsClient';
import {
  countPostsForPrompt,
  getActiveSpecialPrompts,
  getDaysLeftInMonth,
  getPpsGroupLabel,
  getStandingPrompt,
} from '../utils/promptRotation';

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function ArHomeScreen({
  totalPoints,
  pinCount,
  allPinCount = pinCount,
  syncStatus = 'idle',
  annotations = [],
  onSync,
  recentItems = [],
  onStartPost,
  onNavigate,
  onHelp,
}) {
  const now = useMemo(() => new Date(), []);
  const standingPrompt = useMemo(() => getStandingPrompt(now), [now]);
  const specialPrompts = useMemo(() => getActiveSpecialPrompts(now), [now]);
  const daysLeft = useMemo(() => getDaysLeftInMonth(now), [now]);
  const standingCount = useMemo(
    () => countPostsForPrompt(annotations, standingPrompt.id),
    [annotations, standingPrompt.id],
  );

  const syncLabel = getApiModeLabel();
  const syncHint = syncStatus === 'error'
    ? '同期失敗'
    : syncStatus === 'syncing'
      ? '同期中…'
      : syncLabel;

  const monthLabel = MONTH_LABELS[now.getMonth()];
  const ppsMeta = standingPrompt.ppsGroup ? PPS_GROUP_META[standingPrompt.ppsGroup] : null;

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
              お題に沿っても、自由に気づきを残してもOK
            </p>
          </div>
          <button type="button" onClick={onHelp} aria-label="使い方" style={styles.helpBtn}>
            <HelpCircle size={22} color={AR_HOME.textSecondary} />
          </button>
        </header>

        <div style={styles.statsRow}>
          <StatPill label="自分の記録" value={`${pinCount}件`} />
          <StatPill label="ポイント" value={`${totalPoints}pt`} accent />
          <button type="button" onClick={onSync} style={styles.syncPill}>
            <span style={styles.statLabel}>同期</span>
            <span style={{
              ...styles.statValue,
              color: syncStatus === 'error' ? '#dc2626' : AR_HOME.text,
            }}
            >
              {syncHint}
            </span>
            {allPinCount > pinCount && (
              <span style={styles.statSub}>全体 {allPinCount}件</span>
            )}
          </button>
        </div>

        <section style={styles.section} aria-labelledby="standing-heading">
          <div style={styles.sectionHead}>
            <Calendar size={18} color={AR_HOME.standing} />
            <h2 id="standing-heading" style={styles.sectionTitle}>今月のお題（常設）</h2>
            <span style={styles.monthChip}>{monthLabel}</span>
          </div>

          <article style={styles.standingCard}>
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
                {getPpsGroupLabel(standingPrompt.ppsGroup)}
              </span>
            )}
            <h3 style={styles.promptTitle}>{standingPrompt.title}</h3>
            <p style={styles.promptQuestion}>{standingPrompt.question}</p>
            {standingPrompt.subtitle && (
              <p style={styles.promptSub}>{standingPrompt.subtitle}</p>
            )}
            {standingPrompt.exampleHints?.length > 0 && (
              <div style={styles.hintRow}>
                {standingPrompt.exampleHints.map((h) => (
                  <span key={h} style={styles.hintChip}>{h}</span>
                ))}
              </div>
            )}
            <div style={styles.promptMeta}>
              <span>あと {daysLeft} 日</span>
              <span>·</span>
              <span>今月 {standingCount} 件</span>
            </div>
            <button
              type="button"
              onClick={() => onStartPost({ kind: 'standing', prompt: standingPrompt })}
              style={styles.standingBtn}
            >
              このお題で記録する
              <ChevronRight size={20} />
            </button>
          </article>
        </section>

        {specialPrompts.length > 0 && (
          <section style={styles.section} aria-labelledby="special-heading">
            <div style={styles.sectionHead}>
              <Megaphone size={18} color={AR_HOME.special} />
              <h2 id="special-heading" style={styles.sectionTitle}>特設のお題</h2>
            </div>
            {specialPrompts.map((prompt) => {
              const count = countPostsForPrompt(annotations, prompt.id);
              const spPps = prompt.ppsGroup ? PPS_GROUP_META[prompt.ppsGroup] : null;
              return (
                <article key={prompt.id} style={styles.specialCard}>
                  {spPps && (
                    <span style={{
                      ...styles.ppsBadge,
                      background: AR_HOME.specialSoft,
                      color: AR_HOME.special,
                      borderColor: '#c4b5fd',
                    }}
                    >
                      {spPps.emoji}
                      {' '}
                      {getPpsGroupLabel(prompt.ppsGroup)}
                    </span>
                  )}
                  <h3 style={styles.promptTitleSm}>{prompt.title}</h3>
                  <p style={styles.promptQuestionSm}>{prompt.question}</p>
                  <div style={styles.promptMeta}>
                    <span>{count} 件の記録</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartPost({ kind: 'special', prompt })}
                    style={styles.specialBtn}
                  >
                    このテーマで記録する
                    <ChevronRight size={18} />
                  </button>
                </article>
              );
            })}
          </section>
        )}

        <section style={styles.section} aria-labelledby="free-heading">
          <div style={styles.sectionHead}>
            <PenLine size={18} color={AR_HOME.free} />
            <h2 id="free-heading" style={styles.sectionTitle}>自由投稿</h2>
          </div>
          <p style={styles.freeDesc}>
            お題に関係なく、今感じたことをそのまま記録できます。
          </p>
          <button
            type="button"
            onClick={() => onStartPost({ kind: 'free', prompt: null })}
            style={styles.freeBtn}
          >
            テーマ指定なしで記録する
            <ChevronRight size={20} />
          </button>
        </section>

        <div style={styles.secondaryRow}>
          <SecondaryAction
            icon={Map}
            label="地図で見る"
            desc="ピンを俯瞰"
            onClick={() => onNavigate('map')}
          />
          <SecondaryAction
            icon={BookOpen}
            label="記録図鑑"
            desc="一覧・検索"
            onClick={() => onNavigate('guide')}
          />
        </div>

        {recentItems.length > 0 && (
          <section style={{ marginTop: 8 }}>
            <div style={styles.recentHead}>
              <span style={styles.sectionTitleSm}>最近の記録</span>
              <button type="button" onClick={() => onNavigate('guide')} style={styles.linkBtn}>
                すべて見る
                <ChevronRight size={14} />
              </button>
            </div>
            <div style={styles.recentScroll}>
              {recentItems.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate('guide')}
                  style={styles.recentCard}
                >
                  <div style={{
                    ...styles.recentThumb,
                    background: item.photo
                      ? `url(${item.photo}) center/cover`
                      : item.kind === 'positive'
                        ? AR_HOME.positiveSoft
                        : '#fee2e2',
                  }}
                  />
                  <div style={styles.recentBody}>
                    <span style={styles.recentKind}>
                      {item.kind === 'positive' ? '良い場所' : '困りごと'}
                    </span>
                    <span style={styles.recentText}>{item.comment || '…'}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value, accent }) {
  return (
    <div style={styles.statPill}>
      <span style={styles.statLabel}>{label}</span>
      <span style={{
        ...styles.statValue,
        color: accent ? AR_HOME.primary : AR_HOME.text,
      }}
      >
        {value}
      </span>
    </div>
  );
}

function SecondaryAction({ icon: Icon, label, desc, onClick }) {
  return (
    <button type="button" onClick={onClick} style={styles.secondaryBtn}>
      <div style={styles.secondaryIcon}>
        <Icon size={22} color={AR_HOME.primary} />
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={styles.secondaryLabel}>{label}</div>
        <div style={styles.secondaryDesc}>{desc}</div>
      </div>
      <ChevronRight size={18} color={AR_HOME.muted} />
    </button>
  );
}

const styles = {
  page: {
    minHeight: '100dvh',
    background: AR_HOME.bg,
    color: AR_HOME.text,
  },
  inner: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '20px 18px 32px',
    paddingBottom: AR_HOME.safeBottom,
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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
    fontSize: 14,
    lineHeight: 1.5,
    color: AR_HOME.textSecondary,
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
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    marginBottom: 24,
  },
  statPill: {
    background: AR_HOME.surface,
    border: `1px solid ${AR_HOME.border}`,
    borderRadius: 12,
    padding: '10px 8px',
    textAlign: 'center',
    boxShadow: AR_HOME.shadow,
  },
  syncPill: {
    background: AR_HOME.surface,
    border: `1px solid ${AR_HOME.border}`,
    borderRadius: 12,
    padding: '10px 8px',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: AR_HOME.shadow,
  },
  statLabel: {
    display: 'block',
    fontSize: 10,
    color: AR_HOME.muted,
    marginBottom: 2,
  },
  statValue: {
    display: 'block',
    fontSize: 14,
    fontWeight: 700,
  },
  statSub: {
    display: 'block',
    fontSize: 10,
    color: AR_HOME.muted,
    marginTop: 2,
  },
  section: {
    marginBottom: 22,
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
  sectionTitleSm: {
    fontSize: 14,
    fontWeight: 700,
    color: AR_HOME.text,
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
    background: AR_HOME.surface,
    border: `1px solid #ddd6fe`,
    borderRadius: AR_HOME.radius,
    padding: '16px 16px 14px',
    boxShadow: AR_HOME.shadow,
    marginBottom: 10,
    borderLeft: `4px solid ${AR_HOME.special}`,
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
  promptTitleSm: {
    margin: '0 0 6px',
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.35,
    color: AR_HOME.text,
  },
  promptQuestion: {
    margin: '0 0 8px',
    fontSize: 15,
    lineHeight: 1.55,
    color: AR_HOME.textSecondary,
  },
  promptQuestionSm: {
    margin: '0 0 8px',
    fontSize: 14,
    lineHeight: 1.5,
    color: AR_HOME.textSecondary,
  },
  promptSub: {
    margin: '0 0 10px',
    fontSize: 13,
    color: AR_HOME.muted,
    lineHeight: 1.45,
  },
  hintRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  hintChip: {
    fontSize: 12,
    padding: '5px 10px',
    borderRadius: 999,
    background: AR_HOME.surfaceMuted,
    color: AR_HOME.textSecondary,
    border: `1px solid ${AR_HOME.border}`,
  },
  promptMeta: {
    display: 'flex',
    gap: 8,
    fontSize: 12,
    color: AR_HOME.muted,
    marginBottom: 14,
  },
  standingBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '15px 20px',
    borderRadius: 14,
    border: 'none',
    background: AR_HOME.standing,
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
  },
  specialBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '13px 18px',
    borderRadius: 12,
    border: 'none',
    background: AR_HOME.special,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  freeDesc: {
    margin: '0 0 12px',
    fontSize: 14,
    lineHeight: 1.5,
    color: AR_HOME.textSecondary,
  },
  freeBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '15px 20px',
    borderRadius: 14,
    border: `2px solid ${AR_HOME.free}`,
    background: AR_HOME.freeSoft,
    color: '#0f766e',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 14px',
    borderRadius: 14,
    border: `1px solid ${AR_HOME.border}`,
    background: AR_HOME.surface,
    cursor: 'pointer',
    boxShadow: AR_HOME.shadow,
    textAlign: 'left',
  },
  secondaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: AR_HOME.primarySoft,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: AR_HOME.text,
  },
  secondaryDesc: {
    fontSize: 12,
    color: AR_HOME.muted,
    marginTop: 2,
  },
  recentHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    border: 'none',
    background: 'none',
    color: AR_HOME.primary,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
  recentScroll: {
    display: 'flex',
    gap: 10,
    overflowX: 'auto',
    paddingBottom: 4,
    WebkitOverflowScrolling: 'touch',
  },
  recentCard: {
    flex: '0 0 128px',
    border: `1px solid ${AR_HOME.border}`,
    borderRadius: 14,
    overflow: 'hidden',
    background: AR_HOME.surface,
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: AR_HOME.shadow,
  },
  recentThumb: {
    height: 72,
  },
  recentBody: {
    padding: '8px 10px',
  },
  recentKind: {
    display: 'block',
    fontSize: 10,
    color: AR_HOME.muted,
    marginBottom: 2,
  },
  recentText: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    fontSize: 12,
    lineHeight: 1.35,
    color: AR_HOME.text,
  },
};
