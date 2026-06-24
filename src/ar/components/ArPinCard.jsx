import React, { useMemo, useState } from 'react';
import { X, Eye, Pencil, ChevronUp, ChevronLeft } from 'lucide-react';
import { PhotoPinSurface } from '../../components/ui/PhotoPinSurface';
import { AR_THEME } from '../constants/arTheme';
import { getAnnotationTags } from '../utils/fieldGuideFilter';
import {
  getAnnotationStoryRows,
  getNeedFilterStyle,
  getPerspectiveFrame,
  getPerspectiveNarrative,
} from '../utils/annotationDisplay';

export function ArPinCard({ annotation, onClose, authorId, onEdit, initialPhase = 'photo' }) {
  const [phase, setPhase] = useState(initialPhase);
  const [empathyOn, setEmpathyOn] = useState(false);
  const isMine = annotation.authorId === authorId;
  const rows = useMemo(() => getAnnotationStoryRows(annotation), [annotation]);
  const tags = useMemo(() => getAnnotationTags(annotation), [annotation]);
  const frame = getPerspectiveFrame(annotation);
  const narrative = getPerspectiveNarrative(annotation);
  const filterStyle = empathyOn ? getNeedFilterStyle(annotation) : {};
  const photoPins = annotation.photoPins?.length
    ? annotation.photoPins
    : [{ id: 'c', nx: 0.5, ny: 0.5 }];

  if (phase === 'photo') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#000',
        color: AR_THEME.text,
        display: 'flex',
        flexDirection: 'column',
      }}
      >
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {annotation.photo ? (
            <div style={{
              position: 'absolute',
              inset: 0,
              ...filterStyle,
              transition: 'filter 0.35s ease',
            }}
            >
              <PhotoPinSurface
                imageUrl={annotation.photo}
                pins={photoPins}
                height="100%"
                backgroundFit="contain"
                pinSize={42}
              />
            </div>
          ) : (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              background: '#0d1b2a',
              color: AR_THEME.muted,
            }}
            >
              写真なし
            </div>
          )}

          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            display: 'flex',
            justifyContent: 'space-between',
            zIndex: 5,
          }}
          >
            <span style={badgeStyle(annotation.kind === 'positive' ? AR_THEME.positive : AR_THEME.barrier)}>
              {annotation.kind === 'positive' ? '良い場所' : '困りごと'}
            </span>
            <button type="button" onClick={onClose} style={iconBtnStyle} aria-label="閉じる">
              <X size={22} />
            </button>
          </div>

          {annotation.photo && (
            <div style={{
              position: 'absolute',
              top: 56,
              left: 12,
              right: 12,
              zIndex: 5,
              padding: '8px 12px',
              borderRadius: 10,
              background: 'rgba(0,0,0,0.65)',
              fontSize: 13,
              lineHeight: 1.45,
              pointerEvents: 'none',
            }}
            >
              赤いピンが「困っている場所」です（{photoPins.length}か所）
            </div>
          )}
        </div>

        <div style={{
          flexShrink: 0,
          padding: '14px 16px 20px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.92))',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
        >
          {annotation.comment && (
            <p style={{
              margin: '0 0 12px',
              fontSize: 15,
              lineHeight: 1.5,
              color: '#e0e0e0',
            }}
            >
              {annotation.comment}
            </p>
          )}
          <button
            type="button"
            onClick={() => setPhase('details')}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 14,
              border: 'none',
              background: AR_THEME.accent,
              color: '#0d1b2a',
              fontWeight: 'bold',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            記録の詳細・視点置換を見る
            <ChevronUp size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: AR_THEME.bg,
      color: AR_THEME.text,
      display: 'flex',
      flexDirection: 'column',
    }}
    >
      <header style={{
        flexShrink: 0,
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
      >
        <button type="button" onClick={() => setPhase('photo')} style={backBtnStyle}>
          <ChevronLeft size={20} />
          写真
        </button>
        <div style={{ flex: 1, fontWeight: 'bold' }}>記録の詳細</div>
        <button type="button" onClick={onClose} style={iconBtnStyle} aria-label="閉じる">
          <X size={20} />
        </button>
      </header>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 16px 24px',
        minHeight: 0,
      }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {tags.map((t) => (
            <span key={t.id} style={{
              fontSize: 12,
              padding: '5px 10px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            >
              {t.label}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setEmpathyOn((v) => !v)}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 14,
              border: empathyOn ? `2px solid ${AR_THEME.accent}` : '1px solid rgba(255,255,255,0.2)',
              background: empathyOn ? 'rgba(79,195,247,0.15)' : 'rgba(255,255,255,0.04)',
              color: AR_THEME.text,
              fontWeight: 'bold',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Eye size={18} />
            {empathyOn ? '通常表示' : '他者の視点で見る'}
          </button>
          {isMine && onEdit && (
            <button type="button" onClick={onEdit} style={editBtnStyle}>
              <Pencil size={18} />
              編集
            </button>
          )}
        </div>

        <div style={{
          padding: '16px 18px',
          borderRadius: 16,
          background: 'rgba(79,195,247,0.1)',
          border: '1px solid rgba(79,195,247,0.28)',
          marginBottom: 18,
          lineHeight: 1.6,
          fontSize: 15,
        }}
        >
          <div style={{ fontSize: 11, color: AR_THEME.accent, fontWeight: 'bold', marginBottom: 8 }}>
            視点置換 · {frame}
          </div>
          {narrative}
        </div>

        <div style={{ fontSize: 13, color: AR_THEME.muted, marginBottom: 10, fontWeight: 'bold' }}>
          投稿時の回答
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((row) => (
            <div
              key={row.key}
              style={{
                padding: row.prominent ? '16px 18px' : '12px 16px',
                borderRadius: 14,
                background: row.prominent ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${row.prominent ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <div style={{ fontSize: 11, color: AR_THEME.muted, marginBottom: 4 }}>{row.label}</div>
              <div style={{
                fontSize: row.prominent ? 17 : 15,
                fontWeight: row.prominent ? 'bold' : '600',
                lineHeight: 1.5,
              }}
              >
                {row.value}
              </div>
              {row.hint && (
                <div style={{ fontSize: 12, color: AR_THEME.muted, marginTop: 4 }}>{row.hint}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const badgeStyle = (color) => ({
  fontSize: 11,
  fontWeight: 'bold',
  padding: '5px 11px',
  borderRadius: 8,
  background: `${color}44`,
  color: '#fff',
});

const iconBtnStyle = {
  background: 'rgba(0,0,0,0.5)',
  border: 'none',
  borderRadius: 12,
  width: 44,
  height: 44,
  color: '#fff',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
};

const backBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  background: 'rgba(255,255,255,0.08)',
  border: 'none',
  borderRadius: 12,
  padding: '8px 12px',
  color: AR_THEME.text,
  cursor: 'pointer',
  fontSize: 14,
};

const editBtnStyle = {
  padding: '12px 16px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'transparent',
  color: AR_THEME.text,
  fontWeight: 'bold',
  fontSize: 14,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};
