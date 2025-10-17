import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import dotenv from 'dotenv';
import { getEnvVariable } from '@/lib/utils';
dotenv.config({ path: '.vercel/.env.development.local' });

export type Environment =
  | 'production'
  | 'preview'
  | 'development'
  | 'testing'
  | 'demo';

export const getDatabaseURL = (environment: Environment): string => {
  switch (environment) {
    case 'production': {
      console.log('📊 Using production database');
      return getEnvVariable('DATABASE_URL');
    }
    case 'preview': {
      console.log('📊 Using preview database');
      return getEnvVariable('DATABASE_URL');
    }
    case 'development': {
      console.log('📊 Using development database');
      return getEnvVariable('DATABASE_DEV_URL');
    }
    case 'testing': {
      console.log('📊 Using testing database');
      return getEnvVariable('DATABASE_TEST_URL');
    }
    case 'demo': {
      console.log('📊 Using demo database');
      return getEnvVariable('DATABASE_DEMO_URL');
    }
    default:
      throw new Error(
        `Unknown environment: ${environment as string}. Supported environments: production, preview, development, testing, demo`,
      );
  }
};

export const getActiveEnvironment = () => {
  const env = process.env.NEXT_PUBLIC_ENV as Environment;
  if (!env) {
    throw new Error(`Active Environment could not be found`);
  }
  console.log('Active Environment: ' + env);
  return env;
};

const client = neon(getDatabaseURL(getActiveEnvironment()));
export const db = drizzle(client, { schema });
