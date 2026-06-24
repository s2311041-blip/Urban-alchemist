import React from 'react';
import { AR_THEME } from '../constants/arTheme';
import { getGpsAccuracyLevel, gpsLevelLabel } from '../utils/gpsAccuracy';

const LEVEL_COLOR = {
  waiting: AR_THEME.muted,
  poor: '#ff7043',
  fair: '#ffb74d',
  good: AR_THEME.accent,
  excellent: '#81c784',
};

/**
 * 投稿前に GPS が安定するまで待つ UI。
 * 「精度待ち」= 屋外で数秒、端末の位置誤差（±m）が小さくなるのを待ってから刺す。
 */
export function ArGpsAccuracyPanel({
  geo,
  allowOverride = false,
  onRequestOverride,
}) {
  const accuracyM = geo?.accuracy != null ? Math.round(geo.accuracy) : null;
  const level = getGpsAccuracyLevel(geo?.accuracy);
  const color = LEVEL_COLOR[level] ?? AR_THEME.muted;
  const progress = accuracyM == null
    ? 0.15
    : Math.max(0.1, Math.min(1, 1 - accuracyM / 40));

  let hint = '位置情報を取得しています…';
  if (level === 'excellent') hint = '精度良好。この位置で刺せます。';
  else if (level === 'good') hint = 'この精度で刺せます。';
  else if (level === 'fair') hint = '屋外で5〜10秒待つと精度が上がります。';
  else if (level === 'poor') hint = '精度が低いです。地図指定がおすすめです。';
  if (allowOverride && (level === 'fair' || level === 'poor')) {
    hint += ' 下の「低精度のまま続行」も使えます。';
  }

  return (
    <div style={{
      marginBottom: 12,
      padding: '12px 14px',
      borderRadius: 14,
      background: 'rgba(0,0,0,0.45)',
      border: `1px solid ${color}55`,
    }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        fontSize: 13,
      }}
      >
        <span>GPS精度</span>
        <strong style={{ color }}>
          {accuracyM != null ? `±${accuracyM}m · ${gpsLevelLabel(level)}` : gpsLevelLabel(level)}
        </strong>
      </div>

      <div style={{
        height: 6,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
        marginBottom: 8,
      }}
      >
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: color,
          transition: 'width 0.4s ease',
        }}
        />
      </div>

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: AR_THEME.muted }}>
        {hint}
      </p>

      {allowOverride && onRequestOverride && (level === 'fair' || level === 'poor') && (
        <button
          type="button"
          onClick={onRequestOverride}
          style={{
            marginTop: 10,
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: AR_THEME.accent,
            fontSize: 12,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          低精度のまま続行
        </button>
      )}
    </div>
  );
}
