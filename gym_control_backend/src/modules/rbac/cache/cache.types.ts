/**
 * Cache Types and Interfaces for RBAC System
 * Defines contracts for both in-memory and Redis caching strategies
 */

export interface CachedPermissionContext {
  userId: string;
  gymId: string;
  roles: string[];
  permissions: Array<{
    resource: string;
    action: string;
    scopes: string[];
  }>;
  timestamp: number;
  ttl: number;
}

export interface PermissionCachePayload {
  roles: string[];
  permissions: Array<{
    resource: string;
    action: string;
    scopes: string[];
  }>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage?: string;
}

export interface ICacheProvider {
  /**
   * Get cached permissions
   */
  get(key: string): Promise<CachedPermissionContext | null>;

  /**
   * Set permissions in cache
   */
  set(key: string, value: CachedPermissionContext, ttl?: number): Promise<void>;

  /**
   * Delete from cache
   */
  delete(key: string): Promise<void>;

  /**
   * Delete multiple keys (pattern or list)
   */
  deletePattern(pattern: string): Promise<number>;

  /**
   * Clear entire cache
   */
  clear(): Promise<void>;

  /**
   * Check if key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<CacheStats>;

  /**
   * Health check
   */
  health(): Promise<boolean>;
}

export interface CacheConfig {
  enabled: boolean;
  provider: 'memory' | 'redis';
  ttl: number; // seconds
  maxSize?: number; // for memory cache
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

export enum CacheInvalidationReason {
  ROLE_CREATED = 'ROLE_CREATED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  ROLE_DELETED = 'ROLE_DELETED',
  USER_ROLE_ASSIGNED = 'USER_ROLE_ASSIGNED',
  USER_ROLE_REMOVED = 'USER_ROLE_REMOVED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  EXPLICIT_INVALIDATION = 'EXPLICIT_INVALIDATION',
}

export interface CacheInvalidationEvent {
  userId?: string;
  gymId?: string;
  reason: CacheInvalidationReason;
  pattern?: string; // for bulk invalidation
  timestamp: number;
}
