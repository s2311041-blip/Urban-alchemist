import { SIDE_PANEL_WIDTH } from '../../../constants/uiLayout';

export { SIDE_PANEL_WIDTH };

const panelBase = (overrides = {}) => ({
  width: `${SIDE_PANEL_WIDTH}px`,
  maxWidth: `${SIDE_PANEL_WIDTH}px`,
  minWidth: `${SIDE_PANEL_WIDTH}px`,
  boxSizing: 'border-box',
  ...overrides,
});

/** 時間・通貨・農業など */
export const hudPanelStyle = (overrides = {}) => panelBase({
  padding: '10px 12px',
  borderRadius: '14px',
  boxShadow: '0 10px 28px rgba(0,0,0,0.25)',
  backdropFilter: 'blur(6px)',
  ...overrides,
});

/** 方位コンパス・地図 */
export const hudPanelStyleCompact = (overrides = {}) => panelBase({
  padding: '8px 10px',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
  ...overrides,
});

export const hudPanelStyleMap = hudPanelStyleCompact;

/** 右下操作ガイドと同系 */
export const controlsGuidePanelStyle = (overrides = {}) => panelBase({
  padding: '15px',
  borderRadius: '15px',
  backdropFilter: 'blur(5px)',
  ...overrides,
});
