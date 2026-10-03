import { useEffect, useState } from "react";

export function useResendCountdown(initialSeconds = 0) {
  const [endsAt, setEndsAt] = useState(
    () => Date.now() + initialSeconds * 1000,
  );
  const [now, setNow] = useState(() => Date.now());
  const secondsLeft = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const running = secondsLeft > 0;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running, endsAt]);

  const start = (seconds: number) => {
    const startedAt = Date.now();
    setNow(startedAt);
    setEndsAt(startedAt + seconds * 1000);
  };

  const label = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
  return { secondsLeft, label, start };
}
