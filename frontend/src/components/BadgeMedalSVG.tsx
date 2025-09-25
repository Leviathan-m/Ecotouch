import React from 'react';

type MissionType = 'carbon_offset' | 'donation' | 'petition';
type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeMedalSVGProps {
  missionType: MissionType;
  level: BadgeLevel;
  impact: number;
  achievement: string;
  quote: string;
  topArcText: string;
  bottomArcText: string;
  size?: number; // default 120
  isNew?: boolean;
}

function getMetalStops(level: BadgeLevel): { id: string; stops: { offset: string; color: string; opacity?: number }[] } {
  switch (level) {
    case 'bronze':
      return {
        id: 'metalGradient',
        stops: [
          { offset: '0%', color: '#CD7F32' },
          { offset: '50%', color: '#B8860B' },
          { offset: '100%', color: '#A0522D' }
        ]
      };
    case 'silver':
      return {
        id: 'metalGradient',
        stops: [
          { offset: '0%', color: '#C0C0C0' },
          { offset: '30%', color: '#E6E6FA' },
          { offset: '100%', color: '#A8A8A8' }
        ]
      };
    case 'gold':
      return {
        id: 'metalGradient',
        stops: [
          { offset: '0%', color: '#FFD700' },
          { offset: '50%', color: '#FFA500' },
          { offset: '100%', color: '#FF8C00' }
        ]
      };
    case 'platinum':
    default:
      return {
        id: 'metalGradient',
        stops: [
          { offset: '0%', color: '#E5E4E2' },
          { offset: '30%', color: '#F8F8FF' },
          { offset: '70%', color: '#D3D3D3' },
          { offset: '100%', color: '#B8B8B8' }
        ]
      };
  }
}

function missionAccent(missionType: MissionType): string {
  switch (missionType) {
    case 'carbon_offset':
      return '#28A745';
    case 'donation':
      return '#DC3545';
    case 'petition':
      return '#6F42C1';
    default:
      return '#2d3748';
  }
}

function centerIcon(missionType: MissionType, level: BadgeLevel): string {
  if (missionType === 'carbon_offset') {
    if (level === 'gold') return '🛡️';
    if (level === 'platinum') return '🌟';
    if (level === 'silver') return '🌿';
    return '🌱';
  }
  if (missionType === 'donation') {
    if (level === 'gold') return '👥';
    if (level === 'platinum') return '🏆';
    if (level === 'silver') return '❤️';
    return '💝';
  }
  // petition
  if (level === 'gold') return '🎯';
  if (level === 'platinum') return '⚡';
  if (level === 'silver') return '📋';
  return '📝';
}

