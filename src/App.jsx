import React, { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { useShallow } from 'zustand/react/shallow'


import { MainGameScene } from './components/3d/MainGameScene'
import { StudioScene } from './components/3d/StudioScene'
import { CameraRig } from './components/3d/CameraRig'
import { BuildModeLayer } from './components/ui/build/BuildModeLayer'
import { BuildPreLayerOverlays, BuildPostLayerOverlays } from './components/ui/build/BuildStudioOverlays'
import { TopRightPanel } from './components/ui/TopRightPanel'
import { IslandSpawnToast } from './components/ui/hud/IslandSpawnToast'
import { TopLeftPanel } from './components/ui/TopLeftPanel'
import { MainBottomNav } from './components/ui/MainBottomNav'
import { QuestBoardOverlay } from './components/ui/quest/QuestBoardOverlay'
import { BugReportOverlay } from './components/ui/bug/BugReportOverlay'
import { PlacingQuestOverlay } from './components/ui/quest/PlacingQuestOverlay'
import { PlacingPresetOverlay } from './components/ui/build/PlacingPresetOverlay'
import { GoodSpotBookOverlay } from './components/ui/goodSpot/GoodSpotBookOverlay'
import { keyboardMap } from './constants/gameData'
import { interactionHintBottomPx, SIDE_PANEL_WIDTH } from './constants/uiLayout'
import { useBuildKeyboardShortcuts } from './hooks/useBuildKeyboardShortcuts'
import { useBuildPointerPlacement } from './hooks/useBuildPointerPlacement'
import { useFerryFade } from './hooks/useFerryFade'
import { useGameStore } from './store/useGameStore'
import { PALETTE, RENDERER } from './constants/artDirection'
import { ART_DIRECTION } from './constants/buildFeatureFlags'
import './index.css'

export default function App() {
  const store = useGameStore(useShallow(state => ({
    activeBug: state.activeBug,
    buildMode: state.buildMode,
    isDesigningInStudio: state.isDesigningInStudio,
    viewMode: state.viewMode,
    setViewMode: state.setViewMode,
    bugs: state.bugs,
    setBuildMode: state.setBuildMode,
    setSelectedShape: state.setSelectedShape,
    setSelectedMaterial: state.setSelectedMaterial,
    setIsQuestBoardOpen: state.setIsQuestBoardOpen,
    isQuestBoardOpen: state.isQuestBoardOpen,
    quests: state.quests,
    goodSpots: state.goodSpots,
    startPlacingQuest: state.startPlacingQuest,
    focusQuestOnIsland: state.focusQuestOnIsland,
    setActiveBug: state.setActiveBug,
    setIsReturning: state.setIsReturning,
    removeBug: state.removeBug,
    startDIY: state.startDIY,
    setBugChosenPlan: state.setBugChosenPlan,
    placingQuest: state.placingQuest,
    cancelPlacing: state.cancelPlacing,
    placingPresetArchetype: state.placingPresetArchetype,
    cancelPlacingPreset: state.cancelPlacingPreset,
    isGoodSpotBookOpen: state.isGoodSpotBookOpen,
    setIsGoodSpotBookOpen: state.setIsGoodSpotBookOpen,
    interactionHint: state.interactionHint,
    expandingLevel: state.expandingLevel,
  })));
  const ferryTransitionUntil = useGameStore((s) => s.ferryTransitionUntil);
  const showFerryFade = useFerryFade(ferryTransitionUntil);
  const [showBuildShortcuts, setShowBuildShortcuts] = useState(false);
  const showBuildShortcutsRef = useRef(false);

  const controlsRef = useRef();
  const avatarPos = useRef(new THREE.Vector3(0, 3, 2));

  useEffect(() => {
    showBuildShortcutsRef.current = showBuildShortcuts;
  }, [showBuildShortcuts]);

  useBuildKeyboardShortcuts({ showBuildShortcutsRef, setShowBuildShortcuts });
  const { handleGroundClick, handleGroundDoubleClick, handlePointerMove } = useBuildPointerPlacement();

  return (
    <KeyboardControls map={keyboardMap}>
      <div style={{ width: '100vw', height: '100vh', background: store.activeBug || store.buildMode ? '#050510' : (ART_DIRECTION.enabled ? PALETTE.skyDayHorizon : '#e1f5fe'), transition: 'background 1s ease', position: 'relative', overflow: 'hidden' }}>
        
        <Canvas
          shadows={false}
          camera={{ position: [0, 8, 14], fov: 35 }}
          gl={{
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: ART_DIRECTION.enabled ? RENDERER.toneMappingExposure : 1,
          }}
        >
          {/* CameraRig は常時マウント（StudioScene・MainGameScene どちらがマウントされていても監視し続ける） */}
          <CameraRig controlsRef={controlsRef} avatarPos={avatarPos} />
          {store.isDesigningInStudio ? (
            <StudioScene controlsRef={controlsRef} />
          ) : (
            <MainGameScene 
              controlsRef={controlsRef}
              avatarPos={avatarPos}
              handleGroundClick={handleGroundClick}
              handlePointerMove={handlePointerMove}
              onDoubleClick={handleGroundDoubleClick}
              buildMode={!!store.buildMode}
              />
          )}
        </Canvas>

        <BuildPreLayerOverlays />
        <BuildModeLayer
          showBuildShortcuts={store.buildMode ? showBuildShortcuts : false}
          setShowBuildShortcuts={setShowBuildShortcuts}
        />
        <BuildPostLayerOverlays />

        {!store.activeBug && !store.isQuestBoardOpen && !store.placingQuest && !store.placingPresetArchetype && store.expandingLevel === 0 && (
          <>
            <TopRightPanel viewMode={store.viewMode} setViewMode={store.setViewMode} />
            <IslandSpawnToast />
            {!store.buildMode && (
              <>
            <TopLeftPanel bugs={store.bugs} />
            <MainBottomNav 
              setIsQuestBoardOpen={store.setIsQuestBoardOpen} 
            />
              </>
            )}
          </>
        )}


        {/* クエストボードオーバーレイ */}
        <QuestBoardOverlay
          isQuestBoardOpen={store.isQuestBoardOpen}
          setIsQuestBoardOpen={store.setIsQuestBoardOpen}
          quests={store.quests}
          startPlacingQuest={store.startPlacingQuest}
          focusQuestOnIsland={store.focusQuestOnIsland}
        />

        {/* 不満詳細オーバーレイ */}
        <BugReportOverlay
          key={store.activeBug ?? 'bug-overlay-empty'}
          activeBug={store.activeBug}
          setActiveBug={store.setActiveBug}
          setIsReturning={store.setIsReturning}
          bugs={store.bugs}
          removeBug={store.removeBug}
          startDIY={store.startDIY}
          setBugChosenPlan={store.setBugChosenPlan}
        />

        {/* クエスト配置中オーバーレイ */}
        <PlacingQuestOverlay 
          placingQuest={store.placingQuest} 
          cancelPlacing={store.cancelPlacing} 
        />
        <PlacingPresetOverlay
          placingPresetArchetype={store.placingPresetArchetype}
          cancelPlacing={store.cancelPlacingPreset}
        />
        <GoodSpotBookOverlay
          isOpen={store.isGoodSpotBookOpen}
          onClose={() => store.setIsGoodSpotBookOpen(false)}
          goodSpots={store.goodSpots}
        />

        {!store.buildMode && !store.activeBug && store.interactionHint && (
          <div style={{
            position: 'absolute',
            right: '20px',
            bottom: `${interactionHintBottomPx()}px`,
            zIndex: 140,
            width: `${SIDE_PANEL_WIDTH}px`,
            maxWidth: `${SIDE_PANEL_WIDTH}px`,
            boxSizing: 'border-box',
            padding: '10px 13px',
            borderRadius: '12px',
            border: '1px solid rgba(79, 195, 247, 0.55)',
            background: 'rgba(4, 19, 34, 0.85)',
            color: '#dff6ff',
            fontSize: '13px',
            fontWeight: 'bold',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(5px)',
            pointerEvents: 'none',
            lineHeight: 1.35,
          }}>
            {store.interactionHint}
          </div>
        )}

        {showFerryFade && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(4, 10, 18, 0.75)',
            zIndex: 145,
            pointerEvents: 'none',
            animation: 'ferryFade 0.65s ease-out',
          }} />
        )}
        
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
          @keyframes slideInLeft {
            from { transform: translateY(-50%) translateX(-120%); opacity: 0; }
            to { transform: translateY(-50%) translateX(0); opacity: 1; }
          }
          @keyframes ferryFade {
            0% { opacity: 0; }
            35% { opacity: 1; }
            100% { opacity: 0; }
          }
          .material-scroll-container::-webkit-scrollbar {
            width: 3px;
          }
          .material-scroll-container::-webkit-scrollbar-track {
            background: transparent;
          }
          .material-scroll-container::-webkit-scrollbar-thumb {
            background: rgba(0, 229, 255, 0.3);
            border-radius: 10px;
          }
          .material-scroll-container::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 229, 255, 0.6);
          }
        `}</style>
      </div>
    </KeyboardControls>
  );
}
