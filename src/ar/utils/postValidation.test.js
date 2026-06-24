import { describe, expect, it } from 'vitest';
import { validateDraftForSubmit } from './postValidation.js';

describe('validateDraftForSubmit', () => {
  it('rejects out of bounds pin', () => {
    const errors = validateDraftForSubmit({
      worldPin: { lat: 35.5, lng: 139.8 },
      comment: 'test',
    });
    expect(errors.some((e) => e.includes('江東区外'))).toBe(true);
  });

  it('accepts valid draft', () => {
    const errors = validateDraftForSubmit({
      worldPin: { lat: 35.653, lng: 139.826 },
      comment: '段差がある',
    });
    expect(errors).toHaveLength(0);
  });
});
