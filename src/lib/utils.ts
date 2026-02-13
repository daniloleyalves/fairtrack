import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { routes } from './config/routes';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(number: number, maximumFractionDigits?: number) {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits }).format(
    number,
  );
}

export function getCurrentPageTitle(pathname: string): string {
  let currentPath = pathname;

  while (currentPath !== '') {
    // Try to find a direct match for the currentPath
    for (const categoryKey in routes) {
      if (Object.prototype.hasOwnProperty.call(routes, categoryKey)) {
        const routeCategory = routes[categoryKey];

        for (const route of routeCategory) {
          if (route.url === currentPath) {
            return route.title;
          }
        }
      }
    }

    // If no direct match found, remove the last snippet
    const lastSlashIndex = currentPath.lastIndexOf('/');
    if (lastSlashIndex > 0) {
      currentPath = currentPath.substring(0, lastSlashIndex);
    } else if (lastSlashIndex === 0 && currentPath.length > 1) {
      // Handle cases like "/snippet" becoming "/"
      currentPath = '/';
    } else {
      // If lastSlashIndex is 0 and length is 1, it means currentPath is "/"
      // If no match found for "/", break the loop
      break;
    }
  }

  return 'Not Found';
}

export function extractImageKeyword(url: string) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname; // e.g., "/raupe_thumbnail-RJgcsW4FFmMG4KbehYbDbZ1NewKmpR.jpg"

    // Get the part after the last slash (the filename with extension)
    const filenameWithExtension = pathname.substring(
      pathname.lastIndexOf('/') + 1,
    );
    // e.g., "raupe_thumbnail-RJgcsW4FFmMG4KbehYbDbZ1NewKmpR.jpg"

    // Remove the file extension (e.g., ".jpg")
    const filenameWithoutExtension = filenameWithExtension
      .split('.')
      .slice(0, -1)
      .join('.');
    // e.g., "raupe_thumbnail-RJgcsW4FFmMG4KbehYbDbZ1NewKmpR"

    // Split by the hyphen and take the first part
    const parts = filenameWithoutExtension.split('-');

    // The first part of the split result is "raupe_thumbnail"
    if (parts.length > 0) {
      return parts[0];
    }
  } catch (error) {
    console.error('Invalid URL provided:', error);
  }
  return null; // Return null if unable to extract or URL is invalid
}

export function sleep(ms = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getEnvVariable = (name: string) => {
  const value = process.env[name]!;
  if (!value) throw new Error(`Environment variable ${name} not found`);
  return value;
};
