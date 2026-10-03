import type { ReactElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export function setupQueryClient(seed: [readonly unknown[], unknown][] = []) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  for (const [key, data] of seed) queryClient.setQueryData(key, data);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Unlike renderWithProviders, hands back the client and keeps cache nothing observes, for tests that read what a mutation wrote.
export function renderWithQueryClient(
  ui: ReactElement,
  {
    route = "/",
    seed = [],
  }: { route?: string; seed?: [readonly unknown[], unknown][] } = {},
) {
  const { queryClient, wrapper: Wrapper } = setupQueryClient(seed);
  render(
    <Wrapper>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Wrapper>,
  );
  return { queryClient };
}
