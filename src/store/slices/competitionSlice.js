import {
  DEFAULT_COMPETITION,
  normalizeCompetition,
  normalizeCompetitionEntry,
} from '../../constants/competitionData';
import { setTimedToast } from '../helpers/uiFeedback';
import { isSessionPlacedBlock } from '../../utils/improvementSession';
import { findBugById } from '../../utils/bugIds';

const getVoterId = () => {
  const key = 'ua_competition_voter_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `voter_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
};

export const createCompetitionSlice = (set, get) => ({
  setCompetitionTopic: (topic) => {
    if (!topic?.title) return;
    set((state) => ({
      competition: normalizeCompetition({
        ...state.competition,
        topic: {
          id: topic.id ?? `topic_${Date.now()}`,
          title: topic.title,
          description: topic.description ?? '',
        },
      }),
    }));
  },

  submitCompetitionEntry: ({ label = null } = {}) => {
    const { buildMode, bugs, placedBlocks, buildSession, competition } = get();
    if (!buildMode || buildMode === 'free') {
      setTimedToast({ set, get, message: '不満の改善 DIY 中のみエントリーできます。', durationMs: 2400 });
      return false;
    }

    const bug = findBugById(bugs, buildMode);
    if (!bug) return false;

    const sessionBlocks = buildSession
      ? placedBlocks.filter((b) => isSessionPlacedBlock(b, buildSession))
      : [];

    if (sessionBlocks.length === 0) {
      setTimedToast({ set, get, message: '改善ブロックを置いてからエントリーしてください。', durationMs: 2600 });
      return false;
    }

    const entry = normalizeCompetitionEntry({
      id: `entry_${Date.now()}`,
      bugId: bug.id,
      questId: bug.sourceQuestId ?? null,
      plan: bug.chosenPlan ?? buildSession?.plan ?? null,
      label: label ?? `案 ${competition.entries.length + 1}`,
      blockSnapshot: sessionBlocks.map((b) => ({
        shape: b.shape,
        material: b.material,
        pos: b.pos,
        scale: b.scale,
        rotation: b.rotation ?? 0,
      })),
      submittedAt: Date.now(),
    });

    set((state) => ({
      competition: normalizeCompetition({
        ...state.competition,
        entries: [...state.competition.entries, entry],
      }),
    }));

    setTimedToast({ set, get, message: 'コンペに匿名エントリーしました。', durationMs: 2800 });
    return entry;
  },

  voteCompetitionEntry: (entryId) => {
    const voterId = getVoterId();
    const { competition } = get();
    const entry = competition.entries.find((e) => e.id === entryId);
    if (!entry) return false;

    if (competition.votes.some((v) => v.voterId === voterId)) {
      setTimedToast({ set, get, message: '投票は 1 人 1 票までです。', durationMs: 2400 });
      return false;
    }

    set((state) => ({
      competition: normalizeCompetition({
        ...state.competition,
        votes: [...state.competition.votes, { entryId, voterId, votedAt: Date.now() }],
      }),
    }));

    setTimedToast({ set, get, message: '投票しました（匿名）。', durationMs: 2200 });
    return true;
  },

  resetCompetition: () => {
    set({ competition: { ...DEFAULT_COMPETITION } });
    setTimedToast({ set, get, message: 'コンペをリセットしました。', durationMs: 2200 });
  },
});
