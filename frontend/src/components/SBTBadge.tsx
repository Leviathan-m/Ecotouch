import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MissionType } from '../types';
import { Leaf, Heart, MessageSquare, Star, Trophy, Award, Shield, Zap, Target, Users, Wallet, Loader, CheckCircle } from 'lucide-react';
import { web3Service } from '../services/web3';

interface SBTBadgeProps {
  tokenId?: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  missionType: MissionType;
  impact: number;
  earnedAt?: Date;
  isNew?: boolean;
  showMintButton?: boolean;
  onMintSuccess?: (tokenId: number, txHash: string) => void;
}

const BadgeContainer = styled(motion.div)<{ level: string; missionType: string; isNew?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  /* Base Dimensions */
  width: 120px;
  height: 120px;

  /* Mission Type Background */
  background: ${props => {
    const baseColors = {
      carbon_offset: '#28A745',
      donation: '#DC3545',
      petition: '#6F42C1'
    };
    return baseColors[props.missionType as keyof typeof baseColors] || '#6C757D';
  }};

  /* Level-based Material Effects */
  ${props => {
    switch (props.level) {
      case 'bronze':
        return `
          background: linear-gradient(135deg, #CD7F32 0%, #B8860B 50%, #A0522D 100%);
          box-shadow:
            0 8px 32px rgba(205, 127, 50, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          border: 3px solid #8B4513;
          background-image:
            radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(0, 0, 0, 0.2) 0%, transparent 50%);
        `;
      case 'silver':
        return `
          background: linear-gradient(135deg, #C0C0C0 0%, #E6E6FA 30%, #A8A8A8 100%);
          box-shadow:
            0 12px 40px rgba(192, 192, 192, 0.5),
            inset 0 2px 0 rgba(255, 255, 255, 0.6),
            inset 0 -2px 0 rgba(0, 0, 0, 0.15);
          border: 3px solid #708090;
          background-image:
            linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.7) 50%, transparent 60%),
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.5) 0%, transparent 40%);
        `;
      case 'gold':
        return `
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
          box-shadow:
            0 16px 48px rgba(255, 215, 0, 0.6),
            0 8px 16px rgba(255, 140, 0, 0.4),
            inset 0 3px 0 rgba(255, 255, 255, 0.8),
            inset 0 -3px 0 rgba(0, 0, 0, 0.2);
          border: 4px solid #B8860B;
          background-image:
            linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.9) 50%, transparent 70%),
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 30%),
            radial-gradient(circle at 80% 80%, rgba(255, 140, 0, 0.6) 0%, transparent 40%);
        `;
      case 'platinum':
        return `
          background: linear-gradient(135deg, #E5E4E2 0%, #F8F8FF 30%, #D3D3D3 70%, #B8B8B8 100%);
          box-shadow:
            0 20px 60px rgba(229, 228, 226, 0.8),
            0 12px 24px rgba(211, 211, 211, 0.6),
            0 6px 12px rgba(184, 184, 184, 0.4),
            inset 0 4px 0 rgba(255, 255, 255, 0.95),
            inset 0 -4px 0 rgba(0, 0, 0, 0.15);
          border: 5px solid #A9A9A9;
          background-image:
            linear-gradient(45deg, transparent 20%, rgba(255, 255, 255, 0.95) 50%, transparent 80%),
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, transparent 25%),
            radial-gradient(circle at 70% 70%, rgba(248, 248, 255, 0.7) 0%, transparent 35%),
            conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        `;
      default:
        return `
          background: linear-gradient(135deg, #6C757D 0%, #495057 100%);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 3px solid #343A40;
        `;
    }
  }}

  /* Level-based Animations */
  ${props => {
    switch (props.level) {
      case 'bronze':
        return 'animation: pulse 2s ease-in-out infinite;';
      case 'silver':
        return 'animation: rotate 8s linear infinite;';
      case 'gold':
        return 'animation: shimmer 3s ease-in-out infinite;';
      case 'platinum':
        return 'animation: platinumShine 4s ease-in-out infinite, levitate 6s ease-in-out infinite alternate;';
      default:
        return '';
    }
  }}

  /* NEW Badge Indicator */
  ${props => props.isNew && `
    &::before {
      content: '✨ NEW';
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(45deg, #FF4444, #FF6666);
      color: white;
      font-size: 8px;
      font-weight: 900;
      padding: 4px 8px;
      border-radius: 12px;
      animation: pulse 2s infinite;
      z-index: 10;
      border: 2px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
    }
  `}

  /* Hover Effects */
  &:hover {
    ${props => {
      switch (props.level) {
        case 'bronze':
          return 'transform: translateY(-4px) scale(1.05); box-shadow: 0 12px 40px rgba(205, 127, 50, 0.6);';
        case 'silver':
          return 'transform: translateY(-6px) scale(1.08); box-shadow: 0 16px 48px rgba(192, 192, 192, 0.7);';
        case 'gold':
          return 'transform: translateY(-8px) scale(1.10); box-shadow: 0 20px 60px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 140, 0, 0.4);';
        case 'platinum':
          return 'transform: translateY(-10px) scale(1.12); box-shadow: 0 24px 72px rgba(229, 228, 226, 1), 0 0 30px rgba(211, 211, 211, 0.6);';
        default:
          return 'transform: translateY(-4px) scale(1.05);';
      }
    }}
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    padding: 12px;
  }

  @media (min-width: 768px) and (max-width: 1024px) {
    width: 100px;
    height: 100px;
    padding: 16px;
  }

  /* Keyframe Animations */
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes shimmer {
    0%, 100% { filter: brightness(1) saturate(1); }
    50% { filter: brightness(1.2) saturate(1.1); }
  }

  @keyframes platinumShine {
    0%, 100% { filter: brightness(1) saturate(1); }
    50% { filter: brightness(1.2) saturate(1.1); }
  }

  @keyframes levitate {
    0% { transform: translateY(0px) rotate(0deg); }
    100% { transform: translateY(-2px) rotate(2deg); }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }

  @media (prefers-contrast: high) {
    border-width: 4px;
    box-shadow: none;
    filter: contrast(1.5);
  }
`;

const BadgeIcon = styled.div<{ level: string; missionType: string }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  /* Icon Size and Styling */
  font-size: ${props => {
    switch (props.level) {
      case 'bronze': return '48px';
      case 'silver': return '52px';
      case 'gold': return '56px';
      case 'platinum': return '60px';
      default: return '48px';
    }
  }};

  /* Icon Selection based on Mission Type and Level */
  &::before {
    content: ${props => {
      const { missionType, level } = props;

      // Mission Type Base Icons
      const baseIcons = {
        carbon_offset: level === 'gold' || level === 'platinum' ? '"🛡️"' : '"🌱"',
        donation: level === 'gold' || level === 'platinum' ? '"👥"' : '"💝"',
        petition: level === 'gold' || level === 'platinum' ? '"🎯"' : '"📝"'
      };

      // Level-specific Icon Variations
      if (level === 'platinum') {
        switch (missionType) {
          case 'carbon_offset': return '"🌟"';
          case 'donation': return '"🏆"';
          case 'petition': return '"⚡"';
          default: return '"⭐"';
        }
      }

      return baseIcons[missionType as keyof typeof baseIcons] || '"🎯"';
    }};

    display: inline-block;
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
    animation: ${props => {
      switch (props.level) {
        case 'bronze': return 'none';
        case 'silver': return 'float 3s ease-in-out infinite';
        case 'gold': return 'glow 2s ease-in-out infinite alternate';
        case 'platinum': return 'legendaryPulse 3s ease-in-out infinite';
        default: return 'none';
      }
    }};
  }

  /* Additional Effects for Higher Levels */
  ${props => props.level === 'gold' && `
    &::after {
      content: '✨';
      position: absolute;
      top: -5px;
      right: -5px;
      font-size: 16px;
      animation: sparkle 1.5s ease-in-out infinite;
    }
  `}

  ${props => props.level === 'platinum' && `
    &::after {
      content: '👑';
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 18px;
      animation: crownShine 2s ease-in-out infinite alternate;
    }
  `}

  /* Icon Animations */
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
  }

  @keyframes glow {
    0% { filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3)); }
    100% { filter: drop-shadow(2px 2px 8px rgba(255, 215, 0, 0.6)); }
  }

  @keyframes legendaryPulse {
    0%, 100% {
      transform: scale(1);
      filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
    }
    50% {
      transform: scale(1.1);
      filter: drop-shadow(4px 4px 12px rgba(229, 228, 226, 0.8));
    }
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.2) rotate(180deg);
    }
  }

  @keyframes crownShine {
    0% { filter: brightness(1) saturate(1); }
    100% { filter: brightness(1.3) saturate(1.2) hue-rotate(15deg); }
  }

  /* Responsive Icon Sizing */
  @media (max-width: 768px) {
    font-size: ${props => {
      switch (props.level) {
        case 'bronze': return '32px';
        case 'silver': return '36px';
        case 'gold': return '40px';
        case 'platinum': return '44px';
        default: return '32px';
      }
    }};

    &::after {
      font-size: ${props => props.level === 'gold' ? '12px' : props.level === 'platinum' ? '14px' : '12px'};
    }
  }
`;

const BadgeContent = styled.div`
  text-align: center;
  position: relative;
  z-index: 2;
`;

const BadgeTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 6px 0;
  letter-spacing: -0.025em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const BadgeImpact = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 10px;
  opacity: 0.9;
`;

const BadgeLevel = styled.div<{ level: string }>`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 800;
  font-size: 11px;
  color: #FFFFFF;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 3;

  /* Level-specific text colors */
  color: ${props => {
    switch (props.level) {
      case 'bronze': return '#FFFFFF';
      case 'silver': return '#FFFFFF';
      case 'gold': return '#FFFFFF';
      case 'platinum': return '#E5E4E2';
      default: return '#FFFFFF';
    }
  }};
`;

const MintButton = styled(motion.button)<{ isMinting?: boolean; minted?: boolean }>`
  background: ${props => props.minted ? '#28A745' : 'linear-gradient(135deg, #667eea, #764ba2)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 12px;
  cursor: ${props => props.isMinting || props.minted ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  margin-top: 12px;
  opacity: ${props => props.isMinting ? 0.8 : 1};

  &:hover {
    transform: ${props => props.isMinting || props.minted ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.isMinting || props.minted ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const GlowEffect = styled.div<{ level: string }>`
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  background: ${props => {
    switch (props.level) {
      case 'gold': return 'rgba(255, 215, 0, 0.3)';
      case 'platinum': return 'rgba(229, 228, 226, 0.3)';
      default: return 'transparent';
    }
  }};
  filter: blur(8px);
  opacity: 0;
  transition: opacity 0.3s ease;

  ${BadgeContainer}:hover & {
    opacity: 1;
  }
`;

const getMissionIcon = (missionType: MissionType, level: string) => {
  const iconProps = { size: 36, color: 'white', strokeWidth: 2.5 };

  // 레벨에 따른 아이콘 변형
  switch (missionType) {
    case 'carbon_offset':
      if (level === 'gold' || level === 'platinum') {
        return <Shield {...iconProps} />;
      }
      return <Leaf {...iconProps} />;

    case 'donation':
      if (level === 'gold' || level === 'platinum') {
        return <Users {...iconProps} />;
      }
      return <Heart {...iconProps} />;

    case 'petition':
      if (level === 'gold' || level === 'platinum') {
        return <Target {...iconProps} />;
      }
      return <MessageSquare {...iconProps} />;

    default:
      return <Zap {...iconProps} />;
  }
};

const getMissionTypeText = (type: MissionType) => {
  switch (type) {
    case 'carbon_offset': return '탄소상쇄';
    case 'donation': return '기부';
    case 'petition': return '청원';
    default: return type;
  }
};

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'bronze': return <Shield size={14} color="#CD7F32" />;
    case 'silver': return <Star size={14} color="#C0C0C0" />;
    case 'gold': return <Trophy size={16} color="#FFD700" />;
    case 'platinum': return <Award size={16} color="#E5E4E2" />;
    default: return null;
  }
};

export const SBTBadge: React.FC<SBTBadgeProps> = ({
  level,
  missionType,
  impact,
  earnedAt,
  isNew = false,
  showMintButton = false,
  onMintSuccess,
}) => {
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!web3Service.isConnected()) {
      setMintError('메타마스크를 먼저 연결해주세요.');
      return;
    }

    if (!web3Service.isOnPolygon()) {
      setMintError('Polygon 네트워크로 변경해주세요.');
      return;
    }

    setIsMinting(true);
    setMintError(null);

    try {
      const result = await web3Service.mintBadge(missionType, impact);

      if (result.success && result.tokenId && result.txHash) {
        setMinted(true);
        onMintSuccess?.(result.tokenId, result.txHash);

        // 성공 메시지 표시
        alert(`🎉 배지가 성공적으로 민팅되었습니다!\n\n토큰 ID: ${result.tokenId}\n트랜잭션: ${result.txHash.slice(0, 10)}...${result.txHash.slice(-8)}`);
      } else {
        setMintError(result.error || '민팅에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Mint error:', error);
      setMintError('민팅 중 오류가 발생했습니다.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <BadgeContainer
        level={level}
        missionType={missionType}
        isNew={isNew}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        role="img"
        aria-label={`${level} ${missionType} badge with ${impact} impact score`}
      >
        <BadgeIcon level={level} missionType={missionType} />
        <BadgeLevel level={level}>{level}</BadgeLevel>
      </BadgeContainer>

      <BadgeContent>
        <BadgeTitle>{getMissionTypeText(missionType)}</BadgeTitle>
        <BadgeImpact>{impact} 임팩트 포인트</BadgeImpact>
        {earnedAt && (
          <div style={{
            fontSize: '11px',
            fontWeight: '500',
            color: '#718096',
            marginTop: '8px',
            opacity: 0.8,
            textAlign: 'center',
          }}>
            획득일: {earnedAt.toLocaleDateString('ko-KR')}
          </div>
        )}
      </BadgeContent>

      {showMintButton && (
        <MintButton
          isMinting={isMinting}
          minted={minted}
          onClick={handleMint}
          disabled={isMinting || minted}
          whileHover={{ scale: isMinting || minted ? 1 : 1.05 }}
          whileTap={{ scale: isMinting || minted ? 1 : 0.95 }}
        >
          {isMinting ? (
            <>
              <Loader size={14} className="animate-spin" />
              민팅 중...
            </>
          ) : minted ? (
            <>
              <CheckCircle size={14} />
              민팅 완료
            </>
          ) : (
            <>
              <Wallet size={14} />
              지갑으로 받기
            </>
          )}
        </MintButton>
      )}

      {mintError && (
        <div style={{
          fontSize: '11px',
          color: '#e53e3e',
          textAlign: 'center',
          background: '#fed7d7',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #feb2b2',
          maxWidth: '280px'
        }}>
          {mintError}
        </div>
      )}
    </div>
  );
};
