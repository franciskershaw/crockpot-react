import { useAuth } from "@/features/auth/components/AuthContext";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useItems } from "@/features/catalog/hooks/useItems";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { createRecipe } from "@/features/recipes/data/api";
import { useRecipeCategories } from "@/features/recipes/hooks/useRecipeCategories";
import { ApiError } from "@/lib/http/client";
import { shrinkPhoto } from "@/lib/shrinkPhoto";
import { buildRecipeDetail } from "@/test/recipeFixtures";
import { recipePart } from "@/test/recipeRequest";
import { renderWithProviders } from "@/test/renderWithProviders";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateRecipePage } from "./CreateRecipePage";

vi.mock("@/features/auth/components/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItems", () => ({ useItems: vi.fn() }));
vi.mock("@/features/catalog/hooks/useItemCategories", () => ({
  useItemCategories: vi.fn(),
}));
vi.mock("@/features/catalog/hooks/useUnits", () => ({ useUnits: vi.fn() }));
vi.mock("@/features/recipes/hooks/useRecipeCategories", () => ({
  useRecipeCategories: vi.fn(),
}));
vi.mock("@/features/recipes/data/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/recipes/data/api")>()),
  createRecipe: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/shrinkPhoto", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/shrinkPhoto")>()),
  shrinkPhoto: vi.fn(),
}));

const shrunk = new File(["jpeg"], "stew.jpg", { type: "image/jpeg" });

const GAPS = [
  "Give the recipe a name.",
  "Pick at least one category.",
  "Add at least one ingredient.",
  "Add at least one step.",
];

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isAuthenticated: true,
    isLoading: false,
  } as unknown as ReturnType<typeof useAuth>);
  for (const hook of [useItems, useItemCategories, useUnits]) {
    vi.mocked(hook).mockReturnValue({ data: [] } as never);
  }
  vi.mocked(useRecipeCategories).mockReturnValue({
    data: [{ id: "c_dinner", name: "Dinner" }],
  } as unknown as ReturnType<typeof useRecipeCategories>);
});

function setup() {
  const user = userEvent.setup();
  renderWithProviders(<CreateRecipePage />);
  const publish = () =>
    user.click(screen.getByRole("button", { name: "Publish recipe" }));
  return { user, publish };
}

describe("CreateRecipePage", () => {
  it("shows no errors before the first publish", async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText("Recipe name*"), "ab");
    await user.clear(screen.getByLabelText("Recipe name*"));

    for (const gap of GAPS) {
      expect(screen.queryByText(gap)).not.toBeInTheDocument();
    }
  });

  it("keeps the footer's publish status live as the form fills in", async () => {
    const { user } = setup();
    expect(
      screen.getByText(
        "Name, categories, ingredients and one step needed to publish",
      ),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("Recipe name*"), "Stew");

    expect(
      screen.getByText(
        "Categories, ingredients and one step needed to publish",
      ),
    ).toBeInTheDocument();
  });

  it("publishing an empty form shows every gap and focuses the name", async () => {
    const { publish } = setup();

    await publish();

    for (const gap of GAPS) {
      expect(await screen.findByText(gap)).toBeInTheDocument();
    }
    expect(screen.getByLabelText("Recipe name*")).toHaveFocus();
  });

  it("clears a field's error as soon as it's fixed after a publish", async () => {
    const { user, publish } = setup();
    await publish();
    await screen.findByText("Give the recipe a name.");

    await user.type(screen.getByLabelText("Recipe name*"), "Stew");
    await user.click(screen.getByRole("button", { name: /Add category/ }));
    await user.click(screen.getByRole("checkbox", { name: "Dinner" }));
    await user.type(
      screen.getByLabelText("Instructions, one step per line"),
      "Brown the beef.",
    );

    expect(
      screen.queryByText("Give the recipe a name."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Pick at least one category."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Add at least one step."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Add at least one ingredient."),
    ).toBeInTheDocument();
  });
});

