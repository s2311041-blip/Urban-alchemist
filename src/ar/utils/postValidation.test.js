import { describe, expect, it } from 'vitest';
import { validateDraftForSubmit } from './postValidation.js';

describe('validateDraftForSubmit', () => {
  it('rejects invalid coordinates', () => {
    const errors = validateDraftForSubmit({
      worldPin: { lat: 999, lng: 139.8 },
      comment: 'test',
    });
    expect(errors.some((e) => e.includes('位置情報が不正'))).toBe(true);
  });

  it('accepts valid draft anywhere', () => {
    const errors = validateDraftForSubmit({
      worldPin: { lat: 35.5, lng: 139.8 },
      comment: '段差がある',
    });
    expect(errors).toHaveLength(0);
  });
});
