import { RecallAgent } from './core/RecallAgent';
import { ConfigManager } from './config/ConfigManager';
import { Logger } from './utils/Logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    const logger = new Logger();
    logger.info('Starting Recall Trading Agent...');

    // Initialize configuration
    const config = new ConfigManager();
    await config.load();

    // Create and start the trading agent
    const agent = new RecallAgent(config);
    await agent.initialize();
    await agent.start();

    logger.info('Recall Trading Agent started successfully');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully...');
      await agent.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down gracefully...');
      await agent.shutdown();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start Recall Trading Agent:', error);
    process.exit(1);
  }
}

main().catch(console.error);
