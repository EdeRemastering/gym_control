/**
 * Configuration factory for environment variables
 * Provides type-safe access to configuration across the application
 */
export const configuration = () => ({
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    debug: process.env.DEBUG === 'true',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  rbacCache: {
    enabled: process.env.RBAC_CACHE_ENABLED || 'true',
    provider: process.env.RBAC_CACHE_PROVIDER || 'memory',
    ttlSeconds: process.env.RBAC_CACHE_TTL_SECONDS || '300',
    maxSize: process.env.RBAC_CACHE_MAX_SIZE || '10000',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || '6379',
      password: process.env.REDIS_PASSWORD || '',
      db: process.env.REDIS_DB || '0',
    },
  },
});

export type Configuration = ReturnType<typeof configuration>;
