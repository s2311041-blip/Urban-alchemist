import React, { useMemo, useState } from 'react';
import { ClipboardList, X, User, Users, Pencil } from 'lucide-react';
import { PLACE_ARCHETYPE_LABELS } from '../../../utils/placePresets';
import { normalizeQuestStatus, isQuestResolved, isQuestOnIsland, canStartQuestPlacement } from '../../../store/helpers/questState';
import {
  QUEST_OWNER_FILTER_OPTIONS,
  QUEST_STATUS_FILTER_OPTIONS,
  QUEST_BOARD_COPY,
  QUEST_BOARD_STYLE,
  getOwnerFilterButtonStyle,
  getStatusFilterButtonStyle,
  getQuestOwnerBadgeStyle,
  getQuestCardStyle,
  getQuestActionButtonStyle,
  getQuestStatusMeta,
} from '../../../constants/ui/questBoardOverlay';
import { QuestImportPanel } from './QuestImportPanel';
import { CompetitionPanel } from './CompetitionPanel';
import { ResearchToolsPanel } from './ResearchToolsPanel';

const getPlaceArchetypeLabel = (placeArchetype) => {
  if (placeArchetype === 'none') return 'どれにも当てはまらない（オーブのみ）';
  return PLACE_ARCHETYPE_LABELS[placeArchetype] ?? null;
};

export const QuestBoardOverlay = ({
  isQuestBoardOpen,
  setIsQuestBoardOpen,
  quests = [],
  startPlacingQuest,
  focusQuestOnIsland,
  importArAnnotations,
  openAREditQuest,
  competition,
  voteCompetitionEntry,
  resetCompetition,
  setCompetitionTopic,
  exportResearchLog,
  loadDemoQuestSet,
  postStats,
  isSeriousMode,
  startConsensusSession,
}) => {
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const filteredQuests = useMemo(() => quests.filter((quest) => {
    const questStatus = normalizeQuestStatus(quest?.questStatus);
    const ownerMatch = ownerFilter === 'all'
      ? true
      : ownerFilter === 'mine'
        ? !!quest.isMine
        : !quest.isMine;
    const statusMatch = statusFilter === 'all'
      ? true
      : statusFilter === 'active'
        ? !isQuestResolved(questStatus)
        : isQuestResolved(questStatus);
    return ownerMatch && statusMatch;
  }), [quests, ownerFilter, statusFilter]);
  if (!isQuestBoardOpen) return null;

  return (
    <div style={QUEST_BOARD_STYLE.overlay}>
      <div style={QUEST_BOARD_STYLE.panel}>
        <div style={QUEST_BOARD_STYLE.header}>
          <h2 style={QUEST_BOARD_STYLE.title}><ClipboardList size={24} /> {QUEST_BOARD_COPY.title}</h2>
          <button onClick={() => setIsQuestBoardOpen(false)} style={QUEST_BOARD_STYLE.closeButton}><X size={24} color="white" /></button>
        </div>
        <div style={QUEST_BOARD_STYLE.content}>
          {importArAnnotations && (
            <QuestImportPanel importArAnnotations={importArAnnotations} />
          )}
          {exportResearchLog && (
            <ResearchToolsPanel
              exportResearchLog={exportResearchLog}
              loadDemoQuestSet={loadDemoQuestSet}
              postStats={postStats}
              isSeriousMode={isSeriousMode}
              startConsensusSession={startConsensusSession}
            />
          )}
          {competition && voteCompetitionEntry && (
            <CompetitionPanel
              competition={competition}
              voteCompetitionEntry={voteCompetitionEntry}
              resetCompetition={resetCompetition}
              setCompetitionTopic={setCompetitionTopic}
            />
          )}
          <div style={QUEST_BOARD_STYLE.filterRow}>
            {QUEST_OWNER_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setOwnerFilter(opt.id)}
                style={getOwnerFilterButtonStyle(ownerFilter === opt.id)}
              >
                {opt.label}
              </button>
            ))}
            {QUEST_STATUS_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                style={getStatusFilterButtonStyle(statusFilter === opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {filteredQuests.length === 0 ? (
            <p style={QUEST_BOARD_STYLE.empty}>{QUEST_BOARD_COPY.empty}</p>
          ) : (
            filteredQuests.map((quest) => {
              const questStatus = normalizeQuestStatus(quest?.questStatus);
              const statusMeta = getQuestStatusMeta(questStatus);

              return (
                <div key={quest.id} style={getQuestCardStyle(quest.isMine)}>
                  <div style={QUEST_BOARD_STYLE.cardHeader}>
                    <span style={getQuestOwnerBadgeStyle(quest.isMine)}>
                      {quest.isMine ? <User size={14} /> : <Users size={14} />} {quest.demographic}
                    </span>
                    <span style={QUEST_BOARD_STYLE.dateText}>{QUEST_BOARD_COPY.today}</span>
                  </div>
                  <div style={QUEST_BOARD_STYLE.badgeRow}>
                    <span style={{ ...QUEST_BOARD_STYLE.statusBadge, background: statusMeta.bg, color: statusMeta.color }}>
                      {statusMeta.label}
                    </span>
                    {getPlaceArchetypeLabel(quest.placeArchetype) && (
                      <span style={QUEST_BOARD_STYLE.placeBadge}>
                        {QUEST_BOARD_COPY.placeTypePrefix} {getPlaceArchetypeLabel(quest.placeArchetype)}
                      </span>
                    )}
                  </div>
                  <p style={QUEST_BOARD_STYLE.comment}>「{quest.comment}」</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {quest.isMine && !isQuestResolved(questStatus) && openAREditQuest && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsQuestBoardOpen(false);
                          openAREditQuest(quest.id);
                        }}
                        style={getQuestActionButtonStyle('focus')}
                      >
                        <Pencil size={14} />
                        編集
                      </button>
                    )}
                    {canStartQuestPlacement(quest) ? (
                      <button onClick={() => startPlacingQuest(quest)} style={getQuestActionButtonStyle('place')}>
                        {QUEST_BOARD_COPY.placeButton}
                      </button>
                    ) : isQuestOnIsland(questStatus) ? (
                      <button
                        type="button"
                        onClick={() => focusQuestOnIsland?.(quest)}
                        style={getQuestActionButtonStyle('focus')}
                      >
                        {QUEST_BOARD_COPY.focusButton}
                      </button>
                    ) : (
                      <div style={QUEST_BOARD_STYLE.resolvedBox}>
                        {QUEST_BOARD_COPY.resolvedLabel}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
