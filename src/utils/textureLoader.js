import * as THREE from 'three';

const textureUrls = {
  brick: '/models/Brick.png',
  glass: '/models/Glass.png',
  iron: '/models/Iron.png',
  light: '/models/Flash.png',
  mana: '/models/Magic.png',
  sand: '/models/Sand.png',
  stone: '/models/Stone.png',
  water: '/models/Water.png',
  wood: '/models/Wood.png',
  grass: '/models/Grass.png',
};

const loadedTextures = {};

export const getBlockTexture = (material) => {
  if (!textureUrls[material]) return null;
  
  if (!loadedTextures[material]) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(textureUrls[material]);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    loadedTextures[material] = texture;
  }
  
  return loadedTextures[material];
};
