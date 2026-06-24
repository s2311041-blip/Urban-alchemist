import { QUEST_STATUS, normalizeQuestStatus } from '../../store/helpers/questState';

export const QUEST_OWNER_FILTER_OPTIONS = [
  { id: 'all', label: '全て' },
  { id: 'mine', label: '自分' },
  { id: 'others', label: '他の人' },
];

export const QUEST_STATUS_FILTER_OPTIONS = [
  { id: 'all', label: '全ステータス' },
  { id: 'active', label: '未解決' },
  { id: 'resolved', label: '解決済み' },
];

export const getQuestStatusMeta = (questStatus) => {
  const normalizedStatus = normalizeQuestStatus(questStatus);
  if (normalizedStatus === QUEST_STATUS.ON_ISLAND) {
    return {
      label: '島に出現中',
      bg: '#e8f5e9',
      color: '#2e7d32',
    };
  }
  if (normalizedStatus === QUEST_STATUS.RESOLVED) {
    return {
      label: '解決済み',
      bg: '#eceff1',
      color: '#607d8b',
    };
  }
  return {
    label: '未配置',
    bg: '#fff3e0',
    color: '#e65100',
  };
};

export const QUEST_BOARD_COPY = {
  title: '街の不満ボード',
  empty: '現在、新たな不満はありません。',
  placeTypePrefix: '場所タイプ:',
  placeButton: '配置場所を決める',
  focusButton: '島で見る',
  resolvedLabel: 'この声は解決済みです',
  today: '今日',
};

export const QUEST_BOARD_STYLE = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(10px)',
    zIndex: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: 'fadeIn 0.3s',
  },
  panel: {
    background: '#f8f9fa',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    background: '#333',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  content: {
    padding: '14px 20px 20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '15px',
    padding: '15px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  ownerBadge: {
    padding: '4px 10px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  dateText: {
    fontSize: '12px',
    color: '#999',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  placeBadge: {
    background: '#ede7f6',
    color: '#5e35b1',
    padding: '4px 10px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  comment: {
    margin: '0 0 15px 0',
    fontSize: '15px',
    color: '#333',
    lineHeight: '1.4',
    fontWeight: 'bold',
  },
  actionButton: {
    width: '100%',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  resolvedBox: {
    width: '100%',
    background: '#f5f5f5',
    color: '#607d8b',
    border: '1px solid #e0e0e0',
    padding: '10px',
    borderRadius: '10px',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: '14px',
  },
};

export const getQuestOwnerBadgeStyle = (isMine) => ({
  ...QUEST_BOARD_STYLE.ownerBadge,
  background: isMine ? '#e8f5e9' : '#fff3e0',
  color: isMine ? '#2e7d32' : '#e65100',
});

export const getQuestCardStyle = (isMine) => ({
  ...QUEST_BOARD_STYLE.card,
  borderLeft: `5px solid ${isMine ? '#4CAF50' : '#f5a623'}`,
});

export const getQuestActionButtonStyle = (kind) => ({
  ...QUEST_BOARD_STYLE.actionButton,
  background: kind === 'focus' ? '#1565c0' : '#333',
  ...(kind === 'place' ? { transition: 'background 0.2s' } : { fontSize: '14px' }),
});

export const getOwnerFilterButtonStyle = (selected) => ({
  border: `1px solid ${selected ? '#1565c0' : '#cfd8dc'}`,
  background: selected ? '#e3f2fd' : '#fff',
  color: selected ? '#0d47a1' : '#455a64',
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
});

export const getStatusFilterButtonStyle = (selected) => ({
  border: `1px solid ${selected ? '#6a1b9a' : '#d1c4e9'}`,
  background: selected ? '#f3e5f5' : '#fff',
  color: selected ? '#4a148c' : '#6a1b9a',
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
});
