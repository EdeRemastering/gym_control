import { Injectable } from '@nestjs/common';
import {
  ICacheProvider,
  CachedPermissionContext,
  CacheStats,
} from './cache.types';
import type { CacheConfig } from './cache.types';

/**
 * In-Memory Cache Provider
 * Thread-safe, performant cache using Map
 * Suitable for single-instance deployments
 * Automatically expires entries based on TTL
 */
@Injectable()
export class InMemoryCacheProvider implements ICacheProvider {
  private cache: Map<string, CachedPermissionContext> = new Map();
  private expiryTimers: Map<string, NodeJS.Timeout> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
  };

  private readonly defaultTtl: number;
  private readonly maxSize: number;

  constructor(config: CacheConfig) {
    this.defaultTtl = config.ttl || 3600; // 1 hour default
    this.maxSize = config.maxSize || 10000;
  }

  /**
   * Get from cache with TTL validation
   */
  async get(key: string): Promise<CachedPermissionContext | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl * 1000) {
      this.cache.delete(key);
      this.clearExpiry(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry;
  }

  /**
   * Set in cache with automatic expiry
   */
  async set(
    key: string,
    value: CachedPermissionContext,
    ttl?: number,
  ): Promise<void> {
    // Enforce max size - simple LRU strategy: delete oldest
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.clearExpiry(firstKey);
      }
    }

    const finalTtl = ttl || this.defaultTtl;
    const entry: CachedPermissionContext = {
      ...value,
      timestamp: Date.now(),
      ttl: finalTtl,
    };

    // Clear existing expiry timer
    this.clearExpiry(key);

    // Store in cache
    this.cache.set(key, entry);

    // Schedule expiry
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.expiryTimers.delete(key);
    }, finalTtl * 1000);
    timer.unref?.();

    this.expiryTimers.set(key, timer);
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.clearExpiry(key);
  }

  /**
   * Delete multiple keys matching pattern
   * Pattern format: "userId:{{pattern}}:*" or "*:gymId:*"
   */
  async deletePattern(pattern: string): Promise<number> {
    const regex = new RegExp(
      `^${pattern.replace(/\*/g, '.*').replace(/\./g, '\\.')}$`,
    );
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.clearExpiry(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();

    // Clear all timers
    for (const timer of this.expiryTimers.values()) {
      clearTimeout(timer);
    }
    this.expiryTimers.clear();

    // Reset stats
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total === 0 ? 0 : (this.stats.hits / total) * 100;

    // Rough memory estimation (objects in JS)
    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      // Approximate: key + timestamp + ttl + array sizes
      memoryUsage +=
        JSON.stringify(entry).length +
        (entry.roles.length + entry.permissions.length) * 100;
    }

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
      memoryUsage: `~${Math.round(memoryUsage / 1024)}KB`,
    };
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    return true; // In-memory cache is always healthy
  }

  /**
   * Private helper to clear expiry timer
   */
  private clearExpiry(key: string): void {
    const timer = this.expiryTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.expiryTimers.delete(key);
    }
  }
}
