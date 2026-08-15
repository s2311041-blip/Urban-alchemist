import { PLACE_ARCHETYPE_LABELS } from '../../utils/placePresets';

export const FACTOR_STYLE = {
  hard: { bg: '#ff7043', label: '物理', border: 'rgba(255,112,67,0.6)' },
  soft: { bg: '#29b6f6', label: '制度・運用', border: 'rgba(41,182,246,0.6)' },
  human: { bg: '#ab47bc', label: '心理・社会', border: 'rgba(171,71,188,0.6)' },
};

export const PLAN_CARD_ACCENT = {
  lighting: '#ffca28',
  hard_fix: '#66bb6a',
  detour_path: '#29b6f6',
  transit_link: '#26c6da',
  maintenance: '#ab47bc',
  sign_info: '#90caf9',
  care_point: '#ce93d8',
  ignore: '#78909c',
};

export const getPlaceArchetypeLabel = (placeArchetype) => {
  if (placeArchetype === 'none') return 'どれにも当てはまらない（オーブのみ）';
  return PLACE_ARCHETYPE_LABELS[placeArchetype] ?? null;
};

export const BUG_REPORT_COPY = {
  fallbackTagLabel: '#局所的欠損_障壁',
  cancel: 'キャンセル',
  resolve: '解決する',
  choosePlan: '改善プランを選ぶ（4択・無視含む）',
  selected: '選択中',
  planFallbackHint: 'このプランで解決します。',
  ignorePlanLabel: '無視する',
  ignorePlanDescription: '対応しない代わりに、島の満足度ペナルティを受けます（予算0）。',
  ignorePlanHint: '声を放置すると、信頼が大きく損なわれます。',
  confirmIgnore: '無視で確定する',
  back: '戻る',
  startBuild: 'この型で建築開始',
  remove: 'この不満を取り下げる',
  placeTypePrefix: '場所タイプ:',
  factorPrefix: '要因：',
};

