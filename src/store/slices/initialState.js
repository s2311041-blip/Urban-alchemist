import { DEFAULT_NATURE_COLORS } from '../../constants/natureData'
import { DEFAULT_AGRI_COLORS } from '../../constants/agriData'
import { DEFAULT_HOVERBOARD_COLOR } from '../../constants/hoverboardData'
import { DEFAULT_TERRAIN_COLORS } from '../../constants/terrainData'
import { DEFAULT_WORLD_TIME } from '../../constants/worldTimeConfig'
import { withWorkshopDaytime } from '../../constants/workshopMode'
import { DEFAULT_FARMING_PROGRESS } from '../../constants/farmingProgressData'
import { DEFAULT_ECONOMY, normalizePostStats } from '../../constants/economyData'
import { syncFerryRoutesForBlocks } from '../helpers/syncFerryRoutes'
import {
  createWorkshopIslandState,
  hasCurrentWorkshopPosts,
  WORKSHOP_SEED_VERSION,
} from '../helpers/workshopIslandSeed'
import {
  loadFavorites,
} from '../helpers/saveSchema'
import { createDefaultPlacedBlocks } from '../../utils/placePresets'
import { normalizeCompetition } from '../../constants/competitionData'
import { DEFAULT_ISLAND_SATISFACTION } from '../../constants/satisfactionAttributes'

export const createInitialState = (savedData) => {
  const workshopSeed = createWorkshopIslandState();
  // バージョン番号だけでは、1件だけ残ったセーブを誤って現行版と扱う。
  // 4件のデモ投稿IDが揃っているときだけ進行状況を維持する。
  const hasCurrentWorkshopSeed = hasCurrentWorkshopPosts(savedData);
  const islandChunks = hasCurrentWorkshopSeed
    ? (savedData?.islandChunks || workshopSeed.islandChunks)
    : workshopSeed.islandChunks;
  let placedBlocks = hasCurrentWorkshopSeed ? (savedData?.placedBlocks || []) : workshopSeed.placedBlocks;
  if (Array.isArray(placedBlocks) && placedBlocks.length > 0) {
    const existingArchetypes = new Set(placedBlocks.map(b => b.presetArchetype).filter(Boolean));
    const defaultBlocks = createDefaultPlacedBlocks(islandChunks);
    const missingDefaults = defaultBlocks.filter(b => b.presetArchetype && !existingArchetypes.has(b.presetArchetype));
    if (missingDefaults.length > 0) {
      placedBlocks = [...placedBlocks, ...missingDefaults];
    }
  } else {
    placedBlocks = workshopSeed.placedBlocks;
  }
  const ferryRoutes = savedData?.ferryRoutes?.length
    ? savedData.ferryRoutes
    : syncFerryRoutesForBlocks(placedBlocks, islandChunks);

  return {
  // --- 状態変数 ---
    workshopSeedVersion: WORKSHOP_SEED_VERSION,
    bugs: hasCurrentWorkshopSeed ? (savedData?.bugs || workshopSeed.bugs) : workshopSeed.bugs,
    quests: hasCurrentWorkshopSeed ? (savedData?.quests || workshopSeed.quests) : workshopSeed.quests,
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
  worldTime: withWorkshopDaytime(savedData?.worldTime || { ...DEFAULT_WORLD_TIME }),
  pauseTimeInBuildMode: savedData?.pauseTimeInBuildMode ?? true,
  farmingProgress: savedData?.farmingProgress || { ...DEFAULT_FARMING_PROGRESS },
  economy: savedData?.economy || { ...DEFAULT_ECONOMY },
  postStats: normalizePostStats(savedData?.postStats),
  narrativeFeedback: null,
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

  islandSatisfaction: savedData?.islandSatisfaction ?? DEFAULT_ISLAND_SATISFACTION,
  remainingBudget: savedData?.remainingBudget ?? 100,
  questDecisions: savedData?.questDecisions ?? {},

  tutorialSeen: savedData?.tutorialSeen ?? false,

  };
};
