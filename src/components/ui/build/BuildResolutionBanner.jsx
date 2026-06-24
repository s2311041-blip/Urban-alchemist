import React, { useMemo } from 'react';
import { getPlanHint, getScaleUi, PLAN_LABEL } from '../../../constants/barrierData';
import { evaluateActiveBuildResolution } from '../../../utils/barrierActions';
import { findBugById } from '../../../utils/bugIds';
import { useGameStore } from '../../../store/useGameStore';

/** 不満解決建築: 画面上部の条件達成バナー */
export const BuildResolutionBanner = () => {
  const buildMode = useGameStore((s) => s.buildMode);
  const bugs = useGameStore((s) => s.bugs);
  const placedBlocks = useGameStore((s) => s.placedBlocks);
  const islandChunks = useGameStore((s) => s.islandChunks);
  const ferryRoutes = useGameStore((s) => s.ferryRoutes);
  const buildFinishError = useGameStore((s) => s.buildFinishError);

  const activeBuildBug = useMemo(
    () => (buildMode && buildMode !== 'free' ? findBugById(bugs, buildMode) : null),
    [buildMode, bugs],
  );
  const activeBuildPlan = activeBuildBug?.chosenPlan ?? null;
  const activeBuildScale = getScaleUi(activeBuildBug?.scale);
  const buildCheck = useMemo(
    () => (buildMode && buildMode !== 'free'
      ? evaluateActiveBuildResolution(buildMode, bugs, placedBlocks, { islandChunks, ferryRoutes })
      : null),
    [buildMode, bugs, ferryRoutes, islandChunks, placedBlocks],
  );

  if (!buildMode || buildMode === 'free' || !activeBuildBug) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '18px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1200,
      width: 'min(580px, calc(100vw - 90px))',
      background: 'rgba(6, 16, 30, 0.92)',
      border: `1px solid ${buildCheck?.ok ? 'rgba(129, 199, 132, 0.6)' : 'rgba(255, 183, 77, 0.65)'}`,
      borderRadius: '14px',
      padding: '10px 12px',
      boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
      color: '#eaf4ff',
      backdropFilter: 'blur(6px)',
      pointerEvents: 'none',
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#b3e5fc', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ background: activeBuildScale.bg, color: '#fff', padding: '2px 8px', borderRadius: '999px', fontSize: '11px' }}>
            {activeBuildScale.label}
          </span>
          <span>
            解決型:
            {' '}
            {activeBuildPlan ? (PLAN_LABEL[activeBuildPlan] ?? activeBuildPlan) : '未選択'}
          </span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: buildCheck?.ok ? '#c8f7c5' : '#ffd180' }}>
          {buildCheck?.ok ? '条件達成: 完了できます' : '条件未達: まだ完了できません'}
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(235,245,255,0.92)', lineHeight: 1.35 }}>
        {activeBuildPlan ? getPlanHint(activeBuildPlan, activeBuildBug?.scale) : '先に不満画面で解決型を選択してください。'}
      </div>
      {!buildCheck?.ok && (
        <div style={{ fontSize: '11px', color: '#ffe0b2', marginTop: '5px', lineHeight: 1.35 }}>
          未達理由:
          {' '}
          {buildCheck?.message}
        </div>
      )}
      {buildFinishError && (
        <div style={{ fontSize: '11px', color: '#ffab91', marginTop: '5px', lineHeight: 1.35, fontWeight: 'bold' }}>
          完成できませんでした:
          {' '}
          {buildFinishError}
        </div>
      )}
    </div>
  );
};
