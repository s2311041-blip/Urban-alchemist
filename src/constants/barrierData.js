import { DEGREE_PICTOGRAMS, GENRE_PICTOGRAMS, WHEN_PICTOGRAMS, WHO_PICTOGRAMS } from './pictogramAssets';

export const BARRIER_SCALE = {
  POINT: 'point',
  LINE: 'line',
  AREA: 'area',
};

export const BARRIER_FACTOR = {
  HARD: 'hard',
  SOFT: 'soft',
  HUMAN: 'human',
};

/**
 * 3x3土台（scale x factor）:
 * - point は現行プレイで利用
 * - line / area はフェーズ拡張用の受け皿
 */
export const BARRIER_GRID_TEMPLATE = {
  [BARRIER_SCALE.POINT]: {
    [BARRIER_FACTOR.HARD]: ['dark', 'danger'],
    [BARRIER_FACTOR.SOFT]: ['dirty'],
    [BARRIER_FACTOR.HUMAN]: ['lonely'],
  },
  [BARRIER_SCALE.LINE]: {
    [BARRIER_FACTOR.HARD]: ['line_step_gap'],
    [BARRIER_FACTOR.SOFT]: ['line_sign_confusion'],
    [BARRIER_FACTOR.HUMAN]: ['line_care_disconnect'],
  },
  [BARRIER_SCALE.AREA]: {
    [BARRIER_FACTOR.HARD]: ['area_barrier_cluster'],
    [BARRIER_FACTOR.SOFT]: ['area_maintenance_gap'],
    [BARRIER_FACTOR.HUMAN]: ['area_isolation'],
  },
};

export const PLAN_LABEL = {
  lighting: '照明を増やす（環境改善）',
  hard_fix: '段差を解消する（ハード整備）',
  detour_path: '迂回ルートを作る（動線変更）',
  transit_link: '海列車をつなぐ（移動支援）',
  mobility_support: '移動支援を導入する（交通手段の提供）',
  maintenance: '維持しやすい空間にする（環境美化）',
  sign_info: '案内で誘導する（ソフト整備・情報）',
  care_point: '見守り拠点をつくる（人的・社会的支援）',
};

export const PLAN_DESCRIPTION = {
  lighting: '暗い場所や死角に明かりを置き、不安を取り除きます。',
  hard_fix: '物理的な障壁を取り除き、車椅子やベビーカーでも通れるようにします。',
  detour_path: '通れない場所を避けて、安全に移動できる新しいルートを用意します。',
  transit_link: '離れた場所同士を船などで結び、移動のハードルを下げます。',
  mobility_support: 'バスやタクシーなど、歩かずに移動できる手段を提供します。',
  maintenance: 'ゴミや放置自転車などを防ぐため、綺麗に保たれる空間をデザインします。',
  sign_info: '迷いやすい場所に看板などを置き、正しい道順を案内します。',
  care_point: '人が留まれる場所を作り、困っている人を誰かが見守れるようにします。',
};

/** 建築パレット（ControlBottomBar）と同じブロック表記 */
export const BUILD_BLOCK_LABEL = {
  light_pole: '街灯',
  slope: '階段',
  half: 'ハーフ',
  path: '歩道',
  bench: 'ベンチ',
  sign_post: '案内看板',
  ferry_dock: 'フェリー乗り場',
};

const B = BUILD_BLOCK_LABEL;

/** プレイヤー向け scale 表示（点/線/面 ではなく困り方の広がりで説明） */
export const SCALE_UI = {
  point: {
    label: '一点の問題',
    shortLabel: '一点',
    subtitle: 'この場所だけ',
    placeHint: 'この場所の近く',
    radiusMeters: 6,
    bg: '#546e7a',
    border: 'rgba(84,110,122,0.65)',
  },
  line: {
    label: '動線の問題',
    shortLabel: '動線',
    subtitle: '通り道・ルート沿い',
    placeHint: '通り道の近く',
    radiusMeters: 8,
    bg: '#3949ab',
    border: 'rgba(57,73,171,0.65)',
  },
  area: {
    label: '周辺エリアの問題',
    shortLabel: '周辺',
    subtitle: '広い範囲全体',
    placeHint: '周辺エリア内',
    radiusMeters: 11,
    bg: '#6a1b9a',
    border: 'rgba(106,27,154,0.65)',
  },
};

