import {
  DEFAULT_WORLD_TIME,
  REAL_SECONDS_PER_GAME_DAY,
  WORLD_TIME_SPEED_OPTIONS,
  getSeasonFromDay,
  normalizeTimeOfDay,
} from '../../constants/worldTimeConfig'
import {
  advanceAgriBlocksForPassedDays,
  computeHarvestResult,
  computePlantResult,
} from '../../utils/farmingActions'

export const createFarmingSlice = (set, get) => ({
  advanceWorldTimeSeconds: (deltaSeconds = 1) => {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;

    set((state) => {
      const wt = state.worldTime || DEFAULT_WORLD_TIME;
      if (wt.paused) return {};

      const speed = WORLD_TIME_SPEED_OPTIONS.includes(wt.speed) ? wt.speed : DEFAULT_WORLD_TIME.speed;
      const progress = (deltaSeconds * speed) / REAL_SECONDS_PER_GAME_DAY;
      const rawTime = wt.timeOfDay + progress;
      const passedDays = Math.floor(rawTime);
      const timeOfDay = normalizeTimeOfDay(rawTime);
      const dayIndex = wt.dayIndex + Math.max(0, passedDays);
      const season = getSeasonFromDay(dayIndex);

      const placedBlocks = advanceAgriBlocksForPassedDays({
        placedBlocks: state.placedBlocks,
        passedDays,
        growthBonusDays: state.farmingProgress?.growthBonusDays,
        currentDayIndex: wt.dayIndex,
        nextDayIndex: dayIndex,
      });

      return {
        worldTime: {
          ...wt,
          dayIndex,
          timeOfDay,
          season,
        },
        placedBlocks,
      };
    });
  },

  harvestAgriBlock: (blockId) => {
    if (!blockId) return false;
    let didHarvest = false;
    set((state) => {
      const result = computeHarvestResult({
        placedBlocks: state.placedBlocks,
        farmingProgress: state.farmingProgress,
        economy: state.economy,
        blockId,
        dayIndex: state.worldTime.dayIndex,
      });
      if (!result.didHarvest) return {};
      didHarvest = true;
      return {
        placedBlocks: result.placedBlocks,
        farmingProgress: result.farmingProgress,
        economy: result.economy,
        farmingToast: result.toast,
      };
    });

    if (didHarvest) {
      setTimeout(() => {
        const current = get().farmingToast;
        if (current) set({ farmingToast: null });
      }, 1800);
    }
    return didHarvest;
  },

  plantAgriBlock: (blockId) => {
    if (!blockId) return false;
    let didPlant = false;
    set((state) => {
      const result = computePlantResult({
        placedBlocks: state.placedBlocks,
        blockId,
        dayIndex: state.worldTime.dayIndex,
        economy: state.economy,
      });
      if (!result.didPlant) {
        if (result.toast) return { farmingToast: result.toast };
        return {};
      }
      didPlant = true;
      return {
        placedBlocks: result.placedBlocks,
        economy: result.economy,
        farmingToast: result.toast,
      };
    });

    if (didPlant) {
      setTimeout(() => {
        const current = get().farmingToast;
        if (current) set({ farmingToast: null });
      }, 1800);
    } else {
      const toast = get().farmingToast;
      if (toast) {
        setTimeout(() => {
          if (get().farmingToast === toast) set({ farmingToast: null });
        }, 2200);
      }
    }
    return didPlant;
  },
});
