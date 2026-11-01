import { PPS_NEED_GROUPS } from './needTypeGroups';

/** @typedef {'access'|'uses'|'comfort'|'sociability'} PpsGroupId */
/** @typedef {'standing'|'special'|'free'} PromptKind */

/**
 * @typedef {Object} PromptSpec
 * @property {string} id
 * @property {'standing'|'special'} kind
 * @property {string} title
 * @property {string} question
 * @property {string} [subtitle]
 * @property {PpsGroupId} [ppsGroup]
 * @property {string} [placeArchetype]
 * @property {string} [season]
 * @property {string} [timeTagHint]
 * @property {string[]} [exampleHints]
 * @property {string} [activeFrom] ISO date YYYY-MM-DD
 * @property {string} [activeUntil] ISO date YYYY-MM-DD
 * @property {number} [calendarMonth] 1-12 for standing prompts
 */

export const PPS_GROUP_META = Object.fromEntries(
  PPS_NEED_GROUPS.filter((g) => g.id !== 'other').map((g) => [g.id, g]),
);

/** 常設：月1〜12に対応（PPS 4属性 × 場所をローテ） */
export const STANDING_PROMPTS_BY_MONTH = [
  {
    id: 'standing-01-winter-comfort',
    kind: 'standing',
    calendarMonth: 1,
    ppsGroup: 'comfort',
    season: 'winter',
    placeArchetype: 'road',
    title: '冬の道の快適さ',
    question: '冬の歩道や横断歩道で、いつもと違って感じたことは？',
    subtitle: '見やすさ・路面・標識など、良かったことも気になったことも',
    exampleHints: ['歩きやすかった', '路面が気になった', '標識に気づいた'],
  },
  {
    id: 'standing-02-access-road',
    kind: 'standing',
    calendarMonth: 2,
    ppsGroup: 'access',
    placeArchetype: 'road',
    title: '歩道・横断の行き来',
    question: '歩道や横断歩道を通ったとき、どんなことに気づきましたか？',
    subtitle: '歩きやすさ・つながり・案内など',
    exampleHints: ['通りやすかった', '段差が気になった', '案内が分かりやすい'],
  },
  {
    id: 'standing-03-sociability-lane',
    kind: 'standing',
    calendarMonth: 3,
    ppsGroup: 'sociability',
    placeArchetype: 'lane',
    title: '路地・住宅街の安心',
    question: '路地や住宅街で、どんな雰囲気や人との関わりを感じましたか？',
    subtitle: '人通り・見守り・安心感など',
    exampleHints: ['落ち着いた', '人が少なかった', '声をかけてもらえた'],
  },
  {
    id: 'standing-04-uses-plaza',
    kind: 'standing',
    calendarMonth: 4,
    ppsGroup: 'uses',
    placeArchetype: 'plaza',
    title: '駅前で休める場所',
    question: '駅前や広場で過ごしたとき、どんなことに気づきましたか？',
    subtitle: 'ベンチ・日陰・待合スペースなど',
    exampleHints: ['休みやすかった', '日陰があった', '待つ場所が気になった'],
  },
  {
    id: 'standing-05-access-station',
    kind: 'standing',
    calendarMonth: 5,
    ppsGroup: 'access',
    placeArchetype: 'station',
    title: '駅での移動と案内',
    question: '駅や改札・ホームを利用して、どんなことに気づきましたか？',
    subtitle: '歩きやすさ・接続・案内など',
    exampleHints: ['案内が分かりやすい', '段差が気になった', '乗り換えの距離'],
  },
  {
    id: 'standing-06-comfort-park',
    kind: 'standing',
    calendarMonth: 6,
    ppsGroup: 'comfort',
    season: 'summer',
    placeArchetype: 'park',
    title: '夏の公園・緑地',
    question: '公園や緑地で過ごして、どんなことに気づきましたか？',
    subtitle: '日陰・清掃・照明など',
    exampleHints: ['涼しく休めた', '手入れに気づいた', '夜の明るさ'],
  },
  {
    id: 'standing-07-uses-park',
    kind: 'standing',
    calendarMonth: 7,
    ppsGroup: 'uses',
    placeArchetype: 'park',
    title: '公園の居場所',
    question: '公園で座ったり過ごしたりして、どんなことに気づきましたか？',
    subtitle: 'ベンチ・テーブル・日陰など',
    exampleHints: ['長く過ごせた', '日陰が心地よい', '雨宿りできた'],
  },
  {
    id: 'standing-08-access-plaza',
    kind: 'standing',
    calendarMonth: 8,
    ppsGroup: 'access',
    placeArchetype: 'plaza',
    title: '駅前広場の行き来',
    question: '駅前や広場を行き来して、どんなことに気づきましたか？',
    subtitle: 'イベント時・待ち時間も含めて',
    exampleHints: ['歩きやすかった', '混雑が気になった', '案内を見つけた'],
  },
  {
    id: 'standing-09-sociability-commerce',
    kind: 'standing',
    calendarMonth: 9,
    ppsGroup: 'sociability',
    placeArchetype: 'commerce',
    title: '商業施設の安心',
    question: '店舗街や商業施設で、どんな安心感や人との関わりを感じましたか？',
    subtitle: '混雑・見通し・見守りなど',
    exampleHints: ['店員に聞けた', '混雑が気になった', '見通しが良い'],
  },
  {
    id: 'standing-10-comfort-road',
    kind: 'standing',
    calendarMonth: 10,
    ppsGroup: 'comfort',
    timeTagHint: 'night',
    placeArchetype: 'road',
    title: '夜の道の見え方',
    question: '夜の歩道や横断で、昼間と違ってどんなことに気づきましたか？',
    subtitle: '照明・標識・見通しなど',
    exampleHints: ['明るく安心した', '街灯が気になった', '標識が見えた'],
  },
  {
    id: 'standing-11-access-transit',
    kind: 'standing',
    calendarMonth: 11,
    ppsGroup: 'access',
    placeArchetype: 'bus_stop',
    title: 'バス停・乗り場',
    question: 'バス停や乗り場を利用して、どんなことに気づきましたか？',
    subtitle: '待合・案内・接続など',
    exampleHints: ['待ちやすかった', '時刻表が見やすい', '駅までの距離'],
  },
  {
    id: 'standing-12-good-spots',
    kind: 'standing',
    calendarMonth: 12,
    ppsGroup: 'uses',
    title: '今年助かった場所',
    question: '今年、街の中で印象に残った体験を教えてください。',
    subtitle: '良かったことも、気になったことも記録できます',
    exampleHints: ['休めた場所', '気になった道', '分かりやすい看板'],
  },
];

/**
 * 特設お題 — activeFrom〜activeUntil の期間内のみ表示
 * デモ用に1件（期間外）。運営者が日付を更新して有効化。
 */
export const SPECIAL_PROMPTS = [
  {
    id: 'special-demo-park',
    kind: 'special',
    ppsGroup: 'uses',
    placeArchetype: 'park',
    title: '新公園の入口（デモ）',
    question: '新しくできる公園の入口で、どんなことに気づきましたか？',
    subtitle: '特設キャンペーンの例。良かったことも気になったことも',
    exampleHints: ['入口が分かりやすい', 'ベンチがあった', '案内が気になった'],
    activeFrom: '2099-01-01',
    activeUntil: '2099-01-31',
  },
];
