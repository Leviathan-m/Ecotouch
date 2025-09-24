import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MissionType } from '../types';
import { Leaf, Heart, MessageSquare, Star, Trophy, Award } from 'lucide-react';

interface SBTBadgeProps {
  tokenId?: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  missionType: MissionType;
  impact: number;
  earnedAt?: Date;
  isNew?: boolean;
}

const BadgeContainer = styled(motion.div)<{ level: string; isNew?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 2px solid ${props => {
    switch (props.level) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#6C757D';
    }
  }};
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.isNew && `
    &::before {
      content: 'NEW';
      position: absolute;
      top: -8px;
      right: -8px;
      background: #DC3545;
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 8px;
      z-index: 1;
    }
  `}

  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const BadgeIcon = styled.div<{ level: string; missionType: string }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  position: relative;

  background: ${props => {
    const baseColor = (() => {
      switch (props.missionType) {
        case 'carbon_offset': return '#28A745';
        case 'donation': return '#DC3545';
        case 'petition': return '#6F42C1';
        default: return '#6C757D';
      }
    })();

    return `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}dd 100%)`;
  }};

  &::before {
    content: '';
    position: absolute;
    inset: -3px;
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
    z-index: -1;
  }
`;

const BadgeContent = styled.div`
  text-align: center;
`;

const BadgeTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
`;

const BadgeImpact = styled.div`
  font-size: 12px;
  color: #718096;
  margin-bottom: 8px;
`;

const BadgeLevel = styled.div<{ level: string }>`
  font-size: 10px;
  font-weight: 700;
  color: white;
  background: ${props => {
    switch (props.level) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#6C757D';
    }
  }};
  padding: 2px 8px;
  border-radius: 8px;
  text-transform: uppercase;
  display: inline-block;
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
  const iconProps = { size: 32, color: 'white' };

  switch (missionType) {
    case 'carbon_offset':
      return <Leaf {...iconProps} />;
    case 'donation':
      return <Heart {...iconProps} />;
    case 'petition':
      return <MessageSquare {...iconProps} />;
    default:
      return <Star {...iconProps} />;
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
}) => {
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
        {(level === 'gold' || level === 'platinum') && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: 'white',
            borderRadius: '50%',
            padding: '2px',
          }}>
            {getLevelIcon(level)}
          </div>
        )}
      </BadgeIcon>

      <BadgeContent>
        <BadgeTitle>{getMissionTypeText(missionType)}</BadgeTitle>
        <BadgeImpact>{impact} 임팩트</BadgeImpact>
        <BadgeLevel level={level}>{level}</BadgeLevel>
      </BadgeContent>

      {earnedAt && (
        <div style={{
          fontSize: '10px',
          color: '#a0aec0',
          marginTop: '8px',
        }}>
          {earnedAt.toLocaleDateString('ko-KR')}
        </div>
      )}
    </BadgeContainer>
  );
};
