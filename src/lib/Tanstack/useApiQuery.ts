import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "../http/client";

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
        toast.error(
          error instanceof ApiError ? error.message : "request failed",
        );
        throw error;
      }
    },
  });
}
