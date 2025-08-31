import { PumpPandaConfigManager } from '../config/PumpPandaConfigManager';
import { MarketDataManager } from '../market/MarketDataManager';
import { TradingStrategy } from '../strategy/TradingStrategy';
import { RiskManager } from '../risk/RiskManager';
import { PortfolioManager } from '../portfolio/PortfolioManager';
import { RecallMemory } from '../memory/RecallMemory';
import { Logger } from '../utils/Logger';
import { PerformanceTracker } from '../analytics/PerformanceTracker';
import { RecallNetworkIntegration } from '../recall/RecallNetworkIntegration';

export class PumpPandaAgent {
  private config: PumpPandaConfigManager;
  private marketData: MarketDataManager;
  private strategy: TradingStrategy;
  private riskManager: RiskManager;
  private portfolio: PortfolioManager;
  private memory: RecallMemory;
  private performance: PerformanceTracker;
  private logger: Logger;
  private recallIntegration: RecallNetworkIntegration | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private tradingInterval: NodeJS.Timeout | null = null;
  private performanceInterval: NodeJS.Timeout | null = null;
  private trendingTokens: string[] = [];
  private autoTradingEnabled: boolean = true;

  constructor(config: PumpPandaConfigManager) {
    this.config = config;
    this.logger = new Logger();
    this.marketData = new MarketDataManager(config);
    this.strategy = new TradingStrategy(config);
    this.riskManager = new RiskManager(config);
    this.portfolio = new PortfolioManager(config);
    this.memory = new RecallMemory(config);
    this.performance = new PerformanceTracker(config);
    
    // Initialize Recall Network integration if API key is available
    const recallApiKey = process.env.RECALL_API_KEY;
    if (recallApiKey) {
      this.recallIntegration = new RecallNetworkIntegration(recallApiKey);
      this.logger.info('Recall Network integration initialized');
    }
  }

