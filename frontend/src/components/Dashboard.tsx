import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { useMissions } from '../hooks/useMissions';
import { MissionCard } from './MissionCard';
import { ProgressBar } from './ProgressBar';
import { SBTBadge } from './SBTBadge';
import { WorkLog } from './WorkLog';
import { Mission, ProgressStats } from '../types';
import { Leaf, Trophy, Target, TrendingUp, Share2 } from 'lucide-react';
import shareService from '../services/share';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 16px;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #718096;
`;

const MissionsSection = styled.section`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const MissionsGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const ProgressSection = styled.section`
  margin-bottom: 30px;
`;

const BadgesSection = styled.section`
  margin-bottom: 30px;
`;

const BadgesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #718096;
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

export const Dashboard: React.FC = () => {
  const { user, isReady } = useTelegram();
  const {
    missions,
    missionProgress,
    isLoading,
    error,
    getTotalImpact,
    getCompletedMissionsCount,
  } = useMissions();

  const [progressStats, setProgressStats] = useState<ProgressStats>({
    totalMissions: 0,
    completedMissions: 0,
    totalImpact: 0,
    weeklyGoal: 100,
    weeklyProgress: 0,
    nextMilestone: 25,
  });

  const [isSharing, setIsSharing] = useState(false);

  const handleShareProgress = async () => {
    try {
      setIsSharing(true);
      const title = '나의 Eco Touch ESG 임팩트 현황';
      const text = `총 임팩트 ${progressStats.totalImpact}점, 완료 미션 ${progressStats.completedMissions}개, 주간 달성률 ${Math.round(progressStats.weeklyProgress)}%`;
      await shareService.share({ type: 'progress', title, text, meta: progressStats as any });
    } catch (e) {
      console.error('Share progress error:', e);
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    if (missions.length > 0) {
      const completed = getCompletedMissionsCount();
      const impact = getTotalImpact();

      setProgressStats(prev => ({
        ...prev,
        totalMissions: missions.length,
        completedMissions: completed,
        totalImpact: impact,
        weeklyProgress: Math.min((impact / prev.weeklyGoal) * 100, 100),
      }));
    }
  }, [missions, missionProgress, getCompletedMissionsCount, getTotalImpact]);

  if (!isReady) {
    return (
      <DashboardContainer>
        <LoadingSpinner>텔레그램 앱을 초기화하는 중...</LoadingSpinner>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>🌱 Eco Touch</Title>
        <Subtitle>한 번의 터치로 지구를 지키다</Subtitle>
        <div style={{ marginTop: 12 }}>
          <button
            onClick={handleShareProgress}
            disabled={isSharing}
            style={{
              background: 'linear-gradient(135deg, #00B894, #0984E3)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 12px',
              fontWeight: 600,
              cursor: isSharing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Share2 size={16} /> {isSharing ? '공유 중...' : '임팩트 자랑하기'}
          </button>
        </div>
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p style={{ color: '#4a5568', margin: '8px 0 0 0' }}>
              환영합니다, {user.first_name}님!
            </p>
          </motion.div>
        )}
      </Header>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <StatIcon color="#28A745">
            <Leaf size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{progressStats.totalImpact}</StatValue>
            <StatLabel>총 임팩트 점수</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <StatIcon color="#007BFF">
            <Trophy size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{progressStats.completedMissions}</StatValue>
            <StatLabel>완료한 미션</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <StatIcon color="#FFC107">
            <Target size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{Math.round(progressStats.weeklyProgress)}%</StatValue>
            <StatLabel>주간 목표 달성</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <StatIcon color="#DC3545">
            <TrendingUp size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{progressStats.nextMilestone}</StatValue>
            <StatLabel>다음 마일스톤</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <ProgressSection>
        <SectionTitle>📊 주간 진행률</SectionTitle>
        <ProgressBar
          progress={progressStats.weeklyProgress}
          total={progressStats.weeklyGoal}
          label={`주간 목표: ${progressStats.totalImpact}/${progressStats.weeklyGoal} 포인트`}
        />
      </ProgressSection>

      <MissionsSection>
        <SectionTitle>🎯 이번 주 미션</SectionTitle>
        {isLoading ? (
          <LoadingSpinner>미션을 불러오는 중...</LoadingSpinner>
        ) : (
          <MissionsGrid>
            {missions.slice(0, 3).map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <MissionCard mission={mission} />
              </motion.div>
            ))}
          </MissionsGrid>
        )}
      </MissionsSection>

      <BadgesSection>
        <SectionTitle>🏆 나의 임팩트 배지</SectionTitle>
        <BadgesGrid>
          {/* Placeholder badges - in real app, fetch from API */}
          <SBTBadge level="bronze" missionType="carbon_offset" impact={25} />
          <SBTBadge level="silver" missionType="donation" impact={50} />
          <SBTBadge level="gold" missionType="petition" impact={75} />
        </BadgesGrid>
      </BadgesSection>

      <WorkLog />
    </DashboardContainer>
  );
};
