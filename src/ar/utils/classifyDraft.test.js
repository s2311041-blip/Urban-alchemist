import { describe, expect, it } from 'vitest';
import { classifyDraft, normalizeClassifyText, inferPlaceFromText } from './classifyDraft.js';

describe('normalizeClassifyText', () => {
  it('normalizes full-width and whitespace', () => {
    expect(normalizeClassifyText('段　差')).toBe('段差');
  });
});

describe('classifyDraft — P 歩きにくい（その場）', () => {
  it('段差 + 車いす', () => {
    const r = classifyDraft({ comment: '段差が高くて車いすでは上がれない' });
    expect(r.needType).toBe('P');
    expect(r.confidence).toBeGreaterThan(0.5);
  });

  it('狭い歩道', () => {
    const r = classifyDraft({ comment: '歩道が狭くてベビーカーが通れない' });
    expect(r.needType).toBe('P');
  });

  it('路面の穴', () => {
    const r = classifyDraft({ comment: '路面に穴があってつまずきそう' });
    expect(r.needType).toBe('P');
  });
});

describe('classifyDraft — L 行き来しにくい（地点間）', () => {
  it('バス停が遠い', () => {
    const r = classifyDraft({ comment: '最寄りのバス停が遠くて駅まで行き来しにくい' });
    expect(r.needType).toBe('L');
  });

  it('フェリー接続', () => {
    const r = classifyDraft({ comment: '運河を渡る手段がなくて向こう側に行けない' });
    expect(r.needType).toBe('L');
  });
});

describe('classifyDraft — I 分かりにくい', () => {
  it('案内不足', () => {
    const r = classifyDraft({ comment: '出口の案内がなくて迷ってしまう' });
    expect(r.needType).toBe('I');
  });

  it('看板が分からない', () => {
    const r = classifyDraft({ comment: '看板の表示が分かりにくくて行き方がわからない' });
    expect(r.needType).toBe('I');
  });
});

describe('classifyDraft — V 見えにくい', () => {
  it('暗い', () => {
    const r = classifyDraft({ comment: '夜になると暗くて前が見えない' });
    expect(r.needType).toBe('V');
  });

  it('照明不足', () => {
    const r = classifyDraft({ comment: '街灯がなく照明不足で死角がある' });
    expect(r.needType).toBe('V');
  });
});

describe('classifyDraft — M 汚れ・荒れ', () => {
  it('ゴミ散乱', () => {
    const r = classifyDraft({ comment: 'ゴミが散乱していて汚い' });
    expect(r.needType).toBe('M');
  });

  it('騒音', () => {
    const r = classifyDraft({ comment: '騒音がうるさくて環境が悪い' });
    expect(r.needType).toBe('M');
  });
});

describe('classifyDraft — R 休めない', () => {
  it('ベンチなし', () => {
    const r = classifyDraft({ comment: 'ベンチがなくて休めない' });
    expect(r.needType).toBe('R');
  });

  it('待てない', () => {
    const r = classifyDraft({ comment: '待つ場所がなくて立ちっぱなしになる' });
    expect(r.needType).toBe('R');
  });
});

describe('classifyDraft — S 不安・怖い', () => {
  it('人通りが少ない', () => {
    const r = classifyDraft({ comment: '人通りが少なくて夜一人だと不安' });
    expect(r.needType).toBe('S');
  });

  it('雰囲気が怖い（明るさ以外）', () => {
    const r = classifyDraft({ comment: '明るいけど人がいなくて怖い' });
    expect(r.needType).toBe('S');
  });
});

describe('classifyDraft — C 頼れない', () => {
  it('助けを呼べない', () => {
    const r = classifyDraft({ comment: '困ったときに助けを呼べる人がいない' });
    expect(r.needType).toBe('C');
  });

  it('見守り不足', () => {
    const r = classifyDraft({ comment: '見守りの接点がなくて相談先もない' });
    expect(r.needType).toBe('C');
  });
});

describe('classifyDraft — O その他（自動フォールバック）', () => {
  it('明示的その他', () => {
    const r = classifyDraft({ comment: 'その他、うまく説明できない' });
    expect(r.needType).toBe('O');
    expect(r.reason).toBe('explicit_other');
  });

  it('8タイプどれにも当てはまらない → low_signal', () => {
    const r = classifyDraft({ comment: '信号が少ない気がする' });
    expect(r.needType).toBe('O');
    expect(r.reason).toBe('low_signal');
  });

  it('なんとなくモヤモヤ → O（明示語彙）', () => {
    const r = classifyDraft({ comment: 'なんとなくモヤモヤする' });
    expect(r.needType).toBe('O');
    expect(r.reason).toBe('explicit_other');
  });

  it('キーワードなし短い文 → low_signal', () => {
    const r = classifyDraft({ comment: 'あああああああああ' });
    expect(r.needType).toBe('O');
    expect(r.reason).toBe('low_signal');
  });
});

describe('classifyDraft — 境界ケース', () => {
  it('P vs L: 段差の続く道は P', () => {
    const r = classifyDraft({ comment: '段差が続いていてこの道を歩くのがつらい' });
    expect(r.needType).toBe('P');
  });

  it('V vs S: 暗くて見えないは V', () => {
    const r = classifyDraft({ comment: '暗くて見えないので足元が不安' });
    expect(r.needType).toBe('V');
  });

  it('V vs I: 看板が見えないは V', () => {
    const r = classifyDraft({ comment: '看板が暗くて見えない' });
    expect(r.needType).toBe('V');
  });

  it('R vs M: ベンチがない汚い広場は R', () => {
    const r = classifyDraft({ comment: 'ベンチがなくて休めない。ゴミもある' });
    expect(r.needType).toBe('R');
  });

  it('S vs C: 夜道で一人不安は S', () => {
    const r = classifyDraft({ comment: '夜道で一人だと心細くて怖い' });
    expect(r.needType).toBe('S');
  });
});

describe('inferPlaceFromText', () => {
  it('detects station', () => {
    expect(inferPlaceFromText('改札前の段差').placeArchetype).toBe('station');
  });

  it('detects park', () => {
    expect(inferPlaceFromText('公園にベンチがない').placeArchetype).toBe('park');
  });
});

describe('classifyDraft place inference', () => {
  it('uses user place over keyword', () => {
    const r = classifyDraft({
      comment: '公園にベンチがない',
      placeArchetype: 'road',
    });
    expect(r.placeArchetype).toBe('road');
    expect(r.placeSource).toBe('user');
  });
});
