import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils/Logger';
import { MarketData } from '../strategy/TradingStrategy';

export class MarketDataManager {
  private config: ConfigManager;
  private logger: Logger;
  private isInitialized: boolean = false;
  private isStreaming: boolean = false;
  private mockDataInterval?: NodeJS.Timeout;

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger();
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing market data manager...');
      this.isInitialized = true;
      this.logger.info('Market data manager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize market data manager:', error);
      throw error;
    }
  }

  async startStreaming(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Market data manager not initialized');
    }

    if (this.isStreaming) {
      this.logger.warn('Market data streaming already started');
      return;
    }

    this.logger.info('Starting market data streaming...');
    this.isStreaming = true;

    // For now, use mock data - this can be replaced with real market data sources
    this.startMockDataStream();
  }

  async stopStreaming(): Promise<void> {
    if (!this.isStreaming) {
      return;
    }

    this.logger.info('Stopping market data streaming...');
    this.isStreaming = false;

    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
      this.mockDataInterval = undefined;
    }
  }

  async getCurrentData(): Promise<MarketData[]> {
    if (!this.isInitialized) {
      throw new Error('Market data manager not initialized');
    }

    // Return mock data for now
    return this.generateMockData();
  }

  async getTokenData(chain: string, token: string): Promise<MarketData | null> {
    if (!this.isInitialized) {
      throw new Error('Market data manager not initialized');
    }

    // For now, return mock data for the token
    // In a real implementation, this would fetch data from blockchain APIs
    const basePrice = this.getBasePrice(token);
    const price = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
    const volume = Math.random() * 1000000 + 100000;

    return {
      symbol: token,
      price: Math.round(price * 100) / 100,
      volume: Math.round(volume),
      timestamp: new Date(),
      indicators: {
        rsi: Math.random() * 100,
        macd: (Math.random() - 0.5) * 2,
        movingAverage: basePrice + (Math.random() - 0.5) * basePrice * 0.01,
        volatility: Math.random() * 0.1
      }
    };
  }

  private startMockDataStream(): void {
    this.mockDataInterval = setInterval(() => {
      if (!this.isStreaming) {
        return;
      }

      try {
        const mockData = this.generateMockData();
        this.logger.market('Mock market data generated', { count: mockData.length });
      } catch (error) {
        this.logger.error('Error generating mock market data:', error);
      }
    }, this.config.getUpdateInterval());
  }

  private generateMockData(): MarketData[] {
    const symbols = this.config.getSymbols();
    const mockData: MarketData[] = [];

    for (const symbol of symbols) {
      const basePrice = this.getBasePrice(symbol);
      const price = basePrice + (Math.random() - 0.5) * basePrice * 0.02; // ±1% variation
      const volume = Math.random() * 1000000 + 100000; // 100k to 1.1M

      mockData.push({
        symbol,
        price: Math.round(price * 100) / 100, // Round to 2 decimal places
        volume: Math.round(volume),
        timestamp: new Date(),
        indicators: {
          rsi: Math.random() * 100, // 0-100
          macd: (Math.random() - 0.5) * 2, // -1 to 1
          movingAverage: basePrice + (Math.random() - 0.5) * basePrice * 0.01,
          volatility: Math.random() * 0.1 // 0-10%
        }
      });
    }

    return mockData;
  }

  private getBasePrice(symbol: string): number {
    // Mock base prices for different asset types
    const basePrices: { [key: string]: number } = {
      'BTC/USD': 50000,
      'ETH/USD': 3000,
      'AAPL': 150,
      'GOOGL': 2800,
      'TSLA': 800,
      // Meme token prices
      'PEPE': 0.000001,
      'SHIB': 0.00001,
      'DOGE': 0.08,
      'FLOKI': 0.00002,
      'BALD': 0.0001,
      'TOSHI': 0.00005,
      'SAFEMOON': 0.000001,
      'BABYDOGE': 0.0000001
    };

    return basePrices[symbol] || 100;
  }
}
