import { ethers } from 'ethers';
import { logger } from '../utils/logger';

export interface SBTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
  external_url?: string;
}

export interface SBTMintRequest {
  recipient: string;
  tokenId: string;
  metadata: SBTMetadata;
  missionType: 'carbon_offset' | 'donation' | 'petition';
  impactScore: number;
}

export interface SBTToken {
  tokenId: string;
  owner: string;
  metadata: SBTMetadata;
  mintedAt: Date;
  missionType: string;
  impactScore: number;
}

export class SBTService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contractAddress: string;
  private contract: ethers.Contract | null = null;

  constructor() {
    this.contractAddress = process.env.SBT_CONTRACT_ADDRESS || '';

    if (!this.contractAddress) {
      logger.warn('SBT_CONTRACT_ADDRESS not configured - SBT features will be limited');
    }

    // Initialize provider and signer
    this.provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
    );

    const privateKey = process.env.SBT_SIGNER_PRIVATE_KEY;
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    } else {
      logger.warn('SBT_SIGNER_PRIVATE_KEY not configured - SBT minting will not work');
      this.signer = ethers.Wallet.createRandom(); // Fallback for development
    }

    this.initializeContract();
  }

  private async initializeContract(): Promise<void> {
    if (!this.contractAddress) return;

    try {
      // ERC-5192 SBT contract ABI (simplified)
      const abi = [
        'function mint(address to, uint256 tokenId, string memory tokenURI) external',
        'function burn(uint256 tokenId) external',
        'function locked(uint256 tokenId) external view returns (bool)',
        'function ownerOf(uint256 tokenId) external view returns (address)',
        'function tokenURI(uint256 tokenId) external view returns (string)',
        'function balanceOf(address owner) external view returns (uint256)',
        'function totalSupply() external view returns (uint256)',
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
        'event Locked(uint256 indexed tokenId)',
        'event Unlocked(uint256 indexed tokenId)',
      ];

      this.contract = new ethers.Contract(this.contractAddress, abi, this.signer);
      logger.info('SBT contract initialized:', this.contractAddress);
    } catch (error) {
      logger.error('Failed to initialize SBT contract:', error);
    }
  }

  /**
   * Mint a new SBT badge
   */
  async mintSBT(request: SBTMintRequest): Promise<{
    success: boolean;
    tokenId: string;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      if (!this.contract) {
        throw new Error('SBT contract not initialized');
      }

      logger.info('Minting SBT:', {
        recipient: request.recipient,
        tokenId: request.tokenId,
        missionType: request.missionType,
        impactScore: request.impactScore,
      });

      // Upload metadata to IPFS or centralized storage
      const tokenURI = await this.uploadMetadata(request.metadata);

      // Mint the SBT
      const tx = await this.contract.mint(
        request.recipient,
        ethers.BigNumber.from(request.tokenId),
        tokenURI
      );

      const receipt = await tx.wait();

      logger.info('SBT minted successfully:', {
        tokenId: request.tokenId,
        transactionHash: receipt.transactionHash,
      });

      return {
        success: true,
        tokenId: request.tokenId,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      logger.error('Failed to mint SBT:', error);
      return {
        success: false,
        tokenId: request.tokenId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Burn an SBT (admin only, for exceptional cases)
   */
  async burnSBT(tokenId: string): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      if (!this.contract) {
        throw new Error('SBT contract not initialized');
      }

      logger.info('Burning SBT:', { tokenId });

      const tx = await this.contract.burn(ethers.BigNumber.from(tokenId));
      const receipt = await tx.wait();

      logger.info('SBT burned successfully:', {
        tokenId,
        transactionHash: receipt.transactionHash,
      });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      logger.error('Failed to burn SBT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get SBT metadata
   */
  async getSBTMetadata(tokenId: string): Promise<SBTMetadata | null> {
    try {
      if (!this.contract) {
        throw new Error('SBT contract not initialized');
      }

      const tokenURI = await this.contract.tokenURI(ethers.BigNumber.from(tokenId));

      // Fetch metadata from URI
      const metadata = await this.fetchMetadata(tokenURI);
      return metadata;
    } catch (error) {
      logger.error('Failed to get SBT metadata:', error);
      return null;
    }
  }

  /**
   * Check if SBT is locked (ERC-5192 requirement)
   */
  async isSBTLocked(tokenId: string): Promise<boolean> {
    try {
      if (!this.contract) {
        return true; // Default to locked if contract not available
      }

      const locked = await this.contract.locked(ethers.BigNumber.from(tokenId));
      return locked;
    } catch (error) {
      logger.error('Failed to check SBT lock status:', error);
      return true; // Default to locked
    }
  }

  /**
   * Get SBT owner
   */
  async getSBTOwner(tokenId: string): Promise<string | null> {
    try {
      if (!this.contract) {
        throw new Error('SBT contract not initialized');
      }

      const owner = await this.contract.ownerOf(ethers.BigNumber.from(tokenId));
      return owner;
    } catch (error) {
      logger.error('Failed to get SBT owner:', error);
      return null;
    }
  }

  /**
   * Get user's SBT balance
   */
  async getSBTBalance(address: string): Promise<number> {
    try {
      if (!this.contract) {
        return 0;
      }

      const balance = await this.contract.balanceOf(address);
      return balance.toNumber();
    } catch (error) {
      logger.error('Failed to get SBT balance:', error);
      return 0;
    }
  }

  /**
   * Get all SBTs owned by an address
   */
  async getOwnedSBTs(address: string): Promise<SBTToken[]> {
    try {
      if (!this.contract) {
        return [];
      }

      const balance = await this.getSBTBalance(address);
      const ownedSBTs: SBTToken[] = [];

      // This is inefficient for production - consider using events or indexing service
      for (let i = 0; i < balance; i++) {
        // Note: This is a simplified implementation
        // In production, you'd need to track token IDs per user
        const tokenId = i.toString(); // Placeholder
        const metadata = await this.getSBTMetadata(tokenId);

        if (metadata) {
          ownedSBTs.push({
            tokenId,
            owner: address,
            metadata,
            mintedAt: new Date(), // Would need to track this separately
            missionType: metadata.attributes.find(attr => attr.trait_type === 'Mission Type')?.value as string || 'unknown',
            impactScore: metadata.attributes.find(attr => attr.trait_type === 'Impact Score')?.value as number || 0,
          });
        }
      }

      return ownedSBTs;
    } catch (error) {
      logger.error('Failed to get owned SBTs:', error);
      return [];
    }
  }

  /**
   * Generate SBT metadata based on mission completion
   */
  generateSBTMetadata(
    missionType: 'carbon_offset' | 'donation' | 'petition',
    impactScore: number,
    missionTitle: string,
    completedAt: Date
  ): SBTMetadata {
    const missionNames = {
      carbon_offset: '탄소 상쇄',
      donation: '기부',
      petition: '청원 참여',
    };

    const missionColors = {
      carbon_offset: '#28a745',
      donation: '#007bff',
      petition: '#ffc107',
    };

    const rarityLevels = [
      { threshold: 10, level: 'Bronze', color: '#cd7f32' },
      { threshold: 25, level: 'Silver', color: '#c0c0c0' },
      { threshold: 50, level: 'Gold', color: '#ffd700' },
      { threshold: 100, level: 'Platinum', color: '#e5e4e2' },
      { threshold: 500, level: 'Diamond', color: '#b9f2ff' },
    ];

    const rarity = rarityLevels.find(level => impactScore <= level.threshold) || rarityLevels[rarityLevels.length - 1];

    return {
      name: `${missionNames[missionType]} 배지 - ${rarity.level}`,
      description: `${missionTitle} 미션을 성공적으로 완료하여 ${impactScore} 포인트의 임팩트를 창출했습니다.`,
      image: `https://impact-autopilot.com/badges/${missionType}_${rarity.level.toLowerCase()}.png`,
      attributes: [
        {
          trait_type: 'Mission Type',
          value: missionNames[missionType],
        },
        {
          trait_type: 'Impact Score',
          value: impactScore,
          display_type: 'number',
        },
        {
          trait_type: 'Rarity',
          value: rarity.level,
        },
        {
          trait_type: 'Color',
          value: missionColors[missionType],
        },
        {
          trait_type: 'Completed At',
          value: completedAt.toISOString(),
        },
      ],
      external_url: 'https://impact-autopilot.com/badges',
    };
  }

  /**
   * Upload metadata to IPFS or storage
   */
  private async uploadMetadata(metadata: SBTMetadata): Promise<string> {
    try {
      // In production, upload to IPFS (Pinata, Infura, etc.)
      // For now, return a mock IPFS hash
      const mockIPFSHash = `ipfs://Qm${ethers.utils.randomBytes(32).toString('hex')}`;
      logger.info('Mock metadata upload:', mockIPFSHash);
      return mockIPFSHash;
    } catch (error) {
      logger.error('Failed to upload metadata:', error);
      throw new Error('메타데이터 업로드에 실패했습니다');
    }
  }

  /**
   * Fetch metadata from URI
   */
  private async fetchMetadata(tokenURI: string): Promise<SBTMetadata | null> {
    try {
      // In production, fetch from IPFS or HTTP URL
      // For now, return mock metadata
      return {
        name: 'Sample Impact Badge',
        description: 'A badge earned through environmental impact',
        image: 'https://impact-autopilot.com/badges/sample.png',
        attributes: [
          { trait_type: 'Mission Type', value: 'Carbon Offset' },
          { trait_type: 'Impact Score', value: 25 },
        ],
      };
    } catch (error) {
      logger.error('Failed to fetch metadata:', error);
      return null;
    }
  }

  /**
   * Get total SBT supply
   */
  async getTotalSupply(): Promise<number> {
    try {
      if (!this.contract) {
        return 0;
      }

      const totalSupply = await this.contract.totalSupply();
      return totalSupply.toNumber();
    } catch (error) {
      logger.error('Failed to get total supply:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const sbtService = new SBTService();
export default sbtService;
