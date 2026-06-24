import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ChevronLeft, Compass } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';
import { useDevicePose } from '../hooks/useDevicePose';
import { usePointerLabel, pointerActionPhrase } from '../hooks/usePointerLabel';
import { isInsideKotoBounds, MAX_AR_VIEW_DISTANCE_M } from '../constants/kotoArea';
import { AR_THEME } from '../constants/arTheme';
import {
  listPinsInCameraView,
  nearestOffScreenPin,
} from '../utils/geoProjection';
import { turnHintForBearing } from '../utils/viewAlignmentHint';
import { haversineDistanceM } from '../utils/geoMath';
import { getBrowserHint, getInsecureContextHint } from '../utils/secureContext';
import { isGeoAccuracyUsable } from '../utils/geoPosition';
import { GeoAr3dScene } from './geo3d/GeoAr3dScene';
import { ArPerspectiveView } from './ArPerspectiveView';
import { ArPinCard } from './ArPinCard';
import { ArVisiblePinBar } from './ArVisiblePinBar';
import { ArCaptureReticle } from './ArCaptureReticle';
import { ArScreenPinOverlay } from './ArScreenPinOverlay';
import { ArPinMarker } from './ArPinMarker';

/**
 * カメラ映像 + Three.js 3Dピン（WebXR セッション不要）
 * ピンは投稿GPSに固定。視点は端末の向き（コンパス）のみと同期。
 */
