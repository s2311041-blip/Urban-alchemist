import { TIME_TAG_OPTIONS, SEVERITY_OPTIONS } from '../../constants/barrierData';
import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';
import { inferPlaceFromText, normalizeClassifyText } from './classifyDraft';

export const PLACE_OTHER_LABEL = 'その他';

/** 困りごと／良い場所で共通。確認画面・ゲームの場所型と同じ文言 */
export const PLACE_INPUT_HINTS = [
  ...KOTO_PLACE_OPTIONS.filter((opt) => opt.id !== 'none').map((opt) => opt.label),
  PLACE_OTHER_LABEL,
];
export const PLACE_INPUT_HINTS_GOOD = PLACE_INPUT_HINTS;
export const WHO_INPUT_HINTS = ['みんな', '車いす・ベビーカー', '高齢者', '子ども・親子', '夜の一人歩き'];
export const CONTEXT_INPUT_HINTS = ['いつでも', '夜', '夕方', 'すこし', '中くらい', 'かなり深刻'];

/** 定型チップ → 場所型。その他・自由記述は語彙推定、なければ none */
export const PLACE_HINT_TO_ARCHETYPE = Object.fromEntries(
  KOTO_PLACE_OPTIONS.filter((opt) => opt.id !== 'none').map((opt) => [opt.label, opt.id]),
);

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
  const trimmed = text.trim();
  if (trimmed === PLACE_OTHER_LABEL) {
    return { placeArchetype: 'none', placeSource: 'other' };
  }

  const hintArchetype = PLACE_HINT_TO_ARCHETYPE[trimmed];
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
