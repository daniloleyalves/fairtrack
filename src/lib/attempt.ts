export type AttemptResult<E = Error, T = unknown> = readonly [
  E | null,
  T | null,
];

export async function attempt<E = Error, T = unknown>(
  promise: Promise<T>,
): Promise<AttemptResult<E, T>> {
  try {
    const data = await promise;
    return [null, data] as const;
  } catch (err) {
    return [err as E, null] as const;
  }
}
