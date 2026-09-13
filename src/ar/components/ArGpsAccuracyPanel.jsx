import React from 'react';
import { AR_THEME } from '../constants/arTheme';
import { canPlacePinWithGps, getGpsAccuracyLevel } from '../utils/gpsAccuracy';

const LEVEL_COLOR = {
  waiting: AR_THEME.muted,
  poor: '#ff7043',
  fair: '#ffb74d',
  good: AR_THEME.accent,
  excellent: AR_THEME.accent,
};

/**
 * 投稿前の位置確認 — 「ピンを置けるか」が分かれば十分
 */
export function ArGpsAccuracyPanel({
  geo,
  allowOverride = false,
  onRequestOverride,
}) {
  const level = getGpsAccuracyLevel(geo?.accuracy);
  const canPlace = canPlacePinWithGps(level, { allowOverride });
  const color = LEVEL_COLOR[level] ?? AR_THEME.muted;

  let status = '位置を取得しています…';
  let hint = '屋外で数秒待つと記録できるようになります。';

  if (level === 'excellent' || level === 'good') {
    status = 'この位置でピンを置けます';
    hint = 'ピンは実際の位置から数十メートルずれることがあります。';
  } else if (level === 'fair') {
    status = allowOverride ? 'この位置でピンを置けます' : 'もう少し待つとピンを置けます';
    hint = '位置はおおよそです。正確に指定するなら地図がおすすめです。';
  } else if (level === 'poor') {
    status = allowOverride ? 'この位置でピンを置けます' : 'まだピンを置けません';
    hint = '位置はおおよそです。地図指定の方が正確です。';
  }

  const showOverride = allowOverride && onRequestOverride && !canPlace && (level === 'fair' || level === 'poor');
  const showLowAccuracyNote = canPlace && (level === 'fair' || level === 'poor');

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
        fontSize: 15,
        fontWeight: 700,
        color: canPlace ? AR_THEME.text : color,
        marginBottom: 6,
      }}
      >
        {status}
      </div>

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: AR_THEME.muted }}>
        {hint}
      </p>

      {showLowAccuracyNote && (
        <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: 1.45, color: '#ffb74d' }}>
          位置情報は目安です。記録後に地図で確認してください。
        </p>
      )}

      {showOverride && (
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
          このまま続行（位置はおおよそ）
        </button>
      )}
    </div>
  );
}
