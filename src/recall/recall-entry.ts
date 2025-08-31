import { PumpPandaAgent } from '../core/PumpPandaAgent';
import { PumpPandaConfigManager } from '../config/PumpPandaConfigManager';
import { RecallNetworkIntegration } from './RecallNetworkIntegration';
import { Logger } from '../utils/Logger';

// This is the entry point that Recall Network expects
export class RecallNetworkAgent {
  private agent: PumpPandaAgent;
  private config: PumpPandaConfigManager;
  private recallIntegration: RecallNetworkIntegration;
  private logger: Logger;
  private isRunning: boolean = false;

  constructor() {
    this.config = new PumpPandaConfigManager();
    this.agent = new PumpPandaAgent(this.config);
    
    // Initialize Recall Network integration
    const recallApiKey = process.env.RECALL_API_KEY;
    if (!recallApiKey) {
      throw new Error('RECALL_API_KEY environment variable is required');
    }
    
    this.recallIntegration = new RecallNetworkIntegration(recallApiKey);
    this.logger = new Logger();
  }

  /**
   * Initialize the agent for Recall Network
   */
  async initialize(): Promise<void> {
    try {
      await this.config.load();
      await this.agent.initialize();
      this.logger.info('Recall Network Agent initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Recall Network Agent:', error);
      throw error;
    }
  }

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Agent is already running');
      return;
    }

    try {
      await this.agent.start();
      this.isRunning = true;
      this.logger.info('Recall Network Agent started successfully');
    } catch (error) {
      this.logger.error('Failed to start Recall Network Agent:', error);
      throw error;
    }
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Agent is not running');
      return;
    }

    try {
      await this.agent.shutdown();
      this.isRunning = false;
      this.logger.info('Recall Network Agent stopped successfully');
    } catch (error) {
      this.logger.error('Failed to stop Recall Network Agent:', error);
      throw error;
    }
  }

  /**
   * Get agent status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      agentName: 'PumpPanda Trading Agent',
      version: '1.0.0',
      supportedNetworks: ['ethereum', 'base', 'bsc', 'polygon', 'arbitrum', 'optimism'],
      features: [
        'AI-powered trading strategies',
        'Meme token hunting',
        'Multi-blockchain support',
        'Risk management',
        'Portfolio tracking',
        'Performance analytics'
      ]
    };
  }

  /**
   * Execute a trade through Recall Network
   */
  async executeTrade(tradeRequest: any): Promise<any> {
    try {
      const result = await this.recallIntegration.executeTrade(tradeRequest);
      this.logger.info(`Trade executed: ${result.message}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to execute trade:', error);
      throw error;
    }
  }

  /**
   * Get portfolio information
   */
  async getPortfolio(): Promise<any> {
    try {
      return await this.recallIntegration.getPortfolio();
    } catch (error) {
      this.logger.error('Failed to get portfolio:', error);
      throw error;
    }
  }

  /**
   * Get available tokens
   */
  async getAvailableTokens(): Promise<any> {
    try {
      return await this.recallIntegration.getAvailableTokens();
    } catch (error) {
      this.logger.error('Failed to get available tokens:', error);
      throw error;
    }
  }

  /**
   * Get competition status
   */
  async getCompetitionStatus(): Promise<any> {
    try {
      return await this.recallIntegration.getCompetitionStatus();
    } catch (error) {
      this.logger.error('Failed to get competition status:', error);
      throw error;
    }
  }
}

// Export the main agent instance
export const recallAgent = new RecallNetworkAgent();

// Export for direct use
export default recallAgent;
