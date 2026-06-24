/** 右下操作ガイド（アバター）と右上HUDで揃える幅 */
export const SIDE_PANEL_WIDTH = 260;

export const SIDE_PANEL_INSET = 20;

/** アバター操作ガイドのおおよその高さ（ヒント被り回避用） */
export const CONTROLS_GUIDE_AVATAR_HEIGHT = 172;

export const interactionHintBottomPx = () => (
  SIDE_PANEL_INSET + CONTROLS_GUIDE_AVATAR_HEIGHT + 12
);
