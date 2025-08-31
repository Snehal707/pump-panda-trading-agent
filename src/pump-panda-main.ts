import { PumpPandaAgent } from './core/PumpPandaAgent';
import { PumpPandaConfigManager } from './config/PumpPandaConfigManager';
import { Logger } from './utils/Logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  const logger = new Logger();
  
  try {
    logger.info('🐼 Starting PumpPanda Trading Agent for Recall Competition...');
    
    // Initialize PumpPanda configuration
    const config = new PumpPandaConfigManager();
    await config.load();
    
    // Log configuration summary
    const enabledChains = config.getEnabledBlockchains();
    const tradingConfig = config.getTradingConfig();
    const memeConfig = config.getMemeTokenHuntingConfig();
    
    logger.info('📋 Configuration Summary:');
    logger.info(`   Enabled Blockchains: ${enabledChains.join(', ')}`);
    logger.info(`   Trading Interval: ${tradingConfig.tradingInterval}ms`);
    logger.info(`   Max Positions: ${tradingConfig.maxOpenPositions}`);
    logger.info(`   Meme Token Hunting: ${memeConfig.enabled ? 'Enabled' : 'Disabled'}`);
    logger.info(`   Trending Tokens: ${memeConfig.trendingTokens.join(', ')}`);
    
    // Create and initialize the PumpPanda agent
    const agent = new PumpPandaAgent(config);
    await agent.initialize();
    
    logger.info('✅ PumpPanda agent initialized successfully');
    
    // Start the agent
    await agent.start();
    
    logger.info('🚀 PumpPanda Trading Agent is now running!');
    logger.info('🎯 Hunting for the next 100x meme tokens across all blockchains...');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('🛑 Received SIGINT, shutting down gracefully...');
      await agent.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('🛑 Received SIGTERM, shutting down gracefully...');
      await agent.shutdown();
      process.exit(0);
    });

    // Keep the process alive
    process.stdin.resume();
    
    // Log status every 5 minutes
    setInterval(async () => {
      try {
        const status = await agent.getStatus();
        logger.info('📊 Agent Status:', {
          isRunning: status.isRunning,
          enabledChains: status.enabledBlockchains.length,
          portfolioValue: status.portfolio?.totalValue || 'N/A',
          memoryRecords: status.memory?.totalRecords || 0
        });
      } catch (error) {
        logger.error('❌ Error getting agent status:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

  } catch (error) {
    logger.error('❌ Failed to start PumpPanda Trading Agent:', error);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { main as pumpPandaMain };
