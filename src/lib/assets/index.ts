import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import Raupe from './raupe.png';

export const ImageAssets: Record<string, StaticImport> = {
  raupe: Raupe,
} as const;

export type ImageAssets = typeof ImageAssets;
