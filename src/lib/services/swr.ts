// Make FetcherError generic with optional info type
export interface FetcherError<TInfo = string> extends Error {
  info?: TInfo;
  status?: number;
}

export const fetcher = async <T = unknown>(
  ...args: [RequestInfo, RequestInit?]
) => {
  const res = await fetch(...args);

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Could not read error body');

    const error = new Error(
      `An error occurred while fetching the data. Status: ${res.status}`,
    ) as FetcherError<string>;

    error.info = errorText;
    error.status = res.status;

    throw error;
  }

  try {
    const body = (await res.json()) as ApiResponse<T>;
    if (!body.success) {
      throw new Error(body.error?.message ?? 'Failed to fetch data');
    }
    return body.data;
  } catch (e) {
    console.error('Failed to parse JSON response:', e);

    const error = new Error(
      'Failed to parse server response as JSON.',
    ) as FetcherError<string>;
    error.info =
      'The server responded successfully, but the response was not valid JSON.';
    error.status = res.status;
    throw error;
  }
};

import { IS_SERVER, SWRConfiguration, SWRResponse } from 'swr/_internal';
import useSWRImmutable from 'swr/immutable';
import { usePathname } from 'next/navigation';
import { Postpone } from 'next/dist/server/app-render/dynamic-rendering';
import { ApiResponse } from '@/server/api-helpers';

type SuspenseSWRHook = <TData = unknown, TError = FetcherError>(
  url?: string,
  config?: SWRConfiguration<TData, TError>,
) => SWRResponse<
  TData,
  TError,
  SWRConfiguration<TData, TError> & { suspense: true }
>;

const useSWRSuspense: SuspenseSWRHook = <TData, TError = FetcherError>(
  url?: string,
  config?: SWRConfiguration<TData, TError>,
) => {
  const fallbackData = config?.fallbackData;

  const route = usePathname();
  if (IS_SERVER && !fallbackData) {
    Postpone({
      reason: 'useSuspenseSWR',
      route,
    });
  }
  config = { ...config, suspense: true };
  const swrResponse = useSWRImmutable<TData, TError>(url, config);

  return swrResponse;
};

export default useSWRSuspense;
