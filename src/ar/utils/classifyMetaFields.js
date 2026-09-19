import { TIME_TAG_OPTIONS, SEVERITY_OPTIONS } from '../../constants/barrierData';
import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';
import { inferPlaceFromText, normalizeClassifyText } from './classifyDraft';

/** 入力欄下に表示する例（場所はタップで確定、誰はタップで追記） */
export const PLACE_INPUT_HINTS = ['歩道', '公園・広場', '駅前', '商店街', 'バス停', '路地'];
export const PLACE_INPUT_HINTS_GOOD = ['広場', '公園', 'ベンチ・休憩所', '歩道', 'カフェ・店舗', '水辺'];
export const WHO_INPUT_HINTS = ['みんな', '車いす・ベビーカー', '高齢者', '子ども・親子', '夜の一人歩き'];
export const CONTEXT_INPUT_HINTS = ['いつでも', '夜', '夕方', 'すこし', '中くらい', 'かなり深刻'];

/** ヒントタグをそのまま選んだときの場所型（自由記述は語彙推定に任せる） */
export const PLACE_HINT_TO_ARCHETYPE = {
  歩道: 'road',
  '公園・広場': 'park',
  駅前: 'plaza',
  商店街: 'commerce',
  バス停: 'bus_stop',
  路地: 'lane',
  広場: 'plaza',
  公園: 'park',
  'ベンチ・休憩所': 'park',
  'カフェ・店舗': 'commerce',
  水辺: 'waterfront',
};

const TIME_LEXICON = {
  morning: ['朝', '早朝', '午前', 'morning'],
  day: ['昼', '日中', '午後', 'day'],
  evening: ['夕方', '夕暮', '黄昏', 'evening'],
  night: ['夜', '夜間', '深夜', 'night'],
  always: ['常時', 'いつも', 'いつでも', '常に', 'always'],
};

const SEVERITY_LEXICON = {
  low: ['軽い', '少し', 'すこし', '軽度', '軽微', 'low'],
  mid: ['中', '中くらい', '普通', 'mid'],
  high: ['深刻', 'かなり深刻', 'ひどい', '大変', '危ない', '危険', 'high'],
};

function matchLexicon(text, lexicon) {
  const normalized = normalizeClassifyText(text);
  let bestId = null;
  let bestScore = 0;
  Object.entries(lexicon).forEach(([id, words]) => {
    let score = 0;
    words.forEach((word) => {
      if (normalized.includes(normalizeClassifyText(word))) score += 1;
    });
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  });
  return bestId;
}

export function inferTimeTagFromText(text = '') {
  return matchLexicon(text, TIME_LEXICON) ?? 'always';
}

export function inferSeverityFromText(text = '') {
  return matchLexicon(text, SEVERITY_LEXICON) ?? 'mid';
}

export function inferPlaceArchetypeFromText(text = '') {
  const hintArchetype = PLACE_HINT_TO_ARCHETYPE[text.trim()];
  if (hintArchetype) {
    return { placeArchetype: hintArchetype, placeSource: 'hint' };
  }

  const fromLexicon = inferPlaceFromText(text);
  if (fromLexicon.placeArchetype) {
    return { placeArchetype: fromLexicon.placeArchetype, placeSource: 'keyword' };
  }

  const normalized = normalizeClassifyText(text);
  const byLabel = KOTO_PLACE_OPTIONS.find((opt) => (
    opt.id !== 'none' && normalized.includes(normalizeClassifyText(opt.label))
  ));
  if (byLabel) {
    return { placeArchetype: byLabel.id, placeSource: 'label' };
  }

  return { placeArchetype: text.trim() ? 'none' : null, placeSource: 'none' };
}

/** 自由記述フィールド → 構造化メタ（whoText はそのまま保存、属性チップへは変換しない） */
export function classifyMetaFromDraft(draft = {}) {
  const placeText = draft.placeText?.trim() ?? '';
  const whoText = draft.whoText?.trim() ?? '';
  const contextText = draft.contextText?.trim() ?? '';

  const place = placeText
    ? inferPlaceArchetypeFromText(placeText)
    : { placeArchetype: draft.placeArchetype ?? null, placeSource: 'user' };

  const timeTag = draft.timeTag
    ?? (contextText ? inferTimeTagFromText(contextText) : 'always');

  const severity = draft.severity
    ?? (contextText ? inferSeverityFromText(contextText) : 'mid');

  return {
    placeText: placeText || null,
    whoText: whoText || null,
    contextText: contextText || null,
    placeArchetype: place.placeArchetype,
    placeSource: place.placeSource,
    affectedGroups: Array.isArray(draft.affectedGroups) ? [...draft.affectedGroups] : [],
    affectedOther: draft.affectedOther?.trim() ?? '',
    timeTag,
    severity,
  };
}

export function getPlaceDisplayLabel(placeArchetype, placeText) {
  if (placeText?.trim()) return placeText.trim();
  const opt = KOTO_PLACE_OPTIONS.find((o) => o.id === placeArchetype);
  return opt?.label ?? '未選択';
}

/** LLM 分類用 — チップ選択を短い文脈文字列にまとめる */
export function buildClassificationContext(draft = {}) {
  const parts = [];
  const timeTag = draft.timeTag ?? 'always';
  const severity = draft.severity ?? 'mid';
  if (timeTag !== 'always') parts.push(getTimeTagLabel(timeTag));
  if (severity !== 'mid') parts.push(getSeverityLabel(severity));
  if (draft.contextText?.trim()) parts.push(draft.contextText.trim());
  return parts.join('、');
}

export function getTimeTagLabel(timeTagId) {
  return TIME_TAG_OPTIONS.find((opt) => opt.id === timeTagId)?.label ?? 'いつでも';
}

export function getSeverityLabel(severityId) {
  return SEVERITY_OPTIONS.find((opt) => opt.id === severityId)?.label ?? '中くらい';
}
