import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeHeading } from '../utils/geoMath';

const DRAG_THRESHOLD_PX = 8;

/**
 * 端末コンパス + ドラッグ/キーで視線（heading/pitch）を操作。
 * lookRef は useFrame 向けに毎フレーム読める最新オフセット。
 */
export function useViewerLook({ baseHeadingDeg = 0, basePitchDeg = 0, enabled = true } = {}) {
  const [dragHeading, setDragHeading] = useState(0);
  const [dragPitch, setDragPitch] = useState(0);
  const dragRef = useRef(null);
  const lookRef = useRef({ headingOffset: 0, pitchOffset: 0 });

  const syncLookRef = useCallback((h, p) => {
    lookRef.current.headingOffset = h;
    lookRef.current.pitchOffset = p;
  }, []);

  const onPointerDown = useCallback((event) => {
    if (!enabled) return;
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      heading: lookRef.current.headingOffset,
      pitch: lookRef.current.pitchOffset,
      dragging: false,
      pointerId: event.pointerId,
      target: event.currentTarget,
    };
  }, [enabled]);

  const onPointerMove = useCallback((event) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;

    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;

    if (!dragRef.current.dragging) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      dragRef.current.dragging = true;
      try {
        dragRef.current.target.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }

    const nextH = dragRef.current.heading + dx * 0.45;
    const nextP = Math.max(-55, Math.min(55, dragRef.current.pitch - dy * 0.35));
    syncLookRef(nextH, nextP);
    setDragHeading(nextH);
    setDragPitch(nextP);
  }, [syncLookRef]);

  const onPointerUp = useCallback((event) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
    if (dragRef.current.dragging) {
      try {
        dragRef.current.target.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }
    dragRef.current = null;
  }, []);

  const resetLook = useCallback(() => {
    syncLookRef(0, 0);
    setDragHeading(0);
    setDragPitch(0);
  }, [syncLookRef]);

  useEffect(() => {
    if (!enabled) return undefined;

    const onKey = (event) => {
      const step = event.shiftKey ? 8 : 3;
      let nextH = lookRef.current.headingOffset;
      let nextP = lookRef.current.pitchOffset;
      if (event.key === 'ArrowLeft') nextH += step;
      if (event.key === 'ArrowRight') nextH -= step;
      if (event.key === 'ArrowUp') nextP = Math.min(55, nextP + step);
      if (event.key === 'ArrowDown') nextP = Math.max(-55, nextP - step);
      syncLookRef(nextH, nextP);
      setDragHeading(nextH);
      setDragPitch(nextP);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, syncLookRef]);

  return {
    headingDeg: normalizeHeading(baseHeadingDeg + dragHeading),
    pitchDeg: Math.max(-55, Math.min(55, basePitchDeg + dragPitch)),
    lookRef,
    lookHandlers: enabled ? {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    } : {},
    resetLook,
    hasDragOffset: Math.abs(dragHeading) > 0.5 || Math.abs(dragPitch) > 0.5,
  };
}
