import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MissionType } from '../types';
import { Leaf, Heart, MessageSquare, Star, Trophy, Award, Shield, Zap, Target, Users, Wallet, Loader, CheckCircle } from 'lucide-react';
import { web3Service } from '../services/web3';
import BadgeMedalSVG from './BadgeMedalSVG';

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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  width: 100%;
  height: 100%;

  /* Premium Icon Design with Custom Graphics */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${props => {
      switch (props.level) {
        case 'bronze': return '60px';
        case 'silver': return '65px';
        case 'gold': return '70px';
        case 'platinum': return '75px';
        default: return '60px';
      }
    }};
    height: ${props => {
      switch (props.level) {
        case 'bronze': return '60px';
        case 'silver': return '65px';
        case 'gold': return '70px';
        case 'platinum': return '75px';
        default: return '60px';
      }
    }};
    background: ${props => {
      const { missionType, level } = props;

      // Custom SVG backgrounds for premium look
      const svgIcons = {
        carbon_offset: {
          bronze: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%238B4513' opacity='0.3'/%3E%3Cpath d='M30 50 Q50 30 70 50 Q50 70 30 50' fill='%228B4513'/%3E%3Ccircle cx='50' cy='40' r='8' fill='%23008000'/%3E%3Ctext x='50' y='85' text-anchor='middle' fill='%23FFD700' font-size='12' font-weight='bold'%3EEARTH%3C/text%3E%3C/svg%3E")`,
          silver: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='leaves' patternUnits='userSpaceOnUse' width='20' height='20'%3E%3Cpath d='M10 5 Q15 0 20 5 Q15 10 10 5' fill='%23008000' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='40' fill='url(%23leaves)'/%3E%3Cpath d='M25 45 Q50 20 75 45 Q50 70 25 45' fill='%23008000' stroke='%23005200' stroke-width='2'/%3E%3Ctext x='50' y='85' text-anchor='middle' fill='%23E6E6FA' font-size='10' font-weight='bold'%3ENATURE%3C/text%3E%3C/svg%3E")`,
          gold: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23FFD700' opacity='0.9'/%3E%3Cpath d='M20 40 L45 25 L70 40 L45 55 Z' fill='%23B8860B'/%3E%3Ccircle cx='45' cy='40' r='8' fill='%23FFD700'/%3E%3Ctext x='50' y='80' text-anchor='middle' fill='%23FFFFFF' font-size='9' font-weight='bold'%3EPROTECT%3C/text%3E%3C/svg%3E")`,
          platinum: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3CradialGradient id='starGlow' cx='50%25' cy='30%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFFFFF;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23E5E4E2;stop-opacity:0' /%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='40' fill='%23E5E4E2'/%3E%3Cpath d='M50 15 L55 35 L75 35 L60 50 L65 70 L50 55 L35 70 L40 50 L25 35 L45 35 Z' fill='url(%23starGlow)'/%3E%3Ctext x='50' y='85' text-anchor='middle' fill='%23FFD700' font-size='8' font-weight='bold'%3ELEGEND%3C/text%3E%3C/svg%3E")`
        },
        donation: {
          bronze: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 20 C35 20 25 30 25 45 C25 60 50 80 50 80 C50 80 75 60 75 45 C75 30 65 20 50 20' fill='%23DC3545'/%3E%3Ctext x='50' y='50' text-anchor='middle' fill='%23FFFFFF' font-size='20' font-weight='bold'%3E♡%3C/text%3E%3Ctext x='50' y='85' text-anchor='middle' fill='%23FFD700' font-size='10' font-weight='bold'%3EGIVE%3C/text%3E%3C/svg%3E")`,
          silver: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='35' cy='40' r='12' fill='%23DC3545'/%3E%3Ccircle cx='65' cy='40' r='12' fill='%23DC3545'/%3E%3Cpath d='M35 52 L45 62 L65 42' stroke='%23FFFFFF' stroke-width='3' fill='none'/%3E%3Ctext x='50' y='80' text-anchor='middle' fill='%23E6E6FA' font-size='9' font-weight='bold'%3ESHARE%3C/text%3E%3C/svg%3E")`,
          gold: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='35' fill='%23FFD700'/%3E%3Cpath d='M50 25 C40 25 35 30 35 40 C35 50 50 65 50 65 C50 65 65 50 65 40 C65 30 60 25 50 25' fill='%23DC3545'/%3E%3Ccircle cx='50' cy='45' r='5' fill='%23FFFFFF'/%3E%3Ctext x='50' y='85' text-anchor='middle' fill='%23FFFFFF' font-size='8' font-weight='bold'%3EIMPACT%3C/text%3E%3C/svg%3E")`,
          platinum: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23E5E4E2'/%3E%3Cpath d='M25 30 L40 15 L55 30 L70 15 L75 35 L55 50 L75 65 L70 85 L55 70 L40 85 L25 70 L5 50 L25 35 Z' fill='%23FFD700'/%3E%3Ctext x='50' y='50' text-anchor='middle' fill='%23FFFFFF' font-size='16' font-weight='bold'%3E★%3C/text%3E%3Ctext x='50' y='85' text-anchor='middle' fill='%23FFD700' font-size='7' font-weight='bold'%3EHERO%3C/text%3E%3C/svg%3E")`
        },
        petition: {
          bronze: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='20' y='30' width='60' height='40' rx='5' fill='%236F42C1'/%3E%3Cline x1='25' y1='40' x2='75' y2='40' stroke='%23FFFFFF' stroke-width='2'/%3E%3Cline x1='25' y1='50' x2='65' y2='50' stroke='%23FFFFFF' stroke-width='2'/%3E%3Cline x1='25' y1='60' x2='70' y2='60' stroke='%23FFFFFF' stroke-width='2'/%3E%3Ctext x='50' y='85' text-anchor='middle' fill='%23FFD700' font-size='10' font-weight='bold'%3ESIGN%3C/text%3E%3C/svg%3E")`,
          silver: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='15' y='35' width='70' height='30' rx='8' fill='%236F42C1'/%3E%3Cpath d='M25 45 L35 55 L55 35' stroke='%23FFFFFF' stroke-width='3' fill='none'/%3E%3Ccircle cx='70' cy='50' r='8' fill='%23FFFFFF'/%3E%3Ctext x='70' y='55' text-anchor='middle' fill='%236F42C1' font-size='12' font-weight='bold'%3E!%3C/text%3E%3Ctext x='50' y='80' text-anchor='middle' fill='%23E6E6FA' font-size='9' font-weight='bold'%3EVOICE%3C/text%3E%3C/svg%3E")`,
          gold: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='35' fill='%23FFD700'/%3E%3Ccircle cx='50' cy='50' r='25' fill='%236F42C1'/%3E%3Cpath d='M40 45 L48 53 L60 41' stroke='%23FFFFFF' stroke-width='3' fill='none'/%3E%3Ccircle cx='50' cy='35' r='3' fill='%23FFD700'/%3E%3Ctext x='50' y='85' text-anchor='middle' fill='%23FFFFFF' font-size='8' font-weight='bold'%3ECHANGE%3C/text%3E%3C/svg%3E")`,
          platinum: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3CradialGradient id='lightning' cx='50%25' cy='30%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFFFFF;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%236F42C1;stop-opacity:0' /%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='40' fill='%23E5E4E2'/%3E%3Cpath d='M45 25 L50 40 L40 40 L55 55 L48 55 L52 70 L45 55 L42 70 L37 55 L52 40 L42 40 Z' fill='url(%23lightning)'/%3E%3Ctext x='50' y='85' text-anchor='middle' fill='%23FFD700' font-size='7' font-weight='bold'%3EPOWER%3C/text%3E%3C/svg%3E")`
        }
      };

      return svgIcons[missionType as keyof typeof svgIcons]?.[level as keyof typeof svgIcons.carbon_offset] || `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%236C757D'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23FFFFFF' font-size='12'%3E?%3C/text%3E%3C/svg%3E")`;
    }};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
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
      <div style={{ position: 'relative' }}>
        <BadgeMedalSVG
          missionType={missionType}
          level={level}
          impact={impact}
          isNew={isNew}
          topArcText={(
            {
              carbon_offset: {
                bronze: 'ECO • GUARDIAN • BRONZE',
                silver: 'ECO • CHAMPION • SILVER',
                gold: 'ECO • MASTER • GOLD',
                platinum: 'ECO • LEGEND • PLATINUM'
              },
              donation: {
                bronze: 'COMPASSION • BRONZE • GIVER',
                silver: 'KINDNESS • SILVER • PATRON',
                gold: 'HUMANITY • GOLD • BENEFACTOR',
                platinum: 'PHILANTHROPIST • PLATINUM • LEGEND'
              },
              petition: {
                bronze: 'VOICE • BRONZE • ADVOCATE',
                silver: 'ACTIVISM • SILVER • ORGANIZER',
                gold: 'INFLUENCE • GOLD • CATALYST',
                platinum: 'REVOLUTIONARY • PLATINUM • VISIONARY'
              }
            } as any
          )[missionType][level]}
          bottomArcText={(
            {
              carbon_offset: {
                bronze: 'CARBON NEUTRAL CHAMPION',
                silver: 'SUSTAINABLE LIVING ADVOCATE',
                gold: 'CLIMATE ACTION LEADER',
                platinum: "EARTH'S GUARDIAN SUPREME"
              },
              donation: {
                bronze: 'SHARING IS CARING',
                silver: 'BUILDING BETTER COMMUNITIES',
                gold: 'TRANSFORMING LIVES',
                platinum: 'BEACON OF HOPE'
              },
              petition: {
                bronze: 'DEMOCRACY IN ACTION',
                silver: 'MOBILIZING FOR CHANGE',
                gold: 'DRIVING POLICY CHANGE',
                platinum: 'ARCHITECT OF TOMORROW'
              }
            } as any
          )[missionType][level]}
          achievement={(
            {
              carbon_offset: {
                bronze: '지구 수호자',
                silver: '지속가능 전도사',
                gold: '기후 행동 리더',
                platinum: '지구 수호 전설'
              },
              donation: {
                bronze: '나눔의 시작',
                silver: '공동체 후원자',
                gold: '삶의 변화 창조자',
                platinum: '희망의 등대'
              },
              petition: {
                bronze: '민주주의 참여자',
                silver: '변화 조직가',
                gold: '정책 변화 촉매',
                platinum: '미래 설계자'
              }
            } as any
          )[missionType][level]}
          quote={(
            {
              carbon_offset: {
                bronze: 'Every small action creates big change',
                silver: 'Leading by green example',
                gold: "Protecting our planet's future",
                platinum: 'The ultimate environmental steward'
              },
              donation: {
                bronze: 'Generosity begins with the first gift',
                silver: 'Together we create stronger communities',
                gold: 'Changing the world one gift at a time',
                platinum: 'A lifetime of compassionate giving'
              },
              petition: {
                bronze: 'Your voice matters in democracy',
                silver: 'Organizing voices for greater impact',
                gold: 'Turning advocacy into real change',
                platinum: 'Revolutionary change through persistent voice'
              }
            } as any
          )[missionType][level]}
          size={120}
        />
      </div>

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
