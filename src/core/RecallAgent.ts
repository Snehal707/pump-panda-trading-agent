import { ConfigManager } from '../config/ConfigManager';
import { MarketDataManager } from '../market/MarketDataManager';
import { TradingStrategy } from '../strategy/TradingStrategy';
import { RiskManager } from '../risk/RiskManager';
import { PortfolioManager } from '../portfolio/PortfolioManager';
import { RecallMemory } from '../memory/RecallMemory';
import { Logger } from '../utils/Logger';
import { PerformanceTracker } from '../analytics/PerformanceTracker';

export class RecallAgent {
  private config: ConfigManager;
  private marketData: MarketDataManager;
  private strategy: TradingStrategy;
  private riskManager: RiskManager;
  private portfolio: PortfolioManager;
  private memory: RecallMemory;
  private performance: PerformanceTracker;
  private logger: Logger;
  private isRunning: boolean = false;

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger();
    this.marketData = new MarketDataManager(config);
    this.strategy = new TradingStrategy(config);
    this.riskManager = new RiskManager(config);
    this.portfolio = new PortfolioManager(config);
    this.memory = new RecallMemory(config);
    this.performance = new PerformanceTracker(config);
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Recall Trading Agent...');
    
    try {
      // Initialize all components
      await this.marketData.initialize();
      await this.strategy.initialize();
      await this.riskManager.initialize();
      await this.portfolio.initialize();
      await this.memory.initialize();
      await this.performance.initialize();

      this.logger.info('All components initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize components:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Agent is already running');
      return;
    }

    this.logger.info('Starting trading operations...');
    this.isRunning = true;

    try {
      // Start market data streaming
      await this.marketData.startStreaming();

      // Start the main trading loop
      this.startTradingLoop();

      // Start performance monitoring
      this.startPerformanceMonitoring();

      this.logger.info('Trading operations started successfully');
    } catch (error) {
      this.logger.error('Failed to start trading operations:', error);
      this.isRunning = false;
      throw error;
    }
  }

  private startTradingLoop(): void {
    const tradingInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(tradingInterval);
        return;
      }

      try {
        await this.executeTradingCycle();
      } catch (error) {
        this.logger.error('Error in trading cycle:', error);
      }
    }, this.config.getTradingInterval());
  }

  private async executeTradingCycle(): Promise<void> {
    // Get current market data
    const marketData = await this.marketData.getCurrentData();
    
    // Analyze market conditions using recall memory
    const analysis = await this.strategy.analyzeMarket(marketData, this.memory);
    
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
      marketData,
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
          
          this.logger.info(`Trade executed: ${signal.symbol} ${signal.action} ${signal.quantity}`);
        }
      } catch (error) {
        this.logger.error(`Failed to execute trade for signal: ${signal.symbol}`, { signal, error });
      }
    }
  }

  private startPerformanceMonitoring(): void {
    const monitoringInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(monitoringInterval);
        return;
      }

      try {
        await this.performance.updateMetrics();
        await this.performance.generateReport();
      } catch (error) {
        this.logger.error('Error in performance monitoring:', error);
      }
    }, this.config.getPerformanceMonitoringInterval());
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Recall Trading Agent...');
    this.isRunning = false;

    try {
      await this.marketData.stopStreaming();
      await this.portfolio.closeAllPositions();
      await this.memory.save();
      await this.performance.save();
      
      this.logger.info('Shutdown completed successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }

  // Public methods for external control
  async pause(): Promise<void> {
    this.isRunning = false;
    this.logger.info('Trading operations paused');
  }

  async resume(): Promise<void> {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTradingLoop();
      this.logger.info('Trading operations resumed');
    }
  }

  async getStatus(): Promise<any> {
    return {
      isRunning: this.isRunning,
      portfolio: await this.portfolio.getCurrentState(),
      performance: await this.performance.getCurrentMetrics(),
      memory: await this.memory.getStats()
    };
  }
}

