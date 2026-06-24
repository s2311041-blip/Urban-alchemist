import React, { useRef, useState, useEffect } from 'react';
import { Focus, X, Send, MapPin, Camera, ImagePlus } from 'lucide-react';
import { PhotoPinSurface } from './PhotoPinSurface';
import {
  NEED_CATEGORY_OPTIONS,
  NEED_TYPE_TO_DEFAULT_TYPE,
  TARGET_GROUP_OPTIONS,
  TIME_TAG_OPTIONS,
  SEVERITY_OPTIONS,
} from '../../constants/barrierData';
import { Pictogram } from './Pictogram';
import { MapPinPicker } from './MapPinPicker';
import {
  PLACE_SELECTION_OPTIONS,
  AR_POSTING_COPY,
  AR_POSTING_STYLE,
  getModeBadgeStyle,
  getSheetStyle,
} from '../../constants/ui/arPostingMode';

const ChoiceCard = ({ onClick, active, activeStyle, inactiveStyle, minHeight, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      ...AR_POSTING_STYLE.choiceCardBase,
      minHeight,
      ...(active ? activeStyle : inactiveStyle),
    }}
  >
    {children}
  </button>
);

export const ARPostingMode = ({
  onClose,
  onPost,
  editTarget = null,
  quests = [],
  goodSpots = [],
  onSaveEdit,
  MapPinPickerComponent = MapPinPicker,
  copy: copyOverrides = {},
  captureGeo = false,
  requireBadNarrative = false,
}) => {
  const copy = { ...AR_POSTING_COPY, ...copyOverrides };
  const isEdit = !!editTarget?.id;
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const photoInputRef = useRef(null);

  const [phase, setPhase] = useState('choose');
  const [captureMode, setCaptureMode] = useState(null);
  const [mapPin, setMapPin] = useState(null);
  const [mapPhotoStep, setMapPhotoStep] = useState(false);

  const [capturedImage, setCapturedImage] = useState(null);
  const [comment, setComment] = useState('');
  const [postKind, setPostKind] = useState('bad');
  const [needType, setNeedType] = useState('P');
  const [placeArchetype, setPlaceArchetype] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [affectedGroups, setAffectedGroups] = useState([]);
  const [timeTag, setTimeTag] = useState('常時');
  const [severity, setSeverity] = useState('mid');
  const [photoPins, setPhotoPins] = useState([]);
  const [geoPosition, setGeoPosition] = useState(null);

  const captureGeoPosition = () => {
    if (!captureGeo || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeoPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        capturedAt: Date.now(),
      }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  };

  useEffect(() => {
    if (!editTarget?.id) return;
    const source = editTarget.kind === 'good'
      ? goodSpots.find((spot) => spot.id === editTarget.id)
      : quests.find((quest) => quest.id === editTarget.id);
    if (!source) return;
    setCapturedImage(source.photo ?? null);
    setComment(source.comment ?? '');
    setPhotoPins(Array.isArray(source.photoPins) ? source.photoPins : []);
    setPostKind(editTarget.kind === 'good' ? 'good' : 'bad');
    setCaptureMode(source.captureMode === 'map' ? 'map' : 'onsite');
    setMapPin(source.mapPin ?? null);
    if (editTarget.kind === 'quest') {
      setNeedType(source.needType ?? 'P');
      setPlaceArchetype(source.placeArchetype ?? null);
      setAffectedGroups(Array.isArray(source.affectedGroups) ? source.affectedGroups : []);
      setTimeTag(source.timeTag ?? '常時');
      setSeverity(source.severity ?? 'mid');
    }
    setPhase('form');
    setCurrentStep(1);
  }, [editTarget, quests, goodSpots]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn('Camera not available, using fallback', err);
      }
    };

    const useCamera = phase === 'capture' && captureMode === 'onsite' && !capturedImage;
    if (useCamera) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [phase, captureMode, capturedImage]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const startMode = (mode) => {
    setCaptureMode(mode);
    setMapPin(null);
    setMapPhotoStep(false);
    setCapturedImage(null);
    setGeoPosition(null);
    setPhase('capture');
    if (mode === 'onsite') captureGeoPosition();
  };

  const handleMapPinConfirm = (pin) => {
    setMapPin(pin);
    setMapPhotoStep(true);
  };

  const handlePhotoFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result);
      setPhase('form');
      setCurrentStep(1);
      setPhotoPins([]);
      setAffectedGroups([]);
      setTimeTag('常時');
      setSeverity('mid');
      setPlaceArchetype(null);
      if (captureMode === 'onsite') captureGeoPosition();
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCapture = () => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      setCapturedImage(canvas.toDataURL('image/jpeg'));
      setPhase('form');
      setCurrentStep(1);
      setPhotoPins([]);
      setAffectedGroups([]);
      setTimeTag('常時');
      setSeverity('mid');
      setPlaceArchetype(null);
      stopCamera();
      if (captureMode === 'onsite') captureGeoPosition();
    } else {
      setCapturedImage('https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800');
      setPhase('form');
      setCurrentStep(1);
      setPhotoPins([]);
      setPlaceArchetype(null);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setComment('');
    setPhotoPins([]);
    setCurrentStep(1);
    setPlaceArchetype(null);
    setPhase('capture');
    if (captureMode === 'map') {
      setMapPhotoStep(!!mapPin);
    }
  };

  const backFromCapture = () => {
    stopCamera();
    setPhase('choose');
    setCaptureMode(null);
    setMapPin(null);
    setMapPhotoStep(false);
    setCapturedImage(null);
  };

  const postMeta = () => ({
    captureMode: captureMode === 'map' ? 'map' : 'onsite',
    ...(captureMode === 'map' && mapPin ? { mapPin } : {}),
    ...(geoPosition ? { geo: geoPosition } : {}),
  });

  const submitPost = () => {
    const meta = postMeta();
    const goodPayload = {
      postKind: 'good',
      photo: capturedImage,
      comment,
      photoPins,
      type: 'good_place',
      factor: 'human',
      needType: 'S',
      tagLabel: '#みんなに優しい場所',
      isMine: true,
      demographic: 'あなた',
      ...meta,
    };
    const badPayload = {
      postKind: 'bad',
      photo: capturedImage,
      comment: comment.trim() || (requireBadNarrative ? '' : `${NEED_CATEGORY_OPTIONS.find((opt) => opt.needType === needType)?.label ?? '困りごと'}がある`),
      photoPins,
      type: NEED_TYPE_TO_DEFAULT_TYPE[needType] ?? 'danger',
      needType,
      placeArchetype,
      affectedGroups,
      timeTag,
      severity,
      isMine: true,
      demographic: 'あなた',
      ...meta,
    };
    if (isEdit) {
      onSaveEdit?.({
        kind: editTarget.kind,
        id: editTarget.id,
        updates: postKind === 'good' ? goodPayload : badPayload,
      });
      return;
    }
    onPost(postKind === 'good' ? goodPayload : badPayload);
  };

  const isAnnotationStep = isEdit ? currentStep === 1 : currentStep === 2;
  const totalSteps = isEdit
    ? (postKind === 'good' ? 2 : 7)
    : (postKind === 'good' ? 3 : 7);
  const badAt = (editStep) => postKind === 'bad' && currentStep === (isEdit ? editStep : editStep + 1);
  const goodCommentAt = postKind === 'good' && currentStep === (isEdit ? 2 : 3);
  const canProceed = () => {
    if (isAnnotationStep) return true;
    if (postKind === 'good') return true;
    if (badAt(3)) return !!placeArchetype;
    if (badAt(4)) return affectedGroups.length > 0;
    if (badAt(5)) return !!timeTag;
    if (badAt(6) && requireBadNarrative) return comment.trim().length >= 10;
    return true;
  };

  const toggleAffectedGroup = (group) => {
    setAffectedGroups((prev) => {
      if (group === 'みんな') {
        return prev.includes('みんな') ? [] : ['みんな'];
      }
      const base = prev.filter((v) => v !== 'みんな');
      if (base.includes(group)) return base.filter((v) => v !== group);
      return [...base, group];
    });
  };

  if (phase === 'choose' && !isEdit) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'linear-gradient(160deg, #0d1b2a 0%, #1b263b 100%)',
        display: 'flex',
        flexDirection: 'column',
        color: '#e3f2fd',
        padding: '32px 24px',
        boxSizing: 'border-box',
      }}
      >
        <button
          type="button"
          onClick={handleClose}
          style={{
            alignSelf: 'flex-start',
            background: 'rgba(0,0,0,0.45)',
            border: 'none',
            borderRadius: '50%',
            padding: 10,
            cursor: 'pointer',
            color: 'white',
          }}
        >
          <X size={28} />
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <h2 style={{ margin: 0, fontSize: 26, textAlign: 'center' }}>{copy.chooseTitle}</h2>
          <p style={{ margin: 0, textAlign: 'center', color: '#90a4ae', lineHeight: 1.55, fontSize: 15 }}>
            {copy.chooseDescription}
          </p>
          <button
            type="button"
            onClick={() => startMode('onsite')}
            style={{
              padding: '24px 20px',
              borderRadius: 20,
              border: '2px solid #4fc3f7',
              background: 'rgba(79,195,247,0.12)',
              color: '#e1f5fe',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Camera size={40} />
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>{copy.onsiteTitle}</span>
            <span style={{ fontSize: 14, color: '#b0bec5' }}>{copy.onsiteHint}</span>
          </button>
          <button
            type="button"
            onClick={() => startMode('map')}
            style={{
              padding: '24px 20px',
              borderRadius: 20,
              border: '2px solid #81c784',
              background: 'rgba(129,199,132,0.12)',
              color: '#e8f5e9',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <MapPin size={40} />
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>{copy.mapTitle}</span>
            <span style={{ fontSize: 14, color: '#b0bec5' }}>{copy.mapHint}</span>
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'capture' && captureMode === 'map' && !mapPhotoStep) {
    return (
      <MapPinPickerComponent
        onConfirm={handleMapPinConfirm}
        onCancel={backFromCapture}
      />
    );
  }

  if (phase === 'capture' && captureMode === 'map' && mapPhotoStep && !capturedImage) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a1628',
        display: 'flex',
        flexDirection: 'column',
        color: '#e9f8ff',
        padding: 24,
        boxSizing: 'border-box',
      }}
      >
        <button
          type="button"
          onClick={() => { setMapPhotoStep(false); setMapPin(null); }}
          style={{
            alignSelf: 'flex-start',
            background: 'rgba(0,0,0,0.45)',
            border: 'none',
            borderRadius: '50%',
            padding: 10,
            cursor: 'pointer',
            color: 'white',
          }}
        >
          <X size={28} />
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, textAlign: 'center' }}>
          <MapPin size={48} color="#ff5252" />
          <h2 style={{ margin: 0, fontSize: 22 }}>{copy.mapPhotoTitle}</h2>
          <p style={{ margin: 0, maxWidth: 320, color: '#90a4ae', lineHeight: 1.5, fontSize: 15 }}>
            {copy.mapPhotoDescription}
          </p>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handlePhotoFile}
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            style={{
              padding: '20px 32px',
              borderRadius: 18,
              border: 'none',
              background: '#00897b',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <ImagePlus size={24} />
            {copy.pickPhoto}
          </button>
        </div>
      </div>
    );
  }

  const sheetStyle = getSheetStyle(currentStep === 1);
  const modeBadge = captureMode === 'map' ? copy.modeMap : copy.modeOnsite;

  if (isAnnotationStep) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000' }}>
        <PhotoPinSurface
          imageUrl={capturedImage}
          pins={photoPins}
          onChange={setPhotoPins}
          editable
          height="100%"
          backgroundFit="contain"
          showEditHint={false}
        />
        <button
          type="button"
          onClick={isEdit ? handleClose : resetCapture}
          style={AR_POSTING_STYLE.roundCloseButton}
        >
          <X size={30} />
        </button>
        <div style={AR_POSTING_STYLE.annotationStepBadge}>
          {isEdit ? '空間注釈' : `ステップ ${currentStep}/${totalSteps}`}
        </div>
        <div style={AR_POSTING_STYLE.annotationFooter}>
          <div style={AR_POSTING_STYLE.annotationFooterInner}>
            <p style={AR_POSTING_STYLE.annotationHintText}>
              {isEdit ? copy.annotationEditHint : copy.annotationHint}
              {photoPins.length > 0 ? ` — ${photoPins.length}件` : ''}
            </p>
            {!isEdit && (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                style={{
                  ...AR_POSTING_STYLE.annotationNavButton,
                  pointerEvents: 'auto',
                  background: 'rgba(255,255,255,0.16)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.35)',
                }}
              >
                戻る
              </button>
            )}
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
              style={{
                ...AR_POSTING_STYLE.annotationNavButton,
                pointerEvents: 'auto',
                background: '#42a5f5',
                color: '#fff',
              }}
            >
              {copy.annotationNext}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000', display: 'flex', flexDirection: 'column' }}>
      {phase === 'capture' && captureMode === 'onsite' && !capturedImage ? (
        <>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Focus size={120} color="rgba(255,255,255,0.6)" strokeWidth={1} />
          </div>
          <button type="button" onClick={backFromCapture} style={AR_POSTING_STYLE.roundCloseButton}><X size={30} /></button>

          <div style={getModeBadgeStyle(captureMode)}>
            {modeBadge}
          </div>

          <div style={{ position: 'absolute', bottom: '50px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '20px', color: 'white', fontWeight: 'bold' }}>{copy.scanPrompt}</div>
            <button type="button" onClick={handleCapture} style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', border: '5px solid #ddd', cursor: 'pointer', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />
          </div>
        </>
      ) : (
        <PhotoPinSurface
          imageUrl={capturedImage}
          pins={photoPins}
          onChange={isAnnotationStep ? setPhotoPins : undefined}
          editable={isAnnotationStep}
          height="100%"
        >
          {!isEdit && (
            <button type="button" onClick={resetCapture} style={AR_POSTING_STYLE.roundCloseButton}><X size={30} /></button>
          )}
          {isEdit && (
            <button type="button" onClick={handleClose} style={AR_POSTING_STYLE.roundCloseButton}><X size={30} /></button>
          )}
          <div style={getModeBadgeStyle(captureMode)}>
            {modeBadge}
          </div>

          <div style={{
            ...sheetStyle,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            pointerEvents: 'auto',
            zIndex: 6,
          }}
          >
            <h3 style={{ margin: 0, color: '#333', fontSize: currentStep === 1 ? '24px' : '22px', lineHeight: 1.2 }}>
              {isEdit ? '投稿を編集' : copy.stepHeader}
            </h3>
            <div style={{ fontSize: '16px', color: '#607d8b', fontWeight: 'bold' }}>ステップ {currentStep}/{totalSteps}</div>
            {currentStep === 1 && !isEdit && <div style={{ fontSize: '18px', color: '#37474f', fontWeight: 'bold' }}>1) Good / Bad を選ぶ</div>}
            {currentStep === 1 && !isEdit && (
            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                type="button"
                onClick={() => setPostKind('good')}
                style={{
                  flex: 1,
                  padding: '22px 16px',
                  borderRadius: '20px',
                  border: `3px solid ${postKind === 'good' ? '#2e7d32' : '#c8e6c9'}`,
                  background: postKind === 'good' ? '#c8e6c9' : '#e8f5e9',
                  color: '#1b5e20',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minHeight: '72px',
                }}
              >
                Good（良い場所）
              </button>
              <button
                type="button"
                onClick={() => setPostKind('bad')}
                style={{
                  flex: 1,
                  padding: '22px 16px',
                  borderRadius: '20px',
                  border: `3px solid ${postKind === 'bad' ? '#c62828' : '#ffcdd2'}`,
                  background: postKind === 'bad' ? '#ffcdd2' : '#ffebee',
                  color: '#b71c1c',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minHeight: '72px',
                }}
              >
                Bad（不満）
              </button>
            </div>
            )}
            {badAt(2) && (
              <>
                <div style={{ fontSize: '20px', color: '#37474f', fontWeight: 'bold' }}>{isEdit ? '2' : '3'}) どんな困り方？（ジャンル）</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                  {NEED_CATEGORY_OPTIONS.map((option) => (
                    <ChoiceCard
                      key={option.needType}
                      onClick={() => setNeedType(option.needType)}
                      active={needType === option.needType}
                      minHeight="172px"
                      activeStyle={{
                        border: '3px solid #333',
                        background: 'rgba(255,255,255,0.98)',
                        color: '#333',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                      }}
                      inactiveStyle={{
                        border: '2px solid #e0e0e0',
                        background: 'rgba(250,250,250,0.96)',
                        color: '#333',
                      }}
                    >
                      <Pictogram src={option.iconSrc} size={76} alt={option.label} />
                      <div style={{ fontSize: '22px', lineHeight: 1.25 }}>{option.label}</div>
                      <div style={{ fontSize: '14px', color: '#607d8b', fontWeight: 600, lineHeight: 1.35, padding: '0 4px' }}>{option.hint}</div>
                    </ChoiceCard>
                  ))}
                </div>
              </>
            )}
            {badAt(3) && (
              <>
                <div style={{ fontSize: '20px', color: '#37474f', fontWeight: 'bold' }}>{isEdit ? '3' : '4'}) どの場所タイプ？（1つ）</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                  {PLACE_SELECTION_OPTIONS.map((option) => (
                    <ChoiceCard
                      key={option.id}
                      onClick={() => setPlaceArchetype(option.id)}
                      active={placeArchetype === option.id}
                      minHeight="118px"
                      activeStyle={{
                        border: '3px solid #5e35b1',
                        background: '#ede7f6',
                        color: '#311b92',
                        boxShadow: '0 6px 18px rgba(94,53,177,0.2)',
                      }}
                      inactiveStyle={{
                        border: '2px solid #d1c4e9',
                        background: '#fafafa',
                        color: '#4527a0',
                      }}
                    >
                      <div style={{ fontSize: option.id === 'none' ? '20px' : '22px', lineHeight: 1.3 }}>{option.label}</div>
                      {option.id === 'none' && (
                        <div style={{ fontSize: '12px', color: '#7e57c2', fontWeight: 600 }}>オーブのみ配置</div>
                      )}
                    </ChoiceCard>
                  ))}
                </div>
              </>
            )}
            {badAt(4) && (
              <>
                <div style={{ fontSize: '20px', color: '#37474f', fontWeight: 'bold' }}>{isEdit ? '4' : '5'}) 誰が困る？（複数選択）</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                  {TARGET_GROUP_OPTIONS.map((option) => {
                    const active = affectedGroups.includes(option.label);
                    return (
                      <ChoiceCard
                        key={option.label}
                        onClick={() => toggleAffectedGroup(option.label)}
                        active={active}
                        minHeight="148px"
                        activeStyle={{
                          border: '3px solid #00897b',
                          background: '#e0f2f1',
                          color: '#263238',
                          boxShadow: '0 6px 18px rgba(0,137,123,0.18)',
                        }}
                        inactiveStyle={{
                          border: '2px solid #cfd8dc',
                          background: '#fafafa',
                          color: '#263238',
                        }}
                      >
                        <Pictogram src={option.iconSrc} size={72} alt={option.label} />
                        <div style={{ fontSize: '22px', lineHeight: 1.25 }}>{option.label}</div>
                      </ChoiceCard>
                    );
                  })}
                </div>
              </>
            )}
            {badAt(5) && (
              <>
                <div style={{ fontSize: '20px', color: '#37474f', fontWeight: 'bold' }}>{isEdit ? '5' : '6'}) 時間帯を選ぶ（1つ）</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                  {TIME_TAG_OPTIONS.map((option) => {
                    const active = timeTag === option.label;
                    return (
                      <ChoiceCard
                        key={option.label}
                        onClick={() => setTimeTag(option.label)}
                        active={active}
                        minHeight="140px"
                        activeStyle={{
                          border: '3px solid #3949ab',
                          background: '#e8eaf6',
                          color: '#1a237e',
                          boxShadow: '0 6px 18px rgba(57,73,171,0.18)',
                        }}
                        inactiveStyle={{
                          border: '2px solid #c5cae9',
                          background: '#fafafa',
                          color: '#1a237e',
                        }}
                      >
                        <Pictogram src={option.iconSrc} size={72} alt={option.label} />
                        <div style={{ fontSize: '22px', lineHeight: 1.25 }}>{option.label}</div>
                      </ChoiceCard>
                    );
                  })}
                </div>
              </>
            )}
            {(goodCommentAt || badAt(6)) && (
              <>
                {postKind === 'bad' && (
                  <>
                    <div style={{ fontSize: '20px', color: '#37474f', fontWeight: 'bold' }}>{isEdit ? '6' : '7'}) 深刻度を選ぶ</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {SEVERITY_OPTIONS.map((opt) => {
                        const active = severity === opt.id;
                        return (
                          <ChoiceCard
                            key={opt.id}
                            onClick={() => setSeverity(opt.id)}
                            active={active}
                            minHeight="120px"
                            activeStyle={{
                              width: '100%',
                              border: '3px solid #ef6c00',
                              background: '#fff3e0',
                              color: '#e65100',
                              boxShadow: '0 6px 18px rgba(239,108,0,0.18)',
                            }}
                            inactiveStyle={{
                              width: '100%',
                              border: '2px solid #ffe0b2',
                              background: '#fffaf3',
                              color: '#e65100',
                            }}
                          >
                            <Pictogram src={opt.iconSrc} size={72} alt={opt.label} />
                            <div style={{ fontSize: '26px', lineHeight: 1.25 }}>{opt.label}</div>
                          </ChoiceCard>
                        );
                      })}
                    </div>
                  </>
                )}
                <div style={{ fontSize: '16px', color: '#37474f', fontWeight: 'bold', marginTop: postKind === 'bad' ? '4px' : 0 }}>
                  {postKind === 'good'
                    ? `${isEdit ? '2' : '3'}) 良いと感じた理由（任意）`
                    : (requireBadNarrative ? 'どう感じたか・なぜ困るか（10字以上・必須）' : '補足コメント（任意）')}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={postKind === 'good'
                    ? 'なぜ良い場所だと感じましたか？'
                    : (requireBadNarrative ? '例：段差が高くて車椅子では一人では上がれない、など' : '補足があれば書いてください（任意）')}
                  style={{
                    width: '100%',
                    minHeight: '140px',
                    padding: '20px',
                    borderRadius: '18px',
                    border: '2px solid #cfd8dc',
                    fontSize: '18px',
                    lineHeight: 1.45,
                    boxSizing: 'border-box',
                    resize: 'none',
                  }}
                />
              </>
            )}
            <div style={{ display: 'flex', gap: '14px', marginTop: currentStep >= 2 ? '4px' : 0 }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  style={{
                    flex: 1,
                    padding: '20px',
                    borderRadius: '20px',
                    background: '#eceff1',
                    border: '2px solid #cfd8dc',
                    color: '#455a64',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    cursor: 'pointer',
                    minHeight: '60px',
                  }}
                >
                  戻る
                </button>
              )}
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
                  disabled={!canProceed()}
                  style={{
                    flex: 2,
                    padding: '20px',
                    borderRadius: '20px',
                    background: canProceed() ? '#42a5f5' : '#b0bec5',
                    border: 'none',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    cursor: canProceed() ? 'pointer' : 'not-allowed',
                    minHeight: '60px',
                  }}
                >
                  次へ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitPost}
                  disabled={!canProceed()}
                  style={{
                    flex: 2,
                    padding: '20px',
                    borderRadius: '20px',
                    background: canProceed() ? '#f5a623' : '#b0bec5',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: canProceed() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    minHeight: '60px',
                  }}
                >
                  <Send size={24} />
                  {isEdit ? '保存する' : (postKind === 'good' ? copy.goodSubmit : copy.badSubmit)}
                </button>
              )}
            </div>
          </div>
        </PhotoPinSurface>
      )}
    </div>
  );
};