export const PLAN_HINT = {
  lighting: `${B.light_pole}を不満地点の近くに置く`,
  hard_fix: `${B.slope}または${B.half}を不満地点の近くに置く`,
  detour_path: `${B.path}を連続してつなぎ、迂回できる道を作る`,
  transit_link: `${B.ferry_dock}を本島と離島に置いて航路をつなぐ`,
  mobility_support: `${B.path}や${B.bench}を置いてバス停・移動拠点の代わりにする`,
  maintenance: `${B.bench}と${B.path}を置いて、休める・歩ける空間にする`,
  sign_info: `${B.sign_post}を置いて、行き先が分かるようにする`,
  care_point: `${B.bench}と${B.light_pole}を置いて、休んで見守ってもらえる場所にする`,
};

export const PLAN_HINT_BY_SCALE = {
  point: {
    lighting: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）に「${B.light_pole}」を1つ置く`,
    hard_fix: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）に「${B.slope}」または「${B.half}」を1つ置く`,
    detour_path: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）で「${B.path}」を3つ以上つなげる`,
    transit_link: `本島と離島の両方に「${B.ferry_dock}」を1つずつ置いて航路を有効化する`,
    maintenance: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）に「${B.bench}」1つと「${B.path}」2つ以上置く`,
    sign_info: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）に「${B.sign_post}」1つ、または「${B.bench}」+「${B.path}」`,
    care_point: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）に「${B.bench}」1つと「${B.light_pole}」1つ置く`,
  },
  line: {
    lighting: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）に「${B.light_pole}」を2つ置く`,
    hard_fix: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）に「${B.slope}」または「${B.half}」を2つ置く`,
    detour_path: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）で「${B.path}」を5つ以上つなげる`,
    transit_link: `本島と離島に「${B.ferry_dock}」を1つずつ置き、移動ルートをつなげる`,
    maintenance: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）に「${B.bench}」1つと「${B.path}」4つ以上置く`,
    sign_info: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）に「${B.sign_post}」1つ、または「${B.bench}」+「${B.path}」2つ以上`,
    care_point: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）に「${B.bench}」1つと「${B.light_pole}」2つ置く`,
  },
  area: {
    lighting: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）に「${B.light_pole}」を2つ置く`,
    hard_fix: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）に「${B.slope}」または「${B.half}」を3つ置く`,
    detour_path: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）で「${B.path}」を6つ以上つなげる`,
    transit_link: `エリア内の拠点間を「${B.ferry_dock}」で接続し、航路を確保する`,
    maintenance: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）に「${B.bench}」2つと「${B.path}」5つ以上置く`,
    sign_info: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）に「${B.sign_post}」1つ、または「${B.bench}」2つ+「${B.path}」3つ以上`,
    care_point: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）に「${B.bench}」2つと「${B.light_pole}」2つ置く`,
  },
};

export const PLAN_FAIL_MESSAGE = {
  lighting: `「${B.light_pole}」が足りません。建築メニューから置いてください。`,
  hard_fix: `段差解消が足りません。「${B.slope}」または「${B.half}」を置いてください。`,
  detour_path: `迂回ルートが足りません。「${B.path}」を連続してつないでください。`,
  transit_link: `航路が未接続です。「${B.ferry_dock}」を本島と離島に置いてください。`,
  maintenance: `休める・歩ける空間が足りません。「${B.bench}」と「${B.path}」を追加してください。`,
  sign_info: `案内が足りません。「${B.sign_post}」を置くか、「${B.bench}」と「${B.path}」で代用してください。`,
  care_point: `見守り拠点が足りません。「${B.bench}」と「${B.light_pole}」を追加してください。`,
};

