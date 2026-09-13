import { classifyDraft } from '../utils/classifyDraft';
import { buildClassificationContext } from '../utils/classifyMetaFields';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { ensureSupabaseAuth } from './annotationsSupabase';

/**
 * 投稿下書きから困り型を推定する。
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
          postKind: draft.postKind ?? 'bad',
        },
      });

      if (!error && data?.needType) {
        return mergeClassificationResult(draft, data, 'llm');
      }
    } catch (err) {
      console.warn('[classifyAnnotation] LLM unavailable, using dictionary fallback', err);
    }
  }

  const fallback = classifyDraft(draft);
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
  const needType = data.needType;
  const confidence = Number(data.confidence ?? 0.7);
  const placeArchetype = draft.placeArchetype ?? data.placeArchetype ?? null;

  return {
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
