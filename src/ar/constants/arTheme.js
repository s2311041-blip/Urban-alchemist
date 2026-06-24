export const AR_THEME = {
  bg: '#0a1628',
  panel: 'rgba(13, 27, 42, 0.92)',
  accent: '#4fc3f7',
  accentWarm: '#ffb74d',
  barrier: '#ef5350',
  positive: '#66bb6a',
  text: '#e3f2fd',
  muted: '#90a4ae',
  safeBottom: 'calc(12px + env(safe-area-inset-bottom))',
};

export const chipStyle = (active, color = AR_THEME.accent) => ({
  padding: '12px 14px',
  borderRadius: 14,
  border: active ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.12)',
  background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
  color: AR_THEME.text,
  cursor: 'pointer',
  textAlign: 'center',
  fontSize: 14,
  fontWeight: active ? 'bold' : 'normal',
});
