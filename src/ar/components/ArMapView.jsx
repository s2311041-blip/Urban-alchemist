import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Camera, ChevronLeft, Map as MapIcon } from 'lucide-react';
import {
  KOTO_CENTER,
  KOTO_MAP_ZOOM,
  isInsideKotoBounds,
} from '../constants/kotoArea';
import { AR_THEME } from '../constants/arTheme';
import { createArMapPinIcon } from '../utils/arMapPinIcon';
import { ArPinCard } from './ArPinCard';
import { ArLiveView } from './ArLiveView';
import { BoundsLock } from './ArMapBoundsLock';

/**
 * 地図ハブ：ピン位置の確認 + タップで視点置換 + 任意でカメラAR
 */
export function ArMapView({
  annotations = [],
  authorId,
  onClose,
  onEditMine,
  initialPinId = null,
}) {
  const [panel, setPanel] = useState('map');
  const [cardPin, setCardPin] = useState(() => {
    if (!initialPinId) return null;
    return annotations.find((a) => a.id === initialPinId) ?? null;
  });

  const pins = annotations.filter((a) => a.worldPin && isInsideKotoBounds(a.worldPin.lat, a.worldPin.lng));

  if (panel === 'camera') {
    return (
      <ArLiveView
        annotations={annotations}
        authorId={authorId}
        mode="view"
        onClose={() => setPanel('map')}
      />
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: AR_THEME.bg, display: 'flex', flexDirection: 'column' }}>
      <header style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: AR_THEME.text,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        gap: 8,
      }}
      >
        <button type="button" onClick={onClose} style={headerBtnStyle}>
          <ChevronLeft size={20} />
          ホーム
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: AR_THEME.accent }}>東京都江東区</div>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>地図で見る</div>
        </div>
        <button type="button" onClick={() => setPanel('camera')} style={headerBtnStyle} title="現地で見る（任意）">
          <Camera size={20} />
        </button>
      </header>

      <p style={{
        margin: 0,
        padding: '8px 16px',
        fontSize: 12,
        color: AR_THEME.muted,
        lineHeight: 1.45,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
      >
        <MapIcon size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
        ピンをタップ → 記録を読む。カメラは任意です。
      </p>

      <div style={{ flex: 1, minHeight: 0 }}>
        <MapContainer
          center={[KOTO_CENTER.lat, KOTO_CENTER.lng]}
          zoom={KOTO_MAP_ZOOM}
          style={{ height: '100%', width: '100%' }}
        >
          <BoundsLock />
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pins.map((a) => (
            <Marker
              key={a.id}
              position={[a.worldPin.lat, a.worldPin.lng]}
              icon={createArMapPinIcon(a.kind)}
              eventHandlers={{
                click: () => setCardPin(a),
              }}
            />
          ))}
        </MapContainer>
      </div>

      {cardPin && (
        <ArPinCard
          annotation={cardPin}
          authorId={authorId}
          onClose={() => setCardPin(null)}
          onEdit={cardPin.isMine || cardPin.authorId === authorId
            ? () => {
              setCardPin(null);
              onEditMine?.(cardPin);
            }
            : undefined}
        />
      )}
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
