import React, { useMemo } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import {
  DEFAULT_ISLAND_SATISFACTION,
  MIN_ISLAND_SATISFACTION,
  SATISFACTION_ATTRS,
} from '../../../constants/satisfactionAttributes';
import { previewIslandSatisfaction, getPlanPreviewDeltas } from '../../../utils/planSatisfaction';
import { SatisfactionGaugePanel } from './SatisfactionGaugePanel';
import { hudPanelStyle } from '../hud/hudPanelStyles';

/**
 * 島満足度ブロック（通常HUD・不満オーバーレイ共通）
 * @param previewNeedType needType for plan preview
 * @param previewPlanId selected plan id — 指定時はプレビュー表示
 */
export function IslandSatisfactionBlock({
  previewNeedType = null,
  previewPlanId = null,
  compact = true,
  variant = 'hud',
}) {
  const islandSatisfaction = useGameStore(
    (s) => s.islandSatisfaction ?? DEFAULT_ISLAND_SATISFACTION,
  );
  const remainingBudget = useGameStore((s) => s.remainingBudget ?? 0);

  const preview = useMemo(() => {
    if (!previewNeedType || !previewPlanId) return null;
    return previewIslandSatisfaction(islandSatisfaction, {
      needType: previewNeedType,
      planId: previewPlanId,
    });
  }, [islandSatisfaction, previewNeedType, previewPlanId]);

  const effect = previewNeedType && previewPlanId
    ? getPlanPreviewDeltas(previewNeedType, previewPlanId)
    : null;

  const minSat = Math.min(...SATISFACTION_ATTRS.map((a) => islandSatisfaction[a.key] ?? 0));
  const isCritical = minSat < MIN_ISLAND_SATISFACTION;
  const isPreview = !!preview;

  const shellStyle = variant === 'overlay'
    ? {
      marginBottom: 12,
      padding: '10px 12px',
      borderRadius: 12,
      background: 'rgba(0,0,0,0.5)',
      border: isPreview
        ? '1px solid rgba(255,202,40,0.45)'
        : '1px solid rgba(129,199,132,0.35)',
    }
    : hudPanelStyle({
      background: isCritical ? 'rgba(40, 12, 12, 0.92)' : 'rgba(5, 12, 25, 0.9)',
      border: isCritical
        ? '1px solid rgba(239, 83, 80, 0.55)'
        : '1px solid rgba(129, 199, 132, 0.45)',
      color: '#eceff1',
      boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
    });

  const titleColor = isPreview ? '#ffca28' : (isCritical ? '#ef9a9a' : '#a5d6a7');

  return (
    <div style={shellStyle} data-testid="island-satisfaction-block">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 8,
        flexWrap: 'wrap',
      }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: titleColor }}>
          {isPreview ? '島全体の満足度（選択中プラン）' : '島全体の満足度（現在）'}
          {effect?.budgetCost != null && isPreview && (
            <span style={{ color: '#90a4ae', fontWeight: 500, marginLeft: 8 }}>
              施策コスト
              {' '}
              {effect.budgetCost}
              {' '}
              （固定）
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#90a4ae', fontWeight: 600 }}>
          残り予算
          {' '}
          <span style={{ color: '#ffca28', fontWeight: 700 }}>
            {remainingBudget}
          </span>
        </div>
      </div>
      <SatisfactionGaugePanel
        values={isPreview ? preview : islandSatisfaction}
        baseline={isPreview ? islandSatisfaction : null}
        compact={compact}
        showMinLine
        showNumericDetail
      />
    </div>
  );
}

/** 議会セッション中か（HUD表示判定） */
export function useConsensusHudVisible() {
  return true;
}
