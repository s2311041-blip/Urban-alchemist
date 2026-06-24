import React, { useMemo } from 'react';
import { Map } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { buildIslandMapProjection } from '../../../utils/mapProjection';
import { SIDE_PANEL_WIDTH, hudPanelStyleMap } from './hudPanelStyles';
import { IslandMapLegend, IslandMinimap } from './IslandMinimap';

const MAP_WIDTH = SIDE_PANEL_WIDTH - 20;
const MAP_HEIGHT = 168;

export const WorldMapPanel = () => {
  const open = useGameStore((state) => state.isWorldMapOpen);
  const setIsWorldMapOpen = useGameStore((state) => state.setIsWorldMapOpen);
  const islandChunks = useGameStore((state) => state.islandChunks);
  const mapPlayerPos = useGameStore((state) => state.mapPlayerPos);
  const mapBoatPos = useGameStore((state) => state.mapBoatPos);

  const mapData = useMemo(
    () => buildIslandMapProjection(islandChunks),
    [islandChunks],
  );

  const playerDot = mapData && Array.isArray(mapPlayerPos)
    ? mapData.project(mapPlayerPos[0] ?? 0, mapPlayerPos[1] ?? 0)
    : null;
  const boatDot = mapData && Array.isArray(mapBoatPos)
    ? mapData.project(mapBoatPos[0] ?? 0, mapBoatPos[1] ?? 0)
    : null;

  return (
    <div style={hudPanelStyleMap({
      background: 'rgba(5, 12, 25, 0.82)',
      border: '1px solid rgba(0, 229, 255, 0.28)',
      color: '#e9f8ff',
    })}
    >
      <button
        type="button"
        onClick={() => setIsWorldMapOpen(!open)}
        style={{
          width: '100%',
          border: 'none',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.06)',
          color: '#eaf4ff',
          padding: '7px 8px',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
        }}
      >
        <Map size={13} />
        {open ? '地図を閉じる' : '地図を開く'}
      </button>

      {open && mapData && (
        <div style={{ marginTop: '8px' }}>
          <IslandMinimap
            mapData={mapData}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            playerDot={playerDot}
            boatDot={boatDot}
          />
          <IslandMapLegend mapData={mapData} />
        </div>
      )}
    </div>
  );
};
