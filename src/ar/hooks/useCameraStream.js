import { useEffect, useRef, useState } from 'react';
import { getInsecureContextHint } from '../utils/secureContext';
import { captureVideoCoverFrame } from '../utils/videoCoverCrop';

export function useCameraStream({ enabled = true, facingMode = 'environment' } = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return undefined;
    }

    const insecureHint = getInsecureContextHint();
    if (insecureHint) {
      setError(insecureHint.title);
      setReady(false);
      return undefined;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('このブラウザはカメラに対応していません');
      setReady(false);
      return undefined;
    }

    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
        setError(null);
      } catch (err) {
        const name = err?.name ?? '';
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setError('カメラが拒否されました。設定 → Safari → カメラ で許可してください');
        } else if (name === 'NotFoundError') {
          setError('カメラが見つかりません');
        } else if (name === 'NotReadableError') {
          setError('カメラが他のアプリで使用中です');
        } else {
          setError('カメラを起動できません');
        }
        setReady(false);
      }
    };

    start();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setReady(false);
    };
  }, [enabled, facingMode]);

  const capturePhoto = () => captureVideoCoverFrame(videoRef.current);

  return { videoRef, ready, error, capturePhoto };
}
