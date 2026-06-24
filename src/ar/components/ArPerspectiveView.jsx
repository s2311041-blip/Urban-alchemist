import React, { useMemo, useState } from 'react';
import { ChevronLeft, Compass, List } from 'lucide-react';
import { PhotoPinSurface } from '../../components/ui/PhotoPinSurface';
import { AR_THEME } from '../constants/arTheme';
import { relativeBearingDeg } from '../utils/geoMath';
import { buildViewAlignmentHint } from '../utils/viewAlignmentHint';
import {
  getNeedFilterStyle,
  getPerspectiveFrame,
  getPerspectiveNarrative,
} from '../utils/annotationDisplay';

/**
 * 投稿者の視点（写真 + 向きガイド）へ移行する視点置換ビュー
 */
export function ArPerspectiveView({
  annotation,
  viewerHeading = 0,
  viewerPitch = 0,
  compassActive = false,
  onClose,
  onOpenDetails,
}) {
  const [empathyOn, setEmpathyOn] = useState(true);
  const pose = annotation.capturePose ?? {};
  const targetHeading = pose.headingDeg ?? 0;
  const targetPitch = pose.pitchDeg ?? 0;

  const headingDelta = useMemo(
    () => relativeBearingDeg(viewerHeading, targetHeading),
    [viewerHeading, targetHeading],
  );
  const pitchDelta = targetPitch - viewerPitch;
  const aligned = compassActive
    && Math.abs(headingDelta) < 10
    && Math.abs(pitchDelta) < 10;

  const hint = buildViewAlignmentHint(headingDelta, pitchDelta, 'perspective');
  const frame = getPerspectiveFrame(annotation);
  const narrative = getPerspectiveNarrative(annotation);
  const filterStyle = empathyOn ? getNeedFilterStyle(annotation) : {};
  const photoPins = annotation.photoPins?.length
    ? annotation.photoPins
    : [{ id: 'c', nx: 0.5, ny: 0.5 }];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 11000,
      background: '#000',
      color: AR_THEME.text,
      display: 'flex',
      flexDirection: 'column',
    }}
    >
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'linear-gradient(rgba(0,0,0,0.75), transparent)',
      }}
      >
        <button type="button" onClick={onClose} style={headerBtnStyle} aria-label="ARに戻る">
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: AR_THEME.accent }}>視点置換</div>
          <div style={{ fontSize: 15, fontWeight: 'bold' }}>{frame}</div>
        </div>
        {onOpenDetails && (
          <button type="button" onClick={onOpenDetails} style={headerBtnStyle} title="記録の詳細">
            <List size={20} />
          </button>
        )}
      </header>

      <div style={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
        border: aligned ? `3px solid ${AR_THEME.accent}` : '3px solid transparent',
        transition: 'border-color 0.3s',
      }}
      >
        {annotation.photo ? (
          <div style={{ position: 'absolute', inset: 0, ...filterStyle, transition: 'filter 0.35s' }}>
            <PhotoPinSurface
              imageUrl={annotation.photo}
              pins={photoPins}
              height="100%"
              backgroundFit="cover"
              pinSize={44}
            />
          </div>
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: '#0d1b2a',
            color: AR_THEME.muted,
          }}
          >
            投稿写真なし
          </div>
        )}

        {compassActive && (
          <div style={{
            position: 'absolute',
            top: 72,
            left: 16,
            right: 16,
            zIndex: 4,
            padding: '10px 14px',
            borderRadius: 12,
            background: aligned ? 'rgba(79,195,247,0.25)' : 'rgba(0,0,0,0.65)',
            border: `1px solid ${aligned ? AR_THEME.accent : 'rgba(255,255,255,0.2)'}`,
            fontSize: 13,
            lineHeight: 1.45,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}
          >
            <Compass size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              {aligned ? (
                <strong>投稿者と同じ方向を向いています</strong>
              ) : (
                <>
                  <strong>端末を動かして投稿者の視点に合わせる</strong>
                  {hint && <div style={{ marginTop: 4, color: AR_THEME.accent }}>{hint}</div>}
                </>
              )}
              <div style={{ marginTop: 6, fontSize: 11, color: AR_THEME.muted }}>
                投稿時 向き {Math.round(targetHeading)}° · 俯角 {Math.round(targetPitch)}°
                {' · '}
                距離 約{Math.round(annotation.distanceM ?? 0)}m
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        flexShrink: 0,
        padding: '14px 16px 22px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.92))',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
      >
        <p style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.55 }}>{narrative}</p>
        <button
          type="button"
          onClick={() => setEmpathyOn((v) => !v)}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 12,
            border: empathyOn ? `2px solid ${AR_THEME.accent}` : '1px solid rgba(255,255,255,0.25)',
            background: empathyOn ? 'rgba(79,195,247,0.12)' : 'transparent',
            color: AR_THEME.text,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {empathyOn ? '通常表示に戻す' : '他者の視点フィルターをかける'}
        </button>
      </div>
    </div>
  );
}

const headerBtnStyle = {
  background: 'rgba(0,0,0,0.5)',
  border: 'none',
  borderRadius: 12,
  width: 44,
  height: 44,
  color: '#fff',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
};
