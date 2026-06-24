import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, useXR } from '@react-three/xr';
import { ChevronLeft, Camera, RefreshCw } from 'lucide-react';
import { useDevicePose } from '../hooks/useDevicePose';
import { isInsideKotoBounds } from '../constants/kotoArea';
import { AR_THEME } from '../constants/arTheme';
import {
  XR_CAPTURE_STEP,
  XR_PLACE_STEPS,
  XR_VIEW_STEPS,
} from '../constants/arGuideSteps';
import { arXrStore } from '../xr/xrStore';
import { buildSessionOrigin, placementFromXrHit } from '../utils/xrGeoBridge';
import { ArXrSceneContent } from './xr/ArXrSceneContent';
import { ArPinCard } from './ArPinCard';
import { ArCenterTarget, ArXrGuideOverlay } from './ArXrGuideOverlay';

function XrSessionBridge({ onSessionChange, onOriginCapture, geo, headingDeg }) {
  const session = useXR((s) => s.session);
  const prevSession = useRef(null);

  useEffect(() => {
    if (session && !prevSession.current && geo) {
      onOriginCapture(buildSessionOrigin(geo, headingDeg));
    }
    if (!session && prevSession.current) {
      onOriginCapture(null);
    }
    prevSession.current = session;
    onSessionChange(!!session);
  }, [session, geo, headingDeg, onSessionChange, onOriginCapture]);

  return null;
}

