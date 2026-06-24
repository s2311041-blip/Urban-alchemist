/**
 * 端末をどう動かすかの誘導文（視点置換・現地AR共通）
 *
 * relBearing / relPitch は「目標 − 現在」の差分。
 * iPhone 縦持ちではコンパスと画面の感覚が一致するよう符号を反転して表示する。
 */
export function buildViewAlignmentHint(relBearingDeg, relPitchDeg = null, style = 'short') {
  const turn = -relBearingDeg;
  const tilt = relPitchDeg;

  const parts = [];

  if (Math.abs(turn) > (style === 'perspective' ? 6 : 12)) {
    parts.push(
      style === 'perspective'
        ? (turn > 0 ? '左に向ける' : '右に向ける')
        : (turn > 0 ? '左を向く' : '右を向く'),
    );
  }

  if (tilt != null && Math.abs(tilt) > (style === 'perspective' ? 6 : 8)) {
    parts.push(
      style === 'perspective'
        ? (tilt > 0 ? 'もう少し上を向く' : 'もう少し下を向く')
        : (tilt > 0 ? '上を向く' : '下を向く'),
    );
  }

  if (parts.length === 0) {
    return style === 'perspective' ? null : '上下の向きを変える';
  }

  return style === 'perspective' ? parts.join(' · ') : parts[0];
}

export function turnHintForBearing(relBearingDeg, relPitchDeg = null) {
  return buildViewAlignmentHint(relBearingDeg, relPitchDeg, 'short');
}
