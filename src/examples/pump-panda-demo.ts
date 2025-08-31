import { PumpPandaAgent } from '../core/PumpPandaAgent';
import { PumpPandaConfigManager } from '../config/PumpPandaConfigManager';
import { Logger } from '../utils/Logger';

async function demo() {
  const logger = new Logger();
  
  try {
    logger.info('🎬 Starting PumpPanda Demo...');
    
    // Initialize configuration
    const config = new PumpPandaConfigManager();
    await config.load();
    
    // Create the agent
    const agent = new PumpPandaAgent(config);
    await agent.initialize();
    
    logger.info('✅ Agent initialized');
    
    // Demo 1: Get agent status
    logger.info('📊 Demo 1: Getting agent status...');
    const status = await agent.getStatus();
    console.log('Agent Status:', JSON.stringify(status, null, 2));
    
    // Demo 2: Get trending tokens
    logger.info('🚀 Demo 2: Getting trending tokens...');
    const trendingTokens = await agent.getTrendingTokens();
    console.log('Trending Tokens:', trendingTokens);
    
    // Demo 3: Update trending tokens
    logger.info('🔄 Demo 3: Updating trending tokens...');
    const newTokens = ['PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BALD', 'TOSHI', 'SAFEMOON', 'BABYDOGE', 'MOONSHOT'];
    await agent.updateTrendingTokens(newTokens);
    
    // Demo 4: Enable auto-trading
    logger.info('🤖 Demo 4: Enabling auto-trading...');
    await agent.enableAutoTrading(true);
    
    // Demo 5: Start the agent (briefly)
    logger.info('🚀 Demo 5: Starting agent briefly...');
    await agent.start();
    
    // Wait a bit to see some activity
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Demo 6: Pause the agent
    logger.info('⏸️ Demo 6: Pausing agent...');
    await agent.pause();
    
    // Demo 7: Resume the agent
    logger.info('▶️ Demo 7: Resuming agent...');
    await agent.resume();
    
    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Demo 8: Shutdown
    logger.info('🛑 Demo 8: Shutting down...');
    await agent.shutdown();
    
    logger.info('✅ Demo completed successfully!');
    
  } catch (error) {
    logger.error('❌ Demo failed:', error);
  }
}

// Demo configuration functions
async function demoConfiguration() {
  const logger = new Logger();
  
  try {
    logger.info('⚙️ Demo Configuration Management...');
    
    const config = new PumpPandaConfigManager();
    await config.load();
    
    // Show current configuration
    const fullConfig = config.getFullConfig();
    console.log('Current Configuration:', JSON.stringify(fullConfig, null, 2));
    
    // Show specific sections
    console.log('\n📊 Trading Config:', config.getTradingConfig());
    console.log('\n🔍 Meme Token Hunting Config:', config.getMemeTokenHuntingConfig());
    console.log('\n🛡️ Risk Config:', config.getRiskConfig());
    console.log('\n📈 Monitoring Config:', config.getMonitoringConfig());
    
    // Show enabled blockchains
    const enabledChains = config.getEnabledBlockchains();
    console.log('\n⛓️ Enabled Blockchains:', enabledChains);
    
    // Show blockchain-specific configs
    for (const chain of enabledChains) {
      const chainConfig = config.getBlockchainConfig(chain);
      console.log(`\n🔗 ${chain.toUpperCase()} Config:`, {
        network: chainConfig.network,
        rpcUrl: chainConfig.rpcUrl,
        preferredDex: chainConfig.preferredDex,
        maxSlippage: chainConfig.maxSlippage
      });
    }
    
  } catch (error) {
    logger.error('❌ Configuration demo failed:', error);
  }
}

// Run demos
async function runAllDemos() {
  console.log('🎬 Running PumpPanda Demos...\n');
  
  // Run configuration demo first
  await demoConfiguration();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Run main demo
  await demo();
  
  console.log('\n🎉 All demos completed!');
}

// Export functions for external use
export { demo, demoConfiguration, runAllDemos };

// Run if this file is executed directly
if (require.main === module) {
  runAllDemos().catch(console.error);
}
