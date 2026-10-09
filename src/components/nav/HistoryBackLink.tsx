import type { ComponentProps, MouseEvent } from "react";
import { canGoBackInApp } from "@/lib/canGoBackInApp";
import { Link, useNavigate } from "react-router-dom";

// Real history-back when there's a prior in-app entry (restores scroll/filters for free), else a plain link to `to`.
export function HistoryBackLink({
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !canGoBackInApp()) return;
    event.preventDefault();
    navigate(-1);
  };

  return <Link {...props} onClick={handleClick} />;
}
