import React, { useRef, useState } from 'react';
import { Camera, Check, MapPin, Crosshair } from 'lucide-react';
import { useDevicePose } from '../hooks/useDevicePose';
import { isValidGeoCoordinate } from '../constants/kotoArea';
import { annotationToDraft } from '../utils/postFormSteps';
import { computePinAtFeet, computePinFromMap, buildCapturePoseAtPhoto } from '../utils/pinPlacement';
import { AR_THEME } from '../constants/arTheme';
import { ArCameraShell } from './ArCameraShell';
import { ArPostChat } from './ArPostChat';
import { ArPinMarker } from './ArPinMarker';
import { ArMapPinPicker } from './ArMapPinPicker';
import { ArGpsAccuracyPanel } from './ArGpsAccuracyPanel';
import { canPlacePinWithGps, getGpsAccuracyLevel } from '../utils/gpsAccuracy';
import { PhotoPinSurface } from '../../components/ui/PhotoPinSurface';

const INITIAL_DRAFT = {
  postKind: 'bad',
  needType: 'P',
  placeArchetype: null,
  placeText: '',
  whoText: '',
  contextText: '',
  affectedGroups: [],
  affectedOther: '',
  comment: '',
  timeTag: 'always',
  severity: 'mid',
  photoPins: [],
  promptKind: 'free',
  promptId: null,
  promptTitle: null,
};

function draftFromPostEntry(postEntry) {
  if (!postEntry) return { ...INITIAL_DRAFT };
  const { kind, prompt } = postEntry;
  const base = {
    ...INITIAL_DRAFT,
    promptKind: kind ?? 'free',
    promptId: prompt?.id ?? null,
    promptTitle: prompt?.title ?? null,
  };
  if (prompt?.placeArchetype) {
    base.placeArchetype = prompt.placeArchetype;
  }
  if (prompt?.id === 'standing-12-good-spots') {
    base.postKind = 'good';
  }
  if (prompt?.timeTagHint) {
    base.timeTag = prompt.timeTagHint;
  }
  return base;
}

const PLACE_MODES = [
  { id: 'feet', label: '現在地', icon: Crosshair },
  { id: 'map', label: '地図', icon: MapPin },
];

