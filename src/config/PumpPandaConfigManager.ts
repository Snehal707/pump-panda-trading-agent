import * as fs from 'fs';
import * as path from 'path';

export interface PumpPandaConfig {
  name: string;
  version: string;
  description: string;
  blockchains: {
    [chain: string]: {
      enabled: boolean;
      network: string;
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
      preferredDex: string;
      maxSlippage: number;
      maxTradeSize: string;
    };
  };
  trading: {
    enabled: boolean;
    tradingInterval: number;
    maxPositionSize: number;
    maxDailyLoss: number;
    maxDrawdown: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
    maxOpenPositions: number;
    preferredTokens: string[];
    minLiquidity: string;
    maxSlippage: number;
    autoRebalance: boolean;
    crossChainArbitrage: boolean;
  };
  dex: {
    preferences: {
      [chain: string]: string[];
    };
    feeTiers: number[];
    defaultFeeTier: number;
  };
  memeTokenHunting: {
    enabled: boolean;
    scanInterval: number;
    minMarketCap: string;
    minLiquidity: string;
    maxHoldings: number;
    autoBuy: boolean;
    autoSell: boolean;
    trendingTokens: string[];
    blacklistedTokens: string[];
    whitelistedTokens: string[];
  };
  risk: {
    maxExposurePerToken: number;
    maxExposurePerChain: number;
    maxExposurePerDex: number;
    emergencyStopLoss: number;
    circuitBreaker: boolean;
    maxGasPrice: string;
  };
  monitoring: {
    portfolioUpdateInterval: number;
    priceUpdateInterval: number;
    performanceReportInterval: number;
    alertThresholds: {
      profit: number;
      loss: number;
      gasSpent: string;
    };
  };
  notifications: {
    enabled: boolean;
    telegram?: {
      botToken: string;
      chatId: string;
    };
    discord?: {
      webhookUrl: string;
    };
    email?: {
      smtp: string;
      port: number;
      username: string;
      password: string;
    };
  };
  logging: {
    level: string;
    file: boolean;
    console: boolean;
    maxFiles: number;
    maxSize: string;
  };
}

