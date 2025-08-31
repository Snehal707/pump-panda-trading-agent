import { ethers } from 'ethers';
import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils/Logger';

export interface BlockchainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  privateKey: string;
  gasLimit: number;
  gasPrice: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  blockchain: string;
  isMemeToken: boolean;
  liquidity: string;
  marketCap: string;
}

export interface SwapParams {
  blockchain: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOutMin: string;
  recipient: string;
  deadline: number;
  slippage: number;
}

export class MultiBlockchainManager {
  private config: ConfigManager;
  private logger: Logger;
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();
  private wallets: Map<string, ethers.Wallet> = new Map();
  private isInitialized: boolean = false;

  // Multi-blockchain configuration
  private readonly BLOCKCHAINS: { [key: string]: BlockchainConfig } = {
    ethereum: {
      name: 'Ethereum',
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
      privateKey: '',
      gasLimit: 300000,
      gasPrice: '20000000000',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      blockExplorer: 'https://etherscan.io'
    },
    sepolia: {
      name: 'Sepolia Testnet',
      chainId: 11155111,
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID',
      privateKey: '',
      gasLimit: 300000,
      gasPrice: '20000000000',
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
      blockExplorer: 'https://sepolia.etherscan.io'
    },
    base: {
      name: 'Base',
      chainId: 8453,
      rpcUrl: 'https://mainnet.base.org',
      privateKey: '',
      gasLimit: 300000,
      gasPrice: '1000000000',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      blockExplorer: 'https://basescan.org'
    },
    baseSepolia: {
      name: 'Base Sepolia',
      chainId: 84532,
      rpcUrl: 'https://sepolia.base.org',
      privateKey: '',
      gasLimit: 300000,
      gasPrice: '1000000000',
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
      blockExplorer: 'https://sepolia.basescan.org'
    },
    bsc: {
      name: 'BNB Smart Chain',
      chainId: 56,
      rpcUrl: 'https://bsc-dataseed1.binance.org',
      privateKey: '',
      gasLimit: 300000,
      gasPrice: '5000000000',
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      blockExplorer: 'https://bscscan.com'
    },
    bscTestnet: {
      name: 'BSC Testnet',
      chainId: 97,
      rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      privateKey: '',
      gasLimit: 300000,
      gasPrice: '10000000000',
      nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
      blockExplorer: 'https://testnet.bscscan.com'
    },
    polygon: {
      name: 'Polygon',
      chainId: 137,
      rpcUrl: 'https://polygon-rpc.com',
      privateKey: '',
      gasLimit: 300000,
      gasPrice: '30000000000',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      blockExplorer: 'https://polygonscan.com'
    },
    polygonMumbai: {
      name: 'Polygon Mumbai',
      chainId: 80001,
      rpcUrl: 'https://rpc-mumbai.maticvigil.com',
      privateKey: '',
      gasLimit: 300000,
      gasPrice: '30000000000',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      blockExplorer: 'https://mumbai.polygonscan.com'
    },
    arbitrum: {
      name: 'Arbitrum One',
      chainId: 42161,
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      privateKey: '',
      gasLimit: 300000,
      gasPrice: '100000000',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      blockExplorer: 'https://arbiscan.io'
    },
    optimism: {
      name: 'Optimism',
      chainId: 10,
      rpcUrl: 'https://mainnet.optimism.io',
      privateKey: '',
      gasLimit: 300000,
      gasPrice: '1000000',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      blockExplorer: 'https://optimistic.etherscan.io'
    }
  };

  // Popular meme token addresses by blockchain
  private readonly MEME_TOKENS: { [blockchain: string]: { [symbol: string]: string } } = {
    ethereum: {
      'PEPE': '0x6982508145454Ce325DdEe47F2444e8c8C1d3bC9',
      'SHIB': '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      'DOGE': '0x3832d2F059E55934220881F831bE501D180671A7',
      'FLOKI': '0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a73'
    },
    base: {
      'BALD': '0x27D2DECc4b9aDB5C9e4303B55e9e0bE0DbE1c4D5',
      'TOSHI': '0x4a580160A7c5318AB1560e5e4b4bAfc497a42541'
    },
    bsc: {
      'SAFEMOON': '0x8076C74C5e3F5852037F31Ff0093Eeb8c8ADd8D3',
      'BABYDOGE': '0xc748673057861a797275CD8A068AbB95A902e8de',
      'MOONSHOT': '0x16587CFB64a5d4b2C3A82415C9A48B3312eFaB13'
    },
    polygon: {
      'POLYPEPE': '0x0C51f415cF477fDe56A0Bb3DBCD723eA78B3d9fa',
      'MATICDOGE': '0x4EaC4c4e9050464067D36310Ac2b2b1b5aCd0d1e'
    }
  };

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger();
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('🐼 Initializing PumpPanda Multi-Blockchain Manager...');
      
      // Initialize all configured blockchains
      for (const [chainKey, chainConfig] of Object.entries(this.BLOCKCHAINS)) {
        if (chainConfig.privateKey && chainConfig.privateKey !== '') {
          try {
            await this.initializeBlockchain(chainKey, chainConfig);
            this.logger.info(`✅ ${chainConfig.name} initialized successfully`);
          } catch (error) {
            this.logger.warn(`⚠️ Failed to initialize ${chainConfig.name}:`, error);
          }
        }
      }
      
