import { lazy, type ReactElement } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "./AppShell";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/features/auth/hooks/useLogout", () => ({
  useLogout: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const mockUseAuth = vi.mocked(useAuth);

let resolveLazyChild: (mod: { default: () => ReactElement }) => void;
const LazyChild = lazy(
  () =>
    new Promise<{ default: () => ReactElement }>((resolve) => {
      resolveLazyChild = resolve;
    }),
);

function renderShell() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<LazyChild />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AppShell", () => {
  it("shows the route fallback while the outlet's lazy chunk loads, without hiding the nav", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderShell();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();

    resolveLazyChild({ default: () => <div>loaded content</div> });

    expect(await screen.findByText("loaded content")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
