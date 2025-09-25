import React, { useState } from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: ${props => props.isVisible ? 'block' : 'none'};

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
  }
`;

const ToggleButton = styled.button<{ isDemo: boolean }>`
  background: ${props => props.isDemo
    ? 'linear-gradient(45deg, #FF6B6B, #DC3545)'
    : 'linear-gradient(45deg, #28A745, #20C997)'
  };
  color: white;
  border: none;
  border-radius: 25px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 11px;
  }
`;

const StatusIndicator = styled.span<{ isDemo: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isDemo ? '#FFD700' : '#ffffff'};
  animation: ${props => props.isDemo ? 'pulse' : 'none'} 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

export const DemoModeToggle: React.FC = () => {
  const [isDemo, setIsDemo] = useState(process.env.REACT_APP_DEMO_MODE === 'true');
  const [isVisible, setIsVisible] = useState(true);

  const toggleDemoMode = () => {
    const newDemoMode = !isDemo;
    setIsDemo(newDemoMode);

    // Reload the page to apply the new demo mode
    if (window.confirm(`데모 모드를 ${newDemoMode ? '활성화' : '비활성화'}하시겠습니까?\n페이지가 새로고침됩니다.`)) {
      // Update localStorage to persist the setting
      localStorage.setItem('eco_touch_demo_mode', newDemoMode.toString());

      // Reload the page
      window.location.reload();
    } else {
      // Revert the state if user cancels
      setIsDemo(isDemo);
    }
  };

  const hideToggle = () => {
    setIsVisible(false);
    localStorage.setItem('eco_touch_toggle_hidden', 'true');
  };

  // Check if toggle should be visible on mount
  React.useEffect(() => {
    const hidden = localStorage.getItem('eco_touch_toggle_hidden') === 'true';
    const storedDemoMode = localStorage.getItem('eco_touch_demo_mode') === 'true';

    setIsVisible(!hidden);
    setIsDemo(storedDemoMode || process.env.REACT_APP_DEMO_MODE === 'true');
  }, []);

  // Only show in development or if explicitly enabled
  if (process.env.NODE_ENV === 'production' && !isDemo) {
    return null;
  }

  return (
    <ToggleContainer isVisible={isVisible}>
      <ToggleButton isDemo={isDemo} onClick={toggleDemoMode}>
        <StatusIndicator isDemo={isDemo} />
        {isDemo ? '🧪 데모 모드' : '🔐 로그인 모드'}
      </ToggleButton>
      {isVisible && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          whiteSpace: 'nowrap',
          opacity: '0.8',
          cursor: 'pointer'
        }} onClick={hideToggle}>
          ✕ 숨기기
        </div>
      )}
    </ToggleContainer>
  );
};
