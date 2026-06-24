import * as THREE from 'three';

const textureCache = {};

export const getPixelTexture = (baseColorHex, variance = 15) => {
  if (textureCache[baseColorHex]) return textureCache[baseColorHex];

  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  
  const baseColor = new THREE.Color(baseColorHex);
  const hsl = {};
  baseColor.getHSL(hsl);

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const v = (Math.random() - 0.5) * (variance / 100);
      const c = new THREE.Color().setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + v)));
      context.fillStyle = '#' + c.getHexString();
      context.fillRect(x, y, 1, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  
  textureCache[baseColorHex] = texture;
  return texture;
};
