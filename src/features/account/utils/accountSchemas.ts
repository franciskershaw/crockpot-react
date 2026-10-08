import { NAME_RULE, nameField } from "@/features/auth/utils/authSchemas";
import { z } from "zod";

export const profileNameSchema = z.object({ name: nameField(NAME_RULE) });
