import type { ReactNode } from "react";
import { NavLink, type NavLinkProps } from "react-router-dom";

export function AddRecipeLink({
  className = "text-muted-foreground hover:text-foreground",
  children = "Add a recipe",
}: {
  className?: NavLinkProps["className"];
  children?: ReactNode;
}) {
  return (
    <NavLink to="/recipes/new" className={className}>
      {children}
    </NavLink>
  );
}
