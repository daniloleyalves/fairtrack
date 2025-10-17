import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../schema';
import type { SeedOptions } from './types';
import { NeonQueryFunction } from '@neondatabase/serverless';
import { Environment } from '../../drizzle';
import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

export const createTimestamp = (daysAgo = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export const logProgress = (message: string, verbose = false) => {
  if (verbose) {
    console.log(`🌱 ${message}`);
  }
};

export const logSuccess = (message: string) => {
  console.log(`✅ ${message}`);
};

export const logError = (message: string, error?: unknown) => {
  console.error(`❌ ${message}`);
  if (error) {
    console.error(error);
  }
};

export const getEnvironmentFromArgs = (): Environment => {
  const args = process.argv.slice(2);
  const envArg = args.find((arg) => arg.startsWith('--env='));

  if (envArg) {
    const env = envArg.split('=')[1] as Environment;
    if (['development', 'testing', 'demo'].includes(env)) {
      return env;
    }
  }

  // Default to dev environment
  return 'development';
};

export const getOptionsFromArgs = (): SeedOptions => {
  const args = process.argv.slice(2);

  return {
    environment: getEnvironmentFromArgs(),
    clean: args.includes('--clean'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };
};

export const cleanDatabase = async (
  verbose = false,
  db: NeonHttpDatabase<typeof schema> & {
    $client: NeonQueryFunction<false, false>;
  },
) => {
  logProgress('Cleaning database...', verbose);

  try {
    // Clean in reverse dependency order
    await db.delete(schema.contributionVersionHistory);
    await db.delete(schema.checkin);
    await db.delete(schema.food);
    await db.delete(schema.tag);
    await db.delete(schema.member);
    await db.delete(schema.fairteilerCompany);
    await db.delete(schema.fairteilerCategory);
    await db.delete(schema.fairteilerOrigin);
    await db.delete(schema.company);
    await db.delete(schema.category);
    await db.delete(schema.origin);
    await db.delete(schema.fairteiler);
    await db.delete(schema.invitation);
    await db.delete(schema.session);
    await db.delete(schema.account);
    await db.delete(schema.verification);
    await db.delete(schema.user);
    await db.delete(schema.feedback);

    logSuccess('Database cleaned successfully');
  } catch (error) {
    logError('Failed to clean database', error);
    throw error;
  }
};

export const resetSequences = (
  verbose = false,
  _db: NeonHttpDatabase<typeof schema> & {
    $client: NeonQueryFunction<false, false>;
  },
) => {
  logProgress('Resetting sequences...', verbose);

  try {
    // Reset any sequences if needed (PostgreSQL auto-increment sequences)
    // This project uses UUIDs, so no sequences to reset
    logProgress('No sequences to reset (using UUIDs)', verbose);
  } catch (error) {
    logError('Failed to reset sequences', error);
    throw error;
  }
};
