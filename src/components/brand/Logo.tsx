export function Logo({ className }: { className?: string }) {
  return (
    <span className={`font-display text-xl ${className ?? ""}`}>Crockpot</span>
  );
}
