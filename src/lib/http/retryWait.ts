// "in 2 minutes" or "later", for a Retry-After that may be unreadable.
export function retryWait(seconds: number | undefined): string {
  if (seconds === undefined) return "later";
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `in ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}
