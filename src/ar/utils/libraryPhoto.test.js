import { describe, expect, it } from 'vitest';
import { fitImageSize, libraryPhotoErrorMessage } from './libraryPhoto.js';

describe('fitImageSize', () => {
  it('leaves a small photo unchanged', () => {
    expect(fitImageSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('shrinks the long edge to 1600', () => {
    expect(fitImageSize(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitImageSize(1200, 3000)).toEqual({ width: 640, height: 1600 });
  });
});

describe('libraryPhotoErrorMessage', () => {
  it('names a non-image selection', () => {
    expect(libraryPhotoErrorMessage(new Error('not_image'))).toContain('画像ファイル');
  });
});
