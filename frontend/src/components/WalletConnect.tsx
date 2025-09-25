import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { web3Service } from '../services/web3';
import { Wallet, ExternalLink, CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';

const ConnectButton = styled(motion.button)<{ connected?: boolean; loading?: boolean }>`
  background: ${props => props.connected ? '#28A745' : 'linear-gradient(135deg, #6366f1, #8b5cf6)'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

  &:hover {
    transform: ${props => props.loading ? 'none' : 'translateY(-2px)'};
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  ${props => props.loading && `
    opacity: 0.8;
  `}
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const AddressText = styled.span`
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
`;

const BalanceText = styled.span`
  font-size: 12px;
  color: #718096;
`;

const NetworkBadge = styled.div<{ isPolygon: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.isPolygon ? '#28A745' : '#e53e3e'};
  color: white;
`;

const StatusModal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-width: 400px;
  width: 90%;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
`;

const ModalMessage = styled.p`
  margin: 0 0 20px 0;
  color: #4a5568;
  line-height: 1.5;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ModalButton = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.primary ? '#28A745' : '#e2e8f0'};
  background: ${props => props.primary ? '#28A745' : 'white'};
  color: ${props => props.primary ? 'white' : '#4a5568'};

  &:hover {
    background: ${props => props.primary ? '#218838' : '#f7fafc'};
  }
`;

export const WalletConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isOnPolygon, setIsOnPolygon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const connected = web3Service.isConnected();
      setIsConnected(connected);

      if (connected) {
        const account = await web3Service.getAccount();
        const accountBalance = await web3Service.getBalance();
        const onPolygon = web3Service.isOnPolygon();

        setAddress(account);
        setBalance(accountBalance);
        setIsOnPolygon(onPolygon);
      } else {
        setAddress(null);
        setBalance('0');
        setIsOnPolygon(false);
      }
    } catch (error) {
      console.error('Connection check error:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const success = await web3Service.connectWallet();

      if (success) {
        // Wait a bit for connection to establish
        setTimeout(async () => {
          await checkConnection();
          setLoading(false);

          // Check if on Polygon network
          const onPolygon = web3Service.isOnPolygon();
          if (!onPolygon) {
            showModalMessage('warning', '네트워크 변경 필요', 'Eco Touch는 Polygon 네트워크를 사용합니다. 네트워크를 변경하시겠습니까?', async () => {
              const switched = await web3Service.switchToPolygon();
              if (switched) {
                await checkConnection();
                showModalMessage('success', '연결 완료', '메타마스크가 성공적으로 연결되었습니다!');
              } else {
                showModalMessage('error', '네트워크 변경 실패', 'Polygon 네트워크로 변경하는데 실패했습니다.');
              }
            });
          } else {
            showModalMessage('success', '연결 완료', '메타마스크가 성공적으로 연결되었습니다!');
          }
        }, 2000);
      } else {
        setLoading(false);
        showModalMessage('error', '연결 실패', '메타마스크 연결에 실패했습니다.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Connect error:', error);
      showModalMessage('error', '연결 실패', '메타마스크 연결 중 오류가 발생했습니다.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await web3Service.disconnectWallet();
      await checkConnection();
      showModalMessage('success', '연결 해제', '메타마스크 연결이 해제되었습니다.');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const showModalMessage = (
    type: 'success' | 'error' | 'warning',
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModalContent({ type, title, message });
    setShowModal(true);

    if (onConfirm) {
      // Store the callback for later use
      (window as any).modalConfirmCallback = onConfirm;
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const handleModalConfirm = () => {
    if ((window as any).modalConfirmCallback) {
      (window as any).modalConfirmCallback();
    }
    closeModal();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getStatusIcon = () => {
    if (loading) return <Loader size={16} className="animate-spin" />;
    if (isConnected) return <CheckCircle size={16} />;
    return <Wallet size={16} />;
  };

  const getStatusText = () => {
    if (loading) return '연결 중...';
    if (isConnected) return '연결됨';
    return '지갑 연결';
  };

  if (isConnected && address) {
    return (
      <>
        <WalletInfo>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AddressText>{formatAddress(address)}</AddressText>
              <NetworkBadge isPolygon={isOnPolygon}>
                {isOnPolygon ? '✅' : '❌'} {isOnPolygon ? 'Polygon' : 'Wrong Network'}
              </NetworkBadge>
            </div>
            <BalanceText>{parseFloat(balance).toFixed(4)} MATIC</BalanceText>
          </div>
          <ConnectButton
            connected={isConnected}
            onClick={handleDisconnect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <XCircle size={16} />
            연결 해제
          </ConnectButton>
        </WalletInfo>

        <AnimatePresence>
          {showModal && modalContent && (
            <>
              <ModalOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
              />
              <StatusModal
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <ModalTitle>
                  {modalContent.type === 'success' && '✅ '}
                  {modalContent.type === 'error' && '❌ '}
                  {modalContent.type === 'warning' && '⚠️ '}
                  {modalContent.title}
                </ModalTitle>
                <ModalMessage>{modalContent.message}</ModalMessage>
                <ModalButtons>
                  <ModalButton onClick={closeModal}>닫기</ModalButton>
                  {(window as any).modalConfirmCallback && (
                    <ModalButton primary onClick={handleModalConfirm}>
                      확인
                    </ModalButton>
                  )}
                </ModalButtons>
              </StatusModal>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <ConnectButton
        onClick={handleConnect}
        disabled={loading}
        loading={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {getStatusIcon()}
        {getStatusText()}
      </ConnectButton>

      <AnimatePresence>
        {showModal && modalContent && (
          <>
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <StatusModal
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <ModalTitle>
                {modalContent.type === 'success' && '✅ '}
                {modalContent.type === 'error' && '❌ '}
                {modalContent.type === 'warning' && '⚠️ '}
                {modalContent.title}
              </ModalTitle>
              <ModalMessage>{modalContent.message}</ModalMessage>
              <ModalButtons>
                <ModalButton onClick={closeModal}>닫기</ModalButton>
                {(window as any).modalConfirmCallback && (
                  <ModalButton primary onClick={handleModalConfirm}>
                    확인
                  </ModalButton>
                )}
              </ModalButtons>
            </StatusModal>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
