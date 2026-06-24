import { isAgriShape } from '../constants/agriData';
import { getFarmingNeedXp } from '../constants/farmingProgressData';
import { FARMING_LEVEL_COIN_BONUS, HARVEST_REWARD, SEED_COST, normalizeEconomy } from '../constants/economyData';
import { applySeedCost, canAffordSeed } from './economyActions';
import {
  advanceAgriLifecycle,
  createFallowAgriState,
  createInitialAgriState,
  normalizeAgriState,
} from './agriGrowth';

export const advanceAgriBlocksForPassedDays = ({
  placedBlocks = [],
  passedDays = 0,
  growthBonusDays = 0,
  currentDayIndex = 0,
  nextDayIndex = 0,
}) => {
  const days = Number.isFinite(passedDays) ? Math.max(0, Math.floor(passedDays)) : 0;
  if (days <= 0) return placedBlocks;
  const bonus = Number.isFinite(growthBonusDays) ? Math.max(0, Math.floor(growthBonusDays)) : 0;
  const effectiveDays = days + bonus;

  return placedBlocks
    .map((block) => {
      if (!isAgriShape(block.shape)) return block;
      const prevAgri = normalizeAgriState(block.shape, block.agri ?? {}, currentDayIndex);
      const nextAgri = advanceAgriLifecycle(block.shape, prevAgri, effectiveDays, nextDayIndex);
      if (
        nextAgri.stage === prevAgri.stage &&
        nextAgri.phase === prevAgri.phase &&
        nextAgri.ageDays === prevAgri.ageDays &&
        nextAgri.vanished === prevAgri.vanished
      ) return block;
      return { ...block, agri: nextAgri };
    })
    .filter((block) => !(isAgriShape(block.shape) && block.agri?.vanished));
};

export const computeHarvestResult = ({
  placedBlocks = [],
  farmingProgress,
  economy,
  blockId,
  dayIndex = 0,
}) => {
  const idx = placedBlocks.findIndex((b) => b.id === blockId);
  if (idx < 0) return { didHarvest: false };
  const target = placedBlocks[idx];
  if (!isAgriShape(target.shape)) return { didHarvest: false };
  const agri = normalizeAgriState(target.shape, target.agri ?? {}, dayIndex);
  if (!agri.harvestable) return { didHarvest: false };

  const nextBlocks = [...placedBlocks];
  nextBlocks[idx] = {
    ...target,
    agri: createFallowAgriState(target.shape, agri, dayIndex),
  };

  let level = Number.isFinite(farmingProgress?.level) ? Math.max(1, Math.floor(farmingProgress.level)) : 1;
  let xp = Number.isFinite(farmingProgress?.xp) ? Math.max(0, Math.floor(farmingProgress.xp)) : 0;
  let totalHarvests = Number.isFinite(farmingProgress?.totalHarvests) ? Math.max(0, Math.floor(farmingProgress.totalHarvests)) : 0;
  xp += 1;
  totalHarvests += 1;

  let leveledUp = false;
  while (xp >= getFarmingNeedXp(level)) {
    xp -= getFarmingNeedXp(level);
    level += 1;
    leveledUp = true;
  }
  const growthBonusDays = Math.floor((level - 1) / 3);
  const rewardDef = HARVEST_REWARD[target.shape] ?? { base: 1, ripeBonus: 0 };
  const rawReward = rewardDef.base + rewardDef.ripeBonus;
  const reward = Math.max(1, Math.floor(rawReward * (1 + (Math.max(1, level) - 1) * FARMING_LEVEL_COIN_BONUS)));
  const eco = normalizeEconomy(economy);
  const nextEconomy = {
    coin: eco.coin + reward,
    lifetimeEarned: eco.lifetimeEarned + reward,
  };

  return {
    didHarvest: true,
    placedBlocks: nextBlocks,
    farmingProgress: { level, xp, growthBonusDays, totalHarvests },
    economy: nextEconomy,
    toast: leveledUp
      ? `+${reward}コイン / 農業Lv${level}に上がった！`
      : `+${reward}コインを獲得！`,
  };
};

export const computePlantResult = ({ placedBlocks = [], blockId, dayIndex = 0, economy }) => {
  const idx = placedBlocks.findIndex((b) => b.id === blockId);
  if (idx < 0) return { didPlant: false };
  const target = placedBlocks[idx];
  if (!isAgriShape(target.shape)) return { didPlant: false };
  const agri = normalizeAgriState(target.shape, target.agri ?? {}, dayIndex);
  if (agri.phase !== 'fallow') return { didPlant: false };

  if (!canAffordSeed(economy)) {
    return {
      didPlant: false,
      toast: `コインが足りません（種代 ${SEED_COST}）`,
    };
  }

  const nextBlocks = [...placedBlocks];
  nextBlocks[idx] = {
    ...target,
    agri: createInitialAgriState(target.shape, dayIndex, {
      ...agri,
      harvestedCount: agri.harvestedCount ?? 0,
    }),
  };
  const { economy: nextEconomy, spent } = applySeedCost(economy);
  const toast = spent > 0 ? `再植え付け（−${spent}コイン）` : '再植え付けしました';
  return {
    didPlant: true,
    placedBlocks: nextBlocks,
    economy: nextEconomy,
    toast,
  };
};
