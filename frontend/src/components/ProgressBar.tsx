import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  total?: number;
  label?: string;
  color?: string;
  animated?: boolean;
}

const ProgressContainer = styled.div`
  width: 100%;
  margin-bottom: 16px;
`;

const Label = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
`;

const ProgressText = styled.span`
  color: #28A745;
  font-weight: 600;
`;

const BarContainer = styled.div`
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
`;

const BarFill = styled(motion.div)<{ color: string }>`
  height: 100%;
  background: linear-gradient(90deg, ${props => props.color} 0%, ${props => props.color}dd 100%);
  border-radius: 6px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const Milestone = styled.div<{ position: number; active: boolean }>`
  position: absolute;
  top: -8px;
  left: ${props => props.position}%;
  transform: translateX(-50%);
  width: 4px;
  height: 28px;
  background: ${props => props.active ? '#28A745' : '#cbd5e0'};
  border-radius: 2px;
  z-index: 1;

  &::after {
    content: '${props => Math.round(props.position)}%';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: ${props => props.active ? '#28A745' : '#a0aec0'};
    font-weight: 500;
    white-space: nowrap;
  }
`;

const AnimatedCounter = styled(motion.span)`
  display: inline-block;
  font-weight: 700;
  color: #28A745;
`;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  label,
  color = '#28A745',
  animated = true,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const milestones = [25, 50, 75, 100];

  return (
    <ProgressContainer>
      {label && (
        <Label>
          <span>{label}</span>
          <ProgressText>
            {animated ? (
              <AnimatedCounter
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={clampedProgress}
              >
                {clampedProgress.toFixed(1)}%
              </AnimatedCounter>
            ) : (
              `${clampedProgress.toFixed(1)}%`
            )}
          </ProgressText>
        </Label>
      )}

      <BarContainer>
        {milestones.map(milestone => (
          <Milestone
            key={milestone}
            position={milestone}
            active={clampedProgress >= milestone}
          />
        ))}

        <BarFill
          color={color}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: "easeOut",
            delay: animated ? 0.2 : 0,
          }}
        />
      </BarContainer>

      {total && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '12px',
          color: '#718096'
        }}>
          <span>0</span>
          <span>{total}</span>
        </div>
      )}
    </ProgressContainer>
  );
};