  async initialize(): Promise<void> {
    this.logger.info('🐼 Initializing PumpPanda Trading Agent...');
    
    try {
      // Initialize all components
      await this.marketData.initialize();
      await this.strategy.initialize();
      await this.riskManager.initialize();
      await this.portfolio.initialize();
      await this.memory.initialize();
      await this.performance.initialize();

      this.logger.info('✅ All components initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize components:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('⚠️ Agent is already running');
      return;
    }

    this.logger.info('🚀 Starting PumpPanda trading operations...');
    this.isRunning = true;

    try {
      // Start market data streaming
      await this.marketData.startStreaming();

      // Start the main trading loop
      this.startTradingLoop();

      // Start meme token hunting
      this.startMemeTokenHunting();

      // Start performance monitoring
      this.startPerformanceMonitoring();

      this.logger.info('🎯 PumpPanda trading operations started successfully');
    } catch (error) {
      this.logger.error('❌ Failed to start trading operations:', error);
      this.isRunning = false;
      throw error;
    }
  }

  private startTradingLoop(): void {
    const interval = this.config.getTradingInterval();
    this.tradingInterval = setInterval(async () => {
      if (!this.isRunning) {
        if (this.tradingInterval) {
          clearInterval(this.tradingInterval);
          this.tradingInterval = null;
        }
        return;
      }

      try {
        await this.executeTradingCycle();
      } catch (error) {
        this.logger.error('❌ Error in trading cycle:', error);
      }
    }, interval);

    this.logger.info(`🔄 Trading loop started with ${interval}ms interval`);
  }

  private startMemeTokenHunting(): void {
    const config = this.config.getMemeTokenHuntingConfig();
    if (!config.enabled) {
      this.logger.info('🔍 Meme token hunting is disabled');
      return;
    }

    this.tradingInterval = setInterval(async () => {
      if (!this.isRunning) {
        if (this.tradingInterval) {
          clearInterval(this.tradingInterval);
          this.tradingInterval = null;
        }
        return;
      }

      try {
        await this.scanForMemeTokens();
      } catch (error) {
        this.logger.error('❌ Error in meme token scanning:', error);
      }
    }, config.scanInterval);

    this.logger.info(`🔍 Meme token hunting started with ${config.scanInterval}ms interval`);
  }

  private async scanForMemeTokens(): Promise<void> {
    const config = this.config.getMemeTokenHuntingConfig();
    const enabledChains = this.config.getEnabledBlockchains();
    
    this.logger.info('🔍 Scanning for trending meme tokens...');

    for (const chain of enabledChains) {
      try {
        const trendingTokens = await this.findTrendingTokens(chain);
        
        if (trendingTokens.length > 0) {
          this.logger.info(`🚀 Found ${trendingTokens.length} trending tokens on ${chain}:`, trendingTokens);
          
          // Analyze and potentially trade these tokens
          await this.analyzeTrendingTokens(chain, trendingTokens);
        }
      } catch (error) {
        this.logger.error(`❌ Error scanning ${chain}:`, error);
      }
    }
  }

  private async findTrendingTokens(chain: string): Promise<string[]> {
    // This would integrate with various APIs to find trending tokens
    // For now, return the configured trending tokens
    const config = this.config.getMemeTokenHuntingConfig();
    return config.trendingTokens.filter(token => 
      !config.blacklistedTokens.includes(token)
    );
  }

  private async analyzeTrendingTokens(chain: string, tokens: string[]): Promise<void> {
    for (const token of tokens) {
      try {
        // Get market data for the token
        const marketData = await this.marketData.getTokenData(chain, token);
        
        if (marketData) {
          // Analyze using trading strategy
          const analysis = await this.strategy.analyzeMarket([marketData], this.memory);
          
          if (analysis.length > 0 && analysis[0].trend === 'bullish') {
            this.logger.info(`📈 ${token} on ${chain} shows bullish signals`);
            
            // Check if we should auto-buy
            const config = this.config.getMemeTokenHuntingConfig();
            if (config.autoBuy) {
              await this.executeMemeTokenTrade(chain, token, 'buy', marketData);
            }
          }
        }
      } catch (error) {
        this.logger.error(`❌ Error analyzing ${token} on ${chain}:`, error);
      }
    }
  }

  private async executeMemeTokenTrade(chain: string, token: string, action: 'buy' | 'sell', marketData: any): Promise<void> {
    try {
      const riskAssessment = await this.riskManager.assessRisk([marketData], this.portfolio);
      
      if (riskAssessment.isAcceptable) {
        // Generate trading signal
        const signals = await this.strategy.generateSignals([marketData], riskAssessment);
        
        if (signals.length > 0) {
          // Execute the trade
          await this.executeTrades(signals);
          this.logger.info(`🎯 Meme token trade executed: ${action} ${token} on ${chain}`);
        }
      }
    } catch (error) {
      this.logger.error(`❌ Failed to execute meme token trade for ${token}:`, error);
    }
  }

  private async executeTradingCycle(): Promise<void> {
    // Get current market data for all enabled chains
    const enabledChains = this.config.getEnabledBlockchains();
    const allMarketData: any[] = [];

    for (const chain of enabledChains) {
      try {
        const chainData = await this.marketData.getCurrentData();
        allMarketData.push(...chainData);
      } catch (error) {
        this.logger.error(`❌ Failed to get market data for ${chain}:`, error);
      }
    }

    if (allMarketData.length === 0) {
      this.logger.warn('⚠️ No market data available for trading cycle');
      return;
    }

    // Analyze market conditions using recall memory
    const analysis = await this.strategy.analyzeMarket(allMarketData, this.memory);
    
    // Check risk parameters
    const riskAssessment = await this.riskManager.assessRisk(analysis, this.portfolio);
    
    if (riskAssessment.isAcceptable) {
      // Generate trading signals
      const signals = await this.strategy.generateSignals(analysis, riskAssessment);
      
      // Execute trades if signals are valid
      if (signals.length > 0) {
        await this.executeTrades(signals);
      }
    }

    // Update memory with current cycle data
    await this.memory.recordCycle({
      timestamp: new Date(),
      marketData: allMarketData,
      analysis,
      riskAssessment,
      portfolio: await this.portfolio.getCurrentState()
    });
  }

  private async executeTrades(signals: any[]): Promise<void> {
    for (const signal of signals) {
      try {
        // Validate signal with risk manager
        const validation = await this.riskManager.validateSignal(signal);
        
        if (validation.isValid) {
          // Execute the trade
          const execution = await this.portfolio.executeTrade(signal);
          
          // Record the execution
          await this.memory.recordTrade(execution);
          
          this.logger.info(`✅ Trade executed: ${signal.symbol} ${signal.action} ${signal.quantity}`);
        }
      } catch (error) {
        this.logger.error(`❌ Failed to execute trade for signal: ${signal.symbol}`, { signal, error });
      }
    }
  }

  private startPerformanceMonitoring(): void {
    const interval = this.config.getPerformanceMonitoringInterval();
    this.performanceInterval = setInterval(async () => {
      if (!this.isRunning) {
        return;
      }

      try {
        await this.performance.updateMetrics();
        await this.performance.generateReport();
      } catch (error) {
        this.logger.error('❌ Error in performance monitoring:', error);
      }
    }, interval);

    this.logger.info(`📊 Performance monitoring started with ${interval}ms interval`);
  }

  async shutdown(): Promise<void> {
    this.logger.info('🛑 Shutting down PumpPanda Trading Agent...');
    this.isRunning = false;

    try {
      // Clear intervals
      if (this.tradingInterval) {
        clearInterval(this.tradingInterval);
        this.tradingInterval = null;
      }
      if (this.performanceInterval) {
        clearInterval(this.performanceInterval);
        this.performanceInterval = null;
      }

      await this.marketData.stopStreaming();
      await this.portfolio.closeAllPositions();
      await this.memory.save();
      await this.performance.save();
      
      this.logger.info('✅ Shutdown completed successfully');
    } catch (error) {
      this.logger.error('❌ Error during shutdown:', error);
    }
  }

  // Public methods for external control
  async pause(): Promise<void> {
    this.isRunning = false;
    this.logger.info('⏸️ Trading operations paused');
  }

  async resume(): Promise<void> {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTradingLoop();
      this.startMemeTokenHunting();
      this.logger.info('▶️ Trading operations resumed');
    }
  }

