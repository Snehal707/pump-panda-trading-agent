import { ethers } from 'ethers';
import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils/Logger';

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMin: string;
  recipient: string;
  deadline: number;
}

export class BlockchainManager {
  private config: ConfigManager;
  private logger: Logger;
  private provider!: ethers.JsonRpcProvider;
  private wallet!: ethers.Wallet;
  private isInitialized: boolean = false;

  // Sepolia testnet configuration
  private readonly SEPOLIA_RPC = 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID';
  private readonly UNISWAP_V3_FACTORY = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c';
  private readonly WETH_ADDRESS = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14';

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger();
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing blockchain manager...');
      
      // Check if we have a valid RPC URL
      const privateKey = this.config.getPrivateKey();
      if (!privateKey) {
        throw new Error('Private key not configured');
      }

      // For testing purposes, use mock mode if RPC URL is not properly configured
      if (this.SEPOLIA_RPC.includes('YOUR_INFURA_PROJECT_ID')) {
        this.logger.info('Using mock/offline mode for testing');
        this.wallet = new ethers.Wallet(privateKey);
        this.isInitialized = true;
        this.logger.info(`Mock wallet address: ${this.wallet.address}`);
        this.logger.info('Blockchain manager initialized in mock mode');
        return;
      }
      
      // Initialize provider for real network
      this.provider = new ethers.JsonRpcProvider(this.SEPOLIA_RPC);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Check wallet balance
      const balance = await this.provider.getBalance(this.wallet.address);
      this.logger.info(`Wallet address: ${this.wallet.address}`);
      this.logger.info(`Wallet balance: ${ethers.formatEther(balance)} ETH`);
      
      this.isInitialized = true;
      this.logger.info('Blockchain manager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain manager:', error);
      throw error;
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    if (!this.isInitialized) {
      throw new Error('Blockchain manager not initialized');
    }

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function symbol() view returns (string)',
          'function name() view returns (string)',
          'function decimals() view returns (uint8)',
          'function totalSupply() view returns (uint256)'
        ],
        this.wallet
      );

      const [symbol, name, decimals, totalSupply] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals(),
        tokenContract.totalSupply()
      ]);

      return {
        address: tokenAddress,
        symbol,
        name,
        decimals,
        totalSupply: totalSupply.toString()
      };
    } catch (error) {
      this.logger.error(`Failed to get token info for ${tokenAddress}:`, error);
      throw error;
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress?: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Blockchain manager not initialized');
    }

    try {
      const address = walletAddress || this.wallet.address;
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        this.wallet
      );

      const balance = await tokenContract.balanceOf(address);
      return balance.toString();
    } catch (error) {
      this.logger.error(`Failed to get token balance for ${tokenAddress}:`, error);
      throw error;
    }
  }

  async swapTokens(swapParams: SwapParams): Promise<ethers.ContractTransactionResponse> {
    if (!this.isInitialized) {
      throw new Error('Blockchain manager not initialized');
    }

    try {
      // This is a simplified swap implementation
      // In production, you'd use Uniswap SDK for proper swap execution
      this.logger.info('Executing token swap...', swapParams);
      
      // For now, we'll create a mock transaction
      // In real implementation, you'd interact with Uniswap router
      const mockTx = {
        hash: ethers.keccak256(ethers.randomBytes(32)),
        to: this.UNISWAP_V3_FACTORY,
        from: this.wallet.address,
        data: '0x',
        value: ethers.parseEther('0'),
        gasLimit: ethers.parseUnits('300000', 'wei'),
        gasPrice: await this.provider.getFeeData().then(fee => fee.gasPrice || ethers.parseUnits('20', 'gwei'))
      } as ethers.ContractTransactionResponse;

      this.logger.info('Token swap transaction created', { hash: mockTx.hash });
      return mockTx;
    } catch (error) {
      this.logger.error('Failed to execute token swap:', error);
      throw error;
    }
  }

  async getGasPrice(): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Blockchain manager not initialized');
    }

    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice?.toString() || '0';
    } catch (error) {
      this.logger.error('Failed to get gas price:', error);
      throw error;
    }
  }

  async estimateGas(transaction: any): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Blockchain manager not initialized');
    }

    try {
      const gasEstimate = await this.provider.estimateGas(transaction);
      return gasEstimate.toString();
    } catch (error) {
      this.logger.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  getWalletAddress(): string {
    if (!this.isInitialized) {
      throw new Error('Blockchain manager not initialized');
    }
    return this.wallet.address;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
