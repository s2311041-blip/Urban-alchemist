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
  P: '段差・狭さなど、ここを歩くのがつらい',
  L: 'AからBへ移動・接続がつながらない',
  I: '行き方・案内が足りない',
  V: '暗さ・死角など、目で見えない',
  M: '清掃・維持が追いついていない',
  R: '座る・待つ場所が足りない',
  S: '人・雰囲気などで安心できない',
  C: '支援・見守りの接点がない',
  O: '上記8つに当てはまらない',
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
