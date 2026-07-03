import { DEFAULT_NATURE_COLORS } from '../../constants/natureData'
import { DEFAULT_AGRI_COLORS } from '../../constants/agriData'
import { DEFAULT_HOVERBOARD_COLOR } from '../../constants/hoverboardData'
import { DEFAULT_TERRAIN_COLORS } from '../../constants/terrainData'
import { DEFAULT_WORLD_TIME } from '../../constants/worldTimeConfig'
import { DEFAULT_FARMING_PROGRESS } from '../../constants/farmingProgressData'
import { DEFAULT_ECONOMY, normalizePostStats } from '../../constants/economyData'
import { syncFerryRoutesForBlocks } from '../helpers/syncFerryRoutes'
import {
  createDefaultBugs,
  createDefaultQuests,
} from '../helpers/bugFactory'
import {
  createDefaultIslandChunks,
  loadFavorites,
} from '../helpers/saveSchema'
import { createDefaultPlacedBlocks } from '../../utils/placePresets'
import { normalizeCompetition } from '../../constants/competitionData'

export const createInitialState = (savedData) => {
  const islandChunks = savedData?.islandChunks || createDefaultIslandChunks();
  let placedBlocks = savedData?.placedBlocks || [];
  if (Array.isArray(placedBlocks) && placedBlocks.length > 0) {
    const existingArchetypes = new Set(placedBlocks.map(b => b.presetArchetype).filter(Boolean));
    const defaultBlocks = createDefaultPlacedBlocks(islandChunks);
    const missingDefaults = defaultBlocks.filter(b => b.presetArchetype && !existingArchetypes.has(b.presetArchetype));
    if (missingDefaults.length > 0) {
      placedBlocks = [...placedBlocks, ...missingDefaults];
    }
  } else {
    placedBlocks = createDefaultPlacedBlocks(islandChunks);
  }
  const ferryRoutes = savedData?.ferryRoutes?.length
    ? savedData.ferryRoutes
    : syncFerryRoutesForBlocks(placedBlocks, islandChunks);

  return {
  // --- 状態変数 ---
  bugs: savedData?.bugs || createDefaultBugs(),
  quests: savedData?.quests || createDefaultQuests(),
  islandChunks,
  activeBug: null,
  isReturning: false,
  expandingLevel: 0,
  expansionFocusTarget: null,
  questFocusTarget: null,
  activeRemoteHubId: savedData?.activeRemoteHubId ?? null,
  remoteExpansionLevel: savedData?.remoteExpansionLevel ?? 0,
  remoteIslandGeneration: savedData?.remoteIslandGeneration ?? 0,
  ferryRoutes,
  islandToast: null,
  avatarResetNonce: 0,
  isQuestBoardOpen: false,
  placingQuest: null,
  placingPresetArchetype: null,
  isARMode: false,
  arEditTarget: null,
  viewMode: 'tps',
  buildMode: null,
  selectedShape: 'block',
  selectedMaterial: 'stone',
  selectedGlassColor: '#E1F5FE',
  blockRotation: 0,
  selectedNatureSpecies: null,
  selectedNatureColors: { ...DEFAULT_NATURE_COLORS },
  selectedAgriColors: { ...DEFAULT_AGRI_COLORS },
  selectedTerrainColors: { ...DEFAULT_TERRAIN_COLORS },
  selectedHoverboardColor: savedData?.selectedHoverboardColor ?? DEFAULT_HOVERBOARD_COLOR,
  placedBlocks,
  hoverPosition: null,
  isHoverboarding: false,
  currentHoverboardStationId: null,
  selectedScale: [1, 1, 1],
  gridSnapping: true,
  hoveredDeleteBlockId: null,
  selectedEditBlockId: null,
  hoveredEditBlockId: null,
  isTransforming: false,
  isEditingInStudio: false,
  isDesigningInStudio: false,
  isAdjustingSize: false,
  studioScale: [1, 1, 1],
  studioMaterial: 'stone',
  studioShape: 'block',
  studioPositionOffset: [0, 0, 0],
  studioStartScale: [1, 1, 1],
  diagonalFirstPoint: null,
  hoveredAnchor: null,
  recentBlocks: [],
  diagonalGuidePos: null,
  customDiagonalPoints: null,
  isDesigningDiagonal: true,
  lastDiagonalPoints: null,
  recentDiagonals: savedData?.recentDiagonals || [],
  undoStack: [],
  redoStack: [],
  areaFirstPoint: null,
  areaHeightOffset: 0,
  selectedAreaBlocks: null,
  clipboardBlocks: [],
  areaAction: null,
  signTextPrompt: null,
  favorites: loadFavorites(),
  worldTime: savedData?.worldTime || { ...DEFAULT_WORLD_TIME },
  pauseTimeInBuildMode: savedData?.pauseTimeInBuildMode ?? true,
  farmingProgress: savedData?.farmingProgress || { ...DEFAULT_FARMING_PROGRESS },
  economy: savedData?.economy || { ...DEFAULT_ECONOMY },
  postStats: normalizePostStats(savedData?.postStats),
  farmingToast: null,
  buildFinishError: null,
  buildSession: null,
  competition: normalizeCompetition(savedData?.competition),
  interactionMode: null,
  interactionHint: null,
  mapPlayerPos: [0, 0],
  mapBoatPos: null,
  mapHeading: 0,
  ferryTransitionUntil: 0,
  goodSpots: savedData?.goodSpots || [],
  isGoodSpotBookOpen: false,
  isWorldMapOpen: false,

  isSeriousMode: false,
  consensusSession: null,
  uiMode: 'explore',

  };
};
