import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { ChevronLeft } from 'lucide-react';
import {
  KOTO_CENTER,
  KOTO_MAP_ZOOM,
  isInsideKotoBounds,
} from '../constants/kotoArea';
import { AR_THEME } from '../constants/arTheme';
import { createArMapPinIcon, createArMapUserIcon } from '../utils/arMapPinIcon';
import { BoundsLock } from './ArMapBoundsLock';

function MapClickPlace({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * 地図上でピン位置を指定（タップ or ドラッグ）
 */
export function ArMapPinPicker({
  userGeo,
  initialPin,
  onConfirm,
  onCancel,
}) {
  const start = initialPin ?? userGeo ?? KOTO_CENTER;
  const [pin, setPin] = useState(start);

  const valid = isInsideKotoBounds(pin.lat, pin.lng);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 220,
      background: AR_THEME.bg,
      display: 'flex',
      flexDirection: 'column',
    }}
    >
      <header style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        color: AR_THEME.text,
      }}
      >
        <button type="button" onClick={onCancel} style={headerBtnStyle}>
          <ChevronLeft size={20} />
          戻る
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: AR_THEME.accent }}>位置の指定</div>
          <div style={{ fontWeight: 'bold' }}>地図で刺す（精度◎）</div>
        </div>
      </header>

      <p style={{
        margin: 0,
        padding: '10px 16px',
        fontSize: 13,
        color: AR_THEME.muted,
        lineHeight: 1.45,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      >
        地図をタップ、または赤ピンをドラッグして場所を合わせてください。
      </p>

      <div style={{ flex: 1, minHeight: 0 }}>
        <MapContainer
          center={[start.lat, start.lng]}
          zoom={KOTO_MAP_ZOOM + 2}
          style={{ height: '100%', width: '100%' }}
        >
          <BoundsLock />
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickPlace onPick={setPin} />
          {userGeo && (
            <Marker
              position={[userGeo.lat, userGeo.lng]}
              icon={createArMapUserIcon()}
            />
          )}
          <Marker
            position={[pin.lat, pin.lng]}
            icon={createArMapPinIcon('barrier')}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                setPin({ lat, lng });
              },
            }}
          />
        </MapContainer>
      </div>

      <div style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {!valid && (
          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#ffb74d' }}>
            江東区外です。ピンを区内に移動してください。
          </p>
        )}
        <button
          type="button"
          disabled={!valid}
          onClick={() => onConfirm(pin)}
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 14,
            border: 'none',
            background: valid ? AR_THEME.accent : 'rgba(255,255,255,0.12)',
            color: valid ? '#0d1b2a' : AR_THEME.muted,
            fontWeight: 'bold',
            fontSize: 16,
            cursor: valid ? 'pointer' : 'not-allowed',
          }}
        >
          この位置に刺す
        </button>
      </div>
    </div>
  );
}

const headerBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  background: 'rgba(255,255,255,0.08)',
  border: 'none',
  borderRadius: 12,
  padding: '8px 12px',
  color: AR_THEME.text,
  cursor: 'pointer',
  fontSize: 14,
};
