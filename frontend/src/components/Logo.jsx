import React from 'react';

/**
 * Reusable Optilight Logo Component
 * - Displays the official Optilight brand image
 * - Scales smoothly according to size ('small' | 'medium' | 'large')
 */
const Logo = ({ size = 'medium', className = '', style = {} }) => {
  const heights = {
    small: '32px',
    medium: '40px',
    large: '58px',
  };

  const height = heights[size] || heights.medium;

  return (
    <div className={`d-inline-flex align-items-center ${className}`} style={style}>
      <img
        src="/logo/optilight-logo.png"
        alt="Optilight"
        style={{
          height,
          width: 'auto',
          objectFit: 'contain',
          mixBlendMode: 'multiply',
          display: 'block',
          userSelect: 'none',
        }}
        draggable={false}
      />
    </div>
  );
};

export default Logo;
