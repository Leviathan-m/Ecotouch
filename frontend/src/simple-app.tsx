import React, { useState, useEffect } from 'react';
import './simple-app.css';
import { DemoModeToggle } from './components/DemoModeToggle';

const SimpleApp: React.FC = () => {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchMissions();
    fetchUserProfile();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch('http://backend:3001/api/missions');
      const data = await response.json();
      if (data.success) {
        setMissions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://backend:3001/api/user/profile');
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const startMission = async (missionId: string) => {
    try {
      const response = await fetch(`http://backend:3001/api/missions/${missionId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      alert(data.message || 'Mission started!');
    } catch (error) {
      console.error('Failed to start mission:', error);
      alert('Failed to start mission');
    }
  };

  const getMissionTypeText = (type: string) => {
    switch (type) {
      case 'carbon_offset': return '🌱 탄소상쇄';
      case 'donation': return '💝 기부';
      case 'petition': return '📝 청원';
      default: return type;
    }
  };

  return (
    <div className="app">
      <DemoModeToggle />
      <header className="header">
        <h1>🌱 Eco Touch</h1>
        <p>한 번의 터치로 지구를 지키다</p>
      </header>

      {user && (
        <div className="user-info">
          <h2>👤 사용자 정보</h2>
          <p>이름: {user.firstName} {user.lastName}</p>
          <p>총 임팩트: {user.totalImpact} 포인트</p>
          <p>완료한 미션: {user.missionsCompleted}개</p>
          <p>획득한 배지: {user.badgesEarned}개</p>
        </div>
      )}

      <div className="missions-section">
        <h2>🎯 이번 주 미션</h2>
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <div className="missions-grid">
            {missions.map((mission) => (
              <div key={mission.id} className="mission-card">
                <div className="mission-header">
                  <span className="mission-type">{getMissionTypeText(mission.type)}</span>
                  <span className="mission-impact">+{mission.impact} 포인트</span>
                </div>
                <h3 className="mission-title">{mission.title}</h3>
                <p className="mission-description">{mission.description}</p>
                <div className="mission-footer">
                  <span className="mission-cost">
                    {mission.cost.toLocaleString()} {mission.currency}
                  </span>
                  <button
                    className="start-button"
                    onClick={() => startMission(mission.id)}
                  >
                    미션 시작하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="footer">
        <p>Eco Touch - Telegram Mini App</p>
      </footer>
    </div>
  );
};

export default SimpleApp;
