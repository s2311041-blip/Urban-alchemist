import { useEffect, useState } from 'react';

/** フェリー乗船の画面フェード演出 */
export function useFerryFade(ferryTransitionUntil) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const active = Number.isFinite(ferryTransitionUntil) && ferryTransitionUntil > nowMs;

  useEffect(() => {
    const now = Date.now();
    if (!Number.isFinite(ferryTransitionUntil) || ferryTransitionUntil <= now) return;
    const timeout = setTimeout(() => setNowMs(Date.now()), ferryTransitionUntil - now);
    return () => clearTimeout(timeout);
  }, [ferryTransitionUntil]);

  return active;
}
