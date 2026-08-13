import React from 'react';

const IdeaFormLogo = ({ size = 'medium', lightMode = false, showTagline = true, onClick }) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconWidth = isSmall ? 32 : isLarge ? 52 : 40;
  const iconHeight = isSmall ? 32 : isLarge ? 52 : 40;
  const titleSize = isSmall ? '1.2rem' : isLarge ? '2.1rem' : '1.55rem';
  const taglineSize = isSmall ? '0.65rem' : isLarge ? '0.92rem' : '0.78rem';

  const tealColor = lightMode ? '#00e5ff' : '#0E6E82';
  const darkTextColor = lightMode ? '#ffffff' : '#0a0a0a';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.5rem' : '0.75rem',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none'
      }}
    >
      {/* Exact Vector Bulb with 'i' & 'f' filament from Brand Manual */}
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* 3 Radiating Light Rays at Top */}
        <line x1="24" y1="24" x2="14" y2="14" stroke={tealColor} strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="16" x2="50" y2="3" stroke={tealColor} strokeWidth="6" strokeLinecap="round" />
        <line x1="76" y1="24" x2="86" y2="14" stroke={tealColor} strokeWidth="6" strokeLinecap="round" />

        {/* Outer Light Bulb Contour */}
        <path
          d="M24 55C18 40 28 26 44 24C62 22 76 34 76 52C76 61 70 68 66 74C64 77 64 80 64 84H36C36 80 36 77 34 74C30 68 24 62 24 55Z"
          stroke={tealColor}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Filament 'i' Dot */}
        <circle cx="41" cy="46" r="4.5" fill={tealColor} />

        {/* Filament 'i' & 'f' Continuous Loop */}
        <path
          d="M41 58V84C41 90 49 92 53 88C57 84 57 60 57 52C57 44 65 42 69 46M49 66H66"
          stroke={tealColor}
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Typography: "IdeaForm" + "Ideas que toman forma." */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
            fontWeight: '800',
            fontSize: titleSize,
            letterSpacing: '-0.03em',
            lineHeight: 1.05
          }}
        >
          <span style={{ color: darkTextColor, fontWeight: '800' }}>Idea</span>
          <span style={{ color: tealColor, fontWeight: '800' }}>Form</span>
        </div>

        {showTagline && (
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: taglineSize,
              fontWeight: '500',
              color: lightMode ? '#cbd5e1' : '#5A6578',
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
