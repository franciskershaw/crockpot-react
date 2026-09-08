import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/components/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getMenu } from "../api";
import { menuKeys } from "../queryKeys";
import type { Menu, MenuEntry } from "../types";
import { useMenuEntry } from "./useMenuEntry";

vi.mock("@/features/auth/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api")>()),
  getMenu: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockUseAuth = vi.mocked(useAuth);
const mockGetMenu = vi.mocked(getMenu);

afterEach(() => {
  vi.clearAllMocks();
});

function entry(overrides: Partial<MenuEntry> = {}): MenuEntry {
  return {
    recipeId: "r_1",
    serves: 4,
    recipe: {
      id: "r_1",
      name: "BBQ Pulled Pork",
      imageUrl: null,
      imageFilename: null,
      timeInMinutes: 30,
      serves: 4,
      approved: true,
      categories: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      isFavourite: false,
    },
    ...overrides,
  };
}

function setup(menu: Menu | undefined) {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: true,
    isLoading: false,
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (menu) {
    queryClient.setQueryData(menuKeys.menu(), menu);
  } else {
    mockGetMenu.mockReturnValue(new Promise(() => {}));
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper };
}

describe("useMenuEntry", () => {
  it("is pending with no cached menu data yet", () => {
    const { wrapper } = setup(undefined);

    const { result } = renderHook(() => useMenuEntry("r_1"), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.isInMenu).toBe(false);
  });

  it("resolves not-in-menu when the recipe isn't among the menu's entries", () => {
    const { wrapper } = setup({ entries: [entry({ recipeId: "r_2" })] });

    const { result } = renderHook(() => useMenuEntry("r_1"), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isInMenu).toBe(false);
    expect(result.current.serves).toBeUndefined();
  });

  it("resolves in-menu with the entry's serves when the recipe is present", () => {
    const { wrapper } = setup({
      entries: [entry({ recipeId: "r_1", serves: 6 })],
    });

    const { result } = renderHook(() => useMenuEntry("r_1"), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isInMenu).toBe(true);
    expect(result.current.serves).toBe(6);
  });
});
