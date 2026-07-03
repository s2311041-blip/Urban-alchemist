import { createInitialState } from './slices/initialState';
import { createSetterSlice } from './slices/setterSlice';
import { createStudioSlice } from './slices/studioSlice';
import { createFarmingSlice } from './slices/farmingSlice';
import { createBuildSlice } from './slices/buildSlice';
import { createBugSlice } from './slices/bugSlice';
import { createCompetitionSlice } from './slices/competitionSlice';
import { createConsensusSlice } from './slices/consensusSlice';

export const buildGameStore = (set, get, savedData) => ({
  ...createInitialState(savedData),
  ...createSetterSlice(set, get),
  ...createStudioSlice(set, get),
  ...createFarmingSlice(set, get),
  ...createBuildSlice(set, get),
  ...createBugSlice(set, get),
  ...createCompetitionSlice(set, get),
  ...createConsensusSlice(set, get),
});
