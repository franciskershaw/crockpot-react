import {
  NAME_RULE,
  nameField,
  newPassword,
} from "@/features/auth/utils/authSchemas";
import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword,
});

export const profileNameSchema = z.object({ name: nameField(NAME_RULE) });