describe("CreateRecipePage saving", () => {
  beforeEach(() => {
    vi.mocked(useItems).mockReturnValue({
      data: [
        {
          id: "i_beef",
          name: "Beef shin",
          categoryId: "ic_meat",
          allowedUnitIds: [],
        },
      ],
    } as unknown as ReturnType<typeof useItems>);
    vi.mocked(useItemCategories).mockReturnValue({
      data: [{ id: "ic_meat", name: "Meat", isIngredient: true }],
    } as unknown as ReturnType<typeof useItemCategories>);
  });

  async function fillAndPublish({ withPhoto = false } = {}) {
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route path="/recipes/new" element={<CreateRecipePage />} />
        <Route path="/recipes/:id" element={<p>recipe page</p>} />
      </Routes>,
      { route: "/recipes/new" },
    );
    await user.type(screen.getByLabelText("Recipe name*"), "Beef stew");
    await user.click(screen.getByRole("button", { name: /Add category/ }));
    await user.click(screen.getByRole("checkbox", { name: "Dinner" }));
    await user.click(screen.getByRole("button", { name: "Done" }));
    await user.type(
      screen.getByRole("combobox", { name: "Search ingredients" }),
      "beef",
    );
    await user.click(screen.getByRole("option", { name: /Beef shin/ }));
    await user.click(screen.getByRole("button", { name: "Add ingredient" }));
    await user.type(
      screen.getByLabelText("Instructions, one step per line"),
      "Brown the beef.",
    );
    if (withPhoto) {
      await user.upload(
        screen.getByLabelText("Photo"),
        new File(["raw"], "IMG_0001.jpg", { type: "image/jpeg" }),
      );
    }
    await user.click(screen.getByRole("button", { name: "Publish recipe" }));
  }

  const lastSave = () => {
    const call = vi.mocked(createRecipe).mock.lastCall;
    if (!call) throw new Error("createRecipe wasn't called");
    return call[0];
  };

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
    vi.mocked(shrinkPhoto).mockResolvedValue(shrunk);
  });

  it("lands on the new recipe without the leave prompt, telling a non-admin it awaits approval", async () => {
    vi.mocked(createRecipe).mockResolvedValue(
      buildRecipeDetail({ id: "r_new", name: "Beef stew" }),
    );

    await fillAndPublish();

    expect(await screen.findByText("recipe page")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(recipePart(lastSave())).toEqual(
      expect.objectContaining({
        name: "Beef stew",
        categoryIds: ["c_dinner"],
        ingredients: [{ itemId: "i_beef", unitId: null, quantity: 1 }],
        instructions: ["Brown the beef."],
      }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Submitted — only you can see it until it's approved.",
    );
  });

  it("sends the picked photo with the recipe", async () => {
    vi.mocked(createRecipe).mockResolvedValue(
      buildRecipeDetail({ id: "r_new", name: "Beef stew" }),
    );

    await fillAndPublish({ withPhoto: true });

    expect(await screen.findByText("recipe page")).toBeInTheDocument();
    expect(lastSave().get("photo")).toBe(shrunk);
    expect(recipePart(lastSave())).not.toHaveProperty("removeImage");
  });

  it.each([
    [400, "image_too_large", "That photo is too large — try a smaller one"],
    [400, "invalid_image", "Couldn't read that photo — use a JPG, PNG or WebP"],
    [502, "image_upload_failed", "Couldn't upload the photo — try again"],
  ])("explains a %i %s and keeps the photo", async (status, code, message) => {
    vi.mocked(createRecipe).mockRejectedValue(new ApiError(status, code));

    await fillAndPublish({ withPhoto: true });

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Change photo" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "The server couldn't accept this recipe — check it over and try again.",
      ),
    ).not.toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("says when to try again after too many photo uploads", async () => {
    vi.mocked(createRecipe).mockRejectedValue(
      new ApiError(429, "rate_limit_exceeded", 600),
    );

    await fillAndPublish({ withPhoto: true });

    expect(
      await screen.findByText(
        "Too many photo uploads — try again in 10 minutes",
      ),
    ).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it.each([
    [
      409,
      "recipe_limit_reached",
      "You've hit your recipe limit, so this can't be published yet.",
    ],
    [
      400,
      "invalid_item_id",
      "The server couldn't accept this recipe — check it over and try again.",
    ],
  ])(
    "shows a %i in the footer and stays on the form",
    async (status, code, message) => {
      vi.mocked(createRecipe).mockRejectedValue(new ApiError(status, code));

      await fillAndPublish();

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(screen.getByLabelText("Recipe name*")).toHaveValue("Beef stew");
      expect(toast.error).not.toHaveBeenCalled();
    },
  );
});