export const BUG_REPORT_STYLE = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    animation: 'fadeIn 0.6s ease-out',
    overflow: 'hidden',
  },
  closeRow: {
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    pointerEvents: 'auto',
    flexShrink: 0,
  },
  closeButton: {
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.3)',
    cursor: 'pointer',
    padding: 12,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(5px)',
  },
  contentPanel: {
    marginTop: 'auto',
    width: '100%',
    maxHeight: '72vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
    background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.82) 45%, rgba(0,0,0,0.45) 78%, transparent 100%)',
    padding: '28px 28px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    pointerEvents: 'auto',
    boxSizing: 'border-box',
  },
  hero: {
    flex: 1,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  chipRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  chipBase: {
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  iconChipBase: {
    ...{
      padding: '6px 12px',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  tagChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  placeTypeChip: {
    background: 'rgba(126,87,194,0.3)',
    color: '#f3e5f5',
    border: '1px solid rgba(206,147,216,0.55)',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  comment: {
    margin: 0,
    fontSize: '22px',
    color: 'white',
    lineHeight: 1.5,
    fontWeight: 'bold',
    textShadow: '0 2px 8px rgba(0,0,0,0.85)',
  },
  actionRow: {
    display: 'flex',
    gap: 12,
    marginTop: 6,
    flexShrink: 0,
  },
  buttonBase: {
    color: '#fff',
    borderRadius: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  secondaryButton: {
    flex: 1,
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '13px 12px',
    fontSize: '15px',
  },
  primaryResolveButton: {
    flex: 2,
    background: '#f5a623',
    color: 'white',
    border: 'none',
    padding: '13px 14px',
    fontSize: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 8px 24px rgba(245, 166, 35, 0.4)',
  },
  planSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  planTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#b3e5fc',
  },
  planGrid: {
    display: 'grid',
    gap: 10,
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  },
  planCard: {
    textAlign: 'left',
    borderRadius: 14,
    color: '#f8fbff',
    cursor: 'pointer',
    padding: '14px 16px',
    fontSize: '14px',
    lineHeight: 1.4,
    transition: 'all 0.18s ease',
    minHeight: 0,
  },
  planCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  planLabel: {
    fontWeight: 'bold',
    fontSize: '18px',
    lineHeight: 1.3,
  },
  planOrdinal: {
    fontSize: '12px',
    opacity: 0.95,
    fontWeight: 'bold',
    flexShrink: 0,
  },
  planHint: {
    opacity: 0.9,
    fontSize: '13px',
    lineHeight: 1.4,
    marginTop: 6,
  },
  startButton: {
    flex: 2,
    background: '#66bb6a',
    color: 'white',
    border: 'none',
    padding: '14px 16px',
    borderRadius: 14,
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  ignoreConfirmButton: {
    flex: 2,
    background: '#546e7a',
    color: 'white',
    border: 'none',
    padding: '14px 16px',
    borderRadius: 14,
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  removeRow: {
    display: 'flex',
    marginTop: '8px',
  },
  removeButton: {
    width: '100%',
    background: 'rgba(255,68,68,0.14)',
    color: '#ff7a7a',
    border: '1px solid rgba(255,68,68,0.4)',
    padding: '11px 14px',
    borderRadius: '11px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },
};

export const getBugReportHeroStyle = (photoUrl) => ({
  ...BUG_REPORT_STYLE.hero,
  backgroundImage: `url(${photoUrl})`,
});

export const getScaleChipStyle = (scaleMeta) => ({
  ...BUG_REPORT_STYLE.chipBase,
  background: scaleMeta.bg,
  color: 'white',
  border: `1px solid ${scaleMeta.border}`,
});

export const getFactorChipStyle = (factorMeta) => ({
  ...BUG_REPORT_STYLE.chipBase,
  background: factorMeta.bg,
  color: 'white',
});

export const getNeedCategoryChipStyle = () => ({
  ...BUG_REPORT_STYLE.chipBase,
  background: 'rgba(255,255,255,0.16)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.28)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

export const getTagLabelChipStyle = (factorMeta) => ({
  ...BUG_REPORT_STYLE.chipBase,
  background: 'rgba(255,255,255,0.14)',
  color: 'white',
  border: `1px solid ${factorMeta.border}`,
  backdropFilter: 'blur(5px)',
});

export const getDemographicChipStyle = () => ({
  ...BUG_REPORT_STYLE.chipBase,
  background: 'rgba(255,255,255,0.2)',
  color: 'white',
  backdropFilter: 'blur(5px)',
});

export const getTimeTagChipStyle = () => ({
  ...BUG_REPORT_STYLE.iconChipBase,
  background: 'rgba(79,195,247,0.2)',
  color: '#e1f5fe',
});

export const getSeverityChipStyle = () => ({
  ...BUG_REPORT_STYLE.iconChipBase,
  background: 'rgba(255,183,77,0.25)',
  color: '#fff3e0',
});

export const getAffectedGroupsChipStyle = () => ({
  ...BUG_REPORT_STYLE.iconChipBase,
  background: 'rgba(129,199,132,0.2)',
  color: '#e8f5e9',
  gap: '8px',
  flexWrap: 'wrap',
});

export const getPlanGridStyle = (count) => ({
  ...BUG_REPORT_STYLE.planGrid,
  gridTemplateColumns: count >= 4
    ? 'repeat(2, minmax(0, 1fr))'
    : (count <= 1 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))'),
});

export const getPlanCardStyle = ({ active, accent }) => ({
  ...BUG_REPORT_STYLE.planCard,
  border: active ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.24)',
  background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
  boxShadow: active ? `0 10px 28px ${accent}55` : 'none',
});

export const getPlanOrdinalStyle = ({ active, accent }) => ({
  ...BUG_REPORT_STYLE.planOrdinal,
  color: active ? accent : '#d5e6ff',
});