export function ArXrView({
  annotations = [],
  authorId,
  mode = 'view',
  onClose,
  captureRef,
  onXrPlacement,
  xrPlacement = null,
  onConfirmPlacement,
  onCapturePhoto,
  selectedPinId,
  onSelectPin,
  onSwitchToSimple,
  onChangeMode,
}) {
  const { geo, headingDeg, geoError, requestOrientation } = useDevicePose({ enabled: true });
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionOrigin, setSessionOrigin] = useState(null);
  const [hitLocal, setHitLocal] = useState(null);
  const [cardPin, setCardPin] = useState(null);
  const [enterError, setEnterError] = useState(null);
  const hitRef = useRef(null);
  const overlayUiRef = useRef(null);

  useEffect(() => {
    requestOrientation();
  }, [requestOrientation]);

  const handleHitMatrix = useCallback((pos) => {
    hitRef.current = { x: pos.x, y: pos.y, z: pos.z };
    setHitLocal({ x: pos.x, y: pos.y, z: pos.z });
  }, []);

  const handleEnterAr = async () => {
    setEnterError(null);
    if (!geo) {
      setEnterError('位置情報を取得中です。10秒ほど待ってからもう一度押してください。');
      return;
    }
    try {
      if (overlayUiRef.current) {
        arXrStore.setState({ domOverlayRoot: overlayUiRef.current });
      }
      await arXrStore.enterAR();
    } catch {
      setEnterError('カメラを起動できませんでした。「かんたんモード」に切り替えてください。');
    }
  };

  const handleExitAr = () => {
    arXrStore.getState().session?.end();
  };

  const confirmHitPlacement = () => {
    if (!hitRef.current || !sessionOrigin) return;
    const placement = placementFromXrHit(sessionOrigin, hitRef.current);
    if (!isInsideKotoBounds(placement.worldPin.lat, placement.worldPin.lng)) {
      alert('江東区外です。別の場所を指定してください。');
      return;
    }
    onXrPlacement?.(placement);
    onConfirmPlacement?.(placement);
  };

  const title = useMemo(() => {
    if (mode === 'place') return '場所を決める';
    if (mode === 'capture') return '写真を撮る';
    return '現地で見る';
  }, [mode]);

  const guideSteps = useMemo(() => {
    if (mode === 'place') return XR_PLACE_STEPS;
    if (mode === 'capture') return [XR_CAPTURE_STEP];
    return XR_VIEW_STEPS;
  }, [mode]);

  const activeGuideStep = useMemo(() => {
    if (!sessionActive) return 0;
    if (mode === 'capture') return 0;
    if (mode === 'view') return 1;
    if (hitLocal && !xrPlacement) return 2;
    return 1;
  }, [sessionActive, mode, hitLocal, xrPlacement]);

  const outOfBounds = geo && !isInsideKotoBounds(geo.lat, geo.lng);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', color: AR_THEME.text }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0 }}
        camera={{ position: [0, 1.6, 0], fov: 70 }}
      >
        <XR store={arXrStore}>
          <XrSessionBridge
            geo={geo}
            headingDeg={headingDeg}
            onSessionChange={setSessionActive}
            onOriginCapture={setSessionOrigin}
          />
          <ArXrSceneContent
            mode={mode === 'capture' ? 'place' : mode}
            annotations={mode === 'view' ? annotations : []}
            sessionOrigin={sessionOrigin}
            placedLocal={xrPlacement?.xrLocalAnchor ?? null}
            onHitMatrix={mode === 'place' && !xrPlacement ? handleHitMatrix : undefined}
            onSelectPin={(a) => {
              setCardPin(a);
              onSelectPin?.(a.id);
            }}
            captureRef={captureRef}
          />
        </XR>
      </Canvas>

      {!sessionActive && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #0a1628 0%, #060d18 100%)',
        }}
        >
          <header style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" onClick={onClose} style={headerBtnStyle}>
              <ChevronLeft size={22} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: AR_THEME.accent }}>現地AR</div>
              <div style={{ fontWeight: 'bold', fontSize: 17 }}>{title}</div>
            </div>
            {onChangeMode && (
              <button type="button" onClick={onChangeMode} style={textLinkBtnStyle} title="見方を変更">
                <RefreshCw size={18} />
              </button>
            )}
          </header>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
          >
            <ArXrGuideOverlay steps={guideSteps} activeStep={0} compact={false} />

            {(enterError || geoError || outOfBounds) && (
              <div style={{
                padding: 12,
                borderRadius: 12,
                background: 'rgba(255,193,7,0.15)',
                color: '#ffe082',
                fontSize: 13,
                lineHeight: 1.5,
              }}
              >
                {outOfBounds ? '江東区外です。江東区内でお試しください。' : (enterError || geoError)}
              </div>
            )}

            <button
              type="button"
              onClick={handleEnterAr}
              disabled={!geo || outOfBounds}
              style={primaryBtnStyle(!!geo && !outOfBounds)}
            >
              ① カメラを起動する
            </button>

            {onSwitchToSimple && (
              <button type="button" onClick={onSwitchToSimple} style={secondaryBtnStyle}>
                うまくいかない → かんたんモードへ
              </button>
            )}
          </div>
        </div>
      )}

      {sessionActive && (
        <div
          ref={overlayUiRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <ArXrGuideOverlay
              steps={guideSteps}
              activeStep={activeGuideStep}
              compact
            />
          </div>

          {mode === 'place' && !xrPlacement && (
            <ArCenterTarget
              ready={!!hitLocal}
              label="足元をここに合わせる"
            />
          )}

          <div style={{
            pointerEvents: 'auto',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          >
            <button type="button" onClick={() => { handleExitAr(); onClose?.(); }} style={headerBtnStyle}>
              <ChevronLeft size={22} />
            </button>
            <div style={{ fontWeight: 'bold', fontSize: 15 }}>{title}</div>
            {onSwitchToSimple ? (
              <button type="button" onClick={onSwitchToSimple} style={textLinkBtnStyle}>
                ？
              </button>
            ) : <div style={{ width: 44 }} />}
          </div>

          <div style={{
            pointerEvents: 'auto',
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: `calc(${AR_THEME.safeBottom} + 8px)`,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
          >
            {mode === 'place' && !xrPlacement && (
              <button
                type="button"
                disabled={!hitLocal}
                onClick={confirmHitPlacement}
                style={primaryBtnStyle(!!hitLocal)}
              >
                ③ この場所に記録する
              </button>
            )}

            {mode === 'capture' && (
              <button
                type="button"
                onClick={() => {
                  const photo = captureRef?.current?.();
                  if (photo) onCapturePhoto?.(photo);
                }}
                style={primaryBtnStyle(true)}
              >
                <Camera size={20} />
                撮影する
              </button>
            )}

            {mode === 'view' && (
              <p style={{
                margin: 0,
                textAlign: 'center',
                fontSize: 13,
                textShadow: '0 1px 4px #000',
                lineHeight: 1.45,
              }}
              >
                赤いピンをタップ → 中身を読む
              </p>
            )}

            {onSwitchToSimple && (
              <button type="button" onClick={onSwitchToSimple} style={secondaryBtnStyle}>
                かんたんモードに切り替える
              </button>
            )}
          </div>
        </div>
      )}

      {cardPin && (
        <ArPinCard
          annotation={cardPin}
          authorId={authorId}
          onClose={() => {
            setCardPin(null);
            onSelectPin?.(null);
          }}
        />
      )}
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

const textLinkBtnStyle = {
  background: 'rgba(255,255,255,0.12)',
  border: 'none',
  borderRadius: 12,
  width: 44,
  height: 44,
  color: '#fff',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
};

const primaryBtnStyle = (active) => ({
  width: '100%',
  padding: 18,
  borderRadius: 16,
  border: 'none',
  background: active ? AR_THEME.accentWarm : 'rgba(255,255,255,0.2)',
  color: active ? '#0d1b2a' : '#999',
  fontWeight: 'bold',
  fontSize: 17,
  cursor: active ? 'pointer' : 'not-allowed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
});

const secondaryBtnStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(0,0,0,0.45)',
  color: '#e0e0e0',
  fontSize: 14,
  cursor: 'pointer',
};
