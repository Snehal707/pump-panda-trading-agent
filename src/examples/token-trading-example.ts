import { ConfigManager } from '../config/ConfigManager';
import { RecallAgent } from '../core/RecallAgent';
import { Logger } from '../utils/Logger';

async function main() {
  const logger = new Logger();
  
  try {
    logger.info('Starting token trading example...');
    
    // Initialize configuration
    const config = new ConfigManager();
    await config.load();
    
    // Update blockchain configuration for Sepolia testnet
    config.updateConfig({
      blockchain: {
        network: 'sepolia',
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID', // Replace with your Infura project ID
        privateKey: 'YOUR_PRIVATE_KEY_HERE', // Replace with your wallet private key
        gasLimit: 300000,
        gasPrice: '20000000000' // 20 gwei
      }
    });
    
    // Initialize the trading agent
    const agent = new RecallAgent(config);
    await agent.initialize();
    
    logger.info('Agent initialized successfully');
    
    // Get portfolio manager for blockchain operations
    const portfolio = (agent as any).portfolio;
    
    // Example: Get supported tokens
    const supportedTokens = portfolio.getSupportedTokens();
    logger.info('Supported tokens:', supportedTokens);
    
    // Example: Get wallet address
    const walletAddress = portfolio.getWalletAddress();
    logger.info('Wallet address:', walletAddress);
    
    // Example: Get token balance
    const wethBalance = await portfolio.getTokenBalance(supportedTokens.WETH);
    logger.info('WETH balance:', wethBalance);
    
    // Example: Get token information
    const usdcInfo = await portfolio.getTokenInfo(supportedTokens.USDC);
    logger.info('USDC token info:', usdcInfo);
    
    // Example: Get swap quote (WETH to USDC)
    const swapQuote = await portfolio.getSwapQuote(
      supportedTokens.WETH,
      supportedTokens.USDC,
      '1000000000000000000' // 1 WETH (18 decimals)
    );
    logger.info('Swap quote (1 WETH -> USDC):', swapQuote);
    
    // Example: Execute token swap (commented out for safety)
    /*
    const swapTxHash = await portfolio.swapTokens(
      supportedTokens.WETH,
      supportedTokens.USDC,
      '1000000000000000000', // 1 WETH
      '1800000000' // 1800 USDC (6 decimals) - minimum amount out
    );
    logger.info('Swap transaction hash:', swapTxHash);
    */
    
    // Start the agent (optional)
    // await agent.start();
    
    logger.info('Token trading example completed successfully');
    
  } catch (error) {
    logger.error('Error in token trading example:', error);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main();
}

export { main as tokenTradingExample };
