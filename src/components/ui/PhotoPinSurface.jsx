import React, { useRef } from 'react';
import { MapPin, X } from 'lucide-react';

const MAX_PINS = 5;
const clampNorm = (value) => Math.min(0.96, Math.max(0.04, value));

/**
 * 写真上の空間注釈ピン（正規化座標 0–1）
 * dragOnly=true のとき中央ピンをドラッグで微調整。通常はタップ追加・タップ削除。
 */
export const PhotoPinSurface = ({
  imageUrl,
  pins = [],
  onChange,
  editable = false,
  dragOnly = false,
  height = '100%',
  minHeight,
  backgroundFit = 'cover',
  pinSize,
  showEditHint = true,
  overlayBottom,
  children,
}) => {
  const containerRef = useRef(null);
  const dragIdRef = useRef(null);
  const useContainLayout = backgroundFit === 'contain' && !!imageUrl;

  const pointToNorm = (clientX, clientY) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      nx: clampNorm((clientX - rect.left) / rect.width),
      ny: clampNorm((clientY - rect.top) / rect.height),
    };
  };

  const handleSurfaceClick = (event) => {
    if (!editable || dragOnly || !onChange || !containerRef.current) return;
    if (event.target.closest('[data-photo-pin]')) return;
    if (pins.length >= MAX_PINS) return;
    const next = pointToNorm(event.clientX, event.clientY);
    if (!next) return;
    onChange([
      ...pins,
      { id: `pin_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, ...next },
    ]);
  };

  const movePin = (pinId, clientX, clientY) => {
    const next = pointToNorm(clientX, clientY);
    if (!next || !onChange) return;
    onChange(pins.map((pin) => (pin.id === pinId ? { ...pin, ...next } : pin)));
  };

  const markerSize = pinSize ?? (editable ? 28 : 32);

  const pinButtons = pins.map((pin, index) => (
    <button
      key={pin.id ?? `pin-${index}`}
      type="button"
      data-photo-pin
      onClick={(event) => {
        event.stopPropagation();
        if (dragOnly) return;
        if (editable && onChange) onChange(pins.filter((item) => item.id !== pin.id));
      }}
      onPointerDown={(event) => {
        if (!editable || !dragOnly) return;
        event.preventDefault();
        event.stopPropagation();
        dragIdRef.current = pin.id;
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (dragIdRef.current !== pin.id) return;
        movePin(pin.id, event.clientX, event.clientY);
      }}
      onPointerUp={() => {
        dragIdRef.current = null;
      }}
      title={dragOnly ? 'ドラッグして位置を調整' : editable ? 'タップで削除' : `注目点 ${index + 1}`}
      style={{
        position: 'absolute',
        left: `${(pin.nx ?? 0.5) * 100}%`,
        top: `${(pin.ny ?? 0.5) * 100}%`,
        transform: 'translate(-50%, -100%)',
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: editable ? (dragOnly ? 'grab' : 'pointer') : 'default',
        touchAction: dragOnly ? 'none' : undefined,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))',
        zIndex: 2,
      }}
    >
      <MapPin size={markerSize} color="#ff5252" fill="#ff5252" strokeWidth={1.5} />
      {!dragOnly && (
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: 6,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.72)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 8,
            padding: '2px 6px',
            whiteSpace: 'nowrap',
          }}
        >
          {index + 1}
        </span>
      )}
    </button>
  ));

  if (useContainLayout) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height,
          minHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          overflow: 'hidden',
        }}
      >
        <div
          ref={containerRef}
          onClick={handleSurfaceClick}
          style={{
            position: 'relative',
            lineHeight: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            cursor: editable ? (dragOnly ? 'default' : 'crosshair') : 'default',
          }}
        >
          <img
            src={imageUrl}
            alt=""
            style={{
              display: 'block',
              maxWidth: '100vw',
              maxHeight: '100vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
          {pinButtons}
        </div>
        {overlayBottom}
        {children && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={handleSurfaceClick}
      style={{
        position: 'relative',
        width: '100%',
        height,
        minHeight,
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#263238',
        overflow: 'hidden',
        cursor: editable ? (dragOnly ? 'default' : 'crosshair') : 'default',
      }}
    >
      {pinButtons}
      {editable && showEditHint && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            zIndex: 3,
            background: 'rgba(0,0,0,0.55)',
            color: '#fff',
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: 10,
            lineHeight: 1.4,
          }}
        >
          {dragOnly
            ? 'ピンをドラッグして、気になる位置へ動かしてください。'
            : `気になる場所をタップしてピン（最大${MAX_PINS}個）。ピンをタップで削除。`}
        </div>
      )}
      {overlayBottom}
      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const PhotoPinStrip = ({ pins, onClear }) => {
  if (!pins?.length) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#546e7a' }}>
      <span>注目ピン {pins.length} 件</span>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          style={{
            border: '1px solid #cfd8dc',
            background: '#fff',
            borderRadius: 8,
            padding: '4px 8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <X size={14} />
          すべて削除
        </button>
      )}
    </div>
  );
};