export class PumpPandaConfigManager {
  private config: PumpPandaConfig;
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), 'config', 'pump-panda-config.json');
    this.config = this.getDefaultConfig();
  }

  async load(): Promise<void> {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = { ...this.getDefaultConfig(), ...JSON.parse(configData) };
        console.log(`Configuration loaded from ${this.configPath}`);
      } else {
        console.warn(`Configuration file not found at ${this.configPath}, using defaults`);
        await this.createDefaultConfig();
      }
      
      // Override with environment variables
      this.loadFromEnvironment();
      
    } catch (error) {
      console.warn('Failed to load config file, using defaults:', error);
    }
  }

  private getDefaultConfig(): PumpPandaConfig {
    return {
      name: "PumpPanda",
      version: "1.0.0",
      description: "Multi-blockchain meme token trading bot",
      blockchains: {
        ethereum: {
          enabled: true,
          network: "mainnet",
          rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID",
          privateKey: "YOUR_PRIVATE_KEY_HERE",
          gasLimit: 300000,
          gasPrice: "20000000000",
          nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18
          },
          blockExplorer: "https://etherscan.io",
          preferredDex: "uniswapV3",
          maxSlippage: 0.5,
          maxTradeSize: "1000000000000000000000"
        }
      },
      trading: {
        enabled: true,
        tradingInterval: 30000,
        maxPositionSize: 1000,
        maxDailyLoss: 100,
        maxDrawdown: 0.05,
        stopLossPercentage: 0.02,
        takeProfitPercentage: 0.04,
        maxOpenPositions: 5,
        preferredTokens: ["PEPE", "SHIB", "DOGE", "BALD", "TOSHI", "SAFEMOON", "BABYDOGE"],
        minLiquidity: "1000000000000000000000",
        maxSlippage: 2.0,
        autoRebalance: true,
        crossChainArbitrage: false
      },
      dex: {
        preferences: {
          ethereum: ["uniswapV3", "sushiswap"],
          base: ["baseswap", "uniswapV3"],
          bsc: ["pancakeswapV3", "biswap"],
          polygon: ["quickswap", "uniswapV3"]
        },
        feeTiers: [500, 1000, 2500, 3000, 10000],
        defaultFeeTier: 3000
      },
      memeTokenHunting: {
        enabled: true,
        scanInterval: 60000,
        minMarketCap: "1000000",
        minLiquidity: "500000",
        maxHoldings: 10,
        autoBuy: false,
        autoSell: false,
        trendingTokens: ["PEPE", "SHIB", "DOGE", "FLOKI", "BALD", "TOSHI", "SAFEMOON", "BABYDOGE"],
        blacklistedTokens: [],
        whitelistedTokens: []
      },
      risk: {
        maxExposurePerToken: 0.1,
        maxExposurePerChain: 0.3,
        maxExposurePerDex: 0.2,
        emergencyStopLoss: 0.15,
        circuitBreaker: true,
        maxGasPrice: "50000000000"
      },
      monitoring: {
        portfolioUpdateInterval: 10000,
        priceUpdateInterval: 5000,
        performanceReportInterval: 300000,
        alertThresholds: {
          profit: 0.05,
          loss: 0.02,
          gasSpent: "100000000000000000000"
        }
      },
      notifications: {
        enabled: false
      },
      logging: {
        level: "info",
        file: true,
        console: true,
        maxFiles: 10,
        maxSize: "10m"
      }
    };
  }

  private async createDefaultConfig(): Promise<void> {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log(`Default configuration created at ${this.configPath}`);
    } catch (error) {
      console.error('Failed to create default config file:', error);
    }
  }

  private loadFromEnvironment(): void {
    // Load blockchain private keys from environment variables if available
    Object.keys(this.config.blockchains).forEach(chain => {
      const envKey = `${chain.toUpperCase()}_PRIVATE_KEY`;
      if (process.env[envKey]) {
        this.config.blockchains[chain].privateKey = process.env[envKey]!;
      }
    });

    // Load Infura project ID if available
    if (process.env.INFURA_PROJECT_ID) {
      Object.keys(this.config.blockchains).forEach(chain => {
        if (this.config.blockchains[chain].rpcUrl.includes('infura.io')) {
          this.config.blockchains[chain].rpcUrl = this.config.blockchains[chain].rpcUrl.replace(
            'YOUR_INFURA_PROJECT_ID',
            process.env.INFURA_PROJECT_ID!
          );
        }
      });
    }
  }

  // Getter methods for configuration values
  getTradingInterval(): number {
    return this.config.trading.tradingInterval;
  }

  getPerformanceMonitoringInterval(): number {
    return this.config.monitoring.performanceReportInterval;
  }

  getBlockchainConfig(chain: string) {
    return this.config.blockchains[chain];
  }

  getEnabledBlockchains(): string[] {
    return Object.keys(this.config.blockchains).filter(
      chain => this.config.blockchains[chain].enabled
    );
  }

  getTradingConfig() {
    return this.config.trading;
  }

  getRiskConfig() {
    return this.config.risk;
  }

  getDexConfig() {
    return this.config.dex;
  }

  getMemeTokenHuntingConfig() {
    return this.config.memeTokenHunting;
  }

  getMonitoringConfig() {
    return this.config.monitoring;
  }

  getLoggingConfig() {
    return this.config.logging;
  }

  getFullConfig(): PumpPandaConfig {
    return this.config;
  }

  // Blockchain-specific methods
  getPrivateKey(): string | undefined {
    // Return the first available private key from enabled blockchains
    const enabledChains = this.getEnabledBlockchains();
    if (enabledChains.length > 0) {
      return this.config.blockchains[enabledChains[0]].privateKey;
    }
    return undefined;
  }

  getPrivateKeyForChain(chain: string): string | undefined {
    if (this.config.blockchains[chain]) {
      return this.config.blockchains[chain].privateKey;
    }
    return undefined;
  }

  getRpcUrlForChain(chain: string): string | undefined {
    if (this.config.blockchains[chain]) {
      return this.config.blockchains[chain].rpcUrl;
    }
    return undefined;
  }

  // Compatibility methods for MarketDataManager
  getUpdateInterval(): number {
    return this.config.monitoring.priceUpdateInterval;
  }

  getSymbols(): string[] {
    return this.config.trading.preferredTokens;
  }

  // Update configuration
  updateConfig(updates: Partial<PumpPandaConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Save configuration to file
  async save(): Promise<void> {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  }

  // Compatibility methods for existing components
  getDataSources(): string[] {
    return ['binance', 'coinbase', 'yahoo']; // Default data sources
  }

  getMaxPositionSize(): number {
    return this.config.risk.maxExposurePerToken || 10000;
  }

  getMaxDailyLoss(): number {
    return this.config.risk.maxExposurePerChain || 1000;
  }

  getMaxDrawdown(): number {
    return 0.05; // Default 5% max drawdown
  }

  getStopLossPercentage(): number {
    return 0.02; // Default 2% stop loss
  }

  getTakeProfitPercentage(): number {
    return 0.04; // Default 4% take profit
  }

  getMaxOpenPositions(): number {
    return 5; // Default max open positions
  }

  getMaxMemorySize(): number {
    return 1000000; // Default 1M records
  }

  getMemoryRetentionDays(): number {
    return 30; // Default 30 days
  }

  getDatabaseConfig(): any {
    return {
      host: 'localhost',
      port: 5432,
      name: 'pump_panda',
      username: 'user',
      password: 'password'
    };
  }

  getApiKeys(): { [key: string]: string } {
    return {}; // No API keys in current config
  }

  getBlockchainNetwork(): 'mainnet' | 'sepolia' | 'goerli' {
    return 'sepolia'; // Default to sepolia
  }

  getRpcUrl(): string {
    const ethereum = this.config.blockchains.ethereum;
    return ethereum ? ethereum.rpcUrl : '';
  }
}
