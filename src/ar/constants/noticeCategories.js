import { SATISFACTION_ATTR_BY_KEY } from '../../constants/satisfactionAttributes';

export const NOTICE_CATEGORY_OPTIONS = [
  {
    id: 'positive_place',
    label: '良い・心地よい体験だった',
    needType: null,
    group: 'positive',
  },
  {
    id: 'access_walk',
    label: '歩きにくい',
    hint: '段差・狭さ',
    needType: 'P',
    group: 'access',
  },
  {
    id: 'access_connect',
    label: '行き来しにくい',
    hint: '回り道・遠回り',
    needType: 'L',
    group: 'access',
  },
  {
    id: 'access_guide',
    label: '迷いやすい',
    hint: '看板不足・不親切',
    needType: 'I',
    group: 'access',
  },
  {
    id: 'stay_rest',
    label: '休みにくい',
    hint: 'ベンチ・日陰がない',
    needType: 'R',
    group: 'uses',
  },
  {
    id: 'sense_sight',
    label: '見えにくい',
    hint: '暗い・死角',
    needType: 'V',
    group: 'comfort',
  },
  {
    id: 'sense_clean',
    label: '汚れ・荒れ',
    hint: 'ゴミ・放置自転車',
    needType: 'M',
    group: 'comfort',
  },
  {
    id: 'relation_anxiety',
    label: 'こわい・不安',
    hint: '視線がない・危険',
    needType: 'S',
    group: 'sociability',
  },
  {
    id: 'relation_support',
    label: '頼れる場がない',
    hint: '困った時に聞けない',
    needType: 'C',
    group: 'sociability',
  },
];

export const NOTICE_CATEGORY_GROUPS = [
  { id: 'positive', label: '良い体験', emoji: '✨', color: '#f06292', description: '心地よかった場所や体験' },
  { id: 'access', label: '行き来・移動', emoji: '🚶', color: SATISFACTION_ATTR_BY_KEY.link.color, description: '足元・通路・案内' },
  { id: 'uses', label: '滞在・居場所', emoji: '☕', color: SATISFACTION_ATTR_BY_KEY.place.color, description: '座って休む・待つ場所' },
  { id: 'comfort', label: '環境・維持', emoji: '🧹', color: SATISFACTION_ATTR_BY_KEY.livability.color, description: '明るさ・清潔さ・維持管理' },
  { id: 'sociability', label: '安心・社会', emoji: '🤝', color: SATISFACTION_ATTR_BY_KEY.inclusive.color, description: '安心感・困ったとき誰に頼れるか' },
];

export const NOTICE_PERSPECTIVE_OPTIONS = [
  { id: 'wheelchair', label: '車いす' },
  { id: 'stroller', label: 'ベビーカー' },
  { id: 'senior', label: '高齢者' },
  { id: 'child', label: '子ども' },
  { id: 'all', label: 'みんな' },
];

export const NOTICE_INTENSITY_OPTIONS = [
  { id: 'low', label: 'すこし' },
  { id: 'mid', label: '中くらい' },
  { id: 'high', label: 'とても強く' },
];

export function getNoticeCategory(id) {
  return NOTICE_CATEGORY_OPTIONS.find((option) => option.id === id) ?? null;
}

export function categoryIdFromNeedType(needType) {
  return NOTICE_CATEGORY_OPTIONS.find((option) => option.needType === needType)?.id ?? null;
}

export function categoryIdFromAnnotation(annotation = {}) {
  if (annotation.categoryId) return annotation.categoryId;
  if (annotation.kind === 'positive' || annotation.postKind === 'good') return 'positive_place';
  return categoryIdFromNeedType(annotation.needType);
}

export function buildNoticeMessage(categoryId, comment = '') {
  if (categoryId === 'positive_place') {
    return '素敵な場所のシェア、ありがとうございます！マップに記録しますね。';
  }
  const summary = String(comment ?? '').replace(/\s+/g, ' ').replace(/『|』/g, '').trim().slice(0, 40);
  const experience = summary || 'この体験';
  return `${experience}と感じたのですね。この大切な気づきを、まちづくりの議題として共有しますか？`;
}

function plainNoticeMessage(text) {
  return String(text ?? '').replace(/『|』/g, '').trim();
}

export function noticeCategoryPatch(categoryId, classification = {}, comment = '') {
  const category = getNoticeCategory(categoryId);
  if (!category) return {};
  const positive = category.id === 'positive_place';
  const message = plainNoticeMessage(
    classification.message
    || classification.classificationMessage
    || buildNoticeMessage(category.id, comment),
  );
  return {
    recordKind: 'notice',
    categoryId: category.id,
    categoryLabel: category.label,
    classificationMessage: message,
    needType: category.needType ?? 'O',
    postKind: positive ? 'good' : 'bad',
    classification: {
      ...classification,
      categoryId: category.id,
      categoryLabel: category.label,
      message,
      suggestedNeedType: category.needType ?? 'O',
    },
  };
}
