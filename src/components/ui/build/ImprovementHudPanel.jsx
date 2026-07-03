import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { getMinStakeholderSatisfaction } from '../../../utils/improvementSession';
import { STAKEHOLDER_GROUPS } from '../../../constants/improvementConstraints';

import { getPlanHint } from '../../../constants/barrierData';
import { Hammer } from 'lucide-react';

const gaugeBar = (value, max, color) => (
  <div style={{
    height: 8,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    flex: 1,
  }}
  >
    <div style={{
      width: `${Math.min(100, (value / max) * 100)}%`,
      height: '100%',
      background: color,
      transition: 'width 0.25s ease',
    }}
    />
  </div>
);

/** 建築モード中の改善予算・ステークホルダー HUD（Phase 2-D） */
export const ImprovementHudPanel = () => {
  const buildMode = useGameStore((s) => s.buildMode);
  const buildSession = useGameStore((s) => s.buildSession);
  const isSeriousMode = useGameStore((s) => s.isSeriousMode);
  const bugs = useGameStore((s) => s.bugs);

  if (!buildMode || buildMode === 'free' || !buildSession) return null;

  const targetBug = bugs.find((b) => b.id === buildMode);
  const hintText = getPlanHint(buildSession.plan, targetBug?.scale ?? 'point');

  if (isSeriousMode) {
    return (
      <div style={{
        position: 'absolute',
        top: '88px',
        right: '20px',
        zIndex: 1190,
        width: 'min(260px, calc(100vw - 40px))',
        padding: '16px',
        borderRadius: '14px',
        background: 'rgba(6, 16, 30, 0.92)',
        border: '1px solid rgba(0, 229, 255, 0.45)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
        color: '#eaf4ff',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 12, fontWeight: 'bold', color: '#00e5ff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Hammer size={16} /> 改善のクリア条件
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: '#fff' }}>
          {hintText}
        </div>
      </div>
    );
  }

  const budgetRemaining = buildSession.budgetLimit - buildSession.budgetSpent;
  const budgetColor = budgetRemaining < 0 ? '#ef5350' : budgetRemaining <= 4 ? '#ffb74d' : '#81c784';
  const minSat = getMinStakeholderSatisfaction(buildSession.stakeholderSatisfaction);

  return (
    <div style={{
      position: 'absolute',
      top: '88px',
      right: '20px',
      zIndex: 1190,
      width: 'min(260px, calc(100vw - 40px))',
      padding: '12px 14px',
      borderRadius: '14px',
      background: 'rgba(6, 16, 30, 0.92)',
      border: '1px solid rgba(129, 199, 132, 0.45)',
      boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
      color: '#eaf4ff',
      backdropFilter: 'blur(6px)',
      pointerEvents: 'none',
    }}
    >
      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#a5d6a7', marginBottom: 8 }}>
        改善リソース
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span>改善予算</span>
          <span style={{ color: budgetColor, fontWeight: 'bold' }}>
            {budgetRemaining}
            {' '}
            /
            {' '}
            {buildSession.budgetLimit}
          </span>
        </div>
        {gaugeBar(buildSession.budgetSpent, buildSession.budgetLimit, budgetColor)}
        <div style={{ fontSize: 10, color: 'rgba(235,245,255,0.7)', marginTop: 4 }}>
          配置
          {' '}
          {buildSession.blockCount}
          {' '}
          ブロック · 使用
          {' '}
          {buildSession.budgetSpent}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
          <span>ステークホルダー</span>
          <span style={{ color: minSat < 30 ? '#ffb74d' : '#b3e5fc', fontWeight: 'bold' }}>
            最低
            {' '}
            {minSat}
          </span>
        </div>
        {STAKEHOLDER_GROUPS.slice(0, 4).map((group) => {
          const val = buildSession.stakeholderSatisfaction[group] ?? 50;
          return (
            <div key={group} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 9, width: 36, color: 'rgba(235,245,255,0.75)' }}>{group}</span>
              {gaugeBar(val, 100, val < 30 ? '#ffb74d' : '#64b5f6')}
            </div>
          );
        })}
      </div>
    </div>
  );
};