export function ArGeoArView({
  annotations = [],
  authorId,
  context = 'browse',
  mode = 'view',
  placementTap,
  onPlacementTap,
  onClose,
  selectedPinId,
  onSelectPin,
  captureRef,
  showReticle = false,
  reticleHint = '不満の点をここに合わせてください',
}) {
  const pointerLabel = usePointerLabel();
  const placeAction = pointerActionPhrase(pointerLabel);
  const { videoRef, ready, error: camError, capturePhoto } = useCameraStream({ enabled: true });
  const {
    geo,
    headingDeg: deviceHeading,
    pitchDeg: devicePitch,
    poseRef,
    geoError,
    compassActive,
    permissionState,
    sensorUnavailable,
    insecureContext,
    requestOrientation,
  } = useDevicePose({ enabled: true });

  const insecureHint = useMemo(() => getInsecureContextHint(), []);
  const browserHint = useMemo(() => getBrowserHint(), []);
  const needsHttps = insecureContext || insecureHint != null;

  const sessionOriginRef = useRef(null);
  const [perspectivePin, setPerspectivePin] = useState(null);
  const [detailPin, setDetailPin] = useState(null);
  const [compassPromptDismissed, setCompassPromptDismissed] = useState(false);

  if (geo && !sessionOriginRef.current) {
    sessionOriginRef.current = { lat: geo.lat, lng: geo.lng };
  }

  useEffect(() => {
    if (captureRef) captureRef.current = capturePhoto;
  }, [capturePhoto, captureRef]);

  const handleRequestCompass = useCallback((event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    requestOrientation();
  }, [requestOrientation]);

  const handleSurfacePointer = useCallback((event) => {
    if (mode !== 'place' || !onPlacementTap) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    onPlacementTap({ nx, ny });
  }, [mode, onPlacementTap]);

  const handleSelectPin = useCallback((annotation) => {
    setPerspectivePin(annotation);
    onSelectPin?.(annotation.id);
  }, [onSelectPin]);

  const nearbyPins = useMemo(() => {
    if (!geo) return [];
    return annotations.filter((a) => {
      if (!a.worldPin) return false;
      return haversineDistanceM(geo, a.worldPin) <= MAX_AR_VIEW_DISTANCE_M;
    });
  }, [annotations, geo]);

  const geoAccuracyM = geo?.accuracy != null ? Math.round(geo.accuracy) : null;
  const geoUsable = isGeoAccuracyUsable(geo);

  const visiblePins = useMemo(() => {
    if (!geo || !compassActive || mode !== 'view' || !geoUsable) return [];
    return listPinsInCameraView({
      viewerGeo: geo,
      viewerHeadingDeg: deviceHeading,
      viewerPitchDeg: devicePitch,
      annotations,
    });
  }, [geo, compassActive, mode, deviceHeading, devicePitch, annotations, geoUsable]);

  const offScreenHint = useMemo(() => {
    if (!geo || !compassActive || !geoUsable || visiblePins.length > 0 || nearbyPins.length === 0) {
      return null;
    }
    const nearest = nearestOffScreenPin({
      viewerGeo: geo,
      viewerHeadingDeg: deviceHeading,
      viewerPitchDeg: devicePitch,
      annotations,
    });
    if (!nearest) return null;
    return {
      distM: Math.round(nearest.distM),
      turn: turnHintForBearing(nearest.relBearing, nearest.relPitch),
    };
  }, [geo, compassActive, visiblePins.length, nearbyPins.length, deviceHeading, devicePitch, annotations, geoUsable]);

  const outOfBounds = geo && !isInsideKotoBounds(geo.lat, geo.lng);
  const sessionOriginGeo = sessionOriginRef.current;
  const isBrowse = context === 'browse';
  const showPinOverlay = isBrowse && mode === 'view' && geo && compassActive && geoUsable;
  const showArOverlay = showPinOverlay && sessionOriginGeo;
  const showCompassPrompt = isBrowse && mode === 'view'
    && !compassActive
    && !compassPromptDismissed
    && !sensorUnavailable
    && !needsHttps
    && !browserHint
    && permissionState !== 'denied';
  const showSensorUnavailable = isBrowse && mode === 'view'
    && !compassActive
    && !compassPromptDismissed
    && !needsHttps
    && !browserHint
    && (sensorUnavailable || permissionState === 'denied');

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', color: AR_THEME.text }}>
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {!ready && !camError && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: AR_THEME.bg, zIndex: 2 }}>
          カメラを起動中…
        </div>
      )}

      {(needsHttps || browserHint) && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(0,0,0,0.88)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 360,
              padding: '20px 22px',
              borderRadius: 16,
              background: 'rgba(12,20,32,0.98)',
              border: `1px solid ${AR_THEME.accent}`,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ fontSize: 16, display: 'block', marginBottom: 10 }}>
              {browserHint?.title ?? insecureHint?.title ?? '接続方法を確認してください'}
            </strong>
            <p style={{ margin: 0, color: AR_THEME.muted }}>
              {browserHint?.body ?? insecureHint?.body}
            </p>
            {needsHttps && typeof window !== 'undefined' && (
              <p style={{
                margin: '14px 0 0',
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(79,195,247,0.12)',
                fontSize: 13,
                wordBreak: 'break-all',
              }}
              >
                例:
                {' '}
                <strong style={{ color: AR_THEME.accent }}>
                  https://
                  {window.location.hostname}
                  :
                  {window.location.port || '5173'}
                  /ar.html
                </strong>
              </p>
            )}
            <p style={{ margin: '14px 0 0', fontSize: 12, color: AR_THEME.muted }}>
              Mac 側: ターミナルで npm run dev:mobile を実行。初回は証明書警告 →「詳細」→「アクセス」。
            </p>
          </div>
        </div>
      )}

      {showReticle && ready && (
        <ArCaptureReticle hint={reticleHint} />
      )}

      {showArOverlay && (
        <ArScreenPinOverlay
          annotations={annotations}
          viewerGeo={geo}
          viewerHeadingDeg={deviceHeading}
          viewerPitchDeg={devicePitch}
          selectedPinId={selectedPinId}
          onSelectPin={handleSelectPin}
        />
      )}

      {mode === 'place' && !isBrowse && sessionOriginGeo && geo && (
        <Canvas
          frameloop="always"
          gl={{ alpha: true, antialias: true }}
          style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}
        >
          <GeoAr3dScene
            sessionOriginGeo={sessionOriginGeo}
            viewerGeo={geo}
            poseRef={poseRef}
            annotations={annotations}
            mode={mode}
            placementTap={placementTap}
            authorGeo={geo}
            deviceHeading={deviceHeading}
            devicePitch={devicePitch}
            selectedPinId={selectedPinId}
            onSelectPin={handleSelectPin}
          />
        </Canvas>
      )}

      <div
        role="presentation"
        onClick={handleSurfacePointer}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: mode === 'place' ? 6 : 3,
          cursor: mode === 'place' ? 'crosshair' : 'default',
          pointerEvents: mode === 'place' ? 'auto' : 'none',
        }}
      />

      <div
        data-ar-ui
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px 16px 8px',
          background: isBrowse ? 'linear-gradient(rgba(0,0,0,0.65), transparent)' : 'linear-gradient(rgba(0,0,0,0.45), transparent)',
          zIndex: 210,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'auto',
        }}
      >
        {onClose ? (
          <button type="button" onClick={onClose} style={headerBtnStyle} aria-label="戻る">
            <ChevronLeft size={24} />
          </button>
        ) : <div style={{ width: 44 }} />}
        {isBrowse && (
          <>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 12, color: AR_THEME.accent }}>現地カメラ</div>
              <div style={{ fontSize: 15, fontWeight: 'bold' }}>
                {mode === 'place' ? '場所を決める' : '近くの記録を見る'}
              </div>
          {mode === 'view' && compassActive && geoUsable && (
            <div style={{ fontSize: 10, color: AR_THEME.muted, marginTop: 2 }}>
              ピンは投稿場所に固定 · 端末を向けて探す
              {geoAccuracyM != null && geoAccuracyM <= 28 && (
                <span> · GPS ±{geoAccuracyM}m</span>
              )}
            </div>
          )}
            </div>
            <button
              type="button"
              onClick={handleRequestCompass}
              style={{
                ...headerBtnStyle,
                boxShadow: !compassActive ? `0 0 0 2px ${AR_THEME.accent}` : undefined,
              }}
              title="コンパスを有効化"
            >
              <Compass size={20} />
            </button>
          </>
        )}
        {!isBrowse && mode === 'place' && (
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: AR_THEME.accent }}>投稿</div>
            <div style={{ fontSize: 15, fontWeight: 'bold' }}>カメラで方向指定</div>
          </div>
        )}
        {!isBrowse && <div style={{ width: 44 }} />}
      </div>

      {showCompassPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="コンパス許可"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(0,0,0,0.72)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 340,
              padding: '20px 22px',
              borderRadius: 16,
              background: 'rgba(12,20,32,0.98)',
              border: `1px solid ${AR_THEME.accent}`,
              fontSize: 14,
              lineHeight: 1.55,
              textAlign: 'center',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            <strong style={{ fontSize: 16 }}>向きセンサー（コンパス）が必要です</strong>
            <p style={{ margin: '12px 0 0', fontSize: 13, color: AR_THEME.muted }}>
              ピンは投稿されたGPS位置に固定されます。カメラ映像と一致させるには、
              端末の向きを検知する必要があります。
            </p>
            {permissionState === 'pending' && (
              <p style={{ margin: '10px 0 0', fontSize: 12, color: AR_THEME.accent }}>
                許可ダイアログを確認してください…
              </p>
            )}
            {permissionState === 'granted' && !compassActive && (
              <p style={{ margin: '10px 0 0', fontSize: 12, color: AR_THEME.accent }}>
                端末を左右に少し動かしてください…
              </p>
            )}
            <button
              type="button"
              onClick={handleRequestCompass}
              style={{
                marginTop: 16,
                width: '100%',
                minHeight: 48,
                background: AR_THEME.accent,
                color: '#111',
                border: 'none',
                borderRadius: 12,
                padding: '12px 18px',
                fontWeight: 'bold',
                fontSize: 16,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              コンパスを許可する
            </button>
            <button
              type="button"
              onClick={() => setCompassPromptDismissed(true)}
              style={{
                marginTop: 10,
                background: 'transparent',
                border: 'none',
                color: AR_THEME.muted,
                fontSize: 13,
                cursor: 'pointer',
                padding: 8,
              }}
            >
              あとで
            </button>
          </div>
        </div>
      )}

      {showSensorUnavailable && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(0,0,0,0.72)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 340,
              padding: '20px 22px',
              borderRadius: 16,
              background: 'rgba(12,20,32,0.98)',
              border: '1px solid rgba(255,193,7,0.5)',
              fontSize: 14,
              lineHeight: 1.55,
              textAlign: 'center',
            }}
          >
            <strong style={{ fontSize: 16 }}>
              {permissionState === 'denied' ? 'コンパスが拒否されました' : 'この端末ではコンパスが使えません'}
            </strong>
            <p style={{ margin: '12px 0 0', fontSize: 13, color: AR_THEME.muted }}>
              {permissionState === 'denied'
                ? '設定 → Safari → モーションと画面の向き を許可してから、もう一度お試しください。'
                : 'PCなど向きセンサーのない端末では、地図モードで記録を確認してください。現地ARはスマートフォン向けです。'}
            </p>
            {permissionState === 'denied' ? (
              <button
                type="button"
                onClick={handleRequestCompass}
                style={overlayPrimaryBtnStyle}
              >
                もう一度許可する
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setCompassPromptDismissed(true)}
              style={overlayPrimaryBtnStyle}
            >
              カメラだけ見る
            </button>
          </div>
        </div>
      )}

      {isBrowse && mode === 'view' && !compassActive && compassPromptDismissed && (
        <div
          data-ar-ui
          style={{
            position: 'absolute',
            top: 76,
            left: 16,
            right: 16,
            zIndex: 15,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'rgba(0,0,0,0.72)',
            fontSize: 12,
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
        >
          コンパス未使用 —
          <button
            type="button"
            onClick={handleRequestCompass}
            style={{
              background: 'transparent',
              border: 'none',
              color: AR_THEME.accent,
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: 12,
              textDecoration: 'underline',
            }}
          >
            ここをタップ
          </button>
          して有効化（または右上 🧭）
        </div>
      )}

      {isBrowse && mode === 'view' && geo && !geoUsable && (
        <div
          data-ar-ui
          style={{
            position: 'absolute',
            top: 76,
            left: 16,
            right: 16,
            zIndex: 15,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'rgba(255,152,0,0.22)',
            fontSize: 12,
            lineHeight: 1.45,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          GPS精度が低い（約±{geoAccuracyM ?? '?'}m）ため AR ピンを非表示にしています。屋外で数秒待つか、地図で確認してください。
        </div>
      )}

      {isBrowse && mode === 'view' && compassActive && geo && nearbyPins.length > 0 && geoUsable && (
        <div
          data-ar-ui
          style={{
            position: 'absolute',
            top: 76,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            padding: '8px 14px',
            borderRadius: 20,
            background: 'rgba(0,0,0,0.72)',
            fontSize: 13,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          視界内 {visiblePins.length}件 / 近く {nearbyPins.length}件
        </div>
      )}

      {isBrowse && mode === 'view' && compassActive && offScreenHint && (
        <div
          data-ar-ui
          style={{
            position: 'absolute',
            bottom: 168,
            left: 16,
            right: 16,
            zIndex: 10,
            padding: 12,
            borderRadius: 12,
            background: 'rgba(0,0,0,0.65)',
            fontSize: 13,
            lineHeight: 1.45,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          この方向には記録がありません — {offScreenHint.turn}（約{offScreenHint.distM}m先）
        </div>
      )}

      {isBrowse && mode === 'view' && compassActive && visiblePins.length > 0 && (
        <ArVisiblePinBar
          visiblePins={visiblePins}
          onSelectPin={handleSelectPin}
        />
      )}

      {isBrowse && mode === 'view' && compassActive && visiblePins.length > 0 && !offScreenHint && (
        <div
          data-ar-ui
          style={{
            position: 'absolute',
            bottom: 168,
            left: 16,
            right: 16,
            zIndex: 10,
            padding: 12,
            borderRadius: 12,
            background: 'rgba(0,0,0,0.6)',
            fontSize: 13,
            lineHeight: 1.45,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          見えているピンをタップ → 投稿者の視点へ
        </div>
      )}

      {isBrowse && mode === 'view' && geo && nearbyPins.length === 0 && (
        <div
          data-ar-ui
          style={{
            position: 'absolute',
            bottom: '22%',
            left: 16,
            right: 16,
            zIndex: 10,
            padding: 14,
            borderRadius: 14,
            background: 'rgba(0,0,0,0.65)',
            fontSize: 13,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {MAX_AR_VIEW_DISTANCE_M}m以内に記録がありません。地図で確認してください。
        </div>
      )}

      {mode === 'place' && !isBrowse && placementTap && (
        <ArPinMarker
          nx={placementTap.nx}
          ny={placementTap.ny}
          kind="barrier"
          large
          pulsing
        />
      )}

      {mode === 'place' && isBrowse && !placementTap && (
        <div
          data-ar-ui
          style={{
            position: 'absolute',
            left: '50%',
            top: '42%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div style={{
            width: 48,
            height: 48,
            border: '2px dashed rgba(255,255,255,0.7)',
            borderRadius: '50%',
          }}
          />
          <div style={{ marginTop: 12, fontWeight: 'bold', textShadow: '0 2px 8px #000' }}>
            困っている場所を{placeAction}
          </div>
        </div>
      )}

      {(geoError || camError || outOfBounds) && !needsHttps && (
        <div
          data-ar-ui
          style={{
            position: 'absolute',
            top: 72,
            left: 16,
            right: 16,
            zIndex: 10,
            padding: '10px 12px',
            borderRadius: 12,
            background: geoError?.includes('デモ位置') ? 'rgba(255,152,0,0.2)' : 'rgba(255,193,7,0.2)',
            color: '#ffe082',
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {outOfBounds ? '江東区外です。' : (camError || geoError)}
        </div>
      )}

      {perspectivePin && (
        <ArPerspectiveView
          annotation={perspectivePin}
          viewerHeading={deviceHeading}
          viewerPitch={devicePitch}
          compassActive={compassActive}
          onClose={() => {
            setPerspectivePin(null);
            onSelectPin?.(null);
          }}
          onOpenDetails={() => {
            setDetailPin(perspectivePin);
            setPerspectivePin(null);
          }}
        />
      )}

      {detailPin && (
        <ArPinCard
          key={detailPin.id}
          annotation={detailPin}
          authorId={authorId}
          initialPhase="details"
          onClose={() => {
            setDetailPin(null);
            onSelectPin?.(null);
          }}
        />
      )}
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

const overlayPrimaryBtnStyle = {
  marginTop: 16,
  width: '100%',
  minHeight: 48,
  background: AR_THEME.accent,
  color: '#111',
  border: 'none',
  borderRadius: 12,
  padding: '12px 18px',
  fontWeight: 'bold',
  fontSize: 16,
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
};
