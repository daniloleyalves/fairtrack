'use server';

import { getEnvVariable } from '@/lib/utils';

export interface ClientEnvVariables {
  TINYMCE_KEY: string;
  MAPBOX_TOKEN: string | undefined;
}

export async function getClientEnvVariables(): Promise<ClientEnvVariables> {
  // Using Promise.resolve to satisfy async requirement
  return await Promise.resolve({
    TINYMCE_KEY: getEnvVariable('TINYMCE_KEY'),
    MAPBOX_TOKEN: getEnvVariable('NEXT_PUBLIC_MAPBOX_TOKEN'),
  });
}
