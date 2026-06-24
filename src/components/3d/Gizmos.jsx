import React, { useState, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Block } from './Block';
import { useGameStore } from '../../store/useGameStore';

// === 自作 3D 6方向片側伸縮ネオンギズモ ＆ スタジオエディター ===
export const GizmoArrow = ({ position, rotation, color, onPointerDown }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <group 
      position={position} 
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (onPointerDown) onPointerDown(e);
      }}
    >
      {/* シャフト (円柱) */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshBasicMaterial color={hovered ? '#ffffff' : color} toneMapped={false} />
      </mesh>
      {/* ヘッド (コーン) */}
      <mesh position={[0, 0.35, 0]}>
        <coneGeometry args={[0.04, 0.1, 12]} />
        <meshBasicMaterial color={hovered ? '#ffffff' : color} toneMapped={false} />
      </mesh>
      {/* 見えない太い円柱 (クリック判定を広くするため) */}
      <mesh position={[0, 0.2, 0]} visible={false}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
      </mesh>
    </group>
  );
};

export const Gizmo3D = ({ scale = [1, 1, 1], offset = [0, 0, 0], rotation = 0, onDragStart }) => {
  const sx = Number(scale?.[0]) || 1;
  const sy = Number(scale?.[1]) || 1;
  const sz = Number(scale?.[2]) || 1;
  
  // ブロックの表面からのオフセット距離（少しだけ離す）
  const gap = 0.03;
  const px_pos = [sx * 0.25 + gap, 0, 0];
  const nx_pos = [-sx * 0.25 - gap, 0, 0];
  const py_pos = [0, sy * 0.25 + gap, 0];
  const ny_pos = [0, -sy * 0.25 - gap, 0];
  const pz_pos = [0, 0, sz * 0.25 + gap];
  const nz_pos = [0, 0, -sz * 0.25 - gap];

  return (
    <group position={offset} rotation={[0, rotation * Math.PI / 180, 0]}>
      {/* ＋X (右): 赤 */}
      <GizmoArrow position={px_pos} rotation={[0, 0, -Math.PI / 2]} color="#ff1744" onPointerDown={(e) => onDragStart(e, 'px')} />
      {/* －X (左): 赤透過 */}
      <GizmoArrow position={nx_pos} rotation={[0, 0, Math.PI / 2]} color="#ff8a80" onPointerDown={(e) => onDragStart(e, 'nx')} />
      
      {/* ＋Y (上): 緑 */}
      <GizmoArrow position={py_pos} rotation={[0, 0, 0]} color="#00e676" onPointerDown={(e) => onDragStart(e, 'py')} />
      {/* －Y (下): 緑透過 */}
      <GizmoArrow position={ny_pos} rotation={[Math.PI, 0, 0]} color="#b9f6ca" onPointerDown={(e) => onDragStart(e, 'ny')} />
      
      {/* ＋Z (手前): 青 */}
      <GizmoArrow position={pz_pos} rotation={[Math.PI / 2, 0, 0]} color="#2979ff" onPointerDown={(e) => onDragStart(e, 'pz')} />
      {/* －Z (奥): 青透過 */}
      <GizmoArrow position={nz_pos} rotation={[-Math.PI / 2, 0, 0]} color="#82b1ff" onPointerDown={(e) => onDragStart(e, 'nz')} />
    </group>
  );
};

