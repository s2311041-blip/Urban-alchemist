import React from 'react'
import { OrbitControls, Environment } from '@react-three/drei'
import { Block } from './Block'
import { Island } from './Island'
import { StudioCameraSetup, StudioEditor } from './Gizmos'
import { useGameStore } from '../../store/useGameStore'

export const StudioScene = ({ controlsRef }) => {
  const {
    isDesigningInStudio,
    isEditingInStudio,
    selectedShape,
    selectedMaterial,
    selectedScale,
    blockRotation,
    diagonalFirstPoint,
    hoveredAnchor,
    handleSelectAnchorPoint,
    setHoveredAnchor,
    customDiagonalPoints,
    placedBlocks,
    selectedEditBlockId,
    studioShape,
    studioMaterial,
    studioScale,
    setStudioScale,
    studioPositionOffset,
    setStudioPositionOffset,
    setIsTransforming,
    islandChunks,
    isTransforming
  } = useGameStore();

  return (
    <>
      {/* スタジオ専用シーン */}
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 5, 25]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#00e5ff" shadow-mapSize={[1024, 1024]} castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.8} color="#ffeb3b" />
      <Environment preset="city" />
      
      {isDesigningInStudio && (
        <>
          <gridHelper args={[10, 10, '#00e5ff', '#37474f']} position={[0, -0.01, 0]} />
          <Block 
            position={[0, 0.25, 0]} 
            shape={selectedShape === 'diagonal' ? 'diagonal' : selectedShape} 
            material={selectedMaterial} 
            scale={selectedScale}
            rotation={blockRotation}
            isGhost={true} 
            diagonalFirstPoint={diagonalFirstPoint}
            hoveredAnchor={hoveredAnchor}
            onSelectAnchor={handleSelectAnchorPoint}
            onHoverAnchor={setHoveredAnchor}
            diagonalPoints={customDiagonalPoints ? [
              [0 + customDiagonalPoints[0][0], 0.25 + customDiagonalPoints[0][1], 0 + customDiagonalPoints[0][2]],
              [0 + customDiagonalPoints[1][0], 0.25 + customDiagonalPoints[1][1], 0 + customDiagonalPoints[1][2]]
            ] : undefined}
          />
          <StudioCameraSetup isDesigning={true} />
          <OrbitControls 
            ref={controlsRef} 
            makeDefault 
            target={[0, 0.25, 0]} 
            enablePan={false} 
            enableZoom={true} 
            enableRotate={true}
            enabled={!isTransforming}
          />
        </>
      )}

      {isEditingInStudio && (() => {
        const block = placedBlocks.find(b => b.id === selectedEditBlockId);
        const targetPos = block ? [block.pos[0], block.pos[1], block.pos[2]] : [0, 0.25, 0];
        return (
          <>
            {/* スタジオでの周囲ブロックと島の描画 */}
            <Island islandChunks={islandChunks} isPlacing={false} buildMode={null} noPhysics={true} />
            {placedBlocks.filter(b => b.id !== selectedEditBlockId).map(b => (
              <Block 
                key={b.id} 
                position={b.pos} 
                shape={b.shape || 'block'} 
                material={b.material || 'stone'} 
                rotation={b.rotation || 0} 
                scale={b.scale || [1, 1, 1]}
                isGhost={false} 
                diagonalPoints={b.diagonalPoints}
                nature={b.nature}
                agri={b.agri}
                terrain={b.terrain}
                noPhysics={true}
              />
            ))}

            <StudioEditor
              basePosition={targetPos}
              studioScale={studioScale}
              setStudioScale={setStudioScale}
              studioPositionOffset={studioPositionOffset}
              setStudioPositionOffset={setStudioPositionOffset}
              studioShape={studioShape}
              studioMaterial={studioMaterial}
              blockRotation={blockRotation}
              setIsTransforming={setIsTransforming}
            />
            <StudioCameraSetup isEditing={true} targetPos={targetPos} />
            <OrbitControls 
              ref={controlsRef} 
              makeDefault 
              target={targetPos} 
              enablePan={false} 
              enableZoom={true} 
              enableRotate={true}
              enabled={!isTransforming}
            />
          </>
        );
      })()}
    </>
  );
};
