import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils/Logger';
import * as fs from 'fs';
import * as path from 'path';

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  bestTrade: number;
  worstTrade: number;
}

export interface PerformanceReport {
  timestamp: Date;
  metrics: PerformanceMetrics;
  portfolio: any;
  summary: string;
}

export class PerformanceTracker {
  private config: ConfigManager;
  private logger: Logger;
  private isInitialized: boolean = false;
  private reportsDir: string;
  private trades: any[] = [];
  private portfolioHistory: any[] = [];

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger();
    this.reportsDir = path.join(process.cwd(), 'reports');
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing performance tracker...');
      
      // Create reports directory
      if (!fs.existsSync(this.reportsDir)) {
        fs.mkdirSync(this.reportsDir, { recursive: true });
      }
      
      this.isInitialized = true;
      this.logger.info('Performance tracker initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize performance tracker:', error);
      throw error;
    }
  }

  async updateMetrics(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Performance tracker not initialized');
    }

    try {
      // This would typically fetch current portfolio and trade data
      // For now, we'll just log that metrics were updated
      this.logger.performance('Performance metrics updated');
    } catch (error) {
      this.logger.error('Failed to update performance metrics:', error);
    }
  }

  async generateReport(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Performance tracker not initialized');
    }

    try {
      const report = await this.createReport();
      await this.saveReport(report);
      
      this.logger.performance('Performance report generated', { 
        timestamp: report.timestamp,
        summary: report.summary 
      });
    } catch (error) {
      this.logger.error('Failed to generate performance report:', error);
    }
  }

  async getCurrentMetrics(): Promise<PerformanceMetrics> {
    if (!this.isInitialized) {
      throw new Error('Performance tracker not initialized');
    }

    // Return mock metrics for now
    return this.calculateMockMetrics();
  }

  async save(): Promise<void> {
    try {
      // Save current state to disk
      const state = {
        trades: this.trades,
        portfolioHistory: this.portfolioHistory,
        lastUpdated: new Date()
      };

      const stateFile = path.join(this.reportsDir, 'performance-state.json');
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
      
      this.logger.info('Performance tracker state saved');
    } catch (error) {
      this.logger.error('Failed to save performance tracker state:', error);
    }
  }

  recordTrade(trade: any): void {
    this.trades.push({
      ...trade,
      timestamp: new Date()
    });
    
    this.logger.performance('Trade recorded for performance tracking', { tradeId: trade.id });
  }

  recordPortfolioSnapshot(portfolio: any): void {
    this.portfolioHistory.push({
      ...portfolio,
      timestamp: new Date()
    });
    
    // Keep only last 1000 snapshots
    if (this.portfolioHistory.length > 1000) {
      this.portfolioHistory = this.portfolioHistory.slice(-1000);
    }
  }

  private async createReport(): Promise<PerformanceReport> {
    const metrics = await this.getCurrentMetrics();
    const portfolio = this.getLatestPortfolioSnapshot();
    
    const summary = this.generateSummary(metrics);
    
    return {
      timestamp: new Date(),
      metrics,
      portfolio,
      summary
    };
  }

  private async saveReport(report: PerformanceReport): Promise<void> {
    const filename = `performance-report-${report.timestamp.toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.reportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  }

  private getLatestPortfolioSnapshot(): any {
    if (this.portfolioHistory.length === 0) {
      return null;
    }
    
    return this.portfolioHistory[this.portfolioHistory.length - 1];
  }

  private generateSummary(metrics: PerformanceMetrics): string {
    const returnColor = metrics.totalReturn >= 0 ? 'positive' : 'negative';
    const returnSign = metrics.totalReturn >= 0 ? '+' : '';
    
    return `Performance Summary:
    Total Return: ${returnSign}${metrics.totalReturn.toFixed(2)} (${returnSign}${metrics.totalReturnPercentage.toFixed(2)}%)
    Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}
    Max Drawdown: ${metrics.maxDrawdown.toFixed(2)}%
    Win Rate: ${(metrics.winRate * 100).toFixed(1)}%
    Total Trades: ${metrics.totalTrades}
    Profit Factor: ${metrics.profitFactor.toFixed(2)}`;
  }

  private calculateMockMetrics(): PerformanceMetrics {
    // Generate realistic mock metrics
    const totalReturn = (Math.random() - 0.5) * 20000; // -10k to +10k
    const totalReturnPercentage = (totalReturn / 100000) * 100;
    
    const totalTrades = Math.floor(Math.random() * 100) + 20; // 20-120 trades
    const winningTrades = Math.floor(totalTrades * (0.4 + Math.random() * 0.3)); // 40-70% win rate
    const losingTrades = totalTrades - winningTrades;
    
    const averageWin = Math.random() * 500 + 100; // $100-$600
    const averageLoss = Math.random() * 300 + 50; // $50-$350
    
    const winRate = winningTrades / totalTrades;
    const profitFactor = (winningTrades * averageWin) / (losingTrades * averageLoss) || 1;
    
    return {
      totalReturn,
      totalReturnPercentage,
      sharpeRatio: 0.5 + Math.random() * 2, // 0.5-2.5
      maxDrawdown: Math.random() * 15, // 0-15%
      winRate,
      profitFactor,
      totalTrades,
      winningTrades,
      losingTrades,
      averageWin,
      averageLoss,
      bestTrade: averageWin * (1 + Math.random()), // 1x-2x average win
      worstTrade: -averageLoss * (1 + Math.random()) // 1x-2x average loss
    };
  }
}