/** scale 別の判定失敗メッセージ（建築パレット表記・半径を明示） */
export const PLAN_FAIL_MESSAGE_BY_SCALE = {
  point: {
    lighting: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）に「${B.light_pole}」が1つ必要です。`,
    hard_fix: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）に「${B.slope}」または「${B.half}」が1つ必要です。`,
    detour_path: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）で「${B.path}」を3つ以上つなげてください。`,
    transit_link: `「${B.ferry_dock}」を本島と離島に1つずつ置いて航路をつないでください。`,
    maintenance: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）に「${B.bench}」1つと「${B.path}」2つ以上が必要です。`,
    sign_info: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）に「${B.sign_post}」1つ、または「${B.bench}」1つ+「${B.path}」1つ以上が必要です。`,
    care_point: `${SCALE_UI.point.placeHint}（約${SCALE_UI.point.radiusMeters}m）に「${B.bench}」1つと「${B.light_pole}」1つが必要です。`,
  },
  line: {
    lighting: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）に「${B.light_pole}」が2つ必要です。`,
    hard_fix: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）に「${B.slope}」または「${B.half}」が2つ必要です。`,
    detour_path: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）で「${B.path}」を5つ以上つなげてください。`,
    transit_link: `「${B.ferry_dock}」が足りないか、本島と離島を結ぶ航路になっていません。`,
    maintenance: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）に「${B.bench}」1つと「${B.path}」4つ以上が必要です。`,
    sign_info: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）に「${B.sign_post}」1つ、または「${B.bench}」1つ+「${B.path}」2つ以上が必要です。`,
    care_point: `${SCALE_UI.line.placeHint}（約${SCALE_UI.line.radiusMeters}m）に「${B.bench}」1つと「${B.light_pole}」2つが必要です。`,
  },
  area: {
    lighting: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）に「${B.light_pole}」が2つ必要です。`,
    hard_fix: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）に「${B.slope}」または「${B.half}」が3つ必要です。`,
    detour_path: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）で「${B.path}」を6つ以上つなげてください。`,
    transit_link: `エリア内の港が未接続です。「${B.ferry_dock}」を2地点以上に置いてください。`,
    maintenance: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）に「${B.bench}」2つと「${B.path}」5つ以上が必要です。`,
    sign_info: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）に「${B.sign_post}」1つ、または「${B.bench}」2つ+「${B.path}」3つ以上が必要です。`,
    care_point: `${SCALE_UI.area.placeHint}（約${SCALE_UI.area.radiusMeters}m）に「${B.bench}」2つと「${B.light_pole}」2つが必要です。`,
  },
};

export const getPlanFailMessage = (plan, scale = 'point') => {
  const normalizedScale = ['point', 'line', 'area'].includes(scale) ? scale : 'point';
  return PLAN_FAIL_MESSAGE_BY_SCALE[normalizedScale]?.[plan]
    ?? PLAN_FAIL_MESSAGE[plan]
    ?? 'まだ条件を満たしていません。';
};

export const getPlanHint = (plan, scale = 'point') => {
  const normalizedScale = ['point', 'line', 'area'].includes(scale) ? scale : 'point';
  return PLAN_HINT_BY_SCALE[normalizedScale]?.[plan]
    ?? PLAN_HINT[plan]
    ?? 'この方法で改善を試してください。';
};

export const getScaleUi = (scale = 'point') => SCALE_UI[scale] ?? SCALE_UI.point;

export const BARRIER_TYPE_META = {
  dark: {
    scale: BARRIER_SCALE.POINT,
    factor: BARRIER_FACTOR.HARD,
    needType: 'V',
    tagLabel: '#特定地点の死角_不安',
    allowedPlans: ['lighting', 'detour_path', 'care_point'],
    defaultPlan: 'lighting',
  },
  danger: {
    scale: BARRIER_SCALE.POINT,
    factor: BARRIER_FACTOR.HARD,
    needType: 'P',
    tagLabel: '#局所的欠損_障壁',
    allowedPlans: ['hard_fix', 'detour_path', 'sign_info'],
    defaultPlan: 'hard_fix',
  },
  dirty: {
    scale: BARRIER_SCALE.POINT,
    factor: BARRIER_FACTOR.SOFT,
    needType: 'M',
    tagLabel: '#局所的キャパ不足',
    allowedPlans: ['maintenance', 'hard_fix', 'care_point'],
    defaultPlan: 'maintenance',
  },
  lonely: {
    scale: BARRIER_SCALE.POINT,
    factor: BARRIER_FACTOR.HUMAN,
    needType: 'S',
    tagLabel: '#孤立感_心理的バリア',
    allowedPlans: ['care_point', 'sign_info'],
    defaultPlan: 'care_point',
  },
  // --- ここから先は 3x3 土台用（後続フェーズで有効化） ---
    line_step_gap: {
    scale: BARRIER_SCALE.LINE,
    factor: BARRIER_FACTOR.HARD,
    needType: 'L',
    tagLabel: '#線的欠損_段差連続',
    allowedPlans: ['hard_fix', 'detour_path', 'mobility_support', 'transit_link'],
    defaultPlan: 'detour_path',
  },
  line_sign_confusion: {
    scale: BARRIER_SCALE.LINE,
    factor: BARRIER_FACTOR.SOFT,
    needType: 'I',
    tagLabel: '#線的欠損_案内不足',
    allowedPlans: ['sign_info', 'maintenance'],
    defaultPlan: 'sign_info',
  },
  line_care_disconnect: {
    scale: BARRIER_SCALE.LINE,
    factor: BARRIER_FACTOR.HUMAN,
    needType: 'C',
    tagLabel: '#線的欠損_見守り断絶',
    allowedPlans: ['care_point', 'sign_info'],
    defaultPlan: 'care_point',
  },
  area_barrier_cluster: {
    scale: BARRIER_SCALE.AREA,
    factor: BARRIER_FACTOR.HARD,
    needType: 'P',
    tagLabel: '#面的欠損_物理障壁',
    allowedPlans: ['hard_fix', 'detour_path'],
    defaultPlan: 'hard_fix',
  },
  area_maintenance_gap: {
    scale: BARRIER_SCALE.AREA,
    factor: BARRIER_FACTOR.SOFT,
    needType: 'M',
    tagLabel: '#面的欠損_維持不足',
    allowedPlans: ['maintenance', 'sign_info'],
    defaultPlan: 'maintenance',
  },
  area_isolation: {
    scale: BARRIER_SCALE.AREA,
    factor: BARRIER_FACTOR.HUMAN,
    needType: 'S',
    tagLabel: '#面的欠損_孤立',
    allowedPlans: ['care_point', 'sign_info'],
    defaultPlan: 'care_point',
  },
};

/**
 * 現在ゲームで投稿・発生させるタイプ（段階的に拡張）
 */
export const ACTIVE_BARRIER_TYPE_IDS = [
  'danger',
  'dirty',
  'dark',
  'lonely',
  'line_sign_confusion',
  'area_maintenance_gap',
  'line_step_gap',
  'area_isolation',
];

/**
 * AR投稿UI等で使う表示メタ
 */
export const BARRIER_TYPE_UI = {
  danger: { label: '危ない', color: '#ffebee' },
  dirty: { label: '汚い', color: '#fff3e0' },
  dark: { label: '暗い', color: '#e0f7fa' },
  lonely: { label: '孤立感', color: '#f3e5f5' },
  line_sign_confusion: { label: '迷いやすい', color: '#e3f2fd' },
  area_maintenance_gap: { label: '休みにくい', color: '#f1f8e9' },
  line_step_gap: { label: '通り道がつらい', color: '#e8eaf6' },
  area_isolation: { label: '周辺に頼れない', color: '#ede7f6' },
};

/**
 * AR投稿向け: 初学者に分かりやすい「困り方」ジャンル（needType 8種）
 */
export const NEED_CATEGORY_OPTIONS = [
  { needType: 'P', iconSrc: GENRE_PICTOGRAMS.P, label: '歩きにくい', hint: '段差・狭さ・通りづらさ' },
  { needType: 'V', iconSrc: GENRE_PICTOGRAMS.V, label: '見えにくい', hint: '暗さ・死角・視認性' },
  { needType: 'I', iconSrc: GENRE_PICTOGRAMS.I, label: '迷いやすい', hint: '案内不足・分岐が分かりにくい' },
  { needType: 'M', iconSrc: GENRE_PICTOGRAMS.M, label: '汚れ・荒れ', hint: '清掃・維持が追いつかない' },
  { needType: 'R', iconSrc: GENRE_PICTOGRAMS.R, label: '休みにくい', hint: '座る・待つ場所が足りない' },
  { needType: 'S', iconSrc: GENRE_PICTOGRAMS.S, label: 'こわい・不安', hint: '心理的に安心できない' },
  { needType: 'L', iconSrc: GENRE_PICTOGRAMS.L, label: '行き来しにくい', hint: '移動手段・アクセスの不足' },
  { needType: 'C', iconSrc: GENRE_PICTOGRAMS.C, label: '頼れる場がない', hint: '支援・見守りに繋がりにくい' },
];

/**
 * needType から、現在のゲームで扱える type へマッピング
 * （3x3土台を維持しつつ、現行プレイは4typeで運用）
 */
export const NEED_TYPE_TO_DEFAULT_TYPE = {
  P: 'danger',
  V: 'dark',
  I: 'line_sign_confusion',
  M: 'dirty',
  R: 'area_maintenance_gap',
  L: 'line_step_gap',
  S: 'lonely',
  C: 'area_isolation',
};

export const TARGET_GROUP_OPTIONS = [
  { id: 'all', label: 'みんな', iconSrc: WHO_PICTOGRAMS.all },
  { id: 'senior', label: '高齢者', iconSrc: WHO_PICTOGRAMS.senior },
  { id: 'wheelchair', label: '車いす', iconSrc: WHO_PICTOGRAMS.wheelchair },
  { id: 'stroller', label: 'ベビーカー', iconSrc: WHO_PICTOGRAMS.stroller },
  { id: 'child', label: '子ども', iconSrc: WHO_PICTOGRAMS.child },
  { id: 'tourist', label: '観光客', iconSrc: WHO_PICTOGRAMS.tourist },
];

export const TIME_TAG_OPTIONS = [
  { id: 'morning', label: '朝', iconSrc: WHEN_PICTOGRAMS.morning },
  { id: 'day', label: '昼', iconSrc: WHEN_PICTOGRAMS.day },
  { id: 'evening', label: '夕方', iconSrc: WHEN_PICTOGRAMS.evening },
  { id: 'night', label: '夜', iconSrc: WHEN_PICTOGRAMS.night },
  { id: 'always', label: '常時', iconSrc: WHEN_PICTOGRAMS.always },
];

export const SEVERITY_OPTIONS = [
  { id: 'low', label: '軽い', iconSrc: DEGREE_PICTOGRAMS.low },
  { id: 'mid', label: '中くらい', iconSrc: DEGREE_PICTOGRAMS.mid },
  { id: 'high', label: '深刻', iconSrc: DEGREE_PICTOGRAMS.high },
];

export const TARGET_GROUP_ICON_BY_LABEL = Object.fromEntries(
  TARGET_GROUP_OPTIONS.map((opt) => [opt.label, opt.iconSrc]),
);
export const TIME_TAG_ICON_BY_LABEL = Object.fromEntries(
  TIME_TAG_OPTIONS.map((opt) => [opt.label, opt.iconSrc]),
);
export const SEVERITY_ICON_BY_ID = Object.fromEntries(
  SEVERITY_OPTIONS.map((opt) => [opt.id, opt.iconSrc]),
);

export const TYPE_TO_BARRIER_META = BARRIER_TYPE_META;

export const DEFAULT_BARRIER_META = {
  scale: BARRIER_SCALE.POINT,
  factor: BARRIER_FACTOR.HARD,
  needType: 'P',
  tagLabel: '#局所的欠損_障壁',
  allowedPlans: ['hard_fix'],
  defaultPlan: 'hard_fix',
};

export const BUG_RESOLVE_RADIUS = 6;
