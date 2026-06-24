import React from 'react';
import { controlsGuidePanelStyle } from './hudPanelStyles';
import { useInputProfile } from '../../../utils/useInputProfile';
import { useGameStore } from '../../../store/useGameStore';

const Row = ({ keys, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
    <span style={{ color: '#ccc', flexShrink: 0 }}>{keys}</span>
    <span style={{ textAlign: 'right' }}>{action}</span>
  </div>
);

export const ControlsGuidePanel = ({ viewMode }) => {
  const inputProfile = useInputProfile();
  const isTouch = inputProfile === 'touch';
  const isWorldMapOpen = useGameStore((s) => s.isWorldMapOpen);

  if (isWorldMapOpen) return null;

  return (
    <div style={{
      ...controlsGuidePanelStyle({
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.6)',
        color: 'white',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }),
    }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
        🎮 操作ガイド ({viewMode === 'tps' ? 'アバター' : '神様'})
        {isTouch ? ' · スマホ' : ''}
      </div>

      {isTouch ? (
        viewMode === 'tps' ? (
          <>
            <Row keys="スワイプ" action="視点の回転" />
            <Row keys="ピンチ" action="ズーム" />
            <Row keys="下部メニュー" action="建築・街の記録（AR）" />
            <Row keys="乗り物台の上" action="Eでホバーボード" />
            <div style={{
              marginTop: '4px',
              padding: '8px 0 0',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              fontSize: '11px',
              color: '#b0bec5',
              lineHeight: 1.45,
            }}
            >
              街の記録（投稿）はスマホ向けです。島内の歩き回りは現状PC向け（キーボード）で、タッチ用の移動UIは今後追加予定です。
            </div>
          </>
        ) : (
          <>
            <Row keys="ドラッグ" action="カメラ移動" />
            <Row keys="ピンチ" action="ズーム" />
          </>
        )
      ) : (
        viewMode === 'tps' ? (
          <>
            <Row keys="矢印" action="キャラ/乗り物の移動" />
            <Row keys="Space" action="ジャンプ" />
            <Row keys="E（停船所）" action="船の出し入れ" />
            <Row keys="E（乗り物台）" action="ホバーボード乗降" />
            <Row keys="左・右ドラッグ" action="視点の回転" />
          </>
        ) : (
          <>
            <Row keys="左ドラッグ" action="カメラの移動(Pan)" />
            <Row keys="右ドラッグ" action="カメラの回転" />
          </>
        )
      )}

      {!isTouch && viewMode === 'tps' && (
        <Row keys="スクロール" action="ズーム（細かく調整）" />
      )}
      {!isTouch && viewMode !== 'tps' && (
        <Row keys="スクロール" action="ズーム" />
      )}
    </div>
  );
};
