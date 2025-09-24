import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { WalletInfo } from '../types';

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: '',
    chainId: 137, // Polygon mainnet
    isConnected: false,
  });

  useEffect(() => {
    setWalletInfo({
      address: address || '',
      chainId: chain?.id || 137,
      isConnected,
      balance: '0', // Will be updated when balance is fetched
    });
  }, [address, chain?.id, isConnected]);

  const connectWallet = async (connectorId?: string) => {
    try {
      const connector = connectors.find(c => c.id === connectorId) || connectors[0];
      if (connector) {
        await connect({ connector });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const switchToPolygon = async () => {
    if (switchNetwork) {
      try {
        await switchNetwork(137); // Polygon mainnet
      } catch (error) {
        console.error('Failed to switch to Polygon:', error);
        throw error;
      }
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const isOnCorrectNetwork = chain?.id === 137; // Polygon mainnet

  return {
    walletInfo,
    connectWallet,
    disconnectWallet,
    switchToPolygon,
    isConnecting,
    isOnCorrectNetwork,
    connectors,
  };
};
