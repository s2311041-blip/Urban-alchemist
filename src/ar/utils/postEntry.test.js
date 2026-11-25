import { describe, expect, it } from 'vitest';
import { initialPostPhase } from './postEntry.js';

describe('initialPostPhase', () => {
  it('starts on the pin step when a library photo is already chosen', () => {
    expect(initialPostPhase({
      postEntry: { photoSource: 'library', photo: 'data:image/jpeg;base64,abc' },
    })).toBe('annotate');
  });

  it('starts on the camera when recording freely', () => {
    expect(initialPostPhase({ postEntry: { kind: 'free' } })).toBe('capture');
  });
});
