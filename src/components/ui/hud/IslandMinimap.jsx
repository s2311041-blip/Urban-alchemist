import React from 'react';
import { MapPin } from 'lucide-react';

const seaStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(165deg, rgba(13, 71, 161, 0.55) 0%, rgba(2, 119, 189, 0.35) 45%, rgba(0, 96, 100, 0.4) 100%)',
};

const islandRectStyle = (kind) => ({
  position: 'absolute',
  borderRadius: '6px',
  boxSizing: 'border-box',
  background: kind === 'remote'
    ? 'rgba(41, 182, 246, 0.72)'
    : 'rgba(129, 199, 132, 0.82)',
  border: kind === 'remote'
    ? '1px solid rgba(187, 222, 251, 0.9)'
    : '1px solid rgba(56, 142, 60, 0.85)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  pointerEvents: 'none',
});

/**
 * @param {object} props
 * @param {ReturnType<import('../../../utils/mapProjection').buildIslandMapProjection>} props.mapData
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {{ x: number, y: number } | null} [props.playerDot]
 * @param {{ x: number, y: number } | null} [props.boatDot]
 * @param {{ x: number, y: number } | null} [props.pinNorm]
 * @param {(event: React.MouseEvent<HTMLDivElement>) => void} [props.onMapClick]
 */
export const IslandMinimap = ({
  mapData,
  width = 240,
  height = 160,
  playerDot = null,
  boatDot = null,
  pinNorm = null,
  onMapClick,
}) => {
  if (!mapData?.groups) return null;

  const { main, remotes } = mapData.groups;

  return (
    <div
      role={onMapClick ? 'button' : 'img'}
      aria-label="島の地図"
      onClick={onMapClick}
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.12)',
        cursor: onMapClick ? 'crosshair' : 'default',
      }}
    >
      <div style={seaStyle} />
      {main && (
        <div
          style={{
            ...islandRectStyle('main'),
            left: `${main.rect.left}%`,
            top: `${main.rect.top}%`,
            width: `${main.rect.width}%`,
            height: `${main.rect.height}%`,
          }}
          title={main.label}
        />
      )}
      {remotes.map((island) => (
        <div
          key={island.id}
          style={{
            ...islandRectStyle('remote'),
            left: `${island.rect.left}%`,
            top: `${island.rect.top}%`,
            width: `${island.rect.width}%`,
            height: `${island.rect.height}%`,
          }}
          title={`${island.label}（${island.direction}）`}
        />
      ))}
      {playerDot && (
        <div
          style={{
            position: 'absolute',
            left: `${playerDot.x * 100}%`,
            top: `${playerDot.y * 100}%`,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#ffee58',
            boxShadow: '0 0 8px rgba(255, 238, 88, 0.8)',
            pointerEvents: 'none',
          }}
          title="いまの位置"
        />
      )}
      {boatDot && (
        <div
          style={{
            position: 'absolute',
            left: `${boatDot.x * 100}%`,
            top: `${boatDot.y * 100}%`,
            width: '8px',
            height: '8px',
            borderRadius: '2px',
            transform: 'translate(-50%, -50%)',
            background: '#80deea',
            pointerEvents: 'none',
          }}
          title="船"
        />
      )}
      {pinNorm && (
        <div
          style={{
            position: 'absolute',
            left: `${pinNorm.x * 100}%`,
            top: `${pinNorm.y * 100}%`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            color: '#ff5252',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          }}
        >
          <MapPin size={32} fill="#ff5252" stroke="#fff" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
};

export const IslandMapLegend = ({ mapData }) => {
  if (!mapData?.groups) return null;
  const { main, remotes } = mapData.groups;
  const lines = [];
  if (main) {
    lines.push(`本島: ${main.chunkCount}チャンク`);
  }
  remotes.forEach((r) => {
    lines.push(`${r.label}: 海の${r.direction}（${r.chunkCount}チャンク）`);
  });
  if (lines.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: '10px', color: '#90a4ae' }}>島データがありません</p>
    );
  }
  return (
    <ul style={{
      margin: '8px 0 0',
      padding: '8px 10px',
      listStyle: 'none',
      fontSize: '10px',
      color: '#cfd8dc',
      lineHeight: 1.55,
      background: 'rgba(0,0,0,0.35)',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
    >
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
      <li style={{ marginTop: '4px', color: '#78909c', fontSize: '9px', lineHeight: 1.45 }}>
        <span style={{ color: '#aed581' }}>■</span>
        {' '}
        本島（拡張でチャンク数・面積が増える）
        {' · '}
        <span style={{ color: '#4fc3f7' }}>■</span>
        {' '}
        離島（出現後に表示）
      </li>
    </ul>
  );
};
