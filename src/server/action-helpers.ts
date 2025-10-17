import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import z, { ZodError, ZodSchema } from 'zod';
import { getErrorMessage } from '@/lib/auth/auth-helpers';
import { BetterAuthError } from 'better-auth';
import {
  DatabaseError,
  NotFoundError,
  PermissionError,
  ValidationError,
} from './error-handling';

export type ActionState<T> =
  | {
      success: true;
      message?: string;
      data?: T;
    }
  | {
      success: false;
      error: string;
      issues?: z.core.$ZodIssue[];
    };

interface ActionOptions<TInput, TOutput> {
  inputSchema?: ZodSchema<TInput>;
  revalidate?: string | string[];
  handler: (args: { input: TInput; headers: Headers }) => Promise<{
    message?: string;
    data?: TOutput;
    revalidatePaths?: string[];
  }>;
}

export function createAction<TInput, TOutput>(
  options: ActionOptions<TInput, TOutput>,
) {
  return async (data: TInput): Promise<ActionState<TOutput>> => {
    try {
      const validatedInput = options.inputSchema
        ? options.inputSchema.parse(data)
        : data;

      const result = await options.handler({
        input: validatedInput,
        headers: await headers(),
      });

      // Handle revalidation paths from options or result
      const revalidatePaths =
        result.revalidatePaths ??
        (options.revalidate
          ? Array.isArray(options.revalidate)
            ? options.revalidate
            : [options.revalidate]
          : []);

      revalidatePaths.forEach((path) => revalidatePath(path));

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn('Action Validation Error:', z.treeifyError(error));
        return {
          success: false,
          error: 'Ungültige Eingabe. Bitte überprüfen Sie Ihre Angaben.',
          issues: error.issues,
        };
      }

      if (error instanceof BetterAuthError) {
        const errorCode =
          typeof error.cause === 'string' ? error.cause : undefined;
        const userFriendlyMessage = getErrorMessage(errorCode, 'de');
        console.error(
          'Action BetterAuthError:',
          error.message,
          'Cause (Code):',
          error.cause,
          error,
        );
        return { success: false, error: userFriendlyMessage };
      }

      if (
        error instanceof NotFoundError ||
        error instanceof PermissionError ||
        error instanceof ValidationError ||
        error instanceof DatabaseError
      ) {
        throw error; // propagate
      }

      if (error instanceof Error) {
        console.error('Action Unexpected Error:', error.message, error);
        return { success: false, error: error.message };
      }

      console.error('Action Unknown Error:', error);
      return {
        success: false,
        error: 'Ein unbekannter Serverfehler ist aufgetreten.',
      };
    }
  };
}
