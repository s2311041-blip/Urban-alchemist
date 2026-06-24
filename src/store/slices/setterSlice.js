import { DEFAULT_NATURE_COLORS } from '../../constants/natureData'
import { DEFAULT_AGRI_COLORS } from '../../constants/agriData'
import { DEFAULT_HOVERBOARD_COLOR } from '../../constants/hoverboardData'
import { DEFAULT_TERRAIN_COLORS } from '../../constants/terrainData'
import {
  DEFAULT_WORLD_TIME,
  WORLD_TIME_SPEED_OPTIONS,
  getSeasonFromDay,
} from '../../constants/worldTimeConfig'
import { DEFAULT_FARMING_PROGRESS } from '../../constants/farmingProgressData'
import { DEFAULT_ECONOMY, DEFAULT_POST_STATS } from '../../constants/economyData'
import { applyCoinEarn, computePostReward } from '../../utils/economyActions'
import { advanceAgriBlocksForPassedDays } from '../../utils/farmingActions'
import { sameBugId } from '../../utils/bugIds'
import { syncFerryRoutesForBlocks } from '../helpers/syncFerryRoutes'
import {
  createDefaultBugs,
  createDefaultQuests,
  normalizeBug,
  normalizeGoodSpot,
  normalizePhotoPins,
  normalizeQuest,
} from '../helpers/bugFactory'
import {
  createDefaultFavorites,
  createDefaultIslandChunks,
  FAV_KEY,
  SAVE_KEY,
} from '../helpers/saveSchema'
import { createDefaultPlacedBlocks } from '../../utils/placePresets'



