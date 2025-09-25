import React, { useState, useEffect } from 'react';
import './simple-app.css';
import { Dashboard } from './components/Dashboard';
import { DemoModeToggle } from './components/DemoModeToggle';
import { WalletConnect } from './components/WalletConnect';
import { SBTBadge } from './components/SBTBadge';
import styled from 'styled-components';

// Mock data for demo purposes
const mockMissions = [
  {
    id: '1',
    title: '탄소 발자국 줄이기 챌린지',
    description: '일주일 동안 대중교통 이용하고 탄소 배출량을 20kg 줄여보세요',
    type: 'carbon_offset' as const,
    impact: 25,
    cost: 0,
    currency: 'KRW',
    status: 'pending' as const,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    requirements: ['대중교통 5회 이용', '자가용 대신 도보/자전거 이용'],
  },
  {
    id: '2',
    title: '환경 기부 챌린지',
    description: '환경 단체에 10,000원 기부하고 기부 영수증을 공유하세요',
    type: 'donation' as const,
    impact: 50,
    cost: 10000,
    currency: 'KRW',
    status: 'pending' as const,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    requirements: ['환경 단체 선정', '기부 영수증 업로드'],
  },
  {
    id: '3',
    title: '청원 참여 챌린지',
    description: '환경 보호 관련 청원에 서명하고 5명의 친구를 초대하세요',
    type: 'petition' as const,
    impact: 30,
    cost: 0,
    currency: 'KRW',
    status: 'pending' as const,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    requirements: ['청원 서명', '친구 5명 초대'],
  },
  {
    id: '4',
    title: '제로 웨이스트 챌린지',
    description: '일주일 동안 일회용품을 사용하지 않고 생활해보세요',
    type: 'carbon_offset' as const,
    impact: 40,
    cost: 0,
    currency: 'KRW',
    status: 'completed' as const,
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    requirements: ['일회용품 사용 금지', '재사용 용품 활용'],
  },
  {
    id: '5',
    title: '나무 심기 캠페인',
    description: '지역 나무 심기 행사에 참여하고 사진을 공유하세요',
    type: 'carbon_offset' as const,
    impact: 35,
    cost: 5000,
    currency: 'KRW',
    status: 'processing' as const,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    requirements: ['행사 참여', '참여 사진 업로드'],
  },
];

