import { ethers } from 'ethers';
import { logger } from '../utils/logger';

export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

export interface AccountAbstractionConfig {
  entryPointAddress: string;
  accountFactoryAddress: string;
  paymasterAddress?: string;
  bundlerUrl?: string;
}

export class AccountAbstractionService {
  private provider: ethers.providers.JsonRpcProvider;
  private entryPointAddress: string;
  private accountFactoryAddress: string;
  private paymasterAddress?: string;
  private bundlerUrl?: string;

  constructor(config: AccountAbstractionConfig) {
    this.entryPointAddress = config.entryPointAddress;
    this.accountFactoryAddress = config.accountFactoryAddress;
    this.paymasterAddress = config.paymasterAddress;
    this.bundlerUrl = config.bundlerUrl;

    // Initialize provider (Polygon mainnet)
    this.provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
    );
  }

  /**
   * Create a new smart account for user
   */
  async createAccount(ownerAddress: string, salt: string = '0'): Promise<{
    accountAddress: string;
    initCode: string;
  }> {
    try {
      logger.info('Creating smart account:', { ownerAddress, salt });

      // Calculate account address using CREATE2
      const initCode = this.getInitCode(ownerAddress, salt);
      const accountAddress = await this.getAccountAddress(ownerAddress, salt);

      logger.info('Smart account created:', { accountAddress, initCode });

      return {
        accountAddress,
        initCode,
      };
    } catch (error) {
      logger.error('Failed to create smart account:', error);
      throw new Error('스마트 계정 생성에 실패했습니다');
    }
  }

  /**
   * Get account address without deploying
   */
  async getAccountAddress(ownerAddress: string, salt: string = '0'): Promise<string> {
    try {
      // This would typically use the AccountFactory contract's getAddress method
      // For now, we'll use a deterministic address calculation
      const initCode = this.getInitCode(ownerAddress, salt);

      const codeHash = ethers.utils.keccak256(initCode);
      const saltBytes = ethers.utils.hexZeroPad(ethers.BigNumber.from(salt).toHexString(), 32);

      const address = ethers.utils.getCreate2Address(
        this.accountFactoryAddress,
        saltBytes,
        codeHash
      );

      return address;
    } catch (error) {
      logger.error('Failed to get account address:', error);
      throw new Error('계정 주소 계산에 실패했습니다');
    }
  }

  /**
   * Create UserOperation for transaction
   */
  async createUserOperation(
    sender: string,
    to: string,
    value: string,
    data: string,
    nonce?: string
  ): Promise<UserOperation> {
    try {
      const userOp: UserOperation = {
        sender,
        nonce: nonce || '0x0',
        initCode: '0x',
        callData: this.encodeCallData(to, value, data),
        callGasLimit: ethers.utils.hexlify(100000), // 100k gas
        verificationGasLimit: ethers.utils.hexlify(50000), // 50k gas
        preVerificationGas: ethers.utils.hexlify(21000), // 21k gas
        maxFeePerGas: ethers.utils.hexlify(ethers.utils.parseUnits('50', 'gwei')), // 50 gwei
        maxPriorityFeePerGas: ethers.utils.hexlify(ethers.utils.parseUnits('2', 'gwei')), // 2 gwei
        paymasterAndData: this.paymasterAddress ? this.getPaymasterData() : '0x',
        signature: '0x',
      };

      return userOp;
    } catch (error) {
      logger.error('Failed to create UserOperation:', error);
      throw new Error('UserOperation 생성에 실패했습니다');
    }
  }

  /**
   * Sign UserOperation
   */
  async signUserOperation(
    userOp: UserOperation,
    signer: ethers.Wallet
  ): Promise<string> {
    try {
      const userOpHash = this.getUserOpHash(userOp);
      const signature = await signer.signMessage(ethers.utils.arrayify(userOpHash));

      return signature;
    } catch (error) {
      logger.error('Failed to sign UserOperation:', error);
      throw new Error('UserOperation 서명에 실패했습니다');
    }
  }

  /**
   * Submit UserOperation to bundler
   */
  async submitUserOperation(userOp: UserOperation): Promise<{
    userOpHash: string;
    txHash?: string;
  }> {
    try {
      logger.info('Submitting UserOperation:', { sender: userOp.sender });

      if (this.bundlerUrl) {
        // Use external bundler (e.g., Pimlico, Alchemy, etc.)
        const response = await fetch(`${this.bundlerUrl}/rpc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_sendUserOperation',
            params: [userOp, this.entryPointAddress],
          }),
        });

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error.message);
        }

        return {
          userOpHash: result.result,
        };
      } else {
        // Fallback: direct submission (not recommended for production)
        logger.warn('No bundler configured, using direct submission');
        throw new Error('Bundler not configured');
      }
    } catch (error) {
      logger.error('Failed to submit UserOperation:', error);
      throw new Error('UserOperation 제출에 실패했습니다');
    }
  }

  /**
   * Estimate gas for UserOperation
   */
  async estimateUserOperationGas(userOp: Partial<UserOperation>): Promise<{
    callGasLimit: string;
    verificationGasLimit: string;
    preVerificationGas: string;
  }> {
    try {
      // This would typically call the bundler's estimateUserOperationGas method
      // For now, return conservative estimates
      return {
        callGasLimit: ethers.utils.hexlify(100000),
        verificationGasLimit: ethers.utils.hexlify(50000),
        preVerificationGas: ethers.utils.hexlify(21000),
      };
    } catch (error) {
      logger.error('Failed to estimate gas:', error);
      throw new Error('가스 추정에 실패했습니다');
    }
  }

  /**
   * Get paymaster data for gas sponsorship
   */
  private getPaymasterData(): string {
    if (!this.paymasterAddress) return '0x';

    // This would encode paymaster-specific data
    // For example, signature for gas sponsorship
    return this.paymasterAddress + '00'.repeat(64); // Placeholder
  }

  /**
   * Get init code for account creation
   */
  private getInitCode(ownerAddress: string, salt: string): string {
    // This would encode the AccountFactory call to create an account
    // For now, return a placeholder
    return '0x';
  }

  /**
   * Encode call data for the user operation
   */
  private encodeCallData(to: string, value: string, data: string): string {
    try {
      return ethers.utils.defaultAbiCoder.encode(
        ['address', 'uint256', 'bytes'],
        [to, value, data]
      );
    } catch (error) {
      logger.error('Failed to encode call data:', error);
      throw new Error('Call data 인코딩에 실패했습니다');
    }
  }

  /**
   * Get UserOperation hash for signing
   */
  private getUserOpHash(userOp: UserOperation): string {
    try {
      const encodedData = ethers.utils.defaultAbiCoder.encode(
        [
          'address', 'uint256', 'bytes32', 'bytes32', 'uint256',
          'uint256', 'uint256', 'uint256', 'uint256', 'bytes32'
        ],
        [
          userOp.sender,
          userOp.nonce,
          ethers.utils.keccak256(userOp.initCode),
          ethers.utils.keccak256(userOp.callData),
          userOp.callGasLimit,
          userOp.verificationGasLimit,
          userOp.preVerificationGas,
          userOp.maxFeePerGas,
          userOp.maxPriorityFeePerGas,
          ethers.utils.keccak256(userOp.paymasterAndData),
        ]
      );

      return ethers.utils.keccak256(encodedData);
    } catch (error) {
      logger.error('Failed to get UserOp hash:', error);
      throw new Error('UserOperation 해시 생성에 실패했습니다');
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountAddress: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(accountAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      logger.error('Failed to get account balance:', error);
      throw new Error('계정 잔액 조회에 실패했습니다');
    }
  }

  /**
   * Check if account is deployed
   */
  async isAccountDeployed(accountAddress: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(accountAddress);
      return code !== '0x';
    } catch (error) {
      logger.error('Failed to check account deployment:', error);
      return false;
    }
  }
}

// Export singleton instance
export const accountAbstractionService = new AccountAbstractionService({
  entryPointAddress: process.env.ENTRY_POINT_ADDRESS || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  accountFactoryAddress: process.env.ACCOUNT_FACTORY_ADDRESS || '',
  paymasterAddress: process.env.PAYMASTER_ADDRESS,
  bundlerUrl: process.env.BUNDLER_URL,
});

export default accountAbstractionService;
