// src/constants/gameData.js
import { PALETTE } from './artDirection';

export const keyboardMap = [
  // 散歩・船・建築カメラ移動で共有（WASD は建築モードの素材ショートカットと競合するため矢印のみ）
  { name: 'forward', keys: ['ArrowUp'] },
  { name: 'backward', keys: ['ArrowDown'] },
  { name: 'left', keys: ['ArrowLeft'] },
  { name: 'right', keys: ['ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
];

/** 3Dブロックの見た目（docs/03_ゲームの仕様.md と同期） */
export const BLOCK_MATERIALS = {
  stone: { color: PALETTE.stone, roughness: 0.92, metalness: 0, flatShading: true },
  wood: { color: PALETTE.wood, roughness: 0.92, metalness: 0, flatShading: true },
  brick: { color: '#EF9A9A', roughness: 0.92, metalness: 0, flatShading: true },
  water: { color: PALETTE.water, roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.75, flatShading: true },
  light: { color: PALETTE.lampWarm, roughness: 0.85, metalness: 0, emissive: PALETTE.lampEmissive, emissiveIntensity: 1.8, flatShading: true },
  grass: { color: PALETTE.grass, roughness: 0.95, metalness: 0, flatShading: true },
  glass: { color: '#E1F5FE', roughness: 0.3, metalness: 0.35, transparent: true, opacity: 0.55, flatShading: true },
  iron: { color: '#546E7A', roughness: 0.55, metalness: 0.35, flatShading: true },
  sand: { color: '#FFE082', roughness: 0.95, metalness: 0, flatShading: true },
  mana: { color: PALETTE.mana, roughness: 0.35, metalness: 0.1, emissive: PALETTE.accentBright, emissiveIntensity: 2.2, flatShading: true },
};

/** UIスウォッチ用（BLOCK_MATERIALS と同色） */
export const MATERIAL_COLORS = Object.fromEntries(
  Object.entries(BLOCK_MATERIALS).map(([id, def]) => [id, def.color]),
);

export const BUILD_MATERIAL_OPTIONS = [
  { id: 'stone', label: '石', icon: '⛰️', shortcut: 'Q' },
  { id: 'wood', label: '木', icon: '🪵', shortcut: 'W' },
  { id: 'water', label: '水', icon: '💧', shortcut: 'E' },
  { id: 'brick', label: 'レンガ', icon: '🧱', shortcut: 'R' },
  { id: 'light', label: '光', icon: '✨', shortcut: 'T' },
  { id: 'grass', label: '芝生', icon: '🌿', shortcut: 'Y' },
  { id: 'glass', label: 'ガラス', icon: '💎', shortcut: 'U' },
  { id: 'iron', label: '鉄', icon: '⚙️', shortcut: 'I' },
  { id: 'sand', label: '砂', icon: '⏳', shortcut: 'O' },
  { id: 'mana', label: '魔力', icon: '🔮', shortcut: 'P' },
];
