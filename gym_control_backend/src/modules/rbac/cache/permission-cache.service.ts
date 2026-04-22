import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CacheConfig,
  CachedPermissionContext,
  ICacheProvider,
  PermissionCachePayload,
} from './cache.types';
import { InMemoryCacheProvider } from './in-memory.cache';
import { RedisCacheProvider } from './redis.cache';

@Injectable()
export class PermissionCacheService {
  private readonly logger = new Logger(PermissionCacheService.name);
  private readonly provider: ICacheProvider;
  private readonly inFlightLoads = new Map<
    string,
    Promise<PermissionCachePayload>
  >();
  private readonly ttlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    const cacheConfig = this.getCacheConfig();
    this.ttlSeconds = cacheConfig.ttl;
    this.provider = this.buildProvider(cacheConfig);
  }

  buildKey(userId: string, gymId: string): string {
    return `${userId}:${gymId}`;
  }

  async get(
    userId: string,
    gymId: string,
  ): Promise<PermissionCachePayload | null> {
    const cached = await this.provider.get(this.buildKey(userId, gymId));
    if (!cached) {
      return null;
    }

    return {
      roles: cached.roles,
      permissions: cached.permissions,
    };
  }

  async set(
    userId: string,
    gymId: string,
    payload: PermissionCachePayload,
  ): Promise<void> {
    const entry: CachedPermissionContext = {
      userId,
      gymId,
      roles: payload.roles,
      permissions: payload.permissions,
      timestamp: Date.now(),
      ttl: this.ttlSeconds,
    };

    await this.provider.set(
      this.buildKey(userId, gymId),
      entry,
      this.ttlSeconds,
    );
  }

  /**
   * Thread-safe loader with in-flight deduplication to prevent stampede.
   */
  async getOrLoad(
    userId: string,
    gymId: string,
    loader: () => Promise<PermissionCachePayload>,
  ): Promise<PermissionCachePayload> {
    const key = this.buildKey(userId, gymId);
    const cached = await this.provider.get(key);
    if (cached) {
      return {
        roles: cached.roles,
        permissions: cached.permissions,
      };
    }

    const runningLoad = this.inFlightLoads.get(key);
    if (runningLoad) {
      return runningLoad;
    }

    const loadPromise = (async () => {
      try {
        const loaded = await loader();
        await this.set(userId, gymId, loaded);
        return loaded;
      } finally {
        this.inFlightLoads.delete(key);
      }
    })();

    this.inFlightLoads.set(key, loadPromise);
    return loadPromise;
  }

  async invalidateUserGym(userId: string, gymId: string): Promise<void> {
    await this.provider.delete(this.buildKey(userId, gymId));
  }

  async invalidateGym(gymId: string): Promise<number> {
    return this.provider.deletePattern(`*:${gymId}`);
  }

  async invalidateMany(
    userGymPairs: Array<{ userId: string; gymId: string }>,
  ): Promise<void> {
    await Promise.all(
      userGymPairs.map((item) =>
        this.invalidateUserGym(item.userId, item.gymId),
      ),
    );
  }

  async clearAll(): Promise<void> {
    await this.provider.clear();
  }

  private buildProvider(config: CacheConfig): ICacheProvider {
    if (!config.enabled) {
      this.logger.warn(
        'RBAC cache disabled, using no-op in-memory cache with TTL=1s',
      );
      return new InMemoryCacheProvider({ ...config, ttl: 1, maxSize: 1 });
    }

    if (config.provider === 'redis') {
      this.logger.log('RBAC cache provider: redis (with memory fallback)');
      return new RedisCacheProvider(config);
    }

    this.logger.log('RBAC cache provider: memory');
    return new InMemoryCacheProvider(config);
  }

  private getCacheConfig(): CacheConfig {
    return {
      enabled:
        this.configService.get<string>('RBAC_CACHE_ENABLED', 'true') === 'true',
      provider:
        this.configService.get<string>('RBAC_CACHE_PROVIDER', 'memory') ===
        'redis'
          ? 'redis'
          : 'memory',
      ttl: Number(
        this.configService.get<string>('RBAC_CACHE_TTL_SECONDS', '300'),
      ),
      maxSize: Number(
        this.configService.get<string>('RBAC_CACHE_MAX_SIZE', '10000'),
      ),
      redis: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: Number(this.configService.get<string>('REDIS_PORT', '6379')),
        password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
        db: Number(this.configService.get<string>('REDIS_DB', '0')),
      },
    };
  }
}
