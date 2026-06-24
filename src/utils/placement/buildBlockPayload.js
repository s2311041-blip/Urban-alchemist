import { isNatureShape, isColorableNatureShape } from '../../constants/natureData';
import { isAgriShape } from '../../constants/agriData';
import { DEFAULT_HOVERBOARD_COLOR } from '../../constants/hoverboardData';
import { isTerrainShape, normalizeTerrainShape } from '../../constants/terrainData';
import { createNewPlotAgriState } from '../agriGrowth';
import { snapFerryDockPos } from '../ferryDockPlacement';

/**
 * 標準ブロック（eraser / area / diagonal 以外）の配置 payload を生成
 */
export const buildStandardBlockPayload = ({
  selectedShape,
  selectedMaterial,
  blockRotation,
  selectedScale,
  finalPos,
  worldTime,
  selectedNatureSpecies,
  selectedNatureColors,
  selectedAgriColors,
  selectedTerrainColors,
  selectedHoverboardColor,
  selectedGlassColor,
  islandChunks,
}) => {
  const naturePayload = isNatureShape(selectedShape)
    ? {
      ...(selectedNatureSpecies ? { species: selectedNatureSpecies } : {}),
      ...(isColorableNatureShape(selectedShape) && selectedNatureColors?.[selectedShape]
        ? { color: selectedNatureColors[selectedShape] }
        : {}),
    }
    : null;
  const agriPayload = isAgriShape(selectedShape)
    ? createNewPlotAgriState(selectedShape, worldTime?.dayIndex ?? 0, {
      ...(selectedAgriColors?.[selectedShape]
        ? { color: selectedAgriColors[selectedShape] }
        : {}),
    })
    : null;
  const terrainShape = normalizeTerrainShape(selectedShape);
  const terrainPayload = isTerrainShape(selectedShape)
    ? {
      ...(selectedTerrainColors?.[terrainShape]
        ? { color: selectedTerrainColors[terrainShape] }
        : {}),
    }
    : null;
  const hoverboardPayload = selectedShape === 'hoverboard_station'
    ? { color: selectedHoverboardColor || DEFAULT_HOVERBOARD_COLOR }
    : null;

  return {
    id: Math.random().toString(),
    pos: selectedShape === 'ferry_dock'
      ? snapFerryDockPos(finalPos[0], finalPos[2], islandChunks)
      : finalPos,
    shape: isTerrainShape(selectedShape) ? terrainShape : selectedShape,
    material: selectedMaterial,
    ...(selectedMaterial === 'glass' && selectedGlassColor ? { glassColor: selectedGlassColor } : {}),
    rotation: blockRotation,
    scale: [...selectedScale],
    ...(naturePayload && Object.keys(naturePayload).length > 0 ? { nature: naturePayload } : {}),
    ...(agriPayload && Object.keys(agriPayload).length > 0 ? { agri: agriPayload } : {}),
    ...(terrainPayload && Object.keys(terrainPayload).length > 0 ? { terrain: terrainPayload } : {}),
    ...(hoverboardPayload ? { hoverboard: hoverboardPayload } : {}),
    placedAt: Date.now()
  };
};