export const StudioEditor = ({ 
  basePosition = [0, 0, 0],
  studioScale, 
  setStudioScale, 
  studioPositionOffset, 
  setStudioPositionOffset, 
  studioShape, 
  studioMaterial, 
  blockRotation,
  setIsTransforming,
  onDoubleClick
}) => {
  const { camera } = useThree();
  const pushStudioHistory = useGameStore((s) => s.pushStudioHistory);
  
  const dragAxis = useRef(null);
  const dragStartPoint = useRef(new THREE.Vector3());
  const dragStartScale = useRef([1, 1, 1]);
  const dragStartOffset = useRef([0, 0, 0]);
  const dragPlane = useRef(new THREE.Plane());
  const planeNormal = useRef(new THREE.Vector3());

  const handleGizmoDown = (e, axis) => {
    e.stopPropagation();
    setIsTransforming(true);
    
    dragAxis.current = axis;
    dragStartPoint.current.copy(e.point);
    dragStartScale.current = [...studioScale];
    dragStartOffset.current = [...studioPositionOffset];
    
    // カメラの向きをドラッグ平面の法線にする（ドラッグが最も安定する）
    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    normal.negate(); // カメラ側を向ける
    planeNormal.current.copy(normal);
    dragPlane.current.setFromNormalAndCoplanarPoint(normal, e.point);
  };

  useFrame((state) => {
    if (!dragAxis.current) return;
    
    // レイとドラッグ平面の交点を取得
    const inter = new THREE.Vector3();
    state.raycaster.ray.intersectPlane(dragPlane.current, inter);
    
    const delta = inter.clone().sub(dragStartPoint.current);
    
    // ブロックの回転を考慮して、ワールド移動ベクトル delta をローカル座標系の localDelta に変換する
    const angle = (blockRotation || 0) * Math.PI / 180;
    const qInv = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle).invert();
    const localDelta = delta.clone().applyQuaternion(qInv);
    
    let deltaLen = 0;
    let axisIdx = 0;
    let dirSign = 1;
    
    if (dragAxis.current === 'px') { deltaLen = localDelta.x; axisIdx = 0; dirSign = 1; }
    else if (dragAxis.current === 'nx') { deltaLen = -localDelta.x; axisIdx = 0; dirSign = -1; }
    else if (dragAxis.current === 'py') { deltaLen = localDelta.y; axisIdx = 1; dirSign = 1; }
    else if (dragAxis.current === 'ny') { deltaLen = -localDelta.y; axisIdx = 1; dirSign = -1; }
    else if (dragAxis.current === 'pz') { deltaLen = localDelta.z; axisIdx = 2; dirSign = 1; }
    else if (dragAxis.current === 'nz') { deltaLen = -localDelta.z; axisIdx = 2; dirSign = -1; }

    const startS = dragStartScale.current[axisIdx];
    const newS = Math.max(0.1, startS + deltaLen);
    const actualD = newS - startS;
    
    const nextScale = [...dragStartScale.current];
    nextScale[axisIdx] = newS;
    setStudioScale(nextScale);
    
    // スケール変更に伴うローカルオフセットの変化量を計算し、
    // ブロックの回転角を適用してワールド座標系に変換してから studioPositionOffset に加算する。
    // door の柱は X 軸方向に ±0.5 の位置にあるため、X 軸のみハーフエクステントを 0.5 とする。
    const he = studioShape === 'door' && axisIdx === 0 ? 0.5 : 0.25;
    const localOffsetDelta = new THREE.Vector3();
    if (axisIdx === 0) localOffsetDelta.set(actualD * he * dirSign, 0, 0);
    else if (axisIdx === 1) localOffsetDelta.set(0, actualD * he * dirSign, 0);
    else localOffsetDelta.set(0, 0, actualD * he * dirSign);
    
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    const worldOffsetDelta = localOffsetDelta.applyQuaternion(q);
    
    const nextOffset = [
      dragStartOffset.current[0] + worldOffsetDelta.x,
      dragStartOffset.current[1] + worldOffsetDelta.y,
      dragStartOffset.current[2] + worldOffsetDelta.z
    ];
    setStudioPositionOffset(nextOffset);
  });

  // pointerup イベントを window 全体で監視してドラッグを確実に終了させる
  useEffect(() => {
    const handlePointerUp = () => {
      if (dragAxis.current) {
        dragAxis.current = null;
        setIsTransforming(false);
        // ドラッグ終了後にスタジオ履歴へプッシュ
        pushStudioHistory(
          useGameStore.getState().studioScale,
          useGameStore.getState().studioPositionOffset,
          useGameStore.getState().studioMaterial,
          useGameStore.getState().studioShape
        );
      }
    };
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      setIsTransforming(false); // アンマウント時にも確実にロック解除
    };
  }, [setIsTransforming, pushStudioHistory]);

  const blockPosition = [
    (Number(basePosition?.[0]) || 0) + (Number(studioPositionOffset?.[0]) || 0),
    (Number(basePosition?.[1]) || 0) + (Number(studioPositionOffset?.[1]) || 0),
    (Number(basePosition?.[2]) || 0) + (Number(studioPositionOffset?.[2]) || 0)
  ];

  return (
    <group>
      {/* 対象ブロック */}
      <Block 
        position={blockPosition} 
        shape={studioShape} 
        material={studioMaterial} 
        rotation={blockRotation} 
        scale={studioScale}
        isGhost={false} 
        selectedEditBlockId={true}
        id="studio-editor-block"
        onDoubleClick={onDoubleClick}
      />
      
      {/* 6方向ネオンギズモ */}
      <Gizmo3D 
        scale={studioScale} 
        offset={blockPosition} 
        rotation={blockRotation}
        onDragStart={handleGizmoDown} 
      />
    </group>
  );
};

export const StudioCameraSetup = ({ isDesigning, isEditing, targetPos }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (isDesigning) {
      // 斜め設計：立方体に大きくズームアップ（寄りのカメラ位置）
      camera.position.set(0.6, 1.0, 1.2); 
    } else if (isEditing && targetPos) {
      // ブロック編集：編集対象ブロックの少し斜め上から見下ろす位置にカメラをスムーズに移動
      camera.position.set(targetPos[0] + 2.5, targetPos[1] + 3.0, targetPos[2] + 4.5);
    }
  }, [isDesigning, isEditing, targetPos, camera]);

  return null;
};

