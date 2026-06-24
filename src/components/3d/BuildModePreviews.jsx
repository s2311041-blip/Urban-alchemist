import React from 'react';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { Block } from './Block';
import { PreviewGizmoEditor } from './Gizmos';
import { QuestPlacementPreview } from './QuestPlacementPreview';
import { isConnectableAgriShape } from '../../constants/agriData';
import { isConnectableTerrainShape } from '../../constants/terrainData';
import { getCardinalNeighbors } from '../../utils/gridNeighbors';
import { PLACE_ARCHETYPE_LABELS } from '../../utils/placePresets';

export const BuildModePreviews = ({ islandChunks }) => {
  const {
    buildMode,
    placingQuest,
    hoverPosition,
    placingPresetArchetype,
    selectedShape,
    selectedMaterial,
    blockRotation,
    selectedScale,
    selectedNatureSpecies,
    selectedNatureColors,
    selectedAgriColors,
    selectedTerrainColors,
    selectedHoverboardColor,
    isAdjustingSize,
    previewFixedPos,
    previewPositionOffset,
    areaFirstPoint,
    areaHeightOffset,
    selectedAreaBlocks,
    areaAction,
    clipboardBlocks,
    isDesigningDiagonal,
    customDiagonalPoints,
    placedBlocks,
    setSelectedScale,
    setIsTransforming,
    setPreviewPositionOffset,
  } = useGameStore(useShallow(state => ({
    buildMode: state.buildMode,
    placingQuest: state.placingQuest,
    hoverPosition: state.hoverPosition,
    placingPresetArchetype: state.placingPresetArchetype,
    selectedShape: state.selectedShape,
    selectedMaterial: state.selectedMaterial,
    blockRotation: state.blockRotation,
    selectedScale: state.selectedScale,
    selectedNatureSpecies: state.selectedNatureSpecies,
    selectedNatureColors: state.selectedNatureColors,
    selectedAgriColors: state.selectedAgriColors,
    selectedTerrainColors: state.selectedTerrainColors,
    selectedHoverboardColor: state.selectedHoverboardColor,
    isAdjustingSize: state.isAdjustingSize,
    previewFixedPos: state.previewFixedPos,
    previewPositionOffset: state.previewPositionOffset,
    areaFirstPoint: state.areaFirstPoint,
    areaHeightOffset: state.areaHeightOffset,
    selectedAreaBlocks: state.selectedAreaBlocks,
    areaAction: state.areaAction,
    clipboardBlocks: state.clipboardBlocks,
    isDesigningDiagonal: state.isDesigningDiagonal,
    customDiagonalPoints: state.customDiagonalPoints,
    placedBlocks: state.placedBlocks,
    hoveredEditBlockId: state.hoveredEditBlockId,
    hoveredDeleteBlockId: state.hoveredDeleteBlockId,
    setSelectedScale: state.setSelectedScale,
    setIsTransforming: state.setIsTransforming,
    setPreviewPositionOffset: state.setPreviewPositionOffset,
  })));

  if (!buildMode && !placingQuest && !placingPresetArchetype) return null;

  return (
    <>
      {placingQuest && hoverPosition && (
        <QuestPlacementPreview
          quest={placingQuest}
          hoverPosition={hoverPosition}
          islandChunks={islandChunks}
          placedBlocks={placedBlocks}
        />
      )}

      {placingPresetArchetype && hoverPosition && (
        <QuestPlacementPreview
          quest={{ needType: 'P', placeArchetype: placingPresetArchetype }}
          hoverPosition={hoverPosition}
          islandChunks={islandChunks}
          placedBlocks={placedBlocks}
          showOrb={false}
          labelOverride={`${PLACE_ARCHETYPE_LABELS[placingPresetArchetype] ?? placingPresetArchetype} — ダブルクリックで配置`}
        />
      )}

      {buildMode && !placingPresetArchetype && (
        <>
          {hoverPosition && (
            <>
              {(() => {
                const startY = 0;
                const offsetAdd = (selectedShape === 'area_place' || selectedShape === 'area_erase') && areaFirstPoint ? areaHeightOffset : 0;
                const endY = hoverPosition[1] + offsetAdd;
                const height = Math.max(0.01, endY - startY);
                const midY = (startY + endY) / 2;
                return (
                  <group>
                    <mesh position={[hoverPosition[0], midY, hoverPosition[2]]} raycast={() => null}>
                      <cylinderGeometry args={[0.01, 0.01, height, 8]} />
                      <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
                    </mesh>
                    
                    <Html 
                      position={[hoverPosition[0], endY + 0.6, hoverPosition[2]]}
                      center
                      distanceFactor={15}
                      style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{
                        background: 'rgba(10, 25, 41, 0.9)',
                        border: '1px solid #00e5ff',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        color: '#ffffff',
                        fontFamily: '"Outfit", "Inter", sans-serif',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 20px rgba(0, 229, 255, 0.4)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transform: 'translateY(-10px)'
                      }}>
                        <span style={{ color: '#00e5ff' }}>Y: {endY.toFixed(2)}m</span>
                        <span style={{ fontSize: '9px', opacity: 0.8 }}>({Math.floor(endY / 0.5) + 1}段目)</span>
                      </div>
                    </Html>
                  </group>
                );
              })()}

              {selectedShape === 'area_select' && areaFirstPoint && selectedAreaBlocks === null ? (() => {
                const currentHoverY = hoverPosition[1] + areaHeightOffset;
                const sizeX = Math.abs(hoverPosition[0] - areaFirstPoint[0]) + 0.5;
                const sizeY = Math.abs(currentHoverY - areaFirstPoint[1]) + 0.5;
                const sizeZ = Math.abs(hoverPosition[2] - areaFirstPoint[2]) + 0.5;
                const centerX = (hoverPosition[0] + areaFirstPoint[0]) / 2;
                const centerY = (currentHoverY + areaFirstPoint[1]) / 2;
                const centerZ = (hoverPosition[2] + areaFirstPoint[2]) / 2;
                const color = "#ffeb3b";
                
                return (
                  <group>
                    <mesh position={[centerX, centerY, centerZ]} raycast={() => null}>
                      <boxGeometry args={[sizeX, sizeY, sizeZ]} />
                      <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} />
                    </mesh>
                    <mesh position={[centerX, centerY, centerZ]} raycast={() => null}>
                      <boxGeometry args={[sizeX + 0.02, sizeY + 0.02, sizeZ + 0.02]} />
                      <meshBasicMaterial color={color} wireframe transparent opacity={0.6} />
                    </mesh>
                  </group>
                );
              })() : null}

              {areaAction && clipboardBlocks.length > 0 ? (
                <group>
                  {clipboardBlocks.map((b, i) => (
                    <Block 
                      key={`ghost-${i}`}
                      position={[
                        hoverPosition[0] + b.relativePos[0],
                        hoverPosition[1] + b.relativePos[1],
                        hoverPosition[2] + b.relativePos[2]
                      ]} 
                      shape={b.shape} 
                      material={b.material} 
                      rotation={b.rotation} 
                      scale={b.scale} 
                      isGhost={true} 
                      diagonalPoints={b.diagonalPoints}
                      nature={b.nature}
                      agri={b.agri}
                      terrain={b.terrain}
                      agriNeighbors={
                        isConnectableAgriShape(b.shape)
                          ? getCardinalNeighbors({ ...b, id: `ghost-${i}`, pos: [
                            hoverPosition[0] + b.relativePos[0],
                            hoverPosition[1] + b.relativePos[1],
                            hoverPosition[2] + b.relativePos[2],
                          ] }, placedBlocks)
                          : null
                      }
                      terrainNeighbors={
                        isConnectableTerrainShape(b.shape)
                          ? getCardinalNeighbors({ ...b, id: `ghost-${i}`, pos: [
                            hoverPosition[0] + b.relativePos[0],
                            hoverPosition[1] + b.relativePos[1],
                            hoverPosition[2] + b.relativePos[2],
                          ] }, placedBlocks)
                          : null
                      }
                      railNeighbors={
                        b.shape === 'rail'
                          ? getCardinalNeighbors({ ...b, id: `ghost-${i}`, pos: [
                            hoverPosition[0] + b.relativePos[0],
                            hoverPosition[1] + b.relativePos[1],
                            hoverPosition[2] + b.relativePos[2],
                          ] }, placedBlocks)
                          : null
                      }
                    />
                  ))}
                </group>
              ) : null}

              {/* --- 1ブロックプレビュー --- */}
              {selectedShape === 'eraser' ? (
                hoveredDeleteBlockId ? (() => {
                  const targetBlock = placedBlocks.find(b => b.id === hoveredDeleteBlockId);
                  if (!targetBlock) return null;
                  const sx = targetBlock.scale?.[0] ?? 1;
                  const sy = targetBlock.scale?.[1] ?? 1;
                  const sz = targetBlock.scale?.[2] ?? 1;
                  const shape = targetBlock.shape || 'block';
                  let dy = 0;
                  let args = [0.55 * sx, 0.55 * sy, 0.55 * sz];
                  if (shape === 'half') args = [0.55 * sx, 0.275 * sy, 0.55 * sz];
                  else if (shape === 'path') { args = [0.55 * sx, 0.05 * sy, 0.55 * sz]; dy = -0.24; }
                  return (
                    <group position={[targetBlock.pos[0], targetBlock.pos[1] + dy, targetBlock.pos[2]]}>
                      <mesh raycast={() => null}>
                        <boxGeometry args={args} />
                        <meshBasicMaterial color="#ff5252" wireframe opacity={0.8} transparent />
                      </mesh>
                      <mesh raycast={() => null}>
                        <boxGeometry args={args} />
                        <meshBasicMaterial color="#ff5252" transparent opacity={0.2} depthWrite={false} />
                      </mesh>
                    </group>
                  );
                })() : null
              ) : selectedShape === 'edit' ? (
                hoveredEditBlockId ? (() => {
                  const targetBlock = placedBlocks.find(b => b.id === hoveredEditBlockId);
                  if (!targetBlock) return null;
                  const sx = targetBlock.scale?.[0] ?? 1;
                  const sy = targetBlock.scale?.[1] ?? 1;
                  const sz = targetBlock.scale?.[2] ?? 1;
                  const shape = targetBlock.shape || 'block';
                  let dy = 0;
                  let args = [0.55 * sx, 0.55 * sy, 0.55 * sz];
                  if (shape === 'half') args = [0.55 * sx, 0.275 * sy, 0.55 * sz];
                  else if (shape === 'path') { args = [0.55 * sx, 0.05 * sy, 0.55 * sz]; dy = -0.24; }
                  return (
                    <mesh position={[targetBlock.pos[0], targetBlock.pos[1] + dy, targetBlock.pos[2]]} raycast={() => null}>
                      <boxGeometry args={args} />
                      <meshBasicMaterial color="#ffeb3b" transparent opacity={0.3} depthWrite={false} />
                    </mesh>
                  );
                })() : null
              ) : selectedShape === 'area_select' && !areaFirstPoint && !areaAction ? (
                <mesh position={hoverPosition} raycast={() => null}>
                  <boxGeometry args={[0.5, 0.5, 0.5]} />
                  <meshBasicMaterial color="#ffeb3b" transparent opacity={0.4} />
                </mesh>
              ) : selectedShape === 'diagonal' ? (
                !isDesigningDiagonal && customDiagonalPoints ? (
                  <Block 
                    position={hoverPosition} 
                    shape="diagonal" 
                    material={selectedMaterial} 
                    scale={selectedScale} 
                    isGhost={true} 
                    diagonalPoints={[
                      [hoverPosition[0] + customDiagonalPoints[0][0], hoverPosition[1] + customDiagonalPoints[0][1], hoverPosition[2] + customDiagonalPoints[0][2]],
                      [hoverPosition[0] + customDiagonalPoints[1][0], hoverPosition[1] + customDiagonalPoints[1][1], hoverPosition[2] + customDiagonalPoints[1][2]]
                    ]}
                  />
                ) : null
              ) : (
                selectedShape !== 'area_select' && (!isAdjustingSize || !previewFixedPos) ? (
                  <Block 
                    position={hoverPosition} 
                    shape={selectedShape} 
                    material={selectedMaterial} 
                    rotation={blockRotation} 
                    scale={selectedScale} 
                    isGhost={true}
                    nature={{ species: selectedNatureSpecies, color: selectedNatureColors?.[selectedShape] }}
                    agri={{ color: selectedAgriColors?.[selectedShape] }}
                    terrain={{ color: selectedTerrainColors?.[selectedShape] }}
                    hoverboard={selectedShape === 'hoverboard_station' ? { color: selectedHoverboardColor } : undefined}
                    agriNeighbors={
                      isConnectableAgriShape(selectedShape)
                        ? getCardinalNeighbors({ id: '__ghost__', pos: hoverPosition, shape: selectedShape }, placedBlocks)
                        : null
                    }
                    terrainNeighbors={
                      isConnectableTerrainShape(selectedShape)
                        ? getCardinalNeighbors({ id: '__ghost__', pos: hoverPosition, shape: selectedShape }, placedBlocks)
                        : null
                    }
                    railNeighbors={
                      selectedShape === 'rail'
                        ? getCardinalNeighbors({ id: '__ghost__', pos: hoverPosition, shape: 'rail' }, placedBlocks)
                        : null
                    }
                  />
                ) : null
              )}
            </>
          )}

          {isAdjustingSize && previewFixedPos && selectedShape !== 'area_select' && selectedShape !== 'diagonal' && (
            <PreviewGizmoEditor
              basePosition={previewFixedPos}
              scale={selectedScale}
              setScale={setSelectedScale}
              shape={selectedShape}
              material={selectedMaterial}
              blockRotation={blockRotation}
              setIsTransforming={setIsTransforming}
              previewPositionOffset={previewPositionOffset}
              setPreviewPositionOffset={setPreviewPositionOffset}
            />
          )}
        </>
      )}
    </>
  );
};
