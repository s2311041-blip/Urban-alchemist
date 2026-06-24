import { useEffect, useState } from 'react';

/**
 * @returns {'touch' | 'desktop'}
 * スマホ・タブレット（粗いポインタ or 狭い画面）とPCを粗く分岐
 */
export const useInputProfile = () => {
  const [profile, setProfile] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    return window.matchMedia('(pointer: coarse), (max-width: 768px)').matches
      ? 'touch'
      : 'desktop';
  });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse), (max-width: 768px)');
    const onChange = () => setProfile(mq.matches ? 'touch' : 'desktop');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return profile;
};
