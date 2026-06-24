import { normalizeHeading } from './geoMath';

function screenOrientationAngle() {
  if (window.screen?.orientation?.angle != null) {
    return window.screen.orientation.angle;
  }
  if (typeof window.orientation === 'number') {
    return window.orientation;
  }
  return 0;
}

/** iOS / Android 向けに heading（真北基準°）を読む */
export function readDeviceHeading(event) {
  const screenAngle = screenOrientationAngle();

  if (event.webkitCompassHeading != null && Number.isFinite(event.webkitCompassHeading)) {
    return normalizeHeading(event.webkitCompassHeading);
  }

  if (Number.isFinite(event.alpha)) {
    const absolute = event.absolute === true || event.type === 'deviceorientationabsolute';
    if (absolute) {
      return normalizeHeading(360 - event.alpha + screenAngle);
    }
    return normalizeHeading(360 - event.alpha);
  }

  return null;
}

/** 俯角（°）。0=水平、下向きで正 */
export function readDevicePitch(event) {
  if (!Number.isFinite(event.beta)) return null;
  return Math.max(-60, Math.min(60, event.beta - 90));
}

/**
 * iOS 13+ 向け。必ずユーザータップの同期的なコールスタックから呼ぶ。
 * async/await で包むと許可ダイアログが出ないことがある。
 */
export function requestDeviceOrientationPermissionSync({ onGranted, onDenied, onUnsupported }) {
  if (typeof DeviceOrientationEvent === 'undefined') {
    onUnsupported?.();
    return;
  }

  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then((state) => {
        if (state === 'granted') onGranted?.();
        else onDenied?.();
      })
      .catch(() => onDenied?.());
    return;
  }

  onGranted?.();
}
