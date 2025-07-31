import type { RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { config } from 'dotenv';

config();

export const redisNamespace = 'default';

export const redisConfig: RedisModuleOptions = {
  config: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    db: Number(process.env.REDIS_DB),
    namespace: redisNamespace,
  },
};
