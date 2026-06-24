/** GeolocationPositionError.code に対応する日本語メッセージ */
export function geolocationErrorMessage(error) {
  const code = error?.code;
  switch (code) {
    case 1:
      return {
        short: '位置情報が拒否されています',
        detail: '設定 → Safari → 位置情報 で「許可」または「アプリの使用中」を選んでください。別ブラウザ用に許可している場合は、Safari 側も確認が必要です。',
        code: 'PERMISSION_DENIED',
      };
    case 2:
      return {
        short: 'GPS信号が届いていません',
        detail: '屋内・地下では GPS が弱くなることがあります。窓際または屋外で再試行してください。Wi‑Fi 位置情報は精度が低い場合があります。',
        code: 'POSITION_UNAVAILABLE',
      };
    case 3:
      return {
        short: '位置情報の取得がタイムアウトしました',
        detail: '初回の GPS 取得に時間がかかっています。少し待つか、屋外でページを再読み込みしてください。',
        code: 'TIMEOUT',
      };
    default:
      return {
        short: '位置情報を取得できません',
        detail: 'HTTPS（https://）で Safari から開いているか確認してください。',
        code: 'UNKNOWN',
      };
  }
}

export const GEO_WATCH_LOW = {
  enableHighAccuracy: false,
  timeout: 30000,
  maximumAge: 15000,
};

export const GEO_WATCH_HIGH = {
  enableHighAccuracy: true,
  timeout: 45000,
  maximumAge: 2000,
};
