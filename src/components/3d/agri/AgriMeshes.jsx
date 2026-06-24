import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { useGameStore } from '../../../store/useGameStore';
import { applySeasonTint } from '../../../utils/seasonTint';

const darkenHex = (hex, factor = 0.82) => {
  if (typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) return '#6d4c41';
  const r = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * factor)));
  const b = Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * factor)));
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default function AgriMeshes({
  position,
  shape,
  rotation = 0,
  scale = [1, 1, 1],
  isGhost = false,
  isHoveredToDelete = false,
  isHoveredToEdit = false,
  selectedEditBlockId = false,
  onPointerMove,
  onPointerOut,
  onClick,
  onDoubleClick,
  agri = {},
  agriNeighbors = null,
}) {
  const [progress, setProgress] = useState(isGhost ? 1 : 0);
  const [flash, setFlash] = useState(0);
  const [pulse, setPulse] = useState(1);
  const ripeSparkleRefs = useRef([]);
  const ripeLightRef = useRef(null);

  const pos = Array.isArray(position) && position.every(Number.isFinite) ? position : [0, 0, 0];
  const scl = Array.isArray(scale) && scale.every(Number.isFinite) ? scale : [1, 1, 1];
  const season = useGameStore((state) => state.worldTime.season);
  const stage = Number.isFinite(agri?.stage) ? Math.max(0, Math.min(3, Math.floor(agri.stage))) : 0;
  const phase = typeof agri?.phase === 'string' ? agri.phase : 'planted';
  const isWithered = phase === 'withered';
  const isRipe = phase === 'ripe';
  const isFallow = phase === 'fallow';

  useFrame((state, delta) => {
    if (!isGhost && progress < 1) {
      const next = Math.min(progress + delta * 1.5, 1);
      setProgress(next);
      if (next === 1) setFlash(1);
    }
    if (flash > 0) setFlash(Math.max(flash - delta * 3, 0));
    if (selectedEditBlockId) setPulse(0.6 + Math.sin(state.clock.elapsedTime * 6) * 0.4);

    if (isRipe) {
      ripeSparkleRefs.current.forEach((mesh, idx) => {
        if (!mesh?.material) return;
        const t = state.clock.elapsedTime * 2.5 + idx * 0.9;
        const baseY = mesh.userData?.baseY ?? -0.14;
        mesh.position.y = baseY + Math.sin(t) * 0.04;
        const s = 0.75 + (Math.sin(t * 1.8) + 1) * 0.25;
        mesh.scale.setScalar(s);
        mesh.material.emissiveIntensity = 0.7 + (Math.sin(t * 2.1) + 1) * 0.55;
        mesh.material.opacity = 0.3 + (Math.sin(t * 2.2) + 1) * 0.22;
      });
      if (ripeLightRef.current) {
        const tt = state.clock.elapsedTime * 2.4;
        ripeLightRef.current.intensity = 0.25 + (Math.sin(tt) + 1) * 0.18;
      }
    }
  });

  const isBuilding = progress < 1 && !isGhost;
  const resolveColor = (base) => {
    if (isHoveredToDelete) return '#ff5252';
    if (isHoveredToEdit) return '#ffeb3b';
    if (selectedEditBlockId || isBuilding) return '#00e5ff';
    return base;
  };

  const emissive = isBuilding ? '#00e5ff' : selectedEditBlockId ? '#00b0ff' : flash > 0 ? '#ffffff' : '#000000';
  const emissiveIntensity = isBuilding ? (1 - progress) : selectedEditBlockId ? (1 + pulse * 1.5) : flash > 0 ? flash * 2 : 0;
  const edgeCol = isHoveredToDelete ? '#ff1744' : isHoveredToEdit ? '#fdd835' : selectedEditBlockId ? '#00b0ff' : isBuilding ? '#00e5ff' : '#333';
  const edgeOpa = isGhost ? 0.18 : 0.38;
  const needsTransparent = isGhost || isBuilding || isHoveredToDelete || isHoveredToEdit;
  const opacity = (isHoveredToDelete || isHoveredToEdit) ? 0.8 : isGhost ? 0.55 : isBuilding ? progress : 1;

  const mp = (base, roughness = 0.9, metalness = 0) => ({
    color: resolveColor(base),
    transparent: needsTransparent,
    opacity,
    emissive,
    emissiveIntensity,
    roughness,
    metalness,
  });

  const events = isGhost ? {} : { onPointerMove, onPointerOut, onClick, onDoubleClick };
  const groupProps = {
    position: pos,
    rotation: [0, rotation * Math.PI / 180, 0],
    scale: scl,
    ...events,
  };

  const rawBaseColor = agri?.color ?? (shape === 'rice_paddy' ? '#4fc3f7' : shape === 'garden_bed' ? '#a1887f' : '#8d6e63');
  const baseColor = applySeasonTint(rawBaseColor, season, 'agri');
  const darkColor = darkenHex(baseColor, 0.78);
  const has = agriNeighbors ?? {};

  const renderFarmGrowth = () => {
    if (stage <= 0) return null;
    const stemColor = isWithered ? '#8d6e63' : (stage >= 3 ? '#a5d66f' : stage === 2 ? '#7ecf62' : '#66bb6a');
    const stemHeight = stage >= 3 ? 0.2 : stage === 2 ? 0.13 : 0.08;
    const headColor = isWithered ? '#6d4c41' : (stage >= 3 ? '#f2cd66' : '#7ecf62');
    const spots = [
      [-0.14, -0.22, -0.14], [0, -0.22, -0.14], [0.14, -0.22, -0.14],
      [-0.14, -0.22, 0], [0, -0.22, 0], [0.14, -0.22, 0],
      [-0.14, -0.22, 0.14], [0, -0.22, 0.14], [0.14, -0.22, 0.14],
    ];

    return spots.map((p, i) => (
      <group key={`farm-growth-${i}`} position={p}>
        <mesh castShadow={!isGhost}>
          <cylinderGeometry args={[0.008, 0.01, stemHeight, 5]} />
          <meshStandardMaterial {...mp(stemColor)} />
        </mesh>
        {stage >= 3 && (
          <mesh position={[0, stemHeight * 0.45, 0]} castShadow={!isGhost}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshStandardMaterial {...mp(headColor)} />
          </mesh>
        )}
      </group>
    ));
  };

  const renderRiceGrowth = () => {
    if (stage <= 0) return null;
    const bladeColor = isWithered ? '#7f6a52' : (stage >= 3 ? '#d0bc5b' : stage === 2 ? '#8bcf71' : '#66bb6a');
    const h = stage >= 3 ? 0.2 : stage === 2 ? 0.14 : 0.08;
    const spots = [
      [-0.13, -0.2, -0.13], [0, -0.2, -0.13], [0.13, -0.2, -0.13],
      [-0.13, -0.2, 0], [0, -0.2, 0], [0.13, -0.2, 0],
      [-0.13, -0.2, 0.13], [0, -0.2, 0.13], [0.13, -0.2, 0.13],
    ];
    return spots.map((p, i) => (
      <mesh key={`rice-growth-${i}`} position={[p[0], p[1] + h * 0.5, p[2]]} castShadow={!isGhost}>
        <boxGeometry args={[0.012, h, 0.012]} />
        <meshStandardMaterial {...mp(bladeColor)} />
      </mesh>
    ));
  };

  const renderGardenGrowth = () => {
    if (stage <= 0) return null;
    const leafColor = isWithered ? '#8a7655' : (stage >= 3 ? '#91c764' : stage === 2 ? '#7acb67' : '#66bb6a');
    const buds = [
      [-0.1, -0.2, -0.1], [0.1, -0.2, -0.08], [0.02, -0.2, 0.1], [-0.09, -0.2, 0.06],
    ];
    const size = stage >= 3 ? 0.05 : stage === 2 ? 0.04 : 0.03;
    return buds.map((p, i) => (
      <mesh key={`garden-growth-${i}`} position={[p[0], p[1] + size * 0.8, p[2]]} castShadow={!isGhost}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial {...mp(leafColor)} />
      </mesh>
    ));
  };

  const renderRipeAura = () => {
    if (!isRipe) return null;
    const sparkle = [
      [-0.16, -0.15, -0.05],
      [0.12, -0.14, -0.16],
      [0.18, -0.13, 0.08],
      [-0.08, -0.12, 0.18],
      [0.02, -0.11, -0.02],
    ];
    return (
      <group>
        <mesh position={[0, -0.18, 0]} castShadow={!isGhost}>
          <torusGeometry args={[0.23, 0.012, 10, 40]} />
          <meshStandardMaterial {...mp('#ffd54f', 0.35, 0.12)} emissive="#ffec80" emissiveIntensity={1.05} />
        </mesh>
        {sparkle.map((p, i) => (
          <mesh
            key={`ripe-sparkle-${i}`}
            ref={(el) => {
              ripeSparkleRefs.current[i] = el;
            }}
            userData={{ baseY: p[1] }}
            position={p}
            castShadow={!isGhost}
          >
            <octahedronGeometry args={[0.018, 0]} />
            <meshStandardMaterial
              {...mp('#fff59d', 0.2, 0.18)}
              emissive="#fff176"
              emissiveIntensity={1.1}
              transparent
              opacity={0.5}
            />
          </mesh>
        ))}
        <pointLight ref={ripeLightRef} position={[0, -0.08, 0]} distance={0.9} intensity={0.35} color="#fff59d" />
      </group>
    );
  };

  if (shape === 'farm_plot') {
    return (
      <group {...groupProps}>
        <mesh position={[0, -0.24, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[0.5, 0.02, 0.5]} />
          <meshStandardMaterial {...mp(isFallow ? darkenHex(baseColor, 0.5) : (isWithered ? darkenHex(baseColor, 0.7) : baseColor))} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>

        {!has.plusX && (
          <mesh position={[0.22, -0.22, 0]} castShadow={!isGhost}>
            <boxGeometry args={[0.02, 0.03, 0.5]} />
            <meshStandardMaterial {...mp(darkColor)} />
          </mesh>
        )}
        {!has.minusX && (
          <mesh position={[-0.22, -0.22, 0]} castShadow={!isGhost}>
            <boxGeometry args={[0.02, 0.03, 0.5]} />
            <meshStandardMaterial {...mp(darkColor)} />
          </mesh>
        )}
        {!has.plusZ && (
          <mesh position={[0, -0.22, 0.22]} castShadow={!isGhost}>
            <boxGeometry args={[0.5, 0.03, 0.02]} />
            <meshStandardMaterial {...mp(darkColor)} />
          </mesh>
        )}
        {!has.minusZ && (
          <mesh position={[0, -0.22, -0.22]} castShadow={!isGhost}>
            <boxGeometry args={[0.5, 0.03, 0.02]} />
            <meshStandardMaterial {...mp(darkColor)} />
          </mesh>
        )}
        {renderFarmGrowth()}
        {renderRipeAura()}
      </group>
    );
  }

  if (shape === 'rice_paddy') {
    return (
      <group {...groupProps}>
        <mesh position={[0, -0.245, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[0.5, 0.01, 0.5]} />
          <meshStandardMaterial {...mp('#6d4c41')} />
        </mesh>
        <mesh position={[0, -0.235, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[0.42, 0.015, 0.42]} />
          <meshStandardMaterial {...mp(isFallow ? darkenHex(baseColor, 0.45) : (isWithered ? darkenHex(baseColor, 0.55) : baseColor), 0.15)} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>

        {!has.plusZ && (
          <mesh position={[0, -0.22, 0.23]} castShadow={!isGhost}>
            <boxGeometry args={[0.5, 0.03, 0.04]} />
            <meshStandardMaterial {...mp('#6d4c41')} />
          </mesh>
        )}
        {!has.minusZ && (
          <mesh position={[0, -0.22, -0.23]} castShadow={!isGhost}>
            <boxGeometry args={[0.5, 0.03, 0.04]} />
            <meshStandardMaterial {...mp('#6d4c41')} />
          </mesh>
        )}
        {!has.plusX && (
          <mesh position={[0.23, -0.22, 0]} castShadow={!isGhost}>
            <boxGeometry args={[0.04, 0.03, 0.42]} />
            <meshStandardMaterial {...mp('#6d4c41')} />
          </mesh>
        )}
        {!has.minusX && (
          <mesh position={[-0.23, -0.22, 0]} castShadow={!isGhost}>
            <boxGeometry args={[0.04, 0.03, 0.42]} />
            <meshStandardMaterial {...mp('#6d4c41')} />
          </mesh>
        )}
        {renderRiceGrowth()}
        {renderRipeAura()}
      </group>
    );
  }

  if (shape === 'garden_bed') {
    return (
      <group {...groupProps}>
        <mesh position={[0, -0.22, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[0.5, 0.06, 0.5]} />
          <meshStandardMaterial {...mp(darkColor)} />
          <Edges scale={1} threshold={15} color={edgeCol} opacity={edgeOpa} transparent />
        </mesh>
        <mesh position={[0, -0.24, 0]} castShadow={!isGhost} receiveShadow>
          <boxGeometry args={[0.4, 0.02, 0.4]} />
          <meshStandardMaterial {...mp(isFallow ? darkenHex(baseColor, 0.52) : (isWithered ? darkenHex(baseColor, 0.65) : baseColor))} />
        </mesh>
        {renderGardenGrowth()}
        {isRipe && (
          <mesh position={[0, -0.17, 0]} castShadow={!isGhost}>
            <torusGeometry args={[0.11, 0.008, 8, 24]} />
            <meshStandardMaterial {...mp('#ffd54f', 0.45, 0.1)} />
          </mesh>
        )}
        {renderRipeAura()}
      </group>
    );
  }

  return null;
}
