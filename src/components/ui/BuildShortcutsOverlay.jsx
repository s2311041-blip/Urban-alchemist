import React from 'react';
import { X } from 'lucide-react';
import {
  BUILD_CAMERA_SHORTCUTS,
  BUILD_COMMON_SHORTCUTS,
  BUILD_LOCKED_MODE_HINTS,
  BUILD_MATERIAL_SHORTCUTS,
  BUILD_SHAPE_SHORTCUTS,
  arePaletteShortcutsActive,
  getBuildShortcutLockMode,
} from '../../constants/buildShortcuts';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(5, 10, 22, 0.72)',
  backdropFilter: 'blur(8px)',
  padding: '24px',
};

const panelStyle = {
  width: 'min(920px, 96vw)',
  maxHeight: 'min(88vh, 820px)',
  overflow: 'auto',
  background: 'linear-gradient(160deg, rgba(12, 20, 38, 0.98) 0%, rgba(8, 16, 28, 0.98) 100%)',
  border: '1px solid rgba(0, 229, 255, 0.35)',
  borderRadius: '18px',
  boxShadow: '0 24px 64px rgba(0, 0, 0, 0.55)',
  color: '#eef6ff',
  fontFamily: '"Hiragino Sans", "Yu Gothic", "Outfit", sans-serif',
};

const sectionTitleStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#00e5ff',
  marginBottom: '10px',
  letterSpacing: '0.04em',
};

const KeyBadge = ({ children, muted = false }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    padding: '3px 8px',
    borderRadius: '6px',
    background: muted ? 'rgba(255,255,255,0.06)' : 'rgba(0, 229, 255, 0.14)',
    border: `1px solid ${muted ? 'rgba(255,255,255,0.12)' : 'rgba(0, 229, 255, 0.35)'}`,
    color: muted ? '#8a96a8' : '#d9f8ff',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'ui-monospace, monospace',
  }}>
    {children}
  </span>
);

const ShortcutRow = ({ keys, label, active = true }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '7px 0',
    opacity: active ? 1 : 0.42,
  }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
      {keys.map((key, idx) => (
        <React.Fragment key={`${key}_${idx}`}>
          {idx > 0 && <span style={{ color: '#6b7788', fontSize: '11px' }}>+</span>}
          <KeyBadge muted={!active}>{key}</KeyBadge>
        </React.Fragment>
      ))}
    </div>
    <span style={{ fontSize: '13px', color: active ? '#dce8f5' : '#7a8698', textAlign: 'right' }}>{label}</span>
  </div>
);

const GridSection = ({ title, children, columns = 2 }) => (
  <section style={{ marginBottom: '22px' }}>
    <div style={sectionTitleStyle}>{title}</div>
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      gap: '8px 20px',
    }}>
      {children}
    </div>
  </section>
);

const MiniTile = ({ keyLabel, label, active = true }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    opacity: active ? 1 : 0.42,
  }}>
    <KeyBadge muted={!active}>{keyLabel}</KeyBadge>
    <span style={{ fontSize: '13px', color: active ? '#dce8f5' : '#7a8698' }}>{label}</span>
  </div>
);

export const BuildShortcutsOverlay = ({
  open,
  onClose,
  isEditingInStudio,
  isDesigningInStudio,
  isDesigningDiagonal,
  selectedShape,
}) => {
  if (!open) return null;

  const lockMode = getBuildShortcutLockMode({
    isEditingInStudio,
    isDesigningInStudio,
    isDesigningDiagonal,
    selectedShape,
  });
  const paletteActive = arePaletteShortcutsActive(lockMode);
  const activeLockHint = BUILD_LOCKED_MODE_HINTS.find((hint) => hint.id === lockMode);

  return (
    <div
      style={overlayStyle}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="建築モード ショートカット一覧"
    >
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 12px',
          borderBottom: '1px solid rgba(0, 229, 255, 0.15)',
        }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#00e5ff' }}>⌨️ 建築モード ショートカット</div>
            <div style={{ fontSize: '12px', color: '#8ea0b5', marginTop: '4px' }}>
              ? キーで開閉 · Esc でも閉じられます
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '18px 24px 24px' }}>
          {activeLockHint && (
            <div style={{
              marginBottom: '18px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.35)',
              color: '#ffe082',
              fontSize: '13px',
              lineHeight: 1.5,
            }}>
              <strong>{activeLockHint.title}</strong>
              <div style={{ color: '#f0dfb0', marginTop: '4px' }}>{activeLockHint.description}</div>
            </div>
          )}

          <GridSection title="カメラ" columns={1}>
            {BUILD_CAMERA_SHORTCUTS.map((row) => (
              <ShortcutRow key={row.label} keys={row.keys} label={row.label} active />
            ))}
          </GridSection>

          <GridSection title="基本操作" columns={1}>
            {BUILD_COMMON_SHORTCUTS.map((row) => {
              const editOnly = lockMode === 'edit_studio' || lockMode === 'diagonal_studio';
              const islandDiagonalOnly = lockMode === 'diagonal_island';
              let active = paletteActive;
              if (editOnly) {
                active = row.keys.includes('Enter') || row.keys.includes('Esc');
              } else if (islandDiagonalOnly) {
                active = row.keys.includes('Esc');
              }
              return (
                <ShortcutRow key={row.label} keys={row.keys} label={row.label} active={active} />
              );
            })}
          </GridSection>

          <GridSection title="形状（数字キー）" columns={2}>
            {BUILD_SHAPE_SHORTCUTS.map((row) => (
              <MiniTile key={row.key} keyLabel={row.key} label={row.label} active={paletteActive} />
            ))}
          </GridSection>

          <GridSection title="素材（QWERTY 上段）" columns={2}>
            {BUILD_MATERIAL_SHORTCUTS.map((row) => (
              <MiniTile key={row.key} keyLabel={row.key} label={row.label} active={paletteActive} />
            ))}
          </GridSection>

          <div style={{
            marginTop: '8px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'rgba(0, 229, 255, 0.06)',
            border: '1px solid rgba(0, 229, 255, 0.15)',
            fontSize: '12px',
            color: '#9eb4c8',
            lineHeight: 1.55,
          }}>
            建築中は <strong style={{ color: '#00e5ff' }}>W/A/S/D</strong> は素材ショートカット専用（カメラ移動は矢印）。
            散歩・船移動も <strong style={{ color: '#00e5ff' }}>矢印キー</strong> で操作します。
          </div>
        </div>
      </div>
    </div>
  );
};
