import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils/Logger';
import * as fs from 'fs';
import * as path from 'path';

export interface MemoryRecord {
  id: string;
  timestamp: Date;
  type: 'cycle' | 'trade' | 'signal' | 'market_event';
  data: any;
  tags: string[];
  importance: number; // 0-1 scale
  accessCount: number;
  lastAccessed: Date;
}

export interface RecallQuery {
  type?: string;
  tags?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  importance?: number;
  limit?: number;
}

export class RecallMemory {
  private config: ConfigManager;
  private logger: Logger;
  private memoryPath: string;
  private memory: Map<string, MemoryRecord>;
  private index: Map<string, Set<string>>; // tag -> record IDs
  private isInitialized: boolean = false;

  constructor(config: ConfigManager) {
    this.config = config;
    this.logger = new Logger();
    this.memoryPath = path.join(process.cwd(), 'data', 'memory');
    this.memory = new Map();
    this.index = new Map();
  }

  async initialize(): Promise<void> {
    try {
      // Create memory directory if it doesn't exist
      if (!fs.existsSync(this.memoryPath)) {
        fs.mkdirSync(this.memoryPath, { recursive: true });
      }

      // Load existing memory from disk
      await this.loadMemoryFromDisk();
      
      // Initialize indexes
      this.rebuildIndexes();
      
      this.isInitialized = true;
      this.logger.info('Recall memory initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize recall memory:', error);
      throw error;
    }
  }

  async recordCycle(cycleData: any): Promise<string> {
    const record: MemoryRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'cycle',
      data: cycleData,
      tags: ['trading_cycle', 'market_analysis'],
      importance: 0.7,
      accessCount: 0,
      lastAccessed: new Date()
    };