export function ArPostFlow({
  annotations,
  authorId,
  postEntry = null,
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
    isEdit ? annotationToDraft(editTarget) : draftFromPostEntry(postEntry),
  );
  const [submitting, setSubmitting] = useState(false);
  const [stickDone, setStickDone] = useState(false);
  const [gpsOverride, setGpsOverride] = useState(false);
  const captureRef = useRef(null);

  const { geo, headingDeg, pitchDeg } = useDevicePose({ enabled: !isEdit });

  const patchDraft = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
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
    const anchor = computePinFromMap({ worldPin, authorGeo: geo });
    if (!anchor) return;
    patchDraft({
      authorGeo: geo ?? { lat: worldPin.lat, lng: worldPin.lng },
      worldPin: anchor.worldPin,
      capturePose: anchor.capturePose,
      screenTap: anchor.screenTap,
      distanceM: anchor.distanceM,
      placementMode: anchor.placementMode,
    });
    setShowMapPicker(false);
    setPlaceMode('feet');
    goCaptureIntro();
  };

  const takePhoto = () => {
    const photo = captureRef.current?.();
    if (!photo) return;

    const tap = { nx: 0.5, ny: 0.5 };
    const worldPin = draft.worldPin;
    const authorGeo = geo ?? draft.authorGeo;
    if (!worldPin || !authorGeo) {
      alert('位置情報またはピン位置がありません。');
      return;
    }

    const shot = buildCapturePoseAtPhoto({
      authorGeo,
      worldPin,
      headingDeg,
      pitchDeg,
      screenTap: tap,
      placementMode: draft.placementMode ?? 'feet',
    });

    patchDraft({
      photo,
      photoPins: [],
      authorGeo: shot.authorGeo ?? geo,
      capturePose: shot.capturePose,
      distanceM: shot.distanceM,
      screenTap: shot.screenTap,
    });
    setPhase('annotate');
  };

  const handleSubmit = async (draftOverride) => {
    const payload = draftOverride ?? draft;
    if (!isEdit && (!payload.worldPin || !isValidGeoCoordinate(payload.worldPin.lat, payload.worldPin.lng))) {
      alert('位置情報が不正です。場所を決め直してください。');
      setPhase('place');
      return;
    }
    setSubmitting(true);
    if (!isEdit) setPhase('stick');
    try {
      if (isEdit) {
        await onUpdate(editTarget.id, payload);
        onDone();
        return;
      }
      await onSubmit(payload);
      setStickDone(true);
      setTimeout(() => onDone(), 1400);
    } catch (err) {
      alert(err?.message ?? (isEdit ? '保存に失敗しました' : '投稿に失敗しました'));
      setPhase('form');
    } finally {
      setSubmitting(false);
    }
  };

  const gpsLevel = getGpsAccuracyLevel(geo?.accuracy);
  const feetReady = geo && canPlacePinWithGps(gpsLevel, { allowOverride: gpsOverride });

  if (phase === 'place') {
    const placeHint = placeMode === 'feet'
      ? '困っている場所に立ち、GPSが安定したら刺してください'
      : '地図で正確な位置を指定します';

    return (
      <>
        {showMapPicker && (
          <ArMapPinPicker
            userGeo={geo}
            onConfirm={confirmMapPlacement}
            onCancel={() => {
              setShowMapPicker(false);
              setPlaceMode('feet');
            }}
          />
        )}

        {!showMapPicker && placeMode === 'feet' && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10,
            background: AR_THEME.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 'calc(10vh + env(safe-area-inset-top, 0px)) 24px 45vh',
            color: AR_THEME.text,
            boxSizing: 'border-box',
          }}
          >
            <Crosshair size={56} color={AR_THEME.accent} style={{ opacity: 0.85, marginBottom: 14 }} />
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>現在地で場所を決める</div>
            <p style={{ margin: 0, fontSize: 14, color: AR_THEME.muted, textAlign: 'center', lineHeight: 1.55, maxWidth: 300 }}>
              カメラは撮影のときだけ使います。
              <br />
              今は GPS で位置を記録します。
            </p>
          </div>
        )}

        {!showMapPicker && (
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
          <PromptContextBar draft={draft} />

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
          </div>
        </div>
        )}
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
          <strong style={{ fontSize: 18 }}>十字の中心に合わせて撮影します</strong>
          <ul style={{ margin: '16px 0', paddingLeft: 20, fontSize: 14, color: AR_THEME.muted }}>
            <li>端末を動かして、画面中央の<strong style={{ color: AR_THEME.text }}>十字</strong>を困りごとの方向に合わせる</li>
            <li>撮影した瞬間の<strong style={{ color: AR_THEME.text }}>向き・俯角</strong>が保存される</li>
            <li>写真は自然な構図のまま（枠で切り取りません）</li>
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

  if (phase === 'annotate') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: AR_THEME.bg,
        color: AR_THEME.text,
        display: 'flex',
        flexDirection: 'column',
      }}
      >
        <header style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
        >
          <div style={{ fontSize: 12, color: AR_THEME.accent }}>③ 空間注釈（任意）</div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>写真にピンを追加</div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: AR_THEME.muted, lineHeight: 1.45 }}>
            困りごとの位置をタップで追加できます。不要ならスキップしてください。
          </p>
        </header>

        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <PhotoPinSurface
            imageUrl={draft.photo}
            pins={draft.photoPins ?? []}
            onChange={(pins) => patchDraft({ photoPins: pins })}
            editable
            backgroundFit="contain"
            height="100%"
            minHeight={240}
            showEditHint
          />
        </div>

        <div style={{
          padding: `12px 16px ${AR_THEME.safeBottom}`,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: 10,
        }}
        >
          <button
            type="button"
            onClick={() => setPhase('form')}
            style={{ ...bottomBtnStyle(true), flex: 1, background: 'rgba(255,255,255,0.12)', color: AR_THEME.text }}
          >
            スキップ
          </button>
          <button
            type="button"
            onClick={() => setPhase('form')}
            style={{ ...bottomBtnStyle(true), flex: 2 }}
          >
            {(draft.photoPins?.length ?? 0) > 0 ? '次へ' : 'このまま次へ'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'form') {
    return (
      <ArPostChat
        draft={draft}
        onChange={patchDraft}
        isEdit={isEdit}
        onBack={() => {
          if (isEdit) onCancel();
          else setPhase('annotate');
        }}
        onSubmit={(finalDraft) => handleSubmit(finalDraft)}
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

function PromptContextBar({ draft }) {
  if (!draft?.promptTitle || draft.promptKind === 'free') return null;
  const isSpecial = draft.promptKind === 'special';
  return (
    <div style={{
      marginBottom: 10,
      padding: '10px 12px',
      borderRadius: 12,
      background: isSpecial ? 'rgba(124,58,237,0.25)' : 'rgba(37,99,235,0.25)',
      border: `1px solid ${isSpecial ? 'rgba(167,139,250,0.5)' : 'rgba(96,165,250,0.5)'}`,
    }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: isSpecial ? '#c4b5fd' : '#93c5fd', marginBottom: 4 }}>
        {isSpecial ? '特設のお題' : '今月のお題'}
      </div>
      <div style={{ fontSize: 13, color: '#f1f5f9', lineHeight: 1.4 }}>{draft.promptTitle}</div>
    </div>
  );
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
