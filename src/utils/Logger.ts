import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

export class Logger {
  private logger!: winston.Logger;
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    this.initializeLogger();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private initializeLogger(): void {
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss'
      }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
          metaStr = ` ${JSON.stringify(meta)}`;
        }
        return `${timestamp} [${level}]: ${message}${metaStr}`;
      })
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'recall-trading-agent' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: consoleFormat
        }),
        
        // File transport for all logs
        new winston.transports.File({
          filename: path.join(this.logDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        
        // File transport for errors only
        new winston.transports.File({
          filename: path.join(this.logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        
        // File transport for trading operations
        new winston.transports.File({
          filename: path.join(this.logDir, 'trading.log'),
          level: 'info',
          maxsize: 5242880, // 5MB
          maxFiles: 10,
          tailable: true
        })
      ]
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new winston.transports.File({
        filename: path.join(this.logDir, 'exceptions.log')
      })
    );

    // Handle unhandled promise rejections
    this.logger.rejections.handle(
      new winston.transports.File({
        filename: path.join(this.logDir, 'rejections.log')
      })
    );
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }

  // Specialized logging methods for trading operations
  trade(message: string, tradeData?: any): void {
    this.logger.info(`[TRADE] ${message}`, { 
      type: 'trade', 
      data: tradeData,
      timestamp: new Date().toISOString()
    });
  }

  signal(message: string, signalData?: any): void {
    this.logger.info(`[SIGNAL] ${message}`, { 
      type: 'signal', 
      data: signalData,
      timestamp: new Date().toISOString()
    });
  }

  market(message: string, marketData?: any): void {
    this.logger.info(`[MARKET] ${message}`, { 
      type: 'market', 
      data: marketData,
      timestamp: new Date().toISOString()
    });
  }

  risk(message: string, riskData?: any): void {
    this.logger.warn(`[RISK] ${message}`, { 
      type: 'risk', 
      data: riskData,
      timestamp: new Date().toISOString()
    });
  }

  performance(message: string, performanceData?: any): void {
    this.logger.info(`[PERFORMANCE] ${message}`, { 
      type: 'performance', 
      data: performanceData,
      timestamp: new Date().toISOString()
    });
  }

  memory(message: string, memoryData?: any): void {
    this.logger.debug(`[MEMORY] ${message}`, { 
      type: 'memory', 
      data: memoryData,
      timestamp: new Date().toISOString()
    });
  }

  // Method to get log file paths
  getLogFiles(): string[] {
    try {
      return fs.readdirSync(this.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => path.join(this.logDir, file));
    } catch (error) {
      return [];
    }
  }

  // Method to clear old logs
  async cleanupOldLogs(maxAgeDays: number = 30): Promise<void> {
    try {
      const files = this.getLogFiles();
      const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
      
      for (const file of files) {
        const stats = fs.statSync(file);
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(file);
          this.info(`Cleaned up old log file: ${file}`);
        }
      }
    } catch (error) {
      this.error('Failed to cleanup old logs:', error);
    }
  }

  // Method to get logger instance (for advanced usage)
  getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}
