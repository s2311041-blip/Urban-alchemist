import { UI_THEME } from './uiTheme';

/** 3Dワールド上の近接ヒント（不満・ホバーボード等で共通） */
export const WORLD_PROXIMITY_HINT_STYLE = {
  background: UI_THEME.panelBg,
  color: UI_THEME.textOnDark,
  padding: '6px 14px',
  borderRadius: UI_THEME.radius,
  border: `1px solid ${UI_THEME.panelBorder}`,
  fontSize: '14px',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  fontWeight: 'bold',
  fontFamily: UI_THEME.fontFamily,
  lineHeight: 1.2,
  boxShadow: UI_THEME.cardShadow,
};
