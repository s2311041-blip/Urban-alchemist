import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { buildIslandMapProjection } from '../../utils/mapProjection';
import { IslandMinimap } from './hud/IslandMinimap';

export const MapPinPicker = ({ onConfirm, onCancel }) => {
  const islandChunks = useGameStore((s) => s.islandChunks);
  const mapPlayerPos = useGameStore((s) => s.mapPlayerPos);

  const mapData = useMemo(
    () => buildIslandMapProjection(islandChunks),
    [islandChunks],
  );

  const [pinNorm, setPinNorm] = useState(null);

  const playerDot = useMemo(() => {
    if (!mapData || !Array.isArray(mapPlayerPos)) return null;
    return mapData.project(mapPlayerPos[0] ?? 0, mapPlayerPos[1] ?? 0);
  }, [mapData, mapPlayerPos]);

  const handleMapClick = (event) => {
    if (!mapData) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    setPinNorm({ x: nx, y: ny });
  };

  const handleConfirm = () => {
    if (!mapData || !pinNorm) return;
    const world = mapData.unproject(pinNorm.x, pinNorm.y);
    onConfirm([world.x, world.z]);
  };

  if (!mapData) {
    return (
      <div style={{ color: 'white', padding: 24, textAlign: 'center' }}>
        島データがありません
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: '#0a1628',
      display: 'flex',
      flexDirection: 'column',
      color: '#e9f8ff',
    }}
    >
      <button
        type="button"
        onClick={onCancel}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          background: 'rgba(0,0,0,0.5)',
          border: 'none',
          borderRadius: '50%',
          padding: 10,
          cursor: 'pointer',
          color: 'white',
          zIndex: 2,
        }}
      >
        <X size={28} />
      </button>

      <div style={{ padding: '72px 24px 16px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>記録する場所を選ぶ</h2>
        <p style={{ margin: '10px 0 0', fontSize: 14, color: '#90a4ae', lineHeight: 1.5 }}>
          地図をタップしてピンを置いてください（訪問時に撮った写真を次に選びます）
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 24px 24px' }}>
        <IslandMinimap
          mapData={mapData}
          width={Math.min(360, typeof window !== 'undefined' ? window.innerWidth * 0.92 : 360)}
          height={Math.min(320, typeof window !== 'undefined' ? window.innerHeight * 0.52 : 320)}
          playerDot={playerDot}
          pinNorm={pinNorm}
          onMapClick={handleMapClick}
        />
      </div>

      <div style={{ padding: '0 24px 32px', display: 'flex', gap: 12 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 16,
            border: '2px solid #546e7a',
            background: '#37474f',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          戻る
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!pinNorm}
          style={{
            flex: 2,
            padding: 16,
            borderRadius: 16,
            border: 'none',
            background: pinNorm ? '#00897b' : '#546e7a',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
            cursor: pinNorm ? 'pointer' : 'not-allowed',
          }}
        >
          この場所で記録
        </button>
      </div>
    </div>
  );
};
