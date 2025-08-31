import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils/Logger';

export interface RiskAssessment {
  isAcceptable: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  warnings: string[];
  maxPositionSize: number;
}

export interface SignalValidation {
  isValid: boolean;
  riskScore: number;
  warnings: string[];
  suggestedModifications?: any;
}

export class RiskManager {
  private config: ConfigManager;
  private logger: Logger;
  private isInitialized: boolean = false;
  private dailyLoss: number = 0;
  private openPositions: number = 0;

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger();
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing risk manager...');
      this.isInitialized = true;
      this.logger.info('Risk manager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize risk manager:', error);
      throw error;
    }
  }

  async assessRisk(analysis: any, portfolio: any): Promise<RiskAssessment> {
    if (!this.isInitialized) {
      throw new Error('Risk manager not initialized');
    }

    let riskScore = 0;
    const warnings: string[] = [];

    // Check daily loss limit
    if (this.dailyLoss >= this.config.getMaxDailyLoss()) {
      riskScore += 50;
      warnings.push('Daily loss limit reached');
    }

    // Check drawdown
    const currentDrawdown = this.calculateDrawdown(portfolio);
    if (currentDrawdown > this.config.getMaxDrawdown()) {
      riskScore += 40;
      warnings.push('Maximum drawdown exceeded');
    }

    // Check open positions
    if (this.openPositions >= this.config.getMaxOpenPositions()) {
      riskScore += 30;
      warnings.push('Maximum open positions reached');
    }

    // Check market volatility
    if (analysis && analysis.some((a: any) => a.riskLevel === 'high')) {
      riskScore += 20;
      warnings.push('High market volatility detected');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore >= 70) {
      riskLevel = 'high';
    } else if (riskScore >= 30) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    // Calculate acceptable position size
    const maxPositionSize = this.calculateMaxPositionSize(riskScore);

    const assessment: RiskAssessment = {
      isAcceptable: riskScore < 70,
      riskLevel,
      riskScore,
      warnings,
      maxPositionSize
    };

    this.logger.risk('Risk assessment completed', assessment);
    return assessment;
  }

  async validateSignal(signal: any): Promise<SignalValidation> {
    if (!this.isInitialized) {
      throw new Error('Risk manager not initialized');
    }

    let riskScore = 0;
    const warnings: string[] = [];

    // Check position size
    const positionValue = signal.quantity * signal.price;
    if (positionValue > this.config.getMaxPositionSize()) {
      riskScore += 30;
      warnings.push('Position size exceeds maximum allowed');
    }

    // Check confidence level
    if (signal.confidence < 0.6) {
      riskScore += 20;
      warnings.push('Low confidence signal');
    }

    // Check stop loss and take profit
    if (!signal.stopLoss || !signal.takeProfit) {
      riskScore += 15;
      warnings.push('Missing stop loss or take profit');
    }

    // Check if we're already at max positions
    if (this.openPositions >= this.config.getMaxOpenPositions()) {
      riskScore += 25;
      warnings.push('Maximum open positions reached');
    }

    const validation: SignalValidation = {
      isValid: riskScore < 50,
      riskScore,
      warnings
    };

    if (!validation.isValid) {
      this.logger.risk('Signal validation failed', { signal, validation });
    }

    return validation;
  }

  updateDailyLoss(loss: number): void {
    this.dailyLoss += loss;
    this.logger.risk('Daily loss updated', { current: this.dailyLoss, limit: this.config.getMaxDailyLoss() });
  }

  updateOpenPositions(count: number): void {
    this.openPositions = count;
    this.logger.risk('Open positions updated', { current: this.openPositions, limit: this.config.getMaxOpenPositions() });
  }

  resetDailyLoss(): void {
    this.dailyLoss = 0;
    this.logger.info('Daily loss reset to 0');
  }

  private calculateDrawdown(portfolio: any): number {
    // Simple drawdown calculation - can be enhanced
    if (!portfolio || !portfolio.initialValue || !portfolio.currentValue) {
      return 0;
    }

    const drawdown = (portfolio.initialValue - portfolio.currentValue) / portfolio.initialValue;
    return Math.max(0, drawdown);
  }

  private calculateMaxPositionSize(riskScore: number): number {
    const baseSize = this.config.getMaxPositionSize();
    
    // Reduce position size based on risk score
    if (riskScore >= 70) {
      return baseSize * 0.1; // 10% of max
    } else if (riskScore >= 50) {
      return baseSize * 0.3; // 30% of max
    } else if (riskScore >= 30) {
      return baseSize * 0.6; // 60% of max
    } else {
      return baseSize; // Full size
    }
  }
}
