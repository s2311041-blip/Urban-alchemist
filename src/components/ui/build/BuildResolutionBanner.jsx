import React, { useMemo } from 'react';
import { getPlanHint, getScaleUi, PLAN_LABEL } from '../../../constants/barrierData';
import { getPlanRepairScale } from '../../../constants/improvementConstraints';
import { evaluateActiveBuildResolution } from '../../../utils/barrierActions';
import { findBugById } from '../../../utils/bugIds';
import { getPlanBudgetCost } from '../../../utils/planSatisfaction';
import { useGameStore } from '../../../store/useGameStore';

const miniBar = (value, max, color) => (
  <div style={{
    height: 6,
    borderRadius: 3,
    background: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    flex: 1,
    minWidth: 72,
    maxWidth: 140,
  }}
  >
    <div style={{
      width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%`,
      height: '100%',
      background: color,
      transition: 'width 0.25s ease',
    }}
    />
  </div>
);

function BuildBudgetRow({
  buildSession,
  targetBug,
  remainingBudget,
  questDecisions,
}) {
  if (!buildSession) return null;

  const needType = targetBug?.needType ?? 'P';
  const policyCost = getPlanBudgetCost(needType, buildSession.plan);
  const remaining = remainingBudget ?? 0;
  const repair = getPlanRepairScale(buildSession.plan);
  const decision = targetBug?.sourceQuestId
    ? questDecisions?.[targetBug.sourceQuestId]
    : null;
  const blocksPlaced = decision?.blocksPlaced ?? buildSession.blockCount ?? 0;
  const blockColor = blocksPlaced >= repair.maxBlocks
    ? '#ef5350'
    : (blocksPlaced >= repair.maxBlocks - 2 ? '#ffb74d' : '#81c784');

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '10px 14px',
      marginTop: 8,
      paddingTop: 8,
      borderTop: '1px solid rgba(255,255,255,0.1)',
      fontSize: 11,
    }}
    >
      <span style={{ color: '#ffca28', fontWeight: 700 }}>
        残予算
        {' '}
        {remaining}
      </span>
      <span style={{ color: '#90a4ae' }}>
        施策
        {' '}
        -
        {policyCost}
        {' '}
        （確定時）
      </span>
      <span style={{ color: blockColor, fontWeight: 700 }}>
        修理
        {' '}
        {blocksPlaced}
        /
        {repair.maxBlocks}
        {' '}
        (
        {repair.label}
        )
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 120px' }}>
        {miniBar(blocksPlaced, repair.maxBlocks, blockColor)}
      </div>
    </div>
  );
}

/** 不満解決建築: 画面上部の条件・予算バナー */
export const BuildResolutionBanner = () => {
  const buildMode = useGameStore((s) => s.buildMode);
  const bugs = useGameStore((s) => s.bugs);
  const placedBlocks = useGameStore((s) => s.placedBlocks);
  const islandChunks = useGameStore((s) => s.islandChunks);
  const ferryRoutes = useGameStore((s) => s.ferryRoutes);
  const buildFinishError = useGameStore((s) => s.buildFinishError);
  const buildSession = useGameStore((s) => s.buildSession);
  const remainingBudget = useGameStore((s) => s.remainingBudget);
  const questDecisions = useGameStore((s) => s.questDecisions);

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
      width: 'min(580px, calc(100vw - 380px))',
      maxWidth: 'calc(100vw - 24px)',
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '4px',
      }}
      >
        <div style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#b3e5fc',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
        >
          <span style={{
            background: activeBuildScale.bg,
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '11px',
          }}
          >
            {activeBuildScale.label}
          </span>
          <span>
            解決型:
            {' '}
            {activeBuildPlan ? (PLAN_LABEL[activeBuildPlan] ?? activeBuildPlan) : '未選択'}
          </span>
        </div>
        <div style={{
          fontSize: '11px',
          fontWeight: 'bold',
          color: buildCheck?.ok ? '#c8f7c5' : '#ffd180',
          flexShrink: 0,
        }}
        >
          {buildCheck?.ok ? '条件達成: 完了できます' : '条件未達: まだ完了できません'}
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(235,245,255,0.92)', lineHeight: 1.35 }}>
        {activeBuildPlan
          ? getPlanHint(activeBuildPlan, activeBuildBug?.scale)
          : '先に不満画面で解決型を選択してください。'}
      </div>
      {!buildCheck?.ok && (
        <div style={{ fontSize: '11px', color: '#ffe0b2', marginTop: '5px', lineHeight: 1.35 }}>
          未達理由:
          {' '}
          {buildCheck?.message}
        </div>
      )}
        <BuildBudgetRow
          buildSession={buildSession}
          targetBug={activeBuildBug}
          remainingBudget={remainingBudget}
          questDecisions={questDecisions}
        />
      {buildFinishError && (
        <div style={{
          fontSize: '11px',
          color: '#ffab91',
          marginTop: '5px',
          lineHeight: 1.35,
          fontWeight: 'bold',
        }}
        >
          完成できませんでした:
          {' '}
          {buildFinishError}
        </div>
      )}
    </div>
  );
};
