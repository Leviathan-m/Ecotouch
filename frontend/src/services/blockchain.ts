import { ethers } from 'ethers';
import { ERC4337UserOp } from '../types';

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private accountFactoryAddress: string;
  private impactBadgeSBTAddress: string;

  constructor() {
    this.accountFactoryAddress = process.env.REACT_APP_ACCOUNT_FACTORY_ADDRESS || '';
    this.impactBadgeSBTAddress = process.env.REACT_APP_IMPACT_BADGE_SBT_ADDRESS || '';
    this.initProvider();
  }

  private initProvider() {
    const rpcUrl = process.env.REACT_APP_POLYGON_RPC_URL || 'https://polygon-rpc.com';
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  public async connectWallet(privateKey?: string): Promise<void> {
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider!);
    } else {
      // For browser wallet connection, this would be handled by wagmi/web3modal
      throw new Error('Private key required for server-side wallet connection');
    }
  }

  public getProvider(): ethers.providers.JsonRpcProvider | null {
    return this.provider;
  }

  public getSigner(): ethers.Signer | null {
    return this.signer;
  }

  // ERC-4337 Account Abstraction methods
  public async createUserOp(
    sender: string,
    to: string,
    value: string,
    data: string,
    nonce?: string
  ): Promise<ERC4337UserOp> {
    if (!this.signer) throw new Error('Wallet not connected');

    // This is a simplified UserOp creation
    // In production, you'd use a proper ERC-4337 bundler
    const userOp: ERC4337UserOp = {
      sender,
      nonce: nonce || '0x0',
      initCode: '0x',
      callData: this.encodeCallData(to, value, data),
      callGasLimit: '0x186a0', // 100000
      verificationGasLimit: '0x186a0', // 100000
      preVerificationGas: '0x186a0', // 100000
      maxFeePerGas: '0x59682f00', // 1.5 gwei
      maxPriorityFeePerGas: '0x59682f00', // 1.5 gwei
      paymasterAndData: '0x',
      signature: '0x',
    };

    // Sign the UserOp
    userOp.signature = await this.signUserOp(userOp);

    return userOp;
  }

  private encodeCallData(to: string, value: string, data: string): string {
    // Simplified encoding - in production, use proper ABI encoding
    return ethers.utils.defaultAbiCoder.encode(
      ['address', 'uint256', 'bytes'],
      [to, value, data]
    );
  }

  private async signUserOp(userOp: ERC4337UserOp): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected');

    const userOpHash = this.getUserOpHash(userOp);
    const signature = await this.signer.signMessage(ethers.utils.arrayify(userOpHash));

    return signature;
  }

  private getUserOpHash(userOp: ERC4337UserOp): string {
    // Simplified hash calculation
    const encoded = ethers.utils.defaultAbiCoder.encode(
      [
        'address', 'uint256', 'bytes32', 'bytes32', 'uint256', 'uint256', 'uint256',
        'uint256', 'uint256', 'bytes32'
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

    return ethers.utils.keccak256(encoded);
  }

  // SBT Badge methods
  public async mintSBTBadge(
    userAddress: string,
    missionType: string,
    impact: number
  ): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected');

    // This would call the ImpactBadgeSBT contract's mint function
    // Simplified implementation
    const contract = new ethers.Contract(
      this.impactBadgeSBTAddress,
      [
        'function mint(address to, string memory missionType, uint256 impact) external returns (uint256)'
      ],
      this.signer
    );

    const tx = await contract.mint(userAddress, missionType, impact);
    await tx.wait();

    return tx.hash;
  }

  public async getSBTBalance(address: string): Promise<number> {
    if (!this.provider) throw new Error('Provider not initialized');

    const contract = new ethers.Contract(
      this.impactBadgeSBTAddress,
      ['function balanceOf(address owner) external view returns (uint256)'],
      this.provider
    );

    const balance = await contract.balanceOf(address);
    return balance.toNumber();
  }

  public async getSBTTokenURI(tokenId: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');

    const contract = new ethers.Contract(
      this.impactBadgeSBTAddress,
      ['function tokenURI(uint256 tokenId) external view returns (string)'],
      this.provider
    );

    return await contract.tokenURI(tokenId);
  }

  // Utility methods
  public async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');

    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }

  public async estimateGas(tx: {
    to: string;
    value?: string;
    data?: string;
  }): Promise<string> {
    if (!this.provider) throw new Error('Provider not initialized');

    const gasEstimate = await this.provider.estimateGas(tx);
    return gasEstimate.toString();
  }

  public getChainId(): number {
    return 137; // Polygon mainnet
  }

  public getExplorerUrl(txHash: string): string {
    return `https://polygonscan.com/tx/${txHash}`;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;