      this.isInitialized = true;
      this.logger.info('🎉 PumpPanda Multi-Blockchain Manager ready!');
    } catch (error) {
      this.logger.error('❌ Failed to initialize multi-blockchain manager:', error);
      throw error;
    }
  }

  private async initializeBlockchain(chainKey: string, chainConfig: BlockchainConfig): Promise<void> {
    // Initialize provider
    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
    this.providers.set(chainKey, provider);

    // Initialize wallet
    const wallet = new ethers.Wallet(chainConfig.privateKey, provider);
    this.wallets.set(chainKey, wallet);

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    this.logger.info(`💰 ${chainConfig.name} wallet: ${wallet.address}`);
    this.logger.info(`💰 ${chainConfig.name} balance: ${ethers.formatEther(balance)} ${chainConfig.nativeCurrency.symbol}`);
  }

  async getTokenInfo(blockchain: string, tokenAddress: string): Promise<TokenInfo> {
    if (!this.isInitialized) {
      throw new Error('Multi-blockchain manager not initialized');
    }

    const provider = this.providers.get(blockchain);
    const wallet = this.wallets.get(blockchain);

    if (!provider || !wallet) {
      throw new Error(`Blockchain ${blockchain} not initialized`);
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
        wallet
      );

      const [symbol, name, decimals, totalSupply] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals(),
        tokenContract.totalSupply()
      ]);

      // Check if it's a known meme token
      const isMemeToken = this.isMemeToken(blockchain, symbol, tokenAddress);

      return {
        address: tokenAddress,
        symbol,
        name,
        decimals,
        totalSupply: totalSupply.toString(),
        blockchain,
        isMemeToken,
        liquidity: '0', // Would need DEX integration to get real liquidity
        marketCap: '0'  // Would need price feed to calculate market cap
      };
    } catch (error) {
      this.logger.error(`Failed to get token info for ${tokenAddress} on ${blockchain}:`, error);
      throw error;
    }
  }

  async getTokenBalance(blockchain: string, tokenAddress: string, walletAddress?: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Multi-blockchain manager not initialized');
    }

    const provider = this.providers.get(blockchain);
    const wallet = this.wallets.get(blockchain);

    if (!provider || !wallet) {
      throw new Error(`Blockchain ${blockchain} not initialized`);
    }

    try {
      const address = walletAddress || wallet.address;
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        wallet
      );

      const balance = await tokenContract.balanceOf(address);
      return balance.toString();
    } catch (error) {
      this.logger.error(`Failed to get token balance for ${tokenAddress} on ${blockchain}:`, error);
      throw error;
    }
  }

  async getNativeBalance(blockchain: string, walletAddress?: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Multi-blockchain manager not initialized');
    }

    const provider = this.providers.get(blockchain);
    const wallet = this.wallets.get(blockchain);

    if (!provider || !wallet) {
      throw new Error(`Blockchain ${blockchain} not initialized`);
    }

    try {
      const address = walletAddress || wallet.address;
      const balance = await provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      this.logger.error(`Failed to get native balance on ${blockchain}:`, error);
      throw error;
    }
  }

  async estimateGas(blockchain: string, transaction: any): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Multi-blockchain manager not initialized');
    }

    const provider = this.providers.get(blockchain);
    if (!provider) {
      throw new Error(`Blockchain ${blockchain} not initialized`);
    }

    try {
      const gasEstimate = await provider.estimateGas(transaction);
      return gasEstimate.toString();
    } catch (error) {
      this.logger.error(`Failed to estimate gas on ${blockchain}:`, error);
      throw error;
    }
  }

  getSupportedBlockchains(): string[] {
    return Object.keys(this.BLOCKCHAINS);
  }

  getBlockchainConfig(blockchain: string): BlockchainConfig | undefined {
    return this.BLOCKCHAINS[blockchain];
  }

  getMemeTokens(blockchain: string): { [symbol: string]: string } {
    return this.MEME_TOKENS[blockchain] || {};
  }

  getAllMemeTokens(): { [blockchain: string]: { [symbol: string]: string } } {
    return this.MEME_TOKENS;
  }

  getWalletAddress(blockchain: string): string {
    const wallet = this.wallets.get(blockchain);
    if (!wallet) {
      throw new Error(`Blockchain ${blockchain} not initialized`);
    }
    return wallet.address;
  }

  isBlockchainReady(blockchain: string): boolean {
    return this.providers.has(blockchain) && this.wallets.has(blockchain);
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  private isMemeToken(blockchain: string, symbol: string, address: string): boolean {
    const blockchainMemeTokens = this.MEME_TOKENS[blockchain];
    if (!blockchainMemeTokens) return false;
    
    // Check by symbol
    if (blockchainMemeTokens[symbol]) return true;
    
    // Check by address
    return Object.values(blockchainMemeTokens).includes(address);
  }

  // Get trending meme tokens (mock implementation)
  async getTrendingMemeTokens(blockchain: string): Promise<TokenInfo[]> {
    const memeTokens = this.getMemeTokens(blockchain);
    const trending: TokenInfo[] = [];

    for (const [symbol, address] of Object.entries(memeTokens)) {
      try {
        const tokenInfo = await this.getTokenInfo(blockchain, address);
        trending.push(tokenInfo);
      } catch (error) {
        this.logger.warn(`Failed to get info for trending token ${symbol}:`, error);
      }
    }

    return trending;
  }
}
