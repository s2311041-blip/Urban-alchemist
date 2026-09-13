import React from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  Map,
  Smartphone,
} from 'lucide-react';
import { AR_HOME } from '../constants/arTheme';

export function ArViewHubScreen({
  pinCount = 0,
  availablePoints = 0,
  onBrowse,
  onMap,
  onGuide,
  onBack,
}) {
  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <button type="button" onClick={onBack} style={styles.backBtn}>
          <ChevronLeft size={20} />
          ホーム
        </button>
        <h1 style={styles.title}>みんなの声を見る</h1>
        <p style={styles.lead}>街に残された、みんなの写真や声を見ることができます</p>

        <div style={styles.statsRow}>
          <div style={styles.statPill}>
            <span style={styles.statLabel}>あなたの記録</span>
            <span style={styles.statValue}>
              {pinCount}
              件
            </span>
          </div>
          <div style={styles.statPill}>
            <span style={styles.statLabel}>
              <Heart size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              共感ポイント
            </span>
            <span style={{ ...styles.statValue, color: AR_HOME.primary }}>
              {availablePoints}
              pt
            </span>
            <span style={styles.statSub}>他人の投稿に1ptで共感</span>
          </div>
        </div>

        <button type="button" onClick={onBrowse} style={styles.primaryCard}>
          <div style={styles.primaryIcon}>
            <Smartphone size={26} color={AR_HOME.primary} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={styles.primaryTitle}>カメラをかざして探す</div>
            <div style={styles.primaryDesc}>周りの景色にスマートフォンを向けて、近くのピンを探します</div>
          </div>
          <ChevronRight size={20} color={AR_HOME.primary} />
        </button>

        <button type="button" onClick={onMap} style={styles.secondaryCard}>
          <div style={styles.secondaryIcon}>
            <Map size={22} color={AR_HOME.primary} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={styles.secondaryTitle}>地図から探す</div>
            <div style={styles.secondaryDesc}>マップ上で場所を確認しながら、投稿を見ることができます</div>
          </div>
          <ChevronRight size={18} color={AR_HOME.textSecondary} />
        </button>

        <button type="button" onClick={onGuide} style={styles.secondaryCard}>
          <div style={styles.secondaryIcon}>
            <BookOpen size={22} color={AR_HOME.primary} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={styles.secondaryTitle}>一覧リストで見る</div>
            <div style={styles.secondaryDesc}>投稿されたすべての写真と声をリストで確認します</div>
          </div>
          <ChevronRight size={18} color={AR_HOME.textSecondary} />
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
    margin: '0 0 18px',
    fontSize: 15,
    lineHeight: 1.5,
    color: AR_HOME.textSecondary,
    fontWeight: 600,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
    marginBottom: 18,
  },
  statPill: {
    background: AR_HOME.surface,
    border: `1px solid ${AR_HOME.border}`,
    borderRadius: 12,
    padding: '12px 10px',
    boxShadow: AR_HOME.shadow,
  },
  statLabel: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: AR_HOME.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    display: 'block',
    fontSize: 18,
    fontWeight: 800,
    color: AR_HOME.text,
  },
  statSub: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: AR_HOME.textSecondary,
    marginTop: 4,
    lineHeight: 1.35,
  },
  primaryCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 14px',
    borderRadius: 16,
    border: `2px solid ${AR_HOME.primary}`,
    background: AR_HOME.primarySoft,
    cursor: 'pointer',
    marginBottom: 12,
    textAlign: 'left',
  },
  primaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: '#fff',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  primaryTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: AR_HOME.text,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  primaryDesc: {
    fontSize: 13,
    fontWeight: 600,
    color: AR_HOME.textSecondary,
    lineHeight: 1.4,
  },
  secondaryCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px',
    borderRadius: 14,
    border: `1px solid ${AR_HOME.border}`,
    background: AR_HOME.surface,
    cursor: 'pointer',
    marginBottom: 10,
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
  secondaryTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: AR_HOME.text,
  },
  secondaryDesc: {
    fontSize: 13,
    fontWeight: 600,
    color: AR_HOME.textSecondary,
    marginTop: 2,
    lineHeight: 1.4,
  },
};
