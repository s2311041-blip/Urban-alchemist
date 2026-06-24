import { createXRStore } from '@react-three/xr';

export const arXrStore = createXRStore({
  hand: false,
  controller: false,
  gaze: false,
  transientPointer: true,
  screenInput: true,
  detectedMesh: false,
  detectedPlane: false,
});
