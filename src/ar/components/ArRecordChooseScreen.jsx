import React, { useMemo } from 'react';
import { Calendar, Camera, ChevronLeft, ChevronRight, Megaphone, PenLine } from 'lucide-react';
import { AR_HOME } from '../constants/arTheme';
import { PPS_GROUP_META } from '../constants/promptSpecs';
import {
  getActiveSpecialPrompts,
  getPpsGroupLabel,
  getStandingPrompt,
} from '../utils/promptRotation';

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function ArRecordChooseScreen({ onChoose, onBack }) {
  const now = useMemo(() => new Date(), []);
  const standingPrompt = useMemo(() => getStandingPrompt(now), [now]);
  const specialPrompts = useMemo(() => getActiveSpecialPrompts(now), [now]);
  const monthLabel = MONTH_LABELS[now.getMonth()];
  const ppsMeta = standingPrompt.ppsGroup ? PPS_GROUP_META[standingPrompt.ppsGroup] : null;

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <header style={styles.header}>
          <button type="button" onClick={onBack} style={styles.backBtn}>
            <ChevronLeft size={20} />
            ホーム
          </button>
          <h1 style={styles.title}>記録のテーマを選ぶ</h1>
          <p style={styles.lead}>今月のお題で、または自由に投稿できます</p>
          <div style={styles.howto}>
            <div>① 気になるところを中心に合わせて撮影</div>
            <div>② 簡単な質問に答えて完了</div>
            <div style={styles.howtoNote}>※場所は現在地（GPS）、または地図から指定できます</div>
          </div>
        </header>

        <button
          type="button"
          onClick={() => onChoose({ kind: 'standing', prompt: standingPrompt })}
          style={styles.standingCard}
        >
          <div style={styles.cardHead}>
            <Calendar size={18} color={AR_HOME.standing} />
            <span style={styles.cardEyebrow}>今月のお題で記録する</span>
            <span style={styles.monthChip}>{monthLabel}</span>
          </div>
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
          <div style={styles.promptTitle}>{standingPrompt.title}</div>
          <p style={styles.promptQuestion}>{standingPrompt.question}</p>
          <div style={styles.ctaRow}>
            <Camera size={18} />
            このお題で記録する
            <ChevronRight size={18} />
          </div>
        </button>

        {specialPrompts.map((prompt) => {
          const spPps = prompt.ppsGroup ? PPS_GROUP_META[prompt.ppsGroup] : null;
          return (
            <button
              key={prompt.id}
              type="button"
              onClick={() => onChoose({ kind: 'special', prompt })}
              style={styles.specialCard}
            >
              <div style={styles.cardHead}>
                <Megaphone size={18} color={AR_HOME.special} />
                <span style={{ ...styles.cardEyebrow, color: AR_HOME.special }}>特設のお題で記録する</span>
              </div>
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
              <div style={styles.promptTitleSm}>{prompt.title}</div>
              <p style={styles.promptQuestion}>{prompt.question}</p>
              <div style={{ ...styles.ctaRow, color: AR_HOME.special }}>
                <Camera size={18} />
                このお題で記録する
                <ChevronRight size={18} />
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onChoose({ kind: 'free', prompt: null })}
          style={styles.freeCard}
        >
          <div style={styles.cardHead}>
            <PenLine size={18} color={AR_HOME.primary} />
            <span style={styles.cardEyebrow}>自由に記録する</span>
          </div>
          <p style={styles.promptQuestion}>
            お題に関係なく、今感じたことをそのまま残せます。
          </p>
          <div style={styles.ctaRow}>
            <Camera size={18} />
            自由に記録する
            <ChevronRight size={18} />
          </div>
        </button>
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
    padding: '16px 18px 40px',
    paddingBottom: AR_HOME.safeBottom,
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    border: 'none',
    background: 'none',
    color: AR_HOME.primary,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    padding: '4px 0 12px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: 24,
    fontWeight: 800,
    color: AR_HOME.text,
  },
  lead: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.5,
    color: AR_HOME.textSecondary,
    fontWeight: 600,
  },
  howto: {
    margin: '12px 0 0',
    padding: '12px 14px',
    borderRadius: 12,
    background: AR_HOME.primarySoft,
    color: AR_HOME.text,
    fontSize: 14,
    lineHeight: 1.55,
    fontWeight: 600,
  },
  howtoNote: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 600,
    color: AR_HOME.textSecondary,
  },
  standingCard: {
    width: '100%',
    textAlign: 'left',
    background: AR_HOME.surface,
    border: `1px solid ${AR_HOME.border}`,
    borderRadius: AR_HOME.radiusLg,
    padding: '18px 16px 16px',
    boxShadow: AR_HOME.shadowLg,
    borderTop: `4px solid ${AR_HOME.standing}`,
    cursor: 'pointer',
    marginBottom: 12,
  },
  specialCard: {
    width: '100%',
    textAlign: 'left',
    background: AR_HOME.surface,
    border: `1px solid #ddd6fe`,
    borderRadius: AR_HOME.radius,
    padding: '16px',
    boxShadow: AR_HOME.shadow,
    borderLeft: `4px solid ${AR_HOME.special}`,
    cursor: 'pointer',
    marginBottom: 12,
  },
  freeCard: {
    width: '100%',
    textAlign: 'left',
    background: AR_HOME.surface,
    border: `2px solid ${AR_HOME.primary}`,
    borderRadius: AR_HOME.radius,
    padding: '16px',
    cursor: 'pointer',
  },
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardEyebrow: {
    flex: 1,
    fontSize: 13,
    fontWeight: 700,
    color: AR_HOME.standing,
  },
  monthChip: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 999,
    background: AR_HOME.standingSoft,
    color: AR_HOME.standing,
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
    margin: '0 0 6px',
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1.35,
    color: AR_HOME.text,
  },
  promptTitleSm: {
    margin: '0 0 6px',
    fontSize: 16,
    fontWeight: 800,
    lineHeight: 1.35,
    color: AR_HOME.text,
  },
  promptQuestion: {
    margin: '0 0 12px',
    fontSize: 14,
    lineHeight: 1.5,
    color: AR_HOME.textSecondary,
  },
  ctaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '12px 14px',
    borderRadius: 12,
    background: AR_HOME.primarySoft,
    color: AR_HOME.primary,
    fontSize: 15,
    fontWeight: 800,
  },
};
