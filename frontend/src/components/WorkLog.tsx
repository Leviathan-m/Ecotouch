import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkLog as WorkLogType } from '../types';
import { useMissions } from '../hooks/useMissions';
import { Clock, CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

const LogContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  cursor: pointer;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #4a5568;
  }
`;

const LogList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }
`;

const LogItem = styled(motion.div)<{ status: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: ${props => {
    switch (props.status) {
      case 'success': return '#f0fff4';
      case 'error': return '#fed7d7';
      case 'warning': return '#fefcbf';
      default: return '#f7fafc';
    }
  }};
  border-left: 3px solid ${props => {
    switch (props.status) {
      case 'success': return '#48bb78';
      case 'error': return '#f56565';
      case 'warning': return '#ed8936';
      default: return '#a0aec0';
    }
  }};
`;

const LogIcon = styled.div<{ status: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  background: ${props => {
    switch (props.status) {
      case 'success': return '#48bb78';
      case 'error': return '#f56565';
      case 'warning': return '#ed8936';
      default: return '#a0aec0';
    }
  }};
`;

const LogContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const LogMessage = styled.div`
  font-size: 14px;
  color: #2d3748;
  line-height: 1.4;
  word-wrap: break-word;
`;

const LogTimestamp = styled.div`
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
`;

const LogMetadata = styled.div`
  font-size: 12px;
  color: #a0aec0;
  margin-top: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #718096;
  padding: 40px 20px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #718096;
`;

const getLogIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle size={12} />;
    case 'error':
      return <AlertCircle size={12} />;
    case 'warning':
      return <AlertCircle size={12} />;
    default:
      return <Info size={12} />;
  }
};

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return timestamp.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const WorkLog: React.FC = () => {
  const { currentMission, getMissionLogs } = useMissions();
  const [logs, setLogs] = useState<WorkLogType[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      if (currentMission?.missionId) {
        setIsLoading(true);
        try {
          const missionLogs = await getMissionLogs(currentMission.missionId);
          setLogs(missionLogs);
        } catch (error) {
          console.error('Failed to fetch logs:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLogs();
  }, [currentMission?.missionId, getMissionLogs]);

  // Mock logs for demonstration when no current mission
  const mockLogs: WorkLogType[] = [
    {
      id: '1',
      missionId: 'mock',
      userId: 'user1',
      action: 'mission_started',
      status: 'info',
      message: '탄소상쇄 미션을 시작했습니다',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: '2',
      missionId: 'mock',
      userId: 'user1',
      action: 'api_call',
      status: 'success',
      message: 'Cloverly API에 탄소상쇄 요청을 보냈습니다',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      metadata: { api: 'cloverly', amount: '1 ton CO2' },
    },
    {
      id: '3',
      missionId: 'mock',
      userId: 'user1',
      action: 'payment_processing',
      status: 'success',
      message: '결제가 성공적으로 처리되었습니다',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      metadata: { txHash: '0x1234...abcd', amount: '10000 KRW' },
    },
    {
      id: '4',
      missionId: 'mock',
      userId: 'user1',
      action: 'receipt_generated',
      status: 'success',
      message: '기부금영수증이 발급되었습니다',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      metadata: { receiptNumber: 'IMP-2024-001', taxDeductible: true },
    },
    {
      id: '5',
      missionId: 'mock',
      userId: 'user1',
      action: 'sbt_minted',
      status: 'success',
      message: '임팩트 배지(SBT)가 발급되었습니다',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      metadata: { tokenId: '12345', level: 'bronze' },
    },
  ];

  const displayLogs = logs.length > 0 ? logs : mockLogs;

  return (
    <LogContainer>
      <Header onClick={() => setIsExpanded(!isExpanded)}>
        <Title>
          📋 작업 로그
          <span style={{ fontSize: '14px', fontWeight: '400', color: '#718096' }}>
            ({displayLogs.length})
          </span>
        </Title>
        <ToggleButton>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </ToggleButton>
      </Header>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <LoadingSpinner>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #e2e8f0',
                  borderTop: '2px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                로그를 불러오는 중...
              </LoadingSpinner>
            ) : displayLogs.length > 0 ? (
              <LogList>
                {displayLogs.map((log, index) => (
                  <LogItem
                    key={log.id}
                    status={log.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <LogIcon status={log.status}>
                      {getLogIcon(log.status)}
                    </LogIcon>
                    <LogContent>
                      <LogMessage>{log.message}</LogMessage>
                      <LogTimestamp>
                        <Clock size={12} style={{ marginRight: '4px' }} />
                        {formatTimestamp(log.timestamp)}
                      </LogTimestamp>
                      {log.metadata && (
                        <LogMetadata>
                          {JSON.stringify(log.metadata, null, 2)}
                        </LogMetadata>
                      )}
                    </LogContent>
                  </LogItem>
                ))}
              </LogList>
            ) : (
              <EmptyState>
                아직 작업 로그가 없습니다.
                <br />
                미션을 시작하면 여기에 실시간으로 진행 상황이 표시됩니다.
              </EmptyState>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </LogContainer>
  );
};
