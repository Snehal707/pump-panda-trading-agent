import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils/Logger';
import { TradingSignal } from '../strategy/TradingStrategy';
import { BlockchainManager } from '../blockchain/BlockchainManager';
import { UniswapManager } from '../dex/UniswapManager';

export interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  entryTime: Date;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  pnlPercentage: number;
}

export interface Portfolio {
  initialValue: number;
  currentValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  positions: Position[];
  cash: number;
}

export interface TradeExecution {
  id: string;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
  status: 'executed' | 'failed' | 'pending';
  message?: string;
}

export class PortfolioManager {
  private config: ConfigManager;
  private logger: Logger;
  private blockchainManager: BlockchainManager;
  private uniswapManager: UniswapManager;
  private isInitialized: boolean = false;
  private portfolio: Portfolio;
  private positions: Map<string, Position>;

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger();
    this.positions = new Map();
    
    // Initialize blockchain components
    this.blockchainManager = new BlockchainManager(config);
    this.uniswapManager = new UniswapManager(this.blockchainManager);
    
    // Initialize with mock portfolio
    this.portfolio = {
      initialValue: 100000,
      currentValue: 100000,
      totalPnL: 0,
      totalPnLPercentage: 0,
      positions: [],
      cash: 100000
    };
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing portfolio manager...');
      
      // Initialize blockchain components
      await this.blockchainManager.initialize();
      await this.uniswapManager.initialize();
      
