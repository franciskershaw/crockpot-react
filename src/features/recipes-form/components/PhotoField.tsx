import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { fillImage } from "@/lib/cloudinary";
import { PHOTO_DECODE_MESSAGE, shrinkPhoto } from "@/lib/shrinkPhoto";
import { Plus } from "lucide-react";
import { useController, useFormContext, useFormState } from "react-hook-form";

import type { RecipeFormImage, RecipeFormValues } from "../data/types";
import { LABEL_CLASSES } from "../utils/styles";
import { FieldError } from "./FieldError";

const PILL_CLASSES =
  "cursor-pointer rounded-full bg-background/90 px-3.5 py-1.5 text-sm font-bold text-foreground backdrop-blur-xs disabled:cursor-not-allowed disabled:opacity-60";

export function PhotoField() {
  const { field } = useController<RecipeFormValues, "image">({
    name: "image",
  });
  const { errors } = useFormState<RecipeFormValues>({ name: "image" });
  const { setError, clearErrors } = useFormContext<RecipeFormValues>();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const image = field.value;

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const replace = (next: RecipeFormImage | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = next?.kind === "new" ? next.previewUrl : null;
    field.onChange(next);
  };

  const handlePick = async (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    // Cleared so picking the same file again still fires a change.
    event.target.value = "";
    if (!picked) return;
    setIsReading(true);
    try {
      const file = await shrinkPhoto(picked);
      clearErrors("image");
      replace({ kind: "new", file, previewUrl: URL.createObjectURL(file) });
    } catch {
      setError("image", { type: "decode", message: PHOTO_DECODE_MESSAGE });
    } finally {
      setIsReading(false);
    }
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div>
      <label htmlFor="recipe-photo" className={LABEL_CLASSES}>
        Photo
      </label>
      <input
        id="recipe-photo"
        ref={inputRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => void handlePick(event)}
      />

      {image ? (
        <div className="relative">
          <img
            {...(image.kind === "new"
              ? { src: image.previewUrl }
              : fillImage(image.url, 400, 180))}
            alt=""
            className="block h-41 w-full rounded-[7px] object-cover"
          />
          <div className="absolute right-2.5 bottom-2.5 flex gap-2">
            <button
              type="button"
              aria-label="Remove photo"
              disabled={isReading}
              onClick={() => {
                clearErrors("image");
                replace(null);
              }}
              className={PILL_CLASSES}
            >
              Remove
            </button>
            <button
              type="button"
              aria-label="Change photo"
              disabled={isReading}
              onClick={openPicker}
              className={PILL_CLASSES}
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isReading}
          onClick={openPicker}
          className="flex h-41 w-full cursor-pointer items-center justify-center gap-1.5 rounded-[7px] border-[1.5px] border-dashed border-faint-border text-sm font-semibold text-ink-body disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={14} strokeWidth={2.2} />
          Add photo
        </button>
      )}

      <FieldError message={errors.image?.message} />
    </div>
  );
}
