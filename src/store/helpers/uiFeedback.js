export const setTimedToast = ({
  set,
  get,
  message,
  durationMs = 2200,
  key = 'farmingToast',
}) => {
  if (typeof message !== 'string' || !message) return;
  set({ [key]: message });
  setTimeout(() => {
    if (get()[key] === message) set({ [key]: null });
  }, durationMs);
};
