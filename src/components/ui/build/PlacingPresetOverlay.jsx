import React from 'react';
import { MousePointerClick } from 'lucide-react';
import { PLACING_QUEST_OVERLAY_STYLE } from '../../../constants/ui/placingQuestOverlay';
import { PLACE_ARCHETYPE_LABELS } from '../../../utils/placePresets';

export const PlacingPresetOverlay = ({ placingPresetArchetype, cancelPlacing = () => {} }) => {
  if (!placingPresetArchetype) return null;
  const label = PLACE_ARCHETYPE_LABELS[placingPresetArchetype] ?? placingPresetArchetype;
  return (
    <div style={PLACING_QUEST_OVERLAY_STYLE.container}>
      <MousePointerClick size={24} color="#4fc3f7" />
      <span style={PLACING_QUEST_OVERLAY_STYLE.title}>
        {`島の上をダブルクリックして「${label}」を配置（プレビュー表示中）`}
      </span>
      <button onClick={cancelPlacing} style={PLACING_QUEST_OVERLAY_STYLE.cancelButton}>やめる</button>
    </div>
  );
};
