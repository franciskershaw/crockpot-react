import type { User } from "@/features/auth/data/types";

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "u_1",
    email: "jamie@example.com",
    name: "Jamie Alder",
    image: null,
    role: "FREE",
    ...overrides,
  };
}
