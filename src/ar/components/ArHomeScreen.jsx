import React from 'react';
import { Map, BookOpen, Plus, HelpCircle, Sparkles, ChevronRight } from 'lucide-react';
import { AR_THEME } from '../constants/arTheme';
import { getApiModeLabel } from '../api/annotationsClient';

const ACTIONS = [
  {
    id: 'post',
    title: '新しく記録する',
    subtitle: 'カメラで刺して、街の声を残す',
    icon: Plus,
    gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
    glow: 'rgba(255,107,107,0.35)',
  },
  {
    id: 'map',
    title: '地図で見る',
    subtitle: 'ピン・視点置換・現地カメラ',
    icon: Map,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    glow: 'rgba(79,172,254,0.35)',
  },
  {
    id: 'guide',
    title: '記録図鑑',
    subtitle: 'タグ検索・一覧・編集',
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    glow: 'rgba(161,140,209,0.35)',
  },
];

export function ArHomeScreen({
  totalPoints,
  pinCount,
  allPinCount = pinCount,
  syncStatus = 'idle',
  lastSyncAt,
  onSync,
  recentItems = [],
  onNavigate,
  onHelp,
}) {
  const syncLabel = getApiModeLabel();
  const syncHint = syncStatus === 'error'
    ? '同期失敗'
    : syncStatus === 'syncing'
      ? '同期中…'
      : syncLabel;

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#060d18',
      color: AR_THEME.text,
      position: 'relative',
      overflow: 'hidden',
    }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 10%, rgba(79,195,247,0.12) 0%, transparent 40%),
          radial-gradient(circle at 85% 25%, rgba(255,183,77,0.1) 0%, transparent 35%),
          radial-gradient(circle at 50% 90%, rgba(161,140,209,0.08) 0%, transparent 45%),
          linear-gradient(180deg, #0a1628 0%, #060d18 55%, #040810 100%)
        `,
        pointerEvents: 'none',
      }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 24px)',
        pointerEvents: 'none',
      }}
      />

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '24px 20px 32px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        boxSizing: 'border-box',
        maxWidth: 520,
        margin: '0 auto',
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 20,
              background: 'rgba(79,195,247,0.12)',
              border: '1px solid rgba(79,195,247,0.35)',
              fontSize: 12,
              color: AR_THEME.accent,
              marginBottom: 10,
            }}
            >
              <Sparkles size={14} />
              東京都江東区
            </div>
            <h1 style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #fff 30%, #90caf9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            >
              AR街記録
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: AR_THEME.muted, lineHeight: 1.55 }}>
              現地の視点を地図に残し、みんなで読み解く
            </p>
          </div>
          <button type="button" onClick={onHelp} aria-label="使い方" style={helpBtnStyle}>
            <HelpCircle size={22} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 20,
        }}
        >
          <StatCard label="自分の記録" value={pinCount} unit="件" accent />
          <StatCard label="ポイント" value={totalPoints} unit="pt" accent />
          <button
            type="button"
            onClick={onSync}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '12px 10px',
              cursor: 'pointer',
              color: AR_THEME.text,
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 10, color: AR_THEME.muted, marginBottom: 3 }}>同期 · タップで更新</div>
            <div style={{ fontSize: 15, fontWeight: 'bold', color: syncStatus === 'error' ? '#ff7043' : AR_THEME.accent }}>
              {syncHint}
            </div>
            {allPinCount > pinCount && (
              <div style={{ fontSize: 10, color: AR_THEME.muted, marginTop: 4 }}>
                全体 {allPinCount} 件
              </div>
            )}
          </button>
        </div>

        {recentItems.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
            >
              <div style={{ fontSize: 13, fontWeight: 'bold', color: AR_THEME.text }}>最近の記録</div>
              <button
                type="button"
                onClick={() => onNavigate('guide')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: AR_THEME.accent,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                図鑑へ
                <ChevronRight size={14} />
              </button>
            </div>
            <div style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 4,
              WebkitOverflowScrolling: 'touch',
            }}
            >
              {recentItems.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate('guide')}
                  style={{
                    flex: '0 0 120px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.04)',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    height: 72,
                    background: item.photo
                      ? `url(${item.photo}) center/cover`
                      : `linear-gradient(135deg, ${item.kind === 'positive' ? '#2e7d32' : '#c62828'}55, #0a1628)`,
                  }}
                  />
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{
                      fontSize: 11,
                      color: AR_THEME.muted,
                      marginBottom: 2,
                    }}
                    >
                      {item.kind === 'positive' ? '良い場所' : '困りごと'}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: AR_THEME.text,
                      lineHeight: 1.35,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                    >
                      {item.comment || '…'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 18px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  overflow: 'hidden',
                  boxShadow: `0 6px 28px ${action.glow}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: action.gradient,
                  opacity: 0.18,
                }}
                />
                <div style={{
                  position: 'relative',
                  width: 52,
                  height: 52,
                  borderRadius: 15,
                  background: action.gradient,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}
                >
                  <Icon size={26} color="#fff" strokeWidth={2.2} />
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 3 }}>{action.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.82, lineHeight: 1.4 }}>{action.subtitle}</div>
                </div>
                <ChevronRight size={20} style={{ position: 'relative', opacity: 0.5 }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, small, accent }) {
  return (
    <div style={{
      padding: '12px 10px',
      borderRadius: 14,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.09)',
      textAlign: 'center',
    }}
    >
      <div style={{ fontSize: 10, color: AR_THEME.muted, marginBottom: 3 }}>{label}</div>
      <div style={{
        fontSize: small ? 13 : 20,
        fontWeight: 'bold',
        color: accent ? AR_THEME.accent : AR_THEME.text,
      }}
      >
        {value}
        {unit && <span style={{ fontSize: 10, fontWeight: 'normal', marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

const helpBtnStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 14,
  width: 48,
  height: 48,
  color: AR_THEME.text,
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
};
