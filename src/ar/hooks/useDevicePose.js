import { useCallback, useEffect, useRef, useState } from 'react';
import { KOTO_CENTER } from '../constants/kotoArea';
import {
  readDeviceHeading,
  readDevicePitch,
  requestDeviceOrientationPermissionSync,
} from '../utils/deviceOrientation';
import {
  GEO_WATCH_HIGH,
  geolocationErrorMessage,
} from '../utils/geolocation';
import { getInsecureContextHint, isSecureContext } from '../utils/secureContext';
import { acceptGeoUpdate } from '../utils/geoPosition';

export function useDevicePose({ enabled = true } = {}) {
  const [geo, setGeo] = useState(null);
  const [headingDeg, setHeadingDeg] = useState(0);
  const [pitchDeg, setPitchDeg] = useState(0);
  const [geoError, setGeoError] = useState(null);
  const [geoDemo, setGeoDemo] = useState(false);
  const [compassActive, setCompassActive] = useState(false);
  const [permissionState, setPermissionState] = useState('idle');
  const [sensorUnavailable, setSensorUnavailable] = useState(false);
  const [insecureContext, setInsecureContext] = useState(false);

  const watchIdsRef = useRef([]);
  const lastHeadingRef = useRef(null);
  const poseRef = useRef({ headingDeg: 0, pitchDeg: 0 });
  const permissionStateRef = useRef('idle');
  const geoFailCountRef = useRef(0);
  const geoRef = useRef(null);

  const syncPermissionState = useCallback((next) => {
    permissionStateRef.current = next;
    setPermissionState(next);
  }, []);

  useEffect(() => {
    setInsecureContext(!isSecureContext() && getInsecureContextHint() != null);
  }, []);

  const requestOrientation = useCallback(() => {
    if (!isSecureContext()) {
      setInsecureContext(true);
      setSensorUnavailable(false);
      syncPermissionState('idle');
      return;
    }

    if (typeof DeviceOrientationEvent === 'undefined') {
      setSensorUnavailable(true);
      syncPermissionState('unsupported');
      return;
    }

    syncPermissionState('pending');

    requestDeviceOrientationPermissionSync({
      onGranted: () => syncPermissionState('granted'),
      onDenied: () => syncPermissionState('denied'),
      onUnsupported: () => {
        setSensorUnavailable(true);
        syncPermissionState('unsupported');
      },
    });
  }, [syncPermissionState]);

  useEffect(() => {
    if (!enabled) return undefined;

    if (!navigator.geolocation) {
      setGeoError('位置情報が利用できません');
      setGeo(KOTO_CENTER);
      setGeoDemo(true);
      return undefined;
    }

    if (!isSecureContext()) {
      setGeo(KOTO_CENTER);
      setGeoDemo(true);
      setGeoError('位置情報は HTTPS 接続でのみ取得できます');
      return undefined;
    }

    let cancelled = false;

    const clearWatches = () => {
      watchIdsRef.current.forEach((id) => navigator.geolocation.clearWatch(id));
      watchIdsRef.current = [];
    };

    const applyPosition = (pos) => {
      if (cancelled) return;
      geoFailCountRef.current = 0;
      const raw = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        capturedAt: Date.now(),
      };
      const next = acceptGeoUpdate(geoRef.current, raw);
      geoRef.current = next;
      setGeo(next);
      setGeoError(null);
      setGeoDemo(false);
    };

    const useDemoWithMessage = (error) => {
      if (cancelled) return;
      const { short, detail } = geolocationErrorMessage(error);
      setGeo(KOTO_CENTER);
      setGeoDemo(true);
      setGeoError(`${short}（デモ位置・江東区中心） — ${detail}`);
    };

    const onGeoError = (error) => {
      if (cancelled) return;
      geoFailCountRef.current += 1;
      if (geoFailCountRef.current < 3) {
        setGeoError(`${geolocationErrorMessage(error).short}… 再試行中`);
        return;
      }
      useDemoWithMessage(error);
    };

    navigator.geolocation.getCurrentPosition(
      applyPosition,
      onGeoError,
      GEO_WATCH_HIGH,
    );

    const watchId = navigator.geolocation.watchPosition(
      applyPosition,
      onGeoError,
      GEO_WATCH_HIGH,
    );
    watchIdsRef.current = [watchId];

    return () => {
      cancelled = true;
      clearWatches();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    const onOrientation = (event) => {
      const h = readDeviceHeading(event);
      if (h != null) {
        poseRef.current.headingDeg = h;
        lastHeadingRef.current = h;
        setHeadingDeg(h);
        setCompassActive(true);
        setSensorUnavailable(false);
      }

      const p = readDevicePitch(event);
      if (p != null) {
        poseRef.current.pitchDeg = p;
        setPitchDeg(p);
      }
    };

    window.addEventListener('deviceorientationabsolute', onOrientation, true);
    window.addEventListener('deviceorientation', onOrientation, true);

    const compassTimer = window.setTimeout(() => {
      if (lastHeadingRef.current != null) return;
      if (!isSecureContext()) {
        setInsecureContext(true);
        return;
      }
      setCompassActive(false);
      if (permissionStateRef.current === 'granted') {
        setSensorUnavailable(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('deviceorientationabsolute', onOrientation, true);
      window.removeEventListener('deviceorientation', onOrientation, true);
      window.clearTimeout(compassTimer);
    };
  }, [enabled]);

  return {
    geo,
    headingDeg,
    pitchDeg,
    poseRef,
    geoError,
    geoDemo,
    compassActive,
    permissionState,
    sensorUnavailable,
    insecureContext,
    requestOrientation,
  };
}
