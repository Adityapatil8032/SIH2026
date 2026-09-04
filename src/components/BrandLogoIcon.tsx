import React from 'react';

interface BrandLogoIconProps {
  className?: string;
  size?: number;
}

export const BrandLogoIcon: React.FC<BrandLogoIconProps> = ({ className = '', size = 42 }) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 54 54"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Subtle gradient for map pin body */}
          <linearGradient id="pinBodyGrad" x1="14" y1="6" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2A2F4C" />
            <stop offset="50%" stopColor="#181B29" />
            <stop offset="100%" stopColor="#0F111D" />
          </linearGradient>

          {/* Indigo stroke gradient for map pin */}
          <linearGradient id="pinStrokeGrad" x1="14" y1="6" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#5D5FEF" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>

          {/* Cyan Glow for North Arrow */}
          <linearGradient id="cyanNorthGrad" x1="27" y1="12" x2="27" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00D4FE" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Green Glow filter for bottom pin point */}
          <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Cyan outline glow for N */}
          <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Base Travel Lines: Roads and Airplane Arc */}
        {/* Curved Road Lines at base */}
        <path
          d="M 6 49 C 15 45, 23 48, 30 46 C 37 44, 43 47, 49 48"
          stroke="#334155"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 2"
          opacity="0.75"
        />
        <path
          d="M 10 52 C 18 48, 28 50, 36 49 C 41 48, 45 50, 48 51"
          stroke="#475569"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Airplane Arc Route Line */}
        <path
          d="M 8 46 C 14 36, 22 34, 46 39"
          stroke="#5D5FEF"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray="3 3"
          opacity="0.85"
        />

        {/* Mini Airplane icon traversing the arc */}
        <g transform="translate(43, 38) rotate(35) scale(0.65)">
          <path
            d="M 0 -6 L 2 0 L 7 2 L 2 3 L 3 7 L 0 5 L -3 7 L -2 3 L -7 2 L -2 0 Z"
            fill="#00D4FE"
          />
        </g>

        {/* 2. Map Pin Outer Silhouette */}
        <path
          d="M 27 6 C 18.16 6 11 13.16 11 22 C 11 31.2 24.2 41.5 27 43.6 C 29.8 41.5 43 31.2 43 22 C 43 13.16 35.84 6 27 6 Z"
          fill="url(#pinBodyGrad)"
          stroke="url(#pinStrokeGrad)"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />

        {/* Subtle inner dial ring */}
        <circle
          cx="27"
          cy="21.5"
          r="10.5"
          stroke="#312E81"
          strokeWidth="1"
          strokeDasharray="1.5 1.5"
          opacity="0.7"
        />

        {/* 3. Central Compass Rose */}
        {/* West pointer */}
        <polygon
          points="27,21.5 18,21.5 25,23.5"
          fill="#475569"
        />
        <polygon
          points="27,21.5 18,21.5 25,19.5"
          fill="#64748B"
        />

        {/* East pointer */}
        <polygon
          points="27,21.5 36,21.5 29,19.5"
          fill="#475569"
        />
        <polygon
          points="27,21.5 36,21.5 29,23.5"
          fill="#64748B"
        />

        {/* South pointer */}
        <polygon
          points="27,21.5 27,30 25.2,23.5"
          fill="#334155"
        />
        <polygon
          points="27,21.5 27,30 28.8,23.5"
          fill="#475569"
        />

        {/* North pointer - HIGHLIGHTED WITH CYAN OUTLINE & GRADIENT */}
        <polygon
          points="27,21.5 27,11.5 24.8,19.5"
          fill="#00D4FE"
          stroke="#00D4FE"
          strokeWidth="0.6"
          filter="url(#cyanGlow)"
        />
        <polygon
          points="27,21.5 27,11.5 29.2,19.5"
          fill="#0284C7"
          stroke="#00D4FE"
          strokeWidth="0.6"
          filter="url(#cyanGlow)"
        />

        {/* Highlighted 'N' mark above the North point */}
        <text
          x="27"
          y="10"
          textAnchor="middle"
          fontSize="5"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#00D4FE"
          stroke="#00D4FE"
          strokeWidth="0.3"
          filter="url(#cyanGlow)"
        >
          N
        </text>

        {/* Compass Center Pivot */}
        <circle cx="27" cy="21.5" r="2.2" fill="#0F172A" stroke="#00D4FE" strokeWidth="1" />
        <circle cx="27" cy="21.5" r="0.9" fill="#00D4FE" />

        {/* 4. Small Glowing Green Dot at the Pin Point */}
        <circle
          cx="27"
          cy="43.5"
          r="2.8"
          fill="#10E599"
          filter="url(#greenGlow)"
        />
        <circle
          cx="27"
          cy="43.5"
          r="1.2"
          fill="#ECFDF5"
        />
      </svg>
    </div>
  );
};
