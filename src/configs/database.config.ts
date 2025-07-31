import { Logger } from '@nestjs/common';
import { config } from 'dotenv';
import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

config();

const logger = new Logger('Database Config');

logger.log('Migration config path:', __dirname + '/../database/migrations/*.ts');
logger.log('Entity config path:', __dirname + '/../database/entities/*.entity.{ts,js}');

export const databaseConfig = {
  type: process.env.DATABASE_TYPE,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
  entities: [__dirname + '/../database/entities/*.{ts,js}'],
  logging: process.env.DATABASE_LOG_ENABLE === 'true',
  extra: {
    connectionLimit: process.env.DATABASE_LIMIT_CONNECTION,
  },
  manualInitialization: false,
  migrationsRun: false,
  // logger: 'advanced-console',
} as DataSourceOptions;

export const dataSource = new DataSource(databaseConfig);
