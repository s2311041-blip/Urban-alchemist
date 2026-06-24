export const sameBugId = (left, right) => (
  left !== null
  && left !== undefined
  && right !== null
  && right !== undefined
  && String(left) === String(right)
);

export const findBugById = (bugs = [], id) => (
  Array.isArray(bugs) ? bugs.find((bug) => sameBugId(bug?.id, id)) ?? null : null
);
