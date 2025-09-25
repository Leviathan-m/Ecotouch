import { ethers } from 'ethers';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, polygon } from 'viem/chains';
import { watchAccount, watchNetwork, getAccount, getNetwork } from '@wagmi/core';

// Web3Modal configuration
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

const metadata = {
  name: 'Eco Touch',
  description: 'One-touch platform for global social impact',
  url: 'https://ecotouch.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [polygon, mainnet];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// Create Web3Modal instance
export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#28A745',
    '--w3m-color-mix-strength': 20
  }
});

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  POLYGON: {
    BADGE_SBT: '0x0000000000000000000000000000000000000000', // To be deployed
    ACCOUNT_FACTORY: '0x0000000000000000000000000000000000000000', // To be deployed
  }
};

// ABI for ImpactBadgeSBT contract
export const BADGE_SBT_ABI = [
  "function mintBadge(address recipient, string memory missionType, uint256 impact, string memory ipfsHash) external returns (uint256)",
  "function getBadgeMetadata(uint256 tokenId) external view returns (tuple(address recipient, string missionType, string level, uint256 impact, uint256 earnedAt, string ipfsHash))",
  "function locked(uint256 tokenId) external view returns (bool)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function getBadgesOfOwner(address owner) external view returns (uint256[])",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event BadgeMinted(uint256 indexed tokenId, address indexed recipient, string missionType, string level, uint256 impact)",
  "event BadgeLocked(uint256 indexed tokenId)"
];

// ABI for AccountFactory contract
export const ACCOUNT_FACTORY_ABI = [
  "function createAccount(address owner, uint256 salt) external returns (address)",
  "function getAccountAddress(address owner, uint256 salt) external view returns (address)",
  "function accounts(address owner) external view returns (address)"
];

