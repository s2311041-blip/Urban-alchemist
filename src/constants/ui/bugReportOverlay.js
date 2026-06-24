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
};

export const getPlaceArchetypeLabel = (placeArchetype) => {
  if (placeArchetype === 'none') return 'どれにも当てはまらない（オーブのみ）';
  return PLACE_ARCHETYPE_LABELS[placeArchetype] ?? null;
};

export const BUG_REPORT_COPY = {
  fallbackTagLabel: '#局所的欠損_障壁',
  cancel: 'キャンセル',
  resolve: '解決する',
  choosePlan: '解決策の型を選択（カード）',
  selected: '選択中',
  planFallbackHint: 'このプランで解決します。',
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
  closeRow: {
    padding: '30px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  closeButton: {
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.3)',
    cursor: 'pointer',
    padding: '15px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(5px)',
  },
  content: {
    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)',
    padding: '60px 40px 50px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
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
    fontSize: '26px',
    color: 'white',
    lineHeight: '1.5',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
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
    padding: '14px',
    fontSize: '15px',
  },
  primaryResolveButton: {
    flex: 2,
    background: '#f5a623',
    color: 'white',
    border: 'none',
    padding: '14px',
    fontSize: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 10px 30px rgba(245, 166, 35, 0.4)',
  },
  planSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '4px',
  },
  planTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#b3e5fc',
  },
  planGrid: {
    display: 'grid',
    gap: '12px',
    maxHeight: '68vh',
    overflowY: 'auto',
    paddingRight: '2px',
  },
  planCard: {
    textAlign: 'left',
    borderRadius: '16px',
    color: '#f8fbff',
    cursor: 'pointer',
    padding: '24px 20px',
    fontSize: '16px',
    lineHeight: 1.4,
    transition: 'all 0.18s ease',
    minHeight: '120px',
  },
  planCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  planLabel: {
    fontWeight: 'bold',
    fontSize: '28px',
  },
  planOrdinal: {
    fontSize: '13px',
    opacity: 0.95,
    fontWeight: 'bold',
  },
  planHint: {
    opacity: 0.93,
    fontSize: '16px',
  },
  startButton: {
    flex: 2,
    background: '#66bb6a',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '14px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
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
  gridTemplateRows: `repeat(${Math.max(count, 1)}, minmax(0, 1fr))`,
  minHeight: `min(64vh, ${Math.max(count, 1) * 19}vh)`,
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
