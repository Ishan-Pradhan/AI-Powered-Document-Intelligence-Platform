import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { env, isProduction } from './env';

dotenv.config();

const isSsl =
  isProduction ||
  Boolean(env.DATABASE_URL?.includes('sslmode=require')) ||
  env.DB_SSL === 'true';

const dialectOptions = isSsl
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    }
  : undefined;

export const sequelize = env.DATABASE_URL
  ? new Sequelize(env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions,
    })
  : new Sequelize(
      env.DB_NAME || '',
      env.DB_USER || '',
      env.DB_PASSWORD || '',
      {
        host: env.DB_HOST,
        port: Number(env.DB_PORT),
        dialect: 'postgres',
        logging: false,
        dialectOptions,
      },
    );

