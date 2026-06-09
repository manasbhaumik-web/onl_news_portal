import Redis from 'ioredis';
import pino from 'pino';
import { env as config } from './env';

const logger = pino({ name: 'redis', level: 'info' });

let redisClient: Redis;

function createRedisClient(): Redis {
  const client = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 10000,
    retryStrategy(times) {
      if (times > 5) {
        logger.error('Redis: max retries reached, giving up');
        return null;
      }
      const delay = Math.min(times * 200, 2000);
      logger.warn({ attempt: times, delayMs: delay }, 'Redis: retrying connection');
      return delay;
    },
  });

  client.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  client.on('error', (err) => {
    logger.error({ err }, '❌ Redis error — continuing without cache');
  });

  client.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return client;
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  try {
    const client = getRedisClient();
    await client.connect();
  } catch (err) {
    logger.error({ err }, 'Redis connect failed — running without Redis cache');
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis disconnected cleanly');
  }
}

// Safe Redis operations (won't throw)
export async function redisGet(key: string): Promise<string | null> {
  try {
    return await getRedisClient().get(key);
  } catch {
    return null;
  }
}

export async function redisSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  try {
    if (ttlSeconds) {
      await getRedisClient().setex(key, ttlSeconds, value);
    } else {
      await getRedisClient().set(key, value);
    }
  } catch {
    // silently ignore
  }
}

export async function redisDel(key: string): Promise<void> {
  try {
    await getRedisClient().del(key);
  } catch {
    // silently ignore
  }
}

export async function redisIncr(key: string, ttlSeconds?: number): Promise<number> {
  try {
    const client = getRedisClient();
    const val = await client.incr(key);
    if (ttlSeconds && val === 1) {
      await client.expire(key, ttlSeconds);
    }
    return val;
  } catch {
    return 0;
  }
}
