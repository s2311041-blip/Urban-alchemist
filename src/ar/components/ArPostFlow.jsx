import React, { useRef, useState } from 'react';
import { Camera, Check, MapPin, Crosshair, Video } from 'lucide-react';
import { useDevicePose } from '../hooks/useDevicePose';
import { usePointerLabel, pointerActionPhrase } from '../hooks/usePointerLabel';
import { isInsideKotoBounds } from '../constants/kotoArea';
import { annotationToDraft, getFormStepIds } from '../utils/postFormSteps';
import { computePinWorldPosition } from '../utils/pinAnchor';
import { computePinAtFeet, computePinFromMap, buildCapturePoseAtPhoto } from '../utils/pinPlacement';
import { AR_THEME } from '../constants/arTheme';
import { ArLiveView } from './ArLiveView';
import { ArCameraShell } from './ArCameraShell';
import { ArPostForm } from './ArPostForm';
import { ArPinMarker } from './ArPinMarker';
import { ArMapPinPicker } from './ArMapPinPicker';
import { ArGpsAccuracyPanel } from './ArGpsAccuracyPanel';
import { canPlacePinWithGps, getGpsAccuracyLevel } from '../utils/gpsAccuracy';

const INITIAL_DRAFT = {
  postKind: 'bad',
  needType: 'P',
  placeArchetype: null,
  affectedGroups: [],
  affectedOther: '',
  comment: '',
  timeTag: 'always',
  severity: 'mid',
};

const PLACE_MODES = [
  { id: 'feet', label: '現在地', icon: Crosshair },
  { id: 'map', label: '地図', icon: MapPin },
  { id: 'camera', label: 'カメラ', icon: Video },
];

