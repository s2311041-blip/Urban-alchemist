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
    question: '冬の歩道や横断歩道で、見えにくい・滑りやすい・不安を感じた場所は？',
    subtitle: '暗さ・路面・標識など、環境・維持の視点で',
    exampleHints: ['滑る', '暗い', '標識が見えない'],
  },
  {
    id: 'standing-02-access-road',
    kind: 'standing',
    calendarMonth: 2,
    ppsGroup: 'access',
    placeArchetype: 'road',
    title: '歩道・横断の行き来',
    question: '歩道や横断歩道で、歩きにくい・つながらない・迷った場所は？',
    subtitle: '段差・狭さ・案内・迂回など',
    exampleHints: ['段差', '狭い', '迷った'],
  },
  {
    id: 'standing-03-sociability-lane',
    kind: 'standing',
    calendarMonth: 3,
    ppsGroup: 'sociability',
    placeArchetype: 'lane',
    title: '路地・住宅街の安心',
    question: '路地や住宅街で、不安・頼れなさを感じた場所は？',
    subtitle: '人通り・見守り・雰囲気など',
    exampleHints: ['人が少ない', '暗い', '助けを求めにくい'],
  },
  {
    id: 'standing-04-uses-plaza',
    kind: 'standing',
    calendarMonth: 4,
    ppsGroup: 'uses',
    placeArchetype: 'plaza',
    title: '駅前で休める場所',
    question: '駅前や広場で、休めない・待てないと感じた場所は？',
    subtitle: 'ベンチ・日陰・待合スペースなど',
    exampleHints: ['ベンチがない', '日陰がない', '待てない'],
  },
  {
    id: 'standing-05-access-station',
    kind: 'standing',
    calendarMonth: 5,
    ppsGroup: 'access',
    placeArchetype: 'station',
    title: '駅での移動と案内',
    question: '駅や改札・ホームで、歩きにくい・迷った・行き来しにくい場所は？',
    subtitle: '段差・接続・案内など',
    exampleHints: ['段差', '出口が分からない', '乗り換えが遠い'],
  },
  {
    id: 'standing-06-comfort-park',
    kind: 'standing',
    calendarMonth: 6,
    ppsGroup: 'comfort',
    season: 'summer',
    placeArchetype: 'park',
    title: '夏の公園・緑地',
    question: '公園や緑地で、暑い・汚い・見えにくいと感じた場所は？',
    subtitle: '日陰・清掃・照明など',
    exampleHints: ['日陰がない', 'ゴミ', '夜暗い'],
  },
  {
    id: 'standing-07-uses-park',
    kind: 'standing',
    calendarMonth: 7,
    ppsGroup: 'uses',
    placeArchetype: 'park',
    title: '公園の居場所',
    question: '公園で、座って休めない・長く滞在しにくい場所は？',
    subtitle: 'ベンチ・テーブル・日陰など',
    exampleHints: ['ベンチ不足', '日陰', '雨宿り'],
  },
  {
    id: 'standing-08-access-plaza',
    kind: 'standing',
    calendarMonth: 8,
    ppsGroup: 'access',
    placeArchetype: 'plaza',
    title: '駅前広場の行き来',
    question: '駅前や広場で、歩きにくい・つながらない・迷った場所は？',
    subtitle: 'イベント時・待ち時間も含めて',
    exampleHints: ['段差', '混雑', '案内不足'],
  },
  {
    id: 'standing-09-sociability-commerce',
    kind: 'standing',
    calendarMonth: 9,
    ppsGroup: 'sociability',
    placeArchetype: 'commerce',
    title: '商業施設の安心',
    question: '店舗街や商業施設で、不安・頼れなさを感じた場所は？',
    subtitle: '混雑・死角・見守りなど',
    exampleHints: ['混む', '迷子', '助けを求めにくい'],
  },
  {
    id: 'standing-10-comfort-road',
    kind: 'standing',
    calendarMonth: 10,
    ppsGroup: 'comfort',
    timeTagHint: 'night',
    placeArchetype: 'road',
    title: '夜の道の見え方',
    question: '夜の歩道や横断で、暗い・見えにくい・不安な場所は？',
    subtitle: '照明・標識・死角など',
    exampleHints: ['暗い', '街灯が少ない', '見えない'],
  },
  {
    id: 'standing-11-access-transit',
    kind: 'standing',
    calendarMonth: 11,
    ppsGroup: 'access',
    placeArchetype: 'bus_stop',
    title: 'バス停・乗り場',
    question: 'バス停や乗り場で、歩きにくい・つながらない・分かりにくい場所は？',
    subtitle: '待合・案内・接続など',
    exampleHints: ['屋根がない', '時刻表', '駅まで遠い'],
  },
  {
    id: 'standing-12-good-spots',
    kind: 'standing',
    calendarMonth: 12,
    ppsGroup: 'uses',
    title: '今年助かった場所',
    question: '今年、休めた・助かった・良かった場所を教えてください。',
    subtitle: '良い場所の記録（困りごと以外も歓迎）',
    exampleHints: ['ベンチ', '日陰', '看板が分かりやすい'],
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
    question: '新しくできる公園の入口について、休める・迷う・困る点は？',
    subtitle: '特設キャンペーンの例',
    exampleHints: ['入口', 'ベンチ', '案内'],
    activeFrom: '2099-01-01',
    activeUntil: '2099-01-31',
  },
];
