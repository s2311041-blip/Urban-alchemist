import React from 'react';

export const Pictogram = ({ src, size = 28, alt = '', style = {} }) => {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        flexShrink: 0,
        display: 'block',
        ...style,
      }}
    />
  );
};

export const PictogramLabel = ({ src, label, size = 32, gap = 10, labelStyle = {} }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
    <Pictogram src={src} size={size} alt={label} />
    <span style={labelStyle}>{label}</span>
  </span>
);
