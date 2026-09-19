export function getInitials(name: string | null, email: string): string {
  if (name) {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
    if (initials) return initials;
  }
  return email[0]?.toUpperCase() ?? "?";
}