export class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private badgeContract: ethers.Contract | null = null;
  private accountFactoryContract: ethers.Contract | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Watch for account changes
      watchAccount((account: any) => {
        console.log('Account changed:', account);
        if (account?.isConnected) {
          this.connectProvider();
        } else {
          this.disconnect();
        }
      });

      // Watch for network changes
      watchNetwork((network: any) => {
        console.log('Network changed:', network);
        if (network?.chain?.id === polygon.id) {
          this.connectContracts();
        }
      });

      // Try to reconnect if already connected
      const account: any = getAccount();
      if (account?.isConnected) {
        await this.connectProvider();
      }
    } catch (error) {
      console.error('Web3 initialization error:', error);
    }
  }

  private async connectProvider() {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        this.provider = new ethers.providers.Web3Provider((window as any).ethereum);
        await this.provider.send("eth_requestAccounts", []);
        this.signer = this.provider.getSigner();
        console.log('🟢 Web3 provider connected');

        await this.connectContracts();
      }
    } catch (error) {
      console.error('Provider connection error:', error);
      throw error;
    }
  }

  private async connectContracts() {
    if (!this.provider || !this.signer) return;

    try {
      const network: any = await this.provider.getNetwork();

      if (network?.chainId === polygon.id) {
        // Connect to Badge SBT contract
        this.badgeContract = new ethers.Contract(
          CONTRACT_ADDRESSES.POLYGON.BADGE_SBT,
          BADGE_SBT_ABI,
          this.signer
        );

        // Connect to Account Factory contract
        this.accountFactoryContract = new ethers.Contract(
          CONTRACT_ADDRESSES.POLYGON.ACCOUNT_FACTORY,
          ACCOUNT_FACTORY_ABI,
          this.signer
        );

        console.log('🔗 Smart contracts connected');
      }
    } catch (error) {
      console.error('Contract connection error:', error);
    }
  }

  private disconnect() {
    this.provider = null;
    this.signer = null;
    this.badgeContract = null;
    this.accountFactoryContract = null;
    console.log('🔴 Web3 disconnected');
  }

  // Public methods

  async connectWallet(): Promise<boolean> {
    try {
      web3Modal.open();
      return true;
    } catch (error) {
      console.error('Wallet connection error:', error);
      return false;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      // Web3Modal v3: disconnect handled via wallet UI
    } catch (error) {
      console.error('Wallet disconnect error:', error);
    }
  }

  async getAccount(): Promise<string | null> {
    try {
      const account = getAccount();
      return account.address || null;
    } catch (error) {
      console.error('Get account error:', error);
      return null;
    }
  }

  async getBalance(): Promise<string> {
    try {
      if (!this.signer) return '0';

      const address = await this.signer.getAddress();
      const balance = await this.provider!.getBalance(address);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Get balance error:', error);
      return '0';
    }
  }

  async getNetwork(): Promise<any> {
    try {
      const network = getNetwork();
      return network.chain;
    } catch (error) {
      console.error('Get network error:', error);
      return null;
    }
  }

  async switchToPolygon(): Promise<boolean> {
    try {
      if (!window.ethereum) return false;

      await (window.ethereum as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${polygon.id.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window.ethereum as any).request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${polygon.id.toString(16)}`,
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/'],
            }],
          });
          return true;
        } catch (addError) {
          console.error('Add Polygon network error:', addError);
          return false;
        }
      }
      console.error('Switch to Polygon error:', switchError);
      return false;
    }
  }

  // Badge operations

  async mintBadge(
    missionType: 'carbon_offset' | 'donation' | 'petition',
    impact: number,
    ipfsHash: string = ''
  ): Promise<{ success: boolean; tokenId?: number; txHash?: string; error?: string }> {
    try {
      if (!this.badgeContract || !this.signer) {
        throw new Error('Wallet not connected');
      }

      const recipient = await this.signer.getAddress();

      console.log('🏭 Minting badge:', { recipient, missionType, impact, ipfsHash });

      // Estimate gas first
      const gasEstimate = await this.badgeContract.estimateGas.mintBadge(
        recipient,
        missionType,
        impact,
        ipfsHash
      );

      // Mint the badge
      const tx = await this.badgeContract.mintBadge(
        recipient,
        missionType,
        impact,
        ipfsHash,
        {
          gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
        }
      );

      console.log('⏳ Transaction submitted:', tx.hash);

      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);

      // Parse BadgeMinted event to get tokenId
      const badgeMintedEvent = receipt.events?.find(
        (event: any) => event.event === 'BadgeMinted'
      );

      const tokenId = badgeMintedEvent?.args?.tokenId?.toNumber();

      return {
        success: true,
        tokenId,
        txHash: tx.hash
      };

    } catch (error: any) {
      console.error('Mint badge error:', error);

      let errorMessage = '배지 민팅에 실패했습니다.';
      if (error.code === 4001) {
        errorMessage = '트랜잭션이 취소되었습니다.';
      } else if (error.code === -32000) {
        errorMessage = '가스비가 부족합니다.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = '잔액이 부족합니다.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getBadgeMetadata(tokenId: number): Promise<any> {
    try {
      if (!this.badgeContract) throw new Error('Contract not connected');

      const metadata = await this.badgeContract.getBadgeMetadata(tokenId);
      return {
        recipient: metadata.recipient,
        missionType: metadata.missionType,
        level: metadata.level,
        impact: metadata.impact.toNumber(),
        earnedAt: new Date(metadata.earnedAt.toNumber() * 1000),
        ipfsHash: metadata.ipfsHash
      };
    } catch (error) {
      console.error('Get badge metadata error:', error);
      return null;
    }
  }

  async getUserBadges(address?: string): Promise<number[]> {
    try {
      if (!this.badgeContract) throw new Error('Contract not connected');

      const userAddress = address || await this.signer?.getAddress();
      if (!userAddress) throw new Error('No address available');

      const tokenIds = await this.badgeContract.getBadgesOfOwner(userAddress);
      return tokenIds.map((id: any) => id.toNumber());
    } catch (error) {
      console.error('Get user badges error:', error);
      return [];
    }
  }

  async getBadgeBalance(address?: string): Promise<number> {
    try {
      if (!this.badgeContract) throw new Error('Contract not connected');

      const userAddress = address || await this.signer?.getAddress();
      if (!userAddress) throw new Error('No address available');

      const balance = await this.badgeContract.balanceOf(userAddress);
      return balance.toNumber();
    } catch (error) {
      console.error('Get badge balance error:', error);
      return 0;
    }
  }

  async getTokenURI(tokenId: number): Promise<string> {
    try {
      if (!this.badgeContract) throw new Error('Contract not connected');

      return await this.badgeContract.tokenURI(tokenId);
    } catch (error) {
      console.error('Get token URI error:', error);
      return '';
    }
  }

  // Account Abstraction methods

  async createSmartAccount(salt: number = 0): Promise<string | null> {
    try {
      if (!this.accountFactoryContract || !this.signer) {
        throw new Error('Wallet not connected');
      }

      const owner = await this.signer.getAddress();

      console.log('🏗️ Creating smart account for:', owner);

      const tx = await this.accountFactoryContract.createAccount(owner, salt);
      const receipt = await tx.wait();

      // Get the account address from the transaction
      const accountCreatedEvent = receipt.events?.find(
        (event: any) => event.event === 'AccountCreated'
      );

      return accountCreatedEvent?.args?.account || null;

    } catch (error) {
      console.error('Create smart account error:', error);
      return null;
    }
  }

  async getSmartAccountAddress(salt: number = 0): Promise<string | null> {
    try {
      if (!this.accountFactoryContract || !this.signer) {
        throw new Error('Wallet not connected');
      }

      const owner = await this.signer.getAddress();
      return await this.accountFactoryContract.getAccountAddress(owner, salt);

    } catch (error) {
      console.error('Get smart account address error:', error);
      return null;
    }
  }

  // Utility methods

  isConnected(): boolean {
    const account = getAccount();
    return account.isConnected || false;
  }

  isOnPolygon(): boolean {
    const network = getNetwork();
    return network.chain?.id === polygon.id;
  }

  async signMessage(message: string): Promise<string | null> {
    try {
      if (!this.signer) throw new Error('Wallet not connected');
      return await this.signer.signMessage(message);
    } catch (error) {
      console.error('Sign message error:', error);
      return null;
    }
  }
}

// Create singleton instance
export const web3Service = new Web3Service();

// Export wagmi config for use in components
export { wagmiConfig };

// Type definitions
declare global {
  interface Window {
    ethereum?: Record<string, unknown>;
  }
}
