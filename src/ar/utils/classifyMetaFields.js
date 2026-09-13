import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';
import { inferPlaceFromText, normalizeClassifyText } from './classifyDraft';

/** 入力欄下に表示する例（タップで追記 — 固定属性への変換はしない） */
export const PLACE_INPUT_HINTS = ['駅', '駅前', '広場', '歩道', '公園', '商店街', 'バス停', '路地', '水辺'];
export const WHO_INPUT_HINTS = ['みんな', '高齢者', '女性', '車いす', '夜一人'];
export const CONTEXT_INPUT_HINTS = ['常時', '夜', '夕方', '軽い', '中くらい', '深刻'];

const TIME_LEXICON = {
  morning: ['朝', '早朝', '午前', 'morning'],
  day: ['昼', '日中', '午後', 'day'],
  evening: ['夕方', '夕暮', '黄昏', 'evening'],
  night: ['夜', '夜間', '深夜', 'night'],
  always: ['常時', 'いつも', 'いつでも', '常に', 'always'],
};

const SEVERITY_LEXICON = {
  low: ['軽い', '少し', '軽度', '軽微', 'low'],
  mid: ['中', '中くらい', '普通', 'mid'],
  high: ['深刻', 'ひどい', '大変', '危ない', '危険', 'high'],
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
  const labels = { morning: '朝', day: '昼', evening: '夕方', night: '夜', always: '常時' };
  return labels[timeTagId] ?? '常時';
}

export function getSeverityLabel(severityId) {
  const labels = { low: '軽い', mid: '中くらい', high: '深刻' };
  return labels[severityId] ?? '中くらい';
}
