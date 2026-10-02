import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

import type { ApiError } from "../http/client";
import { toastApiError } from "./toastApiError";

interface ApiQueryOptions<TData> extends Omit<
  UseQueryOptions<TData, ApiError>,
  "queryFn"
> {
  queryFn: () => Promise<TData>;
}

export function useApiQuery<TData>(
  options: ApiQueryOptions<TData>,
): UseQueryResult<TData, ApiError> {
  return useQuery({
    ...options,
    queryFn: async () => {
      try {
        return await options.queryFn();
      } catch (error) {
        toastApiError(error);
        throw error;
      }
    },
  });
}
