import { describe, expect, it, vi } from 'vitest';

vi.mock('./supabaseClient', () => ({
  isSupabaseConfigured: () => false,
  getSupabase: () => null,
}));

vi.mock('./annotationsSupabase', () => ({
  deleteAnnotationSupabase: vi.fn(),
  ensureSupabaseAuth: vi.fn(),
  fetchAnnotationsSupabase: vi.fn(),
  postAnnotationSupabase: vi.fn(),
}));

import { mergeAnnotations } from './annotationsClient.js';

describe('mergeAnnotations', () => {
  it('drops posts that remain only on this device after they are gone from the cloud', () => {
    const local = [
      { id: 'gone', comment: '消した投稿', createdAt: 2 },
      { id: 'kept', comment: '手元の古い文', photo: 'data:image/jpeg,abc', createdAt: 1 },
    ];
    const remote = [
      { id: 'kept', comment: 'クラウドの文', photo: null, createdAt: 1 },
    ];

    const merged = mergeAnnotations(local, remote, []);

    expect(merged.map((item) => item.id)).toEqual(['kept']);
    expect(merged[0].comment).toBe('クラウドの文');
    expect(merged[0].photo).toBe('data:image/jpeg,abc');
  });

  it('hides a cloud post this device already deleted', () => {
    const merged = mergeAnnotations(
      [],
      [{ id: 'a', createdAt: 1 }, { id: 'b', createdAt: 2 }],
      ['b'],
    );
    expect(merged.map((item) => item.id)).toEqual(['a']);
  });
});
