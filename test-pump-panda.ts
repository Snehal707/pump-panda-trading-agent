import { PumpPandaConfigManager } from './src/config/PumpPandaConfigManager';
import { PumpPandaAgent } from './src/core/PumpPandaAgent';
import { Logger } from './src/utils/Logger';

async function testPumpPanda() {
  const logger = new Logger();
  
  try {
    logger.info('🧪 Testing PumpPanda Agent...');
    
    // Test 1: Configuration Loading
    logger.info('📋 Test 1: Loading configuration...');
    const config = new PumpPandaConfigManager();
    await config.load();
    logger.info('✅ Configuration loaded successfully');
    
    // Test 2: Configuration Access
    logger.info('🔧 Test 2: Accessing configuration...');
    const enabledChains = config.getEnabledBlockchains();
    const tradingConfig = config.getTradingConfig();
    const memeConfig = config.getMemeTokenHuntingConfig();
    
    logger.info(`   Enabled Blockchains: ${enabledChains.join(', ')}`);
    logger.info(`   Trading Interval: ${tradingConfig.tradingInterval}ms`);
    logger.info(`   Meme Token Hunting: ${memeConfig.enabled ? 'Enabled' : 'Disabled'}`);
    logger.info(`   Trending Tokens: ${memeConfig.trendingTokens.join(', ')}`);
    
    // Test 3: Agent Initialization
    logger.info('🤖 Test 3: Initializing agent...');
    const agent = new PumpPandaAgent(config);
    await agent.initialize();
    logger.info('✅ Agent initialized successfully');
    
    // Test 4: Agent Status
    logger.info('📊 Test 4: Getting agent status...');
    const status = await agent.getStatus();
    logger.info(`   Agent Name: ${status.agentName}`);
    logger.info(`   Version: ${status.version}`);
    logger.info(`   Is Running: ${status.isRunning}`);
    logger.info(`   Enabled Chains: ${status.enabledBlockchains.length}`);
    
    // Test 5: Trending Tokens
    logger.info('🚀 Test 5: Getting trending tokens...');
    const trendingTokens = await agent.getTrendingTokens();
    logger.info(`   Trending Tokens: ${trendingTokens.join(', ')}`);
    
    // Test 6: Configuration Update
    logger.info('🔄 Test 6: Updating configuration...');
    const newTokens = ['PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BALD', 'TOSHI'];
    await agent.updateTrendingTokens(newTokens);
    logger.info(`   Updated Trending Tokens: ${newTokens.join(', ')}`);
    
    // Test 7: Auto-trading Toggle
    logger.info('🤖 Test 7: Toggling auto-trading...');
    await agent.enableAutoTrading(true);
    logger.info('   Auto-trading enabled');
    
    // Test 8: Shutdown
    logger.info('🛑 Test 8: Shutting down agent...');
    await agent.shutdown();
    logger.info('✅ Agent shut down successfully');
    
    logger.info('🎉 All tests passed successfully!');
    
  } catch (error) {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testPumpPanda().catch((error) => {
    console.error('❌ Fatal test error:', error);
    process.exit(1);
  });
}

export { testPumpPanda };
