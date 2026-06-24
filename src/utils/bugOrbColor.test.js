import { describe, expect, it } from 'vitest';
import {
  BUG_ORB_COLORS,
  BUG_ORB_EMISSIVE,
  BUG_ORB_GLOW_PRESETS,
  BUG_ORB_PARTICLE_PRESETS,
  getBugOrbAppearance,
  getBugOrbColor,
  getBugOrbEmissive,
  BUG_ORB_SMOKE_AURA_PRESETS,
  getBugOrbSmokeAuraLayers,
  getBugOrbGlowPreset,
  getBugOrbKind,
  getBugOrbParticleLayers,
} from './bugOrbColor';

describe('getBugOrbColor', () => {
  it('uses black for own posts', () => {
    expect(getBugOrbColor({ isMine: true, fromPost: true })).toBe(BUG_ORB_COLORS.mine);
  });

  it('uses orange for others posts', () => {
    expect(getBugOrbColor({ isMine: false, fromPost: true })).toBe(BUG_ORB_COLORS.other);
  });

  it('uses purple for human-factor NPC bugs', () => {
    expect(getBugOrbColor({ factor: 'human' })).toBe(BUG_ORB_COLORS.npcHuman);
  });

  it('uses red for other NPC bugs', () => {
    expect(getBugOrbColor({ type: 'dark', factor: 'hard' })).toBe(BUG_ORB_COLORS.npcDefault);
  });

  it('uses a lighter emissive for own black orbs', () => {
    expect(getBugOrbEmissive({ isMine: true })).toBe(BUG_ORB_EMISSIVE.mine);
  });

  it('returns paired color, emissive, and glow preset', () => {
    expect(getBugOrbAppearance({ fromPost: true, isMine: false })).toEqual({
      kind: 'other',
      color: BUG_ORB_COLORS.other,
      emissive: BUG_ORB_EMISSIVE.other,
      glow: BUG_ORB_GLOW_PRESETS.other,
    });
  });

  it('uses weaker glow for own black smoke orbs', () => {
    const mine = getBugOrbGlowPreset('mine');
    const other = getBugOrbGlowPreset('other');
    expect(mine.initialLight).toBeLessThan(other.initialLight);
    expect(mine.showShell).toBe(true);
    expect(getBugOrbParticleLayers({ isMine: true })).toHaveLength(0);
    expect(getBugOrbSmokeAuraLayers({ isMine: true })).toBe(BUG_ORB_SMOKE_AURA_PRESETS.mine);
    expect(other.showShell).toBe(true);
  });

  it('uses wider shell and aura for human-factor NPC orbs', () => {
    expect(getBugOrbGlowPreset('npcHuman').shellRadius).toBeGreaterThan(
      getBugOrbGlowPreset('npcDefault').shellRadius,
    );
  });

  it('resolves particle layers by orb kind', () => {
    expect(getBugOrbKind({ isMine: true })).toBe('mine');
    expect(getBugOrbParticleLayers({ isMine: true })).toBe(BUG_ORB_PARTICLE_PRESETS.mine);
    expect(getBugOrbParticleLayers({ factor: 'human' })).toBe(BUG_ORB_PARTICLE_PRESETS.npcHuman);
  });
});
