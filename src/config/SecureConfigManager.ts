import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/Logger';

export interface SecureBlockchainConfig {
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
}

export interface SecureTradingConfig {
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
}

export interface SecureMemeTokenConfig {
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
}

export interface SecureRiskConfig {
  maxExposurePerToken: number;
  maxExposurePerChain: number;
  maxExposurePerDex: number;
  emergencyStopLoss: number;
  circuitBreaker: boolean;
  maxGasPrice: string;
}

export interface SecureConfig {
  name: string;
  version: string;
  description: string;
  blockchains: { [key: string]: SecureBlockchainConfig };
  trading: SecureTradingConfig;
  memeTokenHunting: SecureMemeTokenConfig;
  risk: SecureRiskConfig;
}

export class SecureConfigManager {
  private logger: Logger;
  private config: SecureConfig | null = null;
  private envVars: { [key: string]: string } = {};

  constructor() {
    this.logger = new Logger();
    this.loadEnvironmentVariables();
  }

  private loadEnvironmentVariables(): void {
    try {
      // Load from .env file if it exists
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
              this.envVars[key] = valueParts.join('=');
            }
          }
        }
        this.logger.info('✅ Environment variables loaded from .env file');
      } else {
        this.logger.warn('⚠️ No .env file found. Using system environment variables.');
      }

      // Also load from system environment variables
      for (const [key, value] of Object.entries(process.env)) {
        if (value) {
          this.envVars[key] = value;
        }
      }
    } catch (error) {
      this.logger.error('Failed to load environment variables:', error);
    }
  }

  async loadConfig(configPath: string): Promise<SecureConfig> {
    try {
      this.logger.info('🔐 Loading secure configuration...');
      
      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }

      const configContent = fs.readFileSync(configPath, 'utf8');
      const templateConfig = JSON.parse(configContent) as SecureConfig;

      // Replace placeholder values with actual environment variables
      this.config = this.resolveConfigPlaceholders(templateConfig);
      
      this.logger.info('✅ Secure configuration loaded successfully');
      return this.config;
    } catch (error) {
      this.logger.error('Failed to load secure configuration:', error);
      throw error;
    }
  }

  private resolveConfigPlaceholders(templateConfig: SecureConfig): SecureConfig {
    const resolvedConfig = JSON.parse(JSON.stringify(templateConfig));

    // Resolve blockchain configurations
    for (const [blockchain, config] of Object.entries(resolvedConfig.blockchains)) {
      if (config.privateKey === 'USE_ENV_VARIABLE_ETH_PRIVATE_KEY') {
        const envKey = `${blockchain.toUpperCase()}_PRIVATE_KEY`;
        const privateKey = this.envVars[envKey];
        
        if (!privateKey) {
          this.logger.warn(`⚠️ No private key found for ${blockchain}. Disabling blockchain.`);
          config.enabled = false;
        } else {
          config.privateKey = privateKey;
          this.logger.info(`✅ Private key loaded for ${blockchain}`);
        }
      }

      // Resolve RPC URLs
      if (config.rpcUrl.includes('YOUR_INFURA_PROJECT_ID')) {
        const infuraId = this.envVars['INFURA_PROJECT_ID'];
        if (infuraId) {
          config.rpcUrl = config.rpcUrl.replace('YOUR_INFURA_PROJECT_ID', infuraId);
        }
      }
    }

    return resolvedConfig;
  }

  getConfig(): SecureConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  getBlockchainConfig(blockchain: string): SecureBlockchainConfig | undefined {
    return this.config?.blockchains[blockchain];
  }

  getEnabledBlockchains(): string[] {
    if (!this.config) return [];
    
    return Object.entries(this.config.blockchains)
      .filter(([_, config]) => config.enabled)
      .map(([key, _]) => key);
  }

  getTradingConfig(): SecureTradingConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config.trading;
  }

  getMemeTokenConfig(): SecureMemeTokenConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config.memeTokenHunting;
  }

  getRiskConfig(): SecureRiskConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config.risk;
  }

  // Security validation methods
  validatePrivateKeys(): boolean {
    if (!this.config) return false;

    for (const [blockchain, config] of Object.entries(this.config.blockchains)) {
      if (config.enabled && config.privateKey) {
        // Basic validation - check if it's a valid hex string
        if (!/^0x[a-fA-F0-9]{64}$/.test(config.privateKey)) {
          this.logger.error(`❌ Invalid private key format for ${blockchain}`);
          return false;
        }
      }
    }
    return true;
  }

  validateRpcUrls(): boolean {
    if (!this.config) return false;

    for (const [blockchain, config] of Object.entries(this.config.blockchains)) {
      if (config.enabled && config.rpcUrl) {
        try {
          new URL(config.rpcUrl);
        } catch {
          this.logger.error(`❌ Invalid RPC URL for ${blockchain}: ${config.rpcUrl}`);
          return false;
        }
      }
    }
    return true;
  }

  // Get environment variable safely
  getEnvVar(key: string): string | undefined {
    return this.envVars[key];
  }

  // Check if all required environment variables are set
  checkRequiredEnvVars(): string[] {
    const required = [
      'ETH_PRIVATE_KEY',
      'BASE_PRIVATE_KEY', 
      'BSC_PRIVATE_KEY',
      'POLYGON_PRIVATE_KEY'
    ];

    const missing: string[] = [];
    for (const key of required) {
      if (!this.envVars[key]) {
        missing.push(key);
      }
    }

    return missing;
  }

  // Security audit
  performSecurityAudit(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for missing environment variables
    const missingEnvVars = this.checkRequiredEnvVars();
    if (missingEnvVars.length > 0) {
      issues.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Validate private keys
    if (!this.validatePrivateKeys()) {
      issues.push('Invalid private key format detected');
    }

    // Validate RPC URLs
    if (!this.validateRpcUrls()) {
      issues.push('Invalid RPC URL format detected');
    }

    // Check for hardcoded private keys in config
    if (this.config) {
      for (const [blockchain, config] of Object.entries(this.config.blockchains)) {
        if (config.privateKey && config.privateKey.startsWith('0x') && 
            config.privateKey.length === 66) {
          issues.push(`Hardcoded private key detected for ${blockchain}`);
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
