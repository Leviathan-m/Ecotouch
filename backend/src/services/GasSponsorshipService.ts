import axios, { AxiosInstance } from 'axios';
import { ethers } from 'ethers';
import { logger } from '../utils/logger';

export interface GasSponsorshipRequest {
  userOp: any; // ERC-4337 UserOperation
  entryPoint: string;
  chainId: number;
}

export interface GasSponsorshipResponse {
  paymasterAndData: string;
  preVerificationGas?: string;
  verificationGasLimit?: string;
  callGasLimit?: string;
}

export class GasSponsorshipService {
  private client: AxiosInstance;
  private provider: ethers.providers.JsonRpcProvider;
  private serviceType: 'cloudflare' | 'infura' | 'pimlico' | 'alchemy';

  constructor() {
    this.serviceType = (process.env.GAS_SPONSORSHIP_SERVICE || 'pimlico') as any;

    // Initialize HTTP client for paymaster services
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize provider for gas estimation
    this.provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
    );
  }

  /**
   * Request gas sponsorship for a UserOperation
   */
  async sponsorGas(request: GasSponsorshipRequest): Promise<GasSponsorshipResponse> {
    try {
      logger.info('Requesting gas sponsorship:', {
        service: this.serviceType,
        chainId: request.chainId,
      });

      switch (this.serviceType) {
        case 'pimlico':
          return await this.sponsorWithPimlico(request);
        case 'alchemy':
          return await this.sponsorWithAlchemy(request);
        case 'cloudflare':
          return await this.sponsorWithCloudflare(request);
        case 'infura':
          return await this.sponsorWithInfura(request);
        default:
          throw new Error(`Unsupported gas sponsorship service: ${this.serviceType}`);
      }
    } catch (error) {
      logger.error('Gas sponsorship failed:', error);
      throw new Error('가스 스폰서십 요청에 실패했습니다');
    }
  }

  /**
   * Pimlico Paymaster sponsorship
   */
  private async sponsorWithPimlico(request: GasSponsorshipRequest): Promise<GasSponsorshipResponse> {
    const apiKey = process.env.PIMLICO_API_KEY;
    if (!apiKey) {
      throw new Error('PIMLICO_API_KEY not configured');
    }

    const baseURL = `https://api.pimlico.io/v2/${request.chainId}/rpc?apikey=${apiKey}`;

    try {
      const response = await this.client.post(baseURL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_sponsorUserOperation',
        params: [request.userOp, request.entryPoint],
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      const result = response.data.result;

      return {
        paymasterAndData: result.paymasterAndData,
        preVerificationGas: result.preVerificationGas,
        verificationGasLimit: result.verificationGasLimit,
        callGasLimit: result.callGasLimit,
      };
    } catch (error) {
      logger.error('Pimlico sponsorship failed:', error);
      throw error;
    }
  }

  /**
   * Alchemy Paymaster sponsorship
   */
  private async sponsorWithAlchemy(request: GasSponsorshipRequest): Promise<GasSponsorshipResponse> {
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      throw new Error('ALCHEMY_API_KEY not configured');
    }

    const baseURL = `https://eth-${this.getNetworkName(request.chainId)}.g.alchemy.com/v2/${apiKey}`;

    try {
      const response = await this.client.post(baseURL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_requestPaymasterAndData',
        params: [{
          policyId: process.env.ALCHEMY_POLICY_ID || '',
          entryPoint: request.entryPoint,
          userOp: request.userOp,
        }],
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return {
        paymasterAndData: response.data.result.paymasterAndData,
      };
    } catch (error) {
      logger.error('Alchemy sponsorship failed:', error);
      throw error;
    }
  }

  /**
   * Cloudflare Paymaster sponsorship
   */
  private async sponsorWithCloudflare(request: GasSponsorshipRequest): Promise<GasSponsorshipResponse> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error('Cloudflare credentials not configured');
    }

    const baseURL = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/paymaster`;

    try {
      const response = await this.client.post(baseURL, {
        userOp: request.userOp,
        entryPoint: request.entryPoint,
      }, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
      });

      return {
        paymasterAndData: response.data.paymasterAndData,
      };
    } catch (error) {
      logger.error('Cloudflare sponsorship failed:', error);
      throw error;
    }
  }

  /**
   * Infura Sponsored Transactions
   */
  private async sponsorWithInfura(request: GasSponsorshipRequest): Promise<GasSponsorshipResponse> {
    const projectId = process.env.INFURA_PROJECT_ID;
    if (!projectId) {
      throw new Error('INFURA_PROJECT_ID not configured');
    }

    const baseURL = `https://polygon-mainnet.infura.io/v3/${projectId}`;

    try {
      // For Infura, we need to use their sponsored transaction endpoint
      const response = await this.client.post(baseURL, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendRawTransaction',
        params: [{
          userOp: request.userOp,
          sponsored: true,
        }],
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return {
        paymasterAndData: '0x', // Infura handles sponsorship internally
      };
    } catch (error) {
      logger.error('Infura sponsorship failed:', error);
      throw error;
    }
  }

  /**
   * Estimate gas costs without sponsorship
   */
  async estimateGasCosts(userOp: any): Promise<{
    callGasLimit: string;
    verificationGasLimit: string;
    preVerificationGas: string;
    totalGasCost: string;
  }> {
    try {
      // Estimate gas for the UserOperation
      const callGasLimit = await this.provider.estimateGas({
        to: userOp.sender,
        data: userOp.callData,
      });

      // Conservative estimates for other gas components
      const verificationGasLimit = ethers.BigNumber.from('50000');
      const preVerificationGas = ethers.BigNumber.from('21000');

      const totalGas = callGasLimit.add(verificationGasLimit).add(preVerificationGas);

      // Get current gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.maxFeePerGas || ethers.utils.parseUnits('50', 'gwei');

      const totalGasCost = totalGas.mul(gasPrice);

      return {
        callGasLimit: ethers.utils.hexlify(callGasLimit),
        verificationGasLimit: ethers.utils.hexlify(verificationGasLimit),
        preVerificationGas: ethers.utils.hexlify(preVerificationGas),
        totalGasCost: ethers.utils.formatEther(totalGasCost),
      };
    } catch (error) {
      logger.error('Gas estimation failed:', error);
      throw new Error('가스 비용 추정에 실패했습니다');
    }
  }

  /**
   * Check if user is eligible for gas sponsorship
   */
  async checkEligibility(userAddress: string): Promise<{
    eligible: boolean;
    reason?: string;
    remainingSponsorships?: number;
  }> {
    try {
      // Check user's transaction history and sponsorship usage
      // This would typically query a database or external service

      // For now, allow sponsorship for all users with a daily limit
      const dailyLimit = 5; // 5 sponsored transactions per day
      const usedToday = 0; // Would query actual usage

      if (usedToday >= dailyLimit) {
        return {
          eligible: false,
          reason: '일일 스폰서십 한도를 초과했습니다',
          remainingSponsorships: 0,
        };
      }

      return {
        eligible: true,
        remainingSponsorships: dailyLimit - usedToday,
      };
    } catch (error) {
      logger.error('Eligibility check failed:', error);
      return {
        eligible: false,
        reason: '자격 확인에 실패했습니다',
      };
    }
  }

  /**
   * Get network name from chain ID
   */
  private getNetworkName(chainId: number): string {
    const networks: { [key: number]: string } = {
      1: 'mainnet',
      137: 'polygon-mainnet',
      80001: 'polygon-mumbai',
      42161: 'arbitrum-mainnet',
      10: 'optimism-mainnet',
    };

    return networks[chainId] || 'mainnet';
  }

  /**
   * Get sponsorship statistics
   */
  async getSponsorshipStats(): Promise<{
    totalSponsored: number;
    totalGasSaved: string;
    activeUsers: number;
    averageGasPerUser: string;
  }> {
    try {
      // This would typically query a database for sponsorship statistics
      return {
        totalSponsored: 0, // Would be actual count
        totalGasSaved: '0', // Would be actual amount
        activeUsers: 0, // Would be actual count
        averageGasPerUser: '0', // Would be calculated
      };
    } catch (error) {
      logger.error('Failed to get sponsorship stats:', error);
      throw new Error('스폰서십 통계 조회에 실패했습니다');
    }
  }
}

// Export singleton instance
export const gasSponsorshipService = new GasSponsorshipService();
export default gasSponsorshipService;
