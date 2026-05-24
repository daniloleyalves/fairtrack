import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { ZodSchema } from 'zod';

/**
 * Legacy envelope retained for FormData-based actions that still hand-roll
 * their try/catch (updateUserAction, updateFairteilerAction, the tutorial
 * step FormData actions). createAction-based procedures throw on error and
 * return T directly.
 */
export type ActionState<T> =
  | { success: true; message?: string; data?: T }
  | { success: false; error: string; issues?: import('zod').core.$ZodIssue[] };

interface ActionOptions<TInput, TOutput> {
  inputSchema?: ZodSchema<TInput>;
  revalidate?: string | string[];
  handler: (args: { input: TInput; headers: Headers }) => Promise<TOutput>;
}

/**
 * Wraps a server-action handler. Validates input with the optional Zod schema,
 * runs the handler, triggers revalidatePath, and returns the handler's value
 * directly. Throws on validation failure or any uncaught handler error — the
 * call site (handleAsyncAction or a TanStack useMutation) is responsible for
 * surfacing those.
 */
export function createAction<TInput, TOutput>(
  options: ActionOptions<TInput, TOutput>,
) {
  return async (data: TInput): Promise<TOutput> => {
    const validatedInput = options.inputSchema
      ? options.inputSchema.parse(data)
      : data;

    const result = await options.handler({
      input: validatedInput,
      headers: await headers(),
    });

    if (options.revalidate) {
      const paths = Array.isArray(options.revalidate)
        ? options.revalidate
        : [options.revalidate];
      paths.forEach((path) => revalidatePath(path));
    }

    return result;
  };
}
