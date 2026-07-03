export const DEFAULT_COMPETITION_TOPIC = {
  id: 'topic_default',
  title: 'この場所を、誰もが通れるように',
  description: '改善案を匿名で投票しましょう。ファシリがお題を変更できます。',
};

export const DEFAULT_COMPETITION = {
  topic: { ...DEFAULT_COMPETITION_TOPIC },
  entries: [],
  votes: [],
};

export const normalizeCompetitionEntry = (entry) => {
  if (!entry?.id) return null;
  return {
    id: entry.id,
    bugId: entry.bugId ?? null,
    questId: entry.questId ?? null,
    plan: entry.plan ?? null,
    label: typeof entry.label === 'string' ? entry.label : '匿名案',
    blockSnapshot: Array.isArray(entry.blockSnapshot) ? entry.blockSnapshot : [],
    submittedAt: Number.isFinite(entry.submittedAt) ? entry.submittedAt : Date.now(),
    isSeriousMode: typeof entry.isSeriousMode === 'boolean' ? entry.isSeriousMode : false,
    remainingSessionBudget: typeof entry.remainingSessionBudget === 'number' ? entry.remainingSessionBudget : null,
    totalSessionBudget: typeof entry.totalSessionBudget === 'number' ? entry.totalSessionBudget : null,
    islandSatisfaction: entry.islandSatisfaction || null,
    questDecisions: entry.questDecisions || null,
  };
};

export const normalizeCompetition = (raw = {}) => ({
  topic: {
    id: raw?.topic?.id ?? DEFAULT_COMPETITION_TOPIC.id,
    title: raw?.topic?.title ?? DEFAULT_COMPETITION_TOPIC.title,
    description: raw?.topic?.description ?? DEFAULT_COMPETITION_TOPIC.description,
  },
  entries: Array.isArray(raw?.entries)
    ? raw.entries.map(normalizeCompetitionEntry).filter(Boolean).slice(-30)
    : [],
  votes: Array.isArray(raw?.votes)
    ? raw.votes
      .filter((v) => v && typeof v.entryId === 'string' && typeof v.voterId === 'string')
      .slice(-200)
    : [],
});

export const getEntryVoteCount = (entryId, votes = []) => (
  votes.filter((v) => v.entryId === entryId).length
);

export const rankCompetitionEntries = (entries = [], votes = []) => (
  [...entries]
    .map((entry) => ({
      ...entry,
      voteCount: getEntryVoteCount(entry.id, votes),
    }))
    .sort((a, b) => b.voteCount - a.voteCount || b.submittedAt - a.submittedAt)
);
