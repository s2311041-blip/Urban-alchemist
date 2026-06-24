import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';
import { AR_THEME } from '../constants/arTheme';
import { ArCaptureReticle } from './ArCaptureReticle';

/**
 * 投稿用のシンプルカメラ（AR閲覧UIなし）
 */
export function ArCameraShell({
  title = '撮影',
  subtitle,
  onClose,
  captureRef,
  showReticle = false,
  reticleHint,
  children,
}) {
  const { videoRef, ready, error, capturePhoto } = useCameraStream({ enabled: true });

  useEffect(() => {
    if (captureRef) captureRef.current = capturePhoto;
  }, [capturePhoto, captureRef]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', color: AR_THEME.text }}>
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {!ready && !error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          background: AR_THEME.bg,
          zIndex: 2,
        }}
        >
          カメラを起動中…
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: 16,
          right: 16,
          zIndex: 10,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(255,152,0,0.25)',
          fontSize: 13,
        }}
        >
          {error}
        </div>
      )}

      {showReticle && ready && (
        <ArCaptureReticle hint={reticleHint} showHint={Boolean(reticleHint)} />
      )}

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '14px 16px',
        background: 'linear-gradient(rgba(0,0,0,0.7), transparent)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
      >
        {onClose && (
          <button type="button" onClick={onClose} style={headerBtnStyle} aria-label="戻る">
            <ChevronLeft size={24} />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: AR_THEME.accent }}>投稿</div>
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 11, color: AR_THEME.muted, marginTop: 2 }}>{subtitle}</div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

const headerBtnStyle = {
  background: 'rgba(0,0,0,0.45)',
  border: 'none',
  borderRadius: 12,
  width: 44,
  height: 44,
  color: '#fff',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
};
