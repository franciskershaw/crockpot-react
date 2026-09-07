import { lazy, type ReactElement } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import { getMenu } from "@/features/menu/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "./AppShell";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/features/auth/hooks/useLogout", () => ({
  useLogout: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock("@/features/menu/api", () => ({
  getMenu: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockGetMenu = vi.mocked(getMenu);

afterEach(() => {
  vi.clearAllMocks();
});

function makeLazyChild() {
  let resolve: (mod: { default: () => ReactElement }) => void;
  const LazyChild = lazy(
    () =>
      new Promise<{ default: () => ReactElement }>((r) => {
        resolve = r;
      }),
  );
  return {
    LazyChild,
    resolve: (mod: { default: () => ReactElement }) => resolve(mod),
  };
}

function renderShell(LazyChild: ReactElement["type"]) {
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
  it("shows the route fallback while the outlet's lazy chunk loads, without hiding the nav, when logged out", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    const { LazyChild, resolve } = makeLazyChild();

    renderShell(LazyChild);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();

    resolve({ default: () => <div>loaded content</div> });

    expect(await screen.findByText("loaded content")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("keeps the account menu up while the outlet's lazy chunk loads, when logged in", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "u_1",
        email: "jamie@example.com",
        name: "Jamie",
        image: null,
        role: "FREE",
      },
      isAuthenticated: true,
      isLoading: false,
    });
    const { LazyChild, resolve } = makeLazyChild();

    renderShell(LazyChild);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Account menu")).toBeInTheDocument();

    resolve({ default: () => <div>loaded content</div> });

    expect(await screen.findByText("loaded content")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Account menu")).toBeInTheDocument();
  });

  it("prefetches the menu when logged in", async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "u_1",
        email: "jamie@example.com",
        name: "Jamie",
        image: null,
        role: "FREE",
      },
      isAuthenticated: true,
      isLoading: false,
    });
    mockGetMenu.mockResolvedValue({ entries: [] });
    const { LazyChild } = makeLazyChild();

    renderShell(LazyChild);

    await waitFor(() => expect(mockGetMenu).toHaveBeenCalled());
  });

  it("does not fetch the menu when logged out", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    const { LazyChild, resolve } = makeLazyChild();

    renderShell(LazyChild);
    resolve({ default: () => <div>loaded content</div> });

    await screen.findByText("loaded content");
    expect(mockGetMenu).not.toHaveBeenCalled();
  });
});
