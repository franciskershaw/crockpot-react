import { recipePreviewImage } from "@/features/recipes/utils/recipeImages";
import { PhotoDecodeError, shrinkPhoto } from "@/lib/shrinkPhoto";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RecipeFormImage, RecipeFormValues } from "../data/types";
import { defaultRecipeFormValues } from "../utils/recipeFormSchema";
import { PhotoField } from "./PhotoField";

vi.mock("@/lib/shrinkPhoto", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/shrinkPhoto")>()),
  shrinkPhoto: vi.fn(),
}));

const EXISTING: RecipeFormImage = {
  kind: "existing",
  url: "https://res.cloudinary.com/dqdjr1d4f/image/upload/v1/recipes/stew.jpg",
};

function Harness({ image = null }: { image?: RecipeFormImage | null }) {
  const form = useForm<RecipeFormValues>({
    defaultValues: { ...defaultRecipeFormValues, image },
  });
  const value = useWatch({ control: form.control, name: "image" });
  return (
    <FormProvider {...form}>
      <PhotoField />
      <output aria-label="kind">{value?.kind ?? "none"}</output>
      <output aria-label="file">
        {value?.kind === "new" ? value.file.name : ""}
      </output>
      <output aria-label="dirty">{String(form.formState.isDirty)}</output>
    </FormProvider>
  );
}

const photoInput = () => screen.getByLabelText<HTMLInputElement>("Photo");
const preview = () => screen.getByRole("presentation");
const phonePhoto = (name = "IMG_0001.jpg") =>
  new File(["raw"], name, { type: "image/jpeg" });

let nextUrl = 0;

beforeEach(() => {
  nextUrl = 0;
  URL.createObjectURL = vi.fn(() => `blob:preview-${++nextUrl}`);
  URL.revokeObjectURL = vi.fn();
  vi.mocked(shrinkPhoto).mockImplementation(
    async (file) =>
      new File(["shrunk"], `shrunk-${file.name}`, { type: "image/jpeg" }),
  );
});

afterEach(() => {
  vi.mocked(shrinkPhoto).mockReset();
});

describe("PhotoField", () => {
  it("offers to add a photo when there isn't one", () => {
    render(<Harness />);

    expect(screen.getByRole("button", { name: "Add photo" })).toBeVisible();
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });

  it("previews the shrunk photo once picked", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.upload(photoInput(), phonePhoto());

    expect(preview()).toHaveAttribute("src", "blob:preview-1");
    expect(screen.getByLabelText("kind")).toHaveTextContent("new");
    expect(screen.getByLabelText("file")).toHaveTextContent(
      "shrunk-IMG_0001.jpg",
    );
    expect(screen.getByLabelText("dirty")).toHaveTextContent("true");
  });

  it("shows an existing photo at the preview size", () => {
    render(<Harness image={EXISTING} />);

    const sized = recipePreviewImage(EXISTING.url);
    expect(preview()).toHaveAttribute("src", sized.src);
    expect(preview()).toHaveAttribute("srcset", sized.srcSet);
    expect(preview()).toHaveAttribute("sizes", sized.sizes);
    expect(
      screen.getByRole("button", { name: "Change photo" }),
    ).toBeInTheDocument();
  });

  it("removes the photo", async () => {
    const user = userEvent.setup();
    render(<Harness image={EXISTING} />);

    await user.click(screen.getByRole("button", { name: "Remove photo" }));

    expect(screen.getByLabelText("kind")).toHaveTextContent("none");
    expect(screen.getByRole("button", { name: "Add photo" })).toBeVisible();
  });

  it("releases a picked photo's preview when it's removed", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.upload(photoInput(), phonePhoto());

    await user.click(screen.getByRole("button", { name: "Remove photo" }));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-1");
  });

  it("releases the previous preview when the photo is changed", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.upload(photoInput(), phonePhoto("first.jpg"));

    await user.upload(photoInput(), phonePhoto("second.jpg"));

    expect(preview()).toHaveAttribute("src", "blob:preview-2");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-1");
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:preview-2");
  });

  it("releases the preview when the form goes away", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);
    await user.upload(photoInput(), phonePhoto());

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-1");
  });

  it("ignores another pick while a photo is still being read", async () => {
    let finishFirst: (file: File) => void = () => {};
    vi.mocked(shrinkPhoto).mockImplementationOnce(
      () => new Promise((resolve) => (finishFirst = resolve)),
    );
    const user = userEvent.setup();
    render(<Harness />);
    await user.upload(photoInput(), phonePhoto("first.jpg"));

    await user.upload(photoInput(), phonePhoto("second.jpg"));
    finishFirst(new File(["shrunk"], "shrunk-first.jpg"));

    expect(await screen.findByLabelText("file")).toHaveTextContent(
      "shrunk-first.jpg",
    );
    expect(shrinkPhoto).toHaveBeenCalledTimes(1);
  });

  it("keeps the current photo and explains when a photo can't be read", async () => {
    vi.mocked(shrinkPhoto).mockRejectedValue(new PhotoDecodeError());
    const user = userEvent.setup();
    render(<Harness image={EXISTING} />);

    await user.upload(photoInput(), phonePhoto("IMG_0002.HEIC"));

    expect(
      screen.getByText("Couldn't read that photo — use a JPG, PNG or WebP"),
    ).toBeVisible();
    expect(screen.getByLabelText("kind")).toHaveTextContent("existing");
  });

  it("clears the error once a readable photo is picked", async () => {
    vi.mocked(shrinkPhoto).mockRejectedValueOnce(new PhotoDecodeError());
    const user = userEvent.setup();
    render(<Harness />);
    await user.upload(photoInput(), phonePhoto("IMG_0002.HEIC"));

    await user.upload(photoInput(), phonePhoto());

    expect(
      screen.queryByText("Couldn't read that photo — use a JPG, PNG or WebP"),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("kind")).toHaveTextContent("new");
  });
});
