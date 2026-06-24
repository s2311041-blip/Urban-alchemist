import { create } from 'zustand';
import { FAV_KEY, SAVE_KEY, loadSavedData } from './helpers/saveSchema';
import { buildGameStore } from './gameStoreState';

const savedData = loadSavedData();

export const useGameStore = create((set, get) => buildGameStore(set, get, savedData));

// Throttled save function for main game data to prevent high-frequency localStorage write overhead (e.g. from player movement updating map position)
let pendingSave = null;
const saveToLocalStorage = () => {
  if (pendingSave) return;
  pendingSave = setTimeout(() => {
    pendingSave = null;
    const state = useGameStore.getState();
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      bugs: state.bugs,
      quests: state.quests,
      islandChunks: state.islandChunks,
      ferryRoutes: state.ferryRoutes,
      placedBlocks: state.placedBlocks,
      recentDiagonals: state.recentDiagonals,
      worldTime: state.worldTime,
      pauseTimeInBuildMode: state.pauseTimeInBuildMode,
      farmingProgress: state.farmingProgress,
      economy: state.economy,
      postStats: state.postStats,
      goodSpots: state.goodSpots,
      activeRemoteHubId: state.activeRemoteHubId,
      remoteExpansionLevel: state.remoteExpansionLevel,
      remoteIslandGeneration: state.remoteIslandGeneration,
    }));
  }, 1000); // Save at most once per second
};

useGameStore.subscribe(() => {
  saveToLocalStorage();
});

let lastFavoritesString = '';
useGameStore.subscribe((state) => {
  const favString = JSON.stringify(state.favorites);
  if (favString !== lastFavoritesString) {
    lastFavoritesString = favString;
    localStorage.setItem(FAV_KEY, favString);
  }
});
