import axios from 'axios';
import { Logger } from '../utils/Logger';

export interface RecallTradeRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  reason?: string;
  chainId?: number;
}

export interface RecallTradeResponse {
  success: boolean;
  tradeId?: string;
  message: string;
  details?: any;
}

export class RecallNetworkIntegration {
  private apiKey: string;
  private apiUrl: string;
  private logger: Logger;

  constructor(apiKey: string, apiUrl: string = 'https://api.sandbox.competitions.recall.network') {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.logger = new Logger();
  }

  /**
   * Execute a trade on Recall Network
   */
  async executeTrade(tradeRequest: RecallTradeRequest): Promise<RecallTradeResponse> {
    try {
      this.logger.info(`Executing trade on Recall Network: ${tradeRequest.fromToken} -> ${tradeRequest.toToken}`);

      const response = await axios.post(
        `${this.apiUrl}/api/trade/execute`,
        tradeRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      this.logger.info(`Trade executed successfully: ${response.data.tradeId}`);
      return {
        success: true,
        tradeId: response.data.tradeId,
        message: 'Trade executed successfully',
        details: response.data
      };

    } catch (error: any) {
      this.logger.error('Failed to execute trade on Recall Network:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Unknown error occurred',
        details: error.response?.data
      };
    }
  }

  /**
   * Get portfolio information from Recall Network
   */
  async getPortfolio(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/portfolio`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to get portfolio from Recall Network:', error);
      throw error;
    }
  }

  /**
   * Get available tokens from Recall Network
   */
  async getAvailableTokens(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/tokens`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to get available tokens from Recall Network:', error);
      throw error;
    }
  }

  /**
   * Get competition status
   */
  async getCompetitionStatus(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/competition/status`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to get competition status from Recall Network:', error);
      throw error;
    }
  }
}
