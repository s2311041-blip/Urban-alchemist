import React from 'react';

/**
 * 3D ツリー内の描画エラーで Canvas 全体が消えるのを防ぐ
 */
export class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[SceneErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <group>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2, 0.2, 2]} />
            <meshStandardMaterial color="#8BC34A" />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#7E57C2" emissive="#B39DDB" emissiveIntensity={0.4} />
          </mesh>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={0.8} />
        </group>
      );
    }
    return this.props.children;
  }
}
