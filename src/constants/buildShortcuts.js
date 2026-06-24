/** 建築モード用ショートカット定義（一覧 UI と将来のヘルプで共用） */

export const BUILD_SHAPE_SHORTCUTS = [
  { key: '1', label: '立方体', shape: 'block' },
  { key: '2', label: 'ハーフ', shape: 'half' },
  { key: '3', label: '階段', shape: 'slope' },
  { key: '4', label: '丸柱', shape: 'pole' },
  { key: '5', label: '歩道', shape: 'path' },
  { key: '6', label: '花（自然）', shape: 'flower' },
  { key: '7', label: '線路', shape: 'rail' },
  { key: '8', label: '斜め', shape: 'diagonal' },
  { key: '9', label: '消去', shape: 'eraser' },
  { key: '0', label: '編集', shape: 'edit' },
];

export const BUILD_MATERIAL_SHORTCUTS = [
  { key: 'Q', label: '石', material: 'stone' },
  { key: 'W', label: '木', material: 'wood' },
  { key: 'E', label: '水', material: 'water' },
  { key: 'R', label: 'レンガ', material: 'brick' },
  { key: 'T', label: '光', material: 'light' },
  { key: 'Y', label: '芝生', material: 'grass' },
  { key: 'U', label: 'ガラス', material: 'glass' },
  { key: 'I', label: '鉄', material: 'iron' },
  { key: 'O', label: '砂', material: 'sand' },
  { key: 'P', label: '魔力', material: 'mana' },
];

export const BUILD_COMMON_SHORTCUTS = [
  { keys: ['Enter'], label: '配置 / 確定' },
  { keys: ['Esc'], label: '選択・設計の解除' },
  { keys: ['F'], label: 'ブロックの回転' },
  { keys: ['Shift', 'S'], label: '範囲選択ツール' },
  { keys: ['⌘/Ctrl', 'Z'], label: '元に戻す' },
  { keys: ['⌘/Ctrl', 'Y'], label: 'やり直し' },
];

export const BUILD_CAMERA_SHORTCUTS = [
  { keys: ['↑', '↓', '←', '→'], label: 'カメラの平行移動' },
  { keys: ['ドラッグ'], label: 'カメラの回転' },
  { keys: ['スクロール'], label: 'ズーム' },
];

export const BUILD_LOCKED_MODE_HINTS = [
  {
    id: 'edit_studio',
    title: '3D編集スタジオ中',
    description: 'Enter で確定、Esc でキャンセルのみ有効です。',
  },
  {
    id: 'diagonal_studio',
    title: '斜め設計スタジオ中',
    description: 'Enter で確定、Esc でキャンセルのみ有効です。',
  },
  {
    id: 'diagonal_island',
    title: '斜めブロック配置中（島上）',
    description: 'Esc のみ有効です。アンカー選択中は Esc で1点目を解除。',
  },
];

/**
 * @returns {'normal' | 'edit_studio' | 'diagonal_studio' | 'diagonal_island'}
 */
export const getBuildShortcutLockMode = ({
  isEditingInStudio,
  isDesigningInStudio,
  isDesigningDiagonal,
  selectedShape,
}) => {
  if (isEditingInStudio) return 'edit_studio';
  if (isDesigningInStudio) return 'diagonal_studio';
  if (selectedShape === 'diagonal' && isDesigningDiagonal) return 'diagonal_island';
  return 'normal';
};

export const arePaletteShortcutsActive = (lockMode) => lockMode === 'normal';

/** App / useBuildKeyboardShortcuts 用（Digit / Key* → shape / material） */
export const BUILD_SHAPE_KEY_MAP = {
  Digit1: 'block',
  Digit2: 'half',
  Digit3: 'slope',
  Digit4: 'pole',
  Digit5: 'path',
  Digit6: 'flower',
  Digit7: 'rail',
  Digit8: 'diagonal',
  Digit9: 'eraser',
  Digit0: 'edit',
};

export const BUILD_MATERIAL_KEY_MAP = {
  KeyQ: 'stone',
  KeyW: 'wood',
  KeyE: 'water',
  KeyR: 'brick',
  KeyT: 'light',
  KeyY: 'grass',
  KeyU: 'glass',
  KeyI: 'iron',
};
