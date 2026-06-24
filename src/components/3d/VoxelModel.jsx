import React, { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

/**
 * 外部のGLTF/GLBモデル（MagicaVoxel等で作成）を読み込んで表示するコンポーネント。
 * エラー時や読み込み中は fallback に指定された従来のプリミティブ図形等を表示します。
 */
const ModelRenderer = ({ url, castShadow = true, receiveShadow = true, ...props }) => {
  const { scene } = useGLTF(url);
  
  // マテリアルの設定を調整（必要に応じてピクセルアート向けにNearestFilterなどを当てる）
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;
        if (child.material && child.material.map) {
          child.material.map.magFilter = 1003; // THREE.NearestFilter
          child.material.map.minFilter = 1003; // THREE.NearestFilter
        }
      }
    });
    return clone;
  }, [scene, castShadow, receiveShadow]);

  return <primitive object={clonedScene} {...props} />;
};

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Failed to load voxel model:', this.props.url, error);
  }

  render() {
    if (this.state.hasError) {
      // 読み込み失敗時は赤いエラー箱を表示
      return (
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="red" />
        </mesh>
      );
    }
    return this.props.children;
  }
}

export const VoxelModel = ({ url, fallback, ...props }) => {
  if (!url) return fallback || null;

  return (
    <ModelErrorBoundary url={url} fallback={fallback}>
      <Suspense fallback={fallback || null}>
        <ModelRenderer url={url} {...props} />
      </Suspense>
    </ModelErrorBoundary>
  );
};

// プレロード（使用する可能性が高いモデルを事前キャッシュ）
// useGLTF.preload('/models/avatar.glb');
// useGLTF.preload('/models/light_pole.glb');
