/** GPS 精度（m）から UI 用レベルを返す */
export function getGpsAccuracyLevel(accuracyM) {
  if (accuracyM == null || !Number.isFinite(accuracyM)) return 'waiting';
  if (accuracyM <= 12) return 'excellent';
  if (accuracyM <= 20) return 'good';
  if (accuracyM <= 35) return 'fair';
  return 'poor';
}

export function gpsLevelLabel(level) {
  switch (level) {
    case 'excellent': return '良好';
    case 'good': return '使える';
    case 'fair': return 'やや低い';
    case 'poor': return '低い';
    default: return '取得中';
  }
}

export function canPlacePinWithGps(level, { allowOverride = false } = {}) {
  if (level === 'excellent' || level === 'good') return true;
  if (allowOverride && (level === 'fair' || level === 'poor')) return true;
  return false;
}