export const createSetterSlice = (set, get) => ({
  // --- 基本的なセッター ---
  setBugs: (bugs) => set({ bugs: Array.isArray(bugs) ? bugs.map((b) => normalizeBug(b)).filter(Boolean) : [] }),
  setQuests: (quests) => set({
    quests: Array.isArray(quests) ? quests.map((q) => normalizeQuest(q)).filter(Boolean) : [],
  }),
  setIslandChunks: (islandChunks) => set((state) => ({
    islandChunks,
    ferryRoutes: syncFerryRoutesForBlocks(state.placedBlocks, islandChunks),
  })),
  setActiveBug: (activeBug) => set({ activeBug }),
  setIsReturning: (isReturning) => set({ isReturning }),
  setExpandingLevel: (expandingLevel) => set({ expandingLevel }),
  setQuestFocusTarget: (questFocusTarget) => set({
    questFocusTarget: Array.isArray(questFocusTarget) && questFocusTarget.length === 3
      ? [questFocusTarget[0], questFocusTarget[1], questFocusTarget[2]]
      : null,
  }),
  setIsQuestBoardOpen: (isQuestBoardOpen) => set({ isQuestBoardOpen }),
  setPlacingQuest: (placingQuest) => set({ placingQuest }),
  setIsARMode: (isARMode) => set({ isARMode: !!isARMode, ...(isARMode ? {} : { arEditTarget: null }) }),
  setArEditTarget: (arEditTarget) => set({ arEditTarget }),
  openAREditQuest: (questId) => {
    const quest = get().quests.find((q) => q.id === questId && q.isMine);
    if (!quest) return;
    set({ isARMode: true, arEditTarget: { kind: 'quest', id: questId } });
  },
  openAREditGoodSpot: (spotId) => {
    const spot = get().goodSpots.find((s) => s.id === spotId && s.isMine);
    if (!spot) return;
    set({ isARMode: true, arEditTarget: { kind: 'good', id: spotId } });
  },
  setViewMode: (viewMode) => set({ viewMode }),
  setBuildMode: (buildMode) => set({ buildMode }),
  setSelectedMaterial: (selectedMaterial) => set({ selectedMaterial }),
  setSelectedGlassColor: (selectedGlassColor) => set({ selectedGlassColor }),
  setBlockRotation: (blockRotation) => set({ blockRotation }),
  setPlacedBlocks: (placedBlocks) => set((state) => ({
    placedBlocks,
    ferryRoutes: syncFerryRoutesForBlocks(placedBlocks, state.islandChunks),
  })),
  setHoverPosition: (hoverPosition) => set({ hoverPosition }),
  setIsHoverboarding: (isHoverboarding) => set({ isHoverboarding }),
  setCurrentHoverboardStationId: (currentHoverboardStationId) => set({
    currentHoverboardStationId: currentHoverboardStationId ?? null,
  }),
  setSelectedScale: (selectedScale) => set({ selectedScale }),
  setGridSnapping: (gridSnapping) => set({ gridSnapping }),
  setHoveredDeleteBlockId: (hoveredDeleteBlockId) => set({ hoveredDeleteBlockId }),
  setSelectedEditBlockId: (selectedEditBlockId) => set({ selectedEditBlockId }),
  setHoveredEditBlockId: (hoveredEditBlockId) => set({ hoveredEditBlockId }),
  setIsTransforming: (isTransforming) => set({ isTransforming }),
  setIsEditingInStudio: (isEditingInStudio) => set({ isEditingInStudio }),
  setIsDesigningInStudio: (isDesigningInStudio) => set({ isDesigningInStudio }),
  sizeAdjustStartScale: [1, 1, 1],
  previewPositionOffset: [0, 0, 0],
  setPreviewPositionOffset: (previewPositionOffset) => set({ previewPositionOffset }),
  setIsAdjustingSize: (isAdjustingSize) => {
    if (isAdjustingSize) {
      set({ 
        isAdjustingSize, 
        previewFixedPos: null, 
        previewPositionOffset: [0, 0, 0],
        sizeAdjustStartScale: [...get().selectedScale]
      });
      get().initSizeAdjustHistory(get().selectedScale, [0, 0, 0]);
    } else {
      set({ 
        isAdjustingSize, 
        previewFixedPos: null, 
        previewPositionOffset: [0, 0, 0] 
      });
    }
  },
  cancelSizeAdjust: () => {
    const { sizeAdjustStartScale } = get();
    set({
      isAdjustingSize: false,
      previewFixedPos: null,
      previewPositionOffset: [0, 0, 0],
      selectedScale: sizeAdjustStartScale ? [...sizeAdjustStartScale] : [1, 1, 1]
    });
  },
  previewFixedPos: null,
  setPreviewFixedPos: (previewFixedPos) => set({ previewFixedPos }),
  setStudioScale: (studioScale) => set({ studioScale }),
  setStudioMaterial: (studioMaterial) => set({ studioMaterial }),
  setStudioShape: (studioShape) => set({ studioShape }),
  setStudioPositionOffset: (studioPositionOffset) => set({ studioPositionOffset }),
  setStudioStartScale: (studioStartScale) => set({ studioStartScale }),
  setDiagonalFirstPoint: (diagonalFirstPoint) => set({ diagonalFirstPoint }),
  setHoveredAnchor: (hoveredAnchor) => set({ hoveredAnchor }),
  setRecentBlocks: (recentBlocks) => set({ recentBlocks }),
  setDiagonalGuidePos: (diagonalGuidePos) => set({ diagonalGuidePos }),
  setCustomDiagonalPoints: (customDiagonalPoints) => set({ customDiagonalPoints }),
  setIsDesigningDiagonal: (isDesigningDiagonal) => set({ isDesigningDiagonal }),
  setLastDiagonalPoints: (lastDiagonalPoints) => set({ lastDiagonalPoints }),
  setRecentDiagonals: (recentDiagonals) => set({ recentDiagonals }),
  setUndoStack: (undoStack) => set({ undoStack }),
  setRedoStack: (redoStack) => set({ redoStack }),
  setAreaFirstPoint: (areaFirstPoint) => set({ areaFirstPoint }),
  setAreaHeightOffset: (areaHeightOffset) => set({ areaHeightOffset }),
  setSelectedAreaBlocks: (selectedAreaBlocks) => set({ selectedAreaBlocks }),
  setClipboardBlocks: (clipboardBlocks) => set({ clipboardBlocks }),
  setAreaAction: (areaAction) => set({ areaAction }),
  setSignTextPrompt: (signTextPrompt) => set({ signTextPrompt }),
  setFavorites: (favorites) => set({ favorites }),
  setFarmingToast: (farmingToast) => set({ farmingToast }),
  awardPostCoins: ({ captureMode = 'onsite', postKind = 'bad' } = {}) => {
    const state = get();
    const reward = computePostReward({
      captureMode,
      postKind,
      postStats: state.postStats,
    });
    const nextEconomy = applyCoinEarn(state.economy, reward.coinAwarded);
    set({
      economy: nextEconomy,
      postStats: reward.nextPostStats,
      farmingToast: reward.toast,
    });
    setTimeout(() => {
      if (get().farmingToast === reward.toast) set({ farmingToast: null });
    }, 2400);
    return reward.coinAwarded;
  },
  setIslandToast: (islandToast) => set({ islandToast }),
  setFerryRoutes: (ferryRoutes) => set({ ferryRoutes: Array.isArray(ferryRoutes) ? ferryRoutes : [] }),
  setInteractionMode: (interactionMode) => set({ interactionMode }),
  setInteractionHint: (interactionHint) => set((state) => (
    state.interactionHint === interactionHint ? {} : { interactionHint }
  )),
  setMapPlayerPos: (mapPlayerPos) => set({
    mapPlayerPos: Array.isArray(mapPlayerPos) && mapPlayerPos.length >= 2
      ? [Number(mapPlayerPos[0]) || 0, Number(mapPlayerPos[1]) || 0]
      : [0, 0],
  }),
  setMapBoatPos: (mapBoatPos) => set({
    mapBoatPos: Array.isArray(mapBoatPos) && mapBoatPos.length >= 2
      ? [Number(mapBoatPos[0]) || 0, Number(mapBoatPos[1]) || 0]
      : null,
  }),
  setMapHeading: (mapHeading) => set({
    mapHeading: Number.isFinite(mapHeading) ? mapHeading : 0,
  }),
  setFerryTransitionUntil: (ferryTransitionUntil) => set({
    ferryTransitionUntil: Number.isFinite(ferryTransitionUntil) ? ferryTransitionUntil : 0,
  }),
  setIsGoodSpotBookOpen: (isGoodSpotBookOpen) => set({ isGoodSpotBookOpen: !!isGoodSpotBookOpen }),
  setIsWorldMapOpen: (isWorldMapOpen) => set({ isWorldMapOpen: !!isWorldMapOpen }),
  setGoodSpots: (goodSpots) => set({ goodSpots: Array.isArray(goodSpots) ? goodSpots.map((s) => normalizeGoodSpot(s)).filter(Boolean) : [] }),
  addGoodSpotPost: (payload = {}) => {
    const { goodSpots, worldTime } = get();
    const spot = normalizeGoodSpot({
      id: `gs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      bugId: null,
      pos: payload.pos,
      type: typeof payload.type === 'string' ? payload.type : 'good_place',
      factor: typeof payload.factor === 'string' ? payload.factor : 'human',
      needType: typeof payload.needType === 'string' ? payload.needType : 'S',
      tagLabel: typeof payload.tagLabel === 'string' ? payload.tagLabel : '#みんなに優しい場所',
      comment: typeof payload.comment === 'string' ? payload.comment : '',
      photo: typeof payload.photo === 'string' ? payload.photo : null,
      demographic: typeof payload.demographic === 'string' ? payload.demographic : 'あなた',
      postKind: 'good',
      captureMode: payload.captureMode === 'map' ? 'map' : 'onsite',
      mapPin: Array.isArray(payload.mapPin) ? payload.mapPin : null,
      photoPins: Array.isArray(payload.photoPins) ? payload.photoPins : [],
      isMine: true,
      dayIndex: worldTime?.dayIndex ?? 0,
      createdAt: new Date().toISOString(),
    });
    if (!spot) return;
    const next = [spot, ...goodSpots].slice(0, 80);
    set({ goodSpots: next, farmingToast: 'Good Spot 図鑑に保存しました。' });
    setTimeout(() => {
      if (get().farmingToast === 'Good Spot 図鑑に保存しました。') set({ farmingToast: null });
    }, 2200);
  },
  updateMyGoodSpotPost: (spotId, updates = {}) => {
    const spot = get().goodSpots.find((s) => s.id === spotId && s.isMine);
    if (!spot) {
      set({ farmingToast: '自分の投稿だけ編集できます。' });
      return false;
    }
    const next = get().goodSpots.map((s) => (
      s.id === spotId
        ? normalizeGoodSpot({
          ...s,
          ...updates,
          id: s.id,
          isMine: true,
          photoPins: normalizePhotoPins(updates.photoPins ?? s.photoPins),
        })
        : s
    )).filter(Boolean);
    set({ goodSpots: next, farmingToast: 'Good Spot を更新しました。' });
    setTimeout(() => {
      if (get().farmingToast === 'Good Spot を更新しました。') set({ farmingToast: null });
    }, 2200);
    return true;
  },
  resetGameData: () => {
    const defaultFavorites = createDefaultFavorites();
    const defaultState = {
      bugs: createDefaultBugs(),
      quests: createDefaultQuests(),
      islandChunks: createDefaultIslandChunks(),
      activeBug: null,
      isReturning: false,
      expandingLevel: 0,
      expansionFocusTarget: null,
      questFocusTarget: null,
      activeRemoteHubId: null,
      remoteExpansionLevel: 0,
      remoteIslandGeneration: 0,
      ferryRoutes: [],
      islandToast: null,
      avatarResetNonce: get().avatarResetNonce + 1,
      isQuestBoardOpen: false,
      placingQuest: null,
      placingPresetArchetype: null,
      isARMode: false,
      arEditTarget: null,
      viewMode: 'tps',
      buildMode: null,
      selectedShape: 'block',
      selectedMaterial: 'stone',
      blockRotation: 0,
      selectedNatureSpecies: null,
      selectedNatureColors: { ...DEFAULT_NATURE_COLORS },
      selectedAgriColors: { ...DEFAULT_AGRI_COLORS },
      selectedTerrainColors: { ...DEFAULT_TERRAIN_COLORS },
      selectedHoverboardColor: DEFAULT_HOVERBOARD_COLOR,
      placedBlocks: createDefaultPlacedBlocks(createDefaultIslandChunks()),
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
      recentDiagonals: [],
      undoStack: [],
      redoStack: [],
      areaFirstPoint: null,
      areaHeightOffset: 0,
      selectedAreaBlocks: null,
      clipboardBlocks: [],
      areaAction: null,
      favorites: defaultFavorites,
      worldTime: { ...DEFAULT_WORLD_TIME },
      pauseTimeInBuildMode: true,
      farmingProgress: { ...DEFAULT_FARMING_PROGRESS },
      economy: { ...DEFAULT_ECONOMY },
      postStats: { ...DEFAULT_POST_STATS },
      farmingToast: null,
      interactionMode: null,
      interactionHint: null,
      mapPlayerPos: [0, 0],
      mapBoatPos: null,
      mapHeading: 0,
      ferryTransitionUntil: 0,
      goodSpots: [],
      isGoodSpotBookOpen: false,
      isWorldMapOpen: false,
      studioHistory: [],
      studioHistoryIndex: -1,
      sizeAdjustHistory: [],
      sizeAdjustHistoryIndex: -1,
      sizeAdjustStartScale: [1, 1, 1],
      previewPositionOffset: [0, 0, 0],
      previewFixedPos: null,
    };
    set(defaultState);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        bugs: defaultState.bugs,
        quests: defaultState.quests,
        islandChunks: defaultState.islandChunks,
        ferryRoutes: defaultState.ferryRoutes,
        placedBlocks: defaultState.placedBlocks,
        recentDiagonals: defaultState.recentDiagonals,
        worldTime: defaultState.worldTime,
      pauseTimeInBuildMode: defaultState.pauseTimeInBuildMode,
        farmingProgress: defaultState.farmingProgress,
        economy: defaultState.economy,
        postStats: defaultState.postStats,
        goodSpots: defaultState.goodSpots,
      }));
      localStorage.setItem(FAV_KEY, JSON.stringify(defaultFavorites));
    } catch (_) {
      // noop
    }
    if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
  },
  setBugChosenPlan: (bugId, planId) => set((state) => ({
    bugs: state.bugs.map((bug) => {
      if (!sameBugId(bug.id, bugId)) return bug;
      return normalizeBug({ ...bug, chosenPlan: planId });
    }),
    buildFinishError: null,
  })),
  setWorldTimePaused: (paused) => set((state) => ({
    worldTime: { ...state.worldTime, paused: !!paused },
  })),
  toggleWorldTimePaused: () => set((state) => ({
    worldTime: { ...state.worldTime, paused: !state.worldTime.paused },
  })),
  setWorldTimeSpeed: (speed) => set((state) => ({
    worldTime: {
      ...state.worldTime,
      speed: WORLD_TIME_SPEED_OPTIONS.includes(speed) ? speed : state.worldTime.speed,
    },
  })),
  setPauseTimeInBuildMode: (pauseTimeInBuildMode) => set({ pauseTimeInBuildMode: !!pauseTimeInBuildMode }),
  togglePauseTimeInBuildMode: () => set((state) => ({ pauseTimeInBuildMode: !state.pauseTimeInBuildMode })),
  skipToNextMorning: () => set((state) => {
    const nextDay = state.worldTime.dayIndex + 1;
    const placedBlocks = advanceAgriBlocksForPassedDays({
      placedBlocks: state.placedBlocks,
      passedDays: 1,
      growthBonusDays: state.farmingProgress?.growthBonusDays,
      currentDayIndex: state.worldTime.dayIndex,
      nextDayIndex: nextDay,
    });
    return {
      worldTime: {
        ...state.worldTime,
        dayIndex: nextDay,
        timeOfDay: 0.25,
        season: getSeasonFromDay(nextDay),
      },
      placedBlocks,
    };
  }),
  setSelectedNatureSpecies: (selectedNatureSpecies) => set({ selectedNatureSpecies }),
  setSelectedNatureColor: (shape, color) => set(state => ({
    selectedNatureColors: {
      ...state.selectedNatureColors,
      [shape]: color
    }
  })),
  setSelectedAgriColor: (shape, color) => set(state => ({
    selectedAgriColors: {
      ...state.selectedAgriColors,
      [shape]: color
    }
  })),
  setSelectedTerrainColor: (shape, color) => set(state => ({
    selectedTerrainColors: {
      ...state.selectedTerrainColors,
      [shape]: color
    }
  })),
  setSelectedHoverboardColor: (color) => set({
    selectedHoverboardColor: color || DEFAULT_HOVERBOARD_COLOR,
  }),

});