export const PreviewGizmoEditor = ({ 
  basePosition = [0, 0, 0],
  scale, 
  setScale, 
  shape, 
  material, 
  blockRotation,
  setIsTransforming,
  previewPositionOffset,
  setPreviewPositionOffset
}) => {
  const { camera } = useThree();
  const pushSizeAdjustHistory = useGameStore((s) => s.pushSizeAdjustHistory);
  
  const dragAxis = useRef(null);
  const dragStartPoint = useRef(new THREE.Vector3());
  const dragStartScale = useRef([1, 1, 1]);
  const dragStartOffset = useRef([0, 0, 0]);
  const dragPlane = useRef(new THREE.Plane());
  const planeNormal = useRef(new THREE.Vector3());

  const handleGizmoDown = (e, axis) => {
    e.stopPropagation();
    setIsTransforming(true);
    
    dragAxis.current = axis;
    dragStartPoint.current.copy(e.point);
    dragStartScale.current = [...scale];
    dragStartOffset.current = [...previewPositionOffset];
    
    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    normal.negate(); 
    planeNormal.current.copy(normal);
    dragPlane.current.setFromNormalAndCoplanarPoint(normal, e.point);
  };

  useFrame((state) => {
    if (!dragAxis.current) return;
    
    const inter = new THREE.Vector3();
    state.raycaster.ray.intersectPlane(dragPlane.current, inter);
    
    const delta = inter.clone().sub(dragStartPoint.current);
    
    // ブロックの回転を考慮して、ワールド移動ベクトル delta をローカル座標系の localDelta に変換する
    const angle = (blockRotation || 0) * Math.PI / 180;
    const qInv = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle).invert();
    const localDelta = delta.clone().applyQuaternion(qInv);
    
    let deltaLen = 0;
    let axisIdx = 0;
    let dirSign = 1;
    
    if (dragAxis.current === 'px') { deltaLen = localDelta.x; axisIdx = 0; dirSign = 1; }
    else if (dragAxis.current === 'nx') { deltaLen = -localDelta.x; axisIdx = 0; dirSign = -1; }
    else if (dragAxis.current === 'py') { deltaLen = localDelta.y; axisIdx = 1; dirSign = 1; }
    else if (dragAxis.current === 'ny') { deltaLen = -localDelta.y; axisIdx = 1; dirSign = -1; }
    else if (dragAxis.current === 'pz') { deltaLen = localDelta.z; axisIdx = 2; dirSign = 1; }
    else if (dragAxis.current === 'nz') { deltaLen = -localDelta.z; axisIdx = 2; dirSign = -1; }

    const startS = dragStartScale.current[axisIdx];
    const newS = Math.max(0.1, startS + deltaLen);
    const actualD = newS - startS;
    
    const nextScale = [...dragStartScale.current];
    nextScale[axisIdx] = newS;
    setScale(nextScale);

    // 片側伸縮に伴う位置オフセット調整（StudioEditorと同様）
    // door の柱は X 軸方向に ±0.5 の位置にあるため、X 軸のみハーフエクステントを 0.5 とする。
    const he = shape === 'door' && axisIdx === 0 ? 0.5 : 0.25;
    const localOffsetDelta = new THREE.Vector3();
    if (axisIdx === 0) localOffsetDelta.set(actualD * he * dirSign, 0, 0);
    else if (axisIdx === 1) localOffsetDelta.set(0, actualD * he * dirSign, 0);
    else localOffsetDelta.set(0, 0, actualD * he * dirSign);
    
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    const worldOffsetDelta = localOffsetDelta.applyQuaternion(q);
    
    const nextOffset = [
      dragStartOffset.current[0] + worldOffsetDelta.x,
      dragStartOffset.current[1] + worldOffsetDelta.y,
      dragStartOffset.current[2] + worldOffsetDelta.z
    ];
    setPreviewPositionOffset(nextOffset);
  });

  useEffect(() => {
    const handlePointerUp = () => {
      if (dragAxis.current) {
        dragAxis.current = null;
        setIsTransforming(false);
        // ドラッグ終了後にサイズ調整履歴へプッシュ
        pushSizeAdjustHistory(
          useGameStore.getState().selectedScale,
          useGameStore.getState().previewPositionOffset
        );
      }
    };
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      setIsTransforming(false); // アンマウント時にも確実にロック解除
    };
  }, [setIsTransforming, pushSizeAdjustHistory]);

  const blockPosition = [
    (Number(basePosition?.[0]) || 0) + (Number(previewPositionOffset?.[0]) || 0),
    (Number(basePosition?.[1]) || 0) + (Number(previewPositionOffset?.[1]) || 0),
    (Number(basePosition?.[2]) || 0) + (Number(previewPositionOffset?.[2]) || 0)
  ];

  return (
    <group>
      <Block 
        position={blockPosition} 
        shape={shape} 
        material={material} 
        rotation={blockRotation} 
        scale={scale}
        isGhost={true} 
      />
      
      <Gizmo3D 
        scale={scale} 
        offset={blockPosition} 
        rotation={blockRotation}
        onDragStart={handleGizmoDown} 
      />
    </group>
  );
};

