import { describe, expect, it } from 'vitest';
import { initialPostPhase, nextPhaseAfterPhotoPin } from './postEntry.js';

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

describe('nextPhaseAfterPhotoPin', () => {
  it('asks for a map pin before questions when the photo came from the library', () => {
    expect(nextPhaseAfterPhotoPin('library')).toBe('locate');
  });

  it('goes straight to questions after a live photo', () => {
    expect(nextPhaseAfterPhotoPin('camera')).toBe('form');
  });
});
