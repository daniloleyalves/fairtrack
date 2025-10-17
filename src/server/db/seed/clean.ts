import * as schema from '../schema';
import {
  getOptionsFromArgs,
  cleanDatabase,
  logError,
} from './utils/seed-helpers';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { getDatabaseURL } from '../drizzle';
dotenv.config({ path: '.vercel/.env.development.local' });

const main = async () => {
  try {
    const options = getOptionsFromArgs();

    const client = neon(getDatabaseURL(options.environment));
    const db = drizzle(client, { schema });

    await cleanDatabase(options.verbose, db);
  } catch (error) {
    logError('Database cleaning failed', error);
    process.exit(1);
  }
};

// Run the seeding script
if (require.main === module) {
  main();
}
