import { useEffect, useState } from 'react';

/** タッチ端末なら「タップ」、PCなら「クリック」 */
export function usePointerLabel() {
  const [label, setLabel] = useState(() => (
    typeof window !== 'undefined'
    && (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)
      ? 'タップ'
      : 'クリック'
  ));

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => {
      setLabel(mq.matches || 'ontouchstart' in window ? 'タップ' : 'クリック');
    };
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return label;
}

export function pointerActionPhrase(label) {
  return label === 'タップ' ? '画面をタップ' : '画面をクリック';
}
