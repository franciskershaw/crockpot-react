export function FilterPanelHeader({
  activeFilterCount,
  onClearAll,
}: {
  activeFilterCount: number;
  onClearAll: () => void;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="font-display text-[21px] font-normal">Recipe Filters</h2>
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="cursor-pointer text-[13px] leading-none font-bold text-rust-text"
        >
          Clear filters ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
