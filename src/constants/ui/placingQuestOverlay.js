export const PLACING_QUEST_OVERLAY_STYLE = {
  container: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 100,
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    border: '1px solid #f5a623',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  cancelButton: {
    background: '#ff4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: '10px',
  },
};

export const getPlacingQuestMessage = (isMine) => (
  isMine
    ? '島の上を選んでダブルクリックで投稿を配置'
    : '島の上を選んでダブルクリックで不満を配置'
);
