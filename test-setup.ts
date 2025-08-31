import { ConfigManager } from './src/config/ConfigManager';
import { BlockchainManager } from './src/blockchain/BlockchainManager';
import { Logger } from './src/utils/Logger';

async function testSetup() {
  const logger = new Logger();
  
  try {
    logger.info('Testing blockchain setup...');
    
    // Initialize configuration
    const config = new ConfigManager();
    await config.load();
    
    // Test blockchain configuration
    const blockchainConfig = config.getBlockchainConfig();
    logger.info('Blockchain config loaded:', {
      network: blockchainConfig.network,
      rpcUrl: blockchainConfig.rpcUrl ? 'Set' : 'Not set',
      privateKey: blockchainConfig.privateKey ? 'Set' : 'Not set'
    });
    
    // Test blockchain manager initialization (will fail without proper config)
    try {
      const blockchainManager = new BlockchainManager(config);
      logger.info('Blockchain manager created successfully');
      
      // Test if we can get wallet address (will fail without private key)
      if (blockchainConfig.privateKey && blockchainConfig.privateKey !== 'YOUR_PRIVATE_KEY_HERE') {
        await blockchainManager.initialize();
        const walletAddress = blockchainManager.getWalletAddress();
        logger.info('Wallet address:', walletAddress);
      } else {
        logger.warn('Private key not configured - skipping blockchain initialization');
      }
      
    } catch (error) {
      logger.warn('Blockchain manager test failed (expected without proper config):', (error as Error).message);
    }
    
    logger.info('Setup test completed');
    
  } catch (error) {
    logger.error('Setup test failed:', error);
  }
}

// Run the test
testSetup();
