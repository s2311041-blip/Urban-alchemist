/** カメラ・コンパスに必要な「安全な接続」かどうか */
export function isSecureContext() {
  if (typeof window === 'undefined') return true;
  return window.isSecureContext === true;
}

/** スマホから HTTP (192.168.x.x) で開いている場合の案内 */
export function getInsecureContextHint() {
  if (typeof window === 'undefined' || isSecureContext()) return null;

  const { protocol, hostname, port } = window.location;
  const isLanIp = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  if (protocol === 'http:' && isLanIp) {
    const p = port || '5173';
    return {
      title: 'HTTPS で開く必要があります',
      body: `いま http://${hostname} で開いているため、カメラとコンパスがブロックされています。Mac で npm run dev:mobile を起動し、スマホの Safari で https://${hostname}:${p}/ar.html を開いてください（初回は証明書警告→詳細→アクセス）。`,
    };
  }

  if (protocol === 'http:') {
    return {
      title: 'HTTPS で開く必要があります',
      body: 'カメラとコンパスは HTTPS 接続でのみ使えます。開発中は npm run dev:mobile を使い、https:// で開いてください。',
    };
  }

  return {
    title: '安全な接続ではありません',
    body: 'カメラとコンパスを使うには HTTPS または localhost で開いてください。',
  };
}

/** Google アプリ等の内蔵ブラウザっぽい UA */
export function isLikelyInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /GSA\//i.test(ua)
    || /Line\//i.test(ua)
    || /FBAN|FBAV/i.test(ua)
    || /Instagram/i.test(ua)
    || /Twitter/i.test(ua);
}

export function getBrowserHint() {
  if (!isLikelyInAppBrowser()) return null;
  return {
    title: 'Safari（または Chrome）で開いてください',
    body: '検索アプリ・SNSアプリ内ブラウザではカメラ・コンパスが動かないことがあります。URLをコピーし、Safari（iPhone）または Chrome（Android）に貼り付けて開いてください。',
  };
}
