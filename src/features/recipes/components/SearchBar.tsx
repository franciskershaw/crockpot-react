import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const DEBOUNCE_MS = 300;

export function SearchBar({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;
    const timeout = setTimeout(() => onChange(draft), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [draft]);

  return (
    <div className={`relative ${className}`}>
      <Search
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-icon-muted"
      />
      <Input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search recipes by name..."
        className="h-[46px] rounded-[8px] border-[1.5px] border-border bg-card px-3.5 pl-10 text-[15px] placeholder:text-placeholder md:text-[15px]"
      />
    </div>
  );
}