const mockBadges = [
  { level: 'bronze' as const, missionType: 'carbon_offset' as const, impact: 25, earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { level: 'silver' as const, missionType: 'donation' as const, impact: 50, earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
  { level: 'gold' as const, missionType: 'petition' as const, impact: 75, earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { level: 'platinum' as const, missionType: 'carbon_offset' as const, impact: 100, earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), isNew: true },
];

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const TabContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 25px;
  padding: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  gap: 8px;
  z-index: 1000;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#28A745' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  border-radius: 20px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${props => props.active ? '#28A745' : '#f0f0f0'};
  }
`;

const DemoApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'missions' | 'badges' | 'mint'>('dashboard');
  const [missions, setMissions] = useState(mockMissions);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate user data loading
    setTimeout(() => {
      setUser({
        id: 123456789,
        firstName: 'Demo',
        lastName: 'User',
        telegramId: '123456789',
        totalImpact: 175,
        missionsCompleted: 8,
        badgesEarned: 4,
        level: 'Gold',
      });
    }, 500);
  }, []);

  const handleMissionStart = async (missionId: string) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setMissions(prev => prev.map(mission =>
        mission.id === missionId
          ? { ...mission, status: 'processing' as const }
          : mission
      ));

      setIsLoading(false);
      alert('미션이 시작되었습니다! 🎯');
    }, 1000);
  };

  const handleMissionComplete = async (missionId: string) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setMissions(prev => prev.map(mission =>
        mission.id === missionId
          ? { ...mission, status: 'completed' as const }
          : mission
      ));

      setIsLoading(false);
      alert('미션이 완료되었습니다! 🎉');
    }, 1000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;

      case 'missions':
        return (
          <div style={{ padding: '100px 20px 120px 20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2d3748' }}>
              🎯 모든 미션
            </h1>
            <div style={{
              display: 'grid',
              gap: '20px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {missions.map((mission) => (
                <div key={mission.id} style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '18px', fontWeight: '600' }}>
                        {mission.title}
                      </h3>
                      <p style={{ margin: '0', color: '#718096', fontSize: '14px' }}>
                        {mission.description}
                      </p>
                    </div>
                    <span style={{
                      background: mission.status === 'completed' ? '#28A745' :
                                  mission.status === 'processing' ? '#FFC107' : '#6C757D',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {mission.status === 'completed' ? '완료' :
                       mission.status === 'processing' ? '진행중' : '대기중'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#28A745' }}>
                          +{mission.impact} 임팩트
                        </span>
                        {mission.cost > 0 && (
                          <span style={{ color: '#718096' }}>
                            • {mission.cost.toLocaleString()}원
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                        마감: {mission.deadline.toLocaleDateString('ko-KR')}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (mission.status === 'pending') {
                          handleMissionStart(mission.id);
                        } else if (mission.status === 'processing') {
                          handleMissionComplete(mission.id);
                        }
                      }}
                      disabled={isLoading}
                      style={{
                        background: mission.status === 'completed' ? '#28A745' :
                                   mission.status === 'processing' ? '#DC3545' : '#007BFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontWeight: '600',
                        cursor: mission.status === 'completed' ? 'default' : 'pointer',
                        opacity: isLoading ? 0.6 : 1
                      }}
                    >
                      {mission.status === 'completed' ? '✅ 완료됨' :
                       mission.status === 'processing' ? '🏁 완료하기' :
                       '🚀 시작하기'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'badges':
        return (
          <div style={{ padding: '100px 20px 120px 20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2d3748' }}>
              🏆 나의 배지 컬렉션
            </h1>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {mockBadges.map((badge, index) => (
                <div key={index} style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  {/* Badge content would go here - using simplified version for demo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: badge.missionType === 'carbon_offset' ? '#28A745' :
                               badge.missionType === 'donation' ? '#DC3545' : '#6F42C1',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '32px'
                  }}>
                    {badge.missionType === 'carbon_offset' ? '🌱' :
                     badge.missionType === 'donation' ? '💝' : '📝'}
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: badge.level === 'bronze' ? '#CD7F32' :
                               badge.level === 'silver' ? '#C0C0C0' :
                               badge.level === 'gold' ? '#FFD700' : '#E5E4E2',
                    color: badge.level === 'gold' || badge.level === 'platinum' ? '#000' : '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    {badge.level}
                  </div>

                  {badge.isNew && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: 'linear-gradient(45deg, #FF6B6B, #DC3545)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '800',
                      boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                    }}>
                      ✨ NEW
                    </div>
                  )}

                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#2d3748',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    {badge.missionType === 'carbon_offset' ? '탄소상쇄' :
                     badge.missionType === 'donation' ? '기부' : '청원'} 배지
                  </h3>

                  <p style={{ margin: '0 0 12px 0', color: '#718096', fontSize: '14px' }}>
                    {badge.impact} 임팩트 포인트
                  </p>

                  <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                    획득일: {badge.earnedAt.toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'mint':
        return (
          <div style={{ padding: '100px 20px 120px 20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2d3748' }}>
              🏭 지갑으로 배지 민팅
            </h1>
            <p style={{ textAlign: 'center', color: '#718096', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              메타마스크에 연결하여 배지를 Polygon 네트워크에 영구적으로 기록하세요.<br/>
              민팅된 배지는 영원히 당신의 자산으로 남습니다.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {mockBadges.map((badge, index) => (
                <SBTBadge
                  key={index}
                  level={badge.level}
                  missionType={badge.missionType}
                  impact={badge.impact}
                  earnedAt={badge.earnedAt}
                  isNew={badge.isNew}
                  showMintButton={true}
                  onMintSuccess={(tokenId, txHash) => {
                    alert(`🎉 배지가 지갑으로 전송되었습니다!\n\n토큰 ID: ${tokenId}\n트랜잭션: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`);
                  }}
                />
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px',
              marginTop: '40px',
              textAlign: 'center',
              maxWidth: '800px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>💡 민팅 안내</h3>
              <ul style={{ textAlign: 'left', lineHeight: '1.6', margin: 0 }}>
                <li>🔗 먼저 메타마스크를 연결하세요</li>
                <li>🌐 Polygon 네트워크로 자동 전환됩니다</li>
                <li>💰 가스비는 Polygon의 저렴한 수수료를 사용합니다</li>
                <li>🏷️ 각 배지는 고유한 NFT로 발행됩니다</li>
                <li>🔒 SBT 특성상 전송이 불가능합니다</li>
                <li>📱 메타마스크에서 영구히 보관됩니다</li>
              </ul>
            </div>
          </div>
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <AppContainer>
      <DemoModeToggle />

      {/* Wallet Connection Section */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        margin: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#2d3748', fontSize: '20px', marginBottom: '16px' }}>
          🔗 메타마스크 연결
        </h2>
        <WalletConnect />
      </div>

      {renderContent()}

      <TabContainer>
        <TabButton
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 대시보드
        </TabButton>
        <TabButton
          active={activeTab === 'missions'}
          onClick={() => setActiveTab('missions')}
        >
          🎯 미션
        </TabButton>
        <TabButton
          active={activeTab === 'badges'}
          onClick={() => setActiveTab('badges')}
        >
          🏆 배지
        </TabButton>
        <TabButton
          active={activeTab === 'mint'}
          onClick={() => setActiveTab('mint')}
        >
          🏭 민팅
        </TabButton>
      </TabContainer>
    </AppContainer>
  );
};

export default DemoApp;