    await this.storeRecord(record);
    return record.id;
  }

  async recordTrade(tradeData: any): Promise<string> {
    const record: MemoryRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'trade',
      data: tradeData,
      tags: ['trade_execution', tradeData.symbol, tradeData.action],
      importance: 0.9,
      accessCount: 0,
      lastAccessed: new Date()
    };

    await this.storeRecord(record);
    return record.id;
  }

  async recordSignal(signalData: any): Promise<string> {
    const record: MemoryRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'signal',
      data: signalData,
      tags: ['trading_signal', signalData.symbol, signalData.strategy],
      importance: 0.8,
      accessCount: 0,
      lastAccessed: new Date()
    };

    await this.storeRecord(record);
    return record.id;
  }

  async recordMarketEvent(eventData: any): Promise<string> {
    const record: MemoryRecord = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'market_event',
      data: eventData,
      tags: ['market_event', eventData.type, eventData.symbol],
      importance: 0.6,
      accessCount: 0,
      lastAccessed: new Date()
    };

    await this.storeRecord(record);
    return record.id;
  }

  async recall(query: RecallQuery): Promise<MemoryRecord[]> {
    if (!this.isInitialized) {
      throw new Error('Recall memory not initialized');
    }

    let candidates = new Set<string>();

    // Start with all records
    for (const [id] of this.memory) {
      candidates.add(id);
    }

    // Filter by type
    if (query.type) {
      candidates = this.filterByType(candidates, query.type);
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      candidates = this.filterByTags(candidates, query.tags);
    }

    // Filter by time range
    if (query.timeRange) {
      candidates = this.filterByTimeRange(candidates, query.timeRange);
    }

    // Filter by importance
    if (query.importance !== undefined) {
      candidates = this.filterByImportance(candidates, query.importance);
    }

    // Convert to records and sort by relevance
    const records = Array.from(candidates).map(id => this.memory.get(id)!);
    const sortedRecords = this.sortByRelevance(records);

    // Apply limit
    const limit = query.limit || 100;
    const result = sortedRecords.slice(0, limit);

    // Update access statistics
    for (const record of result) {
      record.accessCount++;
      record.lastAccessed = new Date();
    }

    return result;
  }

  async recallSimilar(sampleData: any, type: string, limit: number = 10): Promise<MemoryRecord[]> {
    const records = await this.recall({ type, limit: 100 });
    
    // Simple similarity scoring based on data structure
    const scoredRecords = records.map(record => ({
      record,
      score: this.calculateSimilarity(sampleData, record.data)
    }));

    // Sort by similarity score
    scoredRecords.sort((a, b) => b.score - a.score);
    
    return scoredRecords.slice(0, limit).map(item => item.record);
  }

  async recallPattern(pattern: any, timeRange: { start: Date; end: Date }): Promise<MemoryRecord[]> {
    const records = await this.recall({ timeRange, limit: 1000 });
    
    // Find records that match the pattern
    const matchingRecords = records.filter(record => 
      this.matchesPattern(record.data, pattern)
    );

    return matchingRecords;
  }

  async getStats(): Promise<any> {
    const totalRecords = this.memory.size;
    const typeCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();

    for (const record of this.memory.values()) {
      // Count by type
      typeCounts.set(record.type, (typeCounts.get(record.type) || 0) + 1);
      
      // Count by tags
      for (const tag of record.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return {
      totalRecords,
      typeCounts: Object.fromEntries(typeCounts),
      tagCounts: Object.fromEntries(tagCounts),
      memorySize: this.getMemorySize(),
      lastUpdated: this.getLastUpdated()
    };
  }

  async cleanup(): Promise<void> {
    const retentionDays = this.config.getMemoryConfig().retentionDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const toDelete: string[] = [];
    
    for (const [id, record] of this.memory) {
      if (record.timestamp < cutoffDate && record.importance < 0.5) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      this.memory.delete(id);
    }

    this.rebuildIndexes();
    this.logger.info(`Cleaned up ${toDelete.length} old memory records`);
  }

  async save(): Promise<void> {
    await this.saveMemoryToDisk();
  }

  private async storeRecord(record: MemoryRecord): Promise<void> {
    this.memory.set(record.id, record);
    
    // Update indexes
    for (const tag of record.tags) {
      if (!this.index.has(tag)) {
        this.index.set(tag, new Set());
      }
      this.index.get(tag)!.add(record.id);
    }

    // Save to disk periodically
    if (this.memory.size % 100 === 0) {
      await this.saveMemoryToDisk();
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private filterByType(candidates: Set<string>, type: string): Set<string> {
    const filtered = new Set<string>();
    for (const id of candidates) {
      const record = this.memory.get(id);
      if (record && record.type === type) {
        filtered.add(id);
      }
    }
    return filtered;
  }

  private filterByTags(candidates: Set<string>, tags: string[]): Set<string> {
    const filtered = new Set<string>();
    for (const id of candidates) {
      const record = this.memory.get(id);
      if (record && tags.some(tag => record.tags.includes(tag))) {
        filtered.add(id);
      }
    }
    return filtered;
  }

  private filterByTimeRange(candidates: Set<string>, timeRange: { start: Date; end: Date }): Set<string> {
    const filtered = new Set<string>();
    for (const id of candidates) {
      const record = this.memory.get(id);
      if (record && record.timestamp >= timeRange.start && record.timestamp <= timeRange.end) {
        filtered.add(id);
      }
    }
    return filtered;
  }

  private filterByImportance(candidates: Set<string>, minImportance: number): Set<string> {
    const filtered = new Set<string>();
    for (const id of candidates) {
      const record = this.memory.get(id);
      if (record && record.importance >= minImportance) {
        filtered.add(id);
      }
    }
    return filtered;
  }

  private sortByRelevance(records: MemoryRecord[]): MemoryRecord[] {
    return records.sort((a, b) => {
      // Sort by importance first, then by recency, then by access count
      if (Math.abs(a.importance - b.importance) > 0.1) {
        return b.importance - a.importance;
      }
      
      const timeDiff = b.timestamp.getTime() - a.timestamp.getTime();
      if (Math.abs(timeDiff) > 60000) { // 1 minute threshold
        return timeDiff;
      }
      
      return b.accessCount - a.accessCount;
    });
  }

  private calculateSimilarity(data1: any, data2: any): number {
    // Simple similarity calculation - can be enhanced with more sophisticated algorithms
    const keys1 = Object.keys(data1);
    const keys2 = Object.keys(data2);
    
    const commonKeys = keys1.filter(key => keys2.includes(key));
    if (commonKeys.length === 0) return 0;
    
    let similarity = 0;
    for (const key of commonKeys) {
      if (data1[key] === data2[key]) {
        similarity += 1;
      } else if (typeof data1[key] === 'number' && typeof data2[key] === 'number') {
        const diff = Math.abs(data1[key] - data2[key]);
        const max = Math.max(Math.abs(data1[key]), Math.abs(data2[key]));
        if (max > 0) {
          similarity += 1 - (diff / max);
        }
      }
    }
    
    return similarity / commonKeys.length;
  }

  private matchesPattern(data: any, pattern: any): boolean {
    // Simple pattern matching - can be enhanced
    for (const [key, value] of Object.entries(pattern)) {
      if (!(key in data)) return false;
      if (typeof value === 'function') {
        if (!value(data[key])) return false;
      } else if (data[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private async loadMemoryFromDisk(): Promise<void> {
    const memoryFile = path.join(this.memoryPath, 'memory.json');
    
    if (fs.existsSync(memoryFile)) {
      try {
        const data = fs.readFileSync(memoryFile, 'utf8');
        const records = JSON.parse(data);
        
        for (const record of records) {
          record.timestamp = new Date(record.timestamp);
          record.lastAccessed = new Date(record.lastAccessed);
          this.memory.set(record.id, record);
        }
        
        this.logger.info(`Loaded ${this.memory.size} memory records from disk`);
      } catch (error) {
        this.logger.warn('Failed to load memory from disk:', error);
      }
    }
  }

  private async saveMemoryToDisk(): Promise<void> {
    try {
      const memoryFile = path.join(this.memoryPath, 'memory.json');
      const records = Array.from(this.memory.values());
      fs.writeFileSync(memoryFile, JSON.stringify(records, null, 2));
    } catch (error) {
      this.logger.error('Failed to save memory to disk:', error);
    }
  }

  private rebuildIndexes(): void {
    this.index.clear();
    
    for (const [id, record] of this.memory) {
      for (const tag of record.tags) {
        if (!this.index.has(tag)) {
          this.index.set(tag, new Set());
        }
        this.index.get(tag)!.add(id);
      }
    }
  }

  private getMemorySize(): number {
    return this.memory.size;
  }

  private getLastUpdated(): Date | null {
    if (this.memory.size === 0) return null;
    
    let latest = new Date(0);
    for (const record of this.memory.values()) {
      if (record.timestamp > latest) {
        latest = record.timestamp;
      }
    }
    return latest;
  }
}

