import { ConfigManager } from '../config/ConfigManager';
import { RecallMemory } from '../memory/RecallMemory';
import { Logger } from '../utils/Logger';

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  indicators: {
    rsi?: number;
    macd?: number;
    movingAverage?: number;
    volatility?: number;
  };
}

export interface MarketAnalysis {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1 scale
  confidence: number; // 0-1 scale
  signals: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface TradingSignal {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  quantity: number;
  price: number;
  strategy: string;
  confidence: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: Date;
}

export class TradingStrategy {
  private config: ConfigManager;
  private logger: Logger;
  private isInitialized: boolean = false;

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger();
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing trading strategy...');
      this.isInitialized = true;
      this.logger.info('Trading strategy initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize trading strategy:', error);
      throw error;
    }
  }

  async analyzeMarket(marketData: MarketData[], memory: RecallMemory): Promise<MarketAnalysis[]> {
    if (!this.isInitialized) {
      throw new Error('Trading strategy not initialized');
    }

    const analyses: MarketAnalysis[] = [];

    for (const data of marketData) {
      try {
        // Get historical data from memory for context
        const historicalData = await memory.recall({
          type: 'cycle',
          tags: [data.symbol, 'market_analysis'],
          limit: 50
        });

        // Analyze current market conditions
        const analysis = await this.analyzeSymbol(data, historicalData);
        analyses.push(analysis);

      } catch (error) {
        this.logger.error(`Failed to analyze market for ${data.symbol}:`, error);
        // Add neutral analysis as fallback
        analyses.push({
          symbol: data.symbol,
          trend: 'neutral',
          strength: 0.5,
          confidence: 0.3,
          signals: ['analysis_failed'],
          riskLevel: 'medium'
        });
      }
    }

    return analyses;
  }

  async generateSignals(analysis: MarketAnalysis[], riskAssessment: any): Promise<TradingSignal[]> {
    if (!this.isInitialized) {
      throw new Error('Trading strategy not initialized');
    }

    const signals: TradingSignal[] = [];

    for (const marketAnalysis of analysis) {
      try {
        // Generate signals based on analysis and risk assessment
        const signal = await this.generateSignalForSymbol(marketAnalysis, riskAssessment);
        
        if (signal && signal.action !== 'hold') {
          signals.push(signal);
        }

      } catch (error) {
        this.logger.error(`Failed to generate signal for ${marketAnalysis.symbol}:`, error);
      }
    }

    // Sort signals by confidence
    signals.sort((a, b) => b.confidence - a.confidence);

    return signals;
  }

  private async analyzeSymbol(data: MarketData, historicalData: any[]): Promise<MarketAnalysis> {
    const analysis: MarketAnalysis = {
      symbol: data.symbol,
      trend: 'neutral',
      strength: 0.5,
      confidence: 0.5,
      signals: [],
      riskLevel: 'medium'
    };

    // Technical analysis
    const technicalSignals = this.analyzeTechnicalIndicators(data);
    analysis.signals.push(...technicalSignals);

    // Pattern recognition using recall memory
    const patternSignals = await this.recognizePatterns(data, historicalData);
    analysis.signals.push(...patternSignals);

    // Determine trend and strength
    analysis.trend = this.determineTrend(data, technicalSignals);
    analysis.strength = this.calculateTrendStrength(data, technicalSignals);
    analysis.confidence = this.calculateConfidence(technicalSignals, patternSignals);
    analysis.riskLevel = this.assessRiskLevel(data, analysis);

    return analysis;
  }

  private analyzeTechnicalIndicators(data: MarketData): string[] {
    const signals: string[] = [];

    // RSI analysis
    if (data.indicators.rsi !== undefined) {
      if (data.indicators.rsi < 30) {
        signals.push('rsi_oversold');
      } else if (data.indicators.rsi > 70) {
        signals.push('rsi_overbought');
      }
    }

    // MACD analysis
    if (data.indicators.macd !== undefined) {
      if (data.indicators.macd > 0) {
        signals.push('macd_bullish');
      } else {
        signals.push('macd_bearish');
      }
    }

    // Moving average analysis
    if (data.indicators.movingAverage !== undefined) {
      if (data.price > data.indicators.movingAverage) {
        signals.push('price_above_ma');
      } else {
        signals.push('price_below_ma');
      }
    }

    // Volatility analysis
    if (data.indicators.volatility !== undefined) {
      if (data.indicators.volatility > 0.05) {
        signals.push('high_volatility');
      } else {
        signals.push('low_volatility');
      }
    }

    return signals;
  }

  private async recognizePatterns(data: MarketData, historicalData: any[]): Promise<string[]> {
    const signals: string[] = [];

    if (historicalData.length < 10) {
      return signals;
    }

    // Look for price patterns
    const pricePatterns = this.findPricePatterns(data, historicalData);
    signals.push(...pricePatterns);

    // Look for volume patterns
    const volumePatterns = this.findVolumePatterns(data, historicalData);
    signals.push(...volumePatterns);

    // Look for support/resistance levels
    const supportResistance = this.findSupportResistanceLevels(data, historicalData);
    signals.push(...supportResistance);

    return signals;
  }

  private findPricePatterns(data: MarketData, historicalData: any[]): string[] {
    const patterns: string[] = [];
    
    // Simple pattern detection - can be enhanced with more sophisticated algorithms
    const recentPrices = historicalData
      .slice(-20)
      .map(record => record.data?.marketData?.find((md: any) => md.symbol === data.symbol)?.price)
      .filter(price => price !== undefined);

    if (recentPrices.length >= 3) {
      // Check for trend continuation
      if (recentPrices[recentPrices.length - 1] > recentPrices[recentPrices.length - 2] &&
          recentPrices[recentPrices.length - 2] > recentPrices[recentPrices.length - 3]) {
        patterns.push('uptrend_continuation');
      } else if (recentPrices[recentPrices.length - 1] < recentPrices[recentPrices.length - 2] &&
                 recentPrices[recentPrices.length - 2] < recentPrices[recentPrices.length - 3]) {
        patterns.push('downtrend_continuation');
      }

      // Check for reversal patterns
      if (recentPrices[recentPrices.length - 1] > recentPrices[recentPrices.length - 2] &&
          recentPrices[recentPrices.length - 2] < recentPrices[recentPrices.length - 3]) {
        patterns.push('potential_reversal_bullish');
      } else if (recentPrices[recentPrices.length - 1] < recentPrices[recentPrices.length - 2] &&
                 recentPrices[recentPrices.length - 2] > recentPrices[recentPrices.length - 3]) {
        patterns.push('potential_reversal_bearish');
      }
    }

    return patterns;
  }

  private findVolumePatterns(data: MarketData, historicalData: any[]): string[] {
    const patterns: string[] = [];
    
    // Simple volume analysis
    const recentVolumes = historicalData
      .slice(-10)
      .map(record => record.data?.marketData?.find((md: any) => md.symbol === data.symbol)?.volume)
      .filter(volume => volume !== undefined);

    if (recentVolumes.length >= 3) {
      const avgVolume = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
      
      if (data.volume > avgVolume * 1.5) {
        patterns.push('high_volume');
      } else if (data.volume < avgVolume * 0.5) {
        patterns.push('low_volume');
      }
    }

    return patterns;
  }

  private findSupportResistanceLevels(data: MarketData, historicalData: any[]): string[] {
    const levels: string[] = [];
    
    // Simple support/resistance detection
    const recentPrices = historicalData
      .slice(-50)
      .map(record => record.data?.marketData?.find((md: any) => md.symbol === data.symbol)?.price)
      .filter(price => price !== undefined);

    if (recentPrices.length >= 10) {
      const minPrice = Math.min(...recentPrices);
      const maxPrice = Math.max(...recentPrices);
      
      if (Math.abs(data.price - minPrice) / data.price < 0.02) {
        levels.push('near_support');
      }
      
      if (Math.abs(data.price - maxPrice) / data.price < 0.02) {
        levels.push('near_resistance');
      }
    }

    return levels;
  }

  private determineTrend(data: MarketData, signals: string[]): 'bullish' | 'bearish' | 'neutral' {
    let bullishCount = 0;
    let bearishCount = 0;

    for (const signal of signals) {
      if (signal.includes('bullish') || signal.includes('above') || signal.includes('oversold')) {
        bullishCount++;
      } else if (signal.includes('bearish') || signal.includes('below') || signal.includes('overbought')) {
        bearishCount++;
      }
    }

    if (bullishCount > bearishCount + 1) {
      return 'bullish';
    } else if (bearishCount > bullishCount + 1) {
      return 'bearish';
    } else {
      return 'neutral';
    }
  }

  private calculateTrendStrength(data: MarketData, signals: string[]): number {
    let strength = 0.5; // Base neutral strength

    // Adjust based on signal strength
    for (const signal of signals) {
      if (signal.includes('strong')) {
        strength += 0.1;
      } else if (signal.includes('weak')) {
        strength -= 0.1;
      }
    }

    // Adjust based on price movement
    if (data.indicators.volatility !== undefined) {
      strength += data.indicators.volatility * 0.5;
    }

    return Math.max(0, Math.min(1, strength));
  }

  private calculateConfidence(technicalSignals: string[], patternSignals: string[]): number {
    let confidence = 0.5; // Base confidence

    // Technical signals contribute more to confidence
    confidence += technicalSignals.length * 0.05;
    
    // Pattern signals contribute less but still significant
    confidence += patternSignals.length * 0.03;

    // Cap confidence at 0.95
    return Math.min(0.95, confidence);
  }

  private assessRiskLevel(data: MarketData, analysis: MarketAnalysis): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // High volatility increases risk
    if (data.indicators.volatility !== undefined && data.indicators.volatility > 0.1) {
      riskScore += 2;
    }

    // Low confidence increases risk
    if (analysis.confidence < 0.4) {
      riskScore += 2;
    }

    // Strong trends can be risky
    if (analysis.strength > 0.8) {
      riskScore += 1;
    }

    if (riskScore >= 3) {
      return 'high';
    } else if (riskScore >= 1) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private async generateSignalForSymbol(analysis: MarketAnalysis, riskAssessment: any): Promise<TradingSignal | null> {
    // Skip if risk is too high
    if (analysis.riskLevel === 'high' && riskAssessment.riskLevel === 'high') {
      return null;
    }

    // Skip if confidence is too low
    if (analysis.confidence < 0.4) {
      return null;
    }

    // Generate signal based on trend and signals
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let confidence = analysis.confidence;

    if (analysis.trend === 'bullish' && analysis.signals.some(s => s.includes('bullish'))) {
      action = 'buy';
      confidence += 0.1;
    } else if (analysis.trend === 'bearish' && analysis.signals.some(s => s.includes('bearish'))) {
      action = 'sell';
      confidence += 0.1;
    }

    if (action === 'hold') {
      return null;
    }

    // Calculate position size based on confidence and risk
    const baseQuantity = this.config.getMaxPositionSize() * 0.1; // 10% of max position
    const quantity = Math.round(baseQuantity * confidence);

    // Calculate stop loss and take profit
    const stopLossPercentage = this.config.getStopLossPercentage();
    const takeProfitPercentage = this.config.getTakeProfitPercentage();

    const signal: TradingSignal = {
      symbol: analysis.symbol,
      action,
      quantity,
      price: 0, // Will be set by market data
      strategy: 'recall_enhanced',
      confidence: Math.min(0.95, confidence),
      stopLoss: action === 'buy' ? -(stopLossPercentage) : stopLossPercentage,
      takeProfit: action === 'buy' ? takeProfitPercentage : -(takeProfitPercentage),
      timestamp: new Date()
    };

    return signal;
  }
}
