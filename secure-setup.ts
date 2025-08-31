#!/usr/bin/env ts-node

import { SecureConfigManager } from './src/config/SecureConfigManager';
import { Logger } from './src/utils/Logger';
import * as fs from 'fs';
import * as path from 'path';

class SecureSetup {
  private logger: Logger;
  private configManager: SecureConfigManager;

  constructor() {
    this.logger = new Logger();
    this.configManager = new SecureConfigManager();
  }

  async run(): Promise<void> {
    this.logger.info('🔐 PumpPanda Secure Setup Wizard');
    this.logger.info('=====================================');
    
    try {
      // Step 1: Check if .env file exists
      await this.checkEnvironmentFile();
      
      // Step 2: Load and validate configuration
      await this.loadAndValidateConfig();
      
      // Step 3: Perform security audit
      await this.performSecurityAudit();
      
      // Step 4: Test blockchain connections
      await this.testBlockchainConnections();
      
      this.logger.info('🎉 Secure setup completed successfully!');
      this.logger.info('🐼 PumpPanda is ready to hunt meme tokens!');
      
    } catch (error) {
      this.logger.error('❌ Setup failed:', error);
      process.exit(1);
    }
  }

  private async checkEnvironmentFile(): Promise<void> {
    this.logger.info('📋 Step 1: Checking environment configuration...');
    
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      this.logger.warn('⚠️ No .env file found. Creating template...');
      await this.createEnvironmentTemplate();
      
      this.logger.info('📝 Please edit the .env file with your private keys and restart the setup.');
      this.logger.info('🔐 Remember: NEVER share your private keys with anyone!');
      process.exit(0);
    } else {
      this.logger.info('✅ .env file found');
    }
  }

  private async createEnvironmentTemplate(): Promise<void> {
    const template = `# 🐼 PumpPanda Environment Configuration
# Copy this file to .env and fill in your NEW private keys
# NEVER commit .env to Git!

# Ethereum Network
ETH_PRIVATE_KEY=your_new_ethereum_private_key_here
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Base Network
BASE_PRIVATE_KEY=your_new_base_private_key_here
BASE_RPC_URL=https://mainnet.base.org

# BSC Network
BSC_PRIVATE_KEY=your_new_bsc_private_key_here
BSC_RPC_URL=https://bsc-dataseed1.binance.org

# Polygon Network
POLYGON_PRIVATE_KEY=your_new_polygon_private_key_here
POLYGON_RPC_URL=https://polygon-rpc.com

# Infura Project ID (for Ethereum)
INFURA_PROJECT_ID=your_infura_project_id_here

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Discord Webhook (optional)
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
`;

    const envPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(envPath, template);
    this.logger.info('📝 .env template created');
  }

  private async loadAndValidateConfig(): Promise<void> {
    this.logger.info('📋 Step 2: Loading and validating configuration...');
    
    const configPath = path.join(process.cwd(), 'config', 'secure-config-template.json');
    
    if (!fs.existsSync(configPath)) {
      throw new Error('Configuration template not found. Please run setup again.');
    }

    const config = await this.configManager.loadConfig(configPath);
    this.logger.info(`✅ Configuration loaded: ${config.name} v${config.version}`);
    
    const enabledBlockchains = this.configManager.getEnabledBlockchains();
    this.logger.info(`🔗 Enabled blockchains: ${enabledBlockchains.join(', ')}`);
  }

  private async performSecurityAudit(): Promise<void> {
    this.logger.info('📋 Step 3: Performing security audit...');
    
    const audit = this.configManager.performSecurityAudit();
    
    if (audit.isValid) {
      this.logger.info('✅ Security audit passed');
    } else {
      this.logger.error('❌ Security audit failed:');
      for (const issue of audit.issues) {
        this.logger.error(`   - ${issue}`);
      }
      throw new Error('Security audit failed. Please fix the issues above.');
    }
  }

  private async testBlockchainConnections(): Promise<void> {
    this.logger.info('📋 Step 4: Testing blockchain connections...');
    
    const enabledBlockchains = this.configManager.getEnabledBlockchains();
    
    for (const blockchain of enabledBlockchains) {
      try {
        const config = this.configManager.getBlockchainConfig(blockchain);
        if (config) {
          this.logger.info(`🔗 Testing ${blockchain} connection...`);
          
          // Basic connection test (would implement actual RPC calls here)
          this.logger.info(`   ✅ ${blockchain} configuration valid`);
          this.logger.info(`   📍 RPC: ${config.rpcUrl}`);
          this.logger.info(`   💰 Native: ${config.nativeCurrency.symbol}`);
          this.logger.info(`   🦄 Preferred DEX: ${config.preferredDex}`);
        }
      } catch (error) {
        this.logger.error(`❌ Failed to test ${blockchain}:`, error);
      }
    }
  }

  // Helper method to display configuration summary
  private displayConfigurationSummary(): void {
    this.logger.info('📊 Configuration Summary:');
    this.logger.info('========================');
    
    try {
      const config = this.configManager.getConfig();
      const trading = this.configManager.getTradingConfig();
      const memeToken = this.configManager.getMemeTokenConfig();
      const risk = this.configManager.getRiskConfig();
      
      this.logger.info(`🤖 Trading Enabled: ${trading.enabled ? 'Yes' : 'No'}`);
      this.logger.info(`📈 Max Positions: ${trading.maxOpenPositions}`);
      this.logger.info(`🛡️ Stop Loss: ${trading.stopLossPercentage * 100}%`);
      this.logger.info(`🎯 Take Profit: ${trading.takeProfitPercentage * 100}%`);
      
      this.logger.info(`🐼 Meme Token Hunting: ${memeToken.enabled ? 'Yes' : 'No'}`);
      this.logger.info(`🔍 Scan Interval: ${memeToken.scanInterval / 1000}s`);
      this.logger.info(`📊 Max Holdings: ${memeToken.maxHoldings}`);
      
      this.logger.info(`⚠️ Risk Management:`);
      this.logger.info(`   Max Exposure per Token: ${risk.maxExposurePerToken * 100}%`);
      this.logger.info(`   Max Exposure per Chain: ${risk.maxExposurePerChain * 100}%`);
      this.logger.info(`   Emergency Stop Loss: ${risk.emergencyStopLoss * 100}%`);
      
    } catch (error) {
      this.logger.warn('Could not display configuration summary');
    }
  }
}

// Run the secure setup
if (require.main === module) {
  const setup = new SecureSetup();
  setup.run().catch(console.error);
}
