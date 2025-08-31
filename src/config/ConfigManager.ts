import * as fs from 'fs';
import * as path from 'path';

export interface TradingConfig {
  // Trading parameters
  tradingInterval: number; // milliseconds
  maxPositionSize: number;
  maxDailyLoss: number;
  maxDrawdown: number;
  
  // Risk management
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxOpenPositions: number;
  
  // Market data
  symbols: string[];
  dataSources: string[];
  updateInterval: number;
  
  // Performance monitoring
  performanceMonitoringInterval: number;
  reportGenerationInterval: number;
  
  // Memory settings
  maxMemorySize: number;
  memoryRetentionDays: number;
  
  // API settings
  apiKeys: {
    [key: string]: string;
  };
  
  // Database settings
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  };
  
  // Blockchain settings
  blockchain: {
    network: 'mainnet' | 'sepolia' | 'goerli';
    rpcUrl: string;
    privateKey: string;
    gasLimit: number;
    gasPrice: string;
  };
}

export class ConfigManager {
  private config: TradingConfig;
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), 'config', 'trading-config.json');
    this.config = this.getDefaultConfig();
  }

  async load(): Promise<void> {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = { ...this.getDefaultConfig(), ...JSON.parse(configData) };
      } else {
        // Create default config file
        await this.createDefaultConfig();
      }
      
      // Override with environment variables
      this.loadFromEnvironment();
      
    } catch (error) {
      console.warn('Failed to load config file, using defaults:', error);
    }
  }

  private getDefaultConfig(): TradingConfig {
    return {
      tradingInterval: 60000, // 1 minute
      maxPositionSize: 10000,
      maxDailyLoss: 1000,
      maxDrawdown: 0.05, // 5%
      
      stopLossPercentage: 0.02, // 2%
      takeProfitPercentage: 0.04, // 4%
      maxOpenPositions: 5,
      
      symbols: ['BTC/USD', 'ETH/USD', 'AAPL', 'GOOGL', 'TSLA'],
      dataSources: ['binance', 'coinbase', 'yahoo'],
      updateInterval: 5000, // 5 seconds
      
      performanceMonitoringInterval: 300000, // 5 minutes
      reportGenerationInterval: 3600000, // 1 hour
      
      maxMemorySize: 1000000, // 1M records
      memoryRetentionDays: 30,
      
      apiKeys: {},
      
      database: {
        host: 'localhost',
        port: 5432,
        name: 'trading_agent',
        username: 'postgres',
        password: ''
      },
      
      blockchain: {
        network: 'sepolia',
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID',
        privateKey: '',
        gasLimit: 300000,
        gasPrice: '20000000000' // 20 gwei
      }
    };
  }

  private async createDefaultConfig(): Promise<void> {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.warn('Failed to create default config file:', error);
    }
  }

  private loadFromEnvironment(): void {
    // Load API keys from environment
    if (process.env.BINANCE_API_KEY) {
      this.config.apiKeys.binance = process.env.BINANCE_API_KEY;
    }
    if (process.env.COINBASE_API_KEY) {
      this.config.apiKeys.coinbase = process.env.COINBASE_API_KEY;
    }
    if (process.env.ALPACA_API_KEY) {
      this.config.apiKeys.alpaca = process.env.ALPACA_API_KEY;
    }
    
    // Load database settings
    if (process.env.DB_HOST) {
      this.config.database.host = process.env.DB_HOST;
    }
    if (process.env.DB_PORT) {
      this.config.database.port = parseInt(process.env.DB_PORT);
    }
    if (process.env.DB_NAME) {
      this.config.database.name = process.env.DB_NAME;
    }
    if (process.env.DB_USERNAME) {
      this.config.database.username = process.env.DB_USERNAME;
    }
    if (process.env.DB_PASSWORD) {
      this.config.database.password = process.env.DB_PASSWORD;
    }
    
    // Load trading parameters
    if (process.env.TRADING_INTERVAL) {
      this.config.tradingInterval = parseInt(process.env.TRADING_INTERVAL);
    }
    if (process.env.MAX_POSITION_SIZE) {
      this.config.maxPositionSize = parseFloat(process.env.MAX_POSITION_SIZE);
    }
    if (process.env.MAX_DAILY_LOSS) {
      this.config.maxDailyLoss = parseFloat(process.env.MAX_DAILY_LOSS);
    }
  }

  getTradingInterval(): number {
    return this.config.tradingInterval;
  }

  getUpdateInterval(): number {
    return this.config.updateInterval;
  }

  getPerformanceMonitoringInterval(): number {
    return this.config.performanceMonitoringInterval;
  }

  getSymbols(): string[] {
    return this.config.symbols;
  }

  getDataSources(): string[] {
    return this.config.dataSources;
  }

  getMaxPositionSize(): number {
    return this.config.maxPositionSize;
  }

  getMaxDailyLoss(): number {
    return this.config.maxDailyLoss;
  }

  getMaxDrawdown(): number {
    return this.config.maxDrawdown;
  }

  getStopLossPercentage(): number {
    return this.config.stopLossPercentage;
  }

  getTakeProfitPercentage(): number {
    return this.config.takeProfitPercentage;
  }

  getMaxOpenPositions(): number {
    return this.config.maxOpenPositions;
  }

  getApiKey(source: string): string | undefined {
    return this.config.apiKeys[source];
  }

  getDatabaseConfig() {
    return this.config.database;
  }

  getMemoryConfig() {
    return {
      maxSize: this.config.maxMemorySize,
      retentionDays: this.config.memoryRetentionDays
    };
  }

  getBlockchainConfig() {
    return this.config.blockchain;
  }

  getPrivateKey(): string {
    return this.config.blockchain.privateKey;
  }

  getRpcUrl(): string {
    return this.config.blockchain.rpcUrl;
  }

  getNetwork(): string {
    return this.config.blockchain.network;
  }

  updateConfig(updates: Partial<TradingConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  async save(): Promise<void> {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }
}

