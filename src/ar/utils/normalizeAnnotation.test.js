import { describe, expect, it } from 'vitest';
import { buildAnnotationFromDraft, computePoints } from './normalizeAnnotation.js';
import { computePinWorldPosition } from './pinAnchor.js';

describe('buildAnnotationFromDraft', () => {
  it('keeps game-compatible fields', () => {
    const record = buildAnnotationFromDraft({
      postKind: 'bad',
      needType: 'P',
      placeArchetype: 'station',
      affectedGroups: ['車いす'],
      comment: '段差が高くて車椅子では上がれない',
      timeTag: 'always',
      severity: 'high',
      authorGeo: { lat: 35.893, lng: 140.041 },
      worldPin: { lat: 35.894, lng: 140.042 },
    }, { authorId: 'u1' });

    expect(record.needType).toBe('P');
    expect(record.placeArchetype).toBe('station');
    expect(record.affectedGroups).toEqual(['車いす']);
    expect(record.timeTag).toBe('常時');
    expect(record.type).toBe('danger');
  });

  it('stores free-text meta fields', () => {
    const record = buildAnnotationFromDraft({
      postKind: 'bad',
      needType: 'P',
      placeArchetype: 'station',
      placeText: '駅前',
      whoText: '車いす',
      contextText: '夜',
      affectedGroups: ['車いす'],
      comment: '段差が高くて車椅子では上がれない',
      timeTag: 'night',
      severity: 'mid',
      worldPin: { lat: 35.65, lng: 139.82 },
    }, { authorId: 'u1' });

    expect(record.placeText).toBe('駅前');
    expect(record.whoText).toBe('車いす');
    expect(record.contextText).toBe('夜');
  });

  it('stores prompt metadata', () => {
    const record = buildAnnotationFromDraft({
      postKind: 'bad',
      needType: 'P',
      comment: 'test comment',
      promptKind: 'standing',
      promptId: 'standing-08-access-plaza',
      promptTitle: '駅前広場の行き来',
      worldPin: { lat: 35.65, lng: 139.82 },
    }, { authorId: 'u1' });
    expect(record.promptKind).toBe('standing');
    expect(record.promptId).toBe('standing-08-access-plaza');
    expect(record.promptTitle).toBe('駅前広場の行き来');
  });

  it('stores affectedOther', () => {
    const record = buildAnnotationFromDraft({
      postKind: 'bad',
      needType: 'P',
      placeArchetype: 'road',
      affectedGroups: ['その他'],
      affectedOther: ' チャリ ',
      comment: 'a'.repeat(10),
      worldPin: { lat: 35.65, lng: 139.82 },
    }, { authorId: 'u1' });
    expect(record.affectedOther).toBe('チャリ');
  });

  it('preserves plaza for station-front posts', () => {
    const record = buildAnnotationFromDraft({
      postKind: 'bad',
      needType: 'R',
      placeArchetype: 'plaza',
      affectedGroups: ['高齢者'],
      comment: '駅前にベンチがなくて休めない',
      worldPin: { lat: 35.65, lng: 139.82 },
    }, { authorId: 'u1' });
    expect(record.placeArchetype).toBe('plaza');
  });
});

describe('computePinWorldPosition', () => {
  it('returns world pin from tap', () => {
    const result = computePinWorldPosition({
      authorGeo: { lat: 35.893, lng: 140.041 },
      headingDeg: 90,
      pitchDeg: 0,
      screenTap: { nx: 0.5, ny: 0.5 },
    });
    expect(result.worldPin.lng).toBeGreaterThan(140.041);
    expect(result.distanceM).toBeGreaterThan(0);
  });
});

describe('computePoints', () => {
  it('rewards narrative', () => {
    expect(computePoints({ postKind: 'bad', comment: 'a'.repeat(25), worldPin: {} })).toBeGreaterThan(15);
  });
});
