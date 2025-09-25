import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mission } from '../types';
import { useMissions } from '../hooks/useMissions';
import { Leaf, Heart, MessageSquare, Play, CheckCircle } from 'lucide-react';

interface MissionCardProps {
  mission: Mission;
}

const Card = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  &.completed {
    border-color: #28A745;
    background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%);
  }

  &.in-progress {
    border-color: #007BFF;
    background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const MissionIcon = styled.div<{ type: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;

  background: ${props => {
    switch (props.type) {
      case 'carbon_offset': return '#28A745';
      case 'donation': return '#DC3545';
      case 'petition': return '#6F42C1';
      default: return '#6C757D';
    }
  }};
`;

const StatusIcon = styled.div<{ status: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  background: ${props => {
    switch (props.status) {
      case 'completed': return '#28A745';
      case 'in_progress': return '#007BFF';
      case 'failed': return '#DC3545';
      default: return '#6C757D';
    }
  }};
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
`;

const Description = styled.p`
  font-size: 14px;
  color: #718096;
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ImpactBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #e8f5e8;
  color: #28A745;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const CostBadge = styled.div`
  background: #f7fafc;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProgressIndicator = styled.div`
  margin-top: 12px;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #28A745 0%, #20c997 100%);
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
`;

const getMissionIcon = (type: string) => {
  switch (type) {
    case 'carbon_offset': return <Leaf size={24} />;
    case 'donation': return <Heart size={24} />;
    case 'petition': return <MessageSquare size={24} />;
    default: return <Play size={24} />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle size={16} />;
    case 'in_progress': return <Play size={16} />;
    default: return null;
  }
};

const getMissionTypeText = (type: string) => {
  switch (type) {
    case 'carbon_offset': return '탄소상쇄';
    case 'donation': return '기부';
    case 'petition': return '청원';
    default: return type;
  }
};

export const MissionCard: React.FC<MissionCardProps> = ({ mission }) => {
  const { startMission, getProgressByMissionId } = useMissions();
  const [isStarting, setIsStarting] = useState(false);

  const progress = getProgressByMissionId(mission.id);
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'processing';

  const handleStartMission = async () => {
    if (isCompleted || isInProgress) return;

    setIsStarting(true);
    try {
      await startMission(mission.id);
    } catch (error) {
      console.error('Failed to start mission:', error);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Card
      className={isCompleted ? 'completed' : isInProgress ? 'in-progress' : ''}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Header>
        <MissionIcon type={mission.type}>
          {getMissionIcon(mission.type)}
        </MissionIcon>
        <StatusIcon status={progress?.status || 'pending'}>
          {getStatusIcon(progress?.status || 'pending')}
        </StatusIcon>
      </Header>

      <Content>
        <Title>{mission.title}</Title>
        <Description>{mission.description}</Description>

        <Stats>
          <ImpactBadge>
            🌱 {mission.impact} 포인트
          </ImpactBadge>
          <CostBadge>
            {mission.cost.toLocaleString()} {mission.currency}
          </CostBadge>
        </Stats>

        {isInProgress && progress && (
          <ProgressIndicator>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: '#718096' }}>진행률</span>
              <span style={{ fontSize: '12px', color: '#4a5568', fontWeight: '500' }}>
                {progress.progress}%
              </span>
            </div>
            <ProgressBar progress={progress.progress}>
              <ProgressFill progress={progress.progress} />
            </ProgressBar>
          </ProgressIndicator>
        )}

        <ActionButton
          onClick={handleStartMission}
          disabled={isCompleted || isInProgress || isStarting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isStarting ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              시작하는 중...
            </>
          ) : isCompleted ? (
            <>
              <CheckCircle size={16} />
              완료됨
            </>
          ) : isInProgress ? (
            <>
              <Play size={16} />
              진행 중...
            </>
          ) : (
            <>
              <Play size={16} />
              미션 시작하기
            </>
          )}
        </ActionButton>
      </Content>
    </Card>
  );
};
