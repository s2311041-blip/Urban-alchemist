import React, { useMemo, useState } from 'react';
import { X, Trash2, Hammer, Pencil } from 'lucide-react';
import { PhotoPinSurface } from '../PhotoPinSurface';
import {
  getPlanHint,
  getScaleUi,
  NEED_CATEGORY_OPTIONS,
  PLAN_LABEL,
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
import { TRADEOFF_MATRIX, getAllowedPlansForQuest } from '../../../constants/tradeoffMatrix';

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
}) => {
  const bug = useMemo(() => bugs.find((b) => b.id === activeBug), [bugs, activeBug]);
  const allowedPlans = useMemo(
    () => {
      if (isSeriousMode && bug?.needType) {
        return getAllowedPlansForQuest({ needType: bug.needType });
      }
      return Array.isArray(bug?.allowedPlans) ? bug.allowedPlans : [];
    },
    [bug, isSeriousMode],
  );
  const initialSelectedPlan = useMemo(() => {
    if (!bug) return null;
    if (bug.chosenPlan && allowedPlans.includes(bug.chosenPlan)) return bug.chosenPlan;
    return allowedPlans[0] ?? null;
  }, [bug, allowedPlans]);
  const [selectedPlan, setSelectedPlan] = useState(initialSelectedPlan);
  const [phase, setPhase] = useState('decision');

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
                onClick={() => setPhase('plan')}
                style={{ ...BUG_REPORT_STYLE.buttonBase, ...BUG_REPORT_STYLE.primaryResolveButton }}
              >
                <Hammer size={22} />
                {BUG_REPORT_COPY.resolve}
              </button>
            </div>
          ) : (
            <>
              {allowedPlans.length > 0 && (
                <div style={BUG_REPORT_STYLE.planSection}>
                  <div style={BUG_REPORT_STYLE.planTitle}>
                    {BUG_REPORT_COPY.choosePlan}
                  </div>
                  <div style={getPlanGridStyle(allowedPlans.length)}>
                    {allowedPlans.map((plan, idx) => {
                      const active = selectedPlan === plan;
                      const accent = PLAN_CARD_ACCENT[plan] ?? '#90caf9';
                      return (
                        <button
                          key={plan}
                          onClick={() => {
                            setSelectedPlan(plan);
                            setBugChosenPlan(activeBug, plan);
                          }}
                          style={getPlanCardStyle({ active, accent })}
                        >
                          <div style={BUG_REPORT_STYLE.planCardHeader}>
                            <div style={BUG_REPORT_STYLE.planLabel}>{PLAN_LABEL[plan] ?? plan}</div>
                            <div style={getPlanOrdinalStyle({ active, accent })}>
                              {active ? BUG_REPORT_COPY.selected : `型 ${idx + 1}`}
                            </div>
                          </div>
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


