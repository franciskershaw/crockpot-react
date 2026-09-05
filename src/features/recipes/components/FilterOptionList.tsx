import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export interface FilterOption {
  id: string;
  name: string;
}

const INITIAL_VISIBLE_COUNT = 6;
const SCROLL_BOTTOM_TOLERANCE_PX = 5;
const EXPAND_SCROLL_DELAY_MS = 100;

export function FilterOptionList({
  label,
  options,
  selectedIds,
  onToggle,
  children,
}: {
  label: string;
  options: FilterOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  children?: ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLUListElement>(null);

  const filtered = options.filter((option) =>
    option.name.toLowerCase().includes(search.toLowerCase()),
  );
  const hasMore = filtered.length > INITIAL_VISIBLE_COUNT;
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = filtered.length - INITIAL_VISIBLE_COUNT;

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const updateScrollState = () => {
      setIsScrolledToBottom(
        node.scrollTop + node.clientHeight >=
          node.scrollHeight - SCROLL_BOTTOM_TOLERANCE_PX,
      );
      setHasOverflow(node.scrollHeight > node.clientHeight);
    };

    updateScrollState();
    node.addEventListener("scroll", updateScrollState);
    return () => node.removeEventListener("scroll", updateScrollState);
  }, [showAll, filtered.length]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setIsScrolledToBottom(false);
  }, [showAll]);

  function handleToggleShowAll() {
    const expanding = !showAll;
    setShowAll(expanding);
    if (expanding) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, EXPAND_SCROLL_DELAY_MS);
    }
  }

  const showFade =
    (!showAll && hasMore) ||
    (showAll && hasMore && hasOverflow && !isScrolledToBottom);

  return (
    <div ref={sectionRef} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-secondary">{label}</h3>
        {hasMore && (
          <button
            type="button"
            onClick={handleToggleShowAll}
            className="cursor-pointer text-xs font-bold text-green"
          >
            {showAll ? "Hide" : `Show All (${hiddenCount} more)`}
          </button>
        )}
      </div>

      {children}

      <div className="relative">
        <Search
          strokeWidth={2}
          className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-icon-muted"
        />
        <Input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search ${label.toLowerCase()}...`}
          className="h-[38px] rounded-[7px] border-border bg-search-secondary pl-[34px] text-[13px] text-icon-muted placeholder:text-icon-muted"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">0 results</p>
      ) : (
        <div className="relative">
          <ul
            ref={scrollRef}
            className="flex max-h-96 flex-col overflow-y-auto md:max-h-[28rem]"
          >
            {visible.map((option) => {
              const checked = selectedIds.includes(option.id);
              return (
                <li key={option.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1 text-sm text-ink-secondary">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => onToggle(option.id)}
                      aria-label={option.name}
                    />
                    <span className={checked ? "font-semibold" : ""}>
                      {option.name}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          {showFade && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-card to-transparent" />
          )}
        </div>
      )}
    </div>
  );
}
