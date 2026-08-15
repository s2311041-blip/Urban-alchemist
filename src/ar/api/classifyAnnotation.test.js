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
    expect(result.classification.source).toBe('fallback');
    expect(result.classification.suggestedNeedType).toBe('P');
    expect(result.classification.status).toBe('auto_proposed');
  });
});
