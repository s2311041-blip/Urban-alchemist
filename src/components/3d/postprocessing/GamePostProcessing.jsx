import React from 'react';
import { EffectComposer, Bloom, BrightnessContrast, HueSaturation, Vignette, DepthOfField, SSAO } from '@react-three/postprocessing';
import { ART_DIRECTION } from '../../../constants/buildFeatureFlags';
import { BLOOM, POST_PROCESSING, DOF, SSAO as SSAO_CONFIG } from '../../../constants/artDirection';
import { BlendFunction } from 'postprocessing';

export const GamePostProcessing = () => {
  if (!ART_DIRECTION.enabled) return null;

  return (
    <EffectComposer multisampling={0}>
      <HueSaturation saturation={POST_PROCESSING.saturation} />
      <BrightnessContrast
        brightness={POST_PROCESSING.brightness}
        contrast={POST_PROCESSING.contrast}
      />
      {ART_DIRECTION.useBloom && (
        <Bloom
          intensity={BLOOM.intensity}
          luminanceThreshold={BLOOM.luminanceThreshold}
          luminanceSmoothing={BLOOM.luminanceSmoothing}
          mipmapBlur={BLOOM.mipmapBlur}
          resolutionScale={BLOOM.resolutionScale}
        />
      )}
      <Vignette
        offset={POST_PROCESSING.vignetteOffset}
        darkness={POST_PROCESSING.vignetteDarkness}
      />
    </EffectComposer>
  );
};

