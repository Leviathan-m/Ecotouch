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

const BadgeContainer = styled(motion.div)<{ level: string; isNew?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 3px solid ${props => {
    switch (props.level) {
      case 'bronze': return 'linear-gradient(45deg, #CD7F32, #A0522D)';
      case 'silver': return 'linear-gradient(45deg, #C0C0C0, #A8A8A8)';
      case 'gold': return 'linear-gradient(45deg, #FFD700, #FFA500)';
      case 'platinum': return 'linear-gradient(45deg, #E5E4E2, #B8B8B8)';
      default: return '#6C757D';
    }
  }};
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  ${props => props.isNew && `
    &::before {
      content: '✨ NEW';
      position: absolute;
      top: -10px;
      right: -10px;
      background: linear-gradient(45deg, #FF6B6B, #DC3545);
      color: white;
      font-size: 9px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
      z-index: 10;
      letter-spacing: 0.5px;
      border: 2px solid rgba(255, 255, 255, 0.8);
      animation: pulse 2s infinite;
    }

    &::after {
      content: '';
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background: #FF6B6B;
      border-radius: 50%;
      animation: sparkle 1.5s ease-in-out infinite;
    }
  `}

  &:hover {
    transform: translateY(-8px) scale(1.08);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.2),
      0 8px 32px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    border-color: transparent;
  }

  &:active {
    transform: translateY(-4px) scale(1.05);
    transition: all 0.1s ease;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.3); }
  }
`;

const BadgeIcon = styled.div<{ level: string; missionType: string }>`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));

  background: ${props => {
    const baseColor = (() => {
      switch (props.missionType) {
        case 'carbon_offset': return '#28A745';
        case 'donation': return '#DC3545';
        case 'petition': return '#6F42C1';
        default: return '#6C757D';
      }
    })();

    return `linear-gradient(145deg, ${baseColor} 0%, ${baseColor}88 50%, ${baseColor}dd 100%)`;
  }};

  border: 4px solid ${props => {
    switch (props.level) {
      case 'bronze': return 'linear-gradient(45deg, #CD7F32, #A0522D)';
      case 'silver': return 'linear-gradient(45deg, #C0C0C0, #A8A8A8)';
      case 'gold': return 'linear-gradient(45deg, #FFD700, #FFA500)';
      case 'platinum': return 'linear-gradient(45deg, #E5E4E2, #B8B8B8)';
      default: return '#6C757D';
    }
  }};

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: ${props => {
      switch (props.level) {
        case 'bronze': return 'linear-gradient(45deg, #CD7F32, #A0522D)';
        case 'silver': return 'linear-gradient(45deg, #C0C0C0, #A8A8A8)';
        case 'gold': return 'linear-gradient(45deg, #FFD700, #FFA500)';
        case 'platinum': return 'linear-gradient(45deg, #E5E4E2, #B8B8B8)';
        default: return '#6C757D';
      }
    }};
    z-index: -2;
    opacity: 0.7;
  }

  &::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 70%, transparent 100%);
    z-index: 1;
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
  font-size: 11px;
  font-weight: 800;
  color: white;
  background: ${props => {
    switch (props.level) {
      case 'bronze': return 'linear-gradient(45deg, #CD7F32, #A0522D)';
      case 'silver': return 'linear-gradient(45deg, #C0C0C0, #A8A8A8)';
      case 'gold': return 'linear-gradient(45deg, #FFD700, #FFA500)';
      case 'platinum': return 'linear-gradient(45deg, #E5E4E2, #B8B8B8)';
      default: return '#6C757D';
    }
  }};
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
  display: inline-block;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
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
    <BadgeContainer
      level={level}
      isNew={isNew}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <GlowEffect level={level} />

      <BadgeIcon level={level} missionType={missionType}>
        {getMissionIcon(missionType, level)}
        <div style={{
          position: 'absolute',
          top: '-3px',
          right: '-3px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '50%',
          padding: '3px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.8)',
        }}>
          {getLevelIcon(level)}
        </div>
      </BadgeIcon>

      <BadgeContent>
        <BadgeTitle>{getMissionTypeText(missionType)}</BadgeTitle>
        <BadgeImpact>{impact} 임팩트</BadgeImpact>
        <BadgeLevel level={level}>{level}</BadgeLevel>
      </BadgeContent>

      {earnedAt && (
        <div style={{
          fontSize: '11px',
          fontWeight: '500',
          color: '#718096',
          marginTop: '12px',
          opacity: 0.8,
          textAlign: 'center',
        }}>
          {earnedAt.toLocaleDateString('ko-KR')}
        </div>
      )}

      {showMintButton && (
        <div style={{ textAlign: 'center' }}>
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

          {mintError && (
            <div style={{
              fontSize: '11px',
              color: '#e53e3e',
              marginTop: '8px',
              textAlign: 'center',
              background: '#fed7d7',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #feb2b2'
            }}>
              {mintError}
            </div>
          )}
        </div>
      )}
    </BadgeContainer>
  );
};
