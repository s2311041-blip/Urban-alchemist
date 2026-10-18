import React, { useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Camera, ChevronLeft, Map as MapIcon } from 'lucide-react';
import {
  KOTO_CENTER,
  KOTO_MAP_ZOOM,
} from '../constants/kotoArea';
import { AR_THEME } from '../constants/arTheme';
import { createArMapClusterIcon, createArMapPinIcon } from '../utils/arMapPinIcon';
import { CLUSTER_MAX_ZOOM, clusterAnnotations } from '../utils/mapClusters';
import { ArPinCard } from './ArPinCard';
import { ArLiveView } from './ArLiveView';
import { BoundsLock } from './ArMapBoundsLock';

function ClusteredMarkers({ pins, onSelect }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({
    zoomend() {
      setZoom(map.getZoom());
    },
  });
  const groups = useMemo(() => clusterAnnotations(pins, zoom), [pins, zoom]);

  return groups.map((group) => {
    const clustered = group.items.length > 1;
    return (
      <Marker
        key={group.id}
        position={[group.lat, group.lng]}
        icon={clustered
          ? createArMapClusterIcon(group.items.length)
          : createArMapPinIcon(group.items[0].kind)}
        eventHandlers={{
          click: () => {
            if (!clustered) {
              onSelect(group.items[0]);
              return;
            }
            const nextZoom = Math.min(18, Math.max(zoom + 2, CLUSTER_MAX_ZOOM + 1));
            map.flyTo([group.lat, group.lng], nextZoom);
          },
        }}
      />
    );
  });
}

/**
 * 地図ハブ：ピン位置の確認 + タップで詳細 + かざして見る
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

  const pins = annotations.filter((a) => a.worldPin);

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
          戻る
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: AR_THEME.accent }}>地図</div>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>みんなのピン（地図）</div>
        </div>
        <button
          type="button"
          onClick={() => setPanel('camera')}
          style={{ ...headerBtnStyle, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}
          title="かざして見る"
        >
          <Camera size={16} />
          かざして見る
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
        近くの投稿は数字の丸にまとまります。丸をタップすると拡大し、ピンをタップすると記録を読めます。
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
          <ClusteredMarkers pins={pins} onSelect={setCardPin} />
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
