import { RedisOptions } from 'bullmq';
import { config } from 'dotenv';

config();
console.log('process', process.env.REDIS_PORT);
export const queueRedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  db: Number(process.env.REDIS_DB),
  enableTLSForSentinelMode: false,
} as RedisOptions;
