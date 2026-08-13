import React from 'react';

const IdeaFormLogo = ({ size = 'medium', lightMode = false, showTagline = true, onClick }) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconWidth = isSmall ? 28 : isLarge ? 48 : 36;
  const iconHeight = isSmall ? 28 : isLarge ? 48 : 36;
  const titleSize = isSmall ? '1.1rem' : isLarge ? '1.85rem' : '1.35rem';
  const taglineSize = isSmall ? '0.62rem' : isLarge ? '0.85rem' : '0.72rem';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.45rem' : '0.65rem',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none'
      }}
    >
      {/* Exact Vector Bulb with 'i' & 'f' filament */}
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Light Rays */}
        <line x1="28" y1="28" x2="16" y2="16" stroke={lightMode ? '#00e5ff' : '#00828A'} strokeWidth="6" strokeLinecap="round" />
        <line x1="60" y1="18" x2="60" y2="4" stroke={lightMode ? '#00e5ff' : '#00828A'} strokeWidth="6" strokeLinecap="round" />
        <line x1="92" y1="28" x2="104" y2="16" stroke={lightMode ? '#00e5ff' : '#00828A'} strokeWidth="6" strokeLinecap="round" />

        {/* Bulb Outer Arc */}
        <path
          d="M30 62C24 45 35 28 54 26C73 24 90 38 90 58C90 70 82 78 78 86C76 90 76 94 76 98H44C44 94 44 90 42 86C37 78 30 72 30 62Z"
          stroke={lightMode ? '#00e5ff' : '#00828A'}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Filament 'i' Dot */}
        <circle cx="48" cy="50" r="5" fill={lightMode ? '#00e5ff' : '#00828A'} />

        {/* Filament 'i' and 'f' Loop */}
        <path
          d="M48 64V88M48 88C48 94 56 96 60 92C64 88 64 64 64 56C64 48 72 46 76 50M54 70H74"
          stroke={lightMode ? '#ffffff' : '#00828A'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Typography: "IdeaForm" + "Ideas que toman forma." */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: '800',
            fontSize: titleSize,
            letterSpacing: '-0.03em',
            lineHeight: 1.05
          }}
        >
          <span style={{ color: lightMode ? '#ffffff' : '#0f172a' }}>Idea</span>
          <span style={{ color: lightMode ? '#00e5ff' : '#00828A' }}>Form</span>
        </div>
        {showTagline && (
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: taglineSize,
              fontWeight: '500',
              color: lightMode ? '#94a3b8' : '#475569',
              letterSpacing: '-0.01em',
              marginTop: '0.15rem'
            }}
          >
            Ideas que toman forma.
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaFormLogo;
