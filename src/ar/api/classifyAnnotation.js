import { classifyDraft } from '../utils/classifyDraft';
import { buildClassificationContext } from '../utils/classifyMetaFields';
import {
  buildNoticeMessage,
  categoryIdFromNeedType,
  getNoticeCategory,
} from '../constants/noticeCategories';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { ensureSupabaseAuth } from './annotationsSupabase';

/**
 * 投稿下書きから気づきカテゴリを推定する。
 * Supabase Edge Function（LLM）→ 失敗時はクライアント辞書フォールバック。
 *
 * @param {object} draft
 * @returns {Promise<import('../utils/classifyDraft').classifyDraft extends (...args: any) => infer R ? R : never>}
 */
export async function classifyAnnotation(draft = {}) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      await ensureSupabaseAuth();

      const { data, error } = await supabase.functions.invoke('classify-annotation', {
        body: {
          comment: draft.comment ?? '',
          placeText: draft.placeText ?? '',
          whoText: draft.whoText ?? '',
          contextText: buildClassificationContext(draft),
          postKind: draft.postKind ?? 'notice',
        },
      });

      if (!error && (data?.category_id || data?.categoryId || data?.needType)) {
        return mergeClassificationResult(draft, data, 'llm');
      }
    } catch (err) {
      console.warn('[classifyAnnotation] LLM unavailable, using dictionary fallback', err);
    }
  }

  const fallback = classifyNoticeDraft(draft);
  return {
    ...fallback,
    classification: {
      ...fallback.classification,
      source: 'fallback',
      suggestedNeedType: fallback.needType,
    },
  };
}

function mergeClassificationResult(draft, data, source) {
  const categoryId = data.category_id ?? data.categoryId ?? categoryIdFromNeedType(data.needType);
  const category = getNoticeCategory(categoryId);
  const needType = category?.needType ?? data.needType ?? 'O';
  const confidence = Number(data.confidence ?? 0.7);
  const placeArchetype = draft.placeArchetype ?? data.placeArchetype ?? null;

  return {
    categoryId: categoryId ?? categoryIdFromNeedType(needType),
    categoryLabel: category?.label ?? data.category_label ?? data.categoryLabel ?? null,
    message: data.message || buildNoticeMessage(categoryId, draft.comment),
    needType,
    confidence,
    ambiguous: Boolean(data.ambiguous),
    rivalType: data.rivalType ?? null,
    reason: data.reason ?? source,
    placeArchetype,
    placeSource: draft.placeArchetype ? 'user' : (data.placeSource ?? 'none'),
    classification: {
      status: 'auto_proposed',
      source,
      categoryId: categoryId ?? categoryIdFromNeedType(needType),
      categoryLabel: category?.label ?? data.category_label ?? data.categoryLabel ?? null,
      suggestedNeedType: needType,
      confidence,
      ambiguous: Boolean(data.ambiguous),
      rivalType: data.rivalType ?? null,
      reason: data.reason ?? source,
      placeSource: draft.placeArchetype ? 'user' : (data.placeSource ?? 'none'),
      model: data.model ?? null,
    },
  };
}

const POSITIVE_CUES = [
  '良い', 'よかった', '心地よ', '快適', '助かった', '休めた', '歩きやす',
  '通りやす', '分かりやす', '安心でき', 'きれい', '綺麗', '好き',
  '涼しい', '便利', '楽しい', '落ち着', 'すてき', '素敵',
];

const CONCERN_CUES = [
  '困', '怖', '不安', '危険', '暗い', '狭い', '段差', '汚', 'ゴミ',
  '通りづら', '通りにく', '歩きにく', '休めない', '迷', '頼れない',
  'できない', 'ない', 'ヒヤッ', 'ぶつか', 'つまず',
];

function countCues(text, cues) {
  return cues.reduce((count, cue) => count + (text.includes(cue) ? 1 : 0), 0);
}

function classifyNoticeDraft(draft) {
  const text = [
    draft.comment ?? '',
    draft.whoText ?? '',
    draft.contextText ?? '',
  ].join(' ');
  const positiveScore = countCues(text, POSITIVE_CUES);
  const concernScore = countCues(text, CONCERN_CUES);

  if (positiveScore > 0 && concernScore === 0) {
    const category = getNoticeCategory('positive_place');
    return {
      categoryId: category.id,
      categoryLabel: category.label,
      message: buildNoticeMessage(category.id, draft.comment),
      needType: 'O',
      confidence: Math.min(0.95, 0.7 + positiveScore * 0.08),
      ambiguous: false,
      rivalType: null,
      placeArchetype: draft.placeArchetype ?? null,
      classification: {
        status: 'auto_proposed',
        source: 'fallback',
        categoryId: category.id,
        categoryLabel: category.label,
        suggestedNeedType: 'O',
      },
    };
  }

  const issue = classifyDraft(draft);
  const categoryId = categoryIdFromNeedType(issue.needType);
  const category = getNoticeCategory(categoryId);
  return {
    ...issue,
    categoryId,
    categoryLabel: category?.label ?? null,
    message: buildNoticeMessage(categoryId, draft.comment),
    classification: {
      ...issue.classification,
      categoryId,
      categoryLabel: category?.label ?? null,
    },
  };
}
