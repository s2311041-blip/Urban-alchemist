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
  {
    id: 'other',
    label: 'その他',
    emoji: '💬',
    color: '#78909c',
    options: ['O'],
  },
];

/** ピッカー用 hint（境界を明確化） */
export const NEED_TYPE_PICKER_HINTS = {
  P: '段差、傾斜、道幅の狭さなど',
  L: '通り抜けできない、目的地への移動が不便',
  I: '案内看板がない、出口や行き先が不明',
  V: '街灯が暗い、曲がり角の死角で見えない',
  M: '清掃されていない、雑草や放置物、落書き',
  R: 'ベンチや日陰、雨宿りできる場所が不足',
  S: '交通量が多くて危険、夜間の治安が不安',
  C: '交番や案内所がない、緊急時に頼れる場所がない',
  O: '上記のどれにも当てはまらない',
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
