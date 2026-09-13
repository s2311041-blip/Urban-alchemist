import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check } from 'lucide-react';
import { useDevicePose } from '../hooks/useDevicePose';
import { isValidGeoCoordinate } from '../constants/kotoArea';
import { annotationToDraft } from '../utils/postFormSteps';
import { computePinAtFeet, computePinFromMap, buildCapturePoseAtPhoto } from '../utils/pinPlacement';
import { AR_THEME } from '../constants/arTheme';
import { ArCameraShell } from './ArCameraShell';
import { ArPostChat } from './ArPostChat';
import { ArPinMarker } from './ArPinMarker';
import { ArMapPinPicker } from './ArMapPinPicker';
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

const POST_STEPS = [
  { id: 'capture', label: '撮影' },
  { id: 'annotate', label: '印' },
  { id: 'form', label: '質問' },
];

function stepIndexForPhase(phase) {
  if (phase === 'capture') return 0;
  if (phase === 'annotate') return 1;
  return 2;
}

function PostProgress({ phase }) {
  const current = stepIndexForPhase(phase);
  return (
    <div style={{
      display: 'flex',
      gap: 4,
      marginBottom: 10,
      alignItems: 'center',
    }}
    >
      {POST_STEPS.map((step, i) => (
        <div key={step.id} style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            height: 6,
            borderRadius: 999,
            background: i <= current ? AR_THEME.accent : 'rgba(255,255,255,0.18)',
            marginBottom: 4,
          }}
          />
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: i === current ? AR_THEME.text : AR_THEME.muted,
          }}
          >
            {i + 1}
            /
            {POST_STEPS.length}
            {' '}
            {step.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ArPostFlow({
  postEntry = null,
  editTarget = null,
  onSubmit,
  onUpdate,
  onCancel,
  onDone,
  onViewAfterPost,
}) {
  const isEdit = !!editTarget?.id;
  const [phase, setPhase] = useState(isEdit ? 'form' : 'capture');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [placementTap, setPlacementTap] = useState(editTarget?.screenTap ?? { nx: 0.5, ny: 0.5 });
  const [draft, setDraft] = useState(
    isEdit ? annotationToDraft(editTarget) : draftFromPostEntry(postEntry),
  );
  const [submitting, setSubmitting] = useState(false);
  const [stickDone, setStickDone] = useState(false);
  const captureRef = useRef(null);

  const { geo, headingDeg, pitchDeg } = useDevicePose({ enabled: !isEdit });

  useEffect(() => {
    if (isEdit || !geo) return;
    setDraft((d) => {
      if (d.placementMode === 'map' && d.worldPin) return d;
      const anchor = computePinAtFeet({ authorGeo: geo });
      if (!anchor) return d;
      return {
        ...d,
        authorGeo: geo,
        worldPin: anchor.worldPin,
        distanceM: anchor.distanceM,
        placementMode: d.placementMode ?? 'feet',
      };
    });
  }, [geo, isEdit]);

  const patchDraft = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
  };

  const applyGeoIfNeeded = () => {
    if (!geo) return draft;
    if (draft.worldPin && isValidGeoCoordinate(draft.worldPin.lat, draft.worldPin.lng)
      && draft.placementMode === 'map') {
      return draft;
    }
    const anchor = computePinAtFeet({ authorGeo: geo });
    if (!anchor) return draft;
    const next = {
      authorGeo: geo,
      worldPin: anchor.worldPin,
      screenTap: draft.screenTap ?? anchor.screenTap,
      distanceM: anchor.distanceM,
      placementMode: draft.placementMode === 'map' ? 'map' : 'feet',
    };
    patchDraft(next);
    return { ...draft, ...next };
  };

  const takePhoto = () => {
    const photo = captureRef.current?.();
    if (!photo) return;

    const tap = { nx: 0.5, ny: 0.5 };
    const authorGeo = geo ?? draft.authorGeo;
    const current = applyGeoIfNeeded();
    const worldPin = current.worldPin ?? authorGeo ?? null;

    const shot = authorGeo && worldPin
      ? buildCapturePoseAtPhoto({
        authorGeo,
        worldPin,
        headingDeg,
        pitchDeg,
        screenTap: tap,
        placementMode: current.placementMode ?? 'feet',
      })
      : null;

    patchDraft({
      photo,
      photoPins: [{ id: 'center', nx: 0.5, ny: 0.5 }],
      authorGeo: shot?.authorGeo ?? authorGeo ?? geo,
      worldPin: shot?.worldPin ?? worldPin,
      capturePose: shot?.capturePose ?? null,
      distanceM: shot?.distanceM ?? 0,
      screenTap: tap,
      placementMode: current.placementMode ?? 'feet',
    });
    setPlacementTap(tap);
    setPhase('annotate');
  };

  const confirmMapPlacement = (worldPin) => {
    const authorGeo = draft.authorGeo ?? geo ?? worldPin;
    const anchor = computePinFromMap({ worldPin, authorGeo });
    if (!anchor) return;
    patchDraft({
      authorGeo,
      worldPin: anchor.worldPin,
      distanceM: anchor.distanceM,
      placementMode: 'map',
    });
    setShowMapPicker(false);
  };

  const handleSubmit = async (draftOverride) => {
    const payload = { ...(draftOverride ?? draft) };
    if (!isEdit && (!payload.worldPin || !isValidGeoCoordinate(payload.worldPin.lat, payload.worldPin.lng))) {
      const fallbackGeo = geo ?? payload.authorGeo;
      if (fallbackGeo && isValidGeoCoordinate(fallbackGeo.lat, fallbackGeo.lng)) {
        const anchor = computePinAtFeet({ authorGeo: fallbackGeo });
        payload.authorGeo = fallbackGeo;
        payload.worldPin = anchor.worldPin;
        payload.placementMode = payload.placementMode ?? 'feet';
      } else {
        alert('位置情報を取得できませんでした。下の位置をタップして地図で指定してください。');
        setPhase('form');
        setShowMapPicker(true);
        return;
      }
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
    } catch (err) {
      alert(err?.message ?? (isEdit ? '保存に失敗しました' : '投稿に失敗しました'));
      setPhase('form');
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === 'capture') {
    return (
      <ArCameraShell
        banner={<PromptBanner draft={draft} compact />}
        onClose={onCancel}
        captureRef={captureRef}
        showFlip
        showReticle
      >
        <div style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: AR_THEME.safeBottom,
          zIndex: 15,
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
        >
          <div style={{
            padding: '8px 14px',
            borderRadius: 999,
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.35,
            textAlign: 'center',
          }}
          >
            気になる対象を中央に合わせて撮影
          </div>
          <button
            type="button"
            onClick={takePhoto}
            aria-label="撮影する"
            style={{
              width: 76,
              height: 76,
              margin: '0 auto 12px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              border: '4px solid #fff',
              background: 'rgba(255,255,255,0.18)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <Camera size={28} />
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
          <PostProgress phase="annotate" />
          <div style={{ fontSize: 12, color: AR_THEME.accent }}>2/3 写真に対象ピン</div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>ピンをドラッグして位置を合わせてください</div>
        </header>

        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <PhotoPinSurface
            imageUrl={draft.photo}
            pins={draft.photoPins ?? []}
            onChange={(pins) => {
              const nextPins = pins.length > 0 ? pins : [{ id: 'center', nx: 0.5, ny: 0.5 }];
              const last = nextPins[0];
              patchDraft({
                photoPins: nextPins,
                screenTap: last ? { nx: last.nx, ny: last.ny } : { nx: 0.5, ny: 0.5 },
              });
              if (last) setPlacementTap({ nx: last.nx, ny: last.ny });
            }}
            editable
            dragOnly
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
            onClick={() => setPhase('capture')}
            style={{ ...bottomBtnStyle(true), flex: 1, background: 'rgba(255,255,255,0.12)', color: AR_THEME.text }}
          >
            撮り直す
          </button>
          <button
            type="button"
            onClick={() => setPhase('form')}
            style={{ ...bottomBtnStyle(true), flex: 2 }}
          >
            次へ
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'form') {
    return (
      <>
        {showMapPicker && (
          <ArMapPinPicker
            userGeo={draft.authorGeo ?? geo}
            initialPin={draft.worldPin}
            onConfirm={confirmMapPlacement}
            onCancel={() => setShowMapPicker(false)}
          />
        )}

        <ArPostChat
          draft={draft}
          onChange={patchDraft}
          isEdit={isEdit}
          headerExtra={!isEdit ? <PostProgress phase="form" /> : null}
          onBack={() => {
            if (isEdit) onCancel();
            else setPhase('annotate');
          }}
          onSubmit={(finalDraft) => handleSubmit(finalDraft)}
          onEditLocation={() => setShowMapPicker(true)}
        />
      </>
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
        <div style={{
          position: 'absolute',
          bottom: '18%',
          left: 24,
          right: 24,
          textAlign: 'center',
        }}
        >
          {stickDone ? (
            <>
              <Check size={48} color={AR_THEME.positive} />
              <div style={{ fontSize: 22, fontWeight: 'bold', marginTop: 12 }}>記録しました</div>
              <p style={{
                margin: '12px auto 0',
                maxWidth: 320,
                fontSize: 14,
                lineHeight: 1.55,
                color: AR_THEME.muted,
              }}
              >
                現地でカメラをかざすと、他の人もこの投稿を見られます。
              </p>
              <button
                type="button"
                onClick={() => (onViewAfterPost ? onViewAfterPost() : onDone())}
                style={{
                  ...bottomBtnStyle(true),
                  width: '100%',
                  marginTop: 16,
                }}
              >
                近くの投稿を見る
              </button>
              <button
                type="button"
                onClick={onDone}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: 12,
                  border: 'none',
                  background: 'transparent',
                  color: AR_THEME.muted,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ホームへ戻る
              </button>
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

function PromptBanner({ draft, compact = false }) {
  if (!draft?.promptTitle || draft.promptKind === 'free') return null;
  const isSpecial = draft.promptKind === 'special';
  return (
    <div style={{
      padding: compact ? '6px 10px' : '10px 12px',
      borderRadius: 12,
      background: isSpecial ? 'rgba(124,58,237,0.35)' : 'rgba(37,99,235,0.4)',
      border: `1px solid ${isSpecial ? 'rgba(167,139,250,0.5)' : 'rgba(96,165,250,0.5)'}`,
    }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: isSpecial ? '#c4b5fd' : '#93c5fd' }}>
        {isSpecial ? '特設のお題' : '今月のお題'}
      </div>
      <div style={{
        fontSize: compact ? 13 : 14,
        color: '#f1f5f9',
        lineHeight: 1.35,
        fontWeight: 700,
      }}
      >
        {draft.promptTitle}
      </div>
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
