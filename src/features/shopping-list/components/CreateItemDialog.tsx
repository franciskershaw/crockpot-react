import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryIcon } from "@/features/catalog/components/CategoryIcon";
import type { Item } from "@/features/catalog/data/types";
import { useCreateItem } from "@/features/catalog/hooks/useCreateItem";
import { useItemCategories } from "@/features/catalog/hooks/useItemCategories";
import { useUnits } from "@/features/catalog/hooks/useUnits";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { UnitMultiSelect } from "./UnitMultiSelect";

const createItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter a name.")
    .max(100, "Keep the name under 100 characters."),
  categoryId: z.string().min(1, "Choose a category."),
  allowedUnitIds: z.array(z.string()),
});

type CreateItemValues = z.infer<typeof createItemSchema>;

const FIELD_CLASSES =
  "h-10 w-full rounded-[7px] border-[1.5px] border-border bg-card px-3 text-sm outline-none transition-[border-color,box-shadow] focus:border-green focus:ring-[3px] focus:ring-green/14 aria-invalid:border-rust-icon";

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function CreateItemForm({
  initialName,
  onCreated,
  onCancel,
}: {
  initialName: string;
  onCreated: (item: Item) => void;
  onCancel: () => void;
}) {
  const { data: categories } = useItemCategories();
  const { data: units } = useUnits();
  const createItem = useCreateItem();
  const nameInput = useRef<HTMLInputElement | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateItemValues>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: capitalise(initialName),
      categoryId: "",
      allowedUnitIds: [],
    },
  });
  const categoryId = useWatch({ control, name: "categoryId" });
  const { ref: registerNameRef, ...nameField } = register("name");

  useEffect(() => {
    const input = nameInput.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  }, []);

  const onSubmit = (values: CreateItemValues) =>
    createItem.mutate(values, {
      onSuccess: onCreated,
      onError: (error) => {
        if (error.status === 409) {
          setError("name", {
            message: `An item called “${values.name}” already exists.`,
          });
        }
      },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4.5">
        <div>
          <label
            htmlFor="create-item-name"
            className="mb-1.5 block text-sm font-semibold"
          >
            Name
          </label>
          <input
            id="create-item-name"
            {...nameField}
            ref={(input) => {
              registerNameRef(input);
              nameInput.current = input;
            }}
            aria-invalid={errors.name ? true : undefined}
            className={FIELD_CLASSES}
          />
          {errors.name && (
            <p className="mt-1.5 text-[13px] text-rust-text">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="create-item-category"
            className="mb-1.5 block text-sm font-semibold"
          >
            Category
          </label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="create-item-category"
                  className="h-10! w-full cursor-pointer rounded-[7px] border-[1.5px] border-border bg-card px-3 text-sm shadow-none focus-visible:border-green focus-visible:ring-green/14 data-placeholder:text-icon-muted"
                >
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="rounded-lg border-border bg-card shadow-popover"
                >
                  {categories?.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="h-8.5 cursor-pointer text-sm focus:bg-chip"
                    >
                      <CategoryIcon
                        categoryName={category.name}
                        size={15}
                        strokeWidth={2}
                        className="text-ingredient-chip-text"
                      />
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline gap-1.5">
            <label
              htmlFor="create-item-units"
              className="text-sm font-semibold"
            >
              Units
            </label>
            <span className="text-xs text-icon-muted">optional</span>
          </div>
          <Controller
            control={control}
            name="allowedUnitIds"
            render={({ field }) => (
              <UnitMultiSelect
                id="create-item-units"
                units={units ?? []}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-10 rounded-lg px-5 font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!categoryId || createItem.isPending}
          className="h-10 rounded-lg bg-green px-5 font-semibold text-background hover:bg-green/90 disabled:bg-faint-border disabled:opacity-100"
        >
          {createItem.isPending && <Loader2 className="size-4 animate-spin" />}
          {createItem.isPending ? "Creating…" : "Create item"}
        </Button>
      </div>
    </form>
  );
}

export function CreateItemDialog({
  open,
  initialName,
  onCreated,
  onCancel,
}: {
  open: boolean;
  initialName: string;
  onCreated: (item: Item) => void;
  onCancel: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <DialogContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        overlayClassName="bg-foreground/42"
        className="gap-0 rounded-xl border-0 bg-card p-5.5 shadow-dialog sm:max-w-[400px]"
      >
        <DialogHeader className="mb-5 gap-1.5 text-left">
          <DialogTitle className="font-display text-2xl font-medium">
            New item
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Adds it to the catalogue for everyone, then puts it on your list.
          </DialogDescription>
        </DialogHeader>
        <CreateItemForm
          initialName={initialName}
          onCreated={onCreated}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
