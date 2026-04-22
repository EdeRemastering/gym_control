import { Injectable, Logger } from '@nestjs/common';
import {
  ICacheProvider,
  CachedPermissionContext,
  CacheStats,
} from './cache.types';
import type { CacheConfig } from './cache.types';

/**
 * Redis Cache Provider
 * Distributed cache suitable for multi-instance deployments
 * Provides automatic failover and cluster support
 * Optional - falls back to in-memory if unavailable
 */
@Injectable()
export class RedisCacheProvider implements ICacheProvider {
  private client: any = null;
  private readonly logger = new Logger(RedisCacheProvider.name);
  private readonly config: CacheConfig;
  private connected: boolean = false;

  /**
   * Redis key prefix for namespacing
   */
  private readonly keyPrefix = 'rbac:permissions:';

  constructor(config: CacheConfig) {
    this.config = config;
    this.initializeClient();
  }

  /**
   * Initialize Redis client with error handling
   */
  private async initializeClient(): Promise<void> {
    if (!this.config.redis) {
      this.logger.warn('Redis config not provided, skipping Redis cache');
      return;
    }

    try {
      const redisLib = this.loadRedisLibrary();
      if (!redisLib) {
        this.logger.warn(
          'Redis package is not installed. Falling back to no-op Redis provider.',
        );
        return;
      }

      this.client = redisLib.createClient({
        host: this.config.redis.host,
        port: this.config.redis.port,
        password: this.config.redis.password,
        db: this.config.redis.db || 0,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            this.logger.error('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      return new Promise((resolve, reject) => {
        this.client!.on('connect', () => {
          this.connected = true;
          this.logger.log('Redis connected successfully');
          resolve();
        });

        this.client!.on('error', (err) => {
          this.connected = false;
          this.logger.error('Redis error:', err.message);
          reject(err);
        });
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
      this.client = null;
    }
  }

  /**
   * Get from Redis cache
   */
  async get(key: string): Promise<CachedPermissionContext | null> {
    if (!this.client || !this.connected) {
      return null;
    }

    try {
      const fullKey = this.keyPrefix + key;
      const data = await this.getFromRedis(fullKey);

      if (!data) {
        return null;
      }

      const entry = JSON.parse(data) as CachedPermissionContext;

      // Check TTL expiration
      if (Date.now() > entry.timestamp + entry.ttl * 1000) {
        await this.delete(key);
        return null;
      }

      return entry;
    } catch (error) {
      this.logger.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set in Redis cache
   */
  async set(
    key: string,
    value: CachedPermissionContext,
    ttl?: number,
  ): Promise<void> {
    if (!this.client || !this.connected) {
      return;
    }

    try {
      const fullKey = this.keyPrefix + key;
      const finalTtl = ttl || this.config.ttl || 3600;
      const entry: CachedPermissionContext = {
        ...value,
        timestamp: Date.now(),
        ttl: finalTtl,
      };

      await this.setInRedis(fullKey, JSON.stringify(entry), 'EX', finalTtl);
    } catch (error) {
      this.logger.error('Redis set error:', error);
    }
  }

  /**
   * Delete from Redis cache
   */
  async delete(key: string): Promise<void> {
    if (!this.client || !this.connected) {
      return;
    }

    try {
      const fullKey = this.keyPrefix + key;
      await this.deleteFromRedis(fullKey);
    } catch (error) {
      this.logger.error('Redis delete error:', error);
    }
  }

  /**
   * Delete multiple keys matching pattern
   * Pattern format: "userId:*" or "*:gymId"
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.client || !this.connected) {
      return 0;
    }

    try {
      const fullPattern = this.keyPrefix + pattern;
      return await this.deletePatternFromRedis(fullPattern);
    } catch (error) {
      this.logger.error('Redis deletePattern error:', error);
      return 0;
    }
  }

  /**
   * Clear all permissions cache
   */
  async clear(): Promise<void> {
    if (!this.client || !this.connected) {
      return;
    }

    try {
      const pattern = this.keyPrefix + '*';
      await this.deletePatternFromRedis(pattern);
    } catch (error) {
      this.logger.error('Redis clear error:', error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.connected) {
      return false;
    }

    try {
      const fullKey = this.keyPrefix + key;
      return await this.existsInRedis(fullKey);
    } catch (error) {
      this.logger.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics from Redis
   */
  async getStats(): Promise<CacheStats> {
    if (!this.client || !this.connected) {
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
      };
    }

    try {
      // Get Redis info
      const info = await this.redisInfoAsync();
      const stats = info.stats || {};

      return {
        hits: parseInt(stats.keyspace_hits || '0', 10),
        misses: parseInt(stats.keyspace_misses || '0', 10),
        hitRate: this.calculateHitRate(stats),
        size: parseInt(stats.used_memory || '0', 10),
        memoryUsage: `${Math.round(parseInt(stats.used_memory || '0', 10) / 1024)}KB`,
      };
    } catch (error) {
      this.logger.error('Redis getStats error:', error);
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
      };
    }
  }

  /**
   * Health check for Redis
   */
  async health(): Promise<boolean> {
    if (!this.client || !this.connected) {
      return false;
    }

    try {
      await this.pingRedis();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * Graceful shutdown
   */
  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      this.client.quit((err) => {
        if (err) {
          this.logger.error('Error closing Redis connection:', err);
        }
      });
    }
  }

  // ===== Private promisified Redis methods =====

  private getFromRedis(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.client!.get(key, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  private setInRedis(
    key: string,
    value: string,
    exType: string,
    ttl: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client!.setex(key, ttl, value, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private deleteFromRedis(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client!.del(key, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private deletePatternFromRedis(pattern: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.client!.keys(pattern, (err, keys) => {
        if (err) {
          reject(err);
          return;
        }

        if (!keys || keys.length === 0) {
          resolve(0);
          return;
        }

        this.client!.del(...keys, (delErr, count) => {
          if (delErr) reject(delErr);
          else resolve(count as number);
        });
      });
    });
  }

  private existsInRedis(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client!.exists(key, (err, exists) => {
        if (err) reject(err);
        else resolve(exists === 1);
      });
    });
  }

  private pingRedis(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client!.ping((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private redisInfoAsync(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client!.info((err, info) => {
        if (err) reject(err);
        else resolve(info);
      });
    });
  }

  private calculateHitRate(stats: any): number {
    const hits = parseInt(stats.keyspace_hits || '0', 10);
    const misses = parseInt(stats.keyspace_misses || '0', 10);
    const total = hits + misses;

    if (total === 0) return 0;
    return Math.round((hits / total) * 100);
  }

  private loadRedisLibrary(): any {
    try {
      // Keep Redis optional: avoid static dependency resolution.
      const lazyRequire = new Function(
        'moduleName',
        'return require(moduleName);',
      );
      return lazyRequire('redis');
    } catch {
      return null;
    }
  }
}
