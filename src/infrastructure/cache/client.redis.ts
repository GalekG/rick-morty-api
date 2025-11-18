import { createClient, RedisClientType, RedisDefaultModules } from 'redis';
import { Logger } from 'pino';

export interface CacheService {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<string | null>;
  del: (key: string) => Promise<number>;
  quit: () => Promise<void>;
  client: RedisClientType;
}

export class RedisCacheService {
  private static serviceInstance: RedisCacheService;
  private instance!: CacheService;

  private constructor() {}

  public static getSingletonInstance(): RedisCacheService {
    if (!RedisCacheService.serviceInstance) {
      RedisCacheService.serviceInstance = new RedisCacheService();
    }
    return RedisCacheService.serviceInstance;
  }

  /**
   * Initializes the cache service.
   * @param {Logger} logger - The logger instance.
   * @returns {Promise<void>}
   */
  async initialize(logger: Logger): Promise<void> {
    if (this.isInitialized()) {
      logger.warn('Cache service already initialized.');
      return;
    }

    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;

    const url = `redis://${host}:${port}`;

    const client = createClient({ url });

    client.on('error', (err) => logger.error({ err }, '❌ Redis Client Error'));
    client.on('connect', () => logger.info(`Connecting to Redis at ${url}...`));
    client.on('ready', () => logger.info(`✅ Redis connection established successfully at ${url}`));

    try {
      await client.connect();

      /**
       * The cache service instance.
       * @type {CacheService}
       */
      const service: CacheService = {
        client: client as RedisClientType<RedisDefaultModules>,
        /**
         * Retrieves a value from the cache.
         * @param {string} key - The key of the value to retrieve.
         * @returns {Promise<string | null>} - The value associated with the key, or null if not found.
         */
        get: (key: string): Promise<string | null> => client.get(key),
        /**
         * Sets a value in the cache.
         * @param {string} key - The key of the value to set.
         * @param {string} value - The value to set.
         * @param {number} [ttl=3600] - The time-to-live (in seconds) of the value.
         * @returns {Promise<string | null>} - The value associated with the key, or null if not found.
         */
        set: (key: string, value: string, ttl: number = 3600): Promise<string | null> => {
          if (ttl) return client.set(key, value, { EX: ttl });
          return client.set(key, value);
        },
        /**
         * Deletes a key from the cache.
         * @param {string} key - The key to delete.
         * @returns {Promise<number>} - The number of keys deleted.
         */
        del: (key: string): Promise<number> => client.del(key),
        /**
         * Disconnects the Redis client.
         * @returns {Promise<void>}
         */
        quit: async (): Promise<void> => {
          await client.quit();
          logger.info('Redis client disconnected.');
        },
      };

      this.instance = service;
    } catch (error) {
      logger.error({ error }, '❌ Unable to connect to Redis.');
      throw error;
    }
  }

  async getCacheService(logger: Logger): Promise<CacheService> {
    if (!this.isInitialized()) {
      await this.initialize(logger);
    }
    return this.instance;
  }

  isInitialized(): boolean {
    return !!this.instance;
  }
}
