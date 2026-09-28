export function TabCount({ count }: { count: number | undefined }) {
  if (count === undefined) return null;
  return (
    <>
      {" "}
      <span className="font-normal text-muted-foreground">{count}</span>
    </>
  );
}
