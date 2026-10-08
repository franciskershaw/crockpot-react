import { useLocation } from "react-router-dom";

export function CurrentPath() {
  return <output aria-label="path">{useLocation().pathname}</output>;
}
