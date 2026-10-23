import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const MergedLayout = ({ children, disable = false }) => {
  const groupRef = useRef();
  const [mergedMeshes, setMergedMeshes] = useState([]);
  const [hasMerged, setHasMerged] = useState(false);
  // 結合後の mesh は元のレイアウト group の兄弟になるため、イベントは
  // 自動では引き継がれない。見えている結合 mesh 自体に同じイベントを渡す。
  const interactionProps = {
    onPointerMove: children?.props?.onPointerMove,
    onPointerOut: children?.props?.onPointerOut,
    onPointerDown: children?.props?.onPointerDown,
    onClick: children?.props?.onClick,
    onDoubleClick: children?.props?.onDoubleClick,
  };

  // children が変わったら再マージを促すため hasMerged をリセット
  useEffect(() => {
    if (disable) return;
    setHasMerged(false);
    setMergedMeshes([]);
  }, [children, disable]);

  useEffect(() => {
    if (disable || hasMerged) return;
    const group = groupRef.current;
    if (!group) return;

    let active = true;
    
    // R3Fのレンダリング完了を待つため少しディレイを入れます
    const timer = setTimeout(() => {
      if (!active) return;
      
      group.updateMatrixWorld(true);

      const meshesByMaterialKey = {};
      const materialsByKey = {};

      group.traverse((node) => {
        if (node.isMesh && node.userData?.isMergedMesh !== true) {
          if (!node.geometry) return;
          const geometry = node.geometry.clone();

          // ルートグループ基準のトランスフォーム行列を適用
          const tempMatrix = new THREE.Matrix4();
          let current = node;
          const matrices = [];
          let foundGroup = false;
          while (current) {
            if (current === group) {
              foundGroup = true;
              break;
            }
            current.updateMatrix();
            matrices.push(current.matrix);
            current = current.parent;
          }
          if (!foundGroup) return; // 親グループに到達しなかったノード（想定外）はスキップ
          for (let i = matrices.length - 1; i >= 0; i--) {
            tempMatrix.multiply(matrices[i]);
          }
          geometry.applyMatrix4(tempMatrix);

          const mat = node.material;
          if (!mat || typeof mat.clone !== 'function') return;
          if (mat.transparent) {
            // 透明なメッシュは非表示の対象外にする
            node.userData = { ...node.userData, keepVisible: true };
            return;
          }
          
          // マテリアルの特徴から一意のキーを生成
          const colorHex = mat.color ? mat.color.getHexString() : 'ffffff';
          const emissiveHex = mat.emissive ? mat.emissive.getHexString() : '000000';
          const emissiveInt = mat.emissiveIntensity ?? 0;
          const opacity = mat.opacity ?? 1;
          const transparent = mat.transparent ? '1' : '0';
          const roughness = mat.roughness ?? 0.9;
          const metalness = mat.metalness ?? 0;
          const flatShading = mat.flatShading ? '1' : '0';

          const key = `${colorHex}_${emissiveHex}_${emissiveInt}_${opacity}_${transparent}_${roughness}_${metalness}_${flatShading}`;

          if (!meshesByMaterialKey[key]) {
            meshesByMaterialKey[key] = [];
            materialsByKey[key] = mat.clone();
          }
          meshesByMaterialKey[key].push(geometry);
        }
      });

      const newMergedMeshes = [];
      Object.keys(meshesByMaterialKey).forEach((key) => {
        const geometries = meshesByMaterialKey[key];
        if (geometries.length === 0) return;

        try {
          const mergedGeo = BufferGeometryUtils.mergeGeometries(geometries, false);
          mergedGeo.computeBoundingSphere();
          const material = materialsByKey[key];
          
          newMergedMeshes.push({
            geometry: mergedGeo,
            material,
            key
          });
        } catch (err) {
          console.error("Failed to merge geometries for key:", key, err);
        }
      });

      if (active) {
        setMergedMeshes(newMergedMeshes);
        setHasMerged(true);
      }
    }, 50);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [children, hasMerged]);

  // 元のメッシュの表示状態を切り替える。建築用の当たり判定は Block 側の
  // 専用水平面が担当するため、結合後の元メッシュは非表示でよい。
  useEffect(() => {
    if (!groupRef.current) return;
    const shouldHideOriginals = hasMerged && !disable;
    groupRef.current.traverse((node) => {
      if (!node.isMesh || node.userData?.isMergedMesh === true) return;
      if (node.userData?.keepVisible === true) return;
      node.visible = !shouldHideOriginals;
    });
  }, [hasMerged, disable]);

  if (disable) {
    return <group>{children}</group>;
  }

  return (
    <group>
      <group ref={groupRef}>
        {children}
      </group>
      {hasMerged && mergedMeshes.map((m, idx) => (
        <mesh
          key={`merged-${m.key}-${idx}`}
          geometry={m.geometry}
          material={m.material}
          userData={{ isMergedMesh: true, placeLayoutSurface: true }}
          {...interactionProps}
        />
      ))}
    </group>
  );
};
