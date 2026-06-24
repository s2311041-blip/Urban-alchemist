import { useEffect, useState } from 'react';

export async function checkImmersiveArSupport() {
  if (typeof navigator === 'undefined' || !navigator.xr?.isSessionSupported) {
    return false;
  }
  try {
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch {
    return false;
  }
}

/** 'checking' | 'supported' | 'unsupported' */
export function useWebXrSupport() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let cancelled = false;
    checkImmersiveArSupport().then((ok) => {
      if (!cancelled) setStatus(ok ? 'supported' : 'unsupported');
    });
    return () => { cancelled = true; };
  }, []);

  return status;
}
