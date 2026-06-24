import React from 'react';
import { MapPin } from 'lucide-react';
import { AR_THEME } from '../constants/arTheme';

export function ArPinMarker({
  nx,
  ny,
  kind = 'barrier',
  distM,
  label,
  onClick,
  large = false,
  pulsing = false,
  relBearing = 0,
  scale = 1,
}) {
  const color = kind === 'positive' ? AR_THEME.positive : AR_THEME.barrier;
  const baseSize = large ? 44 : Math.max(32, 42 - (distM ?? 0) / 12);
  const size = baseSize * scale;
  const rotateY = Math.max(-35, Math.min(35, relBearing * 0.5));
  const stakeH = Math.max(8, Math.min(48, (distM ?? 10) * 0.35));

  return (
    <button
      type="button"
      data-ar-pin
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${nx * 100}%`,
        top: `${ny * 100}%`,
        transform: 'translate(-50%, -100%)',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        zIndex: 20,
        animation: pulsing ? 'arPinPulse 1.2s ease-in-out infinite' : undefined,
        perspective: 600,
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${rotateY}deg)`,
        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
      }}
      >
        {label && (
          <div style={{
            fontSize: 11,
            fontWeight: 'bold',
            background: 'rgba(0,0,0,0.78)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 10,
            marginBottom: 4,
            maxWidth: 120,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transform: `rotateY(${-rotateY}deg)`,
          }}
          >
            {label}
          </div>
        )}
        {distM != null && !large && (
          <div style={{
            fontSize: 10,
            color: '#e0e0e0',
            marginBottom: 3,
            textShadow: '0 1px 3px #000',
            transform: `rotateY(${-rotateY}deg)`,
          }}
          >
            約{Math.round(distM)}m
          </div>
        )}
        <div style={{
          width: size,
          height: size,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          background: color,
          border: '3px solid #fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 12px rgba(0,0,0,0.35)',
        }}
        >
          <MapPin size={size * 0.45} color="#fff" style={{ transform: 'rotate(45deg)' }} />
        </div>
        {!large && (
          <div style={{
            width: 3,
            height: stakeH,
            marginTop: -2,
            background: `linear-gradient(to bottom, ${color}, rgba(255,255,255,0.4))`,
            borderRadius: 2,
            transform: `translateZ(-${stakeH * 0.3}px) rotateX(12deg)`,
          }}
          />
        )}
      </div>
    </button>
  );
}
