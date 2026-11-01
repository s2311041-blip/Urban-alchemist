import { describe, expect, it } from 'vitest';
import {
  buildNoticeMessage,
  categoryIdFromAnnotation,
  noticeCategoryPatch,
} from './noticeCategories';

describe('notice category compatibility', () => {
  it('maps legacy issue posts into the new notice categories', () => {
    expect(categoryIdFromAnnotation({ kind: 'barrier', needType: 'R' })).toBe('stay_rest');
  });

  it('maps legacy positive posts into positive notices', () => {
    expect(categoryIdFromAnnotation({ kind: 'positive' })).toBe('positive_place');
  });

  it('keeps game-compatible fields when a category is selected', () => {
    const patch = noticeCategoryPatch('access_walk', { status: 'user_edited' }, '段差につまずきそうだった');
    expect(patch.recordKind).toBe('notice');
    expect(patch.postKind).toBe('bad');
    expect(patch.needType).toBe('P');
    expect(patch.classification.status).toBe('user_edited');
    expect(patch.classificationMessage).toContain('段差につまずきそうだった');
    expect(patch.classificationMessage).toContain('まちづくりの議題として共有しますか');
    expect(patch.classificationMessage).not.toMatch(/『|』/);
  });

  it('builds the positive auto-complete message', () => {
    expect(buildNoticeMessage('positive_place')).toBe(
      '素敵な場所のシェア、ありがとうございます！マップに記録しますね。',
    );
  });
});
