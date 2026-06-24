import React from 'react';
import { MousePointerClick } from 'lucide-react';
import {
  PLACING_QUEST_OVERLAY_STYLE,
  getPlacingQuestMessage,
} from '../../../constants/ui/placingQuestOverlay';

export const PlacingQuestOverlay = ({ placingQuest, cancelPlacing = () => {} }) => {
  if (!placingQuest) return null;
  return (
    <div style={PLACING_QUEST_OVERLAY_STYLE.container}>
      <MousePointerClick size={24} color="#f5a623" />
      <span style={PLACING_QUEST_OVERLAY_STYLE.title}>
        {getPlacingQuestMessage(placingQuest?.isMine)}
      </span>
      <button onClick={cancelPlacing} style={PLACING_QUEST_OVERLAY_STYLE.cancelButton}>やめる</button>
    </div>
  );
};
