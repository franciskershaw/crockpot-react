export function PageTitle({ children }: { children: string }) {
  // One string child: React 19 warns when <title> gets several.
  return <title>{`${children} | Crockpot`}</title>;
}
