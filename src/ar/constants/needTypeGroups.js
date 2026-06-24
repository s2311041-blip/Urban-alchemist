import { NEED_CATEGORY_OPTIONS } from '../../constants/barrierData';

/** PPS Place Diagram — 4 属性グループ（docs/困りごと類型整理.pdf） */
export const PPS_NEED_GROUPS = [
  {
    id: 'access',
    label: '行き来・移動',
    emoji: '🚶',
    color: '#3949ab',
    options: ['P', 'L', 'I'],
  },
  {
    id: 'uses',
    label: '滞在・居場所',
    emoji: '☕',
    color: '#388e3c',
    options: ['R'],
  },
  {
    id: 'comfort',
    label: '環境・維持',
    emoji: '🧹',
    color: '#f9a825',
    options: ['M', 'V'],
  },
  {
    id: 'sociability',
    label: '安心・社会',
    emoji: '🤝',
    color: '#ef6c00',
    options: ['S', 'C'],
  },
];

/** ピッカー用 hint（V/S 境界を明確化） */
export const NEED_TYPE_PICKER_HINTS = {
  V: '暗い・死角で見えない',
  S: '人通り・雰囲気で安心できない',
};

const needByType = Object.fromEntries(
  NEED_CATEGORY_OPTIONS.map((o) => [o.needType, o]),
);

export function getNeedTypeOption(needType) {
  const base = needByType[needType];
  if (!base) return null;
  return {
    ...base,
    hint: NEED_TYPE_PICKER_HINTS[needType] ?? base.hint,
  };
}

export function getAllNeedTypeIds() {
  return PPS_NEED_GROUPS.flatMap((g) => g.options);
}
