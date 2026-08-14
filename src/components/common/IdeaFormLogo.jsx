import React from 'react';

const IdeaFormLogo = ({ size = 'medium', lightMode = false, showTagline = true, onClick }) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconWidth = isSmall ? 34 : isLarge ? 56 : 42;
  const iconHeight = isSmall ? 40 : isLarge ? 66 : 50;
  const titleSize = isSmall ? '1.25rem' : isLarge ? '2.15rem' : '1.6rem';
  const taglineSize = isSmall ? '0.68rem' : isLarge ? '0.92rem' : '0.78rem';

  const tealColor = lightMode ? '#00e5ff' : '#176B87';
  const darkTextColor = lightMode ? '#ffffff' : '#0F172A';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.55rem' : '0.8rem',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none'
      }}
    >
      {/* Exact Vector Bulb with 'if' filament - No clipping at bottom */}
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        {/* 3 Radiating Light Rays at Top */}
        <line x1="22" y1="20" x2="12" y2="10" stroke={tealColor} strokeWidth="6" strokeLinecap="round" />
        <line x1="50" y1="14" x2="50" y2="2" stroke={tealColor} strokeWidth="6" strokeLinecap="round" />
        <line x1="78" y1="20" x2="88" y2="10" stroke={tealColor} strokeWidth="6" strokeLinecap="round" />

        {/* Outer Light Bulb Dome Contour */}
        <path
          d="M20 54C14 38 26 22 46 20C66 18 82 32 82 52C82 62 76 70 70 76C67 79 66 83 66 88"
          stroke={tealColor}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Filament 'i' Dot */}
        <circle cx="36" cy="44" r="4.5" fill={tealColor} />

        {/* Outer left bulb line continuing seamlessly down to form the 'i' stem and 'f' loop */}
        <path
          d="M20 54C20 62 26 70 34 76V96C34 105 44 107 50 101C56 95 56 62 56 50C56 38 68 36 74 42"
          stroke={tealColor}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Crossbar for the letter 'f' */}
        <line x1="46" y1="64" x2="68" y2="64" stroke={tealColor} strokeWidth="6.5" strokeLinecap="round" />
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
              color: lightMode ? '#cbd5e1' : '#1E293B',
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
