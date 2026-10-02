import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";

import type { ApiError } from "../http/client";
import { toastApiError } from "./toastApiError";

interface ApiInfiniteQueryOptions<
  TQueryFnData,
  TPageParam,
  TQueryKey extends QueryKey = QueryKey,
> extends Omit<
  UseInfiniteQueryOptions<
    TQueryFnData,
    ApiError,
    InfiniteData<TQueryFnData, TPageParam>,
    TQueryKey,
    TPageParam
  >,
  "queryFn"
> {
  queryFn: (pageParam: TPageParam) => Promise<TQueryFnData>;
}

export function useApiInfiniteQuery<
  TQueryFnData,
  TPageParam,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: ApiInfiniteQueryOptions<TQueryFnData, TPageParam, TQueryKey>,
): UseInfiniteQueryResult<InfiniteData<TQueryFnData, TPageParam>, ApiError> {
  return useInfiniteQuery<
    TQueryFnData,
    ApiError,
    InfiniteData<TQueryFnData, TPageParam>,
    TQueryKey,
    TPageParam
  >({
    ...options,
    queryFn: async ({ pageParam }) => {
      try {
        return await options.queryFn(pageParam as TPageParam);
      } catch (error) {
        toastApiError(error);
        throw error;
      }
    },
  });
}