export const BadgeMedalSVG: React.FC<BadgeMedalSVGProps> = ({
  missionType,
  level,
  impact,
  achievement,
  quote,
  topArcText,
  bottomArcText,
  size = 120,
  isNew = false,
}) => {
  const metal = getMetalStops(level);
  const accent = missionAccent(missionType);
  const icon = centerIcon(missionType, level);

  const r = size / 2;
  const ringR = r - 2;
  const arcR = r - 20;

  // Arc paths (approx half circle top/bottom)
  const topArc = `M ${r - arcR} ${r} A ${arcR} ${arcR} 0 0 1 ${r + arcR} ${r}`;
  const bottomArc = `M ${r + arcR} ${r} A ${arcR} ${arcR} 0 0 1 ${r - arcR} ${r}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${missionType} ${level} badge, impact ${impact}`}>
      <defs>
        <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          {metal.stops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity ?? 1} />
          ))}
        </linearGradient>
        {/* Brushed metal texture */}
        <filter id="brushedMetal" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" result="noise" />
          <feColorMatrix type="saturate" values="0" />
          <feGaussianBlur stdDeviation="0.4" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.25" />
          </feComponentTransfer>
          <feBlend mode="overlay" in2="SourceGraphic" />
        </filter>
        <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feOffset dx="0" dy="0" />
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="-1" k3="1" />
        </filter>
        {/* Specular highlight for glossy enamel */}
        <filter id="specularGloss" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="2" specularConstant="0.75" specularExponent="20" lightingColor="#ffffff" result="spec">
            <fePointLight x={r - 20} y={r - 30} z="40" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" />
        </filter>
        <radialGradient id="gloss" cx="30%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.0" />
        </radialGradient>
        <path id="topArcPath" d={topArc} />
        <path id="bottomArcPath" d={bottomArc} />
        {/* Laurel leaf path (single), will mirror */}
        <path id="laurelLeaf" d="M0,0 C4,-6 10,-8 16,-6 C10,-2 6,2 0,0 Z" />
      </defs>

      {/* Outer Medal Base */}
      <circle cx={r} cy={r} r={ringR} fill="url(#metalGradient)" filter="url(#brushedMetal)" />
      {/* Gloss */}
      <circle cx={r} cy={r} r={ringR} fill="url(#gloss)" />
      {/* Accent Ring */}
      <circle cx={r} cy={r} r={arcR + 6} fill="none" stroke={accent} strokeOpacity="0.25" strokeWidth="2" />
      {/* Enamel inner ring */}
      <circle cx={r} cy={r} r={arcR - 2} fill="none" stroke={accent} strokeWidth={level === 'platinum' ? 6 : level === 'gold' ? 5 : 4} opacity={0.6} />

      {/* Arc Texts */}
      <text fill="#ffffff" fontFamily="Inter, system-ui, -apple-system" fontWeight={600} fontSize={Math.max(10, Math.floor(size * 0.1))}>
        <textPath href="#topArcPath" startOffset="50%" textAnchor="middle" paintOrder="stroke" stroke="#000" strokeWidth="0.8">
          {topArcText}
        </textPath>
      </text>
      <text fill="#ffffff" fontFamily="Inter, system-ui, -apple-system" fontWeight={600} fontSize={Math.max(10, Math.floor(size * 0.1))}>
        <textPath href="#bottomArcPath" startOffset="50%" textAnchor="middle" paintOrder="stroke" stroke="#000" strokeWidth="0.8">
          {bottomArcText}
        </textPath>
      </text>

      {/* Center Icon */}
      <g filter="url(#innerShadow)">
        {/* Bronze: leaf over wood/earth disc */}
        {level === 'bronze' && missionType === 'carbon_offset' && (
          <g>
            <circle cx={r} cy={r} r={Math.floor(size * 0.26)} fill="#6B4226" opacity="0.3" />
            <path d={`M ${r - 14} ${r} Q ${r} ${r - 22} ${r + 14} ${r} Q ${r} ${r + 22} ${r - 14} ${r}`} fill="#6B4226" opacity="0.45" />
            <text x={r} y={r + 6} textAnchor="middle" fontSize={Math.floor(size * 0.38)}>🌱</text>
          </g>
        )}
        {/* Silver: clean leaf cluster without brown base */}
        {level === 'silver' && missionType === 'carbon_offset' && (
          <text x={r} y={r + 6} textAnchor="middle" fontSize={Math.floor(size * 0.40)}>🌿</text>
        )}
        {/* Gold/Platinum and other missions: default emoji icon */}
        {!(missionType === 'carbon_offset' && (level === 'bronze' || level === 'silver')) && (
          <text x={r} y={r + 4} textAnchor="middle" fontSize={Math.floor(size * 0.45)}>
            {icon}
          </text>
        )}
      </g>

      {/* Level and Impact */}
      <text x={r} y={r + arcR - 8} textAnchor="middle" fill="#ffffff" fontFamily="Inter, system-ui, -apple-system" fontWeight={900} fontSize={Math.max(10, Math.floor(size * 0.16))} paintOrder="stroke" stroke="#000" strokeWidth="0.8">
        {level.toUpperCase()}
      </text>
      <text x={r} y={r + arcR + 8} textAnchor="middle" fill="#ffffff" fontFamily="Inter, system-ui, -apple-system" fontWeight={800} fontSize={Math.max(9, Math.floor(size * 0.14))} paintOrder="stroke" stroke="#000" strokeWidth="0.6">
        IMPACT: {impact}
      </text>

      {/* Achievement */}
      <text x={r} y={r - arcR + 24} textAnchor="middle" fill={accent} fontFamily="Inter, system-ui, -apple-system" fontWeight={700} fontSize={Math.max(9, Math.floor(size * 0.12))}>
        {achievement}
      </text>

      {/* Quote */}
      <text x={r} y={r + arcR + 20} textAnchor="middle" fill="#a0aec0" fontFamily="Inter, system-ui, -apple-system" fontWeight={500} fontStyle="italic" fontSize={Math.max(8, Math.floor(size * 0.1))}>
        {quote}
      </text>

      {/* Decorative corners */}
      <text x={r - arcR + 6} y={r - arcR + 14} fontSize={12} opacity={0.9}>🍃</text>
      <text x={r + arcR - 18} y={r - arcR + 14} fontSize={12} opacity={0.9}>🍃</text>
      <text x={r - arcR + 6} y={r + arcR - 6} fontSize={12} opacity={0.9}>🍃</text>
      <text x={r + arcR - 18} y={r + arcR - 6} fontSize={12} opacity={0.9}>🍃</text>

      {/* Laurel wreath for gold/platinum */}
      {(level === 'gold' || level === 'platinum') && (
        <g transform={`translate(${r - arcR + 10}, ${r - 6}) rotate(-50)`} fill={level === 'platinum' ? '#E5E4E2' : '#FFD700'} opacity="0.6">
          {Array.from({ length: 7 }).map((_, i) => (
            <use key={`l${i}`} href="#laurelLeaf" x={i * 10} y={i * 2} />
          ))}
        </g>
      )}
      {(level === 'gold' || level === 'platinum') && (
        <g transform={`translate(${r + arcR - 10}, ${r - 6}) rotate(230)`} fill={level === 'platinum' ? '#E5E4E2' : '#FFD700'} opacity="0.6">
          {Array.from({ length: 7 }).map((_, i) => (
            <use key={`lr${i}`} href="#laurelLeaf" x={i * 10} y={i * 2} />
          ))}
        </g>
      )}

      {/* NEW indicator */}
      {isNew && (
        <g>
          <rect x={r + arcR - 34} y={r - arcR - 2} width={30} height={14} rx={7} fill="#FF6B6B" />
          <text x={r + arcR - 19} y={r - arcR + 9} textAnchor="middle" fontSize={9} fontWeight={900} fill="#ffffff">NEW</text>
        </g>
      )}
    </svg>
  );
};

export default BadgeMedalSVG;


