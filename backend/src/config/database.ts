import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Mission } from '../models/Mission';
import { Transaction } from '../models/Transaction';
import { Receipt } from '../models/Receipt';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires this
  entities: [User, Mission, Transaction, Receipt],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  synchronize: !isProduction, // Don't use in production
  logging: !isProduction,
  dropSchema: false,
  // Supabase doesn't support Redis cache, so disable it
  // cache: {
  //   type: 'redis',
  //   options: {
  //     host: process.env.REDIS_HOST || 'localhost',
  //     port: parseInt(process.env.REDIS_PORT || '6379'),
  //     password: process.env.REDIS_PASSWORD,
  //   },
  //   duration: 60000, // 1 minute
  // },
  extra: {
    // Connection pool settings for Supabase
    max: 10, // Supabase has connection limits
    min: 1,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000,
  },
});

// Alternative configuration for development without Redis cache
export const AppDataSourceNoCache = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  entities: [User, Mission, Transaction, Receipt],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  synchronize: !isProduction,
  logging: !isProduction,
  dropSchema: false,
  extra: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000,
  },
});

export default AppDataSource;
