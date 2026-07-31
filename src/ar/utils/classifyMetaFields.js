import { KOTO_PLACE_OPTIONS } from '../constants/kotoArea';
import { AFFECTED_OTHER_LABEL } from '../constants/arTargetGroups';
import { inferPlaceFromText, normalizeClassifyText } from './classifyDraft';

/** 入力欄下に表示する例（タップで追記） */
export const PLACE_INPUT_HINTS = ['駅', '駅前', '広場', '歩道', '公園', '商店街', 'バス停', '路地', '水辺'];
export const WHO_INPUT_HINTS = ['みんな', '高齢者', '車いす', 'ベビーカー', '子ども'];
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

const WHO_LEXICON = [
  { label: 'みんな', words: ['みんな', '全員', '誰でも', '一般', 'すべて'] },
  { label: '高齢者', words: ['高齢', 'お年寄', 'シニア', '老人'] },
  { label: '車いす', words: ['車いす', '車椅子', 'wheelchair'] },
  { label: 'ベビーカー', words: ['ベビーカー', ' stroller', '乳児', '赤ちゃん'] },
  { label: '子ども', words: ['子ども', '子供', 'こども', '児童', '小学生'] },
];

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

/**
 * @returns {{ affectedGroups: string[], affectedOther: string }}
 */
export function inferAffectedFromText(text = '') {
  const trimmed = text.trim();
  if (!trimmed) {
    return { affectedGroups: [], affectedOther: '' };
  }

  const normalized = normalizeClassifyText(trimmed);
  const groups = [];
  WHO_LEXICON.forEach(({ label, words }) => {
    if (words.some((w) => normalized.includes(normalizeClassifyText(w)))) {
      groups.push(label);
    }
  });

  if (groups.includes('みんな')) {
    return { affectedGroups: ['みんな'], affectedOther: '' };
  }

  if (groups.length > 0) {
    return { affectedGroups: groups, affectedOther: '' };
  }

  return {
    affectedGroups: [AFFECTED_OTHER_LABEL],
    affectedOther: trimmed.slice(0, 30),
  };
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

/** 自由記述フィールド → 構造化メタ */
export function classifyMetaFromDraft(draft = {}) {
  const placeText = draft.placeText?.trim() ?? '';
  const whoText = draft.whoText?.trim() ?? '';
  const contextText = draft.contextText?.trim() ?? '';

  const place = placeText
    ? inferPlaceArchetypeFromText(placeText)
    : { placeArchetype: draft.placeArchetype ?? null, placeSource: 'user' };

  const who = whoText
    ? inferAffectedFromText(whoText)
    : { affectedGroups: draft.affectedGroups ?? [], affectedOther: draft.affectedOther ?? '' };

  const timeTag = contextText
    ? inferTimeTagFromText(contextText)
    : (draft.timeTag ?? 'always');

  const severity = contextText
    ? inferSeverityFromText(contextText)
    : (draft.severity ?? 'mid');

  return {
    placeText: placeText || null,
    whoText: whoText || null,
    contextText: contextText || null,
    placeArchetype: place.placeArchetype,
    placeSource: place.placeSource,
    affectedGroups: who.affectedGroups,
    affectedOther: who.affectedOther,
    timeTag,
    severity,
  };
}

export function getPlaceDisplayLabel(placeArchetype, placeText) {
  if (placeText?.trim()) return placeText.trim();
  const opt = KOTO_PLACE_OPTIONS.find((o) => o.id === placeArchetype);
  return opt?.label ?? '未選択';
}

export function getTimeTagLabel(timeTagId) {
  const labels = { morning: '朝', day: '昼', evening: '夕方', night: '夜', always: '常時' };
  return labels[timeTagId] ?? '常時';
}

export function getSeverityLabel(severityId) {
  const labels = { low: '軽い', mid: '中くらい', high: '深刻' };
  return labels[severityId] ?? '中くらい';
}
