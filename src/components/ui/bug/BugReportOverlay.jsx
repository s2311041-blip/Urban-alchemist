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
import { getAllowedPlansForQuest } from '../../../constants/tradeoffMatrix';
import {
  getPlanContextDescription,
  getPlanContextLabel,
} from '../../../constants/planContextLabels';
import {
  getPlanPreviewDeltas,
  previewIslandSatisfaction,
} from '../../../utils/planSatisfaction';
import {
  PlanSatisfactionDeltas,
  SatisfactionGaugePanel,
} from '../consensus/SatisfactionGaugePanel';
import { JokerPlanForm } from '../consensus/JokerPlanForm';

const SEVERITY_LABEL = Object.fromEntries(
  SEVERITY_OPTIONS.map((opt) => [opt.id, opt.label]),
);
const SEVERITY_ICON = Object.fromEntries(
  SEVERITY_OPTIONS.map((opt) => [opt.id, opt.iconSrc]),
);

export const BugReportOverlay = ({
  activeBug,
  setActiveBug = () => {},
  setIsReturning = () => {},
  bugs = [],
  removeBug = () => {},
  startDIY = () => {},
  setBugChosenPlan = () => {},
  openAREditQuest = () => {},
  isSeriousMode,
  ignoreQuest,
  commitJokerQuest,
}) => {
  const bug = useMemo(() => bugs.find((b) => b.id === activeBug), [bugs, activeBug]);
  const allowedPlans = useMemo(
    () => {
      if (bug?.needType === 'O') return [];
      if (bug?.needType) {
        return getAllowedPlansForQuest({ needType: bug.needType });
      }
      return Array.isArray(bug?.allowedPlans) ? bug.allowedPlans : [];
    },
    [bug],
  );
  const initialSelectedPlan = useMemo(() => {
    if (!bug) return null;
    if (bug.chosenPlan && allowedPlans.includes(bug.chosenPlan)) return bug.chosenPlan;
    return allowedPlans[0] ?? null;
  }, [bug, allowedPlans]);
  const [selectedPlan, setSelectedPlan] = useState(initialSelectedPlan);
  const [phase, setPhase] = useState('decision');
  const consensusSession = useGameStore((s) => s.consensusSession);

  useEffect(() => {
    setSelectedPlan(initialSelectedPlan);
  }, [initialSelectedPlan, activeBug]);

  const planPreview = useMemo(() => {
    if (!isSeriousMode || !bug?.needType || !selectedPlan || !consensusSession) return null;
    const needType = bug.needType;
    const current = consensusSession.islandSatisfaction;
    const preview = previewIslandSatisfaction(current, { needType, planId: selectedPlan });
    const effect = getPlanPreviewDeltas(needType, selectedPlan);
    return { current, preview, effect };
  }, [isSeriousMode, bug, selectedPlan, consensusSession]);

  if (!activeBug || !bug) return null;

  const isOQuest = bug.needType === 'O';
  const jokerAlreadyUsed = !!consensusSession?.jokerUsed;
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
        minHeight="42vh"
      >
        <div style={{ ...BUG_REPORT_STYLE.closeRow, justifyContent: 'flex-end', gap: 10, pointerEvents: 'auto' }}>
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
              <Pencil size={22} color="white" />
            </button>
          )}
          <button
            type="button"
            onClick={() => { setActiveBug(null); setIsReturning(true); }}
            style={BUG_REPORT_STYLE.closeButton}
          >
            <X size={30} color="white" />
          </button>
        </div>
        <div style={{ ...BUG_REPORT_STYLE.content, pointerEvents: 'auto' }}>
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
              {isSeriousMode && ignoreQuest && (
                <button
                  onClick={() => {
                    if (window.confirm('この声を無視してよろしいですか？（深刻な満足度ペナルティがあります）')) {
                      ignoreQuest(bug.sourceQuestId);
                      setActiveBug(null);
                      setIsReturning(true);
                    }
                  }}
                  style={{ ...BUG_REPORT_STYLE.buttonBase, background: '#455a64', color: '#fff' }}
                >
                  無視する（コスト0）
                </button>
              )}
              <button
                onClick={() => setPhase(isOQuest && isSeriousMode ? 'joker' : 'plan')}
                style={{ ...BUG_REPORT_STYLE.buttonBase, ...BUG_REPORT_STYLE.primaryResolveButton }}
              >
                <Hammer size={22} />
                {isOQuest && isSeriousMode ? '独自案を考える' : BUG_REPORT_COPY.resolve}
              </button>
            </div>
          ) : phase === 'joker' ? (
            <JokerPlanForm
              jokerAlreadyUsed={jokerAlreadyUsed}
              remainingBudget={consensusSession?.remainingSessionBudget ?? 0}
              onCancel={() => setPhase('decision')}
              onSubmit={(payload) => {
                if (commitJokerQuest?.(activeBug, payload)) {
                  setActiveBug(null);
                  setIsReturning(true);
                }
              }}
            />
          ) : (
            <>
              {isOQuest && !isSeriousMode && (
                <div style={{ color: '#ffcc80', fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
                  「その他」の困りごとは、議会モードでジョーカー施策（独自案）として対応してください。
                </div>
              )}
              {allowedPlans.length > 0 && (
                <div style={BUG_REPORT_STYLE.planSection}>
                  <div style={BUG_REPORT_STYLE.planTitle}>
                    {BUG_REPORT_COPY.choosePlan}
                  </div>
                  {isSeriousMode && planPreview && (
                    <div style={{
                      marginBottom: 14,
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,202,40,0.35)',
                    }}
                    >
                      <div style={{ fontSize: 12, color: '#ffca28', marginBottom: 8, fontWeight: 700 }}>
                        島全体の満足度プレビュー（確定前）
                        {planPreview.effect?.budgetCost != null && (
                          <span style={{ color: '#90a4ae', fontWeight: 500, marginLeft: 8 }}>
                            予算 -
                            {planPreview.effect.budgetCost}
                          </span>
                        )}
                      </div>
                      <SatisfactionGaugePanel
                        values={planPreview.preview}
                        baseline={planPreview.current}
                        compact
                        showMinLine
                      />
                    </div>
                  )}
                  <div style={getPlanGridStyle(allowedPlans.length)}>
                    {allowedPlans.map((plan, idx) => {
                      const active = selectedPlan === plan;
                      const accent = PLAN_CARD_ACCENT[plan] ?? '#90caf9';
                      const cardDeltas = isSeriousMode && bug.needType
                        ? getPlanPreviewDeltas(bug.needType, plan)
                        : null;
                      const contextLabel = bug.needType
                        ? getPlanContextLabel(bug.needType, plan)
                        : null;
                      const contextDescription = bug.needType
                        ? getPlanContextDescription(bug.needType, plan)
                        : null;
                      return (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setBugChosenPlan(activeBug, plan);
                          }}
                          style={getPlanCardStyle({ active, accent })}
                        >
                          <div style={BUG_REPORT_STYLE.planCardHeader}>
                            <div style={BUG_REPORT_STYLE.planLabel}>
                              {contextLabel ?? PLAN_LABEL[plan] ?? plan}
                            </div>
                            <div style={getPlanOrdinalStyle({ active, accent })}>
                              {active ? BUG_REPORT_COPY.selected : `型 ${idx + 1}`}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: '#b0bec5', marginBottom: '8px', lineHeight: 1.4 }}>
                            {contextDescription ?? PLAN_DESCRIPTION[plan] ?? ''}
                          </div>
                          {isSeriousMode && cardDeltas && (
                            <div style={{ fontSize: 11, color: '#ffcc80', marginBottom: 6 }}>
                              予算 -
                              {cardDeltas.budgetCost}
                            </div>
                          )}
                          <PlanSatisfactionDeltas deltas={cardDeltas?.deltas} />
                          <div style={BUG_REPORT_STYLE.planHint}>{getPlanHint(plan, bug.scale) ?? BUG_REPORT_COPY.planFallbackHint}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={BUG_REPORT_STYLE.actionRow}>
                <button
                  onClick={() => setPhase('decision')}
                  style={{ ...BUG_REPORT_STYLE.buttonBase, ...BUG_REPORT_STYLE.secondaryButton, padding: '15px' }}
                >
                  {BUG_REPORT_COPY.back}
                </button>
                <button
                  onClick={() => startDIY(activeBug, selectedPlan)}
                  disabled={!selectedPlan}
                  style={BUG_REPORT_STYLE.startButton}
                >
                  <Hammer size={20} />
                  {BUG_REPORT_COPY.startBuild}
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
      </PhotoPinSurface>
    </div>
  );
};


