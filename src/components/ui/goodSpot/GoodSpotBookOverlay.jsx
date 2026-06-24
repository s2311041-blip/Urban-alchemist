import React, { useMemo } from 'react';
import { BookOpen, Pencil } from 'lucide-react';
import { PhotoPinSurface } from '../PhotoPinSurface';
import {
  GOOD_SPOT_BOOK_COPY,
  GOOD_SPOT_BOOK_STYLE,
} from '../../../constants/ui/goodSpotBookOverlay';

export const GoodSpotBookOverlay = ({ isOpen, onClose = () => {}, goodSpots = [], openAREditGoodSpot }) => {
  const safeGoodSpots = useMemo(
    () => goodSpots.filter((spot) => spot && typeof spot === 'object'),
    [goodSpots],
  );
  if (!isOpen) return null;
  return (
    <div style={GOOD_SPOT_BOOK_STYLE.backdrop}>
      <div style={GOOD_SPOT_BOOK_STYLE.panel}>
        <div style={GOOD_SPOT_BOOK_STYLE.header}>
          <div style={GOOD_SPOT_BOOK_STYLE.title}>
            <BookOpen size={20} />
            {GOOD_SPOT_BOOK_COPY.title}
          </div>
          <button onClick={onClose} style={GOOD_SPOT_BOOK_STYLE.closeButton}>
            {GOOD_SPOT_BOOK_COPY.close}
          </button>
        </div>
        <div style={GOOD_SPOT_BOOK_STYLE.grid}>
          {safeGoodSpots.length === 0 ? (
            <div style={GOOD_SPOT_BOOK_STYLE.empty}>
              {GOOD_SPOT_BOOK_COPY.empty}
            </div>
          ) : (
            safeGoodSpots.map((spot, idx) => (
              <div key={spot.id ?? `good_spot_${idx}`} style={GOOD_SPOT_BOOK_STYLE.card}>
                <div style={{ ...GOOD_SPOT_BOOK_STYLE.photo, position: 'relative', overflow: 'hidden' }}>
                  {spot.photo ? (
                    <PhotoPinSurface
                      imageUrl={spot.photo}
                      pins={spot.photoPins ?? []}
                      height={140}
                      minHeight={140}
                    />
                  ) : (
                    <div style={GOOD_SPOT_BOOK_STYLE.noPhoto}>{GOOD_SPOT_BOOK_COPY.noPhoto}</div>
                  )}
                </div>
                <div style={GOOD_SPOT_BOOK_STYLE.body}>
                  <div style={GOOD_SPOT_BOOK_STYLE.tagLabel}>{spot.tagLabel ?? GOOD_SPOT_BOOK_COPY.defaultTagLabel}</div>
                  <div style={GOOD_SPOT_BOOK_STYLE.comment}>
                    {spot.comment || GOOD_SPOT_BOOK_COPY.noComment}
                  </div>
                  <div style={GOOD_SPOT_BOOK_STYLE.demographic}>
                    {spot.demographic || GOOD_SPOT_BOOK_COPY.unknownDemographic}
                  </div>
                  {spot.isMine && openAREditGoodSpot && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        openAREditGoodSpot(spot.id);
                      }}
                      style={{
                        marginTop: 8,
                        border: '1px solid #c5cae9',
                        background: '#e8eaf6',
                        borderRadius: 10,
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      <Pencil size={14} />
                      編集
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
