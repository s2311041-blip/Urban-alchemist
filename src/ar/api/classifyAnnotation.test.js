import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('./supabaseClient', () => ({
  isSupabaseConfigured: () => false,
  getSupabase: () => null,
}));

vi.mock('./annotationsSupabase', () => ({
  ensureSupabaseAuth: vi.fn(),
}));

import { classifyAnnotation } from './classifyAnnotation.js';

describe('classifyAnnotation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses dictionary fallback when Supabase is not configured', async () => {
    const result = await classifyAnnotation({ comment: '段差が高くて車いすでは上がれない' });
    expect(result.needType).toBe('P');
    expect(result.categoryId).toBe('access_walk');
    expect(result.classification.source).toBe('fallback');
    expect(result.classification.suggestedNeedType).toBe('P');
    expect(result.classification.status).toBe('auto_proposed');
    expect(result.message).toContain('段差が高くて車いすでは上がれない');
    expect(result.message).toContain('まちづくりの議題として共有しますか');
  });

  it('recognizes a positive experience without asking the user to label it', async () => {
    const result = await classifyAnnotation({ comment: '日陰があって涼しくて休めた' });
    expect(result.categoryId).toBe('positive_place');
    expect(result.needType).toBe('O');
    expect(result.message).toBe('素敵な場所のシェア、ありがとうございます！マップに記録しますね。');
  });
});
