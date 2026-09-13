import React, { useEffect, useMemo, useState } from 'react';
import { X, Trash2, Hammer, Pencil } from 'lucide-react';
import { useGameStore } from '../../../store/useGameStore';
import { PhotoPinSurface } from '../PhotoPinSurface';
import {
  getPlanHint,
  getScaleUi,
  NEED_CATEGORY_OPTIONS,
  PLAN_LABEL,
  PLAN_DESCRIPTION,
  SEVERITY_OPTIONS,
  TARGET_GROUP_ICON_BY_LABEL,
  TIME_TAG_ICON_BY_LABEL,
} from '../../../constants/barrierData';
import {
  FACTOR_STYLE,
  PLAN_CARD_ACCENT,
  BUG_REPORT_COPY,
  BUG_REPORT_STYLE,
  getPlaceArchetypeLabel,
  getScaleChipStyle,
  getFactorChipStyle,
  getNeedCategoryChipStyle,
  getTagLabelChipStyle,
  getDemographicChipStyle,
  getTimeTagChipStyle,
  getSeverityChipStyle,
  getAffectedGroupsChipStyle,
  getPlanGridStyle,
  getPlanCardStyle,
  getPlanOrdinalStyle,
} from '../../../constants/ui/bugReportOverlay';
import { Pictogram } from '../Pictogram';
import { getSelectablePlansForQuest } from '../../../constants/tradeoffMatrix';
import { getPlanRepairScale } from '../../../constants/improvementConstraints';
import {
  DEFAULT_BARRIER_META,
  TYPE_TO_BARRIER_META,
} from '../../../constants/barrierData';
import {
  getPlanContextDescription,
  getPlanContextLabel,
} from '../../../constants/planContextLabels';
import {
  getPlanPreviewDeltas,
} from '../../../utils/planSatisfaction';
import {
  PlanSatisfactionDeltas,
} from '../consensus/SatisfactionGaugePanel';
import { IslandSatisfactionBlock } from '../consensus/IslandSatisfactionBlock';
import { JokerPlanForm } from '../consensus/JokerPlanForm';
import {
  JOKER_BUDGET_MAX,
  JOKER_BUDGET_MIN,
  JOKER_PLAN_ID,
} from '../../../utils/jokerPlan';

const SEVERITY_LABEL = Object.fromEntries(
  SEVERITY_OPTIONS.map((opt) => [opt.id, opt.label]),
);
const SEVERITY_ICON = Object.fromEntries(
  SEVERITY_OPTIONS.map((opt) => [opt.id, opt.iconSrc]),
);
const IGNORE_PLAN_ID = 'ignore';
const JOKER_PLAN_LABEL = '独自案をつくる';
const JOKER_PLAN_DESCRIPTION = '型に当てはまらない案を、話し合って自分たちで設計します。';
const JOKER_PLAN_HINT = '予算と4属性の増減を自分たちで決め、そのままDIYで形にします。';

