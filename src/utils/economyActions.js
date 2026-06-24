import {
  normalizeEconomy,
  normalizePostStats,
  POST_REWARD,
  POST_REWARD_FIRST_BONUS,
  SEED_COST,
} from '../constants/economyData';

const captureModeKey = (mode) => (mode === 'map' ? 'map' : 'onsite');

export const computePostReward = ({ captureMode = 'onsite', postKind = 'bad', postStats }) => {
  const stats = normalizePostStats(postStats);
  const mode = captureModeKey(captureMode);
  const kind = postKind === 'good' ? 'good' : 'bad';
  const base = POST_REWARD[mode]?.[kind] ?? POST_REWARD.onsite.bad;
  let bonus = 0;
  if (!stats.firstPostBonusClaimed) {
    bonus = POST_REWARD_FIRST_BONUS;
  }
  const coinAwarded = base + bonus;
  const modeLabel = mode === 'map' ? '地図投稿' : '現地投稿';
  const toast = bonus > 0
    ? `+${coinAwarded}コイン（${modeLabel}・初回ボーナス）`
    : `+${coinAwarded}コイン（${modeLabel}）`;

  return {
    coinAwarded,
    toast,
    nextPostStats: {
      ...stats,
      totalPosts: stats.totalPosts + 1,
      firstPostBonusClaimed: true,
    },
  };
};

export const applyCoinEarn = (economy, amount) => {
  const eco = normalizeEconomy(economy);
  const n = Math.max(0, Math.floor(amount));
  return {
    coin: eco.coin + n,
    lifetimeEarned: eco.lifetimeEarned + n,
  };
};

export const canAffordSeed = (economy) => {
  if (SEED_COST <= 0) return true;
  return normalizeEconomy(economy).coin >= SEED_COST;
};

export const applySeedCost = (economy) => {
  const eco = normalizeEconomy(economy);
  if (SEED_COST <= 0) return { economy: eco, spent: 0 };
  return {
    economy: {
      coin: Math.max(0, eco.coin - SEED_COST),
      lifetimeEarned: eco.lifetimeEarned,
    },
    spent: SEED_COST,
  };
};