      this.isInitialized = true;
      this.logger.info('Portfolio manager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize portfolio manager:', error);
      throw error;
    }
  }

  async executeTrade(signal: TradingSignal): Promise<TradeExecution> {
    if (!this.isInitialized) {
      throw new Error('Portfolio manager not initialized');
    }

    // Skip hold signals
    if (signal.action === 'hold') {
      throw new Error('Cannot execute hold signal');
    }

    const execution: TradeExecution = {
      id: this.generateTradeId(),
      symbol: signal.symbol,
      action: signal.action as 'buy' | 'sell',
      quantity: signal.quantity,
      price: signal.price || this.getCurrentPrice(signal.symbol),
      timestamp: new Date(),
      status: 'pending',
      message: 'Trade execution initiated'
    };

    try {
      // Validate trade
      const validation = await this.validateTrade(signal);
      if (!validation.isValid) {
        execution.status = 'failed';
        execution.message = `Trade validation failed: ${validation.reason}`;
        this.logger.error('Trade execution failed', execution);
        return execution;
      }

      // Execute the trade
      if (signal.action === 'buy') {
        await this.executeBuy(signal);
      } else if (signal.action === 'sell') {
        await this.executeSell(signal);
      }

      execution.status = 'executed';
      execution.message = 'Trade executed successfully';
      
      this.logger.trade('Trade executed successfully', execution);
      
      // Update portfolio
      await this.updatePortfolio();
      
    } catch (error) {
      execution.status = 'failed';
      execution.message = `Trade execution error: ${error}`;
      this.logger.error('Trade execution failed', execution);
    }

    return execution;
  }

  async getCurrentState(): Promise<Portfolio> {
    if (!this.isInitialized) {
      throw new Error('Portfolio manager not initialized');
    }

    // Update current prices and PnL
    await this.updatePortfolio();
    
    return { ...this.portfolio };
  }

  async closeAllPositions(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Portfolio manager not initialized');
    }

    this.logger.info('Closing all positions...');
    
    for (const [symbol, position] of this.positions) {
      try {
        await this.closePosition(symbol);
      } catch (error) {
        this.logger.error(`Failed to close position for ${symbol}:`, error);
      }
    }

    this.logger.info('All positions closed');
  }

  async closePosition(symbol: string): Promise<void> {
    const position = this.positions.get(symbol);
    if (!position) {
      return;
    }

    // Simulate closing position at current price
    const currentPrice = this.getCurrentPrice(symbol);
    const pnl = (currentPrice - position.entryPrice) * position.quantity;
    
    // Update cash
    this.portfolio.cash += position.quantity * currentPrice;
    
    // Remove position
    this.positions.delete(symbol);
    
    this.logger.info(`Position closed for ${symbol}`, { pnl, currentPrice });
  }

  private async validateTrade(signal: TradingSignal): Promise<{ isValid: boolean; reason?: string }> {
    // Check if we have enough cash for buy
    if (signal.action === 'buy') {
      const requiredCash = signal.quantity * signal.price;
      if (this.portfolio.cash < requiredCash) {
        return { isValid: false, reason: 'Insufficient cash' };
      }
    }

    // Check if we have enough quantity for sell
    if (signal.action === 'sell') {
      const position = this.positions.get(signal.symbol);
      if (!position || position.quantity < signal.quantity) {
        return { isValid: false, reason: 'Insufficient position size' };
      }
    }

    // Check position size limits
    if (signal.quantity * signal.price > this.config.getMaxPositionSize()) {
      return { isValid: false, reason: 'Position size exceeds limit' };
    }

    return { isValid: true };
  }

  private async executeBuy(signal: TradingSignal): Promise<void> {
    const price = signal.price || this.getCurrentPrice(signal.symbol);
    const cost = signal.quantity * price;
    
    // Deduct cash
    this.portfolio.cash -= cost;
    
    // Add or update position
    const existingPosition = this.positions.get(signal.symbol);
    if (existingPosition) {
      // Average down/up
      const totalQuantity = existingPosition.quantity + signal.quantity;
      const totalCost = (existingPosition.quantity * existingPosition.entryPrice) + cost;
      existingPosition.entryPrice = totalCost / totalQuantity;
      existingPosition.quantity = totalQuantity;
    } else {
      // New position
      const position: Position = {
        symbol: signal.symbol,
        quantity: signal.quantity,
        entryPrice: price,
        currentPrice: price,
        entryTime: new Date(),
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        pnl: 0,
        pnlPercentage: 0
      };
      this.positions.set(signal.symbol, position);
    }

    this.logger.info(`Buy order executed for ${signal.symbol}`, { quantity: signal.quantity, price });
  }

  private async executeSell(signal: TradingSignal): Promise<void> {
    const price = signal.price || this.getCurrentPrice(signal.symbol);
    const position = this.positions.get(signal.symbol);
    
    if (!position) {
      throw new Error(`No position found for ${signal.symbol}`);
    }

    if (position.quantity < signal.quantity) {
      throw new Error(`Insufficient position size for ${signal.symbol}`);
    }

    // Calculate PnL
    const pnl = (price - position.entryPrice) * signal.quantity;
    
    // Update cash
    this.portfolio.cash += signal.quantity * price;
    
    // Update position
    if (position.quantity === signal.quantity) {
      // Close entire position
      this.positions.delete(signal.symbol);
    } else {
      // Partial close
      position.quantity -= signal.quantity;
    }

    this.logger.info(`Sell order executed for ${signal.symbol}`, { quantity: signal.quantity, price, pnl });
  }

  private async updatePortfolio(): Promise<void> {
    let totalValue = this.portfolio.cash;
    let totalPnL = 0;

    for (const [symbol, position] of this.positions) {
      const currentPrice = this.getCurrentPrice(symbol);
      position.currentPrice = currentPrice;
      
      const positionPnL = (currentPrice - position.entryPrice) * position.quantity;
      position.pnl = positionPnL;
      position.pnlPercentage = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
      
      totalValue += position.quantity * currentPrice;
      totalPnL += positionPnL;
    }

    this.portfolio.currentValue = totalValue;
    this.portfolio.totalPnL = totalPnL;
    this.portfolio.totalPnLPercentage = ((totalValue - this.portfolio.initialValue) / this.portfolio.initialValue) * 100;
    this.portfolio.positions = Array.from(this.positions.values());
  }

  private getCurrentPrice(symbol: string): number {
    // Mock current price - in real implementation, this would come from market data
    const basePrices: { [key: string]: number } = {
      'BTC/USD': 50000,
      'ETH/USD': 3000,
      'AAPL': 150,
      'GOOGL': 2800,
      'TSLA': 800
    };

    const basePrice = basePrices[symbol] || 100;
    return basePrice + (Math.random() - 0.5) * basePrice * 0.01; // ±0.5% variation
  }

  private generateTradeId(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Blockchain trading methods
  async swapTokens(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    amountOutMin: string
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Portfolio manager not initialized');
    }

    try {
      const recipient = this.blockchainManager.getWalletAddress();
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes

      const transactionHash = await this.uniswapManager.executeSwap(
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMin,
        recipient,
        deadline
      );

      this.logger.info(`Token swap executed: ${tokenIn} -> ${tokenOut}`, { 
        amountIn, 
        amountOutMin, 
        txHash: transactionHash 
      });

      return transactionHash;
    } catch (error) {
      this.logger.error('Failed to swap tokens:', error);
      throw error;
    }
  }

  async getTokenBalance(tokenAddress: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Portfolio manager not initialized');
    }

    try {
      return await this.blockchainManager.getTokenBalance(tokenAddress);
    } catch (error) {
      this.logger.error(`Failed to get token balance for ${tokenAddress}:`, error);
      throw error;
    }
  }

  async getTokenInfo(tokenAddress: string) {
    if (!this.isInitialized) {
      throw new Error('Portfolio manager not initialized');
    }

    try {
      return await this.blockchainManager.getTokenInfo(tokenAddress);
    } catch (error) {
      this.logger.error(`Failed to get token info for ${tokenAddress}:`, error);
      throw error;
    }
  }

  async getSwapQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ) {
    if (!this.isInitialized) {
      throw new Error('Portfolio manager not initialized');
    }

    try {
      return await this.uniswapManager.getSwapQuote(tokenIn, tokenOut, amountIn);
    } catch (error) {
      this.logger.error('Failed to get swap quote:', error);
      throw error;
    }
  }

  getSupportedTokens() {
    return this.uniswapManager.getSupportedTokens();
  }

  getWalletAddress(): string {
    return this.blockchainManager.getWalletAddress();
  }
}