export function ArPostFlow({
  annotations,
  authorId,
  editTarget = null,
  onSubmit,
  onUpdate,
  onCancel,
  onDone,
}) {
  const isEdit = !!editTarget?.id;
  const [phase, setPhase] = useState(isEdit ? 'form' : 'place');
  const [placeMode, setPlaceMode] = useState('feet');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [placementTap, setPlacementTap] = useState(editTarget?.screenTap ?? null);
  const [draft, setDraft] = useState(
    isEdit ? annotationToDraft(editTarget) : INITIAL_DRAFT,
  );
  const [formStep, setFormStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [stickDone, setStickDone] = useState(false);
  const [gpsOverride, setGpsOverride] = useState(false);
  const captureRef = useRef(null);
  const pointerLabel = usePointerLabel();
  const placeAction = pointerActionPhrase(pointerLabel);

  const { geo, headingDeg, pitchDeg } = useDevicePose({ enabled: !isEdit });

  const patchDraft = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    if (patch.postKind) setFormStep(1);
  };

  const applyAnchor = (anchor) => {
    if (!anchor) return;
    patchDraft({
      authorGeo: geo,
      worldPin: anchor.worldPin,
      capturePose: anchor.capturePose,
      screenTap: anchor.screenTap,
      distanceM: anchor.distanceM,
      placementMode: anchor.placementMode,
    });
  };

  const goCaptureIntro = () => {
    setPlacementTap({ nx: 0.5, ny: 0.5 });
    setPhase('captureIntro');
  };

  const confirmFeetPlacement = () => {
    if (!geo) {
      alert('位置情報を取得中です。屋外で数秒お待ちください。');
      return;
    }
    const level = getGpsAccuracyLevel(geo.accuracy);
    if (!canPlacePinWithGps(level, { allowOverride: gpsOverride })) {
      return;
    }
    applyAnchor(computePinAtFeet({ authorGeo: geo }));
    goCaptureIntro();
  };

  const confirmMapPlacement = (worldPin) => {
    if (!geo) return;
    applyAnchor(computePinFromMap({ worldPin, authorGeo: geo }));
    setShowMapPicker(false);
    goCaptureIntro();
  };

  const confirmCameraPlacement = () => {
    if (!geo || !placementTap) return;
    const anchor = computePinWorldPosition({
      authorGeo: geo,
      headingDeg,
      pitchDeg,
      screenTap: placementTap,
    });
    applyAnchor({ ...anchor, placementMode: 'camera' });
    goCaptureIntro();
  };

  const takePhoto = () => {
    const photo = captureRef.current?.();
    if (!photo) return;

    const tap = { nx: 0.5, ny: 0.5 };
    const worldPin = draft.worldPin;
    if (!geo || !worldPin) {
      alert('位置情報またはピン位置がありません。');
      return;
    }

    const shot = buildCapturePoseAtPhoto({
      authorGeo: geo,
      worldPin,
      headingDeg,
      pitchDeg,
      screenTap: tap,
      placementMode: draft.placementMode ?? placeMode,
    });

    patchDraft({
      photo,
      photoPins: [{ id: 'primary', nx: tap.nx, ny: tap.ny }],
      authorGeo: shot.authorGeo,
      capturePose: shot.capturePose,
      distanceM: shot.distanceM,
      screenTap: shot.screenTap,
    });
    setPhase('form');
    setFormStep(1);
  };

  const handleSubmit = async () => {
    if (!isEdit && (!draft.worldPin || !isInsideKotoBounds(draft.worldPin.lat, draft.worldPin.lng))) {
      alert('ピンが江東区エリア外です。場所を決め直してください。');
      setPhase('place');
      return;
    }
    setSubmitting(true);
    if (!isEdit) setPhase('stick');
    try {
      if (isEdit) {
        await onUpdate(editTarget.id, draft);
        onDone();
        return;
      }
      await onSubmit(draft);
      setStickDone(true);
      setTimeout(() => onDone(), 1400);
    } catch (err) {
      alert(err?.message ?? (isEdit ? '保存に失敗しました' : '投稿に失敗しました'));
      setPhase('form');
    } finally {
      setSubmitting(false);
    }
  };

  const formStepCount = getFormStepIds(draft.postKind).length;
  const gpsLevel = getGpsAccuracyLevel(geo?.accuracy);
  const feetReady = geo && canPlacePinWithGps(gpsLevel, { allowOverride: gpsOverride });

  if (phase === 'place') {
    const placeHint = placeMode === 'feet'
      ? '困っている場所に立ち、GPSが安定したら刺してください'
      : placeMode === 'map'
        ? '地図で正確な位置を指定します'
        : `画面を${placeAction}して方向を指定（誤差が大きいです）`;

    return (
      <>
        {showMapPicker && (
          <ArMapPinPicker
            userGeo={geo}
            onConfirm={confirmMapPlacement}
            onCancel={() => setShowMapPicker(false)}
          />
        )}

        {placeMode === 'camera' && (
          <ArLiveView
            context="post"
            annotations={[]}
            authorId={authorId}
            mode="place"
            placementTap={placementTap}
            onPlacementTap={setPlacementTap}
            onClose={onCancel}
          />
        )}

        {placeMode === 'feet' && (
          <ArCameraShell
            title="① 場所を決める"
            subtitle="現在地モード"
            onClose={onCancel}
          />
        )}

        <div style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 220,
          padding: `12px 16px ${AR_THEME.safeBottom}`,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.92) 24%)',
          pointerEvents: 'auto',
        }}
        >
          <p style={{
            margin: '0 0 10px',
            fontSize: 14,
            lineHeight: 1.5,
            color: '#e3f2fd',
          }}
          >
            {placeHint}
          </p>

          {placeMode === 'feet' && (
            <ArGpsAccuracyPanel
              geo={geo}
              allowOverride
              onRequestOverride={() => setGpsOverride(true)}
            />
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {PLACE_MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setPlaceMode(id);
                  if (id === 'map') setShowMapPicker(true);
                }}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: 12,
                  border: placeMode === id ? `2px solid ${AR_THEME.accent}` : '1px solid rgba(255,255,255,0.2)',
                  background: placeMode === id ? 'rgba(79,195,247,0.15)' : 'rgba(0,0,0,0.55)',
                  color: AR_THEME.text,
                  fontSize: 12,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onCancel} style={bottomBtnStyle(false)}>キャンセル</button>
            {placeMode === 'feet' && (
              <button
                type="button"
                disabled={!feetReady}
                onClick={confirmFeetPlacement}
                style={bottomBtnStyle(feetReady)}
              >
                この場所に刺す
              </button>
            )}
            {placeMode === 'map' && (
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                style={bottomBtnStyle(true)}
              >
                地図で指定
              </button>
            )}
            {placeMode === 'camera' && (
              <button
                type="button"
                disabled={!placementTap}
                onClick={confirmCameraPlacement}
                style={bottomBtnStyle(!!placementTap)}
              >
                ここに刺す
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  if (phase === 'captureIntro') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        color: AR_THEME.text,
      }}
      >
        <div style={{
          maxWidth: 360,
          width: '100%',
          padding: '24px 22px',
          borderRadius: 16,
          background: 'rgba(12,20,32,0.98)',
          border: `1px solid ${AR_THEME.accent}`,
          lineHeight: 1.6,
        }}
        >
          <div style={{ fontSize: 11, color: AR_THEME.accent, marginBottom: 6 }}>② 撮影の準備</div>
          <strong style={{ fontSize: 18 }}>枠の中心に不満点を合わせます</strong>
          <ul style={{ margin: '16px 0', paddingLeft: 20, fontSize: 14, color: AR_THEME.muted }}>
            <li>端末を動かして、十字の<strong style={{ color: AR_THEME.text }}>中心</strong>に困りごとを合わせる</li>
            <li>撮影した瞬間の<strong style={{ color: AR_THEME.text }}>向き・俯角</strong>が保存される</li>
            <li>次の画面は枠だけのすっきりした画面です</li>
          </ul>
          <button
            type="button"
            onClick={() => setPhase('capture')}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              border: 'none',
              background: AR_THEME.accent,
              color: '#0d1b2a',
              fontWeight: 'bold',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            OK · 撮影画面へ
          </button>
          <button
            type="button"
            onClick={() => setPhase('place')}
            style={{
              width: '100%',
              marginTop: 10,
              padding: 10,
              border: 'none',
              background: 'transparent',
              color: AR_THEME.muted,
              cursor: 'pointer',
            }}
          >
            場所の指定に戻る
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'capture') {
    return (
      <ArCameraShell
        title="② 撮影"
        onClose={() => setPhase('captureIntro')}
        captureRef={captureRef}
        showReticle
        reticleHint=""
      >
        <div style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: AR_THEME.safeBottom,
          zIndex: 15,
          padding: '0 20px',
        }}
        >
          <button type="button" onClick={takePhoto} style={{
            ...bottomBtnStyle(true),
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          >
            <Camera size={22} />
            撮影する
          </button>
        </div>
      </ArCameraShell>
    );
  }

  if (phase === 'form') {
    return (
      <ArPostForm
        draft={draft}
        onChange={patchDraft}
        stepIndex={formStep}
        isEdit={isEdit}
        onBack={() => {
          if (formStep === 1) {
            if (isEdit) onCancel();
            else setPhase('capture');
            return;
          }
          setFormStep((s) => s - 1);
        }}
        onNext={() => {
          if (formStep < formStepCount) {
            setFormStep((s) => s + 1);
          } else {
            handleSubmit();
          }
        }}
      />
    );
  }

  if (phase === 'stick') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 20000,
        color: AR_THEME.text,
      }}
      >
        {placementTap && (
          <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <ArPinMarker nx={placementTap.nx} ny={placementTap.ny} kind={draft.postKind === 'good' ? 'positive' : 'barrier'} large pulsing />
          </div>
        )}
        <div style={{ position: 'absolute', bottom: '30%', textAlign: 'center' }}>
          {stickDone ? (
            <>
              <Check size={48} color={AR_THEME.positive} />
              <div style={{ fontSize: 22, fontWeight: 'bold', marginTop: 12 }}>記録しました！</div>
            </>
          ) : (
            <div style={{ fontSize: 18 }}>{submitting ? '保存中…' : '保存中…'}</div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

const bottomBtnStyle = (active) => ({
  flex: 1,
  padding: '16px 20px',
  borderRadius: 16,
  border: 'none',
  background: active ? AR_THEME.accent : 'rgba(255,255,255,0.12)',
  color: active ? '#0d1b2a' : AR_THEME.muted,
  fontWeight: 'bold',
  fontSize: 16,
  cursor: active ? 'pointer' : 'not-allowed',
});
