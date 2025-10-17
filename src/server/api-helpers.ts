import { blobPathNames } from '@/lib/config/blob-storage-config';
import { del, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * A custom error class for authentication/authorization issues.
 * This can be thrown from DAL or DTO layer.
 */
export class AuthError extends Error {
  constructor(message = 'Authentication required.') {
    super(message);
    this.name = 'AuthError';
  }
}

// --- Standardized Response Shapes ---

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    // Optional: provide a code for client-side logic/translation
    code?: string;
    // Optional: provide detailed validation issues
    issues?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * A higher-order function to create standardized API route handlers.
 * It wraps the core logic in a try/catch block, handles errors gracefully,
 * and ensures a consistent JSON response format.
 *
 * @param handler The core logic of the API route.
 * @returns An API route handler function (e.g., for GET, POST).
 */
export function createApiRoute<
  T,
  P extends Record<string, string> = Record<string, never>,
>(handler: (req: NextRequest, context: { params: P }) => Promise<T>) {
  return async (
    req: NextRequest,
    context: { params: Promise<P> },
  ): Promise<NextResponse<ApiResponse<T>>> => {
    const params = await context.params;
    try {
      const data = await handler(req, { params });
      return NextResponse.json({ success: true, data });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Invalid request data.',
              code: 'VALIDATION_ERROR',
              issues: error.flatten(),
            },
          },
          { status: 400 },
        );
      }
      if (error instanceof AuthError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: error.message,
              code: 'UNAUTHORIZED',
            },
          },
          { status: 401 },
        );
      }
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Server error: ${message}`,
            code: 'INTERNAL_SERVER_ERROR',
          },
        },
        { status: 500 },
      );
    }
  };
}

// Helper function for image upload

export async function handleImageUpload(
  image: File | null | string,
  oldImageUrl: string | null,
  blobPathNameKey: keyof typeof blobPathNames,
): Promise<string | null> {
  let newImageUrl = oldImageUrl;

  if (image instanceof File) {
    const blob = await put(
      `${blobPathNames[blobPathNameKey]}/${image.name}`,
      image,
      { access: 'public', allowOverwrite: true },
    );
    newImageUrl = blob.url;
    if (oldImageUrl) {
      del(oldImageUrl).catch((err) =>
        console.error('Failed to delete old image:', err),
      );
    }
  } else if (image === null && oldImageUrl) {
    del(oldImageUrl).catch((err) =>
      console.error('Failed to delete old image:', err),
    );
    newImageUrl = null;
  }

  return newImageUrl;
}
