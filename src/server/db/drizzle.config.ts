import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
import { getActiveEnvironment, getDatabaseURL } from './drizzle';

dotenv.config({ path: '.vercel/.env.development.local' });

export default defineConfig({
  out: './drizzle',
  schema: './src/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseURL(getActiveEnvironment()),
  },
});