  async getStatus(): Promise<any> {
    return {
      isRunning: this.isRunning,
      agentName: 'PumpPanda',
      version: '1.0.0',
      enabledBlockchains: this.config.getEnabledBlockchains(),
      portfolio: await this.portfolio.getCurrentState(),
      performance: await this.performance.getCurrentMetrics(),
      memory: await this.memory.getStats(),
      memeTokenHunting: this.config.getMemeTokenHuntingConfig()
    };
  }

  // Meme token specific methods
  async getTrendingTokens(): Promise<string[]> {
    const config = this.config.getMemeTokenHuntingConfig();
    return config.trendingTokens;
  }

  async updateTrendingTokens(tokens: string[]): Promise<void> {
    const currentConfig = this.config.getFullConfig();
    currentConfig.memeTokenHunting.trendingTokens = tokens;
    await this.config.save();
    this.logger.info(`🔄 Updated trending tokens: ${tokens.join(', ')}`);
  }

  async enableAutoTrading(enable: boolean): Promise<void> {
    const currentConfig = this.config.getFullConfig();
    currentConfig.memeTokenHunting.autoBuy = enable;
    currentConfig.memeTokenHunting.autoSell = enable;
    await this.config.save();
    this.logger.info(`🔄 Auto-trading ${enable ? 'enabled' : 'disabled'}`);
  }
}