export const BugReportOverlay = ({
  activeBug,
  setActiveBug = () => {},
  setIsReturning = () => {},
  bugs = [],
  removeBug = () => {},
  startDIY = () => {},
  setBugChosenPlan = () => {},
  openAREditQuest = () => {},
  ignoreQuest,
  commitJokerQuest,
}) => {
  const bug = useMemo(() => bugs.find((b) => b.id === activeBug), [bugs, activeBug]);
  const effectiveNeedType = useMemo(() => {
    if (!bug) return null;
    return bug.needType ?? TYPE_TO_BARRIER_META[bug.type]?.needType ?? DEFAULT_BARRIER_META.needType ?? 'P';
  }, [bug]);
  const selectablePlans = useMemo(() => {
    if (!effectiveNeedType) return [];
    return getSelectablePlansForQuest({ needType: effectiveNeedType, includeIgnore: true });
  }, [effectiveNeedType]);
  const initialSelectedPlan = useMemo(() => {
    if (!bug) return null;
    if (bug.chosenPlan && selectablePlans.includes(bug.chosenPlan)) return bug.chosenPlan;
    return selectablePlans[0] ?? null;
  }, [bug, selectablePlans]);
  const [selectedPlan, setSelectedPlan] = useState(initialSelectedPlan);
  const [phase, setPhase] = useState('decision');
  const remainingBudget = useGameStore((s) => s.remainingBudget);

  useEffect(() => {
    setSelectedPlan(initialSelectedPlan);
  }, [initialSelectedPlan, activeBug]);

  useEffect(() => {
    setPhase('decision');
  }, [activeBug]);

  const isIgnoreSelected = selectedPlan === IGNORE_PLAN_ID;
  const isJokerSelected = selectedPlan === JOKER_PLAN_ID;

  if (!activeBug || !bug) return null;

  const factorMeta = FACTOR_STYLE[bug.factor] ?? FACTOR_STYLE.hard;
  const scaleMeta = getScaleUi(bug.scale);
  const needCategory = NEED_CATEGORY_OPTIONS.find((opt) => opt.needType === bug.needType);
  const placeArchetypeLabel = getPlaceArchetypeLabel(bug.placeArchetype);
  const fallbackPhoto = 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&q=80&w=800';
  const heroPhoto = bug.photo || fallbackPhoto;
  const canEditPost = bug.isMine && bug.sourceQuestId && !bug.solved;
  return (
    <div style={BUG_REPORT_STYLE.overlay}>
      <PhotoPinSurface
        imageUrl={heroPhoto}
        pins={bug.photoPins ?? []}
        height="100%"
        minHeight="100vh"
      >
        <div style={BUG_REPORT_STYLE.closeRow}>
          {canEditPost && (
            <button
              type="button"
              onClick={() => {
                setActiveBug(null);
                openAREditQuest(bug.sourceQuestId);
              }}
              style={BUG_REPORT_STYLE.closeButton}
              title="投稿を編集"
            >
              <Pencil size={20} color="white" />
            </button>
          )}
          <button
            type="button"
            onClick={() => { setActiveBug(null); setIsReturning(true); }}
            style={BUG_REPORT_STYLE.closeButton}
          >
            <X size={28} color="white" />
          </button>
        </div>
        <div style={BUG_REPORT_STYLE.contentPanel} className="bug-report-scroll">
          <div style={BUG_REPORT_STYLE.content}>
          <div style={BUG_REPORT_STYLE.chipRow}>
            <span style={getScaleChipStyle(scaleMeta)}>
              {scaleMeta.label}（{scaleMeta.subtitle}）
            </span>
            <span style={getFactorChipStyle(factorMeta)}>{BUG_REPORT_COPY.factorPrefix}{factorMeta.label}</span>
            {needCategory && (
              <span style={getNeedCategoryChipStyle()}>
                <Pictogram src={needCategory.iconSrc} size={18} alt={needCategory.label} />
                {needCategory.label}
              </span>
            )}
            {placeArchetypeLabel && (
              <span style={BUG_REPORT_STYLE.placeTypeChip}>
                {BUG_REPORT_COPY.placeTypePrefix} {placeArchetypeLabel}
              </span>
            )}
            <span style={getTagLabelChipStyle(factorMeta)}>{bug.tagLabel ?? BUG_REPORT_COPY.fallbackTagLabel}</span>
            <span style={getDemographicChipStyle()}>{bug.demographic}</span>
            {bug.timeTag && (
              <span style={getTimeTagChipStyle()}>
                <span style={BUG_REPORT_STYLE.tagChip}>
                  <Pictogram src={TIME_TAG_ICON_BY_LABEL[bug.timeTag]} size={18} alt={bug.timeTag} />
                  {bug.timeTag}
                </span>
              </span>
            )}
            {bug.severity && (
              <span style={getSeverityChipStyle()}>
                <span style={BUG_REPORT_STYLE.tagChip}>
                  <Pictogram src={SEVERITY_ICON[bug.severity]} size={18} alt={SEVERITY_LABEL[bug.severity] ?? bug.severity} />
                  {SEVERITY_LABEL[bug.severity] ?? bug.severity}
                </span>
              </span>
            )}
            {Array.isArray(bug.affectedGroups) && bug.affectedGroups.length > 0 && (
              <span style={getAffectedGroupsChipStyle()}>
                {bug.affectedGroups.map((group) => (
                  <span key={group} style={BUG_REPORT_STYLE.tagChip}>
                    <Pictogram src={TARGET_GROUP_ICON_BY_LABEL[group]} size={18} alt={group} />
                    {group}
                  </span>
                ))}
              </span>
            )}
          </div>
          <p style={BUG_REPORT_STYLE.comment}>
            「{bug.comment}」
          </p>
          {phase !== 'plan' && (
            <IslandSatisfactionBlock compact variant="overlay" />
          )}
          {phase === 'plan' && effectiveNeedType && selectedPlan && !isJokerSelected && (
            <IslandSatisfactionBlock
              compact
              variant="overlay"
              previewNeedType={effectiveNeedType}
              previewPlanId={selectedPlan}
            />
          )}
          {phase === 'decision' ? (
            <div style={BUG_REPORT_STYLE.actionRow}>
              <button
                onClick={() => {
                  setActiveBug(null);
                  setIsReturning(true);
                }}
                style={{ ...BUG_REPORT_STYLE.buttonBase, ...BUG_REPORT_STYLE.secondaryButton }}
              >
                {BUG_REPORT_COPY.cancel}
              </button>
              <button
                onClick={() => setPhase('plan')}
                style={{ ...BUG_REPORT_STYLE.buttonBase, ...BUG_REPORT_STYLE.primaryResolveButton }}
              >
                <Hammer size={22} />
                {BUG_REPORT_COPY.resolve}
              </button>
            </div>
          ) : phase === 'joker' ? (
            <JokerPlanForm
              remainingBudget={remainingBudget ?? 0}
              onCancel={() => setPhase('plan')}
              onSubmit={(payload) => {
                // 成功時は startDIY が activeBug を閉じて建築モードへ移す
                commitJokerQuest?.(activeBug, payload);
              }}
            />
          ) : (
            <>
              {selectablePlans.length > 0 && (
                <div style={BUG_REPORT_STYLE.planSection}>
                  <div style={BUG_REPORT_STYLE.planTitle}>
                    {BUG_REPORT_COPY.choosePlan}
                  </div>
                  <div style={getPlanGridStyle(selectablePlans.length)}>
                    {selectablePlans.map((plan, idx) => {
                      const active = selectedPlan === plan;
                      const isIgnorePlan = plan === IGNORE_PLAN_ID;
                      const isJokerPlan = plan === JOKER_PLAN_ID;
                      const accent = PLAN_CARD_ACCENT[plan] ?? '#90caf9';
                      const cardDeltas = effectiveNeedType && !isJokerPlan
                        ? getPlanPreviewDeltas(effectiveNeedType, plan)
                        : null;
                      const contextLabel = isIgnorePlan
                        ? BUG_REPORT_COPY.ignorePlanLabel
                        : isJokerPlan
                          ? JOKER_PLAN_LABEL
                          : getPlanContextLabel(effectiveNeedType, plan);
                      const contextDescription = isIgnorePlan
                        ? BUG_REPORT_COPY.ignorePlanDescription
                        : isJokerPlan
                          ? JOKER_PLAN_DESCRIPTION
                          : getPlanContextDescription(effectiveNeedType, plan);
                      const typeNumber = selectablePlans
                        .slice(0, idx)
                        .filter((p) => p !== IGNORE_PLAN_ID && p !== JOKER_PLAN_ID)
                        .length + 1;
                      const planOrdinal = isIgnorePlan
                        ? (active ? BUG_REPORT_COPY.selected : '無視')
                        : isJokerPlan
                          ? (active ? BUG_REPORT_COPY.selected : '独自案')
                          : (active ? BUG_REPORT_COPY.selected : `型 ${typeNumber}`);
                      const repairScale = isIgnorePlan || isJokerPlan ? null : getPlanRepairScale(plan);
                      return (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => {
                            setSelectedPlan(plan);
                            if (!isJokerPlan) setBugChosenPlan(activeBug, plan);
                          }}
                          style={getPlanCardStyle({ active, accent })}
                        >
                          <div style={BUG_REPORT_STYLE.planCardHeader}>
                            <div style={BUG_REPORT_STYLE.planLabel}>
                              {contextLabel ?? PLAN_LABEL[plan] ?? plan}
                            </div>
                            <div style={getPlanOrdinalStyle({ active, accent })}>
                              {planOrdinal}
                            </div>
                          </div>
                          <div style={{ fontSize: 13, color: '#b0bec5', marginBottom: 6, lineHeight: 1.4 }}>
                            {contextDescription ?? PLAN_DESCRIPTION[plan] ?? ''}
                          </div>
                          {cardDeltas && (
                            <div style={{ fontSize: 12, color: '#ffcc80', marginBottom: 4 }}>
                              施策コスト
                              {' '}
                              {cardDeltas.budgetCost}
                              {' '}
                              <span style={{ color: '#90a4ae', fontWeight: 500 }}>（固定）</span>
                            </div>
                          )}
                          {isJokerPlan && (
                            <div style={{ fontSize: 12, color: '#ffcc80', marginBottom: 4 }}>
                              施策コスト
                              {' '}
                              {JOKER_BUDGET_MIN}
                              〜
                              {JOKER_BUDGET_MAX}
                              {' '}
                              <span style={{ color: '#90a4ae', fontWeight: 500 }}>（話し合いで決める）</span>
                            </div>
                          )}
                          {!isIgnorePlan && repairScale && (
                            <div style={{ fontSize: 12, color: '#80deea', marginBottom: 4 }}>
                              修理規模:
                              {' '}
                              {repairScale.label}
                              {' '}
                              · 上限
                              {' '}
                              {repairScale.maxBlocks}
                              {' '}
                              ブロック
                            </div>
                          )}
                          <PlanSatisfactionDeltas deltas={cardDeltas?.deltas} />
                          <div style={BUG_REPORT_STYLE.planHint}>
                            {isIgnorePlan
                              ? BUG_REPORT_COPY.ignorePlanHint
                              : isJokerPlan
                                ? JOKER_PLAN_HINT
                                : (getPlanHint(plan, bug.scale) ?? BUG_REPORT_COPY.planFallbackHint)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={BUG_REPORT_STYLE.actionRow}>
                <button
                  onClick={() => setPhase('decision')}
                  style={{ ...BUG_REPORT_STYLE.buttonBase, ...BUG_REPORT_STYLE.secondaryButton }}
                >
                  {BUG_REPORT_COPY.back}
                </button>
                <button
                  onClick={() => {
                    if (isJokerSelected) {
                      setPhase('joker');
                      return;
                    }
                    if (isIgnoreSelected) {
                      if (window.confirm('この声を無視してよろしいですか？（深刻な満足度ペナルティがあります）')) {
                        if (bug.sourceQuestId || bug.id) {
                          ignoreQuest?.(bug.sourceQuestId || bug.id);
                        }
                        setActiveBug(null);
                        setIsReturning(true);
                      }
                      return;
                    }
                    startDIY(activeBug, selectedPlan);
                  }}
                  disabled={!selectedPlan}
                  style={isIgnoreSelected
                    ? BUG_REPORT_STYLE.ignoreConfirmButton
                    : BUG_REPORT_STYLE.startButton}
                >
                  <Hammer size={20} />
                  {isIgnoreSelected
                    ? BUG_REPORT_COPY.confirmIgnore
                    : isJokerSelected
                      ? '独自案を設計する'
                      : BUG_REPORT_COPY.startBuild}
                </button>
              </div>
            </>
          )}
          <div style={BUG_REPORT_STYLE.removeRow}>
            <button onClick={() => removeBug(activeBug)} style={BUG_REPORT_STYLE.removeButton}>
              <Trash2 size={16} />
              {BUG_REPORT_COPY.remove}
            </button>
          </div>
          </div>
        </div>
      </PhotoPinSurface>
    </div>
  );
};


